import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEye, FiEdit2, FiBox } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList } from '../../../shared/lib/crud';
import { getProductTypesRequest, deleteProductTypeRequest } from '../api/productTypesApi';
import styles from './ProductTypesPage.module.css';

const PAGE_LIMIT = 20;

function DeleteProductTypeModal({ productType, onClose, onSubmit, isSubmitting }) {
  if (!productType) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление типа продукта"
      size="sm"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button variant="danger" onClick={onSubmit} loading={isSubmitting}>Удалить</Button>
        </>
      )}
    >
      <p className={styles.modalConfirmText}>
        Вы уверены, что хотите удалить тип продукта <strong>{productType.name || `ID: ${productType.id}`}</strong>?
      </p>
      <p className={styles.modalConfirmNote}>Это действие нельзя отменить.</p>
    </Modal>
  );
}

export function ProductTypesPage() {
  const navigate = useNavigate();
  const [productTypeToDelete, setProductTypeToDelete] = useState(null);

  const productTypesCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search } = {}) => {
      const data = await getProductTypesRequest({ page, limit, name: search });
      return data;
    },
    deleteFn: deleteProductTypeRequest,
    entityName: 'Тип продукта',
    defaultLimit: PAGE_LIMIT,
  });

  const handleDeleteProductType = async () => {
    if (!productTypeToDelete) return;
    const result = await productTypesCrud.delete(productTypeToDelete.id);
    if (result) setProductTypeToDelete(null);
  };

  const handleViewProductType = (productType) => navigate(`/catalog/device_type/${productType.id}`);
  const handleEditProductType = (productType) => navigate(`/catalog/device_type/${productType.id}/edit`);
  const handleCreateProductType = () => navigate('/catalog/device_type/create');

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1 className={styles.productTypesPageTitle}>Типы продуктов</h1>
            <div className={styles.productTypesPageControls}>
              <PermissionGate permission={['product_type:create']} fallback={null}>
                <Button variant="primary" leftIcon={<FiPlus />} onClick={handleCreateProductType}>
                  Создать тип продукта
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        showSearch={true}
        searchValue={productTypesCrud.search}
        onSearchChange={productTypesCrud.setSearch}
        searchLoading={productTypesCrud.isLoading}
        searchPlaceholder="Поиск по названию..."
        showFilters={false}
        pagination={
          !productTypesCrud.isLoading && productTypesCrud.items && productTypesCrud.items.length > 0 ? (
            <Pagination
              currentPage={productTypesCrud.page}
              totalPages={productTypesCrud.pagination.pages}
              totalItems={productTypesCrud.pagination.total}
              onPageChange={productTypesCrud.setPage}
              loading={productTypesCrud.isLoading}
            />
          ) : null
        }
      >
        <EntityList
          items={productTypesCrud.items}
          renderItem={(productType) => (
            <>
              <div className={styles.productTypesPageItemContent} onClick={() => handleViewProductType(productType)}>
                <div className={styles.productTypesPageItemMain}>
                  <div className={styles.productTypesPageAvatar}>
                    <FiBox />
                  </div>
                  <div className={styles.productTypesPageItemInfo}>
                    <div className={styles.productTypesPageItemHeader}>
                      <p className={styles.productTypesPageItemTitle}>
                        {productType.name || 'Без названия'}
                      </p>
                    </div>
                    <div className={styles.productTypesPageItemMeta}>
                      <span className={styles.productTypesPageMetaItem}>
                        <span className={styles.productTypesPageMetaLabel}>ID:</span> {productType.id}
                      </span>
                      {productType.description && (
                        <>
                          <span className={styles.productTypesPageSeparator}>•</span>
                          <span className={styles.productTypesPageMetaItem}>
                            {productType.description}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.productTypesPageItemActions}>
                <PermissionGate permission={['product_type:update']} fallback={null}>
                  <Button variant="secondary" size="sm" leftIcon={<FiEdit2 />} onClick={() => handleEditProductType(productType)}>
                    Редактировать
                  </Button>
                </PermissionGate>
                <Button variant="secondary" size="sm" leftIcon={<FiEye />} onClick={() => handleViewProductType(productType)}>
                  Просмотр
                </Button>
                <PermissionGate permission={['product_type:delete']} fallback={null}>
                  <Button variant="ghost" size="icon" onClick={() => setProductTypeToDelete(productType)} disabled={productTypesCrud.isSubmitting} className={styles.btnDelete}>
                    <FiTrash2 />
                  </Button>
                </PermissionGate>
              </div>
            </>
          )}
          emptyMessage={productTypesCrud.isLoading ? 'Загрузка типов продуктов...' : productTypesCrud.search ? 'По вашему запросу ничего не найдено.' : 'Типы продуктов не найдены.'}
          loading={productTypesCrud.isLoading}
        />
      </CrudListLayout>

      {productTypeToDelete && (
        <DeleteProductTypeModal
          productType={productTypeToDelete}
          onClose={() => setProductTypeToDelete(null)}
          onSubmit={handleDeleteProductType}
          isSubmitting={productTypesCrud.isSubmitting}
        />
      )}
    </>
  );
}
