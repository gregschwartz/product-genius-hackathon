// @flow
import React, { useContext } from 'react';
import type { Node } from 'react';

import { ConfigContext, DesignContext } from '../../context';
import { useCardFeedController } from '../../controllers/FeedController/feedControllerHook';
import FeedPortal from '../FeedPortal/FeedPortal';
import AppEmbeddedWrapper from './AppEmbeddedWrapper';
import AppMenuBar from '../AppMenuBar/AppMenuBar';
import AppActions from '../AppActions/AppActions';
import AppOverlay from '../AppOverlay/AppOverlay';
import { useSourceTracker } from '../AppTracking/sourceTracker';
import FeedEmbeddedFilters from '../FeedFilters/FeedEmbeddedFilters';

/**
 * Renders PG "embedded" app view.
 * @returns {React.Node} Rendered content
 */
function AppViewEmbedded(): Node {
  const appConfig = useContext(ConfigContext);
  const design = useContext(DesignContext);
  const { controller, state } = useCardFeedController(appConfig);
  useSourceTracker({
    enabled: design.tracking.source.enabled,
    rules: design.tracking.source.rules,
    analytics: controller.analytics,
  });

  return (
    <AppEmbeddedWrapper>
      <FeedEmbeddedFilters feed={state.feed} controller={controller} />
      <AppMenuBar state={state} controller={controller} />
      <FeedPortal state={state} controller={controller} />
      <AppOverlay state={state} controller={controller} />
      <AppActions state={state} controller={controller} />
    </AppEmbeddedWrapper>
  );
}

export default AppViewEmbedded;
