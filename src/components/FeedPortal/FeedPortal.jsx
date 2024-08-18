/* eslint-disable react-hooks/exhaustive-deps */
// @flow
import React, { useContext } from 'react';
import { v4 as uuid } from 'uuid';
import { m } from 'framer-motion';
import type { Node } from 'react';

import type {
  FeedCard,
  FeedPayloadCard,
  Product,
  NavFilter,
  AppFeedState,
  SuggestionButton,
} from '../../entities';
import type { ChatController } from '../../ChatController';
import { DesignContext, MobileContext } from '../../context';
import { AppLoader } from '../AppComponents';
import FeedPortalHeader from './FeedPortalHeader';
import FeedPortalCards from './FeedPortalCards';
import FeedNavFilters from '../FeedFilters/FeedNavFilters';
import { getPortalData, clearUtmParams, getFormattedFeed } from './util';
import { checkoutProduct, onCallToActionCart } from '../../utils/cartUtils';

// $FlowIgnore
import './feedPortal.scss';

type FeedPortalState = 'initial-load' | 'loading' | 'loaded' | 'pagination';

type FeedPortalWrapperProps = {
  children: Node,
  state: FeedPortalState,
};

function FeedPortalWrapper({ children, state }: FeedPortalWrapperProps): Node {
  const isMobile = useContext(MobileContext);
  const renderContent = () => {
    if (state === 'initial-load') {
      return (
        <AppLoader loading type="content" />
      );
    }
    return (
      <>
        {state !== 'loaded' && (
          <AppLoader loading type="spinner" />
        )}
        {children}
      </>
    );
  };
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      data-mobile={isMobile}
      data-loading={state !== 'loaded'}
      className="pg-portal-wrapper"
      transition={{
        type: 'tween',
        duration: 0.2,
      }}
    >
      {renderContent()}
    </m.div>
  );
}

type FeedPortalProps = {
  state: AppFeedState,
  controller: ChatController,
};

function getFeedState(state: AppFeedState): FeedPortalState {
  if (state.loading) {
    if (state.feed.feedCards.length === 0) {
      return 'initial-load';
    }
    return 'loading';
  }
  return 'loaded';
}

function FeedPortal({ state, controller }: FeedPortalProps): Node {
  const { feed } = state;
  const { headerCard, summaryCard } = getPortalData(feed.feedCards);
  const {
    flags, url, merchant, embedded,
  } = useContext(DesignContext);

  const onDispatchCardPayload = (card: FeedPayloadCard) => {
    controller.sendVisitorMessage(
      {
        id: uuid(),
        type: 'visitor_button_click',
        source: {
          message_id: feed.feedId,
          card_id: card.id,
          button_id: uuid(),
        },
        payload: card.payload,
        action_language: 'dispatch_card_payload',
      },
      'button',
    );
  };

  const onPreviousRoute = () => {
    if (headerCard) {
      clearUtmParams();
      onDispatchCardPayload(headerCard);
      controller.analytics.track('previous route selected');
    }
  };

  const onCardSelect = async (card: FeedCard) => {
    controller.analytics.track('feed card selected', {
      messageId: feed.feedId,
      feedCard: JSON.parse(JSON.stringify(card)),
    });
    if (card.type === 'product_detail_card') {
      if (flags.sourcePDP) {
        window.open(
          card.product.product_url,
          url.target === 'self' ? '_self' : '_blank',
        );
      } else {
        onDispatchCardPayload(card);
      }
      return;
    }
    if (card.type === 'variant_group_card') {
      const [variantId] = Object.keys(card.variants_info);
      if (flags.sourcePDP) {
        const variant = card.variants_info[variantId];
        if (variant?.product?.product_url) {
          window.open(
            variant.product.product_url,
            url.target === 'self' ? '_self' : '_blank',
          );
        }
      } else {
        onDispatchCardPayload(card);
      }
    }
  };

  const onNavigateTimeline = (feedPayload: any) => {
    const payload = {
      id: uuid(),
      type: 'visitor_button_click',
      payload: feedPayload,
      action_language: 'navigate_timeline',
      source: {
        message_id: feed.feedId,
        button_id: uuid(),
      },
    };
    controller.sendVisitorMessage(payload, 'button');
  };

  const onFacetSelect = (card: FeedCard, facet: SuggestionButton) => {
    if (facet.payload.type === 'new_facet_constraint') {
      const payload = {
        id: uuid(),
        type: 'visitor_button_click',
        payload: facet.payload,
        action_language: 'get_cards',
        source: {
          message_id: feed.feedId,
          card_id: card.id,
          button_id: facet.id,
        },
      };
      controller.analytics.track('suggestion card selected', {
        messageId: feed.feedId,
        facet: JSON.parse(JSON.stringify(facet)),
        feedCard: JSON.parse(JSON.stringify(card)),
      });
      controller.sendVisitorMessage(payload, 'button');
    }
  };

  const onCardInputSubmit = (feedCard: FeedCard, inputValue: string) => {
    if (feedCard.type === 'text_input_card') {
      const payload = {
        id: uuid(),
        type: 'visitor_text',
        payload: {
          timeline: feedCard.payload.timeline,
          text: inputValue,
          type: 'text_message_payload',
        },
        source: {
          message_id: feed.feedId,
          card_id: feedCard.id,
        },
      };
      controller.analytics.track('input card dispatched', {
        inputValue,
        messageId: feed.feedId,
        feedCard: JSON.parse(JSON.stringify(feedCard)),
      });
      controller.sendVisitorMessage(payload, 'input');
    }
  };

  const onAddToCart = async (product: Product, action?: 'cart' | 'buy-now') => {
    if (action === 'buy-now') {
      checkoutProduct(controller, product);
    } else {
      await onCallToActionCart(controller, {
        type: 'add_to_cart',
        product,
      });
    }
  };

  const onAddCoupon = async (feedCard: FeedCard) => {
    if (feedCard.type === 'coupon_card') {
      await onCallToActionCart(controller, {
        type: 'add_coupon',
        couponInfo: feedCard.coupon_info,
      });
      controller.analytics.track('coupon card applied', {
        messageId: feed.feedId,
        feedCard: JSON.parse(JSON.stringify(feedCard)),
      });
    }
  };

  const onFilterClick = (filter: NavFilter) => {
    controller.analytics.track('filter selected', filter);
  };

  return (
    <FeedPortalWrapper state={getFeedState(state)}>
      <FeedNavFilters filters={embedded.filters} onFilterClick={onFilterClick} />
      <div className="pg-portal-content">
        <FeedPortalHeader
          headerCard={headerCard}
          summaryCard={summaryCard}
          onAddToCart={onAddToCart}
          onPreviousRoute={onPreviousRoute}
          onNavigateTimeline={onNavigateTimeline}
        />
        <FeedPortalCards
          feed={getFormattedFeed(feed, merchant)}
          pagination={state.pagination}
          onAddToCart={onAddToCart}
          onAddCoupon={onAddCoupon}
          onCardSelect={onCardSelect}
          onFacetSelect={onFacetSelect}
          onCardInputSubmit={onCardInputSubmit}
        />
      </div>
    </FeedPortalWrapper>
  );
}

export default FeedPortal;
