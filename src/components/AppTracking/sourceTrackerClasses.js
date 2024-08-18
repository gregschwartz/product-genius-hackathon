// @flow
// eslint-disable-next-line max-classes-per-file
import throttle from 'lodash/throttle';
import type {
  TrackingRuleView,
  TrackingRuleClick,
  TrackingRuleScroll,
  TrackingRuleTouch,
  TrackingRulePageView,
  TrackingRuleGlobalClick,
  TrackingRuleGlobalView,
} from '../../entities';
import { type Analytics } from '../../analytics';
import safeSessionStorage from '../../utils/safeSessionStorage';

function getTrackingSource(): string {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_tracking_source');
  const trackingSource = safeSessionStorage.getItem('PG-utm_tracking_source');
  if (source) {
    if (!trackingSource) {
      safeSessionStorage.setItem('PG-utm_tracking_source', source);
    }
    return source || '';
  }
  return trackingSource || '';
}

type SourcePageViewProps = {
  rule: TrackingRulePageView,
};
export class SourcePageViewTr {
  analytics: Analytics;
  rule: ?TrackingRulePageView;
  viewStartTimestamps: Map<
    string,
    { viewStartTimestamp: number, alias: string }
  >;

  constructor(analytics: Analytics) {
    this.analytics = analytics;
    this.viewStartTimestamps = new Map();
    this.rule = null;
    Object.freeze(this);
  }

  setupPageViewEvent(props: SourcePageViewProps) {
    this.viewStartTimestamps.set(props.rule.alias, {
      alias: props.rule.alias,
      viewStartTimestamp: Date.now(),
    });
  }

  disconnectPageViewEvents() {
    for (const entry of this.viewStartTimestamps.values()) {
      const { alias, viewStartTimestamp } = entry;
      const viewEndTimestamp = Date.now();
      const payload = {
        alias,
        viewStartTimestamp,
        viewEndTimestamp,
        duration: viewEndTimestamp - viewStartTimestamp,
        pageUrl: window.location.href,
        trackingSource: getTrackingSource(),
      };
      this.analytics.track('SRC: viewed page', payload);
    }
    this.viewStartTimestamps.clear();
  }
}

type IntersectionEventProps = {
  rule: TrackingRuleView,
  targetElement: HTMLElement,
};
export class SourceViewTr {
  analytics: Analytics;
  sourceObservers: Map<string, any>;
  sourceDurations: Map<string, any>;

  constructor(analytics: Analytics) {
    this.analytics = analytics;
    this.sourceObservers = new Map();
    this.sourceDurations = new Map();
    Object.freeze(this);
  }

  intersectionCallback: (entries: Array<IntersectionObserverEntry>) => void = (
    entries: Array<IntersectionObserverEntry>,
  ) => {
    entries.forEach((entry) => {
      const alias = entry.target.getAttribute('tr-id');
      if (alias) {
        const intersection = this.sourceDurations.get(alias);
        if (intersection) {
          const { viewStartTimestamp } = intersection;
          const viewEndTimestamp = Date.now();
          const payload = {
            alias,
            viewStartTimestamp,
            viewEndTimestamp,
            duration: viewEndTimestamp - viewStartTimestamp,
            trackingSource: getTrackingSource(),
          };
          this.analytics.track('SRC: viewed element', payload);
        }
        if (entry.isIntersecting) {
          this.sourceDurations.set(alias, {
            viewStartTimestamp: Date.now(),
          });
        } else {
          this.sourceDurations.delete(alias);
        }
      }
    });
  };

  interactionAddRef(props: IntersectionEventProps) {
    const { targetElement, rule } = props;
    const { container, alias } = rule;
    const observer = this.sourceObservers.get(container);
    if (observer && targetElement) {
      targetElement.setAttribute('tr-id', alias);
      observer.observe(targetElement);
    }
  }

  setupIntersectionEvent(props: IntersectionEventProps) {
    const { container } = props.rule;
    if (container) {
      if (!this.sourceObservers.has(container)) {
        this.sourceObservers.set(
          container,
          new IntersectionObserver(this.intersectionCallback, {
            root: document.querySelector(container),
          }),
        );
      }
      this.interactionAddRef(props);
    }
  }

  disconnectIntersectionEvents() {
    for (const observer of this.sourceObservers.values()) {
      observer.disconnect();
    }
    this.sourceObservers.clear();
    this.sourceDurations.clear();
  }
}

type ClickEventProps = {
  rule: TrackingRuleClick,
  targetElement: HTMLElement,
};
export class SourceClickTr {
  analytics: Analytics;
  clickTargets: Map<string, any>;

  constructor(analytics: Analytics) {
    this.analytics = analytics;
    this.clickTargets = new Map();
    Object.freeze(this);
  }

