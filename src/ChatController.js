// @flow
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
import type {
  ThreadMessage,
  VisitorMessage,
  ServerBehavior,
  CallToAction,
  FeedSortOption,
} from './entities';
import { Analytics } from './analytics';
import safeLocalStorage from './utils/safeLocalStorage';
import safeSessionStorage from './utils/safeSessionStorage';

/**
 * Sets local and session storage flags that indicate the visitor interacted
 * with the bot. These are used in conversion tracking to detect whether a
 * visitor who made a purchase had interacted with the bot.
 */
function setChatHappenedFlag() {
  safeLocalStorage.setItem('GAMALON-genius-chat-happened', 'true');
  safeSessionStorage.setItem('GAMALON-genius-chat-happened', 'true');
}

// Controller callback types
const emptyCallback = () => {};

export type ThreadMessages = Array<ThreadMessage>;

export type ChatControllerCallbackTypes =
  | 'loading'
  | 'overlay'
  | 'visitorMessage'
  | 'botMessage'
  | 'callToAction'
  | 'sortFeed'
  | 'pagination'

export type ChatControllerCallbacks = {
  loading: (boolean) => void,
  overlay: (any) => void,
  visitorMessage: (ThreadMessage) => void,
  botMessage: (ThreadMessage, any) => void,
  callToAction: (action: CallToAction) => void,
  sortFeed: (option: FeedSortOption) => void,
  pagination: (boolean) => void,
};

// Actions that a visitor might take
export type VisitorAction =
  | 'input' // Visitor entered something in the input field
  | 'button' // Visitor clicked a plain button
  | 'clear button' // Visitor clicked a "clear" (e.g. constraints) button
  | 'tag remove' // Visitor clicked a "tag" button
  | 'reconnect'
  | 'expand button' // Visitor clicked the button that toggles the expanded state
  | 'external event'
  | 'linger event';

/**
 * This is an abstract interface for a chat communication channel. There are
 * multiple implementations for communicating through different media
 * (websocket or Firestore). You call its methods, like
 * controller.sendVisitorMessage(), to send various info, and it calls a
 * callback whenever something has updated (whether because a message was sent,
 * or one was received). The complete message history is available as a
 * read-only property, plus a few state variables.
 *
 * To use in React, use the useChatController hook defined below.
 */
export class ChatController {
  #organizationId: string;
  #callbacks: ChatControllerCallbacks;
  #serverBehavior: ?ServerBehavior;
  #socketURL: string;
  #serverURL: string;
  // "Protected" properties
  _analytics: any;
  pagination: {
    enabled: boolean,
    step: number,
    offset: number,
  };

  /**
   * Abstract method to send a message over the channel. Subclassed
   * implementations need to implement this. This should call
   */
  async _sendVisitorMessage(message: VisitorMessage): void | Promise<void> {
    throw new Error('Abstract method');
  }

  /**
   * Adds data that is common to all visitor message types, including server
   * behavior information, if any server behavior is specified in the
   * configuration.
   * @param {VisitorMessage} message The message being sent; should not include
   * server_behavior.
   * @returns {VisitorMessage} A new message with server_behavior added.
   */
  _addCommonMessageData(message: VisitorMessage): VisitorMessage {
    const result = {
      ...message,
      current_url: window.location.href,
    };
    if (this.#serverBehavior) {
      result.server_behavior = this.#serverBehavior;
    }
    return result;
  }

  /**
   * Constructor
   * @param {string} organizationId org ID
   * @param {Analytics} analytics Rudder analytics
   */
  constructor(
    organizationId: string,
    analytics: Analytics,
    serverBehavior: ?ServerBehavior,
  ) {
    this.#organizationId = organizationId;
    this.#callbacks = {
      loading: emptyCallback,
      overlay: emptyCallback,
      visitorMessage: emptyCallback,
      botMessage: emptyCallback,
      callToAction: emptyCallback,
      sortFeed: emptyCallback,
      pagination: emptyCallback,
    };
    this.#serverBehavior = serverBehavior;
    this._analytics = analytics;
    this.pagination = {
      enabled: false,
      step: 5,
      offset: 5,
    };
  }

  /**
   * Cancel any subscriptions and release resources. Some derived classes may
   * not implement this because they're intended to stay active once they're
   * rendered.
   */
  cancel() {}

  get socketURL(): string {
    return this.#socketURL;
  }

  get serverURL(): string {
    return this.serverURL;
  }

  get organizationId(): string {
    return this.#organizationId;
  }

  get callbacks(): ChatControllerCallbacks {
    return this.#callbacks;
  }

  get visitorId(): string {
    return this._analytics.visitorId;
  }

  get sessionId(): string {
    return this._analytics.sessionId;
  }

  get analytics(): Analytics {
    return this._analytics;
  }

  get serverBehavior(): ?ServerBehavior {
    return this.#serverBehavior;
  }

  /**
   * Assigns callback functions to the controller class.
   * @param {ChatControllerCallbackTypes} cbType callback type
   * @param {Function} cbFunction callback function
   */
  on(cbType: ChatControllerCallbackTypes, cbFunction: Function): void {
    if (this.#callbacks[cbType]) {
      this.#callbacks[cbType] = cbFunction;
    }
  }

  /**
   * High-level function to send a message. This automatically updates other
   * state that should be updated whenever a message is sent (expands the UI,
   * etc.) and calls the low-level _sendVisitorMessage implemented differently
   * in each subclass.
   *
   * The serverBehavior property is added to the message by this function; it
   * should not be present in the message passed in.
   * @param {VisitorMessage} message The message to send
   * @param {VisitorAction} action How the visitor caused this message to be
   * sent. Generally "input" if they typed something, or "toggle button" if
   * they toggled it manually.
   */
  async sendVisitorMessage(message: VisitorMessage, action: VisitorAction) {
    setChatHappenedFlag();
    this._analytics.track(action, JSON.parse(JSON.stringify(message)));
    this._analytics.track('interacted');
    await this._sendVisitorMessage(this._addCommonMessageData(message));
  }
}
