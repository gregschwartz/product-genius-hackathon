// @flow
import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
} from 'react';
import type { Node } from 'react';
import { v4 as uuid } from 'uuid';
import { createPortal } from 'react-dom';
import { DesignContext, MobileContext } from '../context';

import type {
  FeedCard,
  AppFeedState,
  FacetValueCard,
} from '../entities';
import type { ChatController } from '../ChatController';

/**
 * Checks if the screen width is less then or equals to specified value.
 * @param {number} screenWidth Screen width to check
 * @returns {boolean} Result conditional
 */
export const useCheckScreenWidth = (screenWidth: number = 800): boolean => {
  const [isActiveWidth, setIsActiveWidth] = useState(
    window.innerWidth <= screenWidth,
  );
  const handleWindowSizeChange = useCallback(() => {
    setIsActiveWidth(window.innerWidth <= screenWidth);
  }, [screenWidth]);
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, [handleWindowSizeChange]);
  return isActiveWidth;
};

export const fallbackURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTciIGhlaWdodD0iNTciIHZpZXdCb3g9IjAgMCA1NyA1NyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUyLjEwMTYgMEg0Ljg5OTUyQzIuMTk3ODUgMCAwIDIuMTk3ODUgMCA0Ljg5OTUyVjUyLjEwMDVDMCA1NC44MDIxIDIuMTk3ODUgNTcgNC44OTk1MiA1N0g1Mi4xMDA1QzU0LjgwMjEgNTcgNTcgNTQuODAyMSA1NyA1Mi4xMDA1VjQuODk5NTJDNTcuMDAwNCAyLjE5Nzg1IDU0LjgwMjYgMCA1Mi4xMDA5IDBINTIuMTAxNlpNNTUuNTMxNiA0MC44MjY5TDM1LjQ5NjMgMjUuNDkyOUwyOC44OTQ5IDMyLjM2NjlMMTkuNDIzMyAyMy4zNDUxTDEuNDY5MjUgNDAuNTY5M1Y0Ljg5ODYzQzEuNDY5MjUgMy4wMDczOSAzLjAwODE3IDEuNDY4NTkgNC44OTkzIDEuNDY4NTlINTIuMTAwM0M1My45OTE5IDEuNDY4NTkgNTUuNTMwMyAzLjAwNzUgNTUuNTMwMyA0Ljg5ODYzTDU1LjUzMTYgNDAuODI2OVoiIGZpbGw9ImJsYWNrIiBmaWxsLW9wYWNpdHk9IjAuMjEiLz4KPHBhdGggZD0iTTUxIDE1QzUxIDE4LjMxMzggNDguNTM3NSAyMSA0NS41MDAyIDIxQzQyLjQ2MjQgMjEgNDAgMTguMzEzNyA0MCAxNUM0MCAxMS42ODYzIDQyLjQ2MjUgOSA0NS41MDAyIDlDNDguNTM3NSA5IDUxIDExLjY4NjMgNTEgMTVaIiBmaWxsPSJibGFjayIgZmlsbC1vcGFjaXR5PSIwLjIxIi8+Cjwvc3ZnPgo=';

type UseFetchLingerCardsProps = {
  state: AppFeedState,
  activeOverlay: 'cart' | 'product' | 'none',
  controller: ChatController,
};

export function useFetchLingerCards({
  state,
  activeOverlay,
  controller,
}: UseFetchLingerCardsProps) {
  const { cart, lingerCards } = state;
  const { flags } = useContext(DesignContext);

  useEffect(() => {
    if (flags.lingerCards && activeOverlay === 'cart') {
      const cartPIds = Object.keys(cart).map(
        (key) => cart[key].item.product_id,
      );
      if (lingerCards.productIds.join('') !== cartPIds.join('')) {
        controller.sendVisitorMessage(
          {
            type: 'visitor_linger_request',
            id: uuid(),
            product_ids: cartPIds,
          },
          'linger event',
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOverlay, cart, lingerCards.productIds, flags.lingerCards]);
}

type RenderingContextProps = {
  contextKey: string,
  children: Node,
};

export function RenderingContext({
  contextKey,
  children,
}: RenderingContextProps): Node {
  const {
    rendering: { context },
  } = useContext(DesignContext);
  if (context[contextKey] && context[contextKey].target) {
    const targetNode = document.querySelector(context[contextKey].target);
    if (targetNode) {
      let childElement = children;
      if (context[contextKey].style) {
        // $FlowIgnore
        childElement = React.Children.map(children, (child) => React.cloneElement(child, {
          // $FlowIgnore
          style: { ...child.props.style, ...context[contextKey].style },
        }));
      }
      return createPortal(childElement, targetNode);
    }
  }
  return children;
}

type UseShowFilterOptions = {
  visible: boolean,
  filterCards: Array<FacetValueCard>,
};

export function useShowFilterOptions(
  cards: Array<FeedCard>,
): UseShowFilterOptions {
  const isMobile = useContext(MobileContext);
  const { embedded: { filters } } = useContext(DesignContext);
  if (!filters.visible || isMobile || !cards || cards.length === 0) {
    return {
      visible: false,
      filterCards: [],
    };
  }
  const filterCards = cards.filter((card) => card.type === 'facet_value_card');
  return {
    visible: filterCards.length > 0,
    // $FlowIgnore
    filterCards,
  };
}
