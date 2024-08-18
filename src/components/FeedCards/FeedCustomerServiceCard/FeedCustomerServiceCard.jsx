// @flow
import React from 'react';
import type { Node } from 'react';
import { CardSpace, CardWrapper } from '../CardComponents';

import type { CustomerServiceCard } from '../../../entities';
import { convertStrToEmailHTML } from '../../../utils/componentUtils';

import { AppButton } from '../../AppComponents';

type FeedCustomerServiceCardProps = {
  card: CustomerServiceCard,
};

function FeedCustomerServiceCard({ card }: FeedCustomerServiceCardProps): Node {
  return (
    <CardWrapper
      size="auto"
      card={card}
      grid="1x2"
      style={{
        backgroundColor: '#044477',
        overflow: 'hidden',
      }}
    >
      <CardSpace
        type="vertical-full"
        style={{
          padding: '35px 25px 25px 25px',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <CardSpace>
          <div
            style={{ paddingBottom: 16 }}
            className="pg-card-text __title_sm"
          >
            Customer Service
          </div>
          <div style={{ paddingBottom: 14 }} className="pg-card-text __xl">
            {card.title}
          </div>
          <div
            style={{ paddingBottom: 30 }}
            className="pg-card-text __lg"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: convertStrToEmailHTML(card.body),
            }}
          />
        </CardSpace>
        {card.button_text && (
          <AppButton
            size="xl"
            style={{ '--pg-color-bk-btn': '#ffffff', '--pg-color-btn': '#044477' }}
            onClick={() => {
              if (card.action?.type === 'node_click') {
                const targetNode = document.querySelector(
                  card.action.node_selector,
                );
                if (targetNode) {
                  targetNode.click();
                }
              }
            }}
          >
            {card.button_text}
            {' '}
            &#x2192;
          </AppButton>
        )}
      </CardSpace>
    </CardWrapper>
  );
}

export default FeedCustomerServiceCard;
