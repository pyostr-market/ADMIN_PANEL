import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFlag, FiPlus, FiTrash2, FiEye, FiEdit2 } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList } from '../../../shared/lib/crud';
import {
  getFeatureFlagsRequest,
  deleteFeatureFlagRequest,
} from '../api/cmsApi';
import styles from './FeatureFlagsListPage.module.css';
import entityListStyles from '../../../shared/ui/EntityList/EntityList.module.css';

const PAGE_LIMIT = 10;

function DeleteFeatureFlagModal({ flag, onClose, onSubmit, isSubmitting }) {
  if (!flag) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление feature flag"
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
      <p className={styles.modalConfirmText}>
        Вы уверены, что хотите удалить флаг{' '}
        <strong>"{flag.key}"</strong>?
      </p>
      <p className={styles.modalConfirmNote}>
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function FeatureFlagsListPage() {
  const navigate = useNavigate();

  const [flagToDelete, setFlagToDelete] = useState(null);

  const flagsCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT } = {}) => {
      const offset = (page - 1) * limit;
      const data = await getFeatureFlagsRequest({
        limit,
        offset,
      });
      return data;
    },
    deleteFn: deleteFeatureFlagRequest,
    entityName: 'Feature Flag',
    defaultLimit: PAGE_LIMIT,
    syncWithUrl: true,
  });

  const handleDeleteFlag = async () => {
    if (!flagToDelete) return;

    const result = await flagsCrud.delete(flagToDelete.id);
    if (result) {
      setFlagToDelete(null);
    }
  };

  const handleViewFlag = (flag) => {
    navigate(`/cms/feature-flags/${flag.id}`);
  };

  const handleEditFlag = (flag) => {
    navigate(`/cms/feature-flags/${flag.id}/edit`);
  };

  const handleCreateFlag = () => {
    navigate('/cms/feature-flags/create');
  };

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1 className={styles.featureFlagsPageTitle}>Feature Flags</h1>
            <div className={styles.featureFlagsPageControls}>
              <PermissionGate permission={['cms:create']} fallback={null}>
                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={handleCreateFlag}
                >
                  Создать флаг
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        showSearch={true}
        searchValue={flagsCrud.search}
        onSearchChange={flagsCrud.setSearch}
        searchLoading={flagsCrud.isLoading}
        searchPlaceholder="Поиск по ключу или описанию..."

        showFilters={false}

        pagination={
          !flagsCrud.isLoading && flagsCrud.items && flagsCrud.items.length > 0 ? (
            <Pagination
              currentPage={flagsCrud.page}
              totalPages={flagsCrud.pagination.pages}
              totalItems={flagsCrud.pagination.total}
              onPageChange={flagsCrud.setPage}
              loading={flagsCrud.isLoading}
            />
          ) : null
        }
      >
        <EntityList
          items={flagsCrud.items}
          renderItem={(flag) => (
            <>
              <div className={entityListStyles.entityItemContent} onClick={() => handleViewFlag(flag)}>
                <div className={entityListStyles.entityItemMain}>
                  <div className={entityListStyles.entityItemAvatar}>
                    <FiFlag />
                  </div>
                  <div className={entityListStyles.entityItemInfo}>
                    <div className={entityListStyles.entityItemHeader}>
                      <p className={entityListStyles.entityItemTitle}>
                        {flag.key}
                      </p>
                    </div>
                    <div className={entityListStyles.entityItemMeta}>
                      <span className={entityListStyles.entityItemMetaItem}>
                        <span className={entityListStyles.entityItemMetaLabel}>Описание:</span>{' '}
                        {flag.description || '—'}
                      </span>
                      <span className={entityListStyles.entityItemSeparator}>•</span>
                      <span className={entityListStyles.entityItemMetaItem}>
                        <span className={entityListStyles.entityItemMetaLabel}>Статус:</span>{' '}
                        {flag.enabled ? (
                          <span className={styles.statusEnabled}>Включен</span>
                        ) : (
                          <span className={styles.statusDisabled}>Выключен</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={entityListStyles.entityActions}>
                <PermissionGate permission={['cms:update']} fallback={null}>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiEdit2 />}
                    onClick={() => handleEditFlag(flag)}
                    aria-label={`Редактировать флаг ${flag.id}`}
                    className={entityListStyles.btnEdit}
                  >
                    Редактировать
                  </Button>
                </PermissionGate>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEye />}
                  onClick={() => handleViewFlag(flag)}
                  aria-label={`Просмотреть флаг ${flag.id}`}
                  className={entityListStyles.btnView}
                >
                  Просмотр
                </Button>

                <PermissionGate permission={['cms:delete']} fallback={null}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFlagToDelete(flag)}
                    disabled={flagsCrud.isSubmitting}
                    aria-label="Удалить флаг"
                    className={entityListStyles.btnDelete}
                  >
                    <FiTrash2 />
                  </Button>
                </PermissionGate>
              </div>
            </>
          )}
          emptyMessage={
            flagsCrud.isLoading
              ? 'Загрузка флагов...'
              : flagsCrud.search
                ? 'По вашему запросу ничего не найдено.'
                : 'Feature flags не найдены.'
          }
          loading={flagsCrud.isLoading}
        />
      </CrudListLayout>

      {flagToDelete && (
        <DeleteFeatureFlagModal
          flag={flagToDelete}
          onClose={() => setFlagToDelete(null)}
          onSubmit={handleDeleteFlag}
          isSubmitting={flagsCrud.isSubmitting}
        />
      )}
    </>
  );
}
