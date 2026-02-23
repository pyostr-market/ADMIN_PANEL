import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import {
  getAttributeByIdRequest,
  createAttributeRequest,
  updateAttributeRequest,
} from './api/attributesApi';
import './AttributeFormPage.css';

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
        value: formData.value.trim(),
        is_filterable: formData.is_filterable,
      };

      if (isEditMode) {
        await updateAttributeRequest(attributeId, payload);
        notificationsRef.current?.info('Атрибут обновлен');
      } else {
        await createAttributeRequest(payload);
        notificationsRef.current?.info('Атрибут создан');
      }

      navigate('/catalog/attributes');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="attribute-form-page">
        <div className="attribute-form-page__loading">
          <div className="loading-spinner" />
          <p>Загрузка данных атрибута...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="attribute-form-page">
      <header className="attribute-form-page__header">
        <Button variant="ghost" onClick={() => navigate(isEditMode ? `/catalog/attributes/${attributeId}` : '/catalog/attributes')} className="back-button">
          ← Назад
        </Button>
        <h1 className="attribute-form-page__title">
          {isEditMode ? 'Редактирование атрибута' : 'Создание атрибута'}
        </h1>
      </header>

      <form className="attribute-form-page__form" onSubmit={handleSubmit}>
        <div className="attribute-form">
          <div className="attribute-form__section">
            <div className="attribute-form__section-header">
              <div className="attribute-form__section-icon attribute-form__section-icon--primary">
                <span>🏷️</span>
              </div>
              <div>
                <h2 className="attribute-form__section-title">Основная информация</h2>
                <p className="attribute-form__section-description">Данные об атрибуте продукта</p>
              </div>
            </div>

            <div className="attribute-form__grid">
              <div className="attribute-form__field">
                <label className="attribute-form__label">
                  Название <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Введите название атрибута"
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && (
                  <span className="attribute-form__error">{errors.name}</span>
                )}
              </div>

              <div className="attribute-form__field">
                <label className="attribute-form__label">
                  Значение <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => handleChange('value', e.target.value)}
                  placeholder="Введите значение атрибута"
                  className={errors.value ? 'input-error' : ''}
                />
                {errors.value && (
                  <span className="attribute-form__error">{errors.value}</span>
                )}
              </div>

              <div className="attribute-form__field attribute-form__field--checkbox">
                <label className="attribute-form__checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_filterable}
                    onChange={() => handleCheckboxChange('is_filterable')}
                  />
                  <span>Использовать для фильтрации</span>
                </label>
                <span className="attribute-form__hint">
                  Атрибуты с этой опцией будут доступны в фильтрах каталога
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="attribute-form-page__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/catalog/attributes')}
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
            {isEditMode ? 'Сохранить изменения' : 'Создать атрибут'}
          </Button>
        </div>
      </form>
    </section>
  );
}
