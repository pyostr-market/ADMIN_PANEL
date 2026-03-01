# Пример использования CrudListLayout

## Быстрый старт

### 1. Импортируйте компонент

```jsx
import { CrudListLayout } from '../../../shared/ui/CrudListLayout';
```

### 2. Подготовьте конфигурацию фильтров

```jsx
const filterConfigs = useMemo(() => [
  {
    key: 'status',
    label: 'Статус',
    options: [
      { value: 'all', label: 'Все' },
      { value: 'active', label: 'Активные' },
      { value: 'inactive', label: 'Неактивные' },
    ],
  },
  {
    key: 'category',
    label: 'Категория',
    options: [
      { value: 'all', label: 'Все категории' },
      ...categories.map(cat => ({ value: cat.id, label: cat.name })),
    ],
    onFocus: loadCategories, // Опционально: загрузка при фокусе
    disabled: loadingCategories,
  },
], [categories, loadCategories, loadingCategories]);
```

### 3. Используйте в компоненте

```jsx
<CrudListLayout
  header={(
    <>
      <h1 className={styles.pageTitle}>Название</h1>
      <div className={styles.pageControls}>
        <Button onClick={handleCreate}>Создать</Button>
      </div>
    </>
  )}
  showSearch={true}
  searchValue={crud.search}
  onSearchChange={crud.setSearch}
  searchLoading={crud.isLoading}
  searchPlaceholder="Поиск..."
  
  showFilters={true}
  filters={filters}
  filterConfigs={filterConfigs}
  onFilterChange={handleFilterChange}
  onResetFilters={handleResetFilters}
  hasActiveFilters={hasActiveFilters}
  filtersLoading={crud.isLoading}
  
  pagination={
    <Pagination
      currentPage={crud.page}
      totalPages={crud.pagination.pages}
      totalItems={crud.pagination.total}
      onPageChange={crud.setPage}
    />
  }
>
  <EntityList
    items={crud.items}
    renderItem={(item) => (
      <div>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
      </div>
    )}
    emptyMessage="Ничего не найдено"
    loading={crud.isLoading}
  />
</CrudListLayout>
```

## Минимальный пример (только поиск)

```jsx
<CrudListLayout
  header={<h1>Простая страница</h1>}
  showSearch={true}
  searchValue={search}
  onSearchChange={setSearch}
  showFilters={false}
>
  <EntityList items={items} renderItem={renderItem} />
</CrudListLayout>
```

## Пример без поиска (только фильтры)

```jsx
<CrudListLayout
  header={<h1>Только фильтры</h1>}
  showSearch={false}
  
  showFilters={true}
  filters={filters}
  filterConfigs={filterConfigs}
  onFilterChange={handleFilterChange}
  onResetFilters={handleResetFilters}
  hasActiveFilters={hasActive}
>
  <EntityList items={items} renderItem={renderItem} />
</CrudListLayout>
```

## Полный пример с модалками

```jsx
function MyPage() {
  const [itemToDelete, setItemToDelete] = useState(null);
  const [filters, setFilters] = useState({ status: 'all' });
  
  const crud = useCrudList({ ... });
  
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const apiFilters = {};
    if (newFilters.status !== 'all') {
      apiFilters.status = newFilters.status;
    }
    
    crud.setFilters(apiFilters);
    crud.setPage(1);
  };
  
  const handleResetFilters = () => {
    setFilters({ status: 'all' });
    crud.setFilters({});
    crud.setPage(1);
  };
  
  const filterConfigs = useMemo(() => [
    {
      key: 'status',
      label: 'Статус',
      options: [
        { value: 'all', label: 'Все' },
        { value: 'active', label: 'Активные' },
      ],
    },
  ], []);
  
  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1>Мои элементы</h1>
            <Button onClick={() => navigate('/create')}>Создать</Button>
          </>
        )}
        searchValue={crud.search}
        onSearchChange={crud.setSearch}
        filters={filters}
        filterConfigs={filterConfigs}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        hasActiveFilters={filters.status !== 'all'}
        pagination={<Pagination ... />}
      >
        <EntityList
          items={crud.items}
          renderItem={(item) => (
            <>
              <div onClick={() => navigate(`/item/${item.id}`)}>
                <h3>{item.name}</h3>
              </div>
              <div className={styles.actions}>
                <Button onClick={() => setItemToDelete(item)}>Удалить</Button>
              </div>
            </>
          )}
        />
      </CrudListLayout>
      
      {itemToDelete && (
        <DeleteModal
          item={itemToDelete}
          onClose={() => setItemToDelete(null)}
          onSubmit={handleDelete}
        />
      )}
    </>
  );
}
```

## Чеклист для миграции существующей страницы

- [ ] Импортировать `CrudListLayout`
- [ ] Удалить локальные стили для поиска, фильтров, сайдбара
- [ ] Создать `filterConfigs` useMemo
- [ ] Перенести header в prop `header`
- [ ] Перенести поиск в props `searchValue`, `onSearchChange`
- [ ] Перенести фильтры в props `filters`, `filterConfigs`, `onFilterChange`
- [ ] Перенести пагинацию в prop `pagination`
- [ ] Оставить только стили для EntityList и специфичные для страницы

## Примечания

1. **Фильтры всегда должны иметь значение 'all' по умолчанию** для опции "Все"
2. **handleFilterChange должен обновлять и локальное состояние filters, и crud.setFilters**
3. **onResetFilters должен сбрасывать и filters, и crud.setFilters в пустой объект**
4. **hasActiveFilters вычисляется из filters** (например, `Object.values(filters).some(v => v !== 'all')`)
