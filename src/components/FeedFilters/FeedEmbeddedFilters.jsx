// @flow
import React from 'react';
import { m } from 'framer-motion';
import { v4 as uuid } from 'uuid';
import { createPortal } from 'react-dom';
import type { Node } from 'react';

import type {
  CardFeedState,
  FacetValueCard,
  SuggestionButton,
} from '../../entities';
import type { ChatController } from '../../ChatController';

import { FeedFacetCard } from '../FeedCards';

// $FlowIgnore
import './feedFilters.scss';
import { useShowFilterOptions } from '../../hooks';

type FeedEmbeddedFiltersProps = {
  feed: CardFeedState,
  controller: ChatController,
};

/**
 * Renders PG embedded filters component
 * @returns {React.Node} Rendered content
 */
function FeedEmbeddedFilters({
  feed,
  controller,
}: FeedEmbeddedFiltersProps): Node {
  const { feedId, feedCards } = feed;
  const { visible, filterCards } = useShowFilterOptions(feedCards);
  if (!visible) return null;

  const onFacetSelect = (feedCard: FacetValueCard, facet: SuggestionButton) => {
    if (facet.payload.type === 'new_facet_constraint') {
      const payload = {
        id: uuid(),
        type: 'visitor_button_click',
        payload: facet.payload,
        action_language: 'get_cards',
        source: {
          message_id: feedId,
          card_id: feedCard.id,
          button_id: facet.id,
        },
      };
      controller.analytics.track('suggestion card selected', {
        messageId: feedId,
        facet: JSON.parse(JSON.stringify(facet)),
        feedCard: JSON.parse(JSON.stringify(feedCard)),
      });
      controller.sendVisitorMessage(payload, 'button');
    }
  };

  const feedPortal = document.querySelector('.pg-portal-wrapper');
  if (feedPortal) {
    const allFacetValueCard = filterCards.find((card) => card.id.startsWith('AllFacetValueCard'));
    if (allFacetValueCard) {
      return createPortal(
        <m.div className="feed-embedded-filters">
          <FeedFacetCard
            group
            key={allFacetValueCard.id}
            card={allFacetValueCard}
            onFacetSelect={onFacetSelect}
          />
        </m.div>,
        feedPortal,
      );
    }
    return createPortal(
      <m.div className="feed-embedded-filters">
        {filterCards.map((card) => {
          if (card.type === 'facet_value_card') {
            return (
              <FeedFacetCard
                group
                key={card.id}
                card={card}
                onFacetSelect={onFacetSelect}
              />
            );
          }
          return null;
        })}
      </m.div>,
      feedPortal,
    );
  }
}

export default FeedEmbeddedFilters;
