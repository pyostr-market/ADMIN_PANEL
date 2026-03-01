# CrudListLayout

Универсальный шаблон для CRUD-страниц со списком элементов, поиском и фильтрами.

## Особенности

- **Адаптивный дизайн**: На десктопе фильтры отображаются в сайдбаре справа, на мобильных - в модальном окне
- **Поиск**: Опциональный блок поиска с кнопкой открытия фильтров
- **Фильтры**: Гибкая конфигурация фильтров через массив объектов
- **Переиспользование**: Все стили инкапсулированы в компоненте

## Использование

```jsx
import { CrudListLayout } from '@/shared/ui/CrudListLayout';

function MyPage() {
  const filterConfigs = useMemo(() => [
    {
      key: 'status',
      label: 'Статус',
      options: [
        { value: 'all', label: 'Все' },
        { value: 'active', label: 'Активные' },
        { value: 'inactive', label: 'Неактивные' },
      ],
      onFocus: loadData, // Опционально: загрузка данных при фокусе
      disabled: isLoading, // Опционально: состояние disabled
    },
    {
      key: 'category',
      label: 'Категория',
      options: categories.map(c => ({ value: c.id, label: c.name })),
    },
  ], [categories, loadData, isLoading]);

  return (
    <CrudListLayout
      // Header (обязательно)
      header={(
        <>
          <h1>Заголовок</h1>
          <Button>Действие</Button>
        </>
      )}
      
      // Поиск
      showSearch={true}
      searchValue={search}
      onSearchChange={setSearch}
      searchLoading={isLoading}
      searchPlaceholder="Поиск..."
      
      // Фильтры
      showFilters={true}
      filters={filters}
      filterConfigs={filterConfigs}
      onFilterChange={handleFilterChange}
      onResetFilters={handleResetFilters}
      hasActiveFilters={true}
      filtersLoading={isLoading}
      
      // Пагинация
      pagination={<Pagination ... />}
    >
      {/* Список элементов */}
      <EntityList ... />
    </CrudListLayout>
  );
}
```

## Props

### Header
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `header` | `ReactNode` | No | Заголовок страницы (заголовок + кнопки действий) |

### Search
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showSearch` | `boolean` | `true` | Показывать ли поиск |
| `searchValue` | `string` | `''` | Значение поиска |
| `onSearchChange` | `function` | - | Обработчик изменения поиска |
| `searchLoading` | `boolean` | `false` | Индикатор загрузки поиска |
| `searchPlaceholder` | `string` | `'Поиск...'` | Плейсхолдер поиска |

### Filters
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showFilters` | `boolean` | `true` | Показывать ли фильтры |
| `filters` | `object` | `{}` | Объект фильтров `{ key: value }` |
| `filterConfigs` | `array` | `[]` | Конфигурация фильтров (см. ниже) |
| `onFilterChange` | `function` | - | Обработчик изменения фильтра `(key, value) => void` |
| `onResetFilters` | `function` | - | Обработчик сброса фильтров `() => void` |
| `hasActiveFilters` | `boolean` | `false` | Есть ли активные фильтры |
| `filtersLoading` | `boolean` | `false` | Индикатор загрузки фильтров |

### FilterConfig Structure
```typescript
{
  key: string;        // Ключ фильтра в объекте filters
  label: string;      // Label для селекта
  options: Array<{    // Опции для селекта
    value: string;
    label: string;
  }>;
  onFocus?: () => void;  // Опционально: вызывается при фокусе
  disabled?: boolean;    // Опционально: состояние disabled
}
```

### Content
| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Список элементов (обычно `EntityList`) |
| `pagination` | `ReactNode` | Пагинация (обычно `Pagination`) |

## Структура компонента

```
CrudListLayout
├── Header (на всю ширину)
├── Search + Кнопка фильтров
├── List (слева на десктопе)
│   ├── EntityList
│   └── Pagination
├── Filters Sidebar (справа на десктопе)
└── Filters Modal (только на мобильных)
```

## Адаптивность

### Desktop (> 768px)
- Сайдбар с фильтрами справа (280px)
- Кнопка настроек в поиске
- Список занимает оставшееся пространство

### Mobile (≤ 768px)
- Сайдбар скрыт
- Кнопка настроек справа от поиска
- Фильтры открываются в модальном окне
- Все элементы на всю ширину

## Примеры использования

### Базовый пример
```jsx
<CrudListLayout
  header={<h1>Пользователи</h1>}
  showSearch={true}
  searchValue={search}
  onSearchChange={setSearch}
  showFilters={false}
>
  <EntityList items={items} renderItem={renderItem} />
</CrudListLayout>
```

### С фильтрами
```jsx
<CrudListLayout
  header={<PageHeader title="Товары" />}
  searchValue={search}
  onSearchChange={setSearch}
  filters={filters}
  filterConfigs={[
    { key: 'category', label: 'Категория', options: categoryOptions },
    { key: 'status', label: 'Статус', options: statusOptions },
  ]}
  onFilterChange={handleFilterChange}
  onResetFilters={handleResetFilters}
  hasActiveFilters={hasActive}
>
  <EntityList items={products} renderItem={renderProduct} />
  <Pagination ... />
</CrudListLayout>
```

## Миграция со старой структуры

Было:
```jsx
<section className={styles.page}>
  <header>...</header>
  <div className={styles.search}>...</div>
  <EntityList ... />
  <aside className={styles.filters}>...</aside>
  <Modal>...</Modal>
</section>
```

Стало:
```jsx
<CrudListLayout
  header={...}
  searchValue={...}
  filters={...}
  filterConfigs={...}
  pagination={...}
>
  <EntityList ... />
</CrudListLayout>
```
