// @flow
import {
  useReducer,
  useCallback,
  useMemo,
} from 'react';

import type {
  AppFeedState,
  CallToAction,
  ServerBehavior,
  FeedSortOption,
} from '../../entities';
import feedControllerReducer from './feedControllerReducer';
import { Analytics } from '../../analytics';
import { ChatController } from '../../ChatController';
import { FeedCardController } from './FeedCardController';
import safeLocalStorage from '../../utils/safeLocalStorage';

const getInitialState = (): AppFeedState => ({
  actionCalls: [],
  lingerCards: {
    cards: [],
    productIds: [],
  },
  feed: {
    feedId: '',
    feedSource: '',
    feedSort: 'featured',
    feedCards: [],
  },
  overlay: {},
  cart: JSON.parse(
    safeLocalStorage.getItem('GAMALON-pg-cart-products') || '{}',
  ),
  loading: true,
  pagination: false,
});

export type UseCardFeedControllerProps = {
  organizationId: string,
  socketURL: string,
  analytics: Analytics,
  serverBehavior: ?ServerBehavior,
};

export type UseCardFeedControllerReturn = {
  state: AppFeedState,
  controller: ChatController,
};

/**
 * Card controllers state & callback wrapper hook.
 * The wrapper uses the reducer pattern to update state
 * and handle the callback events.
 */
export function useCardFeedController({
  organizationId,
  socketURL,
  analytics,
  serverBehavior,
}: UseCardFeedControllerProps): UseCardFeedControllerReturn {
  const [state, dispatch] = useReducer(feedControllerReducer, getInitialState());
  const initControllerCallbacks = useCallback((instance: ChatController) => {
    instance.on('visitorMessage', (message) => {
      if (message.type === 'visitor_linger_request') {
        dispatch({ type: 'getLingerCards' });
      } else {
        dispatch({ type: 'getFeedCards' });
      }
    });
    instance.on('loading', (loading) => {
      dispatch({ type: 'toggleLoading', loading });
    });
    instance.on('callToAction', (actionCall: CallToAction) => {
      if (actionCall.type === 'clear_action_calls') {
        dispatch({ type: 'clearActionCalls' });
        return;
      }
      dispatch({ type: 'addActionCall', actionCall });
    });
    instance.on('botMessage', (message) => {
      if (message.type === 'bot_message_pagination') {
        dispatch({
          type: 'addFeedCards',
          feedCards: message.cards,
        });
      }
      if (message.type === 'bot_message' && message.cards) {
        dispatch({
          type: 'setFeedCards',
          feedCards: message.cards,
          feedId: message.id,
          feedSource: message.cards[0]?.source_id,
        });
      }
      if (message.type === 'bot_linger_message' && message.cards) {
        dispatch({
          type: 'setLingerCards',
          cards: message.cards,
          productIds: message.product_ids,
        });
      }
    });
    instance.on('overlay', (overlay) => {
      dispatch({ type: 'setOverlay', overlay });
    });
    instance.on('callToAction', (actionCall: CallToAction) => {
      if (actionCall.type === 'clear_action_calls') {
        dispatch({ type: 'clearActionCalls' });
      } else {
        dispatch({ type: 'addActionCall', actionCall });
      }
    });
    instance.on('sortFeed', (option: FeedSortOption) => {
      dispatch({ type: 'setFeedSort', option });
    });
    instance.on('pagination', (loading) => {
      dispatch({ type: 'togglePagination', loading });
    });
  }, []);
  const serverBehaviorJson = JSON.stringify(serverBehavior || null);
  const controller = useMemo(() => {
    const controllerInstance = new FeedCardController(
      organizationId,
      socketURL,
      analytics,
      JSON.parse(serverBehaviorJson),
    );
    initControllerCallbacks(controllerInstance);
    return controllerInstance;
  }, [
    organizationId,
    socketURL,
    initControllerCallbacks,
    serverBehaviorJson,
    analytics,
  ]);
  if (controller.status.state === 'initial') {
    controller.initState();
  }
  return { controller, state };
}
