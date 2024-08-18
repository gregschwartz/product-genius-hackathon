// @flow
/* eslint-disable no-param-reassign */
import { produce } from 'immer';
import { Analytics } from '../analytics';
import type {
  AppConfig,
  AppDesignProps,
  AppProps,
  ContextConfigProps,
} from '../entities';
import safeLocalStorage from './safeLocalStorage';
import safeSessionStorage from './safeSessionStorage';

export const defaultDesign: AppDesignProps = {
  layout: 'embedded',
  pagination: {
    enabled: false,
  },
  merchant: {
    enabled: false,
    mode: 'preview',
  },
  style: {
    global: '',
    merchant: '',
  },
  container: {
    style: '',
  },
  flags: {
    contextInitialState: false,
    lingerCards: false,
    sourcePDP: false,
  },
  rendering: {
    context: {},
  },
  coupon: {},
  navigation: {
    type: 'breadcrumbs',
  },
  product: {
    enableRating: false,
    enableCart: false,
    enableBuyNow: false,
    enableReorder: true,
    enableShipping: false,
    enableSubTitle: false,
    enableVendor: false,
    enableOptions: false,
    enableForceOptions: false,
    enableBackupImage: false,
    enableHighlights: true,
    enableVariantInfo: false,
    enableCurrency: false,
    enableSubscriptions: false,
  },
  allowedPagePatterns: [],
  embedded: {
    scrollSource: '',
    banner: {
      visible: true,
      type: 'content',
      content: {
        title: '',
        description: '',
        image: '',
      },
    },
    filters: {
      visible: false,
      navigation: {
        title: '',
        options: [],
      },
    },
    menu: {
      visible: false,
    },
    sorting: {
      visible: false,
    },
  },
  url: {
    redirect: false,
    target: 'external',
  },
  cart: {
    type: 'default',
    cartFlow: [],
    callback: '',
    sections: '',
    cartURL: '',
    callbackConfig: {
      nodes: [],
    },
    checkout: {
      type: 'default',
      node: '',
      url: '',
    },
    sectionExtractor: {
      selector: '',
      attribute: '',
    },
  },
  tracking: {
    source: {
      enabled: false,
      rules: [],
    },
    feed: {
      enabled: false,
      thresholds: [0.3, 0.7],
    },
  },
};

