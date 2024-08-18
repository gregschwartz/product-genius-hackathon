// @flow
import React from 'react';
import type { Node } from 'react';
import { CardSpace, CardWrapper } from '../CardComponents';

import { AppButton } from '../../AppComponents';
import type { FacetValueCard, SuggestionButton } from '../../../entities';

type FeedFacetCardProps = {
  card: FacetValueCard,
  group?: boolean,
  onFacetSelect: (
    feedCard: FacetValueCard,
    facet: SuggestionButton
  ) => void | Promise<void>,
};

function FeedFacetCard({
  card,
  group,
  onFacetSelect,
}: FeedFacetCardProps): Node {
  const renderFacets = () => {
    const { facet_value_buttons: facets } = card;
    return facets.map((facetTag, index) => {
      if (facetTag.type === 'suggestion' && facetTag.label) {
        if (facetTag.payload.type === 'new_facet_constraint') {
          return (
            <AppButton
              key={`${facetTag.id}-${index + 1}`}
              shadow
              size="m"
              style={{
                '--pg-color-bk-btn': '#ffffff',
                '--pg-color-btn': '#000000',
              }}
              onClick={() => {
                onFacetSelect(card, facetTag);
              }}
            >
              {facetTag.label}
              <span style={{ paddingLeft: 6 }}>&#x2192;</span>
            </AppButton>
          );
        }
      }
      return null;
    });
  };

  const renderTitle = (): Node => {
    if (group) {
      if (card.title) {
        return (
          <div
            className="pg-card-facet-title"
            style={{
              paddingBottom: 12,
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            {card.title}
          </div>
        );
      }
      const { facet_value_buttons: facets } = card;
      const [facet] = facets;
      if (facet?.payload?.type === 'new_facet_constraint' && facet?.payload?.facet) {
        return (
          <div
            className="pg-card-facet-title"
            style={{
              paddingBottom: 12,
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            {facet.payload.facet}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <CardWrapper
      card={card}
      size="auto"
      grid="1x2"
      style={{
        backgroundColor: '#f5f5f5',
        boxShadow: 'none',
        borderTop: 0,
        borderRight: 0,
      }}
    >
      <CardSpace type="vertical-full" style={{ padding: '14px' }}>
        {renderTitle()}
        <CardSpace
          style={{
            gap: '7px',
            display: 'inline-flex',
            flexWrap: 'wrap',
          }}
        >
          {renderFacets()}
        </CardSpace>
      </CardSpace>
    </CardWrapper>
  );
}

FeedFacetCard.defaultProps = {
  group: false,
};

export default FeedFacetCard;
