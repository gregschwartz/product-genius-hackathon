// @flow
import { useLayoutEffect, useMemo } from 'react';
import type { TrackingRule } from '../../entities';
import { type Analytics } from '../../analytics';
import { useCheckScreenWidth } from '../../hooks';

import {
  SourcePageViewTr,
  SourceViewTr,
  SourceClickTr,
  SourceTouchTr,
  SourceScrollTr,
  SourceClickGlobalTr,
  SourceViewGlobalTr,
} from './sourceTrackerClasses';

function verifyDeviceRule(isMobile: boolean, rule: TrackingRule) {
  const target = isMobile ? 'mobile' : 'desktop';
  return rule.device === 'all' || target === rule.device;
}

function verifyPatternURL(rule: TrackingRule) {
  if (rule.urlPattern === '') return false;
  const { pathname, search, hash } = window.location;
  const urlTail = pathname + search + hash;
  return new RegExp(rule.urlPattern).test(urlTail);
}

function verifyTrackingRule(isMobile: boolean, rule: TrackingRule) {
  return verifyDeviceRule(isMobile, rule) && verifyPatternURL(rule);
}

type SourceTrackerProps = {
  enabled: boolean,
  rules: Array<TrackingRule>,
  analytics: Analytics,
};

export function useSourceTracker({ enabled, rules, analytics }: SourceTrackerProps) {
  const isMobile = useCheckScreenWidth(800);
  const sourcePageViewTr = useMemo(() => new SourcePageViewTr(analytics), [analytics]);
  const sourceViewTr = useMemo(() => new SourceViewTr(analytics), [analytics]);
  const sourceClickTr = useMemo(() => new SourceClickTr(analytics), [analytics]);
  const sourceTouchTr = useMemo(() => new SourceTouchTr(analytics), [analytics]);
  const sourceScrollTr = useMemo(() => new SourceScrollTr(analytics), [analytics]);
  const sourceClickGlobalTr = useMemo(() => new SourceClickGlobalTr(analytics), [analytics]);
  const sourceViewGlobalTr = useMemo(() => new SourceViewGlobalTr(analytics), [analytics]);

  useLayoutEffect(() => {
    if (enabled) {
      for (const rule of rules) {
        if (verifyTrackingRule(isMobile, rule)) {
          if (rule.trackingType === 'pageView') {
            sourcePageViewTr.setupPageViewEvent({ rule });
          } else if (rule.trackingType === 'globalView') {
            sourceViewGlobalTr.setupIntersectionEvent({ rule });
          } else {
            const targetElement = document.querySelector(rule.elementSelector);
            if (targetElement) {
              if (rule.trackingType === 'view') {
                sourceViewTr.setupIntersectionEvent({ rule, targetElement });
              } else if (rule.trackingType === 'click') {
                sourceClickTr.setupClickEvent({ rule, targetElement });
              } else if (rule.trackingType === 'touch') {
                sourceTouchTr.setupTouchEvent({ rule, targetElement });
              } else if (rule.trackingType === 'scroll') {
                sourceScrollTr.setupScrollEvent({ rule, targetElement });
              } else if (rule.trackingType === 'globalClick') {
                sourceClickGlobalTr.setupSelectEvent({ rule, targetElement });
              }
            }
          }
        }
      }
    }
    const handleTabClose = () => {
      sourcePageViewTr.disconnectPageViewEvents();
    };
    window.addEventListener('beforeunload', handleTabClose);
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
      sourcePageViewTr.disconnectPageViewEvents();
      sourceViewTr.disconnectIntersectionEvents();
      sourceClickTr.disconnectClickEvents();
      sourceTouchTr.disconnectTouchEvents();
      sourceScrollTr.disconnectClickEvents();
      sourceClickGlobalTr.disconnectClickEvents();
      sourceViewGlobalTr.disconnectIntersectionEvents();
    };
  }, [
    isMobile,
    enabled,
    rules,
    sourcePageViewTr,
    sourceViewTr,
    sourceClickTr,
    sourceTouchTr,
    sourceScrollTr,
    sourceClickGlobalTr,
    sourceViewGlobalTr,
  ]);
}

export function SourceTracker({
  enabled,
  rules,
  analytics,
}: SourceTrackerProps): null {
  useSourceTracker({ enabled, rules, analytics });
  return null;
}
