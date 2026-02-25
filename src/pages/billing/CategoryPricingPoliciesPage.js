import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiPlus, FiTrash2, FiEye, FiEdit2 } from 'react-icons/fi';
import { PermissionGate } from '../../shared/ui/PermissionGate';
import { Button } from '../../shared/ui/Button';
import { SearchInput } from '../../shared/ui/SearchInput';
import { Pagination } from '../../shared/ui/Pagination';
import { EntityList } from '../../shared/ui/EntityList';
import { Modal } from '../../shared/ui/Modal';
import { useCrudList } from '../../shared/lib/crud';
import {
  getCategoryPricingPoliciesRequest,
  deleteCategoryPricingPolicyRequest,
} from './api/categoryPricingPolicyApi';
import './CategoryPricingPoliciesPage.css';
import './CategoryPricingPoliciesPage-Mobile.css';

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
      <p className="modal-confirm-text">
        Вы уверены, что хотите удалить тариф для категории{' '}
        <strong>ID: {policy.category_id}</strong>?
      </p>
      <p className="modal-confirm-note">
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
    <section className="category-pricing-policies-page">
      <header className="category-pricing-policies-page__header">
        <h1 className="category-pricing-policies-page__title">Тарифы категорий</h1>
        <div className="category-pricing-policies-page__controls">
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
      </header>

      <div className={`category-pricing-policies-page__filters${policiesCrud.isLoading ? ' category-pricing-policies-page__filters--loading' : ''}`}>
        <SearchInput
          value={policiesCrud.search}
          onChange={(e) => policiesCrud.setSearch(e.target.value)}
          placeholder="Поиск по ID категории..."
          loading={policiesCrud.isLoading}
        />
      </div>

      <EntityList
        items={policiesCrud.items}
        renderItem={(policy) => (
          <>
            <div className="category-pricing-policies-page__item-content" onClick={() => handleViewPolicy(policy)}>
              <div className="category-pricing-policies-page__item-main">
                <div className="category-pricing-policies-page__item-avatar">
                  <FiDollarSign />
                </div>
                <div className="category-pricing-policies-page__item-info">
                  <div className="category-pricing-policies-page__item-header">
                    <p className="category-pricing-policies-page__item-title">
                      Категория ID: {policy.category_id}
                    </p>
                  </div>
                  <div className="category-pricing-policies-page__item-meta">
                    <span className="category-pricing-policies-page__meta-item">
                      <span className="category-pricing-policies-page__meta-label">Наценка:</span> {formatCurrency(policy.markup_fixed)}
                    </span>
                    <span className="category-pricing-policies-page__separator">•</span>
                    <span className="category-pricing-policies-page__meta-item">
                      <span className="category-pricing-policies-page__meta-label">Наценка %:</span> {formatPercent(policy.markup_percent)}
                    </span>
                    <span className="category-pricing-policies-page__separator">•</span>
                    <span className="category-pricing-policies-page__meta-item">
                      <span className="category-pricing-policies-page__meta-label">Комиссия:</span> {formatPercent(policy.commission_percent)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="category-pricing-policies-page__item-actions">
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
                  className="btn-delete"
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

      {!policiesCrud.isLoading && policiesCrud.items && policiesCrud.items.length > 0 && (
        <Pagination
          currentPage={policiesCrud.page}
          totalPages={policiesCrud.pagination.pages}
          totalItems={policiesCrud.pagination.total}
          onPageChange={policiesCrud.setPage}
          loading={policiesCrud.isLoading}
        />
      )}

      {policyToDelete && (
        <DeleteCategoryPricingPolicyModal
          policy={policyToDelete}
          onClose={() => setPolicyToDelete(null)}
          onSubmit={handleDeletePolicy}
          isSubmitting={policiesCrud.isSubmitting}
        />
      )}
    </section>
  );
}
