// @flow
import React from 'react';
import type { Node } from 'react';
import { m } from 'framer-motion';
import { CardSpace } from '../CardComponents';

import type { MerchCardVideo } from '../../../entities';
import { AppButton } from '../../AppComponents';

type GreetingCardProps = {
  card: MerchCardVideo,
};

function FeedMerchVideoCard({ card }: GreetingCardProps): Node {
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
              108.9deg,
              rgb(223, 119, 0) 11.2%,
              rgb(0, 106, 148) 88.9%
            )`,
          }}
        >
          <div style={{ paddingBottom: 15 }} className="pg-card-text __merch">
            Show relevant videos to NEW shoppers to engage and educate
          </div>
          <div style={{ paddingBottom: 15 }} className="pg-card-text __merch">
            Tell AI where to get videos about your products and brand
          </div>
          <AppButton
            size="full-w"
            type="merchant"
            onClick={() => {
              window.parent.postMessage(
                {
                  type: 'PG_MERCH_CARD_CLICK',
                  card: 'merch_video_card',
                },
                '*',
              );
            }}
          >
            + Videos Source
          </AppButton>
        </CardSpace>
      </div>
    </m.div>
  );
}

export default FeedMerchVideoCard;
