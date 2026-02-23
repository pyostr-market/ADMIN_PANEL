import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTag, FiPlus, FiTrash2, FiEye, FiEdit2 } from 'react-icons/fi';
import { PermissionGate } from '../../shared/ui/PermissionGate';
import { Button } from '../../shared/ui/Button';
import { SearchInput } from '../../shared/ui/SearchInput';
import { Pagination } from '../../shared/ui/Pagination';
import { EntityList } from '../../shared/ui/EntityList';
import { Modal } from '../../shared/ui/Modal';
import { useCrudList } from '../../shared/lib/crud';
import {
  getCategoriesRequest,
  deleteCategoryRequest,
} from './api/categoryApi';
import './CategoriesPage.css';
import './CategoriesPage-Mobile.css';

const PAGE_LIMIT = 20;

function DeleteCategoryModal({ category, onClose, onSubmit, isSubmitting }) {
  if (!category) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление категории"
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
        Вы уверены, что хотите удалить категорию{' '}
        <strong>{category.name || `ID: ${category.id}`}</strong>?
      </p>
      <p className="modal-confirm-note">
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function CategoriesPage() {
  const navigate = useNavigate();

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
  });

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    const result = await categoriesCrud.delete(categoryToDelete.id);
    if (result) {
      setCategoryToDelete(null);
    }
  };

  const handleViewCategory = (category) => {
    navigate(`/categories/${category.id}`);
  };

  const handleEditCategory = (category) => {
    navigate(`/categories/${category.id}/edit`);
  };

  const handleCreateCategory = () => {
    navigate('/categories/create');
  };

  return (
    <section className="categories-page">
      <header className="categories-page__header">
        <h1 className="categories-page__title">Категории</h1>
        <div className="categories-page__controls">
          <PermissionGate permission={['category:create']} fallback={null}>
            <Button
              variant="primary"
              leftIcon={<FiPlus />}
              onClick={handleCreateCategory}
            >
              Создать категорию
            </Button>
          </PermissionGate>
        </div>
      </header>

      <div className={`categories-page__filters${categoriesCrud.isLoading ? ' categories-page__filters--loading' : ''}`}>
        <SearchInput
          value={categoriesCrud.search}
          onChange={(e) => categoriesCrud.setSearch(e.target.value)}
          placeholder="Поиск по названию или описанию..."
          loading={categoriesCrud.isLoading}
        />
      </div>

      <EntityList
        items={categoriesCrud.items}
        renderItem={(category) => (
          <>
            <div className="categories-page__item-content" onClick={() => handleViewCategory(category)}>
              <div className="categories-page__item-main">
                <div className="categories-page__avatar">
                  <FiTag />
                </div>
                <div className="categories-page__item-info">
                  <div className="categories-page__item-header">
                    <p className="categories-page__item-title">
                      {category.name || 'Без названия'}
                    </p>
                  </div>
                  <div className="categories-page__item-meta">
                    <span className="categories-page__meta-item">
                      <span className="categories-page__meta-label">ID:</span> {category.id}
                    </span>
                    {category.parent_id && (
                      <>
                        <span className="categories-page__separator">•</span>
                        <span className="categories-page__meta-item">
                          Родитель: ID {category.parent_id}
                        </span>
                      </>
                    )}
                    {category.manufacturer_id && (
                      <>
                        <span className="categories-page__separator">•</span>
                        <span className="categories-page__meta-item">
                          Производитель: ID {category.manufacturer_id}
                        </span>
                      </>
                    )}
                    {category.description && (
                      <>
                        <span className="categories-page__separator">•</span>
                        <span className="categories-page__meta-item">
                          {category.description}
                        </span>
                      </>
                    )}
                    {category.images && category.images.length > 0 && (
                      <>
                        <span className="categories-page__separator">•</span>
                        <span className="categories-page__meta-item">
                          Изображений: {category.images.length}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="categories-page__item-actions">
              <PermissionGate permission={['category:update']} fallback={null}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEdit2 />}
                  onClick={() => handleEditCategory(category)}
                  aria-label={`Редактировать категорию ${category.name || category.id}`}
                >
                  Редактировать
                </Button>
              </PermissionGate>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiEye />}
                onClick={() => handleViewCategory(category)}
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
                  className="btn-delete"
                >
                  <FiTrash2 />
                </Button>
              </PermissionGate>
            </div>
          </>
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

      {!categoriesCrud.isLoading && categoriesCrud.items && categoriesCrud.items.length > 0 && (
        <Pagination
          currentPage={categoriesCrud.page}
          totalPages={categoriesCrud.pagination.pages}
          totalItems={categoriesCrud.pagination.total}
          onPageChange={categoriesCrud.setPage}
          loading={categoriesCrud.isLoading}
        />
      )}

      {categoryToDelete && (
        <DeleteCategoryModal
          category={categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
          onSubmit={handleDeleteCategory}
          isSubmitting={categoriesCrud.isSubmitting}
        />
      )}
    </section>
  );
}
