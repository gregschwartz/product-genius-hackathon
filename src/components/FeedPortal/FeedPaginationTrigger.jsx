// @flow
import React, { useContext, useLayoutEffect, useRef } from 'react';
import type { Node } from 'react';

import { AppLoader } from '../AppComponents';
import { DesignContext } from '../../context';

export default function FeedPaginationTrigger({
  loading,
}: {
  loading: boolean,
}): Node {
  const { pagination } = useContext(DesignContext);
  const paginationEl = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    let paginationObserver = null;
    const { current: element } = paginationEl;
    if (element && pagination.enabled) {
      paginationObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              window.dispatchEvent(
                new CustomEvent('pg-pagination-event', {
                  detail: { type: 'pg-next-page' },
                }),
              );
            }
          });
        },
        {
          rootMargin: '100%',
          threshold: 1.0,
        },
      );
      paginationObserver.observe(element);
    }
    return () => {
      if (paginationObserver) {
        paginationObserver.disconnect();
      }
    };
  }, [pagination.enabled]);

  if (!pagination.enabled) {
    return null;
  }
  return (
    <>
      {loading && <AppLoader loading type="pagination" />}
      <div ref={paginationEl} className="pg-pagination-trigger" />
    </>
  );
}
