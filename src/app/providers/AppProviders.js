import { SocketProvider } from '../../shared/lib/socket/SocketProvider';
import { SessionProvider } from '../../entities/session/model/SessionProvider';
import { NotificationProvider } from '../../shared/lib/notifications/NotificationProvider';

export function AppProviders({ children }) {
  return (
    <SocketProvider>
      <SessionProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </SessionProvider>
    </SocketProvider>
  );
}
