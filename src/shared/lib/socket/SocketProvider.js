import { createContext, useContext, useMemo } from 'react';
import { SocketClient } from './socketClient';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socket = useMemo(() => {
    const instance = new SocketClient();
    instance.connect();
    return instance;
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const socket = useContext(SocketContext);

  if (!socket) {
    throw new Error('useSocket must be used inside SocketProvider');
  }

  return socket;
}
