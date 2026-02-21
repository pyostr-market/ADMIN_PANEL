import { useCallback, useState } from 'react';
import { usePageSocketSubscription } from '../../shared/lib/socket/usePageSocketSubscription';

export function ProductTypesPage() {
  const [eventsCount, setEventsCount] = useState(0);
  const handleSocketEvent = useCallback(() => {
    setEventsCount((prev) => prev + 1);
  }, []);

  usePageSocketSubscription('device_type', handleSocketEvent);

  return (
    <section>
      <h1>Типы устройств</h1>
      <p>Это страница типов устройств.</p>
      <p>Подписка: device_type. Получено событий: {eventsCount}.</p>
    </section>
  );
}
