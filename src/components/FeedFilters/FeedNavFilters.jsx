// @flow
import React from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

import type { NavFilter } from '../../entities';

// $FlowIgnore
import './feedNavFilters.scss';

type FeedNavFiltersProps = {
  filters: {
    visible: boolean,
    navigation: {
      title: string,
      options: Array<NavFilter>,
    },
  },
  onFilterClick: (filter: NavFilter) => void,
};

function getSelectionState(url: string): boolean {
  return window.location.href.startsWith(url);
}

/**
 * Renders navigation filters component
 * @returns {React.Node} Rendered content
 */
function FeedNavFilters({ filters, onFilterClick }: FeedNavFiltersProps): Node {
  if (
    !filters.visible
    || !filters.navigation
    || !filters.navigation.options
    || filters.navigation.options.length === 0
  ) return null;

  return (
    <m.div className="pg-nav-filters">
      {filters.navigation.title && (
        <m.div className="pg-nav-filters-title">
          {filters.navigation.title}
        </m.div>
      )}
      <m.div className="pg-nav-filters-list">
        {filters.navigation.options.map((filter) => (
          <a
            data-selected={getSelectionState(filter.url)}
            className="pg-nav-filters-link"
            href={filter.url}
            key={filter.url}
            onClick={() => {
              onFilterClick(filter);
            }}
          >
            {filter.label}
          </a>
        ))}
      </m.div>
    </m.div>
  );
}

export default FeedNavFilters;
