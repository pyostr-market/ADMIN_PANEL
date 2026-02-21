import { useCallback, useState } from 'react';
import { usePageSocketSubscription } from '../../shared/lib/socket/usePageSocketSubscription';

export function ProductsPage() {
  const [eventsCount, setEventsCount] = useState(0);
  const handleSocketEvent = useCallback(() => {
    setEventsCount((prev) => prev + 1);
  }, []);

  usePageSocketSubscription('product', handleSocketEvent);

  return (
    <section>
      <h1>Товары</h1>
      <p>Это страница товаров.</p>
      <p>Подписка: product. Получено событий: {eventsCount}.</p>
    </section>
  );
}
