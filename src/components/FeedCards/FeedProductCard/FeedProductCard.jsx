// @flow
import React from 'react';
import type { Node } from 'react';
import { CardWrapper } from '../CardComponents';

import type { AddToCartCB, ProducDetailsCard } from '../../../entities';
import ProductCardSmall from './ProductCardSmall';

type FeedProductCardProps = {
  card: ProducDetailsCard,
  onCardSelect: (card: ProducDetailsCard) => void | Promise<void>,
  onAddToCart: AddToCartCB,
};

function FeedProductCard({
  card,
  onCardSelect,
  onAddToCart,
}: FeedProductCardProps): Node {
  return (
    <CardWrapper
      card={card}
      size="auto"
      grid={card.layout_state || '1x1'}
    >
      <ProductCardSmall
        card={card}
        onAddToCart={onAddToCart}
        onCardSelect={onCardSelect}
      />
    </CardWrapper>
  );
}

export default FeedProductCard;
