import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiPlus, FiTrash2, FiEye, FiEdit2, FiTag } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList } from '../../../shared/lib/crud';
import {
  getProductsRequest,
  deleteProductRequest,
  getCategoriesForAutocompleteRequest,
  getProductTypesForAutocompleteRequest,
} from '../api/productsApi';
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
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

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
    syncWithUrl: true,
  });

  const loadFilterOptions = useCallback(async () => {
    if ((categories.length > 0 && productTypes.length > 0) || isLoadingOptions) return;

    setIsLoadingOptions(true);
    try {
      const [cats, types] = await Promise.all([
        getCategoriesForAutocompleteRequest(),
        getProductTypesForAutocompleteRequest(),
      ]);
      setCategories(cats || []);
      setProductTypes(types || []);
    } finally {
      setIsLoadingOptions(false);
    }
  }, [categories.length, productTypes.length, isLoadingOptions]);

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

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const apiFilters = {};
    if (newFilters.category_id && newFilters.category_id !== 'all') {
      apiFilters.category_id = newFilters.category_id;
    }
    if (newFilters.product_type_id && newFilters.product_type_id !== 'all') {
      apiFilters.product_type_id = newFilters.product_type_id;
    }

    productsCrud.setFilters(apiFilters);
    productsCrud.setPage(1);

    // Загружаем опции при первом изменении фильтра
    if ((key === 'category_id' || key === 'product_type_id') && 
        categories.length === 0 && 
        !isLoadingOptions) {
      loadFilterOptions();
    }
  }, [filters, productsCrud, categories.length, isLoadingOptions, loadFilterOptions]);

  const handleResetFilters = useCallback(() => {
    setFilters({ category_id: '', product_type_id: '' });
    productsCrud.setFilters({});
    productsCrud.setPage(1);
  }, [productsCrud]);

  const hasActiveFilters = useMemo(() => {
    return filters.category_id || filters.product_type_id;
  }, [filters]);

  // Конфигурация фильтров для CrudListLayout
  const filterConfigs = useMemo(() => [
    {
      key: 'category_id',
      label: 'Категория',
      options: [
        { value: 'all', label: 'Все категории' },
        ...categories.map((cat) => ({ value: String(cat.id), label: cat.name })),
      ],
      onFocus: loadFilterOptions,
      disabled: isLoadingOptions,
    },
    {
      key: 'product_type_id',
      label: 'Тип продукта',
      options: [
        { value: 'all', label: 'Все типы продуктов' },
        ...productTypes.map((type) => ({ value: String(type.id), label: type.name })),
      ],
      onFocus: loadFilterOptions,
      disabled: isLoadingOptions,
    },
  ], [categories, productTypes, isLoadingOptions, loadFilterOptions]);

  const mainImage = (product) => {
    const main = product.images?.find(img => img.is_main);
    return main?.image_url || product.images?.[0]?.image_url;
  };

  return (
    <>
      <CrudListLayout
        header={(
          <>
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
          </>
        )}
        showSearch={true}
        searchValue={productsCrud.search}
        onSearchChange={productsCrud.setSearch}
        searchLoading={productsCrud.isLoading}
        searchPlaceholder="Поиск по названию..."

        showFilters={true}
        filters={filters}
        filterConfigs={filterConfigs}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        filtersLoading={productsCrud.isLoading || isLoadingOptions}

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
              : productsCrud.search || hasActiveFilters
                ? 'По вашему запросу ничего не найдено.'
                : 'Товары не найдены.'
          }
          loading={productsCrud.isLoading}
        />
      </CrudListLayout>

      {productToDelete && (
        <DeleteProductModal
          product={productToDelete}
          onClose={() => setProductToDelete(null)}
          onSubmit={handleDeleteProduct}
          isSubmitting={productsCrud.isSubmitting}
        />
      )}
    </>
  );
}
