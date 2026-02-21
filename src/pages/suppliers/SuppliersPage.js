import { useCallback, useState } from 'react';
import { usePageSocketSubscription } from '../../shared/lib/socket/usePageSocketSubscription';

export function SuppliersPage() {
  const [eventsCount, setEventsCount] = useState(0);
  const handleSocketEvent = useCallback(() => {
    setEventsCount((prev) => prev + 1);
  }, []);

  usePageSocketSubscription('supplier', handleSocketEvent);

  return (
    <section>
      <h1>Поставщики</h1>
      <p>Это страница поставщиков.</p>
      <p>Подписка: supplier. Получено событий: {eventsCount}.</p>
    </section>
  );
}
