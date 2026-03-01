import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEye, FiEdit2, FiDisc } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList } from '../../../shared/lib/crud';
import {
  getColorsRequest,
  deleteColorRequest,
} from '../api/actualizationApi';
import styles from './ColorsListPage.module.css';

function DeleteColorModal({ color, onClose, onSubmit, isSubmitting }) {
  if (!color) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление цвета"
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
        Вы уверены, что хотите удалить цвет{' '}
        <strong>{color.name || `ID: ${color.id}`}</strong>?
      </p>
      <p className={styles.modalConfirmNote}>
        Это действие нельзя отменить. Все связанные назначения цветов будут удалены.
      </p>
    </Modal>
  );
}

export function ColorsListPage() {
  const navigate = useNavigate();

  const [colorToDelete, setColorToDelete] = useState(null);

  const colorsCrud = useCrudList({
    fetchFn: async () => {
      const data = await getColorsRequest();
      return { items: data, pagination: { page: 1, limit: 100, total: data.length, pages: 1 } };
    },
    deleteFn: async (name) => {
      await deleteColorRequest(name);
      return { deleted: true };
    },
    deleteEntityIdField: 'name',
    entityName: 'Цвет',
    defaultLimit: 100,
    syncWithUrl: false,
  });

  const handleDeleteColor = async () => {
    if (!colorToDelete) return;

    const result = await colorsCrud.delete(colorToDelete.name);
    if (result) {
      setColorToDelete(null);
    }
  };

  const handleViewColor = (color) => {
    navigate(`/actualization/colors/${encodeURIComponent(color.name)}`);
  };

  const handleEditColor = (color) => {
    navigate(`/actualization/colors/${encodeURIComponent(color.name)}/edit`);
  };

  const handleCreateColor = () => {
    navigate('/actualization/colors/create');
  };

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1 className={styles.colorsPageTitle}>Цвета</h1>
            <div className={styles.colorsPageControls}>
              <Button
                variant="primary"
                leftIcon={<FiPlus />}
                onClick={handleCreateColor}
              >
                Создать цвет
              </Button>
            </div>
          </>
        )}
        showSearch={true}
        searchValue={colorsCrud.search}
        onSearchChange={colorsCrud.setSearch}
        searchLoading={colorsCrud.isLoading}
        searchPlaceholder="Поиск по названию цвета..."

        showFilters={false}

        pagination={
          !colorsCrud.isLoading && colorsCrud.items && colorsCrud.items.length > 0 ? (
            <Pagination
              currentPage={colorsCrud.page}
              totalPages={colorsCrud.pagination.pages}
              totalItems={colorsCrud.pagination.total}
              onPageChange={colorsCrud.setPage}
              loading={colorsCrud.isLoading}
            />
          ) : null
        }
      >
        <EntityList
          items={colorsCrud.items}
          renderItem={(color) => (
            <>
              <div className={styles.colorsPageItemContent} onClick={() => handleViewColor(color)}>
                <div className={styles.colorsPageItemMain}>
                  <div className={styles.colorsPageAvatar}>
                    <FiDisc />
                  </div>
                  <div className={styles.colorsPageItemInfo}>
                    <div className={styles.colorsPageItemHeader}>
                      <p className={styles.colorsPageItemTitle}>
                        {color.name || 'Без названия'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.colorsPageItemActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEdit2 />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditColor(color);
                  }}
                  aria-label={`Редактировать цвет ${color.name}`}
                >
                  Редактировать
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEye />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewColor(color);
                  }}
                  aria-label={`Просмотреть цвет ${color.name}`}
                >
                  Просмотр
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setColorToDelete(color);
                  }}
                  disabled={colorsCrud.isSubmitting}
                  aria-label="Удалить цвет"
                  className={styles.btnDelete}
                >
                  <FiTrash2 />
                </Button>
              </div>
            </>
          )}
          emptyMessage={
            colorsCrud.isLoading
              ? 'Загрузка цветов...'
              : colorsCrud.search
                ? 'По вашему запросу ничего не найдено.'
                : 'Цвета не найдены.'
          }
          loading={colorsCrud.isLoading}
        />
      </CrudListLayout>

      {colorToDelete && (
        <DeleteColorModal
          color={colorToDelete}
          onClose={() => setColorToDelete(null)}
          onSubmit={handleDeleteColor}
          isSubmitting={colorsCrud.isSubmitting}
        />
      )}
    </>
  );
}
