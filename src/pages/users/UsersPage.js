import { useCallback, useState } from 'react';
import { usePageSocketSubscription } from '../../shared/lib/socket/usePageSocketSubscription';

export function UsersPage() {
  const [eventsCount, setEventsCount] = useState(0);
  const handleSocketEvent = useCallback(() => {
    setEventsCount((prev) => prev + 1);
  }, []);

  usePageSocketSubscription('users', handleSocketEvent);

  return (
    <section>
      <h1>Пользователи</h1>
      <p>Это страница пользователей.</p>
      <p>Подписка: users. Получено событий: {eventsCount}.</p>
    </section>
  );
}
