// @flow
import React from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

type AppEmbeddedWrapperProps = {|
  children: Node,
|};

/**
 * Renders embedded PG app wrapper component.
 * @returns {React.Node} Rendered content
 */
function AppEmbeddedWrapper({ children }: AppEmbeddedWrapperProps): Node {
  return (
    <m.div
      className="pg-embedded"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        type: 'tween',
        duration: 0.3,
      }}
    >
      {children}
    </m.div>
  );
}

export default AppEmbeddedWrapper;
