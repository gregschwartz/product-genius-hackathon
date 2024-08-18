// @flow
import React, { useRef, useContext, useLayoutEffect } from 'react';
import type { Node } from 'react';
import { CardSpace, CardWrapper } from '../CardComponents';

import type { VideoCard } from '../../../entities';
import { getVideoId } from '../../../utils/componentUtils';
import { feedVideoTracker, toggleVideoPlayState } from '../../FeedPortal/feedTracker';
import { ConfigContext, MobileContext } from '../../../context';

type VideoCardProps = {
  card: VideoCard,
};

function FeedVideoCard({ card }: VideoCardProps): Node {
  const iframeRef = useRef<HTMLIFrameElement|null>(null);
  const visibleRef = useRef(false);
  const timestampRef = useRef(0);
  const { source, id } = getVideoId(card.video_link_url);
  const isMobile = useContext(MobileContext);
  const { analytics } = useContext(ConfigContext);

  const handlePlayState = React.useCallback(
    (func: 'playVideo' | 'pauseVideo') => {
      if (iframeRef.current && isMobile) {
        toggleVideoPlayState({
          func,
          key: card.id,
          volume: isMobile ? 15 : 0,
          iframe: iframeRef.current,
        });
        if (func === 'playVideo' && !timestampRef.current) {
          timestampRef.current = Date.now();
        } else if (
          func === 'pauseVideo'
            && timestampRef.current
        ) {
          const payload = {
            durationData: {
              viewStartTimestamp: timestampRef.current,
              viewEndTimestamp: Date.now(),
              feedCard: JSON.parse(JSON.stringify(card)),
            },
          };
          analytics.track('feed card video watch duration', payload);
        }
      }
    },
    [card, isMobile, analytics],
  );

  useLayoutEffect(() => {
    const { current: element } = iframeRef;
    if (element) {
      const callback = (intersecting: boolean) => {
        visibleRef.current = intersecting;
        handlePlayState(intersecting ? 'playVideo' : 'pauseVideo');
      };
      feedVideoTracker.on(card.id, callback);
      feedVideoTracker.observe(element);
    }
    return () => {
      if (element) {
        feedVideoTracker.unobserve(element);
      }
    };
  }, [card.id, handlePlayState]);

  if (source === 'youtube' && id) {
    return (
      <CardWrapper
        size="large"
        card={card}
        grid={card.layout_state || '1x2'}
        style={{ overflow: 'hidden' }}
      >
        <CardSpace type="vertical-full">
          <div className="pg-card-embedded">
            <iframe
              ref={iframeRef}
              id={card.id}
              className="pg-card-embedded-youtube"
              title="pg-card-embedded-content"
              src={`https://www.youtube.com/embed/${id}?enablejsapi=1&mute=1`}
              allowFullScreen
              scrolling="no"
              frameBorder="0"
              allow="encrypted-media; autoplay"
              onLoad={() => {
                if (visibleRef.current) {
                  handlePlayState('playVideo');
                }
              }}
            />
          </div>
        </CardSpace>
      </CardWrapper>
    );
  }
  return null;
}

export default FeedVideoCard;
