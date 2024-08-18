// @flow
import React from 'react';
import type { Node } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

import { CardWrapper, CardSpace } from '../CardComponents';
import type { ProductImageCarouselCard } from '../../../entities';

type ProductImageCardProps = {
  card: ProductImageCarouselCard,
};

function FeedProductImageCarouselCard({ card }: ProductImageCardProps): Node {
  return (
    <CardWrapper
      card={card}
      size="medium"
      grid={card.layout_state || '1x2'}
      style={{ overflow: 'hidden', zIndex: 1 }}
    >
      <CardSpace
        type="vertical-full"
        style={{
          backgroundColor: '#FFFFFF',
        }}
      >
        <Carousel
          showThumbs={false}
          showArrows={false}
          showStatus={false}
          preventMovementUntilSwipeScrollTolerance
          swipeScrollTolerance={50}
        >
          {card.image_urls.map((url) => (
            <div
              key={url}
              className="pg-card-product-carousel-img"
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
        </Carousel>
      </CardSpace>
    </CardWrapper>
  );
}

export default FeedProductImageCarouselCard;