  handleClickEvent: (rule: TrackingRuleClick, event: MouseEvent) => void = (
    rule: TrackingRuleClick,
    event: MouseEvent,
  ) => {
    const payload = {
      alias: rule.alias,
      timestamp: Date.now(),
      pageX: event.pageX,
      pageY: event.pageY,
      trackingSource: getTrackingSource(),
    };
    this.analytics.track('SRC: clicked on element', payload);
  };

  setupClickEvent(props: ClickEventProps) {
    const { targetElement, rule } = props;
    if (targetElement) {
      const handler = this.handleClickEvent.bind(null, rule);
      this.clickTargets.set(rule.alias, { targetElement, handler });
      targetElement.addEventListener('click', handler);
    }
  }

  disconnectClickEvents() {
    for (const entry of this.clickTargets.values()) {
      const { targetElement, handler } = entry;
      targetElement.removeEventListener('click', handler);
    }
    this.clickTargets.clear();
  }
}

type ScrollEventProps = {
  rule: TrackingRuleScroll,
  targetElement: HTMLElement,
};
export class SourceScrollTr {
  analytics: Analytics;
  scrollTargets: Map<string, any>;

  constructor(analytics: Analytics) {
    this.analytics = analytics;
    this.scrollTargets = new Map();
    Object.freeze(this);
  }

  handleScrollEvent: (rule: TrackingRuleScroll, event: MouseEvent) => void = (
    rule: TrackingRuleScroll,
    event: MouseEvent,
  ) => {
    if (event.target instanceof HTMLElement) {
      const payload = {
        alias: rule.alias,
        width: event.target.offsetWidth,
        height: event.target.offsetHeight,
        scrollY: event.target.scrollTop,
        scrollX: event.target.scrollLeft,
        timestamp: Date.now(),
        trackingSource: getTrackingSource(),
      };
      this.analytics.track('SRC: scrolled on element', payload);
    }
  };

  setupScrollEvent(props: ScrollEventProps) {
    const { targetElement, rule } = props;
    if (targetElement) {
      const handler = throttle(this.handleScrollEvent.bind(null, rule), 500);
      this.scrollTargets.set(rule.alias, { targetElement, handler });
      targetElement.addEventListener('scroll', handler);
    }
  }

  disconnectClickEvents() {
    for (const entry of this.scrollTargets.values()) {
      const { targetElement, handler } = entry;
      targetElement.removeEventListener('scroll', handler);
    }
    this.scrollTargets.clear();
  }
}

type TouchEventProps = {
  rule: TrackingRuleTouch,
  targetElement: HTMLElement,
};

export class SourceTouchTr {
  analytics: Analytics;
  touchTargets: Map<string, any>;

  constructor(analytics: Analytics) {
    this.analytics = analytics;
    this.touchTargets = new Map();
    Object.freeze(this);
  }

  handleTouchStart: (rule: TrackingRuleTouch, event: TouchEvent) => void = (
    rule: TrackingRuleTouch,
    event: TouchEvent,
  ) => {
    const payload = {
      alias: rule.alias,
      timestamp: Date.now(),
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
      trackingSource: getTrackingSource(),
    };
    this.analytics.track('SRC: touch started on element', payload);
  };

  handleTouchEnd: (rule: TrackingRuleTouch, event: TouchEvent) => void = (
    rule: TrackingRuleTouch,
    event: TouchEvent,
  ) => {
    const payload = {
      alias: rule.alias,
      timestamp: Date.now(),
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
      trackingSource: getTrackingSource(),
    };
    this.analytics.track('SRC: touch ended on element', payload);
  };

  setupTouchEvent: (props: TouchEventProps) => void = (
    props: TouchEventProps,
  ) => {
    const { targetElement, rule } = props;
    if (targetElement) {
      const handlerStart = this.handleTouchStart.bind(null, rule);
      const handlerEnd = this.handleTouchEnd.bind(null, rule);
      this.touchTargets.set(rule.alias, {
        targetElement,
        handlerStart,
        handlerEnd,
      });
      targetElement.addEventListener('touchstart', handlerStart);
      targetElement.addEventListener('touchend', handlerEnd);
    }
  };

  disconnectTouchEvents() {
    for (const entry of this.touchTargets.values()) {
      const { targetElement, handlerStart, handlerEnd } = entry;
      targetElement.removeEventListener('touchstart', handlerStart);
      targetElement.removeEventListener('touchend', handlerEnd);
    }
    this.touchTargets.clear();
  }
}

// -- source tracker global "click" event

function isTouchDevice() {
  return ('ontouchstart' in window) || (window.navigator.maxTouchPoints > 0);
}

type ClickEventGlobalProps = {
  rule: TrackingRuleGlobalClick,
  targetElement: HTMLElement,
};
export class SourceClickGlobalTr {
  analytics: Analytics;
  clickTargets: Map<string, any>;

