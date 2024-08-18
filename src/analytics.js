// @flow
/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import mergeWith from 'lodash/mergeWith';
import set from 'lodash/set';
import posthog from 'posthog-js';
import { v4 as uuid } from 'uuid';

import config from './config';
import type {
  AppConfig,
  GoogleAnalyticsConfig,
  RecordingConfig,
} from './entities';

import safeLocalStorage from './utils/safeLocalStorage';
import safeSessionStorage from './utils/safeSessionStorage';

// Regexes to match location.pathname on Shopify checkout pages (including
// order status) or account pages. For other platforms we'll need different
// patterns, or may need to make these configurable.
const checkoutPagePathRegex = /^\/(\d+\/orders\/)|(\d+\/checkouts\/)/;
const accountPagePathRegex = /^\/account\b/;
// "Contact" page in default store setup
const contactPagePathRegex = /^\/pages\/contact\b/;

const privacySensitivePagePatterns = [
  checkoutPagePathRegex,
  accountPagePathRegex,
  contactPagePathRegex,
];

/**
 * Get a timezone-aware ISO-8601 formatted representation of the given datetime.
 *
 * For example,
 *
 * ```js
 * const date = new Date(2022, 10, 19, 16, 27, 22, 515);
 * console.log(getIsoString(date));  // "2022-10-19T16:27:22.515-04:00"
 * ```
 */
function getIsoString(date: Date): string {
  // The `Date.toISOString()` method always assumes the timezone is UTC
  // so the string always ends with "Z". We want the string to be
  // timezone-aware, so we strip the "Z" and add our own timezone
  // offset.

  // First, we strip the terminal "Z".
  const isoString = date.toISOString();
  const tzNaiveIsoString = isoString.substring(0, isoString.length - 1);

  // Next, we assemble the timezone offset str (for example, "04:00");
  const tzo = -date.getTimezoneOffset();
  const pad = (num: number) => (num < 10 ? '0' : '') + num;
  const tzOffsetStr = `${pad(Math.floor(Math.abs(tzo) / 60))}:${pad(Math.abs(tzo) % 60)}`;

  // Finally, we join them with a "+" or "-".
  const dif = tzo >= 0 ? '+' : '-';
  return `${tzNaiveIsoString}${dif}${tzOffsetStr}`;
}

/**
 * @returns {boolean} True iff the page *most likely* contains
 * privacy-sensitive visitor data, like home address or last 4 digits of credit
 * card. For now this just matches the Shopify order status page and account
 * pages, plus the "contact" page in default out-of-the-box stores (which can
 * be moved, so this is unreliable). Checkout pages (which are generally the
 * most sensitive) are not an issue because Shopify doesn't let us run our
 * client-side app on those.
 *
 * In some stores practically every page can potentially include PII. For
 * example valuepetupplies.com has a "Sign up here" form on every page, which
 * would show the visitor's email address if they enter it. So we're not trying
 * to cover every case.
 */
function onPrivacySensitivePage() {
  return privacySensitivePagePatterns.some(
    (regex) => regex.test(window.location.pathname),
  );
}

/**
 * General analytics controller abstract base class. Construct either a
 * RealAnalytics or NullAnalytics (defined below).
 */
export class Analytics {
  organizationId: string;
  environment: string;
  visitorId: string;
  newVisitor: boolean;
  sessionId: string;
  newSession: boolean;

  /**
   * Does any asynchronous initialization needed. If the analytics determine
   * that the app should remain hidden (due to an experiment), this may never
   * resolve.
   */
  // eslint-disable-next-line no-empty-function
  async init(): Promise<void> {}

  appEnabled(): boolean {
    return true;
  }

  forceEnabled(): boolean {
    return false;
  }

  /**
   * Sends the visitor's identity to analytics providers
   */
  identify() {}

  /**
   * Sends a page view event.
   */
  page() {}

  /**
   * Sends an analytics event.
   * @param {string} event - Event
   * @param {Object} props - Optional event props
   */
  track(
    event: string,
    props: any = {},
  ) {}
}

