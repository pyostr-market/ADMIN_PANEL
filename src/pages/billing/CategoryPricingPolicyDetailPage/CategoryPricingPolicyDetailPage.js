import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit, FiDollarSign } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { InfoBlock } from '../../../shared/ui/InfoBlock/InfoBlock';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { getCategoryPricingPolicyByIdRequest } from '../api/categoryPricingPolicyApi';
import styles from './CategoryPricingPolicyDetailPage.module.css';

export function CategoryPricingPolicyDetailPage() {
  const { pricingPolicyId } = useParams();
  const navigate = useNavigate();

  const [policy, setPolicy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPolicy = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCategoryPricingPolicyByIdRequest(pricingPolicyId);
      setPolicy(data);
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error('Ошибка загрузки тарифа:', message);
    } finally {
      setIsLoading(false);
    }
  }, [pricingPolicyId]);

  useEffect(() => {
    loadPolicy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingPolicyId]);

  const handleEdit = () => {
    navigate(`/billing/pricing-policies/${pricingPolicyId}/edit`);
  };

  const handleViewAudit = () => {
    navigate(`/billing/pricing-policies/${pricingPolicyId}/audit`);
  };

  const handleBack = () => {
    navigate('/billing/pricing-policies');
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined) return '—';
    return `${value}%`;
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '—';
    return `${value.toFixed(2)} ₽`;
  };

  if (isLoading) {
    return (
      <section className={styles.policyDetailPage}>
        <div className={styles.policyDetailPageLoading}>
          <div className="loading-spinner" />
          <p>Загрузка данных тарифа...</p>
        </div>
      </section>
    );
  }

  if (!policy) {
    return (
      <section className={styles.policyDetailPage}>
        <div className={styles.policyDetailPageEmpty}>
          <h1>Тариф не найден</h1>
          <Button variant="primary" onClick={handleBack}>
            ← Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.policyDetailPage}>
      <header className={styles.policyDetailPageHeader}>
        <Button variant="ghost" onClick={handleBack} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.policyDetailPageActions}>
          <PermissionGate permission={['category_pricing_policy:update']} fallback={null}>
            <Button
              variant="secondary"
              leftIcon={<FiEdit />}
              onClick={handleEdit}
            >
              Редактировать
            </Button>
          </PermissionGate>
        </div>
      </header>

      <div className={styles.policyDetailPageContent}>
        <InfoBlock
          title="Параметры тарифа"
          headerIcon={<FiDollarSign />}
          items={[
            {
              label: 'ID тарифа',
              value: policy.id,
              iconVariant: 'primary',
            },
            {
              label: 'ID категории',
              value: policy.category_id,
              iconVariant: 'secondary',
            },
            {
              label: 'Фиксированная наценка',
              value: formatCurrency(policy.markup_fixed),
              iconVariant: 'accent',
            },
            {
              label: 'Наценка %',
              value: formatPercent(policy.markup_percent),
              iconVariant: 'success',
            },
            {
              label: 'Комиссия %',
              value: formatPercent(policy.commission_percent),
              iconVariant: 'warning',
            },
            {
              label: 'Скидка %',
              value: formatPercent(policy.discount_percent),
              iconVariant: 'info',
            },
            {
              label: 'Ставка НДС %',
              value: formatPercent(policy.tax_rate),
              iconVariant: 'danger',
            },
          ]}
          auditUrl={`/billing/pricing-policies/${pricingPolicyId}/audit`}
          onAuditClick={handleViewAudit}
        />

        <div className={styles.policyDetailPagePanel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderContent}>
              <h2 className={styles.panelTitle}>Расчет цены</h2>
            </div>
          </div>
          <div className={styles.panelContent}>
            <div className={styles.pricingCalculationInfo}>
              <p className={styles.pricingCalculationInfoText}>
                Формула расчета итоговой цены товара с учетом тарифа категории:
              </p>
              <div className={styles.pricingCalculationInfoFormula}>
                <code>
                  Цена = (Базовая цена + markup_fixed) × (1 + markup_percent/100) × (1 + commission_percent/100) × (1 - discount_percent/100) × (1 + tax_rate/100)
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
