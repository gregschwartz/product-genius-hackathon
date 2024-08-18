// @flow
import React, { useContext } from 'react';
import type { Node } from 'react';
import { m } from 'framer-motion';

import type { ProductVariantCard, AddToCartCB } from '../../../entities';
import { AppImage } from '../../AppComponents';
import { DesignContext } from '../../../context';
import { stickers, getVariantData, getProductClassName } from '../../../utils/componentUtils';
import ProductCardDetails from './ProductCardDetails';

type VariantCardSmallProps = {
  card: ProductVariantCard,
  onAddToCart: AddToCartCB,
  onCardSelect: (ProductVariantCard, forcePDP?: boolean) => void | Promise<void>,
};

function VariantCardSmall({
  card,
  onAddToCart,
  onCardSelect,
}: VariantCardSmallProps): Node {
  const varaintData = getVariantData(card);
  const { product: config } = useContext(DesignContext);

  const renderProductHighlights = (): Node => {
    if (config.enableHighlights && varaintData.variantProduct) {
      const highlights = varaintData.variantProduct.attributes.filter(
        (attr) => attr.name === 'Usf',
      );
      if (highlights.length !== 0) {
        return (
          <div className="pg-card-product-highlights">
            {highlights.map(({ value }) => (
              <div className="pg-card-product-highlight" key={value}>
                {value}
              </div>
            ))}
          </div>
        );
      }
    }
    return null;
  };
  const renderProductBadge = (): Node => {
    if (!varaintData || !varaintData.variantProduct) return null;
    const attrs = varaintData.attributes;
    const badges = [];
    const postions = [
      {
        top: 5,
        left: 5,
      },
      {
        bottom: 5,
        left: 5,
      },
      {
        top: 5,
        right: 5,
      },
      {
        bottom: 5,
        right: 5,
      },
    ];
    if (attrs.Deals_Hot) {
      const pos = postions.shift();
      badges.push(
        <div
          key="hot"
          className="pg-card-product-badge"
          style={{ ...pos, ...stickers.hot }}
        />,
      );
    }
    if (attrs.Features_USA || attrs['Features_Made in the USA']) {
      const pos = postions.shift();
      badges.push(
        <div
          key="USA"
          className="pg-card-product-badge"
          style={{ ...pos, ...stickers.USA }}
        />,
      );
    }
    if (attrs['Clearance Deals'] || attrs.Deals_Clearance) {
      const pos = postions.shift();
      badges.push(
        <div
          key="clearance"
          className="pg-card-product-badge"
          style={{ ...pos, ...stickers.clearance }}
        />,
      );
    }
    if (badges.length > 0) {
      return badges;
    }
    return null;
  };

  return (
    <m.div
      className={getProductClassName(card.product_recommendation_type)}
      type="1x1"
      onClick={() => {
        onCardSelect(card);
      }}
    >
      <AppImage
        hover
        imageURL={card.image_url ? `${card.image_url}&width=500` : ''}
        imageBadge={renderProductBadge()}
        style={{
          width: '100%',
          height: 'var(--pg-height-card-image-m, 200px)',
          backgroundColor: 'white',
        }}
      />
      {renderProductHighlights()}
      {varaintData?.variantProduct && (
        <ProductCardDetails
          product={varaintData.variantProduct}
          onAddToCart={onAddToCart}
          onViewDetails={() => {
            onCardSelect(card);
          }}
          settings={{
            type: 'variant',
            variantData: varaintData,
            pricePrefix: 'From',
          }}
        />
      )}
    </m.div>
  );
}

export default VariantCardSmall;
