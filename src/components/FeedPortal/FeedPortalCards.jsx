// @flow
import React, {
  useCallback, useContext, useLayoutEffect, useRef,
} from 'react';
import type { Node } from 'react';

import type {
  AddToCartCB,
  FeedCard,
  SuggestionButton,
  CardFeedState,
} from '../../entities';

import {
  FeedProductCard,
  FeedQuestionRevealCard,
  FeedQuestionCardDefault,
  FeedFacetCard,
  FeedTextInputCard,
  FeedReviewCard,
  FeedReviewCardDefault,
  FeedCustomerServiceCard,
  FeedSocialContentCard,
  FeedBlogCard,
  FeedProductDescriptionCard,
  FeedProductSummaryCard,
  FeedProductImageCard,
  FeedProductImageCarouselCard,
  FeedVideoCard,
  FeedCouponCard,
  FeedProductVariantCard,
  FeedGreetingCard,
  FeedComparisonCard,
  FeedBannerCard,
  FeedMerchVideoCard,
  FeedMerchReviewCard,
  FeedMerchQaCard,
} from '../FeedCards';

import FeedPortalBanner from './FeedPortalBanner';
import FeedPaginationTrigger from './FeedPaginationTrigger';

import { FeedCardTracker, useScrollTable } from './feedTracker';

// $FlowIgnore
import './feedPortalCards.scss';
import { useShowFilterOptions } from '../../hooks';
import { getPortalClassName } from './util';
import { DesignContext } from '../../context';

function FeedCardsWrapper({
  children,
  feedSource,
}: {
  children: Node,
  feedSource: string,
}): Node {
  const scrollTop = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainer = useRef<HTMLElement | null>(null);
  const { embedded: { scrollSource } } = useContext(DesignContext);
  const { setEntry, getEntry } = useScrollTable();

  const getScrollContainer = useCallback(() => {
    if (scrollSource) {
      const targetScrollNode = document.querySelector(scrollSource);
      if (targetScrollNode) {
        return targetScrollNode;
      }
    } else if (scrollContainerRef.current) {
      return scrollContainerRef.current;
    }
    return null;
  }, [scrollSource]);

  const getScrollTop = useCallback(() => {
    const container = getScrollContainer();
    if (container) {
      return container.scrollTop;
    }
    return 0;
  }, [getScrollContainer]);

  scrollTop.current = getScrollTop();

  useLayoutEffect(() => {
    scrollContainer.current = getScrollContainer();
  }, [getScrollContainer]);

  useLayoutEffect(() => {
    const { current } = scrollContainer;
    if (feedSource && current) {
      if (
        feedSource === 'HOME_PG_BROWSE_BUTTON'
        || feedSource === 'HOME_PG_FIND_BUTTON'
      ) {
        current.scrollTop = 0;
      } else {
        current.scrollTop = getEntry(feedSource);
      }
    }
    return () => {
      if (feedSource) {
        setEntry(feedSource, scrollTop.current);
      }
    };
  }, [feedSource, getEntry, setEntry]);

  return (
    <div ref={scrollContainerRef} className={getPortalClassName()}>
      {children}
    </div>
  );
}

type FeedCardsProps = {
  feed: CardFeedState,
  pagination: boolean,
  onCardSelect: (FeedCard) => void | Promise<void>,
  onFacetSelect: (
    feedCard: FeedCard,
    facet: SuggestionButton
  ) => void | Promise<void>,
  onCardInputSubmit: (
    feedCard: FeedCard,
    inputValue: string
  ) => void | Promise<void>,
  onAddToCart: AddToCartCB,
  onAddCoupon: (feedCard: FeedCard) => void | Promise<void>,
};

