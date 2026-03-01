import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormPage } from '../../../shared/ui/FormPage';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
import { AutocompleteInput } from '../../../shared/ui/AutocompleteInput/AutocompleteInput';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getProductTypeByIdRequest,
  createProductTypeRequest,
  updateProductTypeRequest,
  getProductTypesForAutocompleteRequest,
} from '../api/productTypesApi';
import styles from './ProductTypeFormPage.module.css';

export function ProductTypeFormPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { productTypeId } = useParams();

  const isEditMode = Boolean(productTypeId);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
  });

  // Храним полный объект для autocomplete
  const [selectedParent, setSelectedParent] = useState(null);

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const loadProductType = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProductTypeByIdRequest(productTypeId);
      setFormData({
        name: data.name || '',
        parent_id: data.parent_id || '',
      });
      // Сохраняем полный объект для autocomplete
      if (data.parent) {
        setSelectedParent(data.parent);
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [productTypeId]);

  useEffect(() => {
    if (isEditMode && productTypeId) {
      loadProductType();
    }
  }, [productTypeId, isEditMode, loadProductType]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите название типа продукта';
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
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
      };

      if (isEditMode) {
        const responseData = await updateProductTypeRequest(productTypeId, payload);
        notificationsRef.current?.info('Тип продукта обновлен');

        if (stayOnPage && responseData) {
          setFormData({
            name: responseData.name || formData.name,
            parent_id: responseData.parent_id || formData.parent_id,
          });
          setSelectedParent(responseData.parent || selectedParent);
        }
      } else {
        const responseData = await createProductTypeRequest(payload);
        notificationsRef.current?.info('Тип продукта создан');

        if (stayOnPage) {
          const newProductTypeId = responseData?.id;
          if (newProductTypeId) {
            navigate(`/catalog/device_type/${newProductTypeId}`);
          }
        }
      }

      if (!stayOnPage) {
        navigate('/catalog/device_type');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(isEditMode ? `/catalog/device_type/${productTypeId}` : '/catalog/device_type');
  };

  return (
    <FormPage
      title={isEditMode ? 'Редактирование типа продукта' : 'Создание типа продукта'}
      backUrl={isEditMode ? `/catalog/device_type/${productTypeId}` : '/catalog/device_type'}
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
        description="Данные о типе продукта"
      >
        <FormGrid columns={2}>
          <div className={styles.productTypeFormField}>
            <label className={styles.productTypeFormLabel}>
              Название <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Введите название типа продукта"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && (
              <span className={styles.productTypeFormError}>{errors.name}</span>
            )}
          </div>

          <div className={styles.productTypeFormField}>
            <AutocompleteInput
              label="Родительский тип"
              value={formData.parent_id}
              onChange={(value) => handleChange('parent_id', value)}
              fetchOptions={getProductTypesForAutocompleteRequest}
              placeholder="Начните ввод для поиска родительского типа..."
              selectedOption={selectedParent}
            />
            <span className={styles.productTypeFormHint}>
              Укажите родительский тип для создания иерархии
            </span>
          </div>
        </FormGrid>
      </FormSection>
    </FormPage>
  );
}