/**
 * Waits until a set of PostHog feature flags all have values other than
 * undefined, and resolves to an Object containing those values. If any flag is
 * still undefined after several seconds, it resolves to undefined.
 *
 * This involves repeatedly reloading the feature flag values. It starts with a
 * 100ms delay and doubles the delay each time. The reason for this is that
 * PostHog experiment feature flags can depend on user attributes set in the
 * $identify event, but there's no way of knowing when that has taken effect.
 * The value is undefined if the user is not a member of the experiment
 * audience, but there's no way of knowing whether that's because the user
 * should not be in the audience, or if it's because their attributes are not
 * known to PostHog yet.
 * @param {Set<string>} flagNames Names of feature flags to wait for
 * @returns {Promise<Object>} Resolves to the value of the flag, or undefined if
 * it times out
 */
async function waitForFeatureFlags(flagNames: Set<string>): Promise<{[string]: string}> {
  console.log('waiting for ff', flagNames);
  return new Promise((resolve) => {
    let timeout = false;
    let delay = 100;
    let timer;
    const timerHandler = () => {
      posthog.reloadFeatureFlags();
      delay *= 2;
      if (delay > 3200) {
        timeout = true;
      } else {
        timer = setTimeout(timerHandler, delay);
      }
    };
    timer = setTimeout(timerHandler, delay);
    posthog.onFeatureFlags(() => {
      // This callback is called multiple times; once by onFeatureFlags here
      // and once by each reloadFeatureFlags in the timer handler above.
      const results: { [string]: any } = {};
      for (const flagName of flagNames) {
        results[flagName] = posthog.getFeatureFlag(flagName);
      }
      if (Object.values(results).every(Boolean)) {
        clearTimeout(timer);
        resolve(results);
      } else if (timeout) {
        console.log('pg ff timed out');
        clearTimeout(timer);
        resolve(results);
      }
    });
  });
}

/**
 * Gets a value that can be overridden in the URL query string, and persisted
 * in localStorage. Once the value has been specified as a query parameter, it
 * persists as long as another value isn't specified. Special case: if a value
 * of "0" or "" (empty) is specified, that removes it from localStorage, and
 * the returned value will be null until it gets set again.
 * @param {string} name Name of query parameter, e.g. "pg_force"
 * @returns {string?} Value of the given parameter.
 */
function getQueryOverride(name: string): ?string {
  const storageKey = `GAMALON-${name.replace(/_/g, '-')}`;
  const params = new URLSearchParams(window.location.search);
  const value = params.get(name);
  if (value !== null) {
    if (value === '0' || value === '') {
      console.log('Disabling', name);
      safeLocalStorage.removeItem(storageKey);
      return null;
    }
    console.log(`Enabling ${name} = ${value}`);
    safeLocalStorage.setItem(storageKey, value);
    return value;
  }
  const result = safeLocalStorage.getItem(storageKey);
  if (result !== null) {
    console.log(`${name} is still ${result}`);
  }
  return result;
}

function shouldStartRecording(event: string, settings: ?RecordingConfig) {
  return event === settings?.enableOn;
}

function storeEventToLocalStorage(event: string, properties: any) {
  const events = JSON.parse(safeLocalStorage.getItem('GAMALON-events') || '[]');
  events.push({ event, properties });
  safeLocalStorage.setItem('GAMALON-events', JSON.stringify(events));
}

/**
 * Normal analytics handler for use in production
 */
export class RealAnalytics extends Analytics {
  #appConfig: AppConfig;
  #appEnabled: boolean;
  #analyticsEnabled: boolean;
  #forceShow: boolean;
  #forceEnabled: boolean;
  #postHogRecording: boolean; // true = has started recording

  /**
   * Constructor for analytics object. After calling this, call (and await)
   * init() before calling any other methods.
   * @param {AppConfig} appConfig Config passed in to init call
   */
  constructor(appConfig: AppConfig) {
    super();
    this.organizationId = appConfig.organizationId;
    this.#appConfig = appConfig;
    // Handling of 'pg_force' search parameter, which lets a visitor
    // force it to show.
    this.#forceShow = Boolean(getQueryOverride('pg_force'));
    this.#forceEnabled = this.#forceShow && appConfig.enabled === false;
    this.#appEnabled = appConfig.enabled !== false || this.#forceShow;
    this.#analyticsEnabled = !this.#forceShow && !appConfig.analytics?.disableAll;
    this.#postHogRecording = false;

    /* eslint-disable no-undef */
    // $FlowIgnore
    this.environment = __ENVIRONMENT__;
    /* eslint-enable no-undef */

    this.visitorId = safeLocalStorage.getItem('GAMALON-visitorId') || '';
    this.newVisitor = false;
    if (!this.visitorId) {
      this.visitorId = uuid();
      console.log('Setting visitor ID to', this.visitorId);
      safeLocalStorage.setItem('GAMALON-visitorId', this.visitorId);
      this.newVisitor = true;
      safeSessionStorage.removeItem('GAMALON-sessionId');
    }

    this.sessionId = safeSessionStorage.getItem('GAMALON-sessionId') || '';
    this.newSession = false;
    if (!this.sessionId) {
      this.sessionId = uuid();
      safeSessionStorage.setItem('GAMALON-sessionId', this.sessionId);
      this.newSession = true;
    }
  }

