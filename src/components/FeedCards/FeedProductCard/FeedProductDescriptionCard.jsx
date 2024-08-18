// @flow
import React, { useState } from 'react';
import type { Node } from 'react';
import { CardSpace, CardWrapper } from '../CardComponents';

import type { ProductDescriptionCard } from '../../../entities';

import { AppButton } from '../../AppComponents';

type ProductDescriptionCardProps = {
  card: ProductDescriptionCard,
};

function FeedProductDescriptionCard({
  card,
}: ProductDescriptionCardProps): Node {
  const [expanded, setExpanded] = useState(false);
  return (
    <CardWrapper
      card={card}
      size="auto"
      grid={card.layout_state || '1x2'}
      style={{ overflow: 'hidden' }}
    >
      <CardSpace
        type="vertical-full"
        style={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          padding: '20px 20px 12px 20px',
        }}
      >
        <CardSpace
          shadow={!expanded}
          style={{
            width: '100%',
            marginBottom: 20,
            maxHeight: !expanded ? '180px' : '100%',
          }}
        >
          <div
            style={{ paddingBottom: 20, color: '#262626' }}
            className="pg-card-text __title"
          >
            {card.title}
          </div>
          <div
            className="pg-card-text __description"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: card.description }}
          />
        </CardSpace>
        {card.description && (
          <AppButton
            size="xs"
            type="details"
            onClick={() => {
              setExpanded((prev) => !prev);
            }}
          >
            {`Read ${!expanded ? 'more' : 'less'}`}
          </AppButton>
        )}
      </CardSpace>
    </CardWrapper>
  );
}

export default FeedProductDescriptionCard;
