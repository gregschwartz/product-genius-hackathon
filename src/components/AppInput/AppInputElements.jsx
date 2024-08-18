// @flow
import React, { useRef, useContext } from 'react';
import type { Node } from 'react';

import SearchIcon from '../../assets/icons/facet-chat-search.svg';
import { MobileContext } from '../../context';

// $FlowIgnore
import './appInput.scss';

type InputElementStaticProps = {
  inputValue: string,
  disabled?: boolean,
  onInputValue: (string) => void,
  onSubmitValue: (string) => void,
};

export function InputElementStatic({
  inputValue,
  disabled,
  onInputValue,
  onSubmitValue,
}: InputElementStaticProps): Node {
  const isMobile = useContext(MobileContext);
  const inputRef = useRef<HTMLInputElement|null>(null);

  const handleSubmition = () => {
    const inputValueFormatted = inputValue.trim();
    if (inputValueFormatted) {
      onSubmitValue(inputValueFormatted);
      if (inputRef.current && !isMobile) {
        inputRef.current.focus();
      }
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
    <div className="pg-app-input-wrapper">
      <input
        type="text"
        ref={inputRef}
        value={inputValue}
        className="pg-app-input"
        placeholder="Ask me questions"
        disabled={Boolean(disabled)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmition();
          }
        }}
        onChange={(e) => {
          onInputValue(e.target.value);
        }}
      />
      <button
        type="button"
        className="pg-app-input-suffix"
        onClick={handleSubmition}
      >
        {renderInputSuffix()}
      </button>
    </div>
  );
}

InputElementStatic.defaultProps = {
  disabled: false,
};
