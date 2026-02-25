import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiPlus, FiTrash2, FiEye, FiEdit2, FiTag } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { SearchInput } from '../../../shared/ui/SearchInput/SearchInput';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { Select } from '../../../shared/ui/Select/Select';
import { useCrudList } from '../../../shared/lib/crud';
import {
  getProductsRequest,
  deleteProductRequest,
  getCategoriesForAutocompleteRequest,
  getProductTypesForAutocompleteRequest,
} from './api/productsApi';
import styles from './ProductsPage.module.css';

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
      <p className={styles.modalConfirmText}>
        Вы уверены, что хотите удалить товар{' '}
        <strong>{product.name || `ID: ${product.id}`}</strong>?
      </p>
      <p className={styles.modalConfirmNote}>
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
        category_id: filters.name || null,
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

  // Опции для селектов (загружаются из API продуктов)
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
    <section className={styles.productsPage}>
      <header className={styles.productsPageHeader}>
        <h1 className={styles.productsPageTitle}>Товары</h1>
        <div className={styles.productsPageControls}>
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

      <div className={`${styles.productsPageFilters}${productsCrud.isLoading ? ` ${styles.productsPageFiltersLoading}` : ''}`}>
        <div className={styles.productsPageFiltersRow}>
          <div className={styles.productsPageSearchWrapper}>
            <SearchInput
              value={productsCrud.search}
              onChange={(e) => productsCrud.setSearch(e.target.value)}
              placeholder="Поиск по названию..."
              loading={productsCrud.isLoading}
            />
          </div>
          <div className={styles.productsPageFiltersGroup}>
            <Select
              value={filters.category_id}
              onChange={(e) => handleFilterChange('category_id', e.target.value || null)}
              options={categoryOptions}
              placeholder="Категория"
              wrapperClassName={styles.productsPageFilterSelect}
            />
            <Select
              value={filters.product_type_id}
              onChange={(e) => handleFilterChange('product_type_id', e.target.value || null)}
              options={productTypeOptions}
              placeholder="Тип продукта"
              wrapperClassName={styles.productsPageFilterSelect}
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
            <div className={styles.productsPageItemContent} onClick={() => handleViewProduct(product)}>
              <div className={styles.productsPageItemMain}>
                <div className={styles.productsPageItemImage}>
                  {mainImage(product) ? (
                    <img src={mainImage(product)} alt={product.name} className={styles.productsPageItemImg} />
                  ) : (
                    <div className={styles.productsPageItemAvatar}>
                      <FiPackage />
                    </div>
                  )}
                </div>
                <div className={styles.productsPageItemInfo}>
                  <div className={styles.productsPageItemHeader}>
                    <p className={styles.productsPageItemTitle}>
                      {product.name || 'Без названия'}
                    </p>
                  </div>
                  <div className={styles.productsPageItemMeta}>
                    <span className={`${styles.productsPageMetaItem} ${styles.productsPageMetaItemPrice}`}>
                      {product.price?.toLocaleString('ru-RU')} ₽
                    </span>
                    {product.category && (
                      <>
                        <span className={styles.productsPageSeparator}>•</span>
                        <span className={styles.productsPageMetaItem}>
                          <FiTag className={styles.productsPageMetaIcon} />
                          Категория: {product.category.name}
                        </span>
                      </>
                    )}
                    {product.product_type && (
                      <>
                        <span className={styles.productsPageSeparator}>•</span>
                        <span className={styles.productsPageMetaItem}>
                          <FiPackage className={styles.productsPageMetaIcon} />
                          Тип: {product.product_type.name}
                        </span>
                      </>
                    )}
                    {product.supplier && (
                      <>
                        <span className={styles.productsPageSeparator}>•</span>
                        <span className={styles.productsPageMetaItem}>
                          Поставщик: {product.supplier.name}
                        </span>
                      </>
                    )}
                  </div>
                  {product.description && (
                    <p className={styles.productsPageItemDescription}>
                      {product.description.length > 150
                        ? `${product.description.substring(0, 150)}...`
                        : product.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.productsPageItemActions}>
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
                  className={styles.btnDelete}
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
