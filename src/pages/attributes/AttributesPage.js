import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEye, FiEdit2, FiTag } from 'react-icons/fi';
import { PermissionGate } from '../../shared/ui/PermissionGate';
import { Button } from '../../shared/ui/Button';
import { SearchInput } from '../../shared/ui/SearchInput';
import { Pagination } from '../../shared/ui/Pagination';
import { EntityList } from '../../shared/ui/EntityList';
import { Modal } from '../../shared/ui/Modal';
import { useCrudList } from '../../shared/lib/crud';
import {
  getAttributesRequest,
  deleteAttributeRequest,
} from './api/attributesApi';
import './AttributesPage.css';

const PAGE_LIMIT = 20;

function DeleteAttributeModal({ attribute, onClose, onSubmit, isSubmitting }) {
  if (!attribute) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление атрибута"
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
        Вы уверены, что хотите удалить атрибут{' '}
        <strong>{attribute.name || `ID: ${attribute.id}`}</strong>?
      </p>
      <p className="modal-confirm-note">
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function AttributesPage() {
  const navigate = useNavigate();

  const [attributeToDelete, setAttributeToDelete] = useState(null);

  const attributesCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search } = {}) => {
      const data = await getAttributesRequest({
        page,
        limit,
        name: search,
      });
      return data;
    },
    deleteFn: deleteAttributeRequest,
    entityName: 'Атрибут',
    defaultLimit: PAGE_LIMIT,
  });

  const handleDeleteAttribute = async () => {
    if (!attributeToDelete) return;

    const result = await attributesCrud.delete(attributeToDelete.id);
    if (result) {
      setAttributeToDelete(null);
    }
  };

  const handleViewAttribute = (attribute) => {
    navigate(`/catalog/attributes/${attribute.id}`);
  };

  const handleEditAttribute = (attribute) => {
    navigate(`/catalog/attributes/${attribute.id}/edit`);
  };

  const handleCreateAttribute = () => {
    navigate('/catalog/attributes/create');
  };

  return (
    <section className="attributes-page">
      <header className="attributes-page__header">
        <h1 className="attributes-page__title">Атрибуты продуктов</h1>
        <div className="attributes-page__controls">
          <PermissionGate permission={['product_attribute:create']} fallback={null}>
            <Button
              variant="primary"
              leftIcon={<FiPlus />}
              onClick={handleCreateAttribute}
            >
              Создать атрибут
            </Button>
          </PermissionGate>
        </div>
      </header>

      <div className={`attributes-page__filters${attributesCrud.isLoading ? ' attributes-page__filters--loading' : ''}`}>
        <SearchInput
          value={attributesCrud.search}
          onChange={(e) => attributesCrud.setSearch(e.target.value)}
          placeholder="Поиск по названию или значению..."
          loading={attributesCrud.isLoading}
        />
      </div>

      <EntityList
        items={attributesCrud.items}
        renderItem={(attribute) => (
          <>
            <div className="attributes-page__item-content" onClick={() => handleViewAttribute(attribute)}>
              <div className="attributes-page__item-main">
                <div className="attributes-page__avatar">
                  <FiTag />
                </div>
                <div className="attributes-page__item-info">
                  <div className="attributes-page__item-header">
                    <p className="attributes-page__item-title">
                      {attribute.name || 'Без названия'}
                    </p>
                  </div>
                  <div className="attributes-page__item-meta">
                    <span className="attributes-page__meta-item">
                      <span className="attributes-page__meta-label">Значение:</span> {attribute.value || '—'}
                    </span>
                    <span className="attributes-page__separator">•</span>
                    <span className="attributes-page__meta-item">
                      <span className="attributes-page__meta-label">Фильтруемый:</span> {attribute.is_filterable ? 'Да' : 'Нет'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="attributes-page__item-actions">
              <PermissionGate permission={['product_attribute:update']} fallback={null}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEdit2 />}
                  onClick={() => handleEditAttribute(attribute)}
                  aria-label={`Редактировать атрибут ${attribute.name || attribute.id}`}
                >
                  Редактировать
                </Button>
              </PermissionGate>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiEye />}
                onClick={() => handleViewAttribute(attribute)}
                aria-label={`Просмотреть атрибут ${attribute.name || attribute.id}`}
              >
                Просмотр
              </Button>

              <PermissionGate permission={['product_attribute:delete']} fallback={null}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAttributeToDelete(attribute)}
                  disabled={attributesCrud.isSubmitting}
                  aria-label="Удалить атрибут"
                  className="btn-delete"
                >
                  <FiTrash2 />
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        emptyMessage={
          attributesCrud.isLoading
            ? 'Загрузка атрибутов...'
            : attributesCrud.search
              ? 'По вашему запросу ничего не найдено.'
              : 'Атрибуты продуктов не найдены.'
        }
        loading={attributesCrud.isLoading}
      />

      {!attributesCrud.isLoading && attributesCrud.items && attributesCrud.items.length > 0 && (
        <Pagination
          currentPage={attributesCrud.page}
          totalPages={attributesCrud.pagination.pages}
          totalItems={attributesCrud.pagination.total}
          onPageChange={attributesCrud.setPage}
          loading={attributesCrud.isLoading}
        />
      )}

      {attributeToDelete && (
        <DeleteAttributeModal
          attribute={attributeToDelete}
          onClose={() => setAttributeToDelete(null)}
          onSubmit={handleDeleteAttribute}
          isSubmitting={attributesCrud.isSubmitting}
        />
      )}
    </section>
  );
}
