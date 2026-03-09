import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiPlus, FiTrash2, FiEye, FiEdit2 } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList } from '../../../shared/lib/crud';
import {
  getPagesRequest,
  deletePageRequest,
} from '../api/cmsApi';
import styles from './PagesListPage.module.css';
import entityListStyles from '../../../shared/ui/EntityList/EntityList.module.css';

const PAGE_LIMIT = 10;

function DeletePageModal({ page, onClose, onSubmit, isSubmitting }) {
  if (!page) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление страницы"
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
        Вы уверены, что хотите удалить страницу{' '}
        <strong>"{page.title}"</strong>?
      </p>
      <p className={styles.modalConfirmNote}>
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function PagesListPage() {
  const navigate = useNavigate();

  const [pageToDelete, setPageToDelete] = useState(null);

  const pagesCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT } = {}) => {
      const offset = (page - 1) * limit;
      const data = await getPagesRequest({
        page,
        limit,
      });
      return data;
    },
    deleteFn: deletePageRequest,
    entityName: 'Страница',
    defaultLimit: PAGE_LIMIT,
    syncWithUrl: true,
  });

  const handleDeletePage = async () => {
    if (!pageToDelete) return;

    const result = await pagesCrud.delete(pageToDelete.id);
    if (result) {
      setPageToDelete(null);
    }
  };

  const handleViewPage = (page) => {
    navigate(`/cms/pages/${page.id}`);
  };

  const handleEditPage = (page) => {
    navigate(`/cms/pages/${page.id}/edit`);
  };

  const handleCreatePage = () => {
    navigate('/cms/pages/create');
  };

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1 className={styles.pagesPageTitle}>Страницы</h1>
            <div className={styles.pagesPageControls}>
              <PermissionGate permission={['cms:create']} fallback={null}>
                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={handleCreatePage}
                >
                  Создать страницу
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        showSearch={true}
        searchValue={pagesCrud.search}
        onSearchChange={pagesCrud.setSearch}
        searchLoading={pagesCrud.isLoading}
        searchPlaceholder="Поиск по заголовку..."

        showFilters={false}

        pagination={
          !pagesCrud.isLoading && pagesCrud.items && pagesCrud.items.length > 0 ? (
            <Pagination
              currentPage={pagesCrud.page}
              totalPages={pagesCrud.pagination.pages}
              totalItems={pagesCrud.pagination.total}
              onPageChange={pagesCrud.setPage}
              loading={pagesCrud.isLoading}
            />
          ) : null
        }
      >
        <EntityList
          items={pagesCrud.items}
          renderItem={(page) => (
            <>
              <div className={entityListStyles.entityItemContent} onClick={() => handleViewPage(page)}>
                <div className={entityListStyles.entityItemMain}>
                  <div className={entityListStyles.entityItemAvatar}>
                    <FiFileText />
                  </div>
                  <div className={entityListStyles.entityItemInfo}>
                    <div className={entityListStyles.entityItemHeader}>
                      <p className={entityListStyles.entityItemTitle}>
                        {page.title}
                      </p>
                    </div>
                    <div className={entityListStyles.entityItemMeta}>
                      <span className={entityListStyles.entityItemMetaItem}>
                        <span className={entityListStyles.entityItemMetaLabel}>Slug:</span> {page.slug}
                      </span>
                      <span className={entityListStyles.entityItemSeparator}>•</span>
                      <span className={entityListStyles.entityItemMetaItem}>
                        <span className={entityListStyles.entityItemMetaLabel}>Статус:</span>{' '}
                        {page.is_published ? 'Опубликована' : 'Черновик'}
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
                    onClick={() => handleEditPage(page)}
                    aria-label={`Редактировать страницу ${page.id}`}
                    className={entityListStyles.btnEdit}
                  >
                    Редактировать
                  </Button>
                </PermissionGate>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEye />}
                  onClick={() => handleViewPage(page)}
                  aria-label={`Просмотреть страницу ${page.id}`}
                  className={entityListStyles.btnView}
                >
                  Просмотр
                </Button>

                <PermissionGate permission={['cms:delete']} fallback={null}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPageToDelete(page)}
                    disabled={pagesCrud.isSubmitting}
                    aria-label="Удалить страницу"
                    className={entityListStyles.btnDelete}
                  >
                    <FiTrash2 />
                  </Button>
                </PermissionGate>
              </div>
            </>
          )}
          emptyMessage={
            pagesCrud.isLoading
              ? 'Загрузка страниц...'
              : pagesCrud.search
                ? 'По вашему запросу ничего не найдено.'
                : 'Страницы не найдены.'
          }
          loading={pagesCrud.isLoading}
        />
      </CrudListLayout>

      {pageToDelete && (
        <DeletePageModal
          page={pageToDelete}
          onClose={() => setPageToDelete(null)}
          onSubmit={handleDeletePage}
          isSubmitting={pagesCrud.isSubmitting}
        />
      )}
    </>
  );
}
