// @flow
import React from 'react';
import { createRoot } from 'react-dom/client';

import { type Analytics, RealAnalytics } from './analytics';
import App from './App';
import type { AppConfig, DispatchCommand } from './entities';
import { getDesignConfig, setStorageFlags } from './utils/stateUtils';
import { SourceTracker } from './components/AppTracking/sourceTracker';

// $FlowIgnore
import './index.scss';

const pgContainer = document.createElement('div');
pgContainer.classList.add('gamalon-app');
let root = null;

let analytics: ?Analytics;
let savedConfig: ?AppConfig;

// Renders the root App component (or re-renders it with updated config).
function renderApp() {
  if (!analytics || !savedConfig || !root) {
    return;
  }
  const designConfig = getDesignConfig(savedConfig);
  setStorageFlags(designConfig);
  if (analytics && savedConfig && root) {
    root.render(
      <App
        organizationId={savedConfig.organizationId}
        socketURL={savedConfig.socketURL}
        design={designConfig}
        analytics={analytics}
        serverBehavior={savedConfig.serverBehavior}
      />,
    );
  }
}

function renderSourceTr() {
  if (analytics && savedConfig) {
    const designConfig = getDesignConfig(savedConfig);
    if (
      designConfig.tracking.source.enabled
      && designConfig.tracking.source.rules.length !== 0
    ) {
      if (!root) {
        const trContainer = document.createElement('div');
        root = createRoot(trContainer);
        if (document.body) {
          document.body.appendChild(trContainer);
        }
      }
      if (root && analytics) {
        root.render(
          <SourceTracker
            enabled
            rules={designConfig.tracking.source.rules}
            analytics={analytics}
          />,
        );
      }
    }
  }
}

function appendPgStylesheet(styleId: string, styleStr: string) {
  const styleNode = document.getElementById(styleId);
  if (styleNode && styleNode.parentNode) {
    styleNode.parentNode.removeChild(styleNode);
  }
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.setAttribute('id', styleId);
  // $FlowIgnore
  styleSheet.innerText = styleStr;
  if (document.head) {
    document.head.appendChild(styleSheet);
  }
}

function updatePgStylesheet(styleId: string, styleStr: string) {
  const styleNode = document.getElementById(styleId);
  if (styleNode) {
    // $FlowIgnore
    styleNode.innerText = styleStr;
  } else {
    appendPgStylesheet(styleId, styleStr);
  }
}

function setupPgStylePreviewBridge() {
  window.addEventListener('message', (event) => {
    if (event.data.type === 'PG_MERCH_SET_STYLES') {
      const { payload } = event.data;
      if (payload && payload.styles) {
        updatePgStylesheet('pg-stylesheet-merchant', payload.styles);
      }
    }
  });
}

if (!window.GAMALON) {
  window.GAMALON = {
    destroy: () => {},
    init: (config: AppConfig) => { console.log(config); },
    dispatch: (command: DispatchCommand) => { console.log(command); },
    pgInitialized: false,
  };
}

window.GAMALON.init = async (config: AppConfig): any => {
  if (!config.organizationId) {
    console.error('Configuration missing organization ID');
    return;
  }
  if (window.GAMALON.pgInitialized) {
    console.log('pg already init');
    return;
  }
  window.GAMALON.pgInitialized = true;

  savedConfig = config;
  analytics = new RealAnalytics(config);
  await analytics.init();
  if (!analytics?.appEnabled()) {
    renderSourceTr();
    return;
  }
  if (config.design?.allowedPagePatterns) {
    const { allowedPagePatterns } = config.design;
    if (allowedPagePatterns.length !== 0) {
      const { pathname, search, hash } = window.location;
      const urlTail = pathname + search + hash;
      if (!allowedPagePatterns.some((pattern) => new RegExp(pattern).test(urlTail))) {
        renderSourceTr();
        return;
      }
    }
  }

  let targetNode: ?HTMLBodyElement | HTMLElement = document.body;
  if (config.container) {
    targetNode = null;
    if (typeof config.container === 'string') {
      const containerNode = document.querySelector(config.container);
      if (containerNode) {
        targetNode = containerNode;
      }
    } else if (Array.isArray(config.container)) {
      for (let i = 0; i < config.container.length; i += 1) {
        const containerNode = document.querySelector(config.container[i]);
        if (containerNode) {
          targetNode = containerNode;
          break;
        }
      }
    } else {
      targetNode = config.container;
    }
    if (targetNode) {
      if (config.design?.container?.style) {
        targetNode.setAttribute('style', config.design.container.style);
      }
    } else {
      return;
    }
  }
  if (!root) {
    root = createRoot(pgContainer);
  }
  // Renders the React app
  if (targetNode) {
    targetNode.appendChild(pgContainer);
    window.postMessage({ gamalon: { startedLoading: true } });
    renderApp();
    analytics?.track('bot loaded', { timestamp: Date.now() });
    if (config.design?.style?.global) {
      appendPgStylesheet('pg-stylesheet-global', config.design.style.global);
    }
    if (config.design?.style?.merchant) {
      appendPgStylesheet('pg-stylesheet-merchant', config.design.style.merchant);
    }
    if (config.design?.merchant?.mode === 'preview') {
      setupPgStylePreviewBridge();
    }
  }
};

/**
 * Un-renders the PG and returns all global state to its original values, just
 * like before window.GAMALON.init() was called. After this you should be able
 * to call window.GAMALON.init() again with any valid configuration, and have
 * it work just like it would have immediately after loading this program.
 */
window.GAMALON.destroy = () => {
  if (root) {
    root.unmount();
    analytics = undefined;
    savedConfig = undefined;
    const container = pgContainer.parentNode;
    if (container) {
      container.removeChild(pgContainer);
    }
    root = null;
    window.GAMALON.pgInitialized = false;
  }
};

window.GAMALON.dispatch = (command: DispatchCommand) => {
  if (!window.GAMALON.pgInitialized) {
    console.log('pg not initialized');
    return;
  }
  if (command === 'open') {
    pgContainer.dispatchEvent(
      new CustomEvent('pg-app-event', {
        detail: {
          type: 'open-pg',
        },
      }),
    );
  } else if (command === 'close') {
    pgContainer.dispatchEvent(
      new CustomEvent('pg-app-event', {
        detail: {
          type: 'close-pg',
        },
      }),
    );
  }
};
