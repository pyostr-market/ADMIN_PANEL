import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { FiPackage, FiPlus, FiTrash2, FiEye, FiEdit2, FiTag } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { EntityCard, EntityCardMetaItem } from '../../../shared/ui/EntityCard/EntityCard';
import { DeleteConfirmModal } from '../../../shared/ui/DeleteConfirmModal/DeleteConfirmModal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { CategoryTree } from '../../../shared/ui/CategoryTree';
import { useCrudList, useEntityActions } from '../../../shared/lib/crud';
import {
  getProductsRequest,
  deleteProductRequest,
} from '../../../shared/api/modules/productsApi';
import { getCategoryTreeRequest } from '../../../shared/api/modules/categoriesApi';
import styles from './ProductsPage.module.css';

const PAGE_LIMIT = 20;

export function ProductsPage() {
  const [productToDelete, setProductToDelete] = useState(null);
  const [categoryTree, setCategoryTree] = useState([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const productsCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search, category_id } = {}) => {
      const data = await getProductsRequest({
        page,
        limit,
        name: search,
        category_id: category_id || null,
      });
      return data;
    },
    deleteFn: deleteProductRequest,
    entityName: 'Товар',
    defaultLimit: PAGE_LIMIT,
    syncWithUrl: true,
  });

  const actions = useEntityActions({
    baseUrl: '/catalog/products',
    onSuccess: (action) => {
      if (action === 'delete') {
        setProductToDelete(null);
      }
    },
    syncWithUrl: true,
  });

  // Ref для хранения актуального setFilters и setPage
  const setFiltersRef = useRef(productsCrud.setFilters);
  const setPageRef = useRef(productsCrud.setPage);

  useEffect(() => {
    setFiltersRef.current = productsCrud.setFilters;
    setPageRef.current = productsCrud.setPage;
  }, [productsCrud.setFilters, productsCrud.setPage]);

  // Загрузка дерева категорий при монтировании
  useEffect(() => {
    const loadCategoryTree = async () => {
      if (categoryTree.length > 0 || isLoadingTree) return;

      setIsLoadingTree(true);
      try {
        const tree = await getCategoryTreeRequest();
        setCategoryTree(tree || []);
      } finally {
        setIsLoadingTree(false);
      }
    };

    loadCategoryTree();
  }, [categoryTree.length, isLoadingTree]);

  // Синхронизация выбранной категории из URL при загрузке
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryIdFromUrl = urlParams.get('category_id');
    if (categoryIdFromUrl && categoryIdFromUrl !== selectedCategoryId) {
      setSelectedCategoryId(categoryIdFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    await actions.remove(productToDelete.id);
  };

  const handleCategorySelect = useCallback((categoryId) => {
    const newCategoryId = categoryId === selectedCategoryId ? null : categoryId;
    setSelectedCategoryId(newCategoryId);

    const apiFilters = {};
    if (newCategoryId) {
      apiFilters.category_id = newCategoryId;
    }

    setFiltersRef.current(apiFilters);
    setPageRef.current(1);
  }, [selectedCategoryId]);

  const handleResetFilters = useCallback(() => {
    setSelectedCategoryId(null);
    setFiltersRef.current({});
    setPageRef.current(1);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return !!selectedCategoryId;
  }, [selectedCategoryId]);

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
                  onClick={actions.createHandler}
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

        sidebar={(
          <div className={styles.categoryTreeContainer}>
            {hasActiveFilters && (
              <button
                type="button"
                className={styles.resetFilterButton}
                onClick={handleResetFilters}
                aria-label="Сбросить фильтр категории"
              >
                Сбросить: <span className={styles.selectedCategoryName}>
                  {getCategoryNameById(categoryTree, selectedCategoryId)}
                </span>
              </button>
            )}
            <CategoryTree
              categories={categoryTree}
              selectedId={selectedCategoryId}
              onSelect={handleCategorySelect}
              isLoading={isLoadingTree}
            />
          </div>
        )}
        sidebarTitle="Категории"

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
            <EntityCard
              image={mainImage(product)}
              icon={<FiPackage />}
              title={product.name || 'Без названия'}
              onClick={(e) => actions.viewHandler(e, product.id)}
              meta={(
                <>
                  <EntityCardMetaItem className={styles.productPrice}>
                    {product.price?.toLocaleString('ru-RU')} ₽
                  </EntityCardMetaItem>
                  {product.category && (
                    <EntityCardMetaItem icon={<FiTag />}>
                      Категория: {product.category.name}
                    </EntityCardMetaItem>
                  )}
                  {product.supplier && (
                    <EntityCardMetaItem>
                      Поставщик: {product.supplier.name}
                    </EntityCardMetaItem>
                  )}
                </>
              )}
              description={
                product.description && product.description.length > 150
                  ? `${product.description.substring(0, 150)}...`
                  : product.description
              }
              actions={(
                <>
                  <PermissionGate permission={['product:update']} fallback={null}>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<FiEdit2 />}
                      onClick={(e) => actions.editHandler(e, product.id)}
                      aria-label={`Редактировать товар ${product.name || product.id}`}
                    >
                      Редактировать
                    </Button>
                  </PermissionGate>

                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiEye />}
                    onClick={(e) => actions.viewHandler(e, product.id)}
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
                    >
                      <FiTrash2 />
                    </Button>
                  </PermissionGate>
                </>
              )}
            />
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
        <DeleteConfirmModal
          isOpen
          onClose={() => setProductToDelete(null)}
          onSubmit={handleDeleteProduct}
          isSubmitting={productsCrud.isSubmitting}
          entityName="товар"
          entityTitle={productToDelete.name || `ID: ${productToDelete.id}`}
        />
      )}
    </>
  );
}

/**
 * Вспомогательная функция для получения названия категории по ID
 */
function getCategoryNameById(tree, id) {
  if (!tree || !id) return 'Категория';
  
  for (const category of tree) {
    if (category.id === id) {
      return category.name;
    }
    if (category.children && category.children.length > 0) {
      const found = getCategoryNameById(category.children, id);
      if (found) return found;
    }
  }
  return 'Категория';
}