export function getDesignConfig(config: AppConfig): AppDesignProps {
  const { design } = config;
  return produce(defaultDesign, (draftState) => {
    draftState.layout = design?.layout || draftState.layout;
    draftState.pagination = {
      enabled: design?.pagination?.enabled ?? draftState.pagination.enabled,
    };
    draftState.merchant = {
      enabled: design?.merchant?.enabled ?? draftState.merchant.enabled,
      mode: design?.merchant?.mode || draftState.merchant.mode,
    };
    draftState.flags = {
      contextInitialState:
        design?.flags?.contextInitialState ?? draftState.flags.contextInitialState,
      lingerCards:
        design?.flags?.lingerCards ?? draftState.flags.lingerCards,
      sourcePDP:
        design?.flags?.sourcePDP ?? draftState.flags.sourcePDP,
    };
    draftState.style = {
      global: design?.style?.global || draftState.style.global,
      merchant: design?.style?.merchant || draftState.style.merchant,
    };
    draftState.container = {
      style: design?.container?.style ?? draftState.container.style,
    };
    draftState.coupon = design?.coupon || draftState.coupon;
    draftState.rendering = {
      context: design?.rendering?.context || draftState.rendering.context,
    };
    draftState.navigation = {
      type: design?.navigation?.type || draftState.navigation.type,
    };
    draftState.product = {
      enableRating: design?.product?.enableRating ?? draftState.product.enableRating,
      enableCart: design?.product?.enableCart ?? draftState.product.enableCart,
      enableBuyNow: design?.product?.enableBuyNow ?? draftState.product.enableBuyNow,
      enableReorder: design?.product?.enableReorder ?? draftState.product.enableReorder,
      enableVendor: design?.product?.enableVendor ?? draftState.product.enableVendor,
      enableOptions: design?.product?.enableOptions ?? draftState.product.enableOptions,
      enableForceOptions:
        design?.product?.enableForceOptions
        ?? draftState.product.enableForceOptions,
      enableShipping: design?.product?.enableShipping ?? draftState.product.enableShipping,
      enableSubTitle: design?.product?.enableSubTitle ?? draftState.product.enableSubTitle,
      enableBackupImage: design?.product?.enableBackupImage ?? draftState.product.enableBackupImage,
      enableHighlights: design?.product?.enableHighlights ?? draftState.product.enableHighlights,
      enableVariantInfo: design?.product?.enableVariantInfo ?? draftState.product.enableVariantInfo,
      enableCurrency: design?.product?.enableCurrency ?? draftState.product.enableCurrency,
      enableSubscriptions:
        design?.product?.enableSubscriptions
        ?? draftState.product.enableSubscriptions,
    };
    draftState.allowedPagePatterns = design?.allowedPagePatterns
      || draftState.allowedPagePatterns;
    draftState.embedded = {
      scrollSource: design?.embedded?.scrollSource || draftState.embedded.scrollSource,
      banner: {
        visible: design?.embedded?.banner?.visible ?? draftState.embedded.banner.visible,
        type: design?.embedded?.banner?.type || draftState.embedded.banner.type,
        content: {
          title: design?.embedded?.banner?.content?.title || '',
          description: design?.embedded?.banner?.content?.description || '',
          image: design?.embedded?.banner?.content?.image || '',
        },
      },
      filters: {
        visible: design?.embedded?.filters?.visible ?? draftState.embedded.filters.visible,
        navigation: {
          title: design?.embedded?.filters?.navigation?.title || '',
          options: design?.embedded?.filters?.navigation?.options || [],
        },
      },
      sorting: {
        visible: design?.embedded?.sorting?.visible ?? draftState.embedded.sorting.visible,
      },
      menu: {
        visible: design?.embedded?.menu?.visible ?? draftState.embedded.menu.visible,
      },
    };
    draftState.url = {
      redirect: design?.url?.redirect ?? draftState.url.redirect,
      target: design?.url?.target || draftState.url.target,
    };
    draftState.cart = {
      type: design?.cart?.type || draftState.cart.type,
      callback: design?.cart?.callback || draftState.cart.callback,
      sections: design?.cart?.sections || draftState.cart.sections,
      cartURL: design?.cart?.cartURL || draftState.cart.cartURL,
      cartFlow: design?.cart?.cartFlow || draftState.cart.cartFlow,
      callbackConfig: {
        nodes:
          design?.cart?.callbackConfig?.nodes
          || draftState.cart.callbackConfig.nodes,
      },
      checkout: {
        type: design?.cart?.checkout?.type || draftState.cart.checkout.type,
        node: design?.cart?.checkout?.node || draftState.cart.checkout.node,
        url: design?.cart?.checkout?.url || draftState.cart.checkout.url,
      },
      sectionExtractor: {
        selector:
          design?.cart?.sectionExtractor?.selector
          || draftState.cart.sectionExtractor.selector,
        attribute:
          design?.cart?.sectionExtractor?.attribute
          || draftState.cart.sectionExtractor.attribute,
      },
    };
    draftState.tracking = {
      source: {
        enabled:
          design?.tracking?.source?.enabled
          ?? draftState.tracking.source.enabled,
        rules:
          design?.tracking?.source?.rules || draftState.tracking.source.rules,
      },
      feed: {
        enabled:
          design?.tracking?.feed?.enabled ?? draftState.tracking.feed.enabled,
        thresholds:
          design?.tracking?.feed?.thresholds
          || draftState.tracking.feed.thresholds,
      },
    };
  });
}

export const defaultContextConfig = {
  // $FlowIgnore
  analytics: new Analytics(),
  organizationId: '',
  socketURL: '',
  serverBehavior: { expand_single_product: false, fetch_provider: 'REST' },
  flags: defaultDesign.flags,
};

// Returns immutable immer object, so we
// can pass it to the context provider.
export function getContextConfigProps(
  props: AppProps,
): ContextConfigProps {
  return produce(defaultContextConfig, (draftState) => {
    draftState.serverBehavior = props.serverBehavior || draftState.serverBehavior;
    draftState.organizationId = props.organizationId || draftState.organizationId;
    draftState.socketURL = props.socketURL || draftState.socketURL;
    draftState.analytics = props.analytics || draftState.analytics;
    draftState.flags = props.design.flags || draftState.flags;
  });
}

export function setStorageFlags(design: AppDesignProps) {
  safeSessionStorage.removeItem('GAMALON-mini-selection');
  safeLocalStorage.setItem('GAMALON-pg-url-target', design.url.target);
  safeLocalStorage.setItem('GAMALON-pg-url-redirect', design.url.redirect);
  if (design.cart) {
    safeLocalStorage.setItem('GAMALON-pg-cart-config', JSON.stringify(design.cart));
  }
}
