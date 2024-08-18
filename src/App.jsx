// @flow
import React from 'react';
import type { Node } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';

import type { AppProps } from './entities';
import { useCheckScreenWidth } from './hooks';
import { DesignContext, MobileContext, ConfigContext } from './context';
import { getContextConfigProps } from './utils/stateUtils';
import AppViewEmbedded from './components/AppView/AppViewEmbedded';

// $FlowIgnore
import './AppVariables.scss';
// $FlowIgnore
import './App.scss';

/**
 * Renders the client app.
 * @returns {React.Node} Rendered content
 */
function ProductGenius(props: AppProps): Node {
  const { design } = props;
  const isMobile = useCheckScreenWidth(800);
  const contextProps = getContextConfigProps(props);
  return (
    <ConfigContext.Provider value={contextProps}>
      <MobileContext.Provider value={isMobile}>
        <DesignContext.Provider value={design}>
          <LazyMotion features={domAnimation}>
            <AppViewEmbedded />
          </LazyMotion>
        </DesignContext.Provider>
      </MobileContext.Provider>
    </ConfigContext.Provider>
  );
}

export default ProductGenius;
