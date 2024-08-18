// @flow
import React, { useContext } from 'react';
import type { Node } from 'react';
import { m } from 'framer-motion';

import type { Product, AddToCartCB } from '../../../entities';
import {
  getDiscountPercentage,
  getProductAttributes,
  getProructRatingData,
  getFormattedPrice,
  getFormattedNumPrice,
  getFromattedPPU,
} from '../../../utils/componentUtils';
import type { VariantDataFormatted } from '../../../utils/componentUtils';
import { AppButton, AppRating } from '../../AppComponents';
import { NativeCartWrapper } from '../NativeElements';
import { cartButtonTitle, isValidPrice } from '../../../utils/cartUtils';
import { DesignContext } from '../../../context';

type ProductCardDetailsProps = {
  product: Product,
  settings?: {
    type?: 'single' | 'variant',
    pricePrefix?: string,
    variantData?: VariantDataFormatted,
  },
  onAddToCart: AddToCartCB,
  onViewDetails?: () => void | Promise<void>,
};

function ProductCardDetails({
  product,
  settings,
  onAddToCart,
  onViewDetails,
}: ProductCardDetailsProps): Node {
  const { product: config } = useContext(DesignContext);
  const {
    price,
    upsell,
    available,
    vendor,
    currency_code: cc,
    compare_at_price: cap,
    price_per_unit: ppu,
  } = getProductAttributes(product.attributes);

  const renderProductRibbon = (): Node => {
    if (upsell) {
      return <div className="pg-card-product-ribbon" />;
    }
    return null;
  };

  const renderProductPrice = (): Node => {
    if (price && isValidPrice(price)) {
      if (cap) {
        const { discount, priceLow, priceHigh } = getDiscountPercentage(price, cap);
        if (discount > 0) {
          return (
            <div className="pg-card-product-price">
              {getFormattedNumPrice({
                price: priceLow,
                currency: cc,
                localized: config.enableCurrency,
              })}
              <span data-attr="slashed" className="pg-card-price-attr">
                {getFormattedNumPrice({
                  price: priceHigh,
                  currency: cc,
                  localized: config.enableCurrency,
                })}
              </span>
              <span data-attr="discount" className="pg-card-price-attr">
                {`(${discount}% off)`}
              </span>
              {ppu && (
                <span data-attr="unit" className="pg-card-price-attr">
                  {`(${getFromattedPPU({ ppu, localized: config.enableCurrency })})`}
                </span>
              )}
            </div>
          );
        }
      }
      return (
        <div
          data-prefix-variant={settings?.type === 'variant'}
          className="pg-card-product-price"
        >
          {getFormattedPrice({
            price,
            currency: cc,
            localized: config.enableCurrency,
          })}
          {ppu && (
            <span data-attr="unit" className="pg-card-price-attr">
              {`(${getFromattedPPU({ ppu, localized: config.enableCurrency })})`}
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  const renderProductVariantInfo = (): Node => {
    if (config.enableVariantInfo) {
      if (settings?.type === 'variant' && settings?.variantData) {
        const { variantCount } = settings.variantData;
        if (variantCount > 1) {
          return (
            <div className="pg-card-product-variant">
              {`${settings.variantData.variantCount} `}
            </div>
          );
        }
      }
    }
    return null;
  };

  const renderProductRating = (): Node => {
    if (config.enableRating) {
      const { count, rating } = getProructRatingData(product);
      if (count !== undefined && rating > 0) {
        return (
          <div className="pg-card-product-rating">
            <AppRating
              showCount
              ratingValue={rating}
              ratingCount={count}
            />
          </div>
        );
      }
    }
    return null;
  };

  const renderProductSubTitle = (): Node => {
    if (config.enableSubTitle && product.subtitle) {
      return (
        <div className="pg-card-product-subtitle">
          {product.subtitle}
        </div>
      );
    }
    return null;
  };

  const renderShipping = (): Node => {
    if (config.enableShipping) {
      return <div className="pg-card-product-shipping" />;
    }
    return null;
  };

  const renderVendor = (): Node => {
    if (config.enableVendor && vendor) {
      return (
        <div className="pg-card-product-vendor">
          {vendor}
        </div>
      );
    }
    return null;
  };

  const renderSubscriptions = (): Node => {
    if (config.enableSubscriptions) {
      return (
        <div className="pg-card-product-subscriptions">
          <NativeCartWrapper variantId={product.product_id} />
        </div>
      );
    }
    return null;
  };

  const renderCartButton = (): Node => {
    if (!price || !isValidPrice(price)) {
      return null;
    }
    const buttonTitle = cartButtonTitle(product);
    if (config.enableReorder && buttonTitle.includes('Reorder')) {
      return (
        <div className="pg-card-product-cart">
          <AppButton
            type="reorder"
            style={{ width: '100%' }}
            onClick={() => {
              if (available) {
                onAddToCart(product);
              }
            }}
          >
            {buttonTitle}
          </AppButton>
        </div>
      );
    }
    if (config.enableCart) {
      if (settings?.type === 'variant' && settings?.variantData) {
        const { variantCount } = settings.variantData;
        if (variantCount > 1) {
          return null;
        }
      }
      return (
        <div className="pg-card-product-cart">
          <AppButton
            type="cart"
            style={{ width: '100%' }}
            onClick={() => {
              if (available) {
                onAddToCart(product);
              }
            }}
          >
            {buttonTitle}
          </AppButton>
        </div>
      );
    }
    return null;
  };

  const renderBuyNowButton = (): Node => {
    if (config.enableBuyNow) {
      return (
        <div className="pg-card-product-buy-now">
          <AppButton
            type="buy-now"
            style={{ width: '100%' }}
            onClick={() => {
              if (available) {
                onAddToCart(product, 'buy-now');
              }
            }}
          >
            Buy Now
          </AppButton>
        </div>
      );
    }
    return null;
  };

  const renderCardOptions = (): Node => {
    const buttonTitle = cartButtonTitle(product);
    if (config.enableOptions && !buttonTitle.includes('Reorder')) {
      if (settings?.type === 'variant' && settings?.variantData) {
        const { variantCount } = settings.variantData;
        if (variantCount > 1) {
          return (
            <div className="pg-card-product-options">
              <AppButton
                type="details"
                style={{ width: '100%' }}
                onClick={() => {
                  if (onViewDetails) {
                    onViewDetails();
                  }
                }}
              >
                <span
                  className="pg-app-btn-content"
                  style={{
                    '--pg-content-btn': 'var(--pg-content-card-variant-option-title)',
                  }}
                />
              </AppButton>
            </div>
          );
        }
      }
    }
    if (config.enableForceOptions) {
      return (
        <div className="pg-card-product-options">
          <AppButton
            type="details"
            style={{ width: '100%' }}
            onClick={() => {
              if (onViewDetails) {
                onViewDetails();
              }
            }}
          >
            <span
              className="pg-app-btn-content"
              style={{
                '--pg-content-btn': 'var(--pg-content-card-variant-option-title)',
              }}
            />
          </AppButton>
        </div>
      );
    }
    return null;
  };

  return (
    <m.section className="pg-card-product-details">
      {renderProductRibbon()}
      <m.div className="pg-card-section pg-spacing">
        {renderProductPrice()}
        {renderProductVariantInfo()}
        <m.div className="pg-card-product-title">{product.title}</m.div>
        {renderProductSubTitle()}
        {renderProductRating()}
        {renderVendor()}
      </m.div>
      <m.div className="pg-card-section pg-spacing">
        {renderShipping()}
        {renderSubscriptions()}
        {renderCartButton()}
        {renderBuyNowButton()}
        {renderCardOptions()}
      </m.div>
    </m.section>
  );
}

ProductCardDetails.defaultProps = {
  onViewDetails: undefined,
  settings: {
    type: 'single',
    variantData: undefined,
  },
};

export default ProductCardDetails;
