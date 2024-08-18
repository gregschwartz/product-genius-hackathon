// @flow
import React from 'react';
import type { Node } from 'react';
import { CardWrapper } from '../CardComponents';

import type { ProductImageCard } from '../../../entities';
import { AppImage } from '../../AppComponents';

type ProductImageCardProps = {
  card: ProductImageCard,
};

function FeedProductImageCard({ card }: ProductImageCardProps): Node {
  return (
    <CardWrapper
      card={card}
      size="medium"
      grid={card.layout_state || '1x2'}
      style={{ overflow: 'hidden' }}
    >
      <AppImage
        imageURL={card.image_url}
        position={card.image_position}
        style={{
          height: '100%',
          width: '100%',
        }}
      />
    </CardWrapper>
  );
}

export default FeedProductImageCard;
