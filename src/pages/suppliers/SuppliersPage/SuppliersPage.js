import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBox, FiPlus, FiTrash2, FiEye, FiEdit2, FiMail, FiPhone } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { SearchInput } from '../../../shared/ui/SearchInput/SearchInput';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { useCrudList } from '../../../shared/lib/crud';
import {
  getSuppliersRequest,
  deleteSupplierRequest,
} from '../api/suppliersApi';
import styles from './SuppliersPage.module.css';

const PAGE_LIMIT = 20;

function DeleteSupplierModal({ supplier, onClose, onSubmit, isSubmitting }) {
  if (!supplier) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление поставщика"
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
        Вы уверены, что хотите удалить поставщика{' '}
        <strong>{supplier.name || `ID: ${supplier.id}`}</strong>?
      </p>
      <p className={styles.modalConfirmNote}>
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function SuppliersPage() {
  const navigate = useNavigate();

  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const suppliersCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search } = {}) => {
      const data = await getSuppliersRequest({
        page,
        limit,
        name: search,
      });
      return data;
    },
    deleteFn: deleteSupplierRequest,
    entityName: 'Поставщик',
    defaultLimit: PAGE_LIMIT,
  });

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;

    const result = await suppliersCrud.delete(supplierToDelete.id);
    if (result) {
      setSupplierToDelete(null);
    }
  };

  const handleViewSupplier = (supplier) => {
    navigate(`/suppliers/${supplier.id}`);
  };

  const handleEditSupplier = (supplier) => {
    navigate(`/suppliers/${supplier.id}/edit`);
  };

  const handleCreateSupplier = () => {
    navigate('/suppliers/create');
  };

  return (
    <section className={styles.suppliersPage}>
      <header className={styles.suppliersPageHeader}>
        <h1 className={styles.suppliersPageTitle}>Поставщики</h1>
        <div className={styles.suppliersPageControls}>
          <PermissionGate permission={['supplier:create']} fallback={null}>
            <Button
              variant="primary"
              leftIcon={<FiPlus />}
              onClick={handleCreateSupplier}
            >
              Создать поставщика
            </Button>
          </PermissionGate>
        </div>
      </header>

      <div className={`${styles.suppliersPageFilters}${suppliersCrud.isLoading ? ` ${styles.suppliersPageFiltersLoading}` : ''}`}>
        <SearchInput
          value={suppliersCrud.search}
          onChange={(e) => suppliersCrud.setSearch(e.target.value)}
          placeholder="Поиск по названию, email или телефону..."
          loading={suppliersCrud.isLoading}
        />
      </div>

      <EntityList
        items={suppliersCrud.items}
        renderItem={(supplier) => (
          <>
            <div className={styles.suppliersPageItemContent} onClick={() => handleViewSupplier(supplier)}>
              <div className={styles.suppliersPageItemMain}>
                <div className={styles.suppliersPageAvatar}>
                  <FiBox />
                </div>
                <div className={styles.suppliersPageItemInfo}>
                  <div className={styles.suppliersPageItemHeader}>
                    <p className={styles.suppliersPageItemTitle}>
                      {supplier.name || 'Без названия'}
                    </p>
                  </div>
                  <div className={styles.suppliersPageItemMeta}>
                    <span className={styles.suppliersPageMetaItem}>
                      <span className={styles.suppliersPageMetaLabel}>ID:</span> {supplier.id}
                    </span>
                    {supplier.contact_email && (
                      <>
                        <span className={styles.suppliersPageSeparator}>•</span>
                        <span className={styles.suppliersPageMetaItem}>
                          <FiMail className={styles.suppliersPageMetaIcon} />
                          {supplier.contact_email}
                        </span>
                      </>
                    )}
                    {supplier.phone && (
                      <>
                        <span className={styles.suppliersPageSeparator}>•</span>
                        <span className={styles.suppliersPageMetaItem}>
                          <FiPhone className={styles.suppliersPageMetaIcon} />
                          {supplier.phone}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.suppliersPageItemActions}>
              <PermissionGate permission={['supplier:update']} fallback={null}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEdit2 />}
                  onClick={() => handleEditSupplier(supplier)}
                  aria-label={`Редактировать поставщика ${supplier.name || supplier.id}`}
                >
                  Редактировать
                </Button>
              </PermissionGate>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiEye />}
                onClick={() => handleViewSupplier(supplier)}
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
                  className={styles.btnDelete}
                >
                  <FiTrash2 />
                </Button>
              </PermissionGate>
            </div>
          </>
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

      {!suppliersCrud.isLoading && suppliersCrud.items && suppliersCrud.items.length > 0 && (
        <Pagination
          currentPage={suppliersCrud.page}
          totalPages={suppliersCrud.pagination.pages}
          totalItems={suppliersCrud.pagination.total}
          onPageChange={suppliersCrud.setPage}
          loading={suppliersCrud.isLoading}
        />
      )}

      {supplierToDelete && (
        <DeleteSupplierModal
          supplier={supplierToDelete}
          onClose={() => setSupplierToDelete(null)}
          onSubmit={handleDeleteSupplier}
          isSubmitting={suppliersCrud.isSubmitting}
        />
      )}
    </section>
  );
}
