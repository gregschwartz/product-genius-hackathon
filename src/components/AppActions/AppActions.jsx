// @flow
import React, { useContext } from 'react';
import type { Node } from 'react';

import type { AppFeedState } from '../../entities';
import type { ChatController } from '../../ChatController';
import { handleCheckoutAction } from '../../utils/cartUtils';
import AppBannerWrapper from '../AppBanner/AppBannerWrapper';
import BannerCheckout from '../AppBanner/BannerCheckout';
import BannerCoupon from '../AppBanner/BannerCoupon';
import { DesignContext } from '../../context';
import { clearUrlParams } from '../FeedPortal/util';

type AppActionsProps = {
  state: AppFeedState,
  controller: ChatController,
};

function AppActions({ state, controller }: AppActionsProps): Node {
  const { cart } = useContext(DesignContext);
  const { actionCalls } = state;

  const handleCloseBanner = () => {
    controller.callbacks.callToAction({ type: 'clear_action_calls' });
    controller.analytics.track('closed checkout banner');
  };

  const handleCheckout = () => {
    handleCheckoutAction(controller);
  };

  const handleViewCart = () => {
    controller.callbacks.callToAction({ type: 'clear_action_calls' });
    controller.callbacks.overlay({
      cart: {
        visible: true,
      },
    });
  };

  const renderActionBanners = (): Node => {
    if (actionCalls.length !== 0 && !state.loading) {
      const action = actionCalls[actionCalls.length - 1];
      if (action.type === 'add_to_cart') {
        if (cart.type === 'internal') {
          return (
            <AppBannerWrapper
              style={{ background: '#ffffff' }}
              key={action.product.variant_id}
              onCloseBanner={handleCloseBanner}
            >
              <BannerCheckout
                cart={state.cart}
                product={action.product}
                onCheckout={handleCheckout}
                onViewCart={handleViewCart}
              />
            </AppBannerWrapper>
          );
        }
      }
      if (action.type === 'add_coupon') {
        return (
          <AppBannerWrapper
            key={action.couponInfo.code}
            style={{ background: '#29C885', height: 'auto' }}
            onCloseBanner={() => {
              handleCloseBanner();
              clearUrlParams(['coupon']);
            }}
          >
            <BannerCoupon
              cart={state.cart}
              coupon={action.couponInfo}
              onCheckout={handleCheckout}
              onViewCart={handleViewCart}
            />
          </AppBannerWrapper>
        );
      }
    }
    return null;
  };

  return renderActionBanners();
}

export default AppActions;
