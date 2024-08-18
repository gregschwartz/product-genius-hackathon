// @flow
import React from 'react';
import type { Node } from 'react';
import { CardSpace, CardWrapper } from '../CardComponents';

import type { IntroductionCard } from '../../../entities';

type GreetingCardProps = {
  card: IntroductionCard,
};

function FeedGreetingCard({ card }: GreetingCardProps): Node {
  return (
    <CardWrapper
      card={card}
      size="auto"
      ghost
      grid={card.layout_state || '1x2'}
      style={{ minHeight: 40 }}
    >
      <CardSpace
        type="vertical-full"
        style={{
          padding: '0px 10px 10px 10px',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{ color: '#4d4d4d', paddingBottom: 20, paddingTop: 20 }}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: card.introduction_info.headline }}
          className="pg-card-text __xl"
        />
        <div
          style={{ color: '#4d4d4d', fontWeight: '500' }}
          className="pg-card-text __md_bold"
        >
          {card.introduction_info.subtitle}
        </div>
      </CardSpace>
    </CardWrapper>
  );
}

export default FeedGreetingCard;
