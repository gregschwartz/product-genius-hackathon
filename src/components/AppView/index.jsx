// @flow
import React from 'react';
import type { Node } from 'react';

import AppViewEmbedded from './AppViewEmbedded';

/**
 * Renders PG app-view wrapper component.
 * @returns {React.Node} Rendered content
 */
function AppView(): Node {
  return <AppViewEmbedded />;
}

export default AppView;
