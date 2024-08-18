// @flow
import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Node } from 'react';
import { m } from 'framer-motion';
import { DesignContext, MobileContext } from '../../context';
import type { FeedSortOption } from '../../entities';

import { AppModal } from '../AppComponents';

// $FlowIgnore
import './feedPortalSort.scss';

type FeedPortalSortProps = {
  feedSort: FeedSortOption,
  onFeedSort: (option: FeedSortOption) => void | Promise<void>,
};

const sortOptionsMapping = {
  'best-selling': 'Best-selling',
  'newest-to-oldest': 'Newest-to-oldest',
  'oldest-to-newest': 'Oldest-to-newest',
  'price-low-to-high': 'Price: low-to-high',
  'price-high-to-low': 'Price: high-to-low',
  featured: 'Featured',
  'a-to-z': 'Alphabetically, A to Z',
  'z-to-a': 'Alphabetically, Z to A',
};

function FeedPortalSortCustom({
  onFeedSort,
  feedSort,
}: FeedPortalSortProps): Node {
  const [showContent, setShowContent] = useState(false);

  const renderContent = () => {
    const targetNode = document.querySelector('.pg-portal-wrapper');
    if (showContent && targetNode) {
      return createPortal(
        <AppModal
          onClose={() => {
            setShowContent(false);
          }}
        >
          <div className="pg-portal-sort-custom-content">
            <option
              data-selected={feedSort === 'best-selling'}
              className="pg-portal-sort-option"
              value="best-selling"
              onClick={() => {
                onFeedSort('best-selling');
                setShowContent(false);
              }}
            >
              Best-selling
            </option>
            <option
              data-selected={feedSort === 'newest-to-oldest'}
              className="pg-portal-sort-option"
              value="newest-to-oldest"
              onClick={() => {
                onFeedSort('newest-to-oldest');
                setShowContent(false);
              }}
            >
              Newest-to-oldest
            </option>
            <option
              data-selected={feedSort === 'oldest-to-newest'}
              className="pg-portal-sort-option"
              value="oldest-to-newest"
              onClick={() => {
                onFeedSort('oldest-to-newest');
                setShowContent(false);
              }}
            >
              Oldest-to-newest
            </option>
            <option
              data-selected={feedSort === 'price-low-to-high'}
              className="pg-portal-sort-option"
              value="price-low-to-high"
              onClick={() => {
                onFeedSort('price-low-to-high');
                setShowContent(false);
              }}
            >
              Price: low-to-high
            </option>
            <option
              data-selected={feedSort === 'price-high-to-low'}
              className="pg-portal-sort-option"
              value="price-high-to-low"
              onClick={() => {
                onFeedSort('price-high-to-low');
                setShowContent(false);
              }}
            >
              Price: high-to-low
            </option>
            <option
              data-selected={feedSort === 'featured'}
              className="pg-portal-sort-option"
              value="featured"
              onClick={() => {
                onFeedSort('featured');
                setShowContent(false);
              }}
            >
              Featured
            </option>
            <option
              data-selected={feedSort === 'a-to-z'}
              className="pg-portal-sort-option"
              value="a-to-z"
              onClick={() => {
                onFeedSort('a-to-z');
                setShowContent(false);
              }}
            >
              Alphabetically, A to Z
            </option>
            <option
              data-selected={feedSort === 'z-to-a'}
              className="pg-portal-sort-option"
              value="z-to-a"
              onClick={() => {
                onFeedSort('z-to-a');
                setShowContent(false);
              }}
            >
              Alphabetically, Z to A
            </option>
          </div>
        </AppModal>,
        targetNode,
      );
    }
    return null;
  };
  return (
    <m.div className="pg-portal-sort">
      <m.button
        className="pg-portal-sort-custom"
        onClick={() => {
          setShowContent(true);
        }}
      >
        {sortOptionsMapping[feedSort] || 'Featured'}
      </m.button>
      {renderContent()}
    </m.div>
  );
}

function FeedPortalSort({ onFeedSort, feedSort }: FeedPortalSortProps): Node {
  const isMobile = useContext(MobileContext);
  const {
    embedded: { sorting },
  } = useContext(DesignContext);
  if (!sorting.visible) return null;

  if (isMobile) {
    return <FeedPortalSortCustom onFeedSort={onFeedSort} feedSort={feedSort} />;
  }

  return (
    <m.div className="pg-portal-sort">
      <div className="pg-portal-sort-custom">
        <select
          className="pg-portal-sort-select"
          value={feedSort || 'featured'}
          onChange={(e) => {
            onFeedSort(e.currentTarget.value);
          }}
        >
          <option className="pg-portal-sort-option" value="best-selling">
            Best-selling
          </option>
          <option className="pg-portal-sort-option" value="newest-to-oldest">
            Newest-to-oldest
          </option>
          <option className="pg-portal-sort-option" value="oldest-to-newest">
            Oldest-to-newest
          </option>
          <option className="pg-portal-sort-option" value="price-low-to-high">
            Price: low-to-high
          </option>
          <option className="pg-portal-sort-option" value="price-high-to-low">
            Price: high-to-low
          </option>
          <option className="pg-portal-sort-option" value="featured">
            Featured
          </option>
          <option className="pg-portal-sort-option" value="a-to-z">
            Alphabetically, A to Z
          </option>
          <option className="pg-portal-sort-option" value="z-to-a">
            Alphabetically, Z to A
          </option>
        </select>
      </div>
    </m.div>
  );
}

export default FeedPortalSort;
