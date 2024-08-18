// @flow
import React from 'react';
import type { Node } from 'react';

import type { CartDataPG, CouponCardInfo } from '../../entities';
import { extractCartData } from '../../utils/cartUtils';
import { AppButton } from '../AppComponents';

type BannerCouponProps = {
  cart: CartDataPG,
  coupon: CouponCardInfo,
  onCheckout: () => void,
  onViewCart: () => void,
};

function BannerCoupon({
  cart,
  coupon,
  onCheckout,
  onViewCart,
}: BannerCouponProps): Node {
  const { itemCount } = extractCartData(cart);

  return (
    <div className="pg-banner-content">
      <div
        className="pg-banner-space"
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="pg-banner-space">
          <div style={{ color: '#ffffff' }} className="pg-banner-action">
            <span style={{ paddingRight: 6 }}>&#10003;</span>
            {coupon.banner ? coupon.banner : `${coupon.discount}% Coupon applied.`}
          </div>
        </div>
        {itemCount !== 0 && (
          <div
            className="pg-banner-space"
            style={{ flexGrow: 1, textAlign: 'right' }}
          >
            <AppButton
              size="m"
              type="border"
              style={{ '--pg-color-bk-btn': '#ffffff' }}
              onClick={() => {
                onViewCart();
              }}
            >
              View Cart
            </AppButton>
          </div>
        )}
      </div>
      {itemCount !== 0 && (
        <div
          className="pg-banner-space"
          style={{ flexShrink: 0, paddingTop: 14 }}
        >
          <AppButton
            size="l"
            disabled={itemCount === 0}
            style={{
              width: '100%',
              '--pg-color-btn': '#000000',
              '--pg-color-bk-btn': '#ffffff',
            }}
            onClick={() => {
              onCheckout();
            }}
          >
            Checkout &#x2192;
          </AppButton>
        </div>
      )}
    </div>
  );
}

export default BannerCoupon;
