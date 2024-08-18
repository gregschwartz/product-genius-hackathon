/**
 * mini-script to optimise the speed of content loading (lighthose metrics).
 * 
 * concurrently fetch the initial cards payload,
 * while the main facet-chat.js bundle being downloaded.
 */
function uuid() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

function getSessionsIds() {
  let visitorId = window.localStorage.getItem('GAMALON-visitorId');
  if (!visitorId) {
    visitorId = uuid();
    window.localStorage.setItem('GAMALON-visitorId', visitorId);
    window.sessionStorage.removeItem('GAMALON-sessionId');
  }
  let sessionId = window.sessionStorage.getItem('GAMALON-sessionId');
  if (!sessionId) {
    sessionId = uuid();
    window.sessionStorage.setItem('GAMALON-sessionId', sessionId);
  }
  return { visitorId, sessionId };
}

(function () {
  const storageConfig = window.localStorage.getItem('GAMALON-pg-template-config');
  const configData = storageConfig ? JSON.parse(storageConfig) : {};

  const organization =  configData?.organizationId || 'valuepetsupplies'; // Set the organization
  const socketURL = configData?.socketURL || 'wss://facetchat.dev.gmln.io/ws'; // Set the socket URL
  const server_behavior = configData?.serverBehavior ||  { use_cards: true, expand_single_product: true, fetch_provider: 'REST' }; // Set the server behavior
  const fetch_provider = configData?.serverBehavior?.fetch_provider || 'REST';
  const { visitorId, sessionId } = getSessionsIds();

  function useSocket() {
    let streamPayload = null;
    const dispatchStreamEvent = () => {
      if (streamPayload) {
        window.dispatchEvent(
          new CustomEvent('pg-stream-event', {
            detail: { type: 'stream-initial-cards', payload: streamPayload },
          })
        );
      }
    }
    const handleStreamEvent = (event) => {
      if (event.detail.type === 'stream-stream-cards') {
        dispatchStreamEvent();
      }
    };
    window.addEventListener('pg-stream-event', handleStreamEvent);
    
    const webSocket = new WebSocket(`${socketURL}/feed/${organization}/${visitorId}/${sessionId}`);
    const onSocketMessage = (event) => {
      if (event.data) {
        streamPayload = JSON.parse(event.data);
        dispatchStreamEvent();
        if (streamPayload?.feed_processing_finished === true) {
          webSocket.close();
        }
      }
    };
    const onSocketOpen = () => {
      webSocket.send(
        JSON.stringify({
          type: 'visitor_new_session',
          id: uuid(),
          current_url: window.location.href,
          server_behavior,
        })
      );
    };
    webSocket.onmessage = onSocketMessage;
    webSocket.onopen = onSocketOpen;
  }

  function useREST() {
    let payload = null;
    const handleAppEvent = (event) => {
      if (event.detail.type === 'get-initial-cards' && payload) {
        window.dispatchEvent(
          new CustomEvent('pg-app-event', {
            detail: { type: 'set-initial-cards', payload },
          })
        );
      } else if (event.detail.type === 'initial-state-success') {
        window.removeEventListener('pg-app-event', handleAppEvent);
      }
    };
    window.addEventListener('pg-app-event', handleAppEvent);

    const socketUrl = new URL(socketURL);
    const protocol = socketUrl.protocol === 'wss:' ? 'https' : 'http';
    const port = socketUrl.port ? `:${socketUrl.port}` : '';
    const serverURL = `${protocol}://${socketUrl.hostname}${port}/feed/${organization}/${visitorId}/${sessionId}`;
    
    
    fetch(serverURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'visitor_new_session',
        id: uuid(),
        current_url: window.location.href,
        server_behavior,
      }),
    })
      .then((response) => response.text())
      .then((cardPayload) => {
        if (cardPayload) {
          payload = cardPayload;
          window.dispatchEvent(
            new CustomEvent('pg-app-event', {
              detail: { type: 'set-initial-cards', payload },
            })
          );
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
  if (fetch_provider === 'socket') {
    useSocket();
  } else {
    useREST();
  }
})();

function feedPaginationPG() {
  const storageConfig = window.localStorage.getItem('GAMALON-pg-template-config');
  const configData = storageConfig ? JSON.parse(storageConfig) : {};
  const state = { page: 1, status: 'loaded', empty: false };

  const organization =  configData?.organizationId;
  const socketURL = configData?.socketURL || 'wss://facetchat.dev.gmln.io/ws';

  const hanldePaginationEvent = (event) => {
    if (event.detail.type === 'pg-next-page' && state.status === 'loaded' && !state.empty) {
      state.status = 'loading';
      state.page += 1;
      window.dispatchEvent(
        new CustomEvent('pg-feed-event', {
          detail: { type: 'set-feed-pagination', loading: true },
        })
      );
      const socketUrl = new URL(socketURL);
      const protocol = socketUrl.protocol === 'wss:' ? 'https' : 'http';
      const port = socketUrl.port ? `:${socketUrl.port}` : '';
      const { visitorId, sessionId } = getSessionsIds();
      const serverURL = `${protocol}://${socketUrl.hostname}${port}/feed/${organization}/${visitorId}/${sessionId}`;
      const events = JSON.parse(localStorage.getItem('GAMALON-events') || '[]');
      localStorage.setItem('GAMALON-events', '[]');
      fetch(serverURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'visitor_new_session',
          id: uuid(),
          current_url: window.location.href,
          server_behavior: configData?.serverBehavior ||  {},
          page: state.page,
          events,
        }),
      })
        .then((response) => response.text())
        .then((cardPayload) => {
          if (cardPayload) {
            const payload = JSON.parse(cardPayload);
            if (payload?.cards?.length < 1) {
              state.empty = true;
            }
            window.dispatchEvent(
              new CustomEvent('pg-feed-event', {
                detail: { type: 'add-feed-cards', payload },
              })
            );
          }
        })
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          state.status = 'loaded';
        });
    }
  };
  window.addEventListener('pg-pagination-event', hanldePaginationEvent);
}

feedPaginationPG();