  constructor(analytics: Analytics) {
    this.analytics = analytics;
    this.clickTargets = new Map();
    Object.freeze(this);
  }

  handleSelectEvent: (rule: TrackingRuleGlobalClick, event: MouseEvent | TouchEvent) => void = (
    rule: TrackingRuleGlobalClick,
    event: MouseEvent | TouchEvent,
  ) => {
    const { targetSelectors } = rule;
    targetSelectors.forEach((targetRule) => {
      if (targetRule.selector && targetRule.alias) {
        const targetNodes = document.querySelectorAll(targetRule.selector);
        for (const targetNode of targetNodes) {
          // $FlowIgnore
          if (event.target === targetNode || targetNode.contains(event.target)) {
            let pageX = 0;
            let pageY = 0;
            if (event instanceof MouseEvent) {
              pageX = event.pageX;
              pageY = event.pageY;
            } else if (event instanceof TouchEvent) {
              pageX = event.touches[0].clientX;
              pageY = event.touches[0].clientY;
            }
            const payload = {
              pageX,
              pageY,
              alias: targetRule.alias,
              timestamp: Date.now(),
              trackingSource: getTrackingSource(),
            };
            this.analytics.track('SRC: selected the page element', payload);
            break;
          }
        }
      }
    });
  };

  setupSelectEvent(props: ClickEventGlobalProps) {
    const { targetElement, rule } = props;
    if (targetElement && rule.targetSelectors?.length > 0) {
      const handler = this.handleSelectEvent.bind(null, rule);
      let eventType = rule.eventType || 'click';
      if (isTouchDevice()) {
        eventType = 'touchstart';
      }
      this.clickTargets.set(rule.alias, { targetElement, handler, eventType });
      targetElement.addEventListener(eventType, handler);
    }
  }

  disconnectClickEvents() {
    for (const entry of this.clickTargets.values()) {
      const { targetElement, handler, eventType } = entry;
      targetElement.removeEventListener(eventType, handler);
    }
    this.clickTargets.clear();
  }
}

type ViewEventGlobalProps = {
  rule: TrackingRuleGlobalView,
};
export class SourceViewGlobalTr {
  analytics: Analytics;
  sourceObservers: Map<string, any>;
  sourceDurations: Map<string, any>;

  constructor(analytics: Analytics) {
    this.analytics = analytics;
    this.sourceObservers = new Map();
    this.sourceDurations = new Map();
    Object.freeze(this);
  }

  intersectionCallback: (entries: Array<IntersectionObserverEntry>) => void = (
    entries: Array<IntersectionObserverEntry>,
  ) => {
    entries.forEach((entry) => {
      const alias = entry.target.getAttribute('tr-id');
      if (alias) {
        const intersection = this.sourceDurations.get(alias);
        if (intersection) {
          const { viewStartTimestamp } = intersection;
          const viewEndTimestamp = Date.now();
          const payload = {
            alias,
            x: entry.boundingClientRect.left,
            y: entry.boundingClientRect.top,
            height: entry.rootBounds.height,
            width: entry.rootBounds.width,
            viewStartTimestamp,
            viewEndTimestamp,
            duration: viewEndTimestamp - viewStartTimestamp,
            trackingSource: getTrackingSource(),
            intersection: entry.intersectionRatio,
            totalDuration: Math.round(entry.time),
          };
          this.analytics.track('SRC: viewed global element', payload);
        }
        if (entry.isIntersecting) {
          this.sourceDurations.set(alias, {
            viewStartTimestamp: Date.now(),
          });
        } else {
          this.sourceDurations.delete(alias);
        }
      }
    });
  };

  interactionAddRef(props: ViewEventGlobalProps) {
    const { container, targetSelectors } = props.rule;
    const observer = this.sourceObservers.get(container);
    if (observer && targetSelectors.length !== 0) {
      targetSelectors.forEach((targetRule) => {
        if (targetRule.selector && targetRule.alias) {
          const targetNodes = document.querySelectorAll(targetRule.selector);
          for (let i = 0; i < targetNodes.length; i += 1) {
            const targetNode = targetNodes[i];
            targetNode.setAttribute('tr-id', `${targetRule.alias}-${i + 1}`);
            observer.observe(targetNode);
          }
        }
      });
    }
  }

  setupIntersectionEvent(props: ViewEventGlobalProps) {
    const { container } = props.rule;
    if (!this.sourceObservers.has(container)) {
      this.sourceObservers.set(
        container,
        new IntersectionObserver(this.intersectionCallback, {
          root: document.querySelector(container),
        }),
      );
    }
    this.interactionAddRef(props);
  }

  disconnectIntersectionEvents() {
    for (const observer of this.sourceObservers.values()) {
      observer.disconnect();
    }
    this.sourceObservers.clear();
    this.sourceDurations.clear();
  }
}
