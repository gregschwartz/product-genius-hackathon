// @flow
import React from 'react';
import type { Node } from 'react';
import { CardSpace, CardWrapper } from '../CardComponents';

import type { CouponCard } from '../../../entities';

import { AppButton } from '../../AppComponents';

type FeedCouponCardProps = {
  card: CouponCard,
  onAddCoupon: (card: CouponCard) => void | Promise<void>,
};

function FeedCouponCard({ card, onAddCoupon }: FeedCouponCardProps): Node {
  return (
    <CardWrapper
      card={card}
      size="auto"
      grid="1x2"
      style={{
        backgroundImage: `url(${card.image_url || ''})`,
        backgroundColor: '#044477',
        overflow: 'hidden',
      }}
    >
      <CardSpace
        type="vertical-full"
        style={{
          padding: '70px 25px 50px 25px',
          textAlign: 'center',
          alignItems: 'center',
        }}
      >
        {card.coupon_info.title && (
          <div
            style={{
              fontSize: 41,
              fontWeight: 300,
              paddingBottom: 14,
              lineHeight: '41px',
              letterSpacing: '-0.07em',
              textRendering: 'geometricPrecision',
            }}
            className="pg-card-text"
          >
            {card.coupon_info.title}
          </div>
        )}
        {card.coupon_info.description && (
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              paddingBottom: 30,
              lineHeight: '19px',
              letterSpacing: '-0.024em',
              textRendering: 'geometricPrecision',
            }}
            className="pg-card-text"
          >
            {card.coupon_info.description}
          </div>
        )}
        <AppButton
          size="l"
          style={{
            '--pg-color-bk-btn': '#ffffff',
            '--pg-color-btn': '#000000',
            mixBlendMode: 'screen',
          }}
          onClick={() => {
            onAddCoupon(card);
          }}
        >
          Apply Coupon
        </AppButton>
      </CardSpace>
    </CardWrapper>
  );
}

export default FeedCouponCard;
