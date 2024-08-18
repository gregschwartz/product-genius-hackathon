// @flow
import React, { useContext } from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

import type { ProductVariantCard, AddToCartCB } from '../../../entities';
import { getVariantData, getProductClassName } from '../../../utils/componentUtils';
import { DesignContext } from '../../../context';
import { AppButton, AppImage } from '../../AppComponents';

type VariantCardLargeProps = {
  card: ProductVariantCard,
  onAddToCart: AddToCartCB,
  onCardSelect: (ProductVariantCard) => void | Promise<void>,
};

function VariantCardLarge({
  card,
  onAddToCart,
  onCardSelect,
}: VariantCardLargeProps): Node {
  const { product: config } = useContext(DesignContext);
  const { startingPriceFormatted, samePrice } = getVariantData(card);

  const renderCartButton = (): Node => {
    if (config.enableCart) {
      return (
        <AppButton
          size="s"
          type="cart"
          style={{ marginRight: 8, flexShrink: 0 }}
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

  return (
    <m.div
      className={getProductClassName(card.product_recommendation_type)}
      onClick={() => {
        onCardSelect(card);
      }}
    >
      <AppImage
        hover
        imageURL={card.image_url ? `${card.image_url}&width=500` : ''}
        style={{
          height: 250,
          width: '100%',
          backgroundColor: 'white',
          transform: 'translateZ(0)',
        }}
      />
      <m.div
        className="pg-card-section"
        style={{ padding: '0px 15px 15px 15px' }}
      >
        <div title={card.title} className="pg-card-product-title">
          {card.title}
        </div>
        {startingPriceFormatted && (
          <div
            className="pg-card-product-price"
            data-prefix={samePrice ? '' : 'From '}
            style={{ padding: '10px 0px' }}
          >
            {startingPriceFormatted}
          </div>
        )}
        {renderCartButton()}
        <AppButton size="s" type="details" bubble style={{ fontWeight: 500 }}>
          See options
        </AppButton>
      </m.div>
    </m.div>
  );
}

export default VariantCardLarge;
