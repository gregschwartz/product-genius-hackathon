// @flow
import React, { useContext } from 'react';
import type { Node } from 'react';
import { CardSpace, CardWrapper } from '../CardComponents';

import type { AddToCartCB, ProductSummaryCard } from '../../../entities';
import { DesignContext } from '../../../context';
import {
  getDiscountPercentage,
  getProductAttributes,
  getProructRatingData,
} from '../../../utils/componentUtils';

import { cartButtonTitle, isValidPrice } from '../../../utils/cartUtils';
import { AppRating, AppButton } from '../../AppComponents';

type FeedProductSummaryCardProps = {
  card: ProductSummaryCard,
  onAddToCart: AddToCartCB,
};

function FeedProductSummaryCard({
  card,
  onAddToCart,
}: FeedProductSummaryCardProps): Node {
  const { product: config } = useContext(DesignContext);
  const {
    price,
    available,
    currency_code: cc,
    compare_at_price: cap,
    price_per_unit: ppu,
  } = getProductAttributes(card.product.attributes);

  const renderProductPrice = (): Node => {
    if (price && isValidPrice(price)) {
      if (cap) {
        const { discount, priceLow, priceHigh } = getDiscountPercentage(price, cap);
        if (discount > 0) {
          return (
            <div className="pg-card-product-price">
              {`${cc}${priceLow.toFixed(2)}`}
              <span data-attr="slashed" className="pg-card-price-attr">
                {`${cc}${priceHigh.toFixed(2)}`}
              </span>
              <span data-attr="discount" className="pg-card-price-attr">
                {`(${discount}% off)`}
              </span>
              {ppu && (
                <span data-attr="unit" className="pg-card-price-attr">
                  {`(${ppu})`}
                </span>
              )}
            </div>
          );
        }
      }
      return (
        <div className="pg-card-product-price">
          {`${cc}${parseFloat(price).toFixed(2)}`}
          {ppu && (
            <span data-attr="unit" className="pg-card-price-attr">
              {`(${ppu})`}
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  const renderProductRating = (): Node => {
    if (config.enableRating) {
      const { count, rating } = getProructRatingData(card.product);
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
  const renderCartButton = (): Node => {
    const buttonTitle = cartButtonTitle(card.product);
    if (config.enableReorder && buttonTitle.includes('Reorder')) {
      return (
        <div style={{ padding: '0px 15px 15px 15px' }} className="pg-card-product-cart">
          <AppButton
            type="reorder"
            style={{ width: '100%' }}
            onClick={() => {
              if (available) {
                onAddToCart(card.product);
              }
            }}
          >
            {buttonTitle}
          </AppButton>
        </div>
      );
    }
    if (config.enableCart) {
      return (
        <div style={{ padding: '0px 15px 15px 15px' }} className="pg-card-product-cart">
          <AppButton
            type="cart"
            style={{ width: '100%' }}
            onClick={() => {
              if (available) {
                onAddToCart(card.product);
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
        <div style={{ padding: '0px 15px 15px 15px' }} className="pg-card-product-buy-now">
          <AppButton
            type="buy-now"
            style={{ width: '100%' }}
            onClick={() => {
              if (available) {
                onAddToCart(card.product, 'buy-now');
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

  const renderContent = (): Node => {
    if (card.product.body_html) {
      return (
        <CardSpace
          type="horizontal-full"
          style={{ flexDirection: 'column', padding: '0px 20px 26px 20px' }}
        >
          {card.product.body_html && (
            <span
              className="pg-card-text __summary"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: card.product.body_html }}
            />
          )}
        </CardSpace>
      );
    }
    if (card.product.body) {
      return (
        <CardSpace
          type="horizontal-full"
          style={{ flexDirection: 'column', padding: '0px 20px 26px 20px' }}
        >
          {card.product.body && (
            <span
              className="pg-card-text __summary"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: card.product.body }}
            />
          )}
        </CardSpace>
      );
    }
    if (card.product.subtitle || card.product.summary) {
      return (
        <CardSpace
          type="horizontal-full"
          style={{ flexDirection: 'column', padding: '0px 20px 26px 20px' }}
        >
          {card.product.subtitle && (
            <span
              style={{ paddingBottom: 7 }}
              className="pg-card-text __subtitle"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: card.product.subtitle }}
            />
          )}
          {card.product.summary && (
            <span
              className="pg-card-text __summary"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: card.product.summary }}
            />
          )}
        </CardSpace>
      );
    }
    return null;
  };

  return (
    <CardWrapper
      card={card}
      size="auto"
      grid={card.layout_state || '1x2'}
      style={{ overflow: 'hidden' }}
    >
      <CardSpace type="vertical-full" style={{ backgroundColor: '#FFFFFF' }}>
        <CardSpace
          type="horizontal-full"
          style={{
            padding: '20px 20px 12px 20px',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: '#131313' }} className="pg-card-text __md_plus">
            {card.product.title}
          </span>
          {renderProductPrice()}
        </CardSpace>
        {renderProductRating()}
        {renderContent()}
        {renderCartButton()}
        {renderBuyNowButton()}
      </CardSpace>
    </CardWrapper>
  );
}

export default FeedProductSummaryCard;
