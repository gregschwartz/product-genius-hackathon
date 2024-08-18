// @flow
import React from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

// $FlowIgnore
import './appButton.scss';

type AppButtonProps = {
  children: Node | null,
  bubble?: boolean,
  disabled?: boolean,
  type?: 'default' | 'cart' | 'reorder' | 'details' | 'border' | 'ghost' | 'buy-now' | 'merchant',
  size?: 'xs' |'s' | 'm' | 'l' | 'xl' | 'xxl' | 'full-w',
  shadow?: boolean,
  style?: { [string]: any },
  onClick?: () => void | Promise<void>,
};

function AppButton({
  children,
  bubble,
  type,
  size,
  shadow,
  style,
  disabled,
  onClick,
}: AppButtonProps): Node {
  if (!children) return null;
  return (
    <m.button
      data-size={size}
      data-shadow={shadow}
      data-type={type}
      className="pg-app-btn"
      style={style}
      disabled={disabled}
      onClick={(e) => {
        if (!bubble) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (onClick) {
          onClick();
        }
      }}
    >
      {children}
    </m.button>
  );
}

AppButton.defaultProps = {
  size: 'm',
  type: 'default',
  bubble: false,
  disabled: false,
  shadow: false,
  style: undefined,
  onClick: undefined,
};

export default AppButton;
