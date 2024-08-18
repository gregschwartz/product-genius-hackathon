// @flow
import type {
  FeedCard,
  CardTimestampData,
  FeedTouchTrackingData,
  FeedPosTrackingData,
  FeedTracker,
} from '../../entities';

import { type Analytics } from '../../analytics';

import { findNodePathCardId, getNearestThreshold } from '../../utils/domUtils';

type FeedThresholds = Array<number>;

type FeedContainer = HTMLElement | null;

// Dispatcher functions for the tracking events:
type DispatchCardViewProps = {
  analytics: Analytics,
  feedCard: FeedCard,
  timestampData: CardTimestampData,
};
export function dispatchCardView(props: DispatchCardViewProps) {
  const payload = {
    ...props.timestampData,
    feedCard: JSON.parse(JSON.stringify(props.feedCard)),
  };
  props.analytics.track('feed card viewed', payload);
}

type DispatchFeedTouchProps = {
  analytics: Analytics,
  type: string,
  touchData: FeedTouchTrackingData,
};
export function dispatchFeedTouch(props: DispatchFeedTouchProps) {
  const payload = {
    ...props.touchData,
    feedCard:
      props.touchData.feedCard
      && JSON.parse(JSON.stringify(props.touchData.feedCard)),
  };
  props.analytics.track(
    `feed touch ${props.type === 'touchstart' ? 'started' : 'ended'}`,
    payload,
  );
}

type DispatchFeedPositionProps = {
  analytics: Analytics,
  positionData: Array<FeedPosTrackingData>,
};
export function dispatchFeedPosition(props: DispatchFeedPositionProps) {
  const payload = {
    positionData: props.positionData.map((entry) => ({
      ...entry,
      feedCard: entry.feedCard && JSON.parse(JSON.stringify(entry.feedCard)),
    })),
  };
  props.analytics.track('feed card position', payload);
}

// Utility functions for tracking events:
type TrackPositionUpdateProps = {
  container: FeedContainer,
  feedTracker: FeedTracker,
};
export function trackPositionUpdate(props: TrackPositionUpdateProps) {
  const { feedTracker, container } = props;
  const { feedInView, feedTargets, analytics } = feedTracker.current;
  if (container) {
    const payload = [];
    for (const cardId of feedInView.values()) {
      const cardEntry = feedTargets.get(cardId);
      if (cardEntry) {
        const { element, card } = cardEntry;
        const rect = element.getBoundingClientRect();
        payload.push({
          x: rect.left,
          y: rect.top,
          height: rect.height,
          width: rect.width,
          timestamp: Date.now(),
          viewHeight: container.clientHeight,
          feedCard: card,
        });
      }
    }
    if (payload.length !== 0) {
      dispatchFeedPosition({
        analytics,
        positionData: payload,
      });
    }
  }
}

type TrackIntersectionUpdateProps = {
  cardId: string,
  feedTracker: FeedTracker,
  thresholds: FeedThresholds,
};
function trackIntersectionUpdate(props: TrackIntersectionUpdateProps) {
  const { feedTracker, cardId, thresholds } = props;
  const { feedDurations, feedTargets, analytics } = feedTracker.current;
  const intersection = feedDurations.get(cardId);
  if (intersection) {
    const { intersectionRatio, viewStartTimestamp } = intersection;
    const cardEntry = feedTargets.get(cardId);
    if (cardEntry) {
      const { card } = cardEntry;
      const viewEndTimestamp = Date.now();
      dispatchCardView({
        analytics,
        feedCard: card,
        timestampData: {
          viewStartTimestamp,
          viewEndTimestamp,
          duration: viewEndTimestamp - viewStartTimestamp,
          intersectionRatio,
          threshold: getNearestThreshold(intersectionRatio, thresholds),
        },
      });
    }
  }
}

type TrackIntersectionProps = {
  intersection: IntersectionObserverEntry,
  feedTracker: FeedTracker,
  thresholds: FeedThresholds,
};

export function trackIntersection(props: TrackIntersectionProps) {
  const { feedTracker, intersection } = props;
  const { feedInView, feedDurations } = feedTracker.current;
  const cardId = intersection.target.id;
  trackIntersectionUpdate({
    cardId,
    feedTracker,
    thresholds: props.thresholds,
  });
  if (intersection.isIntersecting) {
    feedInView.add(cardId);
    feedDurations.set(cardId, {
      intersectionRatio: intersection.intersectionRatio,
      viewStartTimestamp: Date.now(),
    });
  } else {
    feedInView.delete(cardId);
    feedDurations.delete(cardId);
  }
}

type TrackTouchEventProps = {
  event: TouchEvent,
  container: FeedContainer,
  feedTracker: FeedTracker,
};
export function trackTouchEvent(props: TrackTouchEventProps) {
  const { event, container, feedTracker } = props;
  const { feedTargets, analytics } = feedTracker.current;
  if (container instanceof Element) {
    // $FlowIgnore
    const path: Array<HTMLElement> = event.path || (event.composedPath && event.composedPath());
    const cardId = findNodePathCardId(path);
    const cardEntry = cardId && feedTargets.get(cardId);
    let x = 0;
    let y = 0;
    if (event.type === 'touchstart') {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
    }
    if (event.type === 'touchend') {
      x = event.changedTouches[0].clientX;
      y = event.changedTouches[0].clientY;
    }
    dispatchFeedTouch({
      analytics,
      type: event.type,
      touchData: {
        x,
        y,
        viewHeight: container.clientHeight,
        feedY: container.scrollTop,
        timestamp: Date.now(),
        // $FlowIgnore
        feedCard: cardEntry?.card,
      },
    });
  }
}
