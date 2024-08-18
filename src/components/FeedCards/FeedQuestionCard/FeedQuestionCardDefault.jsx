// @flow
import React from 'react';
import type { Node } from 'react';

import type { QuestionCardDefault } from '../../../entities';
import { CardSpace, CardWrapper } from '../CardComponents';

import QuestionIcon from '../../../assets/icons/pg-q-icon-round.svg';

type FeedQuestionCardDefaultProps = {
  card: QuestionCardDefault,
};

function FeedQuestionCardDefault({ card }: FeedQuestionCardDefaultProps): Node {
  return (
    <CardWrapper
      style={{ overflow: 'hidden' }}
      card={card}
      size="auto"
      grid={card.layout_state || '1x1'}
    >
      <CardSpace
        selector="pg-question-card-1x2-default"
        type="vertical-full"
        style={{
          padding: 18,
          backgroundColor: 'var(--pg-color-bk-feed-card-qa)',
        }}
      >
        <div
          data-selector="pg-question-card-1x2-title"
          style={{
            color: '#000000',
            font: 'var(--pg-font-s)',
            fontWeight: 600,
            paddingBottom: 14,
          }}
        >
          <QuestionIcon
            style={{
              marginRight: 6,
              flexShrink: 0,
              top: 4,
              position: 'relative',
            }}
          />
          {card.title || 'Customer questions'}
        </div>
        <div
          data-selector="pg-question-card-1x2-question"
          style={{
            color: '#000000',
            font: 'var(--pg-font-m)',
            fontWeight: 500,
            paddingBottom: 12,
          }}
        >
          {card.question}
        </div>
        <div
          data-selector="pg-question-card-1x2-answer"
          style={{
            color: 'var(--pg-color-card-qa-text)',
            font: 'var(--pg-font-m)',
            padding: 'var(--pg-padding-card-content-text)',
            background: 'var(--pg-color-bk-feed-card-content)',
            borderRadius: 4,
          }}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: card.answer }}
        />
      </CardSpace>
    </CardWrapper>
  );
}

export default FeedQuestionCardDefault;
