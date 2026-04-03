import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiClock, FiUser, FiArrowLeft, FiPackage, FiTag, FiTrash2, FiMapPin } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { InfoBlock } from '../../../shared/ui/InfoBlock/InfoBlock';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { EntityCard, EntityCardMetaItem } from '../../../shared/ui/EntityCard/EntityCard';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList } from '../../../shared/lib/crud';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getActualizationTaskByIdRequest,
  deleteActualizationTaskRequest,
} from '../api/actualizationTasksApi';
import {
  getActualizationProductsRequest,
} from '../api/actualizationProductsApi';
import { getCategoryTreeRequest } from '../../../shared/api/modules/categoriesApi';
import styles from './ActualizationTaskDetailPage.module.css';
import entityListStyles from '../../../shared/ui/EntityList/EntityList.module.css';

const PRODUCTS_PER_PAGE = 20;

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
    second: '2-digit',
  });
}

function DeleteTaskModal({ task, onClose, onSubmit, isSubmitting }) {
  if (!task) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление задачи актуализации"
      size="sm"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            variant="danger"
            onClick={onSubmit}
            loading={isSubmitting}
          >
            Удалить
          </Button>
        </>
      )}
    >
      <p className="modal-confirm-text">
        Вы уверены, что хотите удалить задачу{' '}
        <strong>ID: {task.id.slice(0, 8)}</strong>?
      </p>
      <p className="modal-confirm-note">
        Это действие удалит все привязанные товары. Его нельзя отменить.
      </p>
    </Modal>
  );
}

