// @flow
import React from 'react';
import type { Node } from 'react';
import { CardSpace, CardWrapper } from '../CardComponents';

import { AppReveal } from '../../AppComponents';

import type { QuestionRevealCard } from '../../../entities';

type FeedQuestionCardProps = {
  card: QuestionRevealCard,
};

function FeedQuestionCard({ card }: FeedQuestionCardProps): Node {
  return (
    <CardWrapper
      card={card}
      size="auto"
      grid="1x2"
      style={{
        background: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <CardSpace
        type="vertical-full"
        style={{
          padding: '24px 22px 8px 22px',
          cursor: 'pointer',
        }}
      >
        <div
          className="pg-card-text"
          style={{
            paddingBottom: 12,
            color: '#272727',
            fontWeight: 600,
            fontSize: 20,
          }}
        >
          {card.title}
        </div>
        {card.questions.map((entry, index) => (
          <AppReveal
            key={entry.question}
            type={index + 1 === card.questions.length ? 'ghost' : 'default'}
            title={(
              <div
                className="pg-card-text"
                style={{
                  color: '#000000',
                  fontSize: 17,
                  fontWeight: 500,
                }}
              >
                {entry.question}
              </div>
            )}
          >
            <div
              className="pg-card-text"
              style={{ color: '#676767', fontSize: 16 }}
            >
              {entry.answer}
            </div>
          </AppReveal>
        ))}
      </CardSpace>
    </CardWrapper>
  );
}

export default FeedQuestionCard;
