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
  getManufacturersRequest,
  deleteManufacturerRequest,
} from './api/manufacturersApi';
import './ManufacturersPage.css';

const PAGE_LIMIT = 20;

function DeleteManufacturerModal({ manufacturer, onClose, onSubmit, isSubmitting }) {
  if (!manufacturer) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление производителя"
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
        Вы уверены, что хотите удалить производителя{' '}
        <strong>{manufacturer.name || `ID: ${manufacturer.id}`}</strong>?
      </p>
      <p className="modal-confirm-note">
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function ManufacturersPage() {
  const navigate = useNavigate();

  const [manufacturerToDelete, setManufacturerToDelete] = useState(null);

  const manufacturersCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search } = {}) => {
      const data = await getManufacturersRequest({
        page,
        limit,
        name: search,
      });
      return data;
    },
    deleteFn: deleteManufacturerRequest,
    entityName: 'Производитель',
    defaultLimit: PAGE_LIMIT,
  });

  const handleDeleteManufacturer = async () => {
    if (!manufacturerToDelete) return;

    const result = await manufacturersCrud.delete(manufacturerToDelete.id);
    if (result) {
      setManufacturerToDelete(null);
    }
  };

  const handleViewManufacturer = (manufacturer) => {
    navigate(`/catalog/manufacturers/${manufacturer.id}`);
  };

  const handleEditManufacturer = (manufacturer) => {
    navigate(`/catalog/manufacturers/${manufacturer.id}/edit`);
  };

  const handleCreateManufacturer = () => {
    navigate('/catalog/manufacturers/create');
  };

  return (
    <section className="manufacturers-page">
      <header className="manufacturers-page__header">
        <h1 className="manufacturers-page__title">Производители</h1>
        <div className="manufacturers-page__controls">
          <PermissionGate permission={['manufacturer:create']} fallback={null}>
            <Button
              variant="primary"
              leftIcon={<FiPlus />}
              onClick={handleCreateManufacturer}
            >
              Создать производителя
            </Button>
          </PermissionGate>
        </div>
      </header>

      <div className={`manufacturers-page__filters${manufacturersCrud.isLoading ? ' manufacturers-page__filters--loading' : ''}`}>
        <SearchInput
          value={manufacturersCrud.search}
          onChange={(e) => manufacturersCrud.setSearch(e.target.value)}
          placeholder="Поиск по названию..."
          loading={manufacturersCrud.isLoading}
        />
      </div>

      <EntityList
        items={manufacturersCrud.items}
        renderItem={(manufacturer) => (
          <>
            <div className="manufacturers-page__item-content" onClick={() => handleViewManufacturer(manufacturer)}>
              <div className="manufacturers-page__item-main">
                <div className="manufacturers-page__item-info">
                  <div className="manufacturers-page__item-header">
                    <p className="manufacturers-page__item-title">
                      {manufacturer.name || 'Без названия'}
                    </p>
                  </div>
                  <div className="manufacturers-page__item-meta">
                    <span className="manufacturers-page__meta-item">
                      <span className="manufacturers-page__meta-label">ID:</span> {manufacturer.id}
                    </span>
                    {manufacturer.description && (
                      <>
                        <span className="manufacturers-page__separator">•</span>
                        <span className="manufacturers-page__meta-item">
                          {manufacturer.description}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="manufacturers-page__item-actions">
              <PermissionGate permission={['manufacturer:update']} fallback={null}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEdit2 />}
                  onClick={() => handleEditManufacturer(manufacturer)}
                  aria-label={`Редактировать производителя ${manufacturer.name || manufacturer.id}`}
                >
                  Редактировать
                </Button>
              </PermissionGate>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiEye />}
                onClick={() => handleViewManufacturer(manufacturer)}
                aria-label={`Просмотреть производителя ${manufacturer.name || manufacturer.id}`}
              >
                Просмотр
              </Button>

              <PermissionGate permission={['manufacturer:delete']} fallback={null}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setManufacturerToDelete(manufacturer)}
                  disabled={manufacturersCrud.isSubmitting}
                  aria-label="Удалить производителя"
                  className="btn-delete"
                >
                  <FiTrash2 />
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        emptyMessage={
          manufacturersCrud.isLoading
            ? 'Загрузка производителей...'
            : manufacturersCrud.search
              ? 'По вашему запросу ничего не найдено.'
              : 'Производители не найдены.'
        }
        loading={manufacturersCrud.isLoading}
      />

      {!manufacturersCrud.isLoading && manufacturersCrud.items && manufacturersCrud.items.length > 0 && (
        <Pagination
          currentPage={manufacturersCrud.page}
          totalPages={manufacturersCrud.pagination.pages}
          totalItems={manufacturersCrud.pagination.total}
          onPageChange={manufacturersCrud.setPage}
          loading={manufacturersCrud.isLoading}
        />
      )}

      {manufacturerToDelete && (
        <DeleteManufacturerModal
          manufacturer={manufacturerToDelete}
          onClose={() => setManufacturerToDelete(null)}
          onSubmit={handleDeleteManufacturer}
          isSubmitting={manufacturersCrud.isSubmitting}
        />
      )}
    </section>
  );
}
