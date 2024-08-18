// @flow
import React from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

// $FlowIgnore
import './cardSpace.scss';

type CardSpaceProps = {
  children?: Node,
  selector?: string,
  type?: 'vertical-full' | 'horizontal-full' | 'default',
  shadow?: boolean,
  style?: { [string]: any },
  onClick?: (HTMLDivElement) => void,
};

function CardSpace({
  children, type, style, shadow, selector, onClick,
}: CardSpaceProps): Node {
  return (
    <m.div
      className="card-space"
      data-selector={selector}
      data-shadow={shadow}
      data-type={type}
      style={style}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          e.stopPropagation();
          onClick(e.currentTarget);
        }
      }}
    >
      {children}
    </m.div>
  );
}

CardSpace.defaultProps = {
  type: undefined,
  style: undefined,
  shadow: false,
  selector: 'default',
  onClick: undefined,
  children: null,
};

export default CardSpace;
