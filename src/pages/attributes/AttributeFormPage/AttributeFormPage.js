import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { PageHeader } from '../../../shared/ui/PageHeader/PageHeader';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
import { PageActions } from '../../../shared/ui/PageActions/PageActions';
import { LoadingState } from '../../../shared/ui/LoadingState/LoadingState';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributeId, isEditMode]);

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
        name: formData.name.trim(),
        value: formData.value.trim(),
        is_filterable: formData.is_filterable,
      };

      if (isEditMode) {
        const responseData = await updateAttributeRequest(attributeId, payload);
        notificationsRef.current?.info('Атрибут обновлен');

        if (stayOnPage) {
          if (responseData) {
            setFormData({
              name: responseData.name || formData.name,
              value: responseData.value || formData.value,
              is_filterable: responseData.is_filterable !== undefined
                ? responseData.is_filterable
                : formData.is_filterable,
            });
          }
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

  if (isLoading) {
    return (
      <section className={styles.attributeFormPage}>
        <LoadingState message="Загрузка данных атрибута..." size="lg" />
      </section>
    );
  }

  return (
    <section className={styles.attributeFormPage}>
      <PageHeader
        title={isEditMode ? 'Редактирование атрибута' : 'Создание атрибута'}
        onBack={() => navigate(isEditMode ? `/catalog/attributes/${attributeId}` : '/catalog/attributes')}
      />

      <form className={styles.attributeFormPageForm} onSubmit={handleSubmit}>
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
          </FormGrid>
        </FormSection>

        <PageActions>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/catalog/attributes')}
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
