import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiFlag } from 'react-icons/fi';
import { FormPage } from '../../../shared/ui/FormPage';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getFeatureFlagByIdRequest,
  createFeatureFlagRequest,
  updateFeatureFlagRequest,
} from '../api/cmsApi';
import styles from './FeatureFlagFormPage.module.css';

export function FeatureFlagFormPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { flagId } = useParams();

  const isEditMode = Boolean(flagId);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [formData, setFormData] = useState({
    key: '',
    description: '',
    enabled: false,
  });

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode && flagId) {
      getFeatureFlagByIdRequest(flagId)
        .then((data) => {
          setFormData({
            key: data.key || '',
            description: data.description || '',
            enabled: data.enabled ?? false,
          });
        })
        .catch((error) => {
          const message = getApiErrorMessage(error);
          notificationsRef.current?.error(message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [flagId, isEditMode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.key) {
      newErrors.key = 'Введите ключ флага';
    } else if (!/^[a-z0-9_]+$/.test(formData.key)) {
      newErrors.key = 'Ключ должен содержать только латиницу, цифры и подчеркивание';
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
        key: formData.key,
        description: formData.description || null,
        enabled: formData.enabled,
      };

      if (isEditMode) {
        await updateFeatureFlagRequest(flagId, payload);
        notificationsRef.current?.info('Feature flag обновлен');
      } else {
        await createFeatureFlagRequest(payload);
        notificationsRef.current?.info('Feature flag создан');
      }

      if (!stayOnPage) {
        navigate('/cms/feature-flags');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(isEditMode ? `/cms/feature-flags/${flagId}` : '/cms/feature-flags');
  };

  return (
    <FormPage
      title={isEditMode ? 'Редактирование feature flag' : 'Создание feature flag'}
      backUrl={isEditMode ? `/cms/feature-flags/${flagId}` : '/cms/feature-flags'}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onSubmit={() => handleSubmit(false)}
      onSubmitAndStay={() => handleSubmit(true)}
      showSubmitStay={true}
      submitText={isEditMode ? 'Сохранить' : 'Создать'}
    >
      <FormSection
        icon={<FiFlag />}
        iconVariant="primary"
        title="Параметры feature flag"
        description="Укажите данные флага функциональности"
      >
        <FormGrid columns={2}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>
              Ключ *
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => handleChange('key', e.target.value)}
              placeholder="new_checkout_enabled"
              className={errors.key ? styles.inputError : ''}
              disabled={isEditMode}
            />
            {errors.key && (
              <span className={styles.formError}>{errors.key}</span>
            )}
            {isEditMode && (
              <span className={styles.formHint}>
                Ключ нельзя изменить после создания
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.formCheckbox}>
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
              />
              <span>Включен</span>
            </label>
            <span className={styles.formHint}>
              Если включен, функциональность активна
            </span>
          </div>

          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>
              Описание
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Включить новый процесс оформления заказа"
              className={styles.formTextarea}
            />
            <span className={styles.formHint}>
              Описание назначения флага
            </span>
          </div>
        </FormGrid>
      </FormSection>
    </FormPage>
  );
}