  // Returns the Google Analytics configuration(s) as an array. The
  // googleAnalytics property of appConfig.analytics can be absent, or it can
  // be present as an Array<GoogleAnalyticsConfig> or just a single
  // GoogleAnalyticsConfig. This function always returns an array (possibly
  // empty).
  #googleAnalyticsConfigs(): Array<GoogleAnalyticsConfig> {
    const { analytics } = this.#appConfig;
    if (!analytics) {
      return [];
    }
    const { googleAnalytics } = analytics;
    if (Array.isArray(googleAnalytics)) {
      return googleAnalytics;
    }
    if (googleAnalytics) {
      return [googleAnalytics];
    }
    return [];
  }

  // Tracks a conversion event IF it's a valid, authenticated order completion
  // page AND this purchase doesn't appear to have been tracked already (on
  // this device/browser).
  #trackConversion() {
    const checkout = window.Shopify?.checkout;
    if (!checkout) {
      return;
    }
    console.log('pgconv');
    const orderId = checkout?.order_id;
    if (!orderId) {
      console.log('unauthed status page');
      return;
    }
    const subtotal = checkout.subtotal_price || '0';

    // Gets user-visible order number, the way we did it in the old script
    const getOrderNumber = () => {
      const el = document.getElementsByClassName('os-order-number')[0];
      if (!el) {
        return String(orderId); // fallback
      }
      return el.textContent.trim();
    };

    // Gets user-visible subtotal amount as a string, the way we did it in the
    // old script
    const getOrderAmount = () => {
      const el = document.querySelector('[data-checkout-subtotal-price-target]');
      if (!el) {
        return String(subtotal); // fallback
      }
      return el.textContent.trim();
    };

    const orderNumber = getOrderNumber();
    // This localStorage key indicates that this order has already been tracked
    // (in this browser environment), so we shouldn't track it again. This
    // probably isn't really necessary since we can now detect the "thank_you"
    // page, but doesn't hurt.
    const capturedKey = `GAMALON-order-${orderNumber}-captured`;
    const captured = safeLocalStorage.getItem(capturedKey);
    if (captured) {
      console.log('already capd');
      return;
    }
    safeLocalStorage.setItem(capturedKey, '1');

    // Try to make the event backwards-compatible with the event that was
    // tracked by the old shopify_conversion_snippet.js.
    const orderItems = (checkout.line_items || []).map((lineItem) => ({
      variant: lineItem.variant_title || '', // Added for backwards compatibility
      ...lineItem,
    }));
    const chatHappened = !!safeLocalStorage.getItem('GAMALON-genius-chat-happened');
    const chatHappenedSession = !!safeSessionStorage.getItem('GAMALON-genius-chat-happened');
    let trafficSelector: ?number | ?string = safeLocalStorage.getItem('GAMALON-traffic-selector');
    if (trafficSelector == null) {
      trafficSelector = 1;
    } else {
      trafficSelector = Number(trafficSelector);
    }
    const headerInfo = safeLocalStorage.getItem('GAMALON-pg-header-info');
    const properties = {
      conversion_type: 'shopify_order_status',
      integration: 'facetchat',
      visitor_has_conversation: chatHappened,
      visitor_has_conversation_in_session: chatHappenedSession,
      header_info: headerInfo ? JSON.parse(headerInfo) : {},
      session_id: this.sessionId,
      currency: checkout.currency || '???', // wasn't in original
      subtotal: Number(subtotal), // wasn't in original
      total_price: Number(checkout.total_price || '0'), // wasn't in original
      order_amount_numeric: 100 * Number(subtotal), // this was always in cents
      order_amount_text: getOrderAmount(),
      order_id: orderNumber,
      items: orderItems,
      gamalon_traffic_selector: trafficSelector,
    };

    // If the order status page gets loaded into more than one browser
    // environment, there's no way to avoid sending a duplicate conversion
    // event. We add an alternate person ID based on the order ID so that those
    // duplicate conversion events will be attributed to the same person on
    // PostHog. UPDATE: This probably isn't really necessary since we can now
    // detect the "thank_you" page, but it doesn't hurt.
    const ordNumAbbrev = orderNumber.replace(/[^0-9A-Za-z_-]/g, '');
    const visitorAlias = `${this.organizationId}-orderer-${ordNumAbbrev}`;
    posthog.alias(visitorAlias, this.visitorId);

    this.track('conversion', properties);

    // If the Shopify store uses Google Analytics, presumably it has set up the
    // standard integration, so purchase events will automatically be sent. But
    // if this app is configured with googleAnalytics.sendTo, that may mean we
    // want events sent to a different GA property, so we have to do the
    // purchase event here. This can be enabled in the configuration.
    //
    // The event properties are not guaranteed to be as complete as they could
    // be. This is more for testing purposes than production use. Also the item
    // properties might only be correct for GA4, not UA, not sure.
    for (const googleAnalytics of this.#googleAnalyticsConfigs()) {
      if (googleAnalytics?.enabled && googleAnalytics?.createPurchaseEvent && window.gtag) {
        console.log('pgconv ga');
        const gaProperties: any = {
          currency: checkout.currency || '',
          transaction_id: String(checkout.order_id || orderNumber),
          value: Number(subtotal),
          shipping: Number(checkout.shipping_rate?.price || '0'),
          tax: Number(checkout.total_tax || '0'),
          items: (checkout.line_items || []).map((lineItem) => ({
            item_id: String(lineItem.product_id || ''),
            item_name: lineItem.name || '',
            item_variant: String(lineItem.variant_id || ''),
            price: Number(lineItem.price || '0'),
            quantity: Number(lineItem.quantity || '1'),
          })),
        };
        if (googleAnalytics.sendTo) {
          gaProperties.send_to = googleAnalytics.sendTo;
        }
        if (googleAnalytics.debugMode) {
          gaProperties.debug_mode = googleAnalytics.debugMode;
        }
        window.gtag('event', 'purchase', gaProperties);
      }
    }
  }

  #startPostHogRecording() {
    if (this.#postHogRecording) {
      return;
    }
    this.#postHogRecording = true;
    posthog.startSessionRecording();
  }

  // Events that should happen when the analytics initialization is done. These
  // happen whether or not the ProductGenius app is actually shown (like if
  // it's hidden due to an experiment).
  #loadedEvents() {
    this.identify();
    this.page();
    this.#trackConversion();
    if (this.newVisitor) {
      this.track('new visitor');
    }
  }

  // Our own selective traffic filtering. Randomly (but persistently)
  // determines whether to show the app, with the probability specified by the
  // app configuration.
  #trafficSelector(): boolean {
    const { trafficFraction } = this.#appConfig;
    if ((typeof trafficFraction) === 'number') {
      const trafficSelectorStr = safeLocalStorage.getItem('GAMALON-traffic-selector');
      let trafficSelector = 0;
      if (!trafficSelectorStr) {
        trafficSelector = Math.random();
        safeLocalStorage.setItem('GAMALON-traffic-selector', trafficSelector);
      } else {
        trafficSelector = Number(trafficSelectorStr);
      }
      if (trafficSelector >= trafficFraction) {
        return false;
      }
    }
    return true;
  }

  // Loads and configures the gtag function if necessary.
  #loadGtag() {
    // eslint-disable-next-line prefer-rest-params
    function gtag() { window.dataLayer.push(arguments); }
    for (const googleAnalytics of this.#googleAnalyticsConfigs()) {
      if (googleAnalytics?.enabled && googleAnalytics?.sendTo) {
        if (!window.gtag) {
          console.log('pg gtag');
          // Basically doing the equivalent of the <script> tags that GA tells you
          // to add to your page.
          const scriptEl = document.createElement('script');
          scriptEl.src = 'https://www.googletagmanager.com/gtag/js';
          scriptEl.async = true;
          document.body?.appendChild(scriptEl);
          window.dataLayer = window.dataLayer || [];
          window.gtag = gtag;
          // $FlowIgnore
          window.gtag('js', new Date());
        }
        window.gtag(
          'config',
          googleAnalytics.sendTo,
          { debug_mode: googleAnalytics.debugMode },
        );
      }
    }
  }

  // Asynchronous setup for analytics. Call (and await) before calling any of
  // the other methods below. This automatically sends identify, page, "new
  // session" and "new visitor" events if appropriate.
  //
  // This can also modify the AppConfig object that was passed to the
  // constructor (if an active experiment indicates a variation in the config).
  async init(): Promise<void> {
    if (!this.#analyticsEnabled) {
      console.log('PG analytics disabled');
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      if (onPrivacySensitivePage()) {
        // Disable recording and remove any trigger events that would start
        // recording.
        set(this.#appConfig, ['analytics', 'postHog', 'recording'], { enabled: false });
      }
      // Initialize PostHog, then send it identity data and start up the app
      this.#postHogRecording = Boolean(this.#appConfig.analytics?.postHog?.recording?.enabled);
      posthog.init(config.posthog.apiKey, {
        api_host: 'https://pg.gamalon.com',
        ui_host: 'https://app.posthog.com',
        autocapture: this.#appConfig.analytics?.postHog?.autocapture || false,
        capture_pageview: false,
        disable_session_recording: !this.#postHogRecording,
        enable_recording_console_log: true, // Beta feature
        persistence: 'localStorage',
        loaded: async () => {
          this.#loadGtag();
          if (this.#forceShow) {
            this.#appEnabled = true;
            this.track('pg_force');
            this.#loadedEvents();
            resolve();
            return;
          }

          this.#loadedEvents();

          if (!this.#trafficSelector()) {
            console.log('pg disabled by traffic selector');
            this.#appEnabled = false;
          } else {
            const { experiment, experiments = [] } = this.#appConfig;
            const flagSet = new Set(experiments.map((ex) => ex.name));
            if (experiment) {
              flagSet.add(experiment);
            }
            if (flagSet.size) {
              const flags = await waitForFeatureFlags(flagSet);
              console.log('ff', flags);
              for (const expConfig of experiments) {
                const flagValue = flags[expConfig.name];
                const expConfigValues = expConfig.values[flagValue];
                if (expConfigValues) {
                  mergeWith(
                    this.#appConfig,
                    expConfigValues,
                    (__, src) => {
                      // Don't merge arrays; just replace with the array as is.
                      if (Array.isArray(src)) {
                        return src;
                      }
                      return undefined;
                    },
                  );
                }
              }
              if (experiment) {
                // Running a PostHog experiment where some users ('test' group) see
                // the facetchatbar and some ('control' group or not included in
                // the experiment) do not. So we only show it if they're in the
                // 'test' group.
                const group = flags[experiment];
                if (group !== 'test') {
                  console.log('Not in "test" group:', group || 'undefined');
                  this.#appEnabled = false;
                }
              }
            }
          }

          if (this.#appConfig.enabled === false) {
            this.#appEnabled = false;
            console.log('pg disabled');
          } else {
            console.log('pg enabled');
          }

          resolve();
        },
      });
    });
  }

  // Returns true if the app should be visible. Reasons why it might not be
  // visible include: the app configuration (passed to GAMALON.init()) has
  // enabled=false; a PostHog experiment determines that this visitor should
  // not see it; or our own traffic filtering determines that this visitor
  // should not see it.
  appEnabled(): boolean {
    return this.#appEnabled;
  }

  // Returns true if the app is visible, but only because it was forced to be
  // visible with the pg_force override. If pg_force is in effect but it would
  // have been visible anyway, this returns false.
  forceEnabled(): boolean {
    return this.#forceEnabled;
  }

  #globalProps(): {
    organization_id: string,
    environment: string,
    visitor_id: string,
    session_id: string,
    sessionId: string,
    pg_force: boolean,
    user_agent: string,
    shopify_customer_id: string,
    pgbranch: string,
    last_config: string,
    } {
    const queryParams = new URLSearchParams(window.location.search);
    return {
      organization_id: this.organizationId,
      environment: this.environment,
      visitor_id: this.visitorId,
      session_id: this.sessionId,
      sessionId: this.sessionId,
      pg_force: this.#forceShow,
      user_agent: navigator.userAgent,
      shopify_customer_id: window.__st?.cid || '',
      pgbranch: queryParams.get('pgbranch') || '',
      last_config: queryParams.get('last_config') || '',
    };
  }

  identify() {
    if (!this.#analyticsEnabled) {
      return;
    }
    const globalProps = this.#globalProps();
    posthog.identify(
      this.visitorId,
      globalProps,
    );
  }

  page() {
    if (!this.#analyticsEnabled) {
      return;
    }
    const perfStats = window.performance?.getEntriesByType?.('navigation')?.[0];
    const timing: { [string]: any } = {};
    for (const key in perfStats) {
      if (typeof perfStats[key] === 'number') {
        timing[key] = perfStats[key];
      }
    }
    posthog.capture('$pageview', { timing });
    for (const googleAnalytics of this.#googleAnalyticsConfigs()) {
      // GA automatically sends page views. But the automatic page view is only
      // sent to host page's GA configuration, so if that is overridden with a
      // different ID, we might need to send the page view there too. This can be
      // enabled in the configuration.
      if (googleAnalytics?.enabled && googleAnalytics?.createPageView && window.gtag) {
        const gaProperties: { send_to?: string, debug_mode?: boolean } = {};
        if (googleAnalytics.sendTo) {
          gaProperties.send_to = googleAnalytics.sendTo;
        }
        if (googleAnalytics.debugMode) {
          gaProperties.debug_mode = googleAnalytics.debugMode;
        }
        window.gtag('event', 'page_view', gaProperties);
      }
    }
  }

  /**
   * @param {string} event - Event
   * @param {string} props - Optional event props
   */
  track(
    event: string,
    props: any = {},
  ) {
    const properties: any = {
      ...this.#globalProps(),
      ...props,
    };
    if (this.#appConfig.analytics?.pagination?.includeEvents) {
      storeEventToLocalStorage(event, properties);
    }
    if (!this.#analyticsEnabled) {
      return;
    }
    if (shouldStartRecording(event, this.#appConfig.analytics?.postHog?.recording)) {
      this.#startPostHogRecording();
    }

    if (
      this.#appConfig?.analytics?.pgEvents?.enabled
      && this.#appConfig?.analytics?.pgEvents?.url
    ) {
      fetch(this.#appConfig.analytics.pgEvents.url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          organization_id: properties.organization_id,
          visitor_id: properties.visitor_id,
          session_id: properties.session_id,
          time: getIsoString(new Date()),
          type: event,
          data: props,
        }),
      });
    }

    posthog.capture(event, properties);
    for (const googleAnalytics of this.#googleAnalyticsConfigs()) {
      if (
        googleAnalytics.enabled
        && window.gtag
        && (!googleAnalytics.eventTypes || googleAnalytics.eventTypes.includes(event))
      ) {
        // Pass through to Google Analytics. We prefix with gamalonpg_ so it
        // won't be confused with their other events. We convert spaces to
        // underscores as required by GA.
        const gaEventName = `gamalonpg_${event}`.replace(/\s/g, '_');
        const customParameters = googleAnalytics.customParameters?.[event] || {};
        const gaProperties = {
          ...properties,
          ...customParameters,
        };
        if (googleAnalytics.sendTo) {
          gaProperties.send_to = googleAnalytics.sendTo;
        }
        if (googleAnalytics.debugMode) {
          gaProperties.debug_mode = googleAnalytics.debugMode;
        }
        window.gtag('event', gaEventName, gaProperties);
      }
    }
  }
}

/**
 * Analytics object that doesn't connect to any actual analytics providers or
 * keep track of events. For use in the read-only transcript view and/or
 * testing. Do not substitute this for RealAnalytics in a real visitor session
 * just to disable analytics; some functionality of RealAnalytics (like
 * creating a unique visitor ID) is still needed.
 */
export class NullAnalytics extends Analytics {
  constructor(
    organizationId: string,
    visitorId: string,
    sessionId: string,
  ) {
    super();
    this.organizationId = organizationId;
    this.environment = 'null analytics';
    this.visitorId = visitorId;
    this.sessionId = sessionId;
    this.newVisitor = false;
    this.newSession = false;
  }
}
