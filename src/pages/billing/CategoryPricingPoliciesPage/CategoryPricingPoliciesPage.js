import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiPlus, FiTrash2, FiEye, FiEdit2 } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList } from '../../../shared/lib/crud';
import {
  getCategoryPricingPoliciesRequest,
  deleteCategoryPricingPolicyRequest,
} from '../api/categoryPricingPolicyApi';
import styles from './CategoryPricingPoliciesPage.module.css';

const PAGE_LIMIT = 20;

function DeleteCategoryPricingPolicyModal({ policy, onClose, onSubmit, isSubmitting }) {
  if (!policy) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление тарифа категории"
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
        Вы уверены, что хотите удалить тариф для категории{' '}
        <strong>ID: {policy.category_id}</strong>?
      </p>
      <p className={styles.modalConfirmNote}>
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function CategoryPricingPoliciesPage() {
  const navigate = useNavigate();

  const [policyToDelete, setPolicyToDelete] = useState(null);

  const policiesCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT } = {}) => {
      const data = await getCategoryPricingPoliciesRequest({
        page,
        limit,
      });
      return data;
    },
    deleteFn: deleteCategoryPricingPolicyRequest,
    entityName: 'Тариф',
    defaultLimit: PAGE_LIMIT,
    syncWithUrl: true,
  });

  const handleDeletePolicy = async () => {
    if (!policyToDelete) return;

    const result = await policiesCrud.delete(policyToDelete.id);
    if (result) {
      setPolicyToDelete(null);
    }
  };

  const handleViewPolicy = (policy) => {
    navigate(`/billing/pricing-policies/${policy.id}`);
  };

  const handleEditPolicy = (policy) => {
    navigate(`/billing/pricing-policies/${policy.id}/edit`);
  };

  const handleCreatePolicy = () => {
    navigate('/billing/pricing-policies/create');
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined) return '—';
    return `${value}%`;
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '—';
    return `${value.toFixed(2)} ₽`;
  };

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <h1 className={styles.policiesPageTitle}>Тарифы категорий</h1>
            <div className={styles.policiesPageControls}>
              <PermissionGate permission={['category_pricing_policy:create']} fallback={null}>
                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={handleCreatePolicy}
                >
                  Создать тариф
                </Button>
              </PermissionGate>
            </div>
          </>
        )}
        showSearch={true}
        searchValue={policiesCrud.search}
        onSearchChange={policiesCrud.setSearch}
        searchLoading={policiesCrud.isLoading}
        searchPlaceholder="Поиск по ID категории..."

        showFilters={false}

        pagination={
          !policiesCrud.isLoading && policiesCrud.items && policiesCrud.items.length > 0 ? (
            <Pagination
              currentPage={policiesCrud.page}
              totalPages={policiesCrud.pagination.pages}
              totalItems={policiesCrud.pagination.total}
              onPageChange={policiesCrud.setPage}
              loading={policiesCrud.isLoading}
            />
          ) : null
        }
      >
        <EntityList
          items={policiesCrud.items}
          renderItem={(policy) => (
            <>
              <div className={styles.policiesPageItemContent} onClick={() => handleViewPolicy(policy)}>
                <div className={styles.policiesPageItemMain}>
                  <div className={styles.policiesPageItemAvatar}>
                    <FiDollarSign />
                  </div>
                  <div className={styles.policiesPageItemInfo}>
                    <div className={styles.policiesPageItemHeader}>
                      <p className={styles.policiesPageItemTitle}>
                        Категория ID: {policy.category_id}
                      </p>
                    </div>
                    <div className={styles.policiesPageItemMeta}>
                      <span className={styles.policiesPageMetaItem}>
                        <span className={styles.policiesPageMetaLabel}>Наценка:</span> {formatCurrency(policy.markup_fixed)}
                      </span>
                      <span className={styles.policiesPageSeparator}>•</span>
                      <span className={styles.policiesPageMetaItem}>
                        <span className={styles.policiesPageMetaLabel}>Наценка %:</span> {formatPercent(policy.markup_percent)}
                      </span>
                      <span className={styles.policiesPageSeparator}>•</span>
                      <span className={styles.policiesPageMetaItem}>
                        <span className={styles.policiesPageMetaLabel}>Комиссия:</span> {formatPercent(policy.commission_percent)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.policiesPageItemActions}>
                <PermissionGate permission={['category_pricing_policy:update']} fallback={null}>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiEdit2 />}
                    onClick={() => handleEditPolicy(policy)}
                    aria-label={`Редактировать тариф категории ${policy.id}`}
                  >
                    Редактировать
                  </Button>
                </PermissionGate>

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiEye />}
                  onClick={() => handleViewPolicy(policy)}
                  aria-label={`Просмотреть тариф категории ${policy.id}`}
                >
                  Просмотр
                </Button>

                <PermissionGate permission={['category_pricing_policy:delete']} fallback={null}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPolicyToDelete(policy)}
                    disabled={policiesCrud.isSubmitting}
                    aria-label="Удалить тариф категории"
                    className={styles.btnDelete}
                  >
                    <FiTrash2 />
                  </Button>
                </PermissionGate>
              </div>
            </>
          )}
          emptyMessage={
            policiesCrud.isLoading
              ? 'Загрузка тарифов...'
              : policiesCrud.search
                ? 'По вашему запросу ничего не найдено.'
                : 'Тарифы не найдены.'
          }
          loading={policiesCrud.isLoading}
        />
      </CrudListLayout>

      {policyToDelete && (
        <DeleteCategoryPricingPolicyModal
          policy={policyToDelete}
          onClose={() => setPolicyToDelete(null)}
          onSubmit={handleDeletePolicy}
          isSubmitting={policiesCrud.isSubmitting}
        />
      )}
    </>
  );
}
