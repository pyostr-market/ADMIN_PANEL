import { useEffect } from 'react';
import { useSocket } from './SocketProvider';

export function usePageSocketSubscription(eventKey, onEvent) {
  const socket = useSocket();

  useEffect(() => {
    if (!eventKey) {
      return undefined;
    }

    const unsubscribe = socket.subscribe(eventKey, (payload) => {
      if (typeof onEvent === 'function') {
        onEvent(payload);
      }
    });

    return unsubscribe;
  }, [eventKey, onEvent, socket]);
}
