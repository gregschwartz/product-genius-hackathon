// @flow
import React, { useState } from 'react';
import type { Node } from 'react';

import type { ProductVariantCard, AddToCartCB } from '../../../entities';
import { CardWrapper, CardSpace } from '../CardComponents';
import { getVariantPropData } from '../../../utils/componentUtils';
import { AppButton } from '../../AppComponents';

type FeedProductVariantCardProps = {
  card: ProductVariantCard,
  onAddToCart: AddToCartCB,
};

function FeedProductVariantCard({
  card,
  onAddToCart,
}: FeedProductVariantCardProps): Node {
  const [selectedVariant, setSelectedVariant] = useState('');
  const {
    properties,
    selectedPriceFormatted,
    selectedProduct,
  } = getVariantPropData(card.variants_info, selectedVariant);

  const renderVariantTitle = (): Node => {
    if (selectedProduct) {
      return (
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            lineHeight: '20px',
            color: '#000000',
            padding: '8px 6px',
          }}
          className="pg-card-text"
        >
          {selectedProduct.title}
        </div>
      );
    }
    if (card.title) {
      return (
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            lineHeight: '20px',
            color: '#000000',
            padding: '8px 6px',
          }}
          className="pg-card-text"
        >
          {card.title}
        </div>
      );
    }
    return null;
  };

  const renderVariantPrice = (): Node => {
    if (selectedPriceFormatted) {
      return (
        <>
          <div style={{ paddingLeft: 6 }} className="pg-card-product-price">
            {selectedPriceFormatted}
          </div>
          <AppButton
            size="m"
            type="cart"
            style={{ marginRight: 10, flexShrink: 0 }}
            onClick={() => {
              if (selectedVariant) {
                if (card.variants_info[selectedVariant]) {
                  onAddToCart(card.variants_info[selectedVariant].product);
                }
              }
            }}
          >
            Add to cart
          </AppButton>
        </>
      );
    }
    return null;
  };

  return (
    <CardWrapper
      card={card}
      size="auto"
      grid={card.layout_state || '1x2'}
      style={{ overflow: 'hidden', zIndex: 1 }}
    >
      <CardSpace
        type="vertical-full"
        style={{
          backgroundColor: '#FFFFFF',
          padding: 12,
        }}
      >
        <CardSpace type="horizontal-full" style={{ paddingBottom: 14 }}>
          {renderVariantTitle()}
        </CardSpace>
        <CardSpace
          style={{
            gap: '7px',
            display: 'inline-flex',
            flexWrap: 'wrap',
            paddingBottom: 12,
          }}
        >
          {properties.map((entry) => (
            <button
              type="button"
              key={entry.variantId}
              data-selected={selectedVariant === entry.variantId}
              className="pg-card-tag"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setSelectedVariant(entry.variantId);
              }}
            >
              {entry.prop}
            </button>
          ))}
        </CardSpace>
        <CardSpace
          type="horizontal-full"
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {renderVariantPrice()}
        </CardSpace>
      </CardSpace>
    </CardWrapper>
  );
}

export default FeedProductVariantCard;
