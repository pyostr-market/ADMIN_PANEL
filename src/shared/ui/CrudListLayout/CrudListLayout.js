import { useState, useCallback } from 'react';
import { FiSettings } from 'react-icons/fi';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import { SearchInput } from '../SearchInput/SearchInput';
import { Select } from '../Select/Select';
import styles from './CrudListLayout.module.css';

/**
 * Универсальный шаблон для CRUD-страниц со списком
 * @component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.header - Заголовок страницы (заголовок + кнопки действий)
 * @param {boolean} props.showSearch - Показывать ли поиск
 * @param {string} props.searchValue - Значение поиска
 * @param {(value: string) => void} props.onSearchChange - Обработчик изменения поиска
 * @param {boolean} props.searchLoading - Индикатор загрузки поиска
 * @param {string} props.searchPlaceholder - Плейсхолдер поиска
 * 
 * @param {boolean} props.showFilters - Показывать ли фильтры
 * @param {Object} props.filters - Объект фильтров { key: value }
 * @param {Array} props.filterConfigs - Конфигурация фильтров [{ key, label, options: [{value, label}], onFocus, disabled }]
 * @param {(key: string, value: any) => void} props.onFilterChange - Обработчик изменения фильтра
 * @param {() => void} props.onResetFilters - Обработчик сброса фильтров
 * @param {boolean} props.hasActiveFilters - Есть ли активные фильтры
 * @param {boolean} props.filtersLoading - Индикатор загрузки фильтров
 * 
 * @param {React.ReactNode} props.children - Список элементов (EntityList)
 * @param {React.ReactNode} props.pagination - Пагинация
 * 
 * @example
 * <CrudListLayout
 *   header={<PageHeader title="Пользователи" actions={<Button>Создать</Button>} />}
 *   showSearch={true}
 *   searchValue={search}
 *   onSearchChange={setSearch}
 *   searchPlaceholder="Поиск..."
 *   
 *   showFilters={true}
 *   filters={filters}
 *   filterConfigs={[
 *     { key: 'status', label: 'Статус', options: [{value: 'all', label: 'Все'}, {value: 'active', label: 'Активные'}] }
 *   ]}
 *   onFilterChange={handleFilterChange}
 *   onResetFilters={handleResetFilters}
 *   hasActiveFilters={true}
 *   
 *   pagination={<Pagination ... />}
 * >
 *   <EntityList ... />
 * </CrudListLayout>
 */
export function CrudListLayout({
  // Header
  header,
  
  // Search
  showSearch = true,
  searchValue = '',
  onSearchChange,
  searchLoading = false,
  searchPlaceholder = 'Поиск...',
  
  // Filters
  showFilters = true,
  filters = {},
  filterConfigs = [],
  onFilterChange,
  onResetFilters,
  hasActiveFilters = false,
  filtersLoading = false,
  
  // Content
  children,
  pagination,
}) {
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  const handleOpenFiltersModal = useCallback(() => {
    setIsFiltersModalOpen(true);
  }, []);

  const handleCloseFiltersModal = useCallback(() => {
    setIsFiltersModalOpen(false);
  }, []);

  const handleResetFiltersInModal = useCallback(() => {
    if (onResetFilters) {
      onResetFilters();
    }
    setIsFiltersModalOpen(false);
  }, [onResetFilters]);

  const handleFilterChangeInModal = useCallback((key, value) => {
    if (onFilterChange) {
      onFilterChange(key, value);
    }
  }, [onFilterChange]);

  return (
    <>
      <section className={styles.crudListLayout}>
        {/* Header */}
        {header && (
          <header className={styles.crudListHeader}>
            {header}
          </header>
        )}

        {/* Search */}
        {showSearch && (
          <div className={styles.crudListSearch}>
            <SearchInput
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              loading={searchLoading}
              className={styles.crudListSearchInput}
            />
            {showFilters && (
              <button
                type="button"
                className={styles.crudListSearchFiltersBtn}
                onClick={handleOpenFiltersModal}
                aria-label="Открыть фильтры"
              >
                <FiSettings />
              </button>
            )}
          </div>
        )}

        {/* Content (List + Pagination) */}
        <div className={styles.crudListContent}>
          <div className={styles.crudListList}>
            {children}
          </div>

          {/* Pagination */}
          {pagination && (
            <div className={styles.crudListPagination}>
              {pagination}
            </div>
          )}
        </div>

        {/* Filters Sidebar (Desktop) */}
        {showFilters && (
          <aside className={`${styles.crudListFiltersSidebar}${filtersLoading ? ` ${styles.crudListFiltersSidebarLoading}` : ''}`}>
            <div className={styles.crudListFiltersSidebarRow}>
              <h3 className={styles.crudListFiltersSidebarTitle}>Фильтры</h3>
              
              <div className={styles.crudListFiltersSidebarGroup}>
                {filterConfigs.map((config) => (
                  <Select
                    key={config.key}
                    value={filters[config.key] || 'all'}
                    onChange={(e) => onFilterChange?.(config.key, e.target.value)}
                    options={config.options}
                    placeholder={config.label}
                    wrapperClassName={styles.crudListFiltersSidebarSelect}
                    onFocus={config.onFocus}
                    disabled={config.disabled || filtersLoading}
                  />
                ))}

                {hasActiveFilters && onResetFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={styles.crudListResetFiltersBtn}
                    onClick={onResetFilters}
                  >
                    ✕ Сбросить фильтры
                  </Button>
                )}
              </div>
            </div>
          </aside>
        )}
      </section>

      {/* Filters Modal (Mobile) */}
      {showFilters && (
        <Modal
          isOpen={isFiltersModalOpen}
          onClose={handleCloseFiltersModal}
          title="Фильтры"
          size="sm"
          footer={(
            <>
              <Button variant="secondary" onClick={handleCloseFiltersModal}>Отмена</Button>
              <Button
                variant="primary"
                onClick={handleResetFiltersInModal}
                disabled={!hasActiveFilters}
              >
                Сбросить фильтры
              </Button>
            </>
          )}
        >
          <div className={styles.crudFiltersModalContent}>
            {filterConfigs.map((config) => (
              <div key={config.key} className={styles.crudFiltersModalGroup}>
                <label className={styles.crudFiltersModalLabel}>{config.label}</label>
                <Select
                  value={filters[config.key] || 'all'}
                  onChange={(e) => handleFilterChangeInModal(config.key, e.target.value)}
                  options={config.options}
                  placeholder={config.label}
                  wrapperClassName={styles.crudFiltersModalSelect}
                  onFocus={config.onFocus}
                  disabled={config.disabled || filtersLoading}
                />
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
