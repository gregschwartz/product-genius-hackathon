// @flow
import React from 'react';
import type { Node } from 'react';
import { m } from 'framer-motion';

import { CardWrapper } from '../../FeedCards/CardComponents';

// $FlowIgnore
import './appLoader.scss';

function AppLoaderSnipper(): Node {
  return <m.div data-loader="pg-spinner" className="pg-app-loader" />;
}

type PatternTypes = 'loader_feed_card_1x1' | 'loader_facet_card_1x2';

const defaultPattern: Array<PatternTypes> = [
  'loader_feed_card_1x1',
  'loader_feed_card_1x1',
  'loader_facet_card_1x2',
  'loader_feed_card_1x1',
  'loader_feed_card_1x1',
  'loader_feed_card_1x1',
  'loader_feed_card_1x1',
  'loader_facet_card_1x2',
  'loader_feed_card_1x1',
  'loader_feed_card_1x1',
  'loader_feed_card_1x1',
  'loader_feed_card_1x1',
  'loader_feed_card_1x1',
  'loader_facet_card_1x2',
  'loader_feed_card_1x1',
  'loader_feed_card_1x1',
  'loader_feed_card_1x1',
  'loader_feed_card_1x1',
];

const paginationPattern: Array<PatternTypes> = [
  'loader_feed_card_1x1',
  'loader_feed_card_1x1',
  'loader_feed_card_1x1',
  'loader_feed_card_1x1',
  'loader_feed_card_1x1',
];

export function AppLoaderPagination(): Node {
  return paginationPattern.map((p, index) => {
    const cardId = `${p}_${index * 1}`;
    if (p === 'loader_feed_card_1x1') {
      return (
        <CardWrapper
          key={cardId}
          card={{ id: cardId, type: 'skeleton_card' }}
          style={{ overflow: 'hidden' }}
          size="auto"
          grid="1x1"
        >
          <m.div className="pg-app-loader-card" />
        </CardWrapper>
      );
    }
    if (p === 'loader_facet_card_1x2') {
      return (
        <CardWrapper
          key={cardId}
          card={{ id: cardId, type: 'skeleton_card' }}
          style={{ overflow: 'hidden' }}
          size="auto"
          grid="1x2"
        >
          <m.div className="pg-app-loader-facets" />
        </CardWrapper>
      );
    }
    return null;
  });
}

function AppLoaderContent(): Node {
  const renderGridPattern = () => defaultPattern.map((p, index) => {
    const cardId = `${p}_${index * 1}`;
    if (p === 'loader_feed_card_1x1') {
      return (
        <CardWrapper
          key={cardId}
          card={{ id: cardId, type: 'skeleton_card' }}
          style={{ overflow: 'hidden' }}
          size="auto"
          grid="1x1"
        >
          <m.div className="pg-app-loader-card" />
        </CardWrapper>
      );
    }
    if (p === 'loader_facet_card_1x2') {
      return (
        <CardWrapper
          key={cardId}
          card={{ id: cardId, type: 'skeleton_card' }}
          style={{ overflow: 'hidden' }}
          size="auto"
          grid="1x2"
        >
          <m.div className="pg-app-loader-facets" />
        </CardWrapper>
      );
    }
    return null;
  });

  return (
    <m.div data-loader="pg-content" className="pg-portal-feed pg-no-scroll-bar">
      {renderGridPattern()}
    </m.div>
  );
}

type AppLoaderProps = {
  type: 'spinner' | 'content' | 'pagination',
  loading: boolean,
};

function AppLoader({ type, loading }: AppLoaderProps): Node {
  if (!loading) {
    return null;
  }
  if (type === 'spinner') {
    return <AppLoaderSnipper />;
  }
  if (type === 'content') {
    return <AppLoaderContent />;
  }
  if (type === 'pagination') {
    return <AppLoaderPagination />;
  }
}

export default AppLoader;
