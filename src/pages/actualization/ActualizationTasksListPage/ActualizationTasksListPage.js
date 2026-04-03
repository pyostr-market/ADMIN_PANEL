import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiUser, FiEye } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList } from '../../../shared/lib/crud';
import { getActualizationTasksRequest } from '../api/actualizationTasksApi';
import styles from './ActualizationTasksListPage.module.css';
import entityListStyles from '../../../shared/ui/EntityList/EntityList.module.css';

const PAGE_LIMIT = 50;

const STATUS_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: 'CREATED', label: 'Создана' },
  { value: 'EXPORTING', label: 'Экспорт' },
  { value: 'EXPORT_FAILED', label: 'Ошибка экспорта' },
  { value: 'IMPORT_FAILED', label: 'Ошибка импорта' },
  { value: 'COMPLETED', label: 'Завершена' },
];

const STATUS_BADGE_CONFIG = {
  CREATED: { label: 'Создана', className: 'info' },
  EXPORTING: { label: 'Экспорт', className: 'warning' },
  EXPORT_FAILED: { label: 'Ошибка экспорта', className: 'danger' },
  IMPORT_FAILED: { label: 'Ошибка импорта', className: 'danger' },
  COMPLETED: { label: 'Завершена', className: 'success' },
};

function getStatusBadge(status) {
  const config = STATUS_BADGE_CONFIG[status] || { label: status, className: 'secondary' };
  return (
    <span className={`${styles.statusBadge} ${styles[`statusBadge${config.className}`]}`}>
      {config.label}
    </span>
  );
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ActualizationTasksListPage() {
  const navigate = useNavigate();

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const tasksCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, status } = {}) => {
      const data = await getActualizationTasksRequest({
        page,
        limit,
        status: status || undefined,
      });
      setHasLoadedOnce(true);
      return data;
    },
    entityName: 'Задача актуализации',
    defaultLimit: PAGE_LIMIT,
    syncWithUrl: true,
  });

  const handleViewTask = (task) => {
    navigate(`/actualization/actualization/${task.id}`);
  };

  const hasActiveFilters = tasksCrud.filters?.status && tasksCrud.filters.status !== '';

  const sidebar = (
    <div className={styles.filtersSidebar}>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Статус</label>
        <select
          className={styles.filterSelect}
          value={tasksCrud.filters?.status || ''}
          onChange={(e) => {
            tasksCrud.setFilters({
              ...tasksCrud.filters,
              status: e.target.value,
            });
            tasksCrud.setPage(1);
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            tasksCrud.setFilters({});
            tasksCrud.setPage(1);
          }}
          className={styles.resetFilterButton}
        >
          Сбросить фильтры
        </Button>
      )}
    </div>
  );

  return (
    <CrudListLayout
      header={
        <>
          <h1 className={styles.tasksPageTitle}>Задачи актуализации</h1>
        </>
      }
      showSearch={true}
      searchValue=""
      onSearchChange={() => {}}
      searchLoading={false}
      searchPlaceholder="Поиск по задачам (скоро)"
      searchDisabled={true}
      sidebar={sidebar}
      sidebarTitle="Фильтры"
      pagination={
        !tasksCrud.isLoading && tasksCrud.items && tasksCrud.items.length > 0 ? (
          <Pagination
            currentPage={tasksCrud.page}
            totalPages={tasksCrud.pagination.pages}
            totalItems={tasksCrud.pagination.total}
            onPageChange={tasksCrud.setPage}
            loading={tasksCrud.isLoading}
          />
        ) : null
      }
    >
      <EntityList
        items={tasksCrud.items}
        renderItem={(task) => (
          <>
            <div
              className={entityListStyles.entityItemContent}
              onClick={() => handleViewTask(task)}
            >
              <div className={entityListStyles.entityItemMain}>
                <div className={entityListStyles.entityItemAvatar}>
                  <FiClock />
                </div>
                <div className={entityListStyles.entityItemInfo}>
                  <div className={entityListStyles.entityItemHeader}>
                    <p className={entityListStyles.entityItemTitle}>
                      Задача {task.id.slice(0, 8)}
                    </p>
                    <div className={styles.statusContainer}>
                      {getStatusBadge(task.status)}
                    </div>
                  </div>
                  <div className={entityListStyles.entityItemMeta}>
                    <span className={entityListStyles.entityItemMetaItem}>
                      <FiUser className={entityListStyles.entityItemMetaIcon} />
                      <span className={entityListStyles.entityItemMetaLabel}>Пользователь:</span>{' '}
                      {task.user_full_name || `ID: ${task.user_id}`}
                    </span>
                    <span className={entityListStyles.entityItemSeparator}>•</span>
                    <span className={entityListStyles.entityItemMetaItem}>
                      <span className={entityListStyles.entityItemMetaLabel}>Создана:</span>{' '}
                      {formatDate(task.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className={entityListStyles.entityActions}>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiEye />}
                onClick={() => handleViewTask(task)}
                aria-label={`Просмотреть задачу ${task.id.slice(0, 8)}`}
                className={entityListStyles.btnView}
              >
                Просмотр
              </Button>
            </div>
          </>
        )}
        emptyMessage={
          !hasLoadedOnce
            ? 'Загрузка задач...'
            : hasActiveFilters
              ? 'По выбранному фильтру ничего не найдено.'
              : 'Задачи актуализации не найдены.'
        }
        loading={tasksCrud.isLoading}
      />
    </CrudListLayout>
  );
}
