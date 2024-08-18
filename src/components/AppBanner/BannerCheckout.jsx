// @flow
import React from 'react';
import type { Node } from 'react';

import type { Product, CartDataPG } from '../../entities';
import { extractCartData } from '../../utils/cartUtils';
import { AppButton, AppImage } from '../AppComponents';

type BannerCheckoutProps = {
  cart: CartDataPG,
  product: Product,
  onCheckout: () => void,
  onViewCart: () => void,
};

function BannerCheckout({
  cart,
  product,
  onCheckout,
  onViewCart,
}: BannerCheckoutProps): Node {
  const { itemCount, itemTotalFormatted } = extractCartData(cart);

  const renderCartTitle = (): Node => (
    <>
      {`Cart subtotal ${itemCount} (item${itemCount > 1 ? 's' : ''}):`}
      <span className="pg-banner-text __price" style={{ paddingLeft: 3 }}>
        $
        {itemTotalFormatted}
      </span>
    </>
  );

  return (
    <div className="pg-banner-content">
      <div
        className="pg-banner-space"
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          className="pg-banner-space"
          style={{ paddingRight: 15, flexShrink: 0 }}
        >
          <AppImage
            imageURL={product.image_url ? `${product.image_url}&width=45` : ''}
            style={{
              height: 45,
              width: 45,
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.13)',
            }}
          />
        </div>
        <div className="pg-banner-space">
          <div className="pg-banner-action">&#10003; Added to Cart</div>
          <div className="pg-banner-text __sm">{renderCartTitle()}</div>
        </div>
        <div
          className="pg-banner-space"
          style={{ flexGrow: 1, textAlign: 'right' }}
        >
          <AppButton
            size="m"
            type="border"
            onClick={() => {
              onViewCart();
            }}
          >
            View Cart
          </AppButton>
        </div>
      </div>
      <div
        className="pg-banner-space"
        style={{ flexShrink: 0, paddingTop: 14 }}
      >
        <AppButton
          size="l"
          type="cart"
          style={{ width: '100%' }}
          onClick={() => {
            onCheckout();
          }}
        >
          Checkout &#x2192;
        </AppButton>
      </div>
    </div>
  );
}

export default BannerCheckout;
