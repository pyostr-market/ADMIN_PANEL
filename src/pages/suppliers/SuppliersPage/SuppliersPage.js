import { useState } from 'react';
import { FiBox, FiPlus, FiTrash2, FiEye, FiEdit2, FiMail, FiPhone } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { EntityCard, EntityCardMetaItem } from '../../../shared/ui/EntityCard/EntityCard';
import { DeleteConfirmModal } from '../../../shared/ui/DeleteConfirmModal/DeleteConfirmModal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList, useEntityActions } from '../../../shared/lib/crud';
import {
  getSuppliersRequest,
  deleteSupplierRequest,
} from '../../../shared/api/modules/suppliersApi';
import styles from './SuppliersPage.module.css';

const PAGE_LIMIT = 20;

export function SuppliersPage() {
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const suppliersCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search } = {}) => {
      const data = await getSuppliersRequest({ page, limit, name: search });
      return data;
    },
    deleteFn: deleteSupplierRequest,
    entityName: 'Поставщик',
    defaultLimit: PAGE_LIMIT,
    syncWithUrl: true,
  });

  const actions = useEntityActions({
    baseUrl: '/suppliers',
    onSuccess: (action) => {
      if (action === 'delete') {
        setSupplierToDelete(null);
      }
    },
  });

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;
    await actions.remove(supplierToDelete.id);
  };

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1 className={styles.suppliersPageTitle}>Поставщики</h1>
            <div className={styles.suppliersPageControls}>
              <PermissionGate permission={['supplier:create']} fallback={null}>
                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={actions.create}
                >
                  Создать поставщика
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        showSearch={true}
        searchValue={suppliersCrud.search}
        onSearchChange={suppliersCrud.setSearch}
        searchLoading={suppliersCrud.isLoading}
        searchPlaceholder="Поиск по названию или описанию..."
        showFilters={false}
        pagination={
          !suppliersCrud.isLoading && suppliersCrud.items && suppliersCrud.items.length > 0 ? (
            <Pagination
              currentPage={suppliersCrud.page}
              totalPages={suppliersCrud.pagination.pages}
              totalItems={suppliersCrud.pagination.total}
              onPageChange={suppliersCrud.setPage}
              loading={suppliersCrud.isLoading}
            />
          ) : null
        }
      >
        <EntityList
          items={suppliersCrud.items}
          renderItem={(supplier) => (
            <EntityCard
              icon={<FiBox />}
              avatarColor
              title={supplier.name || 'Без названия'}
              onClick={() => actions.view(supplier.id)}
              meta={(
                <>
                  <EntityCardMetaItem>
                    <span className={styles.metaLabel}>ID:</span> {supplier.id}
                  </EntityCardMetaItem>
                  {supplier.description && (
                    <EntityCardMetaItem>
                      {supplier.description}
                    </EntityCardMetaItem>
                  )}
                  {supplier.contact_email && (
                    <EntityCardMetaItem icon={<FiMail />}>
                      {supplier.contact_email}
                    </EntityCardMetaItem>
                  )}
                  {supplier.contact_phone && (
                    <EntityCardMetaItem icon={<FiPhone />}>
                      {supplier.contact_phone}
                    </EntityCardMetaItem>
                  )}
                </>
              )}
              actions={(
                <>
                  <PermissionGate permission={['supplier:update']} fallback={null}>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<FiEdit2 />}
                      onClick={() => actions.edit(supplier.id)}
                      aria-label={`Редактировать поставщика ${supplier.name || supplier.id}`}
                    >
                      Редактировать
                    </Button>
                  </PermissionGate>

                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiEye />}
                    onClick={() => actions.view(supplier.id)}
                    aria-label={`Просмотреть поставщика ${supplier.name || supplier.id}`}
                  >
                    Просмотр
                  </Button>

                  <PermissionGate permission={['supplier:delete']} fallback={null}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSupplierToDelete(supplier)}
                      disabled={suppliersCrud.isSubmitting}
                      aria-label="Удалить поставщика"
                    >
                      <FiTrash2 />
                    </Button>
                  </PermissionGate>
                </>
              )}
            />
          )}
          emptyMessage={
            suppliersCrud.isLoading
              ? 'Загрузка поставщиков...'
              : suppliersCrud.search
                ? 'По вашему запросу ничего не найдено.'
                : 'Поставщики не найдены.'
          }
          loading={suppliersCrud.isLoading}
        />
      </CrudListLayout>

      {supplierToDelete && (
        <DeleteConfirmModal
          isOpen
          onClose={() => setSupplierToDelete(null)}
          onSubmit={handleDeleteSupplier}
          isSubmitting={suppliersCrud.isSubmitting}
          entityName="поставщика"
          entityTitle={supplierToDelete.name || `ID: ${supplierToDelete.id}`}
        />
      )}
    </>
  );
}
