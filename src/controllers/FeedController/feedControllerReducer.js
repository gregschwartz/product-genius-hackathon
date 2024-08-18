/* eslint-disable no-param-reassign */
import { produce } from 'immer';
import type { AppFeedState } from '../../entities';

export default produce((draft: AppFeedState, action) => {
  switch (action.type) {
    case 'setFeedSort':
      draft.feed.feedSort = action.option;
      break;
    case 'addFeedCards': {
      draft.pagination = false;
      draft.feed.feedCards = draft.feed.feedCards.concat(action.feedCards);
      break;
    }
    case 'setFeedCards': {
      draft.loading = false;
      draft.feed = {
        feedSort: draft.feed.feedSort,
        feedCards: action.feedCards,
        feedId: action.feedId,
        feedSource: action.feedSource,
      };
      break;
    }
    case 'setLingerCards':
      draft.lingerCards.cards = action.cards;
      draft.lingerCards.productIds = action.productIds;
      draft.loading = false;
      break;
    case 'getFeedCards':
      draft.loading = true;
      break;
    case 'setOverlay':
      draft.overlay = action.overlay;
      break;
    case 'toggleLoading':
      draft.loading = action.loading;
      break;
    case 'addActionCall':
      if (action.actionCall.type === 'add_to_cart') {
        const cartEntry = draft.cart[action.actionCall.product.variant_id];
        if (cartEntry) {
          cartEntry.quantity += 1;
        } else {
          draft.cart[action.actionCall.product.variant_id] = {
            item: action.actionCall.product,
            quantity: 1,
          };
        }
      } else if (action.actionCall.type === 'remove_from_cart') {
        delete draft.cart[action.actionCall.product.variant_id];
      } else if (action.actionCall.type === 'increment_cart_item') {
        const cartEntry = draft.cart[action.actionCall.product.variant_id];
        if (cartEntry) {
          cartEntry.quantity += 1;
        }
      } else if (action.actionCall.type === 'decrement_cart_item') {
        const cartEntry = draft.cart[action.actionCall.product.variant_id];
        if (cartEntry) {
          if (cartEntry.quantity === 1) {
            delete draft.cart[action.actionCall.product.variant_id];
          } else {
            cartEntry.quantity -= 1;
          }
        }
      }
      draft.actionCalls.push(action.actionCall);
      break;
    case 'clearActionCalls':
      draft.actionCalls = [];
      break;
    case 'togglePagination':
      draft.pagination = action.loading;
      break;
    default:
      break;
  }
});
