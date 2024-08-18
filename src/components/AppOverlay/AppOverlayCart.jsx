// @flow
import React, { useContext } from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

import type { CartDataPG, Product, FeedCard } from '../../entities';
import { extractCartData, extractCouponData } from '../../utils/cartUtils';
import AppMinimizeButton from '../AppMinimize/AppMinimizeButton';
import CartItem from '../AppCart/CartItem';
import { MobileContext } from '../../context';
import { FeedQuestionCardDefault } from '../FeedCards';
import { AppButton } from '../AppComponents';

type AppOverlayCartProps = {
  cart: CartDataPG,
  lingerCards: Array<FeedCard>,
  onCloseLayout: () => void,
  onCheckout: () => void,
  onSearchFeed: () => void,
  onRemoveEntry: (product: Product) => void,
  onIncrementEntry: (product: Product) => void,
  onDecrementEntry: (product: Product) => void,
};

/**
 * Renders the cart overlay.
 * @returns {React.Node} Rendered content.
 */
function AppOverlayCart({
  cart,
  lingerCards,
  onCloseLayout,
  onCheckout,
  onSearchFeed,
  onRemoveEntry,
  onIncrementEntry,
  onDecrementEntry,
}: AppOverlayCartProps): Node {
  const isMobile = useContext(MobileContext);
  const couponData = extractCouponData();
  const {
    items, itemCount, itemTotalDiscountFormatted, itemTotalFormatted,
  } = extractCartData(cart);

  const renderCartTitle = (): Node => {
    if (itemCount !== 0) {
      return (
        <div
          className="app-overlay-section"
          style={{
            padding: '15px 15px 22px 15px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <span style={{ paddingBottom: 20 }} className="app-overlay-text __xl">
            Shopping Cart
          </span>
          <span style={{ paddingBottom: 5 }} className="app-overlay-text __md">
            {`Subtotal ${itemCount} (item${itemCount > 1 ? 's' : ''}):`}
          </span>
          {itemTotalDiscountFormatted ? (
            <span className="app-overlay-text __price">
              $
              {itemTotalFormatted}
              <span style={{ padding: '0px 4px' }}>&#x2192;</span>
              <span style={{ fontWeight: 600 }}>
                $
                {itemTotalDiscountFormatted}
              </span>
            </span>
          ) : (
            <span className="app-overlay-text __price">
              $
              {itemTotalFormatted}
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  const renderCartCoupon = (): Node => {
    if (itemCount !== 0 && couponData) {
      return (
        <div
          className="app-overlay-section"
          style={{
            padding: '15px',
            flexShrink: 0,
            display: 'flex',
            position: 'relative',
            background: '#E0FFF2',
            border: '1px solid #1EBB79',
            width: 'calc(100% - 20px)',
            borderRadius: '6px',
            left: '10px',
            marginBottom: '10px',
          }}
        >
          <div className="app-overlay-section" />
          <div
            className="app-overlay-section"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <span
              className="app-overlay-text __xl"
              style={{
                paddingBottom: '6px',
                color: '#0C814F',
                lineHeight: '15px',
                fontWeight: 500,
              }}
            >
              {`${couponData.discount}% off`}
              {' '}
              <span style={{ fontWeight: 600 }}>{couponData.code}</span>
              {' '}
              coupon
              applied
            </span>
            <span
              className="app-overlay-text __md"
              style={{ color: '#0C814F', lineHeight: '13px' }}
            >
              Checkout to see final savings.
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderLingerCards = (): Node => {
    if (lingerCards.length !== 0) {
      return (
        <div
          className="pg-portal-feed"
          style={{ backgroundColor: 'transparent', height: 'auto' }}
        >
          {lingerCards.map((card) => {
            if (card.type === 'question_answer_default_card') {
              return <FeedQuestionCardDefault key={card.id} card={card} />;
            }
            return null;
          })}
        </div>
      );
    }
    return null;
  };

  const renderCartContent = (): Node => {
    if (itemCount !== 0) {
      return (
        <div className="app-overlay-section">
          {items.map((cartEntry) => (
            <CartItem
              key={cartEntry.item.variant_id}
              cartEntry={cartEntry}
              onRemoveEntry={onRemoveEntry}
              onIncrementEntry={onIncrementEntry}
              onDecrementEntry={onDecrementEntry}
            />
          ))}
          {renderLingerCards()}
        </div>
      );
    }
    return (
      <div
        className="app-overlay-section"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          userSelect: 'none',
        }}
      >
        <img
          alt="empty cart"
          src="https://firebasestorage.googleapis.com/v0/b/gamalon-emailabz-integration.appspot.com/o/__GLOBAL%2Fimages%2Fpg%2Fpg-empty-cart-img.png?alt=media&token=3a1c97f0-9e65-4d59-b0db-92fd97216386"
          style={{ position: 'relative', left: 24 }}
        />
        <span className="app-overlay-text __xl" style={{ paddingTop: 15 }}>
          Your cart is empty.
        </span>
        <span
          className="app-overlay-text __md"
          style={{
            paddingTop: 5,
            color: ' #7B7B7B',
          }}
        >
          Looking for something specific?
          {' '}
          <m.span
            style={{
              color: '#312DFF',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSearchFeed();
            }}
          >
            Search for it.
          </m.span>
        </span>
      </div>
    );
  };

  return (
    <m.div
      data-mobile={isMobile}
      className="app-overlay"
      initial={{ opacity: 0, y: 20 }}
      exit={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, type: 'tween' }}
    >
      <AppMinimizeButton
        style={{
          top: 6,
          right: 6,
          height: 33,
          width: 33,
          fontSize: 18,
          zIndex: 2,
        }}
        onMinimize={() => {
          onCloseLayout();
        }}
      />
      <div
        className="app-overlay-content"
        style={{
          position: 'relative',
          height: 'calc(100% - var(--pg-height-app-menu, 0px))',
          width: '100%',
          backgroundColor: '#F8F8F8',
        }}
      >
        {renderCartTitle()}
        {renderCartCoupon()}
        {renderCartContent()}
        <div
          className="app-overlay-section"
          style={{
            display: 'flex',
            flexGrow: 1,
            zIndex: 6,
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            position: 'relative',
            padding: '15px 15px 30px 15px',
          }}
        >
          <AppButton
            size="l"
            type="cart"
            disabled={itemCount === 0}
            style={{ width: '100%' }}
            onClick={() => {
              onCheckout();
            }}
          >
            Checkout &#x2192;
          </AppButton>
        </div>
      </div>
    </m.div>
  );
}

export default AppOverlayCart;
