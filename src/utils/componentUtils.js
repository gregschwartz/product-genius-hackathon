// @flow
import React, { useContext } from 'react';
import type { Node } from 'react';
import type {
  Product,
  HeaderCard,
  ProductVariants,
  ProductVaraint,
  ProductVariantCard,
} from '../entities';
import safeLocalStorage from './safeLocalStorage';
import { DesignContext } from '../context';

export const getProductAttributes = (
  attributes: Array<{ name: string, value: string }>,
  formatting?: {
    priceToLocale?: boolean,
    priceToNumber?: boolean,
  } = {
    priceToLocale: true,
    priceToNumber: false,
  },
): { [string]: any } => attributes.reduce((acc, attr) => {
  if (attr.name === 'price' && formatting?.priceToLocale) {
    const priceValue = Number(attr.value.trim());
    if (!Number.isNaN(priceValue)) {
      // $FlowIgnore
      acc[attr.name] = priceValue.toLocaleString('en-US');
      return acc;
    }
  }
  if (attr.name === 'price' && formatting?.priceToNumber) {
    const priceValue = Number(attr.value);
    if (Number.isNaN(priceValue)) {
      const parsedValue = parseFloat(attr.value.split(',').join(''));
      if (!Number.isNaN(parsedValue)) {
        // $FlowIgnore
        acc[attr.name] = parsedValue;
        return acc;
      }
    }
  }
  // $FlowIgnore
  acc[attr.name] = attr.value;
  return acc;
}, {});

export function getProductClassName(productRecommendationType: string): string {
  if (productRecommendationType) {
    return `pg-card-product ${productRecommendationType}`;
  }
  return 'pg-card-product';
}

export const getProructRatingData = (
  product: Product,
): {
  count: number,
  rating: number,
} => {
  const { ratingCount, ratingValue } = getProductAttributes(product.attributes);
  const countNum = Number(ratingCount);
  const valuetNum = Number(ratingValue);
  return {
    count: !Number.isNaN(countNum) ? countNum : 0,
    rating: !Number.isNaN(valuetNum) ? valuetNum : 0,
  };
};

export function getTargetURL(url: string): string {
  const redirect = safeLocalStorage.getItem('GAMALON-pg-url-redirect');
  if (redirect === 'true') {
    const urlFormatted = url.trim().replace('?utm_source=gamalon&utm_medium=product_genius', '');
    return `https://url-redirect.web.app/?url=${urlFormatted}`;
  }
  return url;
}

export function getTargetTab(): '_blank' | '_self' {
  const targetTab = safeLocalStorage.getItem('GAMALON-pg-url-target');
  if (targetTab === 'self') {
    return '_self';
  }
  return '_blank';
}

export function openTargetURL(url: string) {
  window.open(getTargetURL(url), getTargetTab());
}

type GetVideoIdReturn = {
  source: string,
  id: string,
}

export function getVideoId(url: string): GetVideoIdReturn {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|shorts\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match) {
    return {
      source: 'youtube',
      id: match[2].length === 11 ? match[2] : '',
    };
  }
  return {
    source: 'unknown',
    id: '',
  };
}

export function getHeaderContentType(
  headerCard: ?HeaderCard,
): 'cart' | 'nav' | 'empty' {
  if (!headerCard || headerCard.source_id === 'HOME') {
    return 'empty';
  }
  if (headerCard.id.endsWith('_PDF')) {
    return 'cart';
  }
  return 'nav';
}

type getVariantPropDataReturn = {
  properties: Array<{
    variantId: string,
    prop: string,
  }>,
  startingPrice: number,
  startingPriceFormatted: string,
  selectedPriceFormatted: string,
  selectedProduct: null | Product,
};

export function getVariantPropData(
  variants: ProductVariants,
  selectedVariant?: string,
): getVariantPropDataReturn {
  const result: getVariantPropDataReturn = {
    properties: [],
    startingPrice: Infinity,
    startingPriceFormatted: '',
    selectedPriceFormatted: '',
    selectedProduct: null,
  };
  // eslint-disable-next-line guard-for-in
  for (const key in variants) {
    const variant: ProductVaraint = variants[key];
    if (variant.variant_properties) {
      result.properties.push({
        variantId: key,
        prop: variant.variant_properties,
      });
    }
    if (variant.product) {
      const { price, currency_code: currency = '' } = getProductAttributes(
        variant.product.attributes,
        { priceToNumber: true },
      );
      if (selectedVariant === key) {
        result.selectedProduct = variant.product;
        const priceValue = Number(price);
        if (!Number.isNaN(priceValue)) {
          result.selectedPriceFormatted = `${currency}${priceValue.toLocaleString('en-US')}`;
        }
      }
      const priceValue = Number(price);
      if (!Number.isNaN(priceValue) && result.startingPrice > priceValue) {
        result.startingPrice = priceValue;
        result.startingPriceFormatted = `${currency}${priceValue.toLocaleString('en-US')}`;
      }
    }
  }
  return result;
}

