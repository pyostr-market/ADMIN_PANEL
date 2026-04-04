import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormPage } from '../../../shared/ui/FormPage';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getAttributeByIdRequest,
  createAttributeRequest,
  updateAttributeRequest,
} from '../api/attributesApi';
import styles from './AttributeFormPage.module.css';

export function AttributeFormPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { attributeId } = useParams();

  const isEditMode = Boolean(attributeId);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [formData, setFormData] = useState({
    name: '',
    value: '',
    is_filterable: false,
    is_groupable: false,
  });

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const loadAttribute = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAttributeByIdRequest(attributeId);
      setFormData({
        name: data.name || '',
        value: data.value || '',
        is_filterable: data.is_filterable || false,
        is_groupable: data.is_groupable || false,
      });
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [attributeId]);

  useEffect(() => {
    if (isEditMode && attributeId) {
      loadAttribute();
    }
  }, [attributeId, isEditMode, loadAttribute]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите название атрибута';
    }

    if (!formData.value.trim()) {
      newErrors.value = 'Введите значение атрибута';
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

  const handleCheckboxChange = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
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
        name: formData.name.trim(),
        value: formData.value.trim(),
        is_filterable: formData.is_filterable,
        is_groupable: formData.is_groupable,
      };

      if (isEditMode) {
        const responseData = await updateAttributeRequest(attributeId, payload);
        notificationsRef.current?.info('Атрибут обновлен');

        if (stayOnPage && responseData) {
          setFormData({
            name: responseData.name || formData.name,
            value: responseData.value || formData.value,
            is_filterable: responseData.is_filterable !== undefined
              ? responseData.is_filterable
              : formData.is_filterable,
            is_groupable: responseData.is_groupable !== undefined
              ? responseData.is_groupable
              : formData.is_groupable,
          });
        }
      } else {
        const responseData = await createAttributeRequest(payload);
        notificationsRef.current?.info('Атрибут создан');

        if (stayOnPage) {
          const newAttributeId = responseData?.id;
          if (newAttributeId) {
            navigate(`/catalog/attributes/${newAttributeId}`);
          }
        }
      }

      if (!stayOnPage) {
        navigate('/catalog/attributes');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(isEditMode ? `/catalog/attributes/${attributeId}` : '/catalog/attributes');
  };

  return (
    <FormPage
      title={isEditMode ? 'Редактирование атрибута' : 'Создание атрибута'}
      backUrl={isEditMode ? `/catalog/attributes/${attributeId}` : '/catalog/attributes'}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onSubmit={() => handleSubmit(false)}
      onSubmitAndStay={() => handleSubmit(true)}
      showSubmitStay={true}
      submitText={isEditMode ? 'Сохранить' : 'Создать'}
    >
      <FormSection
        icon={<span>🏷️</span>}
        iconVariant="primary"
        title="Основная информация"
        description="Данные об атрибуте продукта"
      >
        <FormGrid columns={2}>
          <div className={styles.attributeFormField}>
            <label className={styles.attributeFormLabel}>
              Название <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Введите название атрибута"
              className={errors.name ? styles.inputError : ''}
            />
            {errors.name && (
              <span className={styles.attributeFormError}>{errors.name}</span>
            )}
          </div>

          <div className={styles.attributeFormField}>
            <label className={styles.attributeFormLabel}>
              Значение <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => handleChange('value', e.target.value)}
              placeholder="Введите значение атрибута"
              className={errors.value ? styles.inputError : ''}
            />
            {errors.value && (
              <span className={styles.attributeFormError}>{errors.value}</span>
            )}
          </div>

          <div className={`${styles.attributeFormField} ${styles.attributeFormFieldFull}`}>
            <label className={styles.attributeFormCheckboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_filterable}
                onChange={() => handleCheckboxChange('is_filterable')}
              />
              <span>Использовать для фильтрации</span>
            </label>
            <span className={styles.attributeFormHint}>
              Атрибуты с этой опцией будут доступны в фильтрах каталога
            </span>
          </div>

          <div className={`${styles.attributeFormField} ${styles.attributeFormFieldFull}`}>
            <label className={styles.attributeFormCheckboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_groupable}
                onChange={() => handleCheckboxChange('is_groupable')}
              />
              <span>Группировать</span>
            </label>
            <span className={styles.attributeFormHint}>
              Атрибуты с этой опцией будут доступны для группировки в каталоге
            </span>
          </div>
        </FormGrid>
      </FormSection>
    </FormPage>
  );
}
