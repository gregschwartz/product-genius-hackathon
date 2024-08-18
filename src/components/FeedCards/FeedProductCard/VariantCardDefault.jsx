// @flow
import React, { useContext } from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

import type { ProductVariantCard, AddToCartCB } from '../../../entities';
import { AppButton, AppImage } from '../../AppComponents';
import { DesignContext } from '../../../context';
import { getVariantData } from '../../../utils/componentUtils';

type VariantCardDefaultProps = {
  card: ProductVariantCard,
  onAddToCart: AddToCartCB,
  onCardSelect: (ProductVariantCard) => void | Promise<void>,
};

function VariantCardDefault({
  card,
  onAddToCart,
  onCardSelect,
}: VariantCardDefaultProps): Node {
  const { product: config } = useContext(DesignContext);
  const { startingPriceFormatted, samePrice } = getVariantData(card);

  const renderCartButton = (): Node => {
    if (config.enableCart) {
      return (
        <AppButton
          size="s"
          type="cart"
          style={{ margin: 8 }}
          onClick={() => {
            const [variantId] = Object.keys(card.variants_info);
            const variant = card.variants_info[variantId];
            if (variant?.product) {
              onAddToCart(variant.product);
            }
          }}
        >
          Add to cart
        </AppButton>
      );
    }
    return null;
  };

  const renderCardOptions = (): Node => {
    const btnCardCart = renderCartButton();
    if (btnCardCart) {
      return (
        <div style={{ order: 3 }} data-type="flex-horizontal" className="pg-card-section">
          {btnCardCart}
        </div>
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
        imageURL={card.image_url ? `${card.image_url}&width=150&height=200` : ''}
        style={{
          width: 105,
          margin: '8px 0px 0px 8px',
          height: 'calc(100% - 16px)',
          borderRadius: '13px',
        }}
      />
      <div
        data-type="flex-vertical"
        className="pg-card-section"
        style={{ padding: '8px 8px 0px 12px', flexGrow: 1 }}
      >
        <div style={{ order: 0 }} title={card.title} className="pg-card-product-title">
          {card.title}
        </div>
        {startingPriceFormatted && (
          <div
            className="pg-card-product-price"
            data-prefix={samePrice ? '' : 'From '}
            style={{ paddingBottom: 12, fontWeight: 600, order: 1 }}
          >
            {startingPriceFormatted}
          </div>
        )}
        {renderCardOptions()}
      </div>
    </m.div>
  );
}

export default VariantCardDefault;
