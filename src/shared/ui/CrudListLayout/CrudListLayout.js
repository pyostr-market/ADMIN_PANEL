import { useState, useCallback } from 'react';
import { FiSettings } from 'react-icons/fi';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import { SearchInput } from '../SearchInput/SearchInput';
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
 * @param {React.ReactNode} props.sidebar - Sidebar (например, дерево категорий)
 * @param {string} props.sidebarTitle - Заголовок sidebar
 *
 * @param {React.ReactNode} props.children - Список элементов (EntityList)
 * @param {React.ReactNode} props.pagination - Пагинация
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
  searchDisabled = false,

  // Sidebar
  sidebar,
  sidebarTitle = 'Фильтры',

  // Content
  children,
  pagination,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleOpenSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const hasSidebar = Boolean(sidebar);
  const hasSearch = showSearch;

  return (
    <>
      <section className={`${styles.crudListLayout} ${hasSidebar ? styles.crudListLayoutWithSidebar : ''} ${hasSearch ? styles.crudListLayoutWithSearch : ''}`}>
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
              disabled={searchDisabled}
              className={styles.crudListSearchInput}
            />
            {hasSidebar && (
              <button
                type="button"
                className={styles.crudListSearchFiltersBtn}
                onClick={handleOpenSidebar}
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

        {/* Sidebar (Desktop) */}
        {hasSidebar && (
          <aside className={styles.crudListSidebar}>
            <div className={styles.crudListSidebarHeader}>
              <h3 className={styles.crudListSidebarTitle}>{sidebarTitle}</h3>
            </div>
            <div className={styles.crudListSidebarContent}>
              {sidebar}
            </div>
          </aside>
        )}
      </section>

      {/* Sidebar Modal (Mobile) */}
      {hasSidebar && (
        <Modal
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
          title={sidebarTitle}
          size="md"
          footer={(
            <Button variant="secondary" onClick={handleCloseSidebar}>
              Закрыть
            </Button>
          )}
        >
          <div className={styles.crudSidebarModalContent}>
            {sidebar}
          </div>
        </Modal>
      )}
    </>
  );
}
