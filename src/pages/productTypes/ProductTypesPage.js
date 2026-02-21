import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEye, FiEdit2 } from 'react-icons/fi';
import { PermissionGate } from '../../shared/ui/PermissionGate';
import { Button } from '../../shared/ui/Button';
import { SearchInput } from '../../shared/ui/SearchInput';
import { Pagination } from '../../shared/ui/Pagination';
import { EntityList } from '../../shared/ui/EntityList';
import { Modal } from '../../shared/ui/Modal';
import { useCrudList } from '../../shared/lib/crud';
import {
  getProductTypesRequest,
  deleteProductTypeRequest,
} from './api/productTypesApi';
import './ProductTypesPage.css';

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
        Вы уверены, что хотите удалить тип продукта{' '}
        <strong>{productType.name || `ID: ${productType.id}`}</strong>?
      </p>
      <p className="modal-confirm-note">
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function ProductTypesPage() {
  const navigate = useNavigate();

  const [productTypeToDelete, setProductTypeToDelete] = useState(null);

  const productTypesCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search } = {}) => {
      const data = await getProductTypesRequest({
        page,
        limit,
        name: search,
      });
      return data;
    },
    deleteFn: deleteProductTypeRequest,
    entityName: 'Тип продукта',
    defaultLimit: PAGE_LIMIT,
  });

  const handleDeleteProductType = async () => {
    if (!productTypeToDelete) return;

    const result = await productTypesCrud.delete(productTypeToDelete.id);
    if (result) {
      setProductTypeToDelete(null);
    }
  };

  const handleViewProductType = (productType) => {
    navigate(`/catalog/device_type/${productType.id}`);
  };

  const handleEditProductType = (productType) => {
    navigate(`/catalog/device_type/${productType.id}/edit`);
  };

  const handleCreateProductType = () => {
    navigate('/catalog/device_type/create');
  };

  return (
    <section className="product-types-page">
      <header className="product-types-page__header">
        <h1 className="product-types-page__title">Типы продуктов</h1>
        <div className="product-types-page__controls">
          <PermissionGate permission={['product_type:create']} fallback={null}>
            <Button
              variant="primary"
              leftIcon={<FiPlus />}
              onClick={handleCreateProductType}
            >
              Создать тип продукта
            </Button>
          </PermissionGate>
        </div>
      </header>

      <div className={`product-types-page__filters${productTypesCrud.isLoading ? ' product-types-page__filters--loading' : ''}`}>
        <SearchInput
          value={productTypesCrud.search}
          onChange={(e) => productTypesCrud.setSearch(e.target.value)}
          placeholder="Поиск по названию..."
          loading={productTypesCrud.isLoading}
        />
      </div>

      <EntityList
        items={productTypesCrud.items}
        renderItem={(productType) => (
          <>
            <div className="product-types-page__item-content" onClick={() => handleViewProductType(productType)}>
              <div className="product-types-page__item-main">
                <div className="product-types-page__item-info">
                  <div className="product-types-page__item-header">
                    <p className="product-types-page__item-title">
                      {productType.name || 'Без названия'}
                    </p>
                  </div>
                  <div className="product-types-page__item-meta">
                    <span className="product-types-page__meta-item">
                      <span className="product-types-page__meta-label">ID:</span> {productType.id}
                    </span>
                    {productType.parent_id && (
                      <>
                        <span className="product-types-page__separator">•</span>
                        <span className="product-types-page__meta-item">
                          Родительский тип: {productType.parent_id}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="product-types-page__item-actions">
              <PermissionGate permission={['product_type:update']} fallback={null}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEdit2 />}
                  onClick={() => handleEditProductType(productType)}
                  aria-label={`Редактировать тип продукта ${productType.name || productType.id}`}
                >
                  Редактировать
                </Button>
              </PermissionGate>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiEye />}
                onClick={() => handleViewProductType(productType)}
                aria-label={`Просмотреть тип продукта ${productType.name || productType.id}`}
              >
                Просмотр
              </Button>

              <PermissionGate permission={['product_type:delete']} fallback={null}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setProductTypeToDelete(productType)}
                  disabled={productTypesCrud.isSubmitting}
                  aria-label="Удалить тип продукта"
                  className="btn-delete"
                >
                  <FiTrash2 />
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        emptyMessage={
          productTypesCrud.isLoading
            ? 'Загрузка типов продуктов...'
            : productTypesCrud.search
              ? 'По вашему запросу ничего не найдено.'
              : 'Типы продуктов не найдены.'
        }
        loading={productTypesCrud.isLoading}
      />

      {!productTypesCrud.isLoading && productTypesCrud.items && productTypesCrud.items.length > 0 && (
        <Pagination
          currentPage={productTypesCrud.page}
          totalPages={productTypesCrud.pagination.pages}
          totalItems={productTypesCrud.pagination.total}
          onPageChange={productTypesCrud.setPage}
          loading={productTypesCrud.isLoading}
        />
      )}

      {productTypeToDelete && (
        <DeleteProductTypeModal
          productType={productTypeToDelete}
          onClose={() => setProductTypeToDelete(null)}
          onSubmit={handleDeleteProductType}
          isSubmitting={productTypesCrud.isSubmitting}
        />
      )}
    </section>
  );
}
