// @flow
/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { v4 as uuid } from 'uuid';
import type { Node } from 'react';

import AppOverlayCart from './AppOverlayCart';
import type { ChatController } from '../../ChatController';
import type {
  Product,
  CallToAction,
  AppFeedState,
  FeedOverlay,
} from '../../entities';
import {
  onCallToActionCart,
  handleCheckoutAction,
} from '../../utils/cartUtils';
import { useFetchLingerCards } from '../../hooks';

// $FlowIgnore
import './appOverlay.scss';

function getActiveOverlay(overlay: FeedOverlay): 'cart' | 'product' | 'none' {
  if (overlay?.cart?.visible) return 'cart';
  return 'none';
}

type AppOverlayProps = {
  state: AppFeedState,
  controller: ChatController,
};

function AppOverlay({ state, controller }: AppOverlayProps): Node {
  const { overlay, cart, lingerCards } = state;
  const activeOverlay = getActiveOverlay(overlay);
  useFetchLingerCards({ state, activeOverlay, controller });

  const onCallToAction = React.useCallback(async (action: CallToAction) => {
    if (
      action.type === 'add_to_cart'
      || action.type === 'remove_from_cart'
      || action.type === 'increment_cart_item'
      || action.type === 'decrement_cart_item'
    ) {
      await onCallToActionCart(controller, action);
    }
  }, []);

  const onRemoveEntry = React.useCallback(
    (product: Product) => {
      onCallToAction({
        type: 'remove_from_cart',
        product,
      });
    },
    [onCallToAction],
  );

  const onIncrementEntry = React.useCallback(
    (product: Product) => {
      onCallToAction({
        type: 'increment_cart_item',
        product,
      });
    },
    [onCallToAction],
  );

  const onDecrementEntry = React.useCallback(
    (product: Product) => {
      onCallToAction({
        type: 'decrement_cart_item',
        product,
      });
    },
    [onCallToAction],
  );

  const onCheckout = () => {
    handleCheckoutAction(controller);
  };

  const onCloseLayout = () => {
    controller.callbacks.overlay({});
  };

  const onSearchFeed = () => {
    controller.sendVisitorMessage(
      {
        type: 'visitor_button_click',
        source: {
          message_id: 'HOME',
          button_id: 'clear',
        },
        id: uuid(),
        payload: { type: 'clear', search: true },
        action_language: 'clear constraints',
      },
      'clear button',
    );
    controller.callbacks.overlay({});
  };

  const renderAppOverlay = () => {
    if (activeOverlay === 'cart') {
      return (
        <AppOverlayCart
          cart={cart}
          lingerCards={lingerCards.cards}
          onCheckout={onCheckout}
          onCloseLayout={onCloseLayout}
          onSearchFeed={onSearchFeed}
          onRemoveEntry={onRemoveEntry}
          onIncrementEntry={onIncrementEntry}
          onDecrementEntry={onDecrementEntry}
        />
      );
    }
    return null;
  };
  return renderAppOverlay();
}

export default AppOverlay;
