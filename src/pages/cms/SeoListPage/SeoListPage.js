import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiTrash2, FiEye, FiEdit2 } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList } from '../../../shared/lib/crud';
import {
  getSeoListRequest,
  deleteSeoRequest,
} from '../api/cmsApi';
import styles from './SeoListPage.module.css';
import entityListStyles from '../../../shared/ui/EntityList/EntityList.module.css';

const PAGE_LIMIT = 10;

function DeleteSeoModal({ seo, onClose, onSubmit, isSubmitting }) {
  if (!seo) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление SEO данных"
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
        Вы уверены, что хотите удалить SEO данные для страницы{' '}
        <strong>"{seo.page_slug}"</strong>?
      </p>
      <p className={styles.modalConfirmNote}>
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function SeoListPage() {
  const navigate = useNavigate();

  const [seoToDelete, setSeoToDelete] = useState(null);

  const seoCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT } = {}) => {
      const offset = (page - 1) * limit;
      const data = await getSeoListRequest({
        limit,
        offset,
      });
      return data;
    },
    deleteFn: deleteSeoRequest,
    entityName: 'SEO запись',
    defaultLimit: PAGE_LIMIT,
    syncWithUrl: true,
  });

  const handleDeleteSeo = async () => {
    if (!seoToDelete) return;

    const result = await seoCrud.delete(seoToDelete.id);
    if (result) {
      setSeoToDelete(null);
    }
  };

  const handleViewSeo = (seo) => {
    navigate(`/cms/seo/${seo.id}`);
  };

  const handleEditSeo = (seo) => {
    navigate(`/cms/seo/${seo.id}/edit`);
  };

  const handleCreateSeo = () => {
    navigate('/cms/seo/create');
  };

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1 className={styles.seoPageTitle}>SEO данные</h1>
            <div className={styles.seoPageControls}>
              <PermissionGate permission={['cms:create']} fallback={null}>
                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={handleCreateSeo}
                >
                  Создать SEO запись
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        showSearch={true}
        searchValue={seoCrud.search}
        onSearchChange={seoCrud.setSearch}
        searchLoading={seoCrud.isLoading}
        searchPlaceholder="Поиск по slug или заголовку..."

        showFilters={false}

        pagination={
          !seoCrud.isLoading && seoCrud.items && seoCrud.items.length > 0 ? (
            <Pagination
              currentPage={seoCrud.page}
              totalPages={seoCrud.pagination.pages}
              totalItems={seoCrud.pagination.total}
              onPageChange={seoCrud.setPage}
              loading={seoCrud.isLoading}
            />
          ) : null
        }
      >
        <EntityList
          items={seoCrud.items}
          renderItem={(seo) => (
            <>
              <div className={entityListStyles.entityItemContent} onClick={() => handleViewSeo(seo)}>
                <div className={entityListStyles.entityItemMain}>
                  <div className={entityListStyles.entityItemAvatar}>
                    <FiSearch />
                  </div>
                  <div className={entityListStyles.entityItemInfo}>
                    <div className={entityListStyles.entityItemHeader}>
                      <p className={entityListStyles.entityItemTitle}>
                        {seo.page_slug}
                      </p>
                    </div>
                    <div className={entityListStyles.entityItemMeta}>
                      <span className={entityListStyles.entityItemMetaItem}>
                        <span className={entityListStyles.entityItemMetaLabel}>Заголовок:</span>{' '}
                        {seo.title || '—'}
                      </span>
                      <span className={entityListStyles.entityItemSeparator}>•</span>
                      <span className={entityListStyles.entityItemMetaItem}>
                        <span className={entityListStyles.entityItemMetaLabel}>Ключевые слова:</span>{' '}
                        {seo.keywords?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={entityListStyles.entityActions}>
                <PermissionGate permission={['cms:update']} fallback={null}>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiEdit2 />}
                    onClick={() => handleEditSeo(seo)}
                    aria-label={`Редактировать SEO ${seo.id}`}
                    className={entityListStyles.btnEdit}
                  >
                    Редактировать
                  </Button>
                </PermissionGate>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEye />}
                  onClick={() => handleViewSeo(seo)}
                  aria-label={`Просмотреть SEO ${seo.id}`}
                  className={entityListStyles.btnView}
                >
                  Просмотр
                </Button>

                <PermissionGate permission={['cms:delete']} fallback={null}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSeoToDelete(seo)}
                    disabled={seoCrud.isSubmitting}
                    aria-label="Удалить SEO"
                    className={entityListStyles.btnDelete}
                  >
                    <FiTrash2 />
                  </Button>
                </PermissionGate>
              </div>
            </>
          )}
          emptyMessage={
            seoCrud.isLoading
              ? 'Загрузка SEO данных...'
              : seoCrud.search
                ? 'По вашему запросу ничего не найдено.'
                : 'SEO данные не найдены.'
          }
          loading={seoCrud.isLoading}
        />
      </CrudListLayout>

      {seoToDelete && (
        <DeleteSeoModal
          seo={seoToDelete}
          onClose={() => setSeoToDelete(null)}
          onSubmit={handleDeleteSeo}
          isSubmitting={seoCrud.isSubmitting}
        />
      )}
    </>
  );
}
