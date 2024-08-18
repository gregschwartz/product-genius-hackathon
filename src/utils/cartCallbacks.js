/* eslint-disable no-undef */
/* eslint-disable guard-for-in */
// @flow
import safeLocalStorage from './safeLocalStorage';
import type { CallbackNodeConfig, CartFlowAction } from '../entities';

export async function getShopifyCartData(): Promise<any> {
  try {
    return await fetch(`${window.Shopify.routes.root}cart.js`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json());
  } catch (error) {
    console.error(error);
  }
  return null;
}

type UpdateSections = {
  sections: { [string]: string }
}

// Manually updates the VPS mini-cart content:
// This is a modified implementation of window.usi_app.add_item_minicart
// since the original method has a bug where if the cart is empty it fails
// to locate the ".mini-cart__inner" class element.
async function updateVPScart(payload: UpdateSections) {
  try {
    for (const sectionKey in payload.sections) {
      const newContent = document.createElement('div');
      newContent.innerHTML = payload.sections[sectionKey];
      const emptyCart = document.querySelector('.mini-cart__content--empty');
      if (emptyCart) {
        emptyCart.className = 'mini-cart__inner';
      }
      const nextCartContent = newContent.querySelector('.mini-cart__inner');
      const currentCartContent = document.querySelector('.mini-cart__inner');
      if (nextCartContent && currentCartContent) {
        currentCartContent.innerHTML = nextCartContent.innerHTML;
      }
      const cartCounter = document.querySelector('.header__cart-count');
      if (cartCounter && cartCounter.textContent) {
        // $FlowIgnore
        cartCounter.textContent = Number(cartCounter.textContent) + 1;
      }
      const targetElement = document.querySelector('.header__cart-toggle');
      if (targetElement) {
        if (targetElement.getAttribute('aria-expanded') !== 'true') {
          targetElement.click();
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateLBYcart() {
  function updateInlineContent(newContent: HTMLDivElement) {
    // $FlowIgnore
    const currentCartData = newContent.firstChild?.getAttribute(
      'data-section-settings',
    );
    if (currentCartData) {
      const parsedCartData = JSON.parse(currentCartData);
      if (parsedCartData && parsedCartData.itemCount) {
        const cartCountNode = document.querySelector('.Header__CartCount');
        const cartItemsNode = document.querySelector('.Header__CartDot');
        if (cartCountNode) {
          cartCountNode.innerHTML = parsedCartData.itemCount;
        }
        if (
          cartItemsNode
            && !cartItemsNode.classList.contains('is-visible')
        ) {
          cartItemsNode.classList.add('is-visible');
        }
      }
    }
  }
  function updateSidebarContent(newContent: HTMLDivElement) {
    const sidebarCart = document.getElementById('sidebar-cart');
    if (sidebarCart) {
      const nextCartContent = newContent.querySelector('.Drawer__Content');
      const currentCartContent = sidebarCart.querySelector('.Drawer__Content');
      if (nextCartContent && currentCartContent) {
        currentCartContent.innerHTML = nextCartContent.innerHTML;
      }
    }
  }
  try {
    const request = new XMLHttpRequest();
    request.open('GET', `/cart?view=drawer&timestamp=${Date.now()}`);
    request.setRequestHeader('Content-type', 'application/json');
    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.responseText) {
        const newContent = document.createElement('div');
        newContent.innerHTML = request.responseText;
        updateInlineContent(newContent);
        updateSidebarContent(newContent);
        const cartNode = document.querySelector(
          'a[href="/cart"][data-action="open-drawer"]',
        );
        if (cartNode) {
          cartNode.click();
        }
      }
    };
    request.send();
  } catch (error) {
    console.error(error);
  }
}

async function updateScentChipsCart() {
  try {
    const request = new XMLHttpRequest();
    request.open('GET', '/cart?view=ajax');
    request.setRequestHeader('Content-type', 'application/json');
    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.responseText) {
        const cartNode = document.querySelector('.js-mini-cart-trigger');
        if (cartNode) {
          cartNode.click();
        }
      }
    };
    request.send();
  } catch (error) {
    console.error(error);
  }
}

async function updateCartNode() {
  try {
    const { callbackConfig } = JSON.parse(
      safeLocalStorage.getItem('GAMALON-pg-cart-config')
        || '{"callbackConfig":{}}',
    );
    if (callbackConfig && callbackConfig.nodes) {
      const callbackNodes: Array<CallbackNodeConfig> = callbackConfig.nodes;
      if (callbackNodes.length !== 0) {
        const cartData = await getShopifyCartData();
        if (cartData && cartData.item_count) {
          const { item_count: count = 0 } = cartData;
          callbackConfig.nodes.forEach((config: CallbackNodeConfig) => {
            const {
              type,
              value = '',
              selector = '',
              prefix = '',
              suffix = '',
              suffixForm = '',
              attribute = '',
            } = config;
            const nodeSelector = document.querySelector(selector);
            if (nodeSelector) {
              if (type === 'set') {
                if (attribute && value) {
                  nodeSelector.setAttribute(attribute, value);
                }
              } else if (type === 'update') {
                if (attribute) {
                  nodeSelector.setAttribute(attribute, count);
                } else {
                  let suffixFormatted = suffix;
                  if (suffixForm) {
                    suffixFormatted = count === 1 ? suffix : `${suffix}${suffixForm}`;
                  }
                  nodeSelector.innerHTML = `${prefix}${count}${suffixFormatted}`;
                }
              }
            }
          });
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateBaileysCbdCart() {
  try {
    const cartNode = document.querySelector('#cart-count');
    if (cartNode) {
      cartNode.click();
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateLeatherNeckCart() {
  if (window.SLIDECART_UPDATE) {
    window.SLIDECART_UPDATE();
  }
  if (window.SLIDECART_OPEN) {
    window.SLIDECART_OPEN();
  }
}

function findSectionNodes(node: HTMLElement) {
  const result: {
    target: HTMLElement | null,
    source: HTMLElement | null,
  } = {
    target: null,
    source: null,
  };
  function traverseChildren(currentNode: HTMLElement) {
    if (!currentNode) {
      return;
    }
    if (currentNode.id) {
      const target = document.getElementById(currentNode.id);
      if (target) {
        result.target = target;
        result.source = currentNode;
        return;
      }
    }
    if (
      currentNode.className
      && currentNode.className.trim() !== ''
      && currentNode.className !== 'shopify-section'
    ) {
      const target = document.getElementsByClassName(currentNode.className)[0];
      if (target) {
        result.target = target;
        result.source = currentNode;
        return;
      }
    }
    currentNode.childNodes.forEach((child) => {
      if (child.nodeType === 1 && child instanceof HTMLElement) {
        traverseChildren(child);
      }
    });
  }
  traverseChildren(node);
  return result;
}

async function updateCartSections(payload: UpdateSections) {
  if (!payload || !payload.sections) {
    return;
  }
  for (const sectionKey in payload.sections) {
    const node = document.createElement('div');
    node.innerHTML = payload.sections[sectionKey];
    const { target, source } = findSectionNodes(node);
    if (target && source) {
      target.innerHTML = source.innerHTML;
    }
  }
}

async function triggerCartFlow() {
  const { cartFlow } = JSON.parse(
    safeLocalStorage.getItem('GAMALON-pg-cart-config') || '{}',
  );

  if (cartFlow) {
    cartFlow.forEach((step: CartFlowAction) => {
      if (step.type === 'node_set') {
        const node = document.querySelector(step.selector);
        if (node && step.prop) {
          node.setAttribute(step.prop, step.value);
        }
      } else if (step.type === 'node_click') {
        const node = document.querySelector(step.selector);
        if (node) {
          node.click();
        }
      }
    });
  }
}

async function dispatchNotification(content: { [string]: string }) {
  const NotificationConstructor = customElements.get('cart-notification');
  if (NotificationConstructor) {
    const notification = new NotificationConstructor();
    if (notification && notification.renderContents && content) {
      notification.renderContents(content);
    }
  }
}

async function updateCymbiotika() {
  try {
    // $FlowIgnore
    if (typeof Cart !== 'undefined') {
      // $FlowIgnore
      Cart.getCart();
      const cartButton = document.querySelector('#navbar__cart');
      if (cartButton) {
        cartButton.click();
      }
    }
  } catch (error) {
    console.error(error);
  }
}

export {
  updateVPScart,
  updateCartNode,
  updateLBYcart,
  updateCymbiotika,
  updateScentChipsCart,
  updateBaileysCbdCart,
  updateLeatherNeckCart,
  triggerCartFlow,
  dispatchNotification,
  updateCartSections,
};
