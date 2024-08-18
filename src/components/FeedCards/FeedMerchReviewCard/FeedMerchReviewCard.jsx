// @flow
import React from 'react';
import type { Node } from 'react';
import { m } from 'framer-motion';
import { CardSpace } from '../CardComponents';

import type { MerchCardReview } from '../../../entities';
import { AppButton } from '../../AppComponents';

type GreetingCardProps = {
  card: MerchCardReview,
};

function FeedMerchReviewCard({ card }: GreetingCardProps): Node {
  return (
    <m.div
      id={card.id}
      className="merch-card-wrapper"
      data-size="auto"
      data-grid="1x1"
      style={{ minHeight: '250px' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'tween',
        duration: 0.25,
      }}
    >
      <div className="merch-card-wrapper-content">
        <CardSpace
          type="vertical-full"
          style={{
            padding: '25px 15px 15px 15px',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'center',
            backgroundImage: `linear-gradient(
              220.9deg,
              rgb(223, 129, 0) 11.2%,
              rgb(00, 56, 148) 88.9%
            )`,
          }}
        >
          <div style={{ paddingBottom: 15 }} className="pg-card-text __merch">
            Impactful reviews in this feed build shopper trust
          </div>
          <div style={{ paddingBottom: 15 }} className="pg-card-text __merch">
            Tell AI where to get your reviews
          </div>
          <AppButton
            size="full-w"
            type="merchant"
            onClick={() => {
              window.parent.postMessage(
                {
                  type: 'PG_MERCH_CARD_CLICK',
                  card: 'merch_review_card',
                },
                '*',
              );
            }}
          >
            + URL Reviews
          </AppButton>
        </CardSpace>
      </div>
    </m.div>
  );
}

export default FeedMerchReviewCard;
