// @flow
import React, { useContext } from 'react';
import type { Node } from 'react';
import { m } from 'framer-motion';

import type { AddToCartCB, ProducDetailsCard } from '../../../entities';
import { DesignContext } from '../../../context';
import {
  getProductAttributes,
  getProructRatingData,
  loadBackupProductImage,
} from '../../../utils/componentUtils';
import { AppButton, AppImage, AppRating } from '../../AppComponents';

// $FlowIgnore
import './productCard.scss';
import { cartButtonTitle } from '../../../utils/cartUtils';

type ProductCardRowProps = {
  card: ProducDetailsCard,
  onAddToCart: AddToCartCB,
  onCardSelect: (card: ProducDetailsCard) => void | Promise<void>,
};

function ProductCardRow({
  card,
  onAddToCart,
  onCardSelect,
}: ProductCardRowProps): Node {
  const { product } = card;
  const { product: config } = useContext(DesignContext);
  const {
    price,
    available,
    price_per_unit: ppu,
    currency_code: currency,
  } = getProductAttributes(product.attributes);

  const renderProductRating = (): Node => {
    if (config.enableRating) {
      const { count, rating } = getProructRatingData(product);
      return (
        <AppRating
          showCount
          ratingValue={rating}
          ratingCount={count}
          style={{ padding: '6px 0px' }}
        />
      );
    }
    return null;
  };

  const renderCartButton = (): Node => {
    if (config.enableCart) {
      const buttonTitle = cartButtonTitle(product);
      return (
        <AppButton
          size="s"
          type={buttonTitle === 'Reorder' ? 'reorder' : 'cart'}
          style={{ margin: '0px 0px 8px 8px' }}
          onClick={() => {
            if (available) {
              onAddToCart(product);
            }
          }}
        >
          {buttonTitle}
        </AppButton>
      );
    }
    return null;
  };

  const renderCardOptions = (): Node => {
    const btnCardCart = renderCartButton();
    if (btnCardCart) {
      return (
        <div data-type="flex-horizontal" className="pg-card-section">
          {btnCardCart}
        </div>
      );
    }
    return null;
  };

  const renderShipping = (): Node => {
    if (config.enableShipping) {
      return (
        <div className="pg-card-product-shipping" style={{ marginBottom: 8 }} />
      );
    }
    return null;
  };

  return (
    <m.div
      className="pg-card-product-row"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onCardSelect(card);
      }}
    >
      <AppImage
        hover
        imageURL={product.image_url ? `${product.image_url}&width=150` : ''}
        style={{
          width: 105,
          margin: '8px 0px 0px 8px',
          height: 'calc(100% - 16px)',
          borderRadius: '13px',
        }}
        onError={(element) => {
          if (config.enableBackupImage) {
            loadBackupProductImage(product, element);
          }
        }}
      />
      <div
        data-type="flex-vertical"
        className="pg-card-section"
        style={{ padding: '12px 8px 0px 12px', flexGrow: 1 }}
      >
        <div style={{ order: 0 }} title={product.title} className="pg-card-product-title">
          {product.title}
        </div>
        <div className="pg-card-product-price">
          {`${currency}${price}`}
          {ppu && (
            <span className="pg-card-product-price-unit">{`(${ppu})`}</span>
          )}
        </div>
        {renderProductRating()}
        {renderShipping()}
        {renderCardOptions()}
      </div>
    </m.div>
  );
}

export default ProductCardRow;
