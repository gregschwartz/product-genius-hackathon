// @flow
import type { VisitorMessage, ServerBehavior } from '../../entities';
import { ChatController } from '../../ChatController';
import { Analytics } from '../../analytics';
import { getServerUrl } from '../utils';

export class FeedCardController extends ChatController {
  #socketUrlBase: string;
  #status: { state: string };

  constructor(
    organizationId: string,
    socketUrlBase: string,
    analytics: Analytics,
    serverBehavior: ?ServerBehavior,
  ) {
    super(organizationId, analytics, serverBehavior);
    this.#socketUrlBase = socketUrlBase;
    this.#status = { state: 'initial' };
    this.initFeedEvents();
  }

  get serverURL(): string {
    return getServerUrl(
      this.#socketUrlBase,
      this.organizationId,
      this.visitorId,
      this.sessionId,
    );
  }

  get status(): { state: string } {
    return this.#status;
  }

  initStream(): void {
    const handleAppEvent = (event: CustomEvent) => {
      if (event.detail.type === 'stream-initial-cards' && event.detail.payload) {
        const response = event.detail.payload;
        if (response.cards) {
          this.#status.state = 'loaded';
          this.callbacks.botMessage({
            cards: response.cards,
            type: 'bot_message',
            id: `pg-card-stream-${response.cards.length}-${Date.now()}`,
          });
        }
      }
    };
    window.addEventListener('pg-stream-event', handleAppEvent);
    window.dispatchEvent(
      new CustomEvent('pg-stream-event', {
        detail: { type: 'get-stream-cards' },
      }),
    );
  }

  initFeedEvents(): void {
    const handleFeedEvent = (event: CustomEvent) => {
      if (event.detail.type === 'set-feed-cards' && event.detail.payload) {
        const response = event.detail.payload;
        if (response.cards) {
          this.#status.state = 'loaded';
          this.callbacks.botMessage({
            cards: response.cards,
            type: 'bot_message',
            id: `pg-card-feed-${response.cards.length}-${Date.now()}`,
          });
        }
      } else if (event.detail.type === 'add-feed-cards' && event.detail.payload) {
        this.#status.state = 'loaded';
        const nextCards = event.detail.payload.cards || [];
        if (nextCards.length > 0) {
          this.callbacks.botMessage({
            type: 'bot_message_pagination',
            cards: nextCards,
          });
        } else {
          this.callbacks.pagination(false);
        }
      } else if (event.detail.type === 'set-feed-loading') {
        this.#status.state = 'loading';
        this.callbacks.loading(true);
      } else if (event.detail.type === 'set-feed-pagination') {
        this.#status.state = 'pagination';
        this.callbacks.pagination(event.detail.loading);
      }
    };
    window.addEventListener('pg-feed-event', handleFeedEvent);
  }

  async initState(): Promise<void> {
    if (this.#status.state === 'initial') {
      this.#status.state = 'loading';
      if (this.serverBehavior?.fetch_provider === 'socket') {
        this.initStream();
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        const handleAppEvent = (event: CustomEvent) => {
          if (event.detail.type === 'set-initial-cards' && event.detail.payload) {
            this.callbacks.botMessage(JSON.parse(event.detail.payload));
            this.#status.state = 'loaded';
            window.dispatchEvent(
              new CustomEvent('pg-app-event', {
                detail: { type: 'initial-state-success' },
              }),
            );
            resolve();
          }
        };
        window.addEventListener('pg-app-event', handleAppEvent);
        window.dispatchEvent(
          new CustomEvent('pg-app-event', {
            detail: { type: 'get-initial-cards' },
          }),
        );
      });
    }
    return Promise.resolve();
  }

  async _sendVisitorMessage(message: VisitorMessage) {
    this.callbacks.visitorMessage(message);
    fetch(this.serverURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload) {
          this.callbacks.botMessage(payload);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
