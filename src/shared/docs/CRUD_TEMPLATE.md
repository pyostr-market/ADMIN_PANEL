# CRUD-шаблон для страниц приложения

Этот документ описывает универсальную систему для создания CRUD-страниц (Create, Read, Update, Delete) в приложении.

## Архитектура

Система состоит из следующих частей:

### 1. UI-компоненты (`src/shared/ui/`)

- **CrudPageTemplate** — универсальный шаблон страницы
- **Button** — кнопка с вариантами (primary, secondary, danger, ghost)
- **Input** — поле ввода с лейблом и иконками
- **Select** — выпадающий список
- **Modal** — модальное окно
- **Pagination** — пагинация
- **SearchInput** — поле поиска с иконкой
- **EntityList** — список записей
- **Tabs, Tab** — вкладки навигации

### 2. Хуки (`src/shared/lib/crud/`)

- **useCrudList** — управление списком (загрузка, поиск, фильтрация, CRUD-операции)
- **useCrudModal** — управление модальными окнами

### 3. Конфигурации (`src/shared/config/crudConfigs.js`)

Готовые конфигурации для всех разделов приложения.

## Использование

### Базовый пример

```javascript
import { CrudPageTemplate } from '../../shared/ui/CrudPageTemplate';
import { manufacturersConfig } from '../../shared/config/crudConfigs';

export function ManufacturersPage() {
  return (
    <CrudPageTemplate
      title="Производители"
      config={manufacturersConfig}
    />
  );
}
```

### Создание своей конфигурации

```javascript
export const myEntityConfig = {
  // Функция получения данных
  fetchFn: async ({ page = 1, limit = 20, search } = {}) => {
    const response = await authorizedApi.get('/api/my-entity', {
      params: { page, limit, search }
    });
    return response.data;
  },

  // Функция создания
  createFn: async (payload) => {
    const response = await authorizedApi.post('/api/my-entity', payload);
    return response.data;
  },

  // Функция обновления
  updateFn: async (id, payload) => {
    const response = await authorizedApi.patch(`/api/my-entity/${id}`, payload);
    return response.data;
  },

  // Функция удаления
  deleteFn: async (id) => {
    const response = await authorizedApi.delete(`/api/my-entity/${id}`);
    return response.data;
  },

  // Названия сущности
  entityName: 'Сущность',
  entityNamePlural: 'Сущности',

  // Права доступа
  permissions: {
    view: ['my:entity:view'],
    create: ['my:entity:create'],
    update: ['my:entity:update'],
    delete: ['my:entity:delete'],
  },

  // Поля
  fields: {
    list: [
      { key: 'name', label: 'Название' },
      { key: 'description', label: 'Описание' },
    ],
    form: [
      { key: 'name', label: 'Название', required: true },
      { key: 'description', label: 'Описание', type: 'textarea' },
    ],
  },

  // Опционально: фильтры
  filters: [
    {
      key: 'status',
      label: 'Статус',
      type: 'select',
      options: [
        { value: 'active', label: 'Активен' },
        { value: 'inactive', label: 'Неактивен' },
      ],
    },
  ],
};
```

### Продвинутое использование с кастомными рендерами

```javascript
export function CustomPage() {
  const config = {
    ...myEntityConfig,
    
    // Кастомная форма
    renderForm: ({ isOpen, onClose, onSubmit, item, isSubmitting }) => (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={item ? 'Редактирование' : 'Создание'}
        footer={(
          <>
            <Button variant="secondary" onClick={onClose}>Отмена</Button>
            <Button variant="primary" onClick={onSubmit} loading={isSubmitting}>
              Сохранить
            </Button>
          </>
        )}
      >
        <MyCustomForm item={item} onSubmit={onSubmit} />
      </Modal>
    ),

    // Кастомное отображение элемента в списке
    renderActions: (item, actions) => (
      <>
        <Button onClick={actions.onUpdate}>Изменить</Button>
        <Button onClick={actions.onDelete}>Удалить</Button>
      </>
    ),
  };

  return <CrudPageTemplate title="Моя страница" config={config} />;
}
```

### Использование с вкладками (Tabs)

```javascript
export function MultiTabPage() {
  const config = {
    ...baseConfig,
    
    tabs: [
      {
        key: 'active',
        label: 'Активные',
        config: {
          filterFn: (items) => items.filter(item => item.status === 'active'),
        },
      },
      {
        key: 'archived',
        label: 'Архив',
        config: {
          filterFn: (items) => items.filter(item => item.status === 'archived'),
        },
      },
    ],
  };

  return <CrudPageTemplate title="Мультивкладочная страница" config={config} />;
}
```

