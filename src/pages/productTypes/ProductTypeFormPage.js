import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import {
  getProductTypeByIdRequest,
  createProductTypeRequest,
  updateProductTypeRequest,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        await updateProductTypeRequest(productTypeId, payload);
        notificationsRef.current?.info('Тип продукта обновлен');
      } else {
        await createProductTypeRequest(payload);
        notificationsRef.current?.info('Тип продукта создан');
      }

      navigate('/catalog/device_type');
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
        <div className="product-type-form-page__loading">
          <div className="loading-spinner" />
          <p>Загрузка данных типа продукта...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="product-type-form-page">
      <header className="product-type-form-page__header">
        <Button variant="ghost" onClick={() => navigate(isEditMode ? `/catalog/device_type/${productTypeId}` : '/catalog/device_type')} className="back-button">
          ← Назад
        </Button>
        <h1 className="product-type-form-page__title">
          {isEditMode ? 'Редактирование типа продукта' : 'Создание типа продукта'}
        </h1>
      </header>

      <form className="product-type-form-page__form" onSubmit={handleSubmit}>
        <div className="product-type-form">
          <div className="product-type-form__section">
            <div className="product-type-form__section-header">
              <div className="product-type-form__section-icon product-type-form__section-icon--primary">
                <span>🏷️</span>
              </div>
              <div>
                <h2 className="product-type-form__section-title">Основная информация</h2>
                <p className="product-type-form__section-description">Данные о типе продукта</p>
              </div>
            </div>

            <div className="product-type-form__grid">
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
                <label className="product-type-form__label">
                  Родительский тип
                </label>
                <input
                  type="number"
                  value={formData.parent_id}
                  onChange={(e) => handleChange('parent_id', e.target.value)}
                  placeholder="ID родительского типа (необязательно)"
                  min="1"
                />
                <span className="product-type-form__hint">
                  Укажите ID родительского типа для создания иерархии
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="product-type-form-page__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/product-types')}
            leftIcon={<FiX />}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<FiSave />}
            loading={isSubmitting}
            size="lg"
          >
            {isEditMode ? 'Сохранить изменения' : 'Создать тип продукта'}
          </Button>
        </div>
      </form>
    </section>
  );
}
