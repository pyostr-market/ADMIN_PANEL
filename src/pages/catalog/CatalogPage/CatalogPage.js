import { useCallback, useState } from 'react';
import { usePageSocketSubscription } from '../../../shared/lib/socket/usePageSocketSubscription';

export function CatalogPage() {
  const [eventsCount, setEventsCount] = useState(0);
  const handleSocketEvent = useCallback(() => {
    setEventsCount((prev) => prev + 1);
  }, []);

  usePageSocketSubscription('catalog', handleSocketEvent);

  return (
    <section>
      <h1>Каталог</h1>
      <p>Это корневой раздел каталога.</p>
      <p>Подписка: catalog. Получено событий: {eventsCount}.</p>
    </section>
  );
}
