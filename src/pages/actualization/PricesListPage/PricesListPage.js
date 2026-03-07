import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiPlus, FiTrash2, FiEye, FiEdit2 } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList } from '../../../shared/lib/crud';
import {
  getPricesRequest,
  deletePriceRequest,
} from '../api/pricesApi';
import styles from './PricesListPage.module.css';
import entityListStyles from '../../../shared/ui/EntityList/EntityList.module.css';

const PAGE_LIMIT = 20;

function DeletePriceModal({ price, onClose, onSubmit, isSubmitting }) {
  if (!price) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление прайса"
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
        Вы уверены, что хотите удалить прайс{' '}
        <strong>{price.category || `ID: ${price.id}`}</strong>?
      </p>
      <p className={styles.modalConfirmNote}>
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function PricesListPage() {
  const navigate = useNavigate();

  const [priceToDelete, setPriceToDelete] = useState(null);

  const pricesCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search } = {}) => {
      const data = await getPricesRequest({
        page,
        limit,
        category: search,
      });
      return data;
    },
    deleteFn: deletePriceRequest,
    entityName: 'Прайс',
    defaultLimit: PAGE_LIMIT,
    syncWithUrl: true,
  });

  const handleDeletePrice = async () => {
    if (!priceToDelete) return;

    const result = await pricesCrud.delete(priceToDelete.id);
    if (result) {
      setPriceToDelete(null);
    }
  };

  const handleViewPrice = (price) => {
    navigate(`/actualization/prices/${price.id}`);
  };

  const handleEditPrice = (price) => {
    navigate(`/actualization/prices/${price.id}/edit`);
  };

  const handleCreatePrice = () => {
    navigate('/actualization/prices/create');
  };

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1 className={styles.pricesPageTitle}>Прайсы</h1>
            <div className={styles.pricesPageControls}>
              <Button
                variant="primary"
                leftIcon={<FiPlus />}
                onClick={handleCreatePrice}
              >
                Создать прайс
              </Button>
            </div>
          </>
        )}
        showSearch={true}
        searchValue={pricesCrud.search}
        onSearchChange={pricesCrud.setSearch}
        searchLoading={pricesCrud.isLoading}
        searchPlaceholder="Поиск по категории..."

        showFilters={false}

        pagination={
          !pricesCrud.isLoading && pricesCrud.items && pricesCrud.items.length > 0 ? (
            <Pagination
              currentPage={pricesCrud.page}
              totalPages={pricesCrud.pagination.pages}
              totalItems={pricesCrud.pagination.total}
              onPageChange={pricesCrud.setPage}
              loading={pricesCrud.isLoading}
            />
          ) : null
        }
      >
        <EntityList
          items={pricesCrud.items}
          renderItem={(price) => (
            <>
              <div className={entityListStyles.entityItemContent} onClick={() => handleViewPrice(price)}>
                <div className={entityListStyles.entityItemMain}>
                  <div className={entityListStyles.entityItemAvatar}>
                    <FiFileText />
                  </div>
                  <div className={entityListStyles.entityItemInfo}>
                    <div className={entityListStyles.entityItemHeader}>
                      <p className={entityListStyles.entityItemTitle}>
                        {price.category || 'Без категории'}
                      </p>
                    </div>
                    <div className={entityListStyles.entityItemMeta}>
                      <span className={entityListStyles.entityItemMetaItem}>
                        <span className={entityListStyles.entityItemMetaLabel}>ID:</span> {price.id}
                      </span>
                      <span className={entityListStyles.entityItemSeparator}>•</span>
                      <span className={entityListStyles.entityItemMetaItem}>
                        <span className={entityListStyles.entityItemMetaLabel}>Поставщик:</span> {price.supplier || '—'}
                      </span>
                      <span className={entityListStyles.entityItemSeparator}>•</span>
                      <span className={entityListStyles.entityItemMetaItem}>
                        <span className={entityListStyles.entityItemMetaLabel}>Регион:</span> {price.region || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={entityListStyles.entityActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEdit2 />}
                  onClick={() => handleEditPrice(price)}
                  aria-label={`Редактировать прайс ${price.category || price.id}`}
                  className={entityListStyles.btnEdit}
                >
                  Редактировать
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEye />}
                  onClick={() => handleViewPrice(price)}
                  aria-label={`Просмотреть прайс ${price.category || price.id}`}
                  className={entityListStyles.btnView}
                >
                  Просмотр
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPriceToDelete(price)}
                  disabled={pricesCrud.isSubmitting}
                  aria-label="Удалить прайс"
                  className={entityListStyles.btnDelete}
                >
                  <FiTrash2 />
                </Button>
              </div>
            </>
          )}
          emptyMessage={
            pricesCrud.isLoading
              ? 'Загрузка прайсов...'
              : pricesCrud.search
                ? 'По вашему запросу ничего не найдено.'
                : 'Прайсы не найдены.'
          }
          loading={pricesCrud.isLoading}
        />
      </CrudListLayout>

      {priceToDelete && (
        <DeletePriceModal
          price={priceToDelete}
          onClose={() => setPriceToDelete(null)}
          onSubmit={handleDeletePrice}
          isSubmitting={pricesCrud.isSubmitting}
        />
      )}
    </>
  );
}