export type VariantDataFormatted = {
  startingPrice: number,
  samePrice: boolean,
  variantProduct: ?Product,
  variantCount: number,
  startingPriceFormatted: string,
  attributes: { [string]: any },
};

export function getVariantData(
  variantCard: ProductVariantCard,
): VariantDataFormatted {
  const { variants_info: variants } = variantCard;
  const result: VariantDataFormatted = {
    startingPrice: Infinity,
    samePrice: true,
    variantProduct: null,
    variantCount: 0,
    startingPriceFormatted: '',
    attributes: {},
  };
  // eslint-disable-next-line guard-for-in
  for (const key in variants) {
    const variant: ProductVaraint = variants[key];
    if (variant.product) {
      if (variant.product.number_of_variants) {
        result.variantCount = variant.product.number_of_variants;
      }
      const attrs = getProductAttributes(variant.product.attributes, { priceToNumber: true });
      const { price, currency_code: currency = '' } = attrs;
      const priceValue = Number(price);
      if (!Number.isNaN(priceValue) && result.startingPrice > priceValue) {
        if (result.startingPrice !== Infinity) {
          result.samePrice = false;
        }
        result.variantProduct = variant.product;
        result.attributes = { ...attrs };
        result.startingPrice = priceValue;
        if (priceValue > 0) {
          result.startingPriceFormatted = `${currency}${priceValue.toLocaleString('en-US')}`;
        }
      }
    }
  }
  return result;
}

export function convertStrToEmailHTML(body: string): string {
  if (body) {
    const regex = /\b[\w.-]+@[\w.-]+\.\w{2,4}\b/gi;
    return body.replace(regex, (match: string) => {
      if (match) {
        return `<a style="color: inherit;text-decoration: underline;" href="mailto:${match}">${match}</a>`;
      }
      return match;
    });
  }
  return '';
}

export function generateImageSrcSet(url: string): ?string {
  if (url) {
    const urlF = url.split('?')[0];
    if (urlF) {
      return `${urlF}?width=200 200w, ${urlF}?width=300 300w, ${urlF}?width=400 400w, ${urlF}?width=450 450w`;
    }
  }
  return undefined;
}

export function generateImageSizes(): string {
  return '(max-width: 420px) 200px, (max-width: 500px) 250px, (max-width: 600px) 300px, (max-width: 800px) 400px, 450px';
}

function clearProductImageStatus(event: Event) {
  if (event.target instanceof HTMLImageElement) {
    event.target.setAttribute('data-status', 'loaded');
    event.target.removeEventListener('load', clearProductImageStatus);
  }
}

