import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import entityListStyles from '../../../shared/ui/EntityList/EntityList.module.css';

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
  const [searchParams] = useSearchParams();
  const [attributeToDelete, setAttributeToDelete] = useState(null);
  const attributesCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT, search } = {}) => {
      const data = await getAttributesRequest({ page, limit, name: search });
      return data;
    },
    deleteFn: deleteAttributeRequest,
    entityName: 'Атрибут',
    defaultLimit: PAGE_LIMIT,
    syncWithUrl: true,
  });

  const handleDeleteAttribute = async () => {
    if (!attributeToDelete) return;
    const result = await attributesCrud.delete(attributeToDelete.id);
    if (result) setAttributeToDelete(null);
  };

  const navigateWithParams = (path) => {
    const paramsString = searchParams.toString();
    const fullPath = paramsString ? `${path}?${paramsString}` : path;
    navigate(fullPath);
  };

  const handleViewAttribute = (attribute) => navigateWithParams(`/catalog/attributes/${attribute.id}`);
  const handleEditAttribute = (attribute) => navigateWithParams(`/catalog/attributes/${attribute.id}/edit`);
  const handleCreateAttribute = () => navigateWithParams('/catalog/attributes/create');

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1 className={styles.attributesPageTitle}>Атрибуты</h1>
            <div className={styles.attributesPageControls}>
              <PermissionGate permission={['product_attribute:create']} fallback={null}>
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
              <div className={entityListStyles.entityItemContent} onClick={() => handleViewAttribute(attribute)}>
                <div className={entityListStyles.entityItemMain}>
                  <div className={entityListStyles.entityItemAvatar}><FiTag /></div>
                  <div className={entityListStyles.entityItemInfo}>
                    <div className={entityListStyles.entityItemHeader}>
                      <p className={entityListStyles.entityItemTitle}>{attribute.name || 'Без названия'}</p>
                    </div>
                    <div className={entityListStyles.entityItemMeta}>
                      <span className={entityListStyles.entityItemMetaItem}><span className={entityListStyles.entityItemMetaLabel}>ID:</span> {attribute.id}</span>
                      {attribute.description && (
                        <><span className={entityListStyles.entityItemSeparator}>•</span><span className={entityListStyles.entityItemMetaItem}>{attribute.description}</span></>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className={entityListStyles.entityActions}>
                <PermissionGate permission={['attribute:update']} fallback={null}>
                  <Button variant="secondary" size="sm" leftIcon={<FiEdit2 />} onClick={() => handleEditAttribute(attribute)} className={entityListStyles.btnEdit}>Редактировать</Button>
                </PermissionGate>
                <Button variant="secondary" size="sm" leftIcon={<FiEye />} onClick={() => handleViewAttribute(attribute)} className={entityListStyles.btnView}>Просмотр</Button>
                <PermissionGate permission={['attribute:delete']} fallback={null}>
                  <Button variant="ghost" size="icon" onClick={() => setAttributeToDelete(attribute)} disabled={attributesCrud.isSubmitting} className={entityListStyles.btnDelete}><FiTrash2 /></Button>
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
