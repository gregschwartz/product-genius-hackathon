// @flow
import React from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

// $FlowIgnore
import './appMinimize.scss';

type AppMinimizeButtonProps = {
  style: { [string]: any },
  onMinimize: () => void | Promise<void>,
};

const defaultTransition = {
  type: 'tween',
  duration: 0.2,
  delay: 0,
};
function AppMinimizeButton({
  style,
  onMinimize,
}: AppMinimizeButtonProps): Node {
  return (
    <m.button
      title="close"
      type="button"
      className="pg-minimize-btn"
      style={style}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={defaultTransition}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onMinimize();
      }}
    >
      &#x2715;
    </m.button>
  );
}

export default AppMinimizeButton;