## API конфигурации

### Обязательные поля

| Поле | Тип | Описание |
|------|-----|----------|
| `fetchFn` | `Function` | Функция получения данных. Возвращает `{ items: [], pagination: {} }` |
| `entityName` | `String` | Название сущности в единственном числе |
| `entityNamePlural` | `String` | Название сущности во множественном числе |

### Опциональные поля

| Поле | Тип | Описание |
|------|-----|----------|
| `createFn` | `Function` | Функция создания записи |
| `updateFn` | `Function` | Функция обновления записи |
| `deleteFn` | `Function` | Функция удаления записи |
| `permissions` | `Object` | Права доступа (`view`, `create`, `update`, `delete`) |
| `fields` | `Object` | Поля сущности (`list`, `form`) |
| `filters` | `Array` | Дополнительные фильтры |
| `tabs` | `Array` | Вкладки навигации |
| `defaultLimit` | `Number` | Количество элементов на странице (по умолчанию 20) |
| `normalizeFn` | `Function` | Функция нормализации данных |
| `renderForm` | `Function` | Кастомная форма |
| `renderActions` | `Function` | Кастомные действия в списке |
| `renderEmpty` | `ReactNode` | Кастомный пустой state |
| `renderHeader` | `Function` | Кастомный заголовок страницы |

### Структура pagination

```javascript
{
  page: 1,        // Текущая страница
  limit: 20,      // Количество на странице
  total: 100,     // Всего записей
  pages: 5,       // Всего страниц
}
```

## Готовые конфигурации

В файле `src/shared/config/crudConfigs.js` доступны:

- `manufacturersConfig` — Производители
- `suppliersConfig` — Поставщики
- `productTypesConfig` — Типы продуктов
- `productsConfig` — Продукты
- `permissionsConfig` — Права
- `groupsConfig` — Группы

## Хуки

### useCrudList

```javascript
const crud = useCrudList({
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  entityName: 'Сущность',
  defaultLimit: 20,
});

// Возвращает:
// - items: массив записей
// - page: текущая страница
// - pagination: объект пагинации
// - search: поисковый запрос
// - filters: объекты фильтров
// - isLoading: флаг загрузки
// - isSubmitting: флаг отправки формы
// - error: ошибка
// - setPage(page): установить страницу
// - setSearch(value): установить поиск
// - setFilters(filters): установить фильтры
// - refresh(): обновить данные
// - create(payload): создать запись
// - update(id, payload): обновить запись
// - delete(id): удалить запись
```

### useCrudModal

```javascript
const modal = useCrudModal();

// Возвращает:
// - isOpen: открыто ли модальное окно редактирования
// - isCreateModalOpen: открыто ли модальное окно создания
// - editingItem: редактируемый элемент
// - openEditModal(item): открыть редактирование
// - closeEditModal(): закрыть редактирование
// - openCreateModal(): открыть создание
// - closeCreateModal(): закрыть создание
// - closeModal(): закрыть все модальные окна
```

## Примеры

### Простая страница (ManufacturersPage)

```javascript
import { CrudPageTemplate } from '../../shared/ui/CrudPageTemplate';
import { manufacturersConfig } from '../../shared/config/crudConfigs';

export function ManufacturersPage() {
  return (
    <CrudPageTemplate
      title="Производители"
      config={manufacturersConfig}
    />
  );
}
```

### Страница с особой логикой (PermissionsGroupsPage)

Для сложных случаев, таких как страница прав и групп с двумя вкладками и сложным модальным окном выбора прав, используется прямое использование хуков:

```javascript
import { useCrudList, useCrudModal } from '../../shared/lib/crud';

export function PermissionsGroupsPage() {
  const [activeTab, setActiveTab] = useState('permissions');
  
  const permissionsCrud = useCrudList({ /* config */ });
  const groupsCrud = useCrudList({ /* config */ });
  const modal = useCrudModal();

  // Логика страницы...
}
```

## Миграция существующих страниц

1. Создайте конфигурацию в `src/shared/config/crudConfigs.js`
2. Замените содержимое страницы на вызов `CrudPageTemplate`
3. При необходимости добавьте кастомные рендеры

## Best Practices

1. **Единая конфигурация** — храните все конфигурации в одном файле
2. **Переиспользование** — используйте готовые конфигурации из `crudConfigs.js`
3. **Кастомизация** — для сложной логики используйте прямое использование хуков
4. **Права доступа** — всегда указывайте права для защиты UI-элементов
5. **Нормализация** — используйте `normalizeFn` для приведения данных к единому виду
