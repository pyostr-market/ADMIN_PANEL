import { useEffect, useRef } from 'react';
import { useSocket } from './SocketProvider';

export function usePageSocketSubscription(eventKey, onEvent) {
  const socket = useSocket();
  const onEventRef = useRef(onEvent);

  // Обновляем ref при изменении onEvent
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!eventKey) {
      return undefined;
    }

    const unsubscribe = socket.subscribe(eventKey, (payload) => {
      if (typeof onEventRef.current === 'function') {
        onEventRef.current(payload);
      }
    });

    return unsubscribe;
  }, [eventKey, socket]);
}