function FeedCards({
  feed,
  pagination,
  onCardSelect,
  onFacetSelect,
  onCardInputSubmit,
  onAddToCart,
  onAddCoupon,
}: FeedCardsProps): Node {
  const { feedSource, feedCards } = feed;
  const { visible } = useShowFilterOptions(feedCards);

  return (
    <FeedCardsWrapper feedSource={feedSource}>
      <FeedPortalBanner />
      <FeedCardTracker>
        {feedCards.map((card) => {
          if (card.type === 'merch_card_video') {
            return <FeedMerchVideoCard key={card.id} card={card} />;
          }
          if (card.type === 'merch_card_review') {
            return <FeedMerchReviewCard key={card.id} card={card} />;
          }
          if (card.type === 'merch_card_qa') {
            return <FeedMerchQaCard key={card.id} card={card} />;
          }
          if (card.type === 'banner_card') {
            return <FeedBannerCard key={card.id} card={card} />;
          }
          if (card.type === 'product_detail_card') {
            return (
              <FeedProductCard
                key={card.id}
                card={card}
                onAddToCart={onAddToCart}
                onCardSelect={onCardSelect}
              />
            );
          }
          if (card.type === 'question_answer_default_card') {
            return <FeedQuestionCardDefault key={card.id} card={card} />;
          }
          if (card.type === 'question_answer_reveal_card') {
            return <FeedQuestionRevealCard key={card.id} card={card} />;
          }
          if (card.type === 'facet_value_card' && !visible) {
            return (
              <FeedFacetCard
                key={card.id}
                card={card}
                onFacetSelect={onFacetSelect}
              />
            );
          }
          if (card.type === 'text_input_card') {
            return (
              <FeedTextInputCard
                key={card.id}
                card={card}
                onCardInputSubmit={onCardInputSubmit}
              />
            );
          }
          if (card.type === 'review_card') {
            return <FeedReviewCard key={card.id} card={card} />;
          }
          if (card.type === 'review_default_card') {
            return <FeedReviewCardDefault key={card.id} card={card} />;
          }
          if (card.type === 'customer_service_card') {
            return <FeedCustomerServiceCard key={card.id} card={card} />;
          }
          if (card.type === 'social_content_card') {
            return <FeedSocialContentCard key={card.id} card={card} />;
          }
          if (card.type === 'blog_card') {
            return <FeedBlogCard key={card.id} card={card} />;
          }
          if (card.type === 'product_summary_card') {
            return (
              <FeedProductSummaryCard
                key={card.id}
                card={card}
                onAddToCart={onAddToCart}
              />
            );
          }
          if (card.type === 'product_description_card') {
            return <FeedProductDescriptionCard key={card.id} card={card} />;
          }
          if (card.type === 'product_image_card') {
            return <FeedProductImageCard key={card.id} card={card} />;
          }
          if (card.type === 'product_image_carousel_card') {
            return <FeedProductImageCarouselCard key={card.id} card={card} />;
          }
          if (card.type === 'video_card') {
            return <FeedVideoCard key={card.id} card={card} />;
          }
          if (card.type === 'coupon_card') {
            return (
              <FeedCouponCard
                key={card.id}
                card={card}
                onAddCoupon={onAddCoupon}
              />
            );
          }
          if (card.type === 'variant_group_card') {
            return (
              <FeedProductVariantCard
                key={card.id}
                card={card}
                onAddToCart={onAddToCart}
                onCardSelect={onCardSelect}
              />
            );
          }
          if (card.type === 'introduction_card') {
            return <FeedGreetingCard key={card.id} card={card} />;
          }
          if (card.type === 'comparison_card') {
            return (
              <FeedComparisonCard
                key={card.id}
                card={card}
                onAddToCart={onAddToCart}
                onCardSelect={onCardSelect}
              />
            );
          }
          return null;
        })}
      </FeedCardTracker>
      <FeedPaginationTrigger loading={pagination} />
    </FeedCardsWrapper>
  );
}

const areEqual = (
  prevProps: FeedCardsProps,
  nextProps: FeedCardsProps,
): boolean => {
  if (prevProps.feed !== nextProps.feed) return false;
  if (prevProps.pagination !== nextProps.pagination) return false;
  return true;
};

// $FlowIgnore
export default React.memo<FeedCardsProps>(FeedCards, areEqual);
