// @flow
/* eslint-disable no-param-reassign */
// eslint-disable-next-line max-classes-per-file
import React, {
  useRef,
  useCallback,
  useLayoutEffect,
  useContext,
  useEffect,
} from 'react';
import type { Node } from 'react';
import { produce } from 'immer';
import throttle from 'lodash/throttle';

import {
  trackIntersection,
  trackPositionUpdate,
  trackTouchEvent,
} from './feedTrackerUtils';

import { ConfigContext, DesignContext } from '../../context';
import type {
  FeedCard,
  ProductSummaryCard,
  HeaderCard,
  FeedTracker,
} from '../../entities';
import safeLocalStorage from '../../utils/safeLocalStorage';

type TrackingContextState = {
  addTrackingRef?: (card: FeedCard, element: HTMLElement | null) => void,
  removeTrackingRef?: (cardId: string) => void,
};

const trackingState: TrackingContextState = {
  addTrackingRef: undefined,
  removeTrackingRef: undefined,
};

// $FlowIgnore
export const TrackingContext = React.createContext(trackingState);

type FeedCardTrackerProps = {
  children: Node,
};

function useIntersectionObserver(
  enabled: boolean,
  thresholds: Array<number>,
  feedTracker: FeedTracker,
) {
  if (!enabled || thresholds.length === 0) {
    return {
      feedObserver: null,
    };
  }
  const intersectionCallback = (entries: Array<IntersectionObserverEntry>) => {
    entries.forEach((entry) => {
      trackIntersection({
        intersection: entry,
        feedTracker,
        thresholds,
      });
    });
  };
  const feedObserver = new IntersectionObserver(intersectionCallback, {
    root: null,
    rootMargin: '0px',
    threshold: thresholds,
  });
  return Object.freeze({
    feedObserver,
  });
}

/**
 * Hook for tracking various interaction events, likes of:
 * "card-view duration", "touch event positioning" and the "scroll behaviour".
 */
export function FeedCardTracker({
  children,
}: FeedCardTrackerProps): Node {
  const { analytics } = useContext(ConfigContext);
  const { tracking } = useContext(DesignContext);
  const { enabled, thresholds } = tracking.feed;
  const feedTracker = useRef({
    analytics,
    feedTargets: new Map<string, { element: HTMLElement, card: FeedCard }>(),
    feedDurations: new Map<string, { intersectionRatio: number, viewStartTimestamp: number}>(),
    feedInView: new Set<string>(),
  });
  const { feedObserver } = useIntersectionObserver(enabled, thresholds, feedTracker);

  const removeTrackingRef = useCallback((cardId: string) => {
    const { feedTargets, feedDurations, feedInView } = feedTracker.current;
    feedDurations.delete(cardId);
    feedInView.delete(cardId);
    const cardEntry = feedTargets.get(cardId);
    if (cardEntry) {
      const { element } = cardEntry;
      feedTargets.delete(cardId);
      if (element && feedObserver) {
        feedObserver.unobserve(element);
      }
    }
  }, [feedObserver]);

  const setTrackingRef = useCallback(
    (card: FeedCard, element: HTMLElement | null) => {
      const { feedTargets } = feedTracker.current;
      if (element) {
        if (!feedTargets.has(card.id)) {
          feedTargets.set(card.id, { element, card });
          if (feedObserver) {
            feedObserver.observe(element);
          }
        }
      } else {
        removeTrackingRef(card.id);
      }
    },
    [removeTrackingRef, feedObserver],
  );

  useLayoutEffect(() => {
    const container = document.querySelector('.pg-portal-feed');
    const handleFeedTouch = (event: TouchEvent) => {
      trackTouchEvent({
        event,
        container,
        feedTracker,
      });
    };
    const handleFeedScroll = () => {
      trackPositionUpdate({
        container,
        feedTracker,
      });
    };
    if (container && enabled) {
      container.onscroll = throttle(handleFeedScroll, 350);
      container.addEventListener('touchstart', handleFeedTouch);
      container.addEventListener('touchend', handleFeedTouch);
    }
    return () => {
      if (container && enabled) {
        container.removeEventListener('touchstart', handleFeedTouch);
        container.removeEventListener('touchend', handleFeedTouch);
      }
    };
  }, [enabled]);

  useLayoutEffect(() => () => {
    if (feedObserver) {
      feedObserver.disconnect();
    }
  }, [feedObserver, thresholds, enabled]);

  if (enabled) {
    const value = produce(trackingState, (draftState) => {
      draftState.addTrackingRef = setTrackingRef;
      draftState.removeTrackingRef = removeTrackingRef;
    });
    return (
      <TrackingContext.Provider value={value}>
        {children}
      </TrackingContext.Provider>
    );
  }
  return children;
}

