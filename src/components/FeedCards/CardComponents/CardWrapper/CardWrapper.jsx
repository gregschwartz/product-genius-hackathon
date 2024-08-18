// @flow
import React, { useContext, useLayoutEffect, useRef } from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';
import type { FeedCard, CardLayoutState } from '../../../../entities';

// $FlowIgnore
import './cardWrapper.scss';
import { TrackingContext } from '../../../FeedPortal/feedTracker';

type CardWrapperProps = {
  card: FeedCard,
  size: 'small' | 'medium' | 'large' | 'auto' | '1x1',
  children?: Node,
  grid?: CardLayoutState,
  ghost?: boolean,
  shadow?: boolean,
  style?: {
    [string]: string|number,
  },
};

function isMetaCard(card: FeedCard): boolean {
  if (
    card.type === 'skeleton_card'
    && card.type === 'merch_card_video'
    && card.type === 'merch_card_review'
    && card.type === 'merch_card_qa'
  ) {
    return true;
  }
  return false;
}

function CardWrapper({
  children,
  card,
  size,
  grid,
  style,
  ghost,
  shadow,
}: CardWrapperProps): Node {
  const { addTrackingRef, removeTrackingRef } = useContext(TrackingContext);
  const cardRef = useRef(null);

  useLayoutEffect(() => {
    if (!isMetaCard(card) && cardRef.current && addTrackingRef) {
      addTrackingRef(card, cardRef.current);
    }
    return () => {
      if (!isMetaCard(card) && removeTrackingRef) {
        removeTrackingRef(card.id);
      }
    };
  }, [addTrackingRef, removeTrackingRef, card]);

  return (
    <m.div
      ref={cardRef}
      id={card.id}
      className="card-wrapper"
      data-size={size}
      data-grid={grid}
      data-ghost={ghost}
      data-shadow={shadow}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'tween',
        duration: 0.25,
      }}
    >
      <div className="card-wrapper-content">{children}</div>
    </m.div>
  );
}

CardWrapper.defaultProps = {
  children: null,
  shadow: false,
  ghost: false,
  grid: '1x1',
  style: {
    backgroundColor: '',
    backgroundImage: '',
  },
};

export default CardWrapper;
