// @flow
import React from 'react';
import type { Node } from 'react';
import { m } from 'framer-motion';

import { RenderingContext } from '../../hooks';
import { type Product } from '../../entities';

// $FlowIgnore
import './bannerCheckoutLegacy.scss';
import { AppButton } from '../AppComponents';

type ChatThreadBannerCheckoutProps = {
  product: Product,
  offset: number,
  onCloseBanner: () => void,
  onCheckout: () => void,
};

function ChatThreadBannerCheckout({
  product,
  offset,
  onCloseBanner,
  onCheckout,
}: ChatThreadBannerCheckoutProps): Node {
  return (
    <RenderingContext contextKey="feedNotification">
      <m.div
        className="pg-banner-legacy"
        initial={{ opacity: 0, y: offset + 10 }}
        exit={{ opacity: 0, y: offset + 20 }}
        animate={{ opacity: 1, y: offset }}
        transition={{
          type: 'tween',
          duration: 0.25,
        }}
      >
        <div className="legacy-banner-action">
          <span style={{ paddingRight: 4 }}>&#10003;</span>
          {' '}
          Added
        </div>
        <div title={product.title} className="legacy-banner-title">
          {product.title}
        </div>
        <div style={{ whiteSpace: 'nowrap' }}>
          <AppButton
            size="m"
            type="cart"
            style={{ marginRight: 10, flexShrink: 0 }}
            onClick={() => {
              onCheckout();
            }}
          >
            Checkout &#x2192;
          </AppButton>
          <AppButton
            type="ghost"
            style={{ padding: '2px 6px' }}
            onClick={onCloseBanner}
          >
            &#x2715;
          </AppButton>
        </div>
      </m.div>
    </RenderingContext>
  );
}

export default ChatThreadBannerCheckout;
