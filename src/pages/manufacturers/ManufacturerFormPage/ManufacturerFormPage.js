import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormPage } from '../../../shared/ui/FormPage';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
import { FormTextarea } from '../../../shared/ui/FormTextarea/FormTextarea';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getManufacturerByIdRequest,
  createManufacturerRequest,
  updateManufacturerRequest,
} from '../api/manufacturersApi';
import styles from './ManufacturerFormPage.module.css';

export function ManufacturerFormPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { manufacturerId } = useParams();

  const isEditMode = Boolean(manufacturerId);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const loadManufacturer = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getManufacturerByIdRequest(manufacturerId);
      setFormData({
        name: data.name || '',
        description: data.description || '',
      });
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [manufacturerId]);

  useEffect(() => {
    if (isEditMode && manufacturerId) {
      loadManufacturer();
    }
  }, [manufacturerId, isEditMode, loadManufacturer]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите название производителя';
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
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      };

      if (isEditMode) {
        const responseData = await updateManufacturerRequest(manufacturerId, payload);
        notificationsRef.current?.info('Производитель обновлен');

        if (stayOnPage && responseData) {
          setFormData({
            name: responseData.name || formData.name,
            description: responseData.description || formData.description,
          });
        }
      } else {
        const responseData = await createManufacturerRequest(payload);
        notificationsRef.current?.info('Производитель создан');

        if (stayOnPage) {
          const newManufacturerId = responseData?.id;
          if (newManufacturerId) {
            navigate(`/catalog/manufacturers/${newManufacturerId}`);
          }
        }
      }

      if (!stayOnPage) {
        navigate('/catalog/manufacturers');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(isEditMode ? `/catalog/manufacturers/${manufacturerId}` : '/catalog/manufacturers');
  };

  return (
    <FormPage
      title={isEditMode ? 'Редактирование производителя' : 'Создание производителя'}
      backUrl={isEditMode ? `/catalog/manufacturers/${manufacturerId}` : '/catalog/manufacturers'}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onSubmit={() => handleSubmit(false)}
      onSubmitAndStay={() => handleSubmit(true)}
      showSubmitStay={true}
      submitText={isEditMode ? 'Сохранить' : 'Создать'}
    >
      <FormSection
        icon={<span>🏭</span>}
        iconVariant="primary"
        title="Основная информация"
        description="Данные о производителе"
      >
        <FormGrid columns={2}>
          <div className={styles.manufacturerFormField}>
            <label className={styles.manufacturerFormLabel}>
              Название <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Введите название производителя"
              className={errors.name ? 'inputError' : ''}
            />
            {errors.name && (
              <span className={styles.manufacturerFormError}>{errors.name}</span>
            )}
          </div>

          <div className={`${styles.manufacturerFormField} ${styles.manufacturerFormFieldFull}`}>
            <FormTextarea
              label="Описание"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Введите описание производителя"
              rows={4}
            />
          </div>
        </FormGrid>
      </FormSection>
    </FormPage>
  );
}
