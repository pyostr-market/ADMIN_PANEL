import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHelpCircle, FiPlus, FiTrash2, FiEye, FiEdit2 } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList } from '../../../shared/lib/crud';
import {
  getFaqsAdminRequest,
  deleteFaqRequest,
  searchFaqsRequest,
} from '../api/cmsApi';
import styles from './FaqListPage.module.css';
import entityListStyles from '../../../shared/ui/EntityList/EntityList.module.css';

const PAGE_LIMIT = 10;

function DeleteFaqModal({ faq, onClose, onSubmit, isSubmitting }) {
  if (!faq) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление FAQ"
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
        Вы уверены, что хотите удалить вопрос{' '}
        <strong>"{faq.question}"</strong>?
      </p>
      <p className={styles.modalConfirmNote}>
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function FaqListPage() {
  const navigate = useNavigate();

  const [faqToDelete, setFaqToDelete] = useState(null);

  const faqsCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT } = {}) => {
      const offset = (page - 1) * limit;
      const data = await getFaqsAdminRequest({
        limit,
        offset,
      });
      const pagination = {
        page,
        limit,
        total: data.total,
        pages: Math.ceil(data.total / limit),
      };
      return { items: data.items, pagination };
    },
    deleteFn: deleteFaqRequest,
    entityName: 'FAQ',
    defaultLimit: PAGE_LIMIT,
    syncWithUrl: true,
  });

  const handleDeleteFaq = async () => {
    if (!faqToDelete) return;

    const result = await faqsCrud.delete(faqToDelete.id);
    if (result) {
      setFaqToDelete(null);
    }
  };

  const handleViewFaq = (faq) => {
    navigate(`/cms/faq/${faq.id}`);
  };

  const handleEditFaq = (faq) => {
    navigate(`/cms/faq/${faq.id}/edit`);
  };

  const handleCreateFaq = () => {
    navigate('/cms/faq/create');
  };

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1 className={styles.faqPageTitle}>FAQ</h1>
            <div className={styles.faqPageControls}>
              <PermissionGate permission={['cms:create']} fallback={null}>
                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={handleCreateFaq}
                >
                  Создать вопрос
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        showSearch={true}
        searchValue={faqsCrud.search}
        onSearchChange={faqsCrud.setSearch}
        searchLoading={faqsCrud.isLoading}
        searchPlaceholder="Поиск по вопросу или ответу..."

        showFilters={false}

        pagination={
          !faqsCrud.isLoading && faqsCrud.items && faqsCrud.items.length > 0 ? (
            <Pagination
              currentPage={faqsCrud.page}
              totalPages={faqsCrud.pagination.pages}
              totalItems={faqsCrud.pagination.total}
              onPageChange={faqsCrud.setPage}
              loading={faqsCrud.isLoading}
            />
          ) : null
        }
      >
        <EntityList
          items={faqsCrud.items}
          renderItem={(faq) => (
            <>
              <div className={entityListStyles.entityItemContent} onClick={() => handleViewFaq(faq)}>
                <div className={entityListStyles.entityItemMain}>
                  <div className={entityListStyles.entityItemAvatar}>
                    <FiHelpCircle />
                  </div>
                  <div className={entityListStyles.entityItemInfo}>
                    <div className={entityListStyles.entityItemHeader}>
                      <p className={entityListStyles.entityItemTitle}>
                        {faq.question}
                      </p>
                    </div>
                    <div className={entityListStyles.entityItemMeta}>
                      <span className={entityListStyles.entityItemMetaItem}>
                        <span className={entityListStyles.entityItemMetaLabel}>Категория:</span>{' '}
                        {faq.category || '—'}
                      </span>
                      <span className={entityListStyles.entityItemSeparator}>•</span>
                      <span className={entityListStyles.entityItemMetaItem}>
                        <span className={entityListStyles.entityItemMetaLabel}>Статус:</span>{' '}
                        {faq.is_active ? 'Активен' : 'Неактивен'}
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
                    onClick={() => handleEditFaq(faq)}
                    aria-label={`Редактировать FAQ ${faq.id}`}
                    className={entityListStyles.btnEdit}
                  >
                    Редактировать
                  </Button>
                </PermissionGate>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEye />}
                  onClick={() => handleViewFaq(faq)}
                  aria-label={`Просмотреть FAQ ${faq.id}`}
                  className={entityListStyles.btnView}
                >
                  Просмотр
                </Button>

                <PermissionGate permission={['cms:delete']} fallback={null}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFaqToDelete(faq)}
                    disabled={faqsCrud.isSubmitting}
                    aria-label="Удалить FAQ"
                    className={entityListStyles.btnDelete}
                  >
                    <FiTrash2 />
                  </Button>
                </PermissionGate>
              </div>
            </>
          )}
          emptyMessage={
            faqsCrud.isLoading
              ? 'Загрузка FAQ...'
              : faqsCrud.search
                ? 'По вашему запросу ничего не найдено.'
                : 'FAQ не найдены.'
          }
          loading={faqsCrud.isLoading}
        />
      </CrudListLayout>

      {faqToDelete && (
        <DeleteFaqModal
          faq={faqToDelete}
          onClose={() => setFaqToDelete(null)}
          onSubmit={handleDeleteFaq}
          isSubmitting={faqsCrud.isSubmitting}
        />
      )}
    </>
  );
}
