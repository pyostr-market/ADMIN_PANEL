import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit, FiArrowLeft, FiDollarSign, FiPercent, FiTag } from 'react-icons/fi';
import { PermissionGate } from '../../shared/ui/PermissionGate';
import { Button } from '../../shared/ui/Button';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { getCategoryPricingPolicyByIdRequest } from './api/categoryPricingPolicyApi';
import './CategoryPricingPolicyDetailPage.css';

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
      <section className="category-pricing-policy-detail-page">
        <div className="category-pricing-policy-detail-page__loading">
          <div className="loading-spinner" />
          <p>Загрузка данных тарифа...</p>
        </div>
      </section>
    );
  }

  if (!policy) {
    return (
      <section className="category-pricing-policy-detail-page">
        <div className="category-pricing-policy-detail-page__empty">
          <h1>Тариф не найден</h1>
          <Button variant="primary" leftIcon={<FiArrowLeft />} onClick={handleBack}>
            Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="category-pricing-policy-detail-page">
      <header className="category-pricing-policy-detail-page__header">
        <Button variant="ghost" onClick={handleBack} className="back-button">
          ← Назад
        </Button>
        <div className="category-pricing-policy-detail-page__actions">
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

      <div className="category-pricing-policy-detail-page__content">
        <div className="category-pricing-policy-detail-page__panel">
          <div className="panel-header">
            <div className="panel-header__content">
              <h2 className="panel-title">Параметры тарифа</h2>
            </div>
          </div>

          <div className="pricing-policy-info-grid">
            <div className="info-card">
              <div className="info-card__icon info-card__icon--primary">
                <FiTag />
              </div>
              <div className="info-card__content">
                <span className="info-card__label">ID тарифа</span>
                <span className="info-card__value">{policy.id}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__icon info-card__icon--secondary">
                <FiDollarSign />
              </div>
              <div className="info-card__content">
                <span className="info-card__label">ID категории</span>
                <span className="info-card__value">{policy.category_id}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__icon info-card__icon--accent">
                <FiDollarSign />
              </div>
              <div className="info-card__content">
                <span className="info-card__label">Фиксированная наценка</span>
                <span className="info-card__value">{formatCurrency(policy.markup_fixed)}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__icon info-card__icon--success">
                <FiPercent />
              </div>
              <div className="info-card__content">
                <span className="info-card__label">Наценка %</span>
                <span className="info-card__value">{formatPercent(policy.markup_percent)}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__icon info-card__icon--warning">
                <FiPercent />
              </div>
              <div className="info-card__content">
                <span className="info-card__label">Комиссия %</span>
                <span className="info-card__value">{formatPercent(policy.commission_percent)}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__icon info-card__icon--info">
                <FiPercent />
              </div>
              <div className="info-card__content">
                <span className="info-card__label">Скидка %</span>
                <span className="info-card__value">{formatPercent(policy.discount_percent)}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__icon info-card__icon--danger">
                <FiPercent />
              </div>
              <div className="info-card__content">
                <span className="info-card__label">Ставка НДС</span>
                <span className="info-card__value">{formatPercent(policy.tax_rate)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="category-pricing-policy-detail-page__panel">
          <div className="panel-header">
            <div className="panel-header__content">
              <h2 className="panel-title">Расчет цены</h2>
            </div>
          </div>
          <div className="panel-content">
            <div className="pricing-calculation-info">
              <p className="pricing-calculation-info__text">
                Формула расчета итоговой цены товара с учетом тарифа категории:
              </p>
              <div className="pricing-calculation-info__formula">
                <code>
                  Цена = (Базовая цена + markup_fixed) × (1 + markup_percent/100) × (1 + commission_percent/100) × (1 - discount_percent/100) × (1 + tax_rate/100)
                </code>
              </div>
              <div className="pricing-calculation-info__legend">
                <div className="legend-item">
                  <span className="legend-item__dot legend-item__dot--primary"></span>
                  <span className="legend-item__text">markup_fixed — фиксированная наценка</span>
                </div>
                <div className="legend-item">
                  <span className="legend-item__dot legend-item__dot--success"></span>
                  <span className="legend-item__text">markup_percent — процентная наценка</span>
                </div>
                <div className="legend-item">
                  <span className="legend-item__dot legend-item__dot--warning"></span>
                  <span className="legend-item__text">commission_percent — комиссия маркетплейса</span>
                </div>
                <div className="legend-item">
                  <span className="legend-item__dot legend-item__dot--info"></span>
                  <span className="legend-item__text">discount_percent — скидка категории</span>
                </div>
                <div className="legend-item">
                  <span className="legend-item__dot legend-item__dot--danger"></span>
                  <span className="legend-item__text">tax_rate — ставка НДС</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
