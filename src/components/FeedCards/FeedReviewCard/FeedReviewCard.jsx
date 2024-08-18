// @flow
import React from 'react';
import type { Node } from 'react';
import { CardSpace, CardWrapper } from '../CardComponents';

import type { ReviewCard } from '../../../entities';
import { AppImage, AppRating } from '../../AppComponents';

type FeedReviewCardProps = {
  card: ReviewCard,
};

function FeedReviewCard({ card }: FeedReviewCardProps): Node {
  return (
    <CardWrapper
      size="auto"
      card={card}
      grid={card.layout_state || '1x1'}
      style={{
        background: 'linear-gradient(180deg, #4C2AC0 0%, #66A0D5 100%)',
      }}
    >
      <CardSpace
        selector="pg-review-card-legacy"
        type="vertical-full"
        style={{ padding: 20, alignItems: 'flex-start' }}
      >
        <AppImage
          hover
          imageURL={card.review_info.image_url}
          style={{
            height: 78,
            width: 78,
            marginBottom: 16,
            borderRadius: 15,
            backgroundColor: '#ffffff',
          }}
        />
        <AppRating
          ratingValue={card.review_info.stars}
          ratingCount={1}
          style={{
            transform: 'scale(1.1)',
            transformOrigin: 'left',
            paddingBottom: 14,
          }}
        />
        <div className="pg-card-text __lg">
          {`"${card.review_info.review_text}"`}
        </div>
      </CardSpace>
    </CardWrapper>
  );
}

export default FeedReviewCard;
