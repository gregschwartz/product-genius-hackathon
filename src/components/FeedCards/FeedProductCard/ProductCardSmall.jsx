// @flow
import React, {
  useContext, useLayoutEffect, useRef, useState,
} from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

import type { AddToCartCB, ProducDetailsCard } from '../../../entities';
import {
  stickers,
  getProductAttributes,
  loadBackupProductImage,
  getProductClassName,
} from '../../../utils/componentUtils';
import { DesignContext, MobileContext } from '../../../context';
import { feedRevealTracker } from '../../FeedPortal/feedTracker';
import { AppImage } from '../../AppComponents';
import ProductCardReview from './ProductCardReview';
import ProductCardDetails from './ProductCardDetails';

type ProductCardSmallProps = {
  card: ProducDetailsCard,
  onAddToCart: AddToCartCB,
  onCardSelect: (card: ProducDetailsCard) => void | Promise<void>,
};

function ProductCardSmall({
  card,
  onAddToCart,
  onCardSelect,
}: ProductCardSmallProps): Node {
  const cardRef = useRef(null);
  const [showReview, setShowReview] = useState(false);
  const isMobile = useContext(MobileContext);
  const { product: config } = useContext(DesignContext);
  const { product, product_recommendation_type: recType, review_info: review } = card;
  const desktopEmbedded = !isMobile;
  const reviewEnabled = !!review && isMobile;
  const attrs = getProductAttributes(product.attributes);

  useLayoutEffect(() => {
    const { current: element } = cardRef;
    if (element && reviewEnabled) {
      const callback = (visible: boolean) => {
        setShowReview(visible);
      };
      feedRevealTracker.on(element.id, callback);
      feedRevealTracker.observe(element);
    }
    return () => {
      if (element && reviewEnabled) {
        feedRevealTracker.unobserve(element);
      }
    };
  }, [reviewEnabled]);

  const renderProductBadge = (): Node => {
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
  const renderProductReview = (): Node => {
    if (review && showReview) {
      return <ProductCardReview review={review} />;
    }
    return null;
  };
  const renderProductHighlights = (): Node => {
    if (config.enableHighlights && attrs.Usf) {
      const highlights = product.attributes.filter(
        (attr) => (attr.name === 'Usf' || attr.name === 'usf'),
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

  return (
    <m.div
      ref={cardRef}
      id={card.id}
      type="1x1"
      className={getProductClassName(recType)}
      onClick={() => {
        onCardSelect(card);
      }}
      onHoverStart={() => {
        if (desktopEmbedded && !!review) {
          setShowReview(true);
        }
      }}
      onHoverEnd={() => {
        if (desktopEmbedded && !!review) {
          setShowReview(false);
        }
      }}
    >
      <AppImage
        hover
        dynamic
        imageURL={product.image_url || ''}
        imageBadge={renderProductBadge()}
        style={{
          width: '100%',
          height: 'var(--pg-height-card-image-m, 200px)',
          backgroundColor: 'white',
        }}
        onError={(element) => {
          if (config.enableBackupImage) {
            loadBackupProductImage(product, element);
          }
        }}
      />
      {renderProductReview()}
      {renderProductHighlights()}
      <ProductCardDetails product={product} onAddToCart={onAddToCart} />
    </m.div>
  );
}

export default ProductCardSmall;
