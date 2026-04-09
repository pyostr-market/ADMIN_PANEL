import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEye, FiEdit2, FiMapPin } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList } from '../../../shared/lib/crud';
import { getRegionsRequest, deleteRegionRequest } from '../api/regionsApi';
import styles from './RegionsListPage.module.css';
import entityListStyles from '../../../shared/ui/EntityList/EntityList.module.css';

const PAGE_LIMIT = 20;

function DeleteRegionModal({ region, onClose, onSubmit, isSubmitting }) {
  if (!region) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление региона"
      size="sm"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button variant="danger" onClick={onSubmit} loading={isSubmitting}>Удалить</Button>
        </>
      )}
    >
      <p className={styles.modalConfirmText}>
        Вы уверены, что хотите удалить регион <strong>{region.name || `ID: ${region.id}`}</strong>?
      </p>
      <p className={styles.modalConfirmNote}>
        Это действие нельзя отменить. Все дочерние регионы будут удалены каскадно.
      </p>
    </Modal>
  );
}

export function RegionsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [regionToDelete, setRegionToDelete] = useState(null);

  const regionsCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search } = {}) => {
      const data = await getRegionsRequest({ page, limit, name: search });
      return data;
    },
    deleteFn: deleteRegionRequest,
    entityName: 'Регион',
    defaultLimit: PAGE_LIMIT,
    syncWithUrl: true,
  });

  const handleDeleteRegion = async () => {
    if (!regionToDelete) return;
    const result = await regionsCrud.delete(regionToDelete.id);
    if (result) setRegionToDelete(null);
  };

  const navigateWithParams = (path) => {
    const paramsString = searchParams.toString();
    const fullPath = paramsString ? `${path}?${paramsString}` : path;
    navigate(fullPath);
  };

  const handleViewRegion = (region) => navigateWithParams(`/settings/regions/${region.id}`);
  const handleEditRegion = (region) => navigateWithParams(`/settings/regions/${region.id}/edit`);
  const handleCreateRegion = () => navigateWithParams('/settings/regions/create');

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1 className={styles.regionsPageTitle}>Регионы</h1>
            <div className={styles.regionsPageControls}>
              <PermissionGate permission={['region:create']} fallback={null}>
                <Button variant="primary" leftIcon={<FiPlus />} onClick={handleCreateRegion}>
                  Создать регион
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        showSearch={true}
        searchValue={regionsCrud.search}
        onSearchChange={regionsCrud.setSearch}
        searchLoading={regionsCrud.isLoading}
        searchPlaceholder="Поиск по названию..."
        showFilters={false}
        pagination={
          !regionsCrud.isLoading && regionsCrud.items && regionsCrud.items.length > 0 ? (
            <Pagination
              currentPage={regionsCrud.page}
              totalPages={regionsCrud.pagination.pages}
              totalItems={regionsCrud.pagination.total}
              onPageChange={regionsCrud.setPage}
              loading={regionsCrud.isLoading}
            />
          ) : null
        }
      >
        <EntityList
          items={regionsCrud.items}
          renderItem={(region) => (
            <>
              <div className={entityListStyles.entityItemContent} onClick={() => handleViewRegion(region)}>
                <div className={entityListStyles.entityItemMain}>
                  <div className={entityListStyles.entityItemAvatar}>
                    <FiMapPin />
                  </div>
                  <div className={entityListStyles.entityItemInfo}>
                    <div className={entityListStyles.entityItemHeader}>
                      <p className={entityListStyles.entityItemTitle}>
                        {region.name || 'Без названия'}
                      </p>
                    </div>
                    <div className={entityListStyles.entityItemMeta}>
                      <span className={entityListStyles.entityItemMetaItem}>
                        <span className={entityListStyles.entityItemMetaLabel}>ID:</span> {region.id}
                      </span>
                      {region.parent_id && (
                        <>
                          <span className={entityListStyles.entityItemSeparator}>•</span>
                          <span className={entityListStyles.entityItemMetaItem}>
                            <span className={entityListStyles.entityItemMetaLabel}>Родитель:</span> ID {region.parent_id}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className={entityListStyles.entityActions}>
                <PermissionGate permission={['region:update']} fallback={null}>
                  <Button variant="secondary" size="sm" leftIcon={<FiEdit2 />} onClick={() => handleEditRegion(region)} className={entityListStyles.btnEdit}>
                    Редактировать
                  </Button>
                </PermissionGate>
                <Button variant="secondary" size="sm" leftIcon={<FiEye />} onClick={() => handleViewRegion(region)} className={entityListStyles.btnView}>
                  Просмотр
                </Button>
                <PermissionGate permission={['region:delete']} fallback={null}>
                  <Button variant="ghost" size="icon" onClick={() => setRegionToDelete(region)} disabled={regionsCrud.isSubmitting} className={entityListStyles.btnDelete}>
                    <FiTrash2 />
                  </Button>
                </PermissionGate>
              </div>
            </>
          )}
          emptyMessage={regionsCrud.isLoading ? 'Загрузка регионов...' : regionsCrud.search ? 'По вашему запросу ничего не найдено.' : 'Регионы не найдены.'}
          loading={regionsCrud.isLoading}
        />
      </CrudListLayout>

      {regionToDelete && (
        <DeleteRegionModal
          region={regionToDelete}
          onClose={() => setRegionToDelete(null)}
          onSubmit={handleDeleteRegion}
          isSubmitting={regionsCrud.isSubmitting}
        />
      )}
    </>
  );
}
