// @flow
import React from 'react';
import type { Node } from 'react';
import { m } from 'framer-motion';

// $FlowIgnore
import './banner.scss';
import AppMinimizeButton from '../AppMinimize/AppMinimizeButton';
import { RenderingContext } from '../../hooks';

type AppBannerWrapperProps = {
  offset?: number,
  children: Node,
  style?: {[string]: any},
  onCloseBanner: () => void,
};

function AppBannerWrapper({
  offset,
  children,
  style,
  onCloseBanner,
}: AppBannerWrapperProps): Node {
  const offVal = offset || 0;
  return (
    <RenderingContext contextKey="feedBanner">
      <m.div
        className="pg-banner"
        style={style}
        initial={{ opacity: 0, y: offVal + 10 }}
        exit={{ opacity: 0, y: offVal + 20 }}
        animate={{ opacity: 1, y: offVal }}
        transition={{
          type: 'tween',
          duration: 0.25,
        }}
      >
        {children}
        <AppMinimizeButton
          style={{
            top: -18,
            right: 6,
            height: 33,
            width: 33,
            fontSize: 18,
          }}
          onMinimize={() => {
            onCloseBanner();
          }}
        />
      </m.div>
    </RenderingContext>
  );
}

AppBannerWrapper.defaultProps = {
  style: undefined,
  offset: 0,
};

export default AppBannerWrapper;
