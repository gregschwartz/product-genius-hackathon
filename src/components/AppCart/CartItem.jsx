// @flow
import React from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

import type { CartEntryPG, Product } from '../../entities';
import { getProductAttributes } from '../../utils/componentUtils';
import { getQuantityPrice } from '../../utils/cartUtils';

// $FlowIgnore
import './cartItem.scss';

import MinusIcon from '../../assets/icons/pg-minus.svg';
import PlusIcon from '../../assets/icons/pg-plus.svg';
import { AppButton, AppImage } from '../AppComponents';

type CartItemProps = {
  cartEntry: CartEntryPG,
  onRemoveEntry: (product: Product) => void,
  onIncrementEntry: (product: Product) => void,
  onDecrementEntry: (product: Product) => void,
};

function CartItem({
  cartEntry,
  onRemoveEntry,
  onIncrementEntry,
  onDecrementEntry,
}: CartItemProps): Node {
  const { item: product, quantity } = cartEntry;
  const { price, currency_code: currency = '' } = getProductAttributes(product.attributes);
  return (
    <m.div
      className="pg-cart-item"
      initial={{ opacity: 0, y: 10 }}
      exit={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'tween',
        duration: 0.2,
      }}
    >
      <m.div className="cart-item-content">
        <div className="cart-item-img">
          <AppImage
            hover
            imageURL={product.image_url ? `${product.image_url}&width=240` : ''}
            style={{
              height: '100%',
              width: 74,
              borderRight: '1px solid #ececec',
              borderRadius: '6px 0px 0px 6px',
            }}
          />
        </div>
        <div
          className="cart-item-space"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            className="cart-item-space"
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 18px 10px 15px',
            }}
          >
            <div
              title={product.title}
              className="cart-item-title"
              style={{ paddingRight: 15 }}
            >
              {product.title}
            </div>
            <div className="cart-item-price">
              {`${currency}${getQuantityPrice(price, quantity).toLocaleString(
                'en-US',
              )}`}
            </div>
          </div>
          <div
            className="cart-item-space"
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0px 10px 10px 15px',
            }}
          >
            <div className="cart-tool-quantity">
              <button
                type="button"
                className="cart-tool-quantity-btn __minus"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDecrementEntry(product);
                }}
              >
                <MinusIcon />
              </button>
              <div className="cart-tool-quantity-value">{quantity}</div>
              <button
                type="button"
                className="cart-tool-quantity-btn __plus"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onIncrementEntry(product);
                }}
              >
                <PlusIcon />
              </button>
            </div>
            <AppButton
              size="m"
              style={{ fontWeight: 500 }}
              type="border"
              onClick={() => {
                onRemoveEntry(product);
              }}
            >
              Remove
            </AppButton>
          </div>
        </div>
      </m.div>
    </m.div>
  );
}

export default CartItem;
