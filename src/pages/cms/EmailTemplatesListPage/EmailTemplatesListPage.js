import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiPlus, FiTrash2, FiEye, FiEdit2 } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList } from '../../../shared/lib/crud';
import {
  getEmailTemplatesRequest,
  deleteEmailTemplateRequest,
} from '../api/cmsApi';
import styles from './EmailTemplatesListPage.module.css';
import entityListStyles from '../../../shared/ui/EntityList/EntityList.module.css';

const PAGE_LIMIT = 20;

function DeleteEmailTemplateModal({ template, onClose, onSubmit, isSubmitting }) {
  if (!template) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление email шаблона"
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
        Вы уверены, что хотите удалить шаблон{' '}
        <strong>"{template.key}"</strong>?
      </p>
      <p className={styles.modalConfirmNote}>
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function EmailTemplatesListPage() {
  const navigate = useNavigate();

  const [templateToDelete, setTemplateToDelete] = useState(null);

  const templatesCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT } = {}) => {
      const data = await getEmailTemplatesRequest({});
      const items = data.items || [];
      const total = data.total || items.length;
      const pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      };
      const start = (page - 1) * limit;
      const end = start + limit;
      return { items: items.slice(start, end), pagination };
    },
    deleteFn: deleteEmailTemplateRequest,
    entityName: 'Email шаблон',
    defaultLimit: PAGE_LIMIT,
    syncWithUrl: true,
  });

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    const result = await templatesCrud.delete(templateToDelete.id);
    if (result) {
      setTemplateToDelete(null);
    }
  };

  const handleViewTemplate = (template) => {
    navigate(`/cms/email-templates/${template.id}`);
  };

  const handleEditTemplate = (template) => {
    navigate(`/cms/email-templates/${template.id}/edit`);
  };

  const handleCreateTemplate = () => {
    navigate('/cms/email-templates/create');
  };

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1 className={styles.emailTemplatesPageTitle}>Email шаблоны</h1>
            <div className={styles.emailTemplatesPageControls}>
              <PermissionGate permission={['cms:create']} fallback={null}>
                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={handleCreateTemplate}
                >
                  Создать шаблон
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        showSearch={true}
        searchValue={templatesCrud.search}
        onSearchChange={templatesCrud.setSearch}
        searchLoading={templatesCrud.isLoading}
        searchPlaceholder="Поиск по ключу или теме..."

        showFilters={false}

        pagination={
          !templatesCrud.isLoading && templatesCrud.items && templatesCrud.items.length > 0 ? (
            <Pagination
              currentPage={templatesCrud.page}
              totalPages={templatesCrud.pagination.pages}
              totalItems={templatesCrud.pagination.total}
              onPageChange={templatesCrud.setPage}
              loading={templatesCrud.isLoading}
            />
          ) : null
        }
      >
        <EntityList
          items={templatesCrud.items}
          renderItem={(template) => (
            <>
              <div className={entityListStyles.entityItemContent} onClick={() => handleViewTemplate(template)}>
                <div className={entityListStyles.entityItemMain}>
                  <div className={entityListStyles.entityItemAvatar}>
                    <FiMail />
                  </div>
                  <div className={entityListStyles.entityItemInfo}>
                    <div className={entityListStyles.entityItemHeader}>
                      <p className={entityListStyles.entityItemTitle}>
                        {template.subject}
                      </p>
                    </div>
                    <div className={entityListStyles.entityItemMeta}>
                      <span className={entityListStyles.entityItemMetaItem}>
                        <span className={entityListStyles.entityItemMetaLabel}>Ключ:</span>{' '}
                        {template.key}
                      </span>
                      <span className={entityListStyles.entityItemSeparator}>•</span>
                      <span className={entityListStyles.entityItemMetaItem}>
                        <span className={entityListStyles.entityItemMetaLabel}>Статус:</span>{' '}
                        {template.is_active ? 'Активен' : 'Неактивен'}
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
                    onClick={() => handleEditTemplate(template)}
                    aria-label={`Редактировать шаблон ${template.id}`}
                    className={entityListStyles.btnEdit}
                  >
                    Редактировать
                  </Button>
                </PermissionGate>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEye />}
                  onClick={() => handleViewTemplate(template)}
                  aria-label={`Просмотреть шаблон ${template.id}`}
                  className={entityListStyles.btnView}
                >
                  Просмотр
                </Button>

                <PermissionGate permission={['cms:delete']} fallback={null}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTemplateToDelete(template)}
                    disabled={templatesCrud.isSubmitting}
                    aria-label="Удалить шаблон"
                    className={entityListStyles.btnDelete}
                  >
                    <FiTrash2 />
                  </Button>
                </PermissionGate>
              </div>
            </>
          )}
          emptyMessage={
            templatesCrud.isLoading
              ? 'Загрузка шаблонов...'
              : templatesCrud.search
                ? 'По вашему запросу ничего не найдено.'
                : 'Email шаблоны не найдены.'
          }
          loading={templatesCrud.isLoading}
        />
      </CrudListLayout>

      {templateToDelete && (
        <DeleteEmailTemplateModal
          template={templateToDelete}
          onClose={() => setTemplateToDelete(null)}
          onSubmit={handleDeleteTemplate}
          isSubmitting={templatesCrud.isSubmitting}
        />
      )}
    </>
  );
}
