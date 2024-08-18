// @flow
import React, { useContext } from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';
import type {
  HeaderCard,
  ProductSummaryCard,
  AddToCartCB,
} from '../../entities';
import { useTrackDurationsPDF } from './feedTracker';

import BackIcon from '../../assets/icons/pg-arrow-left.svg';
import {
  getHeaderContentType,
  getProductAttributes,
} from '../../utils/componentUtils';

// $FlowIgnore
import './feedPortalHeader.scss';
import { cartButtonTitle } from '../../utils/cartUtils';
import { RenderingContext } from '../../hooks';
import { DesignContext } from '../../context';
import { AppButton } from '../AppComponents';

type FeedPortalHeaderNavProps = {
  headerCard: ?HeaderCard,
  onPreviousRoute: () => void | Promise<void>,
  onNavigateTimeline: (any) => void | Promise<void>,
};

function FeedPortalHeaderNav({
  headerCard,
  onPreviousRoute,
  onNavigateTimeline,
}: FeedPortalHeaderNavProps) {
  const { navigation } = useContext(DesignContext);
  if (navigation.type === 'breadcrumbs') {
    if (!headerCard?.payload?.timeline) {
      return null;
    }
    const { current_index: index, state_frames: frames } = headerCard.payload.timeline;
    if (index === 0) return null;
    return (
      <m.div data-content="nav-breadcrumbs" className="pg-portal-header">
        <div className="pg-portal-breadcrumb">
          {frames.slice(0, index + 1).map((frame, idx) => {
            const frameKey = frame.title || 'Home';
            return (
              <m.div
                key={frameKey}
                className="pg-portal-crumb"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (index !== idx) {
                    onNavigateTimeline({
                      n: index - idx,
                      timeline: headerCard.payload.timeline,
                      type: 'restore_previous_state',
                    });
                  }
                }}
              >
                {frameKey}
              </m.div>
            );
          })}
        </div>
      </m.div>
    );
  }

  return (
    <RenderingContext contextKey="feedNavigation">
      <m.div
        data-content="nav"
        className="pg-portal-header"
        initial={{ opacity: 0, y: -5 }}
        exit={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'tween',
          duration: 0.25,
          delay: 0.1,
        }}
      >
        <div className="pg-portal-header-content">
          <m.div
            className="pg-portal-header-btn"
            style={{ top: 2, left: 3 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPreviousRoute();
            }}
          >
            <BackIcon />
          </m.div>
          {headerCard?.page_title && (
            <div className="pg-portal-header-title">
              {headerCard?.page_title}
            </div>
          )}
        </div>
      </m.div>
    </RenderingContext>
  );
}

type FeedPortalHeaderCartProps = {
  summaryCard: ProductSummaryCard,
  onPreviousRoute: () => void | Promise<void>,
  onAddToCart: AddToCartCB,
};

function FeedPortalHeaderCart({
  summaryCard,
  onPreviousRoute,
  onAddToCart,
}: FeedPortalHeaderCartProps) {
  const { price, currency_code: currency = '' } = getProductAttributes(
    summaryCard.product.attributes,
  );

  const buttonTitle = cartButtonTitle(summaryCard.product);
  return (
    <m.div
      data-content="cart"
      className="pg-portal-header"
      initial={{ opacity: 0, y: -5 }}
      exit={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'tween',
        duration: 0.25,
        delay: 0.1,
      }}
    >
      <div className="pg-portal-header-content">
        <m.div
          className="pg-portal-header-btn"
          style={{ top: 9, left: 9 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPreviousRoute();
          }}
        >
          <BackIcon />
        </m.div>
        <div
          className="pg-portal-header-group"
          style={{
            minWidth: 0,
            display: 'flex',
            whiteSpace: 'nowrap',
            flexDirection: 'column',
            padding: '0px 25px 0px 60px',
            flexGrow: 1,
          }}
        >
          <div className="pg-portal-header-text __md">
            {summaryCard.product.title}
          </div>
          {price && (
            <div
              className="pg-portal-header-text __md"
              style={{ color: '#858585', fontWeight: 400 }}
            >
              {`${currency}${price}`}
            </div>
          )}
        </div>
        <AppButton
          size="s"
          type={buttonTitle === 'Reorder' ? 'reorder' : 'cart'}
          style={{ marginRight: 9, flexShrink: 0 }}
          onClick={() => {
            onAddToCart(summaryCard.product);
          }}
        >
          {buttonTitle}
        </AppButton>
      </div>
    </m.div>
  );
}

type FeedPortalHeaderProps = {
  headerCard: ?HeaderCard,
  summaryCard: ?ProductSummaryCard,
  onPreviousRoute: () => void | Promise<void>,
  onAddToCart: AddToCartCB,
  onNavigateTimeline: (any) => void | Promise<void>,
};

function FeedPortalHeader({
  headerCard,
  summaryCard,
  onPreviousRoute,
  onAddToCart,
  onNavigateTimeline,
}: FeedPortalHeaderProps): Node {
  const contentType = getHeaderContentType(headerCard);
  useTrackDurationsPDF({ feedType: contentType, summaryCard, headerCard });
  if (contentType === 'empty') return null;

  const renderHeader = (): Node => {
    if (contentType === 'cart' && summaryCard) {
      return (
        <FeedPortalHeaderCart
          summaryCard={summaryCard}
          onPreviousRoute={onPreviousRoute}
          onAddToCart={onAddToCart}
        />
      );
    }
    return (
      <FeedPortalHeaderNav
        headerCard={headerCard}
        onPreviousRoute={onPreviousRoute}
        onNavigateTimeline={onNavigateTimeline}
      />
    );
  };

  return renderHeader();
}

const areEqual = (
  prevProps: FeedPortalHeaderProps,
  nextProps: FeedPortalHeaderProps,
): boolean => {
  if (prevProps.headerCard !== nextProps.headerCard) return false;
  return true;
};

// $FlowIgnore
export default React.memo<FeedPortalHeaderProps>(FeedPortalHeader, areEqual);
