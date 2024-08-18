// @flow
import React from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

// $FlowIgnore
import './appFooter.scss';

import Applogo from '../AppLogo/AppLogo';

type AppFooterOptionsProps = {
  message?: string,
  logoType: 'dark' | 'light' | 'gray' | 'chat',
};

function AppFooterOptions({ message, logoType }: AppFooterOptionsProps): Node {
  return (
    <a
      href="https://www.productgenius.io"
      rel="noopener noreferrer"
      target="_blank"
      className="portal-feed-url"
    >
      <m.div className="pg-app-footer-options">
        <div className="pg-footer-card-logo">
          <Applogo type={logoType} />
          <span>{message || 'Product Genius'}</span>
        </div>
      </m.div>
    </a>
  );
}

AppFooterOptions.defaultProps = {
  message: 'Product Genius',
};
export default AppFooterOptions;
