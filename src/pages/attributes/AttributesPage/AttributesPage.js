import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEye, FiEdit2, FiTag } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList } from '../../../shared/lib/crud';
import { getAttributesRequest, deleteAttributeRequest } from '../api/attributesApi';
import styles from './AttributesPage.module.css';

const PAGE_LIMIT = 20;

function DeleteAttributeModal({ attribute, onClose, onSubmit, isSubmitting }) {
  if (!attribute) return null;
  return (
    <Modal isOpen onClose={onClose} title="Удаление атрибута" size="sm" footer={(
      <>
        <Button variant="secondary" onClick={onClose}>Отмена</Button>
        <Button variant="danger" onClick={onSubmit} loading={isSubmitting}>Удалить</Button>
      </>
    )}>
      <p className={styles.modalConfirmText}>Вы уверены, что хотите удалить атрибут <strong>{attribute.name || `ID: ${attribute.id}`}</strong>?</p>
      <p className={styles.modalConfirmNote}>Это действие нельзя отменить.</p>
    </Modal>
  );
}

export function AttributesPage() {
  const navigate = useNavigate();
  const [attributeToDelete, setAttributeToDelete] = useState(null);
  const attributesCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search } = {}) => {
      const data = await getAttributesRequest({ page, limit, name: search });
      return data;
    },
    deleteFn: deleteAttributeRequest,
    entityName: 'Атрибут',
    defaultLimit: PAGE_LIMIT,
  });

  const handleDeleteAttribute = async () => {
    if (!attributeToDelete) return;
    const result = await attributesCrud.delete(attributeToDelete.id);
    if (result) setAttributeToDelete(null);
  };

  const handleViewAttribute = (attribute) => navigate(`/attributes/${attribute.id}`);
  const handleEditAttribute = (attribute) => navigate(`/attributes/${attribute.id}/edit`);
  const handleCreateAttribute = () => navigate('/attributes/create');

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1 className={styles.attributesPageTitle}>Атрибуты</h1>
            <div className={styles.attributesPageControls}>
              <PermissionGate permission={['attribute:create']} fallback={null}>
                <Button variant="primary" leftIcon={<FiPlus />} onClick={handleCreateAttribute}>Создать атрибут</Button>
              </PermissionGate>
            </div>
          </>
        )}
        showSearch={true}
        searchValue={attributesCrud.search}
        onSearchChange={attributesCrud.setSearch}
        searchLoading={attributesCrud.isLoading}
        searchPlaceholder="Поиск по названию..."
        showFilters={false}
        pagination={
          !attributesCrud.isLoading && attributesCrud.items && attributesCrud.items.length > 0 ? (
            <Pagination currentPage={attributesCrud.page} totalPages={attributesCrud.pagination.pages} totalItems={attributesCrud.pagination.total} onPageChange={attributesCrud.setPage} loading={attributesCrud.isLoading} />
          ) : null
        }
      >
        <EntityList
          items={attributesCrud.items}
          renderItem={(attribute) => (
            <>
              <div className={styles.attributesPageItemContent} onClick={() => handleViewAttribute(attribute)}>
                <div className={styles.attributesPageItemMain}>
                  <div className={styles.attributesPageAvatar}><FiTag /></div>
                  <div className={styles.attributesPageItemInfo}>
                    <div className={styles.attributesPageItemHeader}>
                      <p className={styles.attributesPageItemTitle}>{attribute.name || 'Без названия'}</p>
                    </div>
                    <div className={styles.attributesPageItemMeta}>
                      <span className={styles.attributesPageMetaItem}><span className={styles.attributesPageMetaLabel}>ID:</span> {attribute.id}</span>
                      {attribute.description && (
                        <><span className={styles.attributesPageSeparator}>•</span><span className={styles.attributesPageMetaItem}>{attribute.description}</span></>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.attributesPageItemActions}>
                <PermissionGate permission={['attribute:update']} fallback={null}>
                  <Button variant="secondary" size="sm" leftIcon={<FiEdit2 />} onClick={() => handleEditAttribute(attribute)}>Редактировать</Button>
                </PermissionGate>
                <Button variant="secondary" size="sm" leftIcon={<FiEye />} onClick={() => handleViewAttribute(attribute)}>Просмотр</Button>
                <PermissionGate permission={['attribute:delete']} fallback={null}>
                  <Button variant="ghost" size="icon" onClick={() => setAttributeToDelete(attribute)} disabled={attributesCrud.isSubmitting} className={styles.btnDelete}><FiTrash2 /></Button>
                </PermissionGate>
              </div>
            </>
          )}
          emptyMessage={attributesCrud.isLoading ? 'Загрузка атрибутов...' : attributesCrud.search ? 'По вашему запросу ничего не найдено.' : 'Атрибуты не найдены.'}
          loading={attributesCrud.isLoading}
        />
      </CrudListLayout>
      {attributeToDelete && <DeleteAttributeModal attribute={attributeToDelete} onClose={() => setAttributeToDelete(null)} onSubmit={handleDeleteAttribute} isSubmitting={attributesCrud.isSubmitting} />}
    </>
  );
}
