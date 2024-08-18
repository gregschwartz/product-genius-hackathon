// @flow
import React from 'react';
import type { Node } from 'react';
import { CardSpace, CardWrapper } from '../CardComponents';

import type { SocialContentCard } from '../../../entities';

type FeedSocialContentCardProps = {
  card: SocialContentCard,
};

function FeedSocialContentCard({ card }: FeedSocialContentCardProps): Node {
  if (card.content_type === 'image') {
    return (
      <CardWrapper
        shadow
        card={card}
        size="auto"
        grid="1x2"
        style={{
          backgroundImage: `url(${card.image_url})`,
          overflow: 'hidden',
        }}
      >
        <CardSpace type="vertical-full">
          <div
            className="pg-card-embedded-content"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: card.caption_html }}
          />
        </CardSpace>
      </CardWrapper>
    );
  }
  if (card.content_type === 'instagram') {
    return (
      <CardWrapper
        card={card}
        size="auto"
        grid="1x2"
        style={{
          backgroundImage: `url(${card.image_url})`,
          overflow: 'hidden',
        }}
      >
        <CardSpace type="vertical-full">
          <iframe
            title={card.id}
            src={card.image_url}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
          />
        </CardSpace>
      </CardWrapper>
    );
  }
  return null;
}

export default FeedSocialContentCard;