type UseScrollTableReturn = {
  setEntry: (key: string, value: number) => void,
  getEntry: (key: string) => number,
}

export function useScrollTable(): UseScrollTableReturn {
  const setEntry = useCallback((key: string, value: number) => {
    let scrollTableNext = {};
    const scrollTable = safeLocalStorage.getItem('GAMALON-pg-scroll-table');
    if (scrollTable) {
      scrollTableNext = { ...JSON.parse(scrollTable), [key]: value };
    } else {
      scrollTableNext = { [key]: value };
    }
    safeLocalStorage.setItem('GAMALON-pg-scroll-table', JSON.stringify(scrollTableNext));
  }, []);
  const getEntry = useCallback((key: string) => {
    const scrollTable = safeLocalStorage.getItem('GAMALON-pg-scroll-table');
    if (scrollTable) {
      return JSON.parse(scrollTable)[key];
    }
    return 0;
  }, []);
  return {
    setEntry,
    getEntry,
  };
}
type UseTrackDurationsPDFProps = {
  feedType: 'cart' | 'nav' | 'empty',
  summaryCard: ?ProductSummaryCard,
  headerCard: ?HeaderCard,
};

export function useTrackDurationsPDF({
  feedType,
  headerCard,
  summaryCard,
}: UseTrackDurationsPDFProps) {
  const { analytics } = useContext(ConfigContext);
  const pdfTracker = useRef({
    timestamp: 0,
    analytics,
  });

  useEffect(() => {
    if (headerCard) {
      safeLocalStorage.setItem('GAMALON-pg-header-info', JSON.stringify(headerCard.header_info));
      const { analytics: tracker } = pdfTracker.current;
      const payload = {
        timestamp: Date.now(),
        feedCard: JSON.parse(JSON.stringify(headerCard)),
      };
      tracker.track('loaded header card', payload);
      tracker.track('loaded header label', {
        dealder_label: headerCard.header_info.dealder_label,
      });
    }
  }, [headerCard]);

  useEffect(() => {
    const { timestamp, analytics: tracker } = pdfTracker.current;
    pdfTracker.current.timestamp = 0;
    if (feedType === 'cart') {
      pdfTracker.current.timestamp = Date.now();
      if (summaryCard) {
        const payload = {
          viewStartTimestamp: pdfTracker.current.timestamp,
          source_id: summaryCard.source_id,
          product_id: summaryCard.product.product_id,
          variant_id: summaryCard.product.variant_id,
        };
        tracker.track('started PDF', payload);
      }
    }
    return () => {
      if (timestamp && summaryCard) {
        const viewEndTimestamp = Date.now();
        const payload = {
          viewStartTimestamp: timestamp,
          viewEndTimestamp,
          duration: Math.abs(viewEndTimestamp - timestamp),
          source_id: summaryCard.source_id,
          product_id: summaryCard.product.product_id,
          variant_id: summaryCard.product.variant_id,
        };
        tracker.track('viewed PDF', payload);
      }
    };
  }, [feedType, summaryCard]);
}

