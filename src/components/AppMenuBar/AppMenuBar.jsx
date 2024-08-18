// @flow
import React, { useContext, useEffect } from 'react';
import { m } from 'framer-motion';
import { v4 as uuid } from 'uuid';
import type { Node } from 'react';

import type { AppFeedState, CardFeedState } from '../../entities';
import type { ChatController } from '../../ChatController';

import HomeIcon from '../../assets/icons/pg-menu-home.svg';
import SearchIcon from '../../assets/icons/pg-menu-search.svg';
import CartIcon from '../../assets/icons/pg-menu-cart.svg';
import { extractCartData } from '../../utils/cartUtils';
import { DesignContext } from '../../context';
// $FlowIgnore
import './appMenuBar.scss';

type AppMenuItemProps = {
  name: string,
  icon: Node,
  content: Node,
  suffix?: Node,
  onSelect: (name: string) => void,
};

export function AppMenuItem({
  name,
  icon,
  content,
  suffix,
  onSelect,
}: AppMenuItemProps): Node {
  return (
    <m.div
      data-name={name}
      className="pg-menu-item"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onSelect(name);
      }}
    >
      <div className="pg-menu-item-icon">{icon}</div>
      <div className="pg-menu-item-content">
        {content}
        {suffix && suffix}
      </div>
    </m.div>
  );
}

AppMenuItem.defaultProps = {
  suffix: null,
};

type AppMenuBarProps = {
  state: AppFeedState,
  controller: ChatController,
};

function getActiveMenuState(
  feed: CardFeedState,
  key: 'browse' | 'find',
): boolean {
  const { feedSource, feedCards } = feed;
  if (feedSource !== 'HOME') return true;
  if (key === 'find') {
    return feedCards.length !== 1 && feedCards[0].type !== 'text_input_card';
  }
  if (key === 'browse') {
    return feedCards.length === 1 && feedCards[0].type === 'text_input_card';
  }
  return false;
}

function AppMenuBar({ state, controller }: AppMenuBarProps): Node {
  const { embedded: { menu } } = useContext(DesignContext);
  useEffect(() => {
    if (menu.visible) {
      const root = document.querySelector(':root');
      if (root) {
        root.style.setProperty('--pg-height-app-menu', '55px');
      }
    }
  }, [menu.visible]);

  if (!menu.visible) return null;
  const { itemCount } = extractCartData(state.cart);

  const handleOnSelect = (name: string) => {
    if (name === 'cart') {
      controller.callbacks.callToAction({ type: 'clear_action_calls' });
      controller.callbacks.overlay({
        cart: {
          visible: Boolean(!state.overlay.cart?.visible),
        },
      });
    } else if (name === 'browse' || name === 'find') {
      if (getActiveMenuState(state.feed, name)) {
        // $FlowIgnore
        controller.sendVisitorMessage(
          {
            type: 'visitor_button_click',
            source: {
              message_id: 'HOME',
              button_id: 'clear',
            },
            id: uuid(),
            payload: { type: 'clear', search: name === 'find' },
            action_language: 'clear constraints',
          },
          'clear button',
        );
      }
    }
  };

  return (
    <m.div className="pg-app-menu">
      <div className="pg-app-menu-group">
        <AppMenuItem
          name="browse"
          icon={<HomeIcon />}
          content="Browse"
          onSelect={handleOnSelect}
        />
        <AppMenuItem
          name="find"
          icon={<SearchIcon />}
          content="Find"
          onSelect={handleOnSelect}
        />
        <AppMenuItem
          name="cart"
          icon={<CartIcon />}
          content="Cart"
          onSelect={handleOnSelect}
          suffix={
            itemCount ? (
              <div
                className="pg-menu-item-suffix"
                style={{
                  top: -4,
                  right: 10,
                }}
              >
                {Math.min(itemCount, 9)}
              </div>
            ) : null
          }
        />
      </div>
    </m.div>
  );
}

export default AppMenuBar;