export async function loadBackupProductImage(
  product: Product,
  element: HTMLImageElement,
) {
  if (product?.product_url && element) {
    const urlFormatted = product.product_url.split('?')[0];
    if (urlFormatted) {
      try {
        const response = await fetch(`${urlFormatted}.json`, {
          method: 'GET',
        }).then((res) => res.json());
        if (response.product?.image?.src) {
          const imgSrc = response.product.image.src;
          element.addEventListener('load', clearProductImageStatus);
          element.setAttribute('src', `${imgSrc}&width=400`);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}

export function ProductLinkHoc({
  children,
  product,
}: {
  children: Node,
  product: Product,
}): Node {
  const { flags } = useContext(DesignContext);
  if (flags.sourcePDP) {
    return (
      <a
        target="_blank"
        className="pg-card-link"
        rel="noopener noreferrer"
        href={product.product_url}
        style={{
          textDecoration: 'none',
          outline: 'none',
        }}
      >
        {children}
      </a>
    );
  }
  return children;
}

type GetDiscountPercentage = {
  discount: number,
  priceLow: number,
  priceHigh: number,
};

export function getDiscountPercentage(p1: string, p2: string): GetDiscountPercentage {
  let priceA = parseFloat(p1.replace(/,/g, ''));
  let priceB = parseFloat(p2.replace(/,/g, ''));
  if (Number.isNaN(priceA) || Number.isNaN(priceB)) {
    return {
      discount: 0,
      priceLow: 0,
      priceHigh: 0,
    };
  }
  if (priceA === 0 || priceB === 0) {
    return {
      discount: 0,
      priceLow: Math.min(priceA, priceB),
      priceHigh: Math.max(priceA, priceB),
    };
  }
  if (priceA === priceB) {
    return {
      discount: 0,
      priceLow: priceA,
      priceHigh: priceB,
    };
  }
  if (priceB > priceA) {
    const tempPriceB = priceB;
    priceB = priceA;
    priceA = tempPriceB;
  }
  const discountPercentage = ((priceA - priceB) / priceA) * 100;
  return {
    discount: Math.round(discountPercentage / 5) * 5,
    priceLow: priceB,
    priceHigh: priceA,
  };
}

const currencyToSymbol = new Map([
  ['USD', '$'],
  ['CAD', 'C$'],
  ['EUR', '€'],
  ['GBP', '£'],
  ['GEL', '₾'],
]);

const symbolToCurrency = new Map([
  ['$', 'USD'],
  ['C$', 'CAD'],
  ['€', 'EUR'],
  ['£', 'GBP'],
  ['₾', 'GEL'],
]);

export function renderCurrency({
  price,
  currency,
  localized,
}: {
  price: number,
  currency: string,
  localized: boolean,
}): {
  symbol: string,
  value: number,
} {
  if (!localized) {
    return {
      symbol: currency,
      value: price,
    };
  }
  const activeCurrency = {
    active: symbolToCurrency.get(currency) || 'USD',
    rate: '1.0',
  };
  if (window.Shopify?.currency?.active) {
    activeCurrency.active = window.Shopify.currency.active;
  }
  if (window.Shopify?.currency?.rate) {
    activeCurrency.rate = window.Shopify.currency.rate;
  }
  return {
    symbol: currencyToSymbol.get(activeCurrency.active) || '$',
    value: price * parseFloat(activeCurrency.rate || '1.0'),
  };
}

export function getFormattedNumPrice({
  price,
  currency,
  localized,
}: {
  price: number,
  currency: string,
  localized: boolean,
}): string {
  if (Number.isNaN(price)) {
    return '';
  }
  const { symbol, value } = renderCurrency({ price, currency, localized });
  return `${symbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getFromattedPPU({
  ppu,
  localized,
}: {
  ppu: string,
  localized: boolean,
}): string {
  if (!localized) {
    return ppu;
  }
  const regex = /([^\d]*)(\d+(?:\.\d{1,2}))\/([a-zA-Z0-9%-/]+)/gi;
  const match = regex.exec(ppu);
  if (match) {
    const currency = match[1];
    const price = match[2];
    const unit = match[3];
    const priceValue = parseFloat(price);
    if (Number.isNaN(priceValue)) {
      return ppu;
    }
    const { symbol, value } = renderCurrency({
      price: priceValue,
      currency: currency || 'USD',
      localized: true,
    });
    const priceFormatted = value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol}${priceFormatted}/${unit}`;
  }
  return ppu;
}

export function getFormattedPrice({
  price,
  currency,
  localized,
}: {
  price: string,
  currency: string,
  localized: boolean,
}): string {
  const priceValue = parseFloat(price.replace(/,/g, ''));
  if (Number.isNaN(priceValue)) {
    return '';
  }
  const { symbol, value } = renderCurrency({
    price: priceValue,
    currency,
    localized,
  });
  return `${symbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const stickers = {
  clearance: {
    backgroundImage:
      'url(https://res.cloudinary.com/duzeactyd/image/upload/v1710168051/PG_STICKERS_VPS.png)',
    backgroundPosition: '0px -64px',
  },
  hot: {
    backgroundImage:
      'url(https://res.cloudinary.com/duzeactyd/image/upload/v1710168051/PG_STICKERS_VPS.png)',
    backgroundPosition: '0px -395px',
  },
  USA: {
    backgroundImage:
      'url(https://res.cloudinary.com/duzeactyd/image/upload/v1710168051/PG_STICKERS_VPS.png)',
    backgroundPosition: '0px -255px',
  },
};
