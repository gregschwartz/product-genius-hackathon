// @flow
import React, { useState } from 'react';
import type { Node } from 'react';
import { CardSpace, CardWrapper } from '../CardComponents';

import type { TextInputCard } from '../../../entities';

import SearchIcon from '../../../assets/icons/facet-chat-search.svg';

type FeedTextInputCardProps = {
  card: TextInputCard,
  onCardInputSubmit: (
    feedCard: TextInputCard,
    inputValue: string
  ) => void | Promise<void>,
};

function FeedTextInputCard({
  card,
  onCardInputSubmit,
}: FeedTextInputCardProps): Node {
  const [inputValue, setInputValue] = useState('');

  const handleSubmition = () => {
    const inputValueFormatted = inputValue.trim();
    if (inputValueFormatted) {
      onCardInputSubmit(card, inputValueFormatted);
      setInputValue('');
    }
  };

  const renderInputSuffix = () => {
    if (inputValue.trim().length !== 0) {
      return (
        <div key="suffix-send" className="input-suffix-send">
          &#8593;
        </div>
      );
    }
    return (
      <div key="suffix-search" className="input-suffix-search">
        <SearchIcon />
      </div>
    );
  };

  return (
    <CardWrapper
      size="auto"
      card={card}
      grid="1x2"
      style={{
        backgroundColor: '#66bbff',
      }}
    >
      <CardSpace
        type="vertical-full"
        style={{
          padding: '18px 20px',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <CardSpace>
          <div
            style={{ paddingBottom: 14 }}
            className="pg-card-text __title_sm"
          >
            Find the perfect product:
          </div>
        </CardSpace>
        <div className="pg-card-input-wrapper">
          <input
            type="text"
            value={inputValue}
            className="pg-card-input"
            placeholder="Find anything..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmition();
              }
            }}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
          />
          <button
            type="button"
            className="pg-card-input-suffix"
            onClick={handleSubmition}
          >
            {renderInputSuffix()}
          </button>
        </div>
      </CardSpace>
    </CardWrapper>
  );
}

export default FeedTextInputCard;
