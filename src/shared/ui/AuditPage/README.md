# AuditPage — универсальный компонент для страниц аудита

Единый шаблон для всех страниц аудита в проекте. Компонент предоставляет готовый UI с таблицей истории изменений, модальным окном деталей и пагинацией.

## Расположение

```
src/shared/ui/AuditPage/
├── AuditPage.jsx          # Основной компонент
├── AuditPage.module.css   # Стили
└── index.js               # Экспорт
```

## Использование

### Базовый пример

```jsx
import { AuditPage } from '../../../shared/ui/AuditPage';
import { getManufacturerAuditRequest } from '../api/manufacturersApi';

export function ManufacturerAuditPage() {
  const { manufacturerId } = useParams();

  const fetchAudit = (params) =>
    getManufacturerAuditRequest({
      manufacturer_id: manufacturerId,
      ...params,
    });

  return (
    <AuditPage
      title="История изменений производителя"
      backUrl={`/catalog/manufacturers/${manufacturerId}`}
      fetchAudit={fetchAudit}
    />
  );
}
```

## API

### Props

| Prop                     | Тип      | По умолчанию | Описание                                                                 |
|--------------------------|----------|--------------|--------------------------------------------------------------------------|
| `title`                  | string   | 'История изменений' | Заголовок страницы                                                      |
| `backUrl`                | string   | -            | URL для возврата назад (при отсутствии используется `navigate(-1)`)      |
| `fetchAudit`             | function | -            | **Обязательный**. Функция для получения данных: `(params) => Promise<{items, total}>` |
| `useRetry`               | boolean  | true         | Использовать ли повторные запросы при ошибках                           |
| `maxRetries`             | number   | 3            | Максимальное количество попыток запроса                                 |
| `pageSize`               | number   | 20           | Количество элементов на странице                                        |
| `showErrorNotifications` | boolean  | true         | Показывать ли уведомления об ошибках                                    |

### Формат функции fetchAudit

```typescript
type FetchAuditParams = {
  limit: number;    // Количество элементов (pageSize)
  offset: number;   // Смещение ((currentPage - 1) * pageSize)
};

type FetchAuditResult = {
  items: AuditItem[];  // Массив записей аудита
  total: number;       // Общее количество записей
};

type FetchAudit = (params: FetchAuditParams) => Promise<FetchAuditResult>;
```

### Формат записи аудита

Ожидается, что API возвращает данные в следующем формате:

```typescript
type AuditItem = {
  id: number | string;       // Уникальный идентификатор записи
  action: 'create' | 'update' | 'delete';  // Тип действия
  user_id: number | string;  // ID пользователя
  created_at: string;        // Дата создания (ISO 8601)
  old_data?: object;         // Старые данные (опционально)
  new_data?: object;         // Новые данные (опционально)
};
```

## Примеры использования

### Категории

```jsx
import { AuditPage } from '../../../shared/ui/AuditPage';
import { getCategoryAuditRequest } from '../api/categoriesApi';

export function CategoryAuditPage() {
  const { categoryId } = useParams();

  const fetchAudit = (params) =>
    getCategoryAuditRequest({
      category_id: categoryId,
      ...params,
    });

  return (
    <AuditPage
      title="История изменений категории"
      backUrl={`/catalog/categories/${categoryId}`}
      fetchAudit={fetchAudit}
    />
  );
}
```

### Поставщики

```jsx
import { AuditPage } from '../../../shared/ui/AuditPage';
import { getSupplierAuditRequest } from '../api/suppliersApi';

export function SupplierAuditPage() {
  const { supplierId } = useParams();

  const fetchAudit = (params) =>
    getSupplierAuditRequest({
      supplier_id: supplierId,
      ...params,
    });

  return (
    <AuditPage
      title="История изменений поставщика"
      backUrl={`/catalog/suppliers/${supplierId}`}
      fetchAudit={fetchAudit}
      pageSize={50}  // Кастомный размер страницы
    />
  );
}
```

### Продукты с отключенными повторными запросами

```jsx
import { AuditPage } from '../../../shared/ui/AuditPage';
import { getProductAuditRequest } from '../api/productsApi';

export function ProductAuditPage() {
  const { productId } = useParams();

  const fetchAudit = (params) =>
    getProductAuditRequest({
      product_id: productId,
      ...params,
    });

  return (
    <AuditPage
      title="История изменений продукта"
      backUrl={`/products/${productId}`}
      fetchAudit={fetchAudit}
      useRetry={false}  // Отключить повторные запросы
      showErrorNotifications={true}
    />
  );
}
```

## Особенности

### Автоматическая загрузка информации о пользователях

Компонент автоматически загружает информацию о пользователях для отображения их имен вместо ID.

### Обработка ошибок

- При ошибках 404/405 компонент автоматически повторяет запрос до `maxRetries` раз
- Для других ошибок уведомление показывается сразу
- Можно отключить уведомления через `showErrorNotifications={false}`

### Адаптивность

Компонент полностью адаптирован для мобильных устройств:
- Таблица прокручивается горизонтально
- Заголовок фиксируется сверху
- Кнопки и текст масштабируются

## Миграция существующих страниц

### До

```jsx
// Старый код страницы
export function OldAuditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  // ... много кода для управления состоянием
  
  // Рендеринг с собственными стилями
  return (
    <section className={styles.customPage}>
      {/* ... */}
    </section>
  );
}
```

### После

```jsx
// Новый код страницы
export function NewAuditPage() {
  const { id } = useParams();

  const fetchAudit = (params) =>
    getAuditRequest({ entity_id: id, ...params });

  return (
    <AuditPage
      title="История изменений"
      backUrl={`/entities/${id}`}
      fetchAudit={fetchAudit}
    />
  );
}
```

## Преимущества

- ✅ Единый стиль для всех страниц аудита
- ✅ Меньше кода в каждой странице
- ✅ Легко поддерживать и обновлять
- ✅ Консистентный UX
- ✅ Встроенная обработка ошибок
- ✅ Автоматическая загрузка пользователей
- ✅ Готовая адаптивность
