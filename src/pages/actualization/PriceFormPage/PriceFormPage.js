import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiFileText } from 'react-icons/fi';
import { FormPage } from '../../../shared/ui/FormPage';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
import { FormTextarea } from '../../../shared/ui/FormTextarea/FormTextarea';
import { AutocompleteInput } from '../../../shared/ui/AutocompleteInput/AutocompleteInput';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getPriceByIdRequest,
  createPriceRequest,
  updatePriceRequest,
  getCategoriesForAutocompleteRequest,
} from '../api/pricesApi';
import styles from './PriceFormPage.module.css';

export function PriceFormPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { priceId } = useParams();

  const isEditMode = Boolean(priceId);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [formData, setFormData] = useState({
    category_name: '',
    supplier: 'тест',
    region: 'тест',
    price_text: '',
  });

  // Храним полный объект категории для autocomplete
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const loadPrice = useCallback(async () => {
    if (!priceId) return;

    setIsLoading(true);
    try {
      const data = await getPriceByIdRequest(priceId);
      setFormData({
        category_name: data.category || '',
        supplier: data.supplier || 'тест',
        region: data.region || 'тест',
        price_text: data.price_text || '',
      });

      // Сохраняем полный объект категории для autocomplete
      // API возвращает category как строку (название)
      if (data.category) {
        setSelectedCategory({
          id: data.category,
          name: data.category,
        });
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [priceId]);

  useEffect(() => {
    if (isEditMode && priceId) {
      loadPrice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceId, isEditMode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category_name.trim()) {
      newErrors.category = 'Введите категорию';
    }

    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Введите поставщика';
    }

    if (!formData.region.trim()) {
      newErrors.region = 'Введите регион';
    }

    if (!formData.price_text.trim()) {
      newErrors.price_text = 'Введите текст прайса';
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

  const handleSubmit = async (stayOnPage = false) => {
    if (!validateForm()) {
      notificationsRef.current?.error('Исправьте ошибки в форме');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        category: formData.category_name.trim(),
        supplier: formData.supplier.trim(),
        region: formData.region.trim(),
        price_text: formData.price_text.trim(),
      };

      if (isEditMode) {
        await updatePriceRequest(priceId, payload);
        notificationsRef.current?.info('Прайс обновлен');

        if (stayOnPage) {
          // Обновляем данные формы из ответа
        }
      } else {
        await createPriceRequest(payload);
        notificationsRef.current?.info('Прайс создан');

        if (stayOnPage) {
          // Очищаем форму для создания нового прайса
          setFormData({
            category_name: '',
            supplier: 'тест',
            region: 'тест',
            price_text: '',
          });
          setSelectedCategory(null);
        }
      }

      if (!stayOnPage) {
        navigate('/actualization/prices');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(isEditMode ? `/actualization/prices/${priceId}` : '/actualization/prices');
  };

  return (
    <FormPage
      title={isEditMode ? 'Редактирование прайса' : 'Создание прайса'}
      backUrl={isEditMode ? `/actualization/prices/${priceId}` : '/actualization/prices'}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onSubmit={() => handleSubmit(false)}
      onSubmitAndStay={() => handleSubmit(true)}
      showSubmitStay={true}
      submitText={isEditMode ? 'Сохранить' : 'Создать'}
    >
      <FormSection
        icon={<FiFileText />}
        iconVariant="primary"
        title="Основная информация"
        description="Данные о прайсе"
      >
        <FormGrid columns={2}>
          <div className={styles.priceFormField}>
            <AutocompleteInput
              label="Категория"
              value={formData.category_name}
              onChange={(value) => handleChange('category_name', value)}
              fetchOptions={getCategoriesForAutocompleteRequest}
              placeholder="Начните ввод для поиска категории..."
              selectedOption={selectedCategory}
              error={errors.category}
              getOptionValue={(option) => option.name}
            />
            {errors.category && (
              <span className={styles.priceFormError}>{errors.category}</span>
            )}
          </div>

          <div className={styles.priceFormField}>
            <label className={styles.priceFormLabel}>
              Поставщик <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
              placeholder="Введите поставщика"
              className={errors.supplier ? 'input-error' : ''}
              disabled={isSubmitting}
            />
            {errors.supplier && (
              <span className={styles.priceFormError}>{errors.supplier}</span>
            )}
          </div>

          <div className={styles.priceFormField}>
            <label className={styles.priceFormLabel}>
              Регион <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => handleChange('region', e.target.value)}
              placeholder="Введите регион"
              className={errors.region ? 'input-error' : ''}
              disabled={isSubmitting}
            />
            {errors.region && (
              <span className={styles.priceFormError}>{errors.region}</span>
            )}
          </div>

          <div className={`${styles.priceFormField} ${styles.priceFormFieldFull}`}>
            <FormTextarea
              label="Текст прайса"
              value={formData.price_text}
              onChange={(e) => handleChange('price_text', e.target.value)}
              placeholder="Введите текст прайса"
              rows={8}
              error={errors.price_text}
            />
            {errors.price_text && (
              <span className={styles.priceFormError}>{errors.price_text}</span>
            )}
          </div>
        </FormGrid>
      </FormSection>
    </FormPage>
  );
}
