import { useEffect } from 'react';

/**
 * useRealtime hook to listen for live festival updates (leaderboard, discussion, stalls)
 * @param {Object} handlers - Map of event types to callback functions:
 *   {
 *     LEADERBOARD_UPDATED: (data) => {},
 *     DISCUSSION_MESSAGE_ADDED: (data) => {},
 *     DISCUSSION_MESSAGE_DELETED: (data) => {},
 *     STALL_UPDATED: (data) => {}
 *   }
 */
export const useRealtime = (handlers = {}) => {
  useEffect(() => {
    let eventSource;
    try {
      eventSource = new EventSource('/api/realtime/events');

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.type && handlers[parsed.type]) {
            handlers[parsed.type](parsed.payload);
          }
        } catch (e) {
          // ignore heartbeats/non-json
        }
      };

      eventSource.onerror = (err) => {
        // EventSource will automatically reconnect
      };
    } catch (err) {
      console.warn('Realtime SSE could not connect:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [handlers]);
};
