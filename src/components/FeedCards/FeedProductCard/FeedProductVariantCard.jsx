// @flow
import React from 'react';
import type { Node } from 'react';

import type { ProductVariantCard, AddToCartCB } from '../../../entities';
import { CardWrapper } from '../CardComponents';
import VariantCardSmall from './VariantCardSmall';
import VariantCardLarge from './VariantCardLarge';

type FeedProductVariantCardProps = {
  card: ProductVariantCard,
  onAddToCart: AddToCartCB,
  onCardSelect: (card: ProductVariantCard) => void | Promise<void>,
};

function FeedProductVariantCard({
  card,
  onAddToCart,
  onCardSelect,
}: FeedProductVariantCardProps): Node {
  if (card.layout_state === '2x2') {
    return (
      <CardWrapper
        card={card}
        size="auto"
        grid="1x2"
        style={{ overflow: 'hidden' }}
      >
        <VariantCardLarge
          card={card}
          onAddToCart={onAddToCart}
          onCardSelect={onCardSelect}
        />
      </CardWrapper>
    );
  }

  return (
    <CardWrapper card={card} size="auto" grid="1x1">
      <VariantCardSmall
        card={card}
        onAddToCart={onAddToCart}
        onCardSelect={onCardSelect}
      />
    </CardWrapper>
  );
}

export default FeedProductVariantCard;
