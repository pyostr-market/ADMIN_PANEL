import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button/Button';
import { PageHeader } from '../../shared/ui/PageHeader/PageHeader';
import { FormSection } from '../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../shared/ui/FormGrid/FormGrid';
import { PageActions } from '../../shared/ui/PageActions/PageActions';
import { LoadingState } from '../../shared/ui/LoadingState/LoadingState';
import { AutocompleteInput } from '../../shared/ui/AutocompleteInput/AutocompleteInput';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import {
  getProductTypeByIdRequest,
  createProductTypeRequest,
  updateProductTypeRequest,
  getProductTypesForAutocompleteRequest,
} from './api/productTypesApi';
import './ProductTypeFormPage.css';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productTypeId, isEditMode]);

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
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
      };

      if (isEditMode) {
        const responseData = await updateProductTypeRequest(productTypeId, payload);
        notificationsRef.current?.info('Тип продукта обновлен');

        if (stayOnPage) {
          if (responseData) {
            setFormData({
              name: responseData.name || formData.name,
              parent_id: responseData.parent_id || formData.parent_id,
            });
            setSelectedParent(responseData.parent || selectedParent);
          }
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

  if (isLoading) {
    return (
      <section className="product-type-form-page">
        <LoadingState message="Загрузка данных типа продукта..." size="lg" />
      </section>
    );
  }

  return (
    <section className="product-type-form-page">
      <PageHeader
        title={isEditMode ? 'Редактирование типа продукта' : 'Создание типа продукта'}
        onBack={() => navigate(isEditMode ? `/catalog/device_type/${productTypeId}` : '/catalog/device_type')}
      />

      <form className="product-type-form-page__form" onSubmit={handleSubmit}>
        <FormSection
          icon={<span>🏷️</span>}
          iconVariant="primary"
          title="Основная информация"
          description="Данные о типе продукта"
        >
          <FormGrid columns={2}>
            <div className="product-type-form__field">
              <label className="product-type-form__label">
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
                <span className="product-type-form__error">{errors.name}</span>
              )}
            </div>

            <div className="product-type-form__field">
              <AutocompleteInput
                label="Родительский тип"
                value={formData.parent_id}
                onChange={(value) => handleChange('parent_id', value)}
                fetchOptions={getProductTypesForAutocompleteRequest}
                placeholder="Начните ввод для поиска родительского типа..."
                selectedOption={selectedParent}
              />
              <span className="product-type-form__hint">
                Укажите родительский тип для создания иерархии
              </span>
            </div>
          </FormGrid>
        </FormSection>

        <PageActions>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/catalog/device_type')}
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
