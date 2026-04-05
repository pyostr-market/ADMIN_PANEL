import { useState } from 'react';
import { FiTag, FiPlus, FiTrash2, FiEye, FiEdit2 } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { EntityCard, EntityCardMetaItem } from '../../../shared/ui/EntityCard/EntityCard';
import { DeleteConfirmModal } from '../../../shared/ui/DeleteConfirmModal/DeleteConfirmModal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList, useEntityActions } from '../../../shared/lib/crud';
import {
  getCategoriesRequest,
  deleteCategoryRequest,
} from '../../../shared/api/modules/categoriesApi';
import styles from './CategoriesPage.module.css';

const PAGE_LIMIT = 20;

export function CategoriesPage() {
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const categoriesCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search } = {}) => {
      const data = await getCategoriesRequest({
        page,
        limit,
        name: search,
      });
      return data;
    },
    deleteFn: deleteCategoryRequest,
    entityName: 'Категория',
    defaultLimit: PAGE_LIMIT,
    syncWithUrl: true,
  });

  const actions = useEntityActions({
    baseUrl: '/catalog/categories',
    onDelete: async (id) => {
      return await categoriesCrud.delete(id);
    },
    onSuccess: (action) => {
      if (action === 'delete') {
        setCategoryToDelete(null);
      }
    },
    syncWithUrl: true,
  });

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    await actions.remove(categoryToDelete.id);
  };

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1 className={styles.categoriesPageTitle}>Категории</h1>
            <div className={styles.categoriesPageControls}>
              <PermissionGate permission={['category:create']} fallback={null}>
                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={actions.createHandler}
                >
                  Создать категорию
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        showSearch={true}
        searchValue={categoriesCrud.search}
        onSearchChange={categoriesCrud.setSearch}
        searchLoading={categoriesCrud.isLoading}
        searchPlaceholder="Поиск по названию или описанию..."

        showFilters={false}

        pagination={
          !categoriesCrud.isLoading && categoriesCrud.items && categoriesCrud.items.length > 0 ? (
            <Pagination
              currentPage={categoriesCrud.page}
              totalPages={categoriesCrud.pagination.pages}
              totalItems={categoriesCrud.pagination.total}
              onPageChange={categoriesCrud.setPage}
              loading={categoriesCrud.isLoading}
            />
          ) : null
        }
      >
        <EntityList
          items={categoriesCrud.items}
          renderItem={(category) => (
            <EntityCard
              icon={<FiTag />}
              avatarColor
              title={category.name || 'Без названия'}
              onClick={(e) => actions.viewHandler(e, category.id)}
              meta={(
                <>
                  <EntityCardMetaItem>
                    <span className={styles.metaLabel}>ID:</span> {category.id}
                  </EntityCardMetaItem>
                  {category.parent_id && (
                    <EntityCardMetaItem>
                      Родитель: ID {category.parent_id}
                    </EntityCardMetaItem>
                  )}
                  {category.manufacturer_id && (
                    <EntityCardMetaItem>
                      Производитель: ID {category.manufacturer_id}
                    </EntityCardMetaItem>
                  )}
                  {category.description && (
                    <EntityCardMetaItem>
                      {category.description}
                    </EntityCardMetaItem>
                  )}
                  {category.images && category.images.length > 0 && (
                    <EntityCardMetaItem>
                      Изображений: {category.images.length}
                    </EntityCardMetaItem>
                  )}
                </>
              )}
              actions={(
                <>
                  <PermissionGate permission={['category:update']} fallback={null}>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<FiEdit2 />}
                      onClick={(e) => actions.editHandler(e, category.id)}
                      aria-label={`Редактировать категорию ${category.name || category.id}`}
                    >
                      Редактировать
                    </Button>
                  </PermissionGate>

                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiEye />}
                    onClick={(e) => actions.viewHandler(e, category.id)}
                    aria-label={`Просмотреть категорию ${category.name || category.id}`}
                  >
                    Просмотр
                  </Button>

                  <PermissionGate permission={['category:delete']} fallback={null}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCategoryToDelete(category)}
                      disabled={categoriesCrud.isSubmitting}
                      aria-label="Удалить категорию"
                    >
                      <FiTrash2 />
                    </Button>
                  </PermissionGate>
                </>
              )}
            />
          )}
          emptyMessage={
            categoriesCrud.isLoading
              ? 'Загрузка категорий...'
              : categoriesCrud.search
                ? 'По вашему запросу ничего не найдено.'
                : 'Категории не найдены.'
          }
          loading={categoriesCrud.isLoading}
        />
      </CrudListLayout>

      {categoryToDelete && (
        <DeleteConfirmModal
          isOpen
          onClose={() => setCategoryToDelete(null)}
          onSubmit={handleDeleteCategory}
          isSubmitting={categoriesCrud.isSubmitting}
          entityName="категорию"
          entityTitle={categoryToDelete.name || `ID: ${categoryToDelete.id}`}
        />
      )}
    </>
  );
}
