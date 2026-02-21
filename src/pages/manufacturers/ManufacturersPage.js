import { useCallback, useState } from 'react';
import { usePageSocketSubscription } from '../../shared/lib/socket/usePageSocketSubscription';

export function ManufacturersPage() {
  const [eventsCount, setEventsCount] = useState(0);
  const handleSocketEvent = useCallback(() => {
    setEventsCount((prev) => prev + 1);
  }, []);

  usePageSocketSubscription('manufacturer', handleSocketEvent);

  return (
    <section>
      <h1>Производители</h1>
      <p>Это страница производителей.</p>
      <p>Подписка: manufacturer. Получено событий: {eventsCount}.</p>
    </section>
  );
}
