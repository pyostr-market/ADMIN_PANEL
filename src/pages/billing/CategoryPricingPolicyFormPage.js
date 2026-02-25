import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiDollarSign } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { PageHeader } from '../../shared/ui/PageHeader/PageHeader';
import { FormSection } from '../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../shared/ui/FormGrid/FormGrid';
import { PageActions } from '../../shared/ui/PageActions/PageActions';
import { LoadingState } from '../../shared/ui/LoadingState/LoadingState';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import { AutocompleteInput } from '../../shared/ui/AutocompleteInput';
import {
  getCategoryPricingPolicyByIdRequest,
  createCategoryPricingPolicyRequest,
  updateCategoryPricingPolicyRequest,
  getCategoriesForAutocompleteRequest,
} from './api/categoryPricingPolicyApi';
import './CategoryPricingPolicyFormPage.css';
import './CategoryPricingPolicyFormPage-Mobile.css';

export function CategoryPricingPolicyFormPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { pricingPolicyId } = useParams();

  const isEditMode = Boolean(pricingPolicyId);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [formData, setFormData] = useState({
    category_id: '',
    markup_fixed: '',
    markup_percent: '',
    commission_percent: '',
    discount_percent: '',
    tax_rate: '0',
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const loadPolicy = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCategoryPricingPolicyByIdRequest(pricingPolicyId);
      setFormData({
        category_id: data.category_id || '',
        markup_fixed: data.markup_fixed !== null ? String(data.markup_fixed) : '',
        markup_percent: data.markup_percent !== null ? String(data.markup_percent) : '',
        commission_percent: data.commission_percent !== null ? String(data.commission_percent) : '',
        discount_percent: data.discount_percent !== null ? String(data.discount_percent) : '',
        tax_rate: String(data.tax_rate || 0),
      });

      if (data.category) {
        setSelectedCategory(data.category);
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [pricingPolicyId]);

  useEffect(() => {
    if (isEditMode && pricingPolicyId) {
      loadPolicy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingPolicyId, isEditMode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category_id) {
      newErrors.category_id = 'Выберите категорию';
    }

    // Проверка диапазонов 0-100 для процентных значений
    const percentFields = [
      { field: 'markup_percent', name: 'Наценка %' },
      { field: 'commission_percent', name: 'Комиссия %' },
      { field: 'discount_percent', name: 'Скидка %' },
      { field: 'tax_rate', name: 'НДС' },
    ];

    percentFields.forEach(({ field, name }) => {
      const value = formData[field];
      if (value !== '' && value !== null && value !== undefined) {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
          newErrors[field] = `${name} должен быть от 0 до 100`;
        }
      }
    });

    // Проверка фиксированной наценки
    if (formData.markup_fixed !== '' && formData.markup_fixed !== null) {
      const numValue = parseFloat(formData.markup_fixed);
      if (isNaN(numValue)) {
        newErrors.markup_fixed = 'Фиксированная наценка должна быть числом';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e, stayOnPage = false) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      notificationsRef.current?.error('Исправьте ошибки в форме');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        category_id: Number(formData.category_id),
        markup_fixed: formData.markup_fixed !== '' ? parseFloat(formData.markup_fixed) : null,
        markup_percent: formData.markup_percent !== '' ? parseFloat(formData.markup_percent) : null,
        commission_percent: formData.commission_percent !== '' ? parseFloat(formData.commission_percent) : null,
        discount_percent: formData.discount_percent !== '' ? parseFloat(formData.discount_percent) : null,
        tax_rate: formData.tax_rate !== '' ? parseFloat(formData.tax_rate) : 0,
      };

      if (isEditMode) {
        await updateCategoryPricingPolicyRequest(pricingPolicyId, payload);
        notificationsRef.current?.info('Тариф обновлен');

        if (stayOnPage) {
          // Обновляем данные формы
          setFormData({
            category_id: formData.category_id,
            markup_fixed: formData.markup_fixed,
            markup_percent: formData.markup_percent,
            commission_percent: formData.commission_percent,
            discount_percent: formData.discount_percent,
            tax_rate: formData.tax_rate,
          });
        }
      } else {
        const responseData = await createCategoryPricingPolicyRequest(payload);
        notificationsRef.current?.info('Тариф создан');

        if (stayOnPage) {
          const newPolicyId = responseData?.id;
          if (newPolicyId) {
            navigate(`/billing/pricing-policies/${newPolicyId}`);
          }
        }
      }

      if (!stayOnPage) {
        navigate('/billing/pricing-policies');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="category-pricing-policy-form-page">
        <LoadingState message="Загрузка данных тарифа..." size="lg" />
      </section>
    );
  }

  return (
    <section className="category-pricing-policy-form-page">
      <PageHeader
        title={isEditMode ? 'Редактирование тарифа категории' : 'Создание тарифа категории'}
        onBack={() => navigate(isEditMode ? `/billing/pricing-policies/${pricingPolicyId}` : '/billing/pricing-policies')}
      />

      <form className="category-pricing-policy-form-page__form" onSubmit={handleSubmit}>
        <FormSection
          icon={<FiDollarSign />}
          iconVariant="primary"
          title="Параметры тарифа"
          description="Настройте параметры ценообразования для категории"
        >
          <FormGrid columns={2}>
            <div className="category-pricing-policy-form__field">
              <AutocompleteInput
                label="Категория"
                value={formData.category_id}
                onChange={(value) => handleChange('category_id', value)}
                fetchOptions={getCategoriesForAutocompleteRequest}
                placeholder="Начните ввод для поиска категории..."
                selectedOption={selectedCategory}
                disabled={isEditMode}
              />
              {errors.category_id && (
                <span className="category-pricing-policy-form__error">{errors.category_id}</span>
              )}
              {isEditMode && (
                <span className="category-pricing-policy-form__hint">
                  Категория не может быть изменена после создания
                </span>
              )}
            </div>

            <div className="category-pricing-policy-form__field">
              <label className="category-pricing-policy-form__label">
                Фиксированная наценка (₽)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.markup_fixed}
                onChange={(e) => handleChange('markup_fixed', e.target.value)}
                placeholder="0.00"
                className={errors.markup_fixed ? 'input-error' : ''}
              />
              {errors.markup_fixed && (
                <span className="category-pricing-policy-form__error">{errors.markup_fixed}</span>
              )}
              <span className="category-pricing-policy-form__hint">
                Фиксированная сумма, добавляемая к цене товара
              </span>
            </div>

            <div className="category-pricing-policy-form__field">
              <label className="category-pricing-policy-form__label">
                Наценка %
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.markup_percent}
                onChange={(e) => handleChange('markup_percent', e.target.value)}
                placeholder="0"
                className={errors.markup_percent ? 'input-error' : ''}
              />
              {errors.markup_percent && (
                <span className="category-pricing-policy-form__error">{errors.markup_percent}</span>
              )}
              <span className="category-pricing-policy-form__hint">
                Процент наценки на товар (0-100)
              </span>
            </div>

            <div className="category-pricing-policy-form__field">
              <label className="category-pricing-policy-form__label">
                Комиссия %
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.commission_percent}
                onChange={(e) => handleChange('commission_percent', e.target.value)}
                placeholder="0"
                className={errors.commission_percent ? 'input-error' : ''}
              />
              {errors.commission_percent && (
                <span className="category-pricing-policy-form__error">{errors.commission_percent}</span>
              )}
              <span className="category-pricing-policy-form__hint">
                Комиссия маркетплейса (0-100)
              </span>
            </div>

            <div className="category-pricing-policy-form__field">
              <label className="category-pricing-policy-form__label">
                Скидка %
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.discount_percent}
                onChange={(e) => handleChange('discount_percent', e.target.value)}
                placeholder="0"
                className={errors.discount_percent ? 'input-error' : ''}
              />
              {errors.discount_percent && (
                <span className="category-pricing-policy-form__error">{errors.discount_percent}</span>
              )}
              <span className="category-pricing-policy-form__hint">
                Скидка категории (0-100)
              </span>
            </div>

            <div className="category-pricing-policy-form__field">
              <label className="category-pricing-policy-form__label">
                Ставка НДС %
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.tax_rate}
                onChange={(e) => handleChange('tax_rate', e.target.value)}
                placeholder="0"
                className={errors.tax_rate ? 'input-error' : ''}
              />
              {errors.tax_rate && (
                <span className="category-pricing-policy-form__error">{errors.tax_rate}</span>
              )}
              <span className="category-pricing-policy-form__hint">
                Ставка налога на добавленную стоимость (0-100)
              </span>
            </div>
          </FormGrid>
        </FormSection>

        <PageActions>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/billing/pricing-policies')}
            leftIcon={<FiX />}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="primary"
            leftIcon={<FiSave />}
            loading={isSubmitting}
            size="lg"
            onClick={() => handleSubmit(null, true)}
          >
            Сохранить и продолжить редактирование
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<FiSave />}
            loading={isSubmitting}
            size="lg"
          >
            {isEditMode ? 'Сохранить' : 'Создать'}
          </Button>
        </PageActions>
      </form>
    </section>
  );
}
