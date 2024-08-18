// @flow
import React, { useState } from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

// $FlowIgnore
import './appReveal.scss';

type AppRevealProps = {
  title: string | Node,
  children: Node | null,
  type?: 'default' | 'ghost',
  initialState?: boolean,
  size?: 'xs' |'s' | 'm' | 'l' | 'xl' | 'xxl',
  style?: { [string]: any },
}

function AppReveal({
  title,
  children,
  type,
  initialState,
  size,
  style,
}: AppRevealProps): Node {
  const [open, setOpen] = useState(initialState);
  return (
    <m.div
      data-size={size}
      data-open={open}
      data-type={type}
      className="pg-app-reveal"
      style={style}
    >
      <m.div
        className="pg-app-reveal-title"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        {title}
      </m.div>
      {open && (
        <m.div className="pg-app-reveal-content">{children}</m.div>
      )}
    </m.div>
  );
}

AppReveal.defaultProps = {
  size: 'm',
  type: 'default',
  initialState: false,
  style: undefined,
};

export default AppReveal;
