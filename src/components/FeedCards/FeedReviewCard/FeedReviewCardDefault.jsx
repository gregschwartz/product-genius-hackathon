// @flow
import React from 'react';
import type { Node } from 'react';

import type { ReviewCardDefault } from '../../../entities';
import { CardSpace, CardWrapper } from '../CardComponents';
import { AppImage, AppRating } from '../../AppComponents';

import ReviewIcon from '../../../assets/icons/pg-review-icon-round.svg';

type FeedReviewCardDefaultProps = {
  card: ReviewCardDefault,
};

function FeedReviewCardDefault({ card }: FeedReviewCardDefaultProps): Node {
  return (
    <CardWrapper
      style={{ overflow: 'hidden' }}
      size="auto"
      card={card}
      grid={card.layout_state || '1x1'}
    >
      <CardSpace
        selector="pg-review-card-1x2-default"
        type="vertical-full"
        style={{
          padding: 18,
          backgroundColor: 'var(--pg-color-bk-feed-card-qa)',
        }}
      >
        <div
          className="pg-card-text"
          style={{
            color: '#000000',
            font: 'var(--pg-font-s)',
            fontWeight: 600,
            paddingBottom: 14,
          }}
        >
          <ReviewIcon
            style={{
              marginRight: 6,
              flexShrink: 0,
              top: 4,
              position: 'relative',
            }}
          />
          Product Reviews
        </div>
        <div className="pg-card-section" style={{ display: 'flex' }}>
          <AppImage
            hover
            imageURL={card.review_info.image_url}
            style={{
              height: 45,
              width: 45,
              marginBottom: 16,
              marginRight: 10,
              borderRadius: 5,
              backgroundColor: '#ffffff',
            }}
          />
          {card.review_info.product_title && (
            <div
              data-selector="pg-review-card-1x2-default-title"
              style={{
                font: 'var(--pg-font-s)',
                color: '#000000',
              }}
            >
              {card.review_info.product_title}
            </div>
          )}
        </div>
        <div
          data-selector="pg-review-card-1x2-default-review"
          style={{
            font: 'var(--pg-font-m)',
            color: '#000000',
            padding: 'var(--pg-padding-card-content-text)',
            background: 'var(--pg-color-bk-feed-card-content)',
            borderRadius: 4,
          }}
        >
          <AppRating
            ratingCount={1}
            ratingValue={card.review_info.stars}
            style={{ paddingBottom: 14 }}
          />
          {`"${card.review_info.review_text}"`}
        </div>
      </CardSpace>
    </CardWrapper>
  );
}

export default FeedReviewCardDefault;
