import React from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

import type { ProductReviewInfo } from '../../../entities';

type ProductCardReviewProps = {
  review: ProductReviewInfo,
};

function ProductCardReview({ review }: ProductCardReviewProps): Node {
  return (
    <m.div
      style={{
        height: 200,
        width: '100%',
        position: 'absolute',
        display: 'flex',
        justifyContent: 'flex-end',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,1) 45%, rgba(255,255,255,1) 100%)',
        backgroundRepeat: 'no-repeat',
        backgroundPositionY: 'bottom',
        padding: 8,
        opacity: 0,
        borderRadius: 'var(--pg-border-radius-card, 18px)',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottom: '1px solid #EAEAEA',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div
        style={{ fontStyle: 'italic', color: '#555555' }}
        className="pg-card-product-review"
      >
        {`"${review.review_text}"`}
      </div>
      <div
        className="pg-card-product-review"
        style={{
          fontSize: 12,
          paddingTop: 8,
          fontWeight: 700,
          textRendering: 'geometricPrecision',
        }}
      >
        - Verified
        {review.stars && (
          <span style={{ paddingLeft: 5, color: '#959595', fontWeight: 600 }}>
            {review.stars}
            {' '}
            / 5 stars
          </span>
        )}
      </div>
    </m.div>
  );
}

export default ProductCardReview;