export function ActualizationTaskDetailPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { taskId } = useParams();

  const [task, setTask] = useState(null);
  const [isTaskLoading, setIsTaskLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  // Загрузка задачи
  const loadTask = useCallback(async () => {
    setIsTaskLoading(true);
    try {
      const data = await getActualizationTaskByIdRequest(taskId);
      setTask(data);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsTaskLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  // Загрузка категорий (дерево → плоский список)
  useEffect(() => {
    const loadCategories = async () => {
      if (categories.length > 0 || isCategoriesLoading) return;
      setIsCategoriesLoading(true);
      try {
        const tree = await getCategoryTreeRequest();
        // Превращаем дерево в плоский список
        const flattenTree = (nodes, depth = 0) => {
          const result = [];
          for (const node of (nodes || [])) {
            result.push({ ...node, depth });
            if (node.children && node.children.length > 0) {
              result.push(...flattenTree(node.children, depth + 1));
            }
          }
          return result;
        };
        setCategories(flattenTree(tree || []));
      } catch (error) {
        // Не показываем ошибку — фильтры просто не загрузятся
      } finally {
        setIsCategoriesLoading(false);
      }
    };
    loadCategories();
  }, [categories.length, isCategoriesLoading]);

  // CRUD для товаров
  const productsCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PRODUCTS_PER_PAGE, category_id, supplier_id } = {}) => {
      return getActualizationProductsRequest({
        page,
        limit,
        actualization_task_id: taskId,
        category_id: category_id || undefined,
        supplier_id: supplier_id || undefined,
      });
    },
    entityName: 'Товар',
    defaultLimit: PRODUCTS_PER_PAGE,
    syncWithUrl: true,
  });

  const handleBack = () => {
    navigate('/actualization/actualization');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteActualizationTaskRequest(taskId);
      notificationsRef.current?.info('Задача актуализации удалена');
      navigate('/actualization/actualization');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const hasActiveFilters = !!(productsCrud.filters?.category_id || productsCrud.filters?.supplier_id);

  const filtersSidebar = (
    <div className={styles.filtersSidebar}>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Категория</label>
        <select
          className={styles.filterSelect}
          value={productsCrud.filters?.category_id || ''}
          onChange={(e) => {
            const newVal = e.target.value;
            const newFilters = { ...productsCrud.filters };
            if (newVal) {
              newFilters.category_id = newVal;
            } else {
              delete newFilters.category_id;
            }
            productsCrud.setFilters(newFilters);
            productsCrud.setPage(1);
          }}
          disabled={isCategoriesLoading}
        >
          <option value="">Все категории</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.depth > 0 ? '—'.repeat(cat.depth) + ' ' : ''}{cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Поставщик</label>
        <select
          className={styles.filterSelect}
          value={productsCrud.filters?.supplier_id || ''}
          onChange={(e) => {
            const newVal = e.target.value;
            const newFilters = { ...productsCrud.filters };
            if (newVal) {
              newFilters.supplier_id = newVal;
            } else {
              delete newFilters.supplier_id;
            }
            productsCrud.setFilters(newFilters);
            productsCrud.setPage(1);
          }}
          disabled
        >
          <option value="">Все поставщики</option>
        </select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            productsCrud.setFilters({});
            productsCrud.setPage(1);
          }}
          className={styles.resetFilterButton}
        >
          Сбросить фильтры
        </Button>
      )}
    </div>
  );

  // Loading state
  if (isTaskLoading) {
    return (
      <section className={styles.taskDetailPage}>
        <div className={styles.loadingState}>
          <div className="loading-spinner" />
          <p>Загрузка задачи...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (!task) {
    return (
      <section className={styles.taskDetailPage}>
        <div className={styles.errorState}>
          <h2>Задача не найдена</h2>
          <p>Запрошенная задача не существует или была удалена</p>
          <Button variant="primary" leftIcon={<FiArrowLeft />} onClick={handleBack}>
            Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.taskDetailPage}>
      {/* Header */}
      <header className={styles.taskDetailPageHeader}>
        <Button variant="ghost" onClick={handleBack} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.taskDetailPageActions}>
          <Button
            variant="danger"
            leftIcon={<FiTrash2 />}
            onClick={() => setShowDeleteModal(true)}
            loading={isDeleting}
          >
            Удалить
          </Button>
        </div>
      </header>

      {/* Task Info */}
      <div className={styles.taskInfoSection}>
        <InfoBlock
          title="Информация"
          headerIcon={<FiClock />}
          items={[
            {
              label: 'ID задачи',
              value: task.id,
              iconVariant: 'primary',
            },
            {
              label: 'Пользователь',
              value: task.user_full_name || `ID: ${task.user_id}`,
              icon: <FiUser />,
              iconVariant: 'secondary',
            },
            {
              label: 'Статус',
              value: getStatusBadge(task.status),
              iconVariant: 'info',
            },
            {
              label: 'Дата создания',
              value: formatDate(task.created_at),
              iconVariant: 'accent',
            },
          ]}
        />
      </div>

      {/* Products section */}
      <div className={styles.productsSection}>
        <div className={styles.productsHeader}>
          <h2 className={styles.productsTitle}>
            <FiPackage className={styles.productsTitleIcon} />
            Товары
          </h2>
          {productsCrud.pagination?.total !== undefined && (
            <span className={styles.productsCount}>
              {productsCrud.pagination.total} шт.
            </span>
          )}
        </div>

        <CrudListLayout
          showSearch={true}
          searchValue=""
          onSearchChange={() => {}}
          searchLoading={false}
          searchPlaceholder="Поиск по товарам (скоро)"
          searchDisabled={true}
          sidebar={filtersSidebar}
          sidebarTitle="Фильтры"
          pagination={
            !productsCrud.isLoading && productsCrud.items && productsCrud.items.length > 0 ? (
              <Pagination
                currentPage={productsCrud.page}
                totalPages={productsCrud.pagination.pages}
                totalItems={productsCrud.pagination.total}
                onPageChange={productsCrud.setPage}
                loading={productsCrud.isLoading}
              />
            ) : null
          }
        >
          <EntityList
            items={productsCrud.items}
            renderItem={(product) => (
              <EntityCard
                icon={<FiPackage />}
                avatarColor
                title={product.name || 'Без названия'}
                meta={(
                  <>
                    <EntityCardMetaItem>
                      <span className={styles.metaLabel}>ID:</span> {product.id}
                    </EntityCardMetaItem>
                    {product.price && (
                      <EntityCardMetaItem>
                        {product.price.toLocaleString('ru-RU')} ₽
                      </EntityCardMetaItem>
                    )}
                    {product.category_name && (
                      <EntityCardMetaItem icon={<FiTag />}>
                        {product.category_name}
                      </EntityCardMetaItem>
                    )}
                    {product.supplier_name && (
                      <EntityCardMetaItem icon={<FiMapPin />}>
                        {product.supplier_name}
                      </EntityCardMetaItem>
                    )}
                  </>
                )}
              />
            )}
            emptyMessage={
              productsCrud.isLoading
                ? 'Загрузка товаров...'
                : hasActiveFilters
                  ? 'По выбранному фильтру ничего не найдено.'
                  : 'Товары не найдены.'
            }
            loading={productsCrud.isLoading}
          />
        </CrudListLayout>
      </div>

      {showDeleteModal && (
        <DeleteTaskModal
          task={task}
          onClose={() => setShowDeleteModal(false)}
          onSubmit={handleDelete}
          isSubmitting={isDeleting}
        />
      )}
    </section>
  );
}
