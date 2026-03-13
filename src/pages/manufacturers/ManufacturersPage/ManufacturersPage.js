import { useState } from 'react';
import { FiBox, FiPlus, FiTrash2, FiEye, FiEdit2 } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { EntityCard, EntityCardMetaItem } from '../../../shared/ui/EntityCard/EntityCard';
import { DeleteConfirmModal } from '../../../shared/ui/DeleteConfirmModal/DeleteConfirmModal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList, useEntityActions } from '../../../shared/lib/crud';
import {
  getManufacturersRequest,
  deleteManufacturerRequest,
} from '../../../shared/api/modules/manufacturersApi';
import styles from './ManufacturersPage.module.css';

const PAGE_LIMIT = 20;

export function ManufacturersPage() {
  const [manufacturerToDelete, setManufacturerToDelete] = useState(null);

  const manufacturersCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search } = {}) => {
      const data = await getManufacturersRequest({
        page,
        limit,
        name: search,
      });
      return data;
    },
    deleteFn: deleteManufacturerRequest,
    entityName: 'Производитель',
    defaultLimit: PAGE_LIMIT,
    syncWithUrl: true,
  });

  const actions = useEntityActions({
    baseUrl: '/catalog/manufacturers',
    onSuccess: (action) => {
      if (action === 'delete') {
        setManufacturerToDelete(null);
      }
    },
  });

  const handleDeleteManufacturer = async () => {
    if (!manufacturerToDelete) return;
    await actions.remove(manufacturerToDelete.id);
  };

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1 className={styles.manufacturersPageTitle}>Производители</h1>
            <div className={styles.manufacturersPageControls}>
              <PermissionGate permission={['manufacturer:create']} fallback={null}>
                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={actions.createHandler}
                >
                  Создать производителя
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        showSearch={true}
        searchValue={manufacturersCrud.search}
        onSearchChange={manufacturersCrud.setSearch}
        searchLoading={manufacturersCrud.isLoading}
        searchPlaceholder="Поиск по названию или описанию..."

        showFilters={false}

        pagination={
          !manufacturersCrud.isLoading && manufacturersCrud.items && manufacturersCrud.items.length > 0 ? (
            <Pagination
              currentPage={manufacturersCrud.page}
              totalPages={manufacturersCrud.pagination.pages}
              totalItems={manufacturersCrud.pagination.total}
              onPageChange={manufacturersCrud.setPage}
              loading={manufacturersCrud.isLoading}
            />
          ) : null
        }
      >
        <EntityList
          items={manufacturersCrud.items}
          renderItem={(manufacturer) => (
            <EntityCard
              icon={<FiBox />}
              avatarColor
              title={manufacturer.name || 'Без названия'}
              onClick={(e) => actions.viewHandler(e, manufacturer.id)}
              meta={(
                <>
                  <EntityCardMetaItem>
                    <span className={styles.metaLabel}>ID:</span> {manufacturer.id}
                  </EntityCardMetaItem>
                  {manufacturer.description && (
                    <EntityCardMetaItem>
                      {manufacturer.description}
                    </EntityCardMetaItem>
                  )}
                </>
              )}
              actions={(
                <>
                  <PermissionGate permission={['manufacturer:update']} fallback={null}>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<FiEdit2 />}
                      onClick={(e) => actions.editHandler(e, manufacturer.id)}
                      aria-label={`Редактировать производителя ${manufacturer.name || manufacturer.id}`}
                    >
                      Редактировать
                    </Button>
                  </PermissionGate>

                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiEye />}
                    onClick={(e) => actions.viewHandler(e, manufacturer.id)}
                    aria-label={`Просмотреть производителя ${manufacturer.name || manufacturer.id}`}
                  >
                    Просмотр
                  </Button>

                  <PermissionGate permission={['manufacturer:delete']} fallback={null}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setManufacturerToDelete(manufacturer)}
                      disabled={manufacturersCrud.isSubmitting}
                      aria-label="Удалить производителя"
                    >
                      <FiTrash2 />
                    </Button>
                  </PermissionGate>
                </>
              )}
            />
          )}
          emptyMessage={
            manufacturersCrud.isLoading
              ? 'Загрузка производителей...'
              : manufacturersCrud.search
                ? 'По вашему запросу ничего не найдено.'
                : 'Производители не найдены.'
          }
          loading={manufacturersCrud.isLoading}
        />
      </CrudListLayout>

      {manufacturerToDelete && (
        <DeleteConfirmModal
          isOpen
          onClose={() => setManufacturerToDelete(null)}
          onSubmit={handleDeleteManufacturer}
          isSubmitting={manufacturersCrud.isSubmitting}
          entityName="производителя"
          entityTitle={manufacturerToDelete.name || `ID: ${manufacturerToDelete.id}`}
        />
      )}
    </>
  );
}
