import { useCallback, useState } from 'react';
import { usePageSocketSubscription } from '../../shared/lib/socket/usePageSocketSubscription';

export function CategoriesPage() {
  const [eventsCount, setEventsCount] = useState(0);
  const handleSocketEvent = useCallback(() => {
    setEventsCount((prev) => prev + 1);
  }, []);

  usePageSocketSubscription('category', handleSocketEvent);

  return (
    <section>
      <h1>Категории</h1>
      <p>Это страница категорий.</p>
      <p>Подписка: category. Получено событий: {eventsCount}.</p>
    </section>
  );
}
