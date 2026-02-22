import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEye, FiEdit2, FiDollarSign, FiPackage, FiTag } from 'react-icons/fi';
import { PermissionGate } from '../../shared/ui/PermissionGate';
import { Button } from '../../shared/ui/Button';
import { SearchInput } from '../../shared/ui/SearchInput';
import { Pagination } from '../../shared/ui/Pagination';
import { EntityList } from '../../shared/ui/EntityList';
import { Modal } from '../../shared/ui/Modal';
import { Select } from '../../shared/ui/Select';
import { useCrudList } from '../../shared/lib/crud';
import {
  getProductsRequest,
  deleteProductRequest,
} from './api/productsApi';
import './ProductsPage.css';

const PAGE_LIMIT = 20;

function DeleteProductModal({ product, onClose, onSubmit, isSubmitting }) {
  if (!product) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление товара"
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
        Вы уверены, что хотите удалить товар{' '}
        <strong>{product.name || `ID: ${product.id}`}</strong>?
      </p>
      <p className="modal-confirm-note">
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function ProductsPage() {
  const navigate = useNavigate();

  const [productToDelete, setProductToDelete] = useState(null);
  const [filters, setFilters] = useState({
    category_id: '',
    product_type_id: '',
  });

  const productsCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search } = {}) => {
      const data = await getProductsRequest({
        page,
        limit,
        name: search,
        category_id: filters.category_id || null,
        product_type_id: filters.product_type_id || null,
      });
      return data;
    },
    deleteFn: deleteProductRequest,
    entityName: 'Товар',
    defaultLimit: PAGE_LIMIT,
  });

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    const result = await productsCrud.delete(productToDelete.id);
    if (result) {
      setProductToDelete(null);
    }
  };

  const handleViewProduct = (product) => {
    navigate(`/catalog/products/${product.id}`);
  };

  const handleEditProduct = (product) => {
    navigate(`/catalog/products/${product.id}/edit`);
  };

  const handleCreateProduct = () => {
    navigate('/catalog/products/create');
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    productsCrud.setPage(1);
  };

  // Опции для селектов
  const categoryOptions = [
    { value: '', label: 'Все категории' },
  ];
  const productTypeOptions = [
    { value: '', label: 'Все типы продуктов' },
  ];

  const mainImage = (product) => {
    const main = product.images?.find(img => img.is_main);
    return main?.image_url || product.images?.[0]?.image_url;
  };

  return (
    <section className="products-page">
      <header className="products-page__header">
        <h1 className="products-page__title">Товары</h1>
        <div className="products-page__controls">
          <PermissionGate permission={['product:create']} fallback={null}>
            <Button
              variant="primary"
              leftIcon={<FiPlus />}
              onClick={handleCreateProduct}
            >
              Создать товар
            </Button>
          </PermissionGate>
        </div>
      </header>

      <div className={`products-page__filters${productsCrud.isLoading ? ' products-page__filters--loading' : ''}`}>
        <div className="products-page__filters-row">
          <div className="products-page__search-wrapper">
            <SearchInput
              value={productsCrud.search}
              onChange={(e) => productsCrud.setSearch(e.target.value)}
              placeholder="Поиск по названию..."
              loading={productsCrud.isLoading}
            />
          </div>
          <div className="products-page__filters-group">
            <Select
              value={filters.category_id}
              onChange={(e) => handleFilterChange('category_id', e.target.value || null)}
              options={categoryOptions}
              placeholder="Категория"
              wrapperClassName="products-page__filter-select"
            />
            <Select
              value={filters.product_type_id}
              onChange={(e) => handleFilterChange('product_type_id', e.target.value || null)}
              options={productTypeOptions}
              placeholder="Тип продукта"
              wrapperClassName="products-page__filter-select"
            />
            {(filters.category_id || filters.product_type_id) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters({ category_id: '', product_type_id: '' });
                  productsCrud.setPage(1);
                }}
              >
                Сбросить фильтры
              </Button>
            )}
          </div>
        </div>
      </div>

      <EntityList
        items={productsCrud.items}
        renderItem={(product) => (
          <>
            <div className="products-page__item-content" onClick={() => handleViewProduct(product)}>
              <div className="products-page__item-main">
                <div className="products-page__item-image">
                  {mainImage(product) ? (
                    <img src={mainImage(product)} alt={product.name} className="products-page__item-img" />
                  ) : (
                    <div className="products-page__item-no-image">
                      <FiPackage size={24} />
                    </div>
                  )}
                </div>
                <div className="products-page__item-info">
                  <div className="products-page__item-header">
                    <p className="products-page__item-title">
                      {product.name || 'Без названия'}
                    </p>
                    {product.images?.some(img => img.is_main) && (
                      <span className="products-page__main-badge">Главное фото</span>
                    )}
                  </div>
                  <div className="products-page__item-meta">
                    <span className="products-page__meta-item">
                      <span className="products-page__meta-label">ID:</span> {product.id}
                    </span>
                    <span className="products-page__separator">•</span>
                    <span className="products-page__meta-item products-page__meta-item--price">
                      <FiDollarSign className="products-page__meta-icon" />
                      {product.price?.toLocaleString('ru-RU')} ₽
                    </span>
                    {product.category_id && (
                      <>
                        <span className="products-page__separator">•</span>
                        <span className="products-page__meta-item">
                          <FiTag className="products-page__meta-icon" />
                          Категория: {product.category_id}
                        </span>
                      </>
                    )}
                    {product.product_type_id && (
                      <>
                        <span className="products-page__separator">•</span>
                        <span className="products-page__meta-item">
                          <FiPackage className="products-page__meta-icon" />
                          Тип: {product.product_type_id}
                        </span>
                      </>
                    )}
                    {product.supplier_id && (
                      <>
                        <span className="products-page__separator">•</span>
                        <span className="products-page__meta-item">
                          Поставщик: {product.supplier_id}
                        </span>
                      </>
                    )}
                  </div>
                  {product.description && (
                    <p className="products-page__item-description">
                      {product.description.length > 150
                        ? `${product.description.substring(0, 150)}...`
                        : product.description}
                    </p>
                  )}
                  {product.attributes && product.attributes.length > 0 && (
                    <div className="products-page__item-attributes">
                      {product.attributes.slice(0, 3).map((attr, index) => (
                        <span key={index} className="products-page__attribute-tag">
                          {attr.name}: {attr.value}
                        </span>
                      ))}
                      {product.attributes.length > 3 && (
                        <span className="products-page__attribute-more">
                          +{product.attributes.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="products-page__item-actions">
              <PermissionGate permission={['product:update']} fallback={null}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEdit2 />}
                  onClick={() => handleEditProduct(product)}
                  aria-label={`Редактировать товар ${product.name || product.id}`}
                >
                  Редактировать
                </Button>
              </PermissionGate>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiEye />}
                onClick={() => handleViewProduct(product)}
                aria-label={`Просмотреть товар ${product.name || product.id}`}
              >
                Просмотр
              </Button>

              <PermissionGate permission={['product:delete']} fallback={null}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setProductToDelete(product)}
                  disabled={productsCrud.isSubmitting}
                  aria-label="Удалить товар"
                  className="btn-delete"
                >
                  <FiTrash2 />
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        emptyMessage={
          productsCrud.isLoading
            ? 'Загрузка товаров...'
            : productsCrud.search || filters.category_id || filters.product_type_id
              ? 'По вашему запросу ничего не найдено.'
              : 'Товары не найдены.'
        }
        loading={productsCrud.isLoading}
      />

      {!productsCrud.isLoading && productsCrud.items && productsCrud.items.length > 0 && (
        <Pagination
          currentPage={productsCrud.page}
          totalPages={productsCrud.pagination.pages}
          totalItems={productsCrud.pagination.total}
          onPageChange={productsCrud.setPage}
          loading={productsCrud.isLoading}
        />
      )}

      {productToDelete && (
        <DeleteProductModal
          product={productToDelete}
          onClose={() => setProductToDelete(null)}
          onSubmit={handleDeleteProduct}
          isSubmitting={productsCrud.isSubmitting}
        />
      )}
    </section>
  );
}