export function toggleVideoPlayState({
  volume,
  key,
  iframe,
  func,
}: {
  volume: number,
  key: string,
  iframe: HTMLIFrameElement | null,
  func: 'playVideo' | 'pauseVideo',
}) {
  if (key && iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(
      `{"event":"command","func":"setVolume","args":[${volume}]}`,
      '*',
    );
    iframe.contentWindow.postMessage(
      `{"event":"command","func":"${func}","args":""}`,
      '*',
    );
  }
}

class FeedVideoTracker {
  observer: ?IntersectionObserver;
  callbacks: Map<string, (intersecting: boolean) => void>;

  constructor() {
    this.observer = null;
    this.callbacks = new Map();
  }

  on(key: string, cb: (intersecting: boolean) => void) {
    if (key && cb) {
      this.callbacks.set(key, cb);
    }
  }

  init() {
    const intersectionCallback = (entries: Array<IntersectionObserverEntry>) => {
      entries.forEach((entry) => {
        if (entry.target.id) {
          const callback = this.callbacks.get(entry.target.id);
          if (callback) {
            callback(entry.isIntersecting);
          }
        }
      });
    };
    this.observer = new IntersectionObserver(intersectionCallback, {
      threshold: 0.5,
      root: null,
    });
  }

  observe(element: HTMLElement) {
    if (!this.observer) {
      this.init();
    }
    if (this.observer && element) {
      this.observer.observe(element);
    }
  }

  unobserve(element: HTMLElement) {
    if (this.observer && element) {
      this.observer.unobserve(element);
      if (element.id) {
        this.callbacks.delete(element.id);
      }
    }
  }
}

export const feedVideoTracker: FeedVideoTracker = new FeedVideoTracker();

class FeedRevealTracker {
  observer: ?IntersectionObserver;
  callbacks: Map<string, (visible: boolean) => void>;
  timeouts: Map<string, any>;
  loaded: Set<string>;

  constructor() {
    this.observer = null;
    this.callbacks = new Map();
    this.timeouts = new Map();
    this.loaded = new Set();
  }

  on(key: string, cb: (visible: boolean) => void) {
    if (key && cb) {
      this.callbacks.set(key, cb);
    }
  }

  setDurationTimeout(cardId: string, isIntersecting: boolean, ratio: number) {
    if (isIntersecting && ratio === 1) {
      if (!this.loaded.has(cardId)) {
        const timeoutId = setTimeout(() => {
          const callback = this.callbacks.get(cardId);
          if (callback) {
            callback(true);
            this.loaded.add(cardId);
          }
        }, 3000);
        this.timeouts.set(cardId, timeoutId);
      }
    } else {
      const timeoutId = this.timeouts.get(cardId);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (this.loaded.has(cardId) && ratio === 0) {
        const callback = this.callbacks.get(cardId);
        if (callback) {
          callback(false);
        }
      }
    }
  }

  init() {
    const intersectionCallback = (
      entries: Array<IntersectionObserverEntry>,
    ) => {
      entries.forEach((entry) => {
        if (entry.target.id) {
          this.setDurationTimeout(
            entry.target.id,
            entry.isIntersecting,
            entry.intersectionRatio,
          );
        }
      });
    };
    this.observer = new IntersectionObserver(intersectionCallback, {
      threshold: [0, 0.9, 1],
      root: null,
      rootMargin: '0px',
    });
  }

  observe(element: HTMLElement) {
    if (!this.observer) {
      this.init();
    }
    if (this.observer && element) {
      this.observer.observe(element);
    }
  }

  unobserve(element: HTMLElement) {
    if (this.observer && element) {
      this.observer.unobserve(element);
      if (element.id) {
        this.callbacks.delete(element.id);
        this.loaded.delete(element.id);
        if (this.timeouts.has(element.id)) {
          const timeoutId = this.timeouts.get(element.id);
          clearTimeout(timeoutId);
          this.timeouts.delete(element.id);
        }
      }
    }
  }
}

export const feedRevealTracker: FeedRevealTracker = new FeedRevealTracker();
