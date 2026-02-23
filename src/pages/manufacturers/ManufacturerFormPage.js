import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import {
  getManufacturerByIdRequest,
  createManufacturerRequest,
  updateManufacturerRequest,
} from './api/manufacturersApi';
import './ManufacturerFormPage.css';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manufacturerId, isEditMode]);

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
        description: formData.description.trim() || null,
      };

      if (isEditMode) {
        await updateManufacturerRequest(manufacturerId, payload);
        notificationsRef.current?.info('Производитель обновлен');
      } else {
        await createManufacturerRequest(payload);
        notificationsRef.current?.info('Производитель создан');
      }

      navigate('/catalog/manufacturers');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="manufacturer-form-page">
        <div className="manufacturer-form-page__loading">
          <div className="loading-spinner" />
          <p>Загрузка данных производителя...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="manufacturer-form-page">
      <header className="manufacturer-form-page__header">
        <Button variant="ghost" onClick={() => navigate(isEditMode ? `/catalog/manufacturers/${manufacturerId}` : '/catalog/manufacturers')} className="back-button">
          ← Назад
        </Button>
        <h1 className="manufacturer-form-page__title">
          {isEditMode ? 'Редактирование производителя' : 'Создание производителя'}
        </h1>
      </header>

      <form className="manufacturer-form-page__form" onSubmit={handleSubmit}>
        <div className="manufacturer-form">
          <div className="manufacturer-form__section">
            <div className="manufacturer-form__section-header">
              <div className="manufacturer-form__section-icon manufacturer-form__section-icon--primary">
                <span>🏭</span>
              </div>
              <div>
                <h2 className="manufacturer-form__section-title">Основная информация</h2>
                <p className="manufacturer-form__section-description">Данные о производителе</p>
              </div>
            </div>

            <div className="manufacturer-form__grid">
              <div className="manufacturer-form__field">
                <label className="manufacturer-form__label">
                  Название <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Введите название производителя"
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && (
                  <span className="manufacturer-form__error">{errors.name}</span>
                )}
              </div>

              <div className="manufacturer-form__field manufacturer-form__field--full">
                <label className="manufacturer-form__label">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Введите описание производителя"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="manufacturer-form-page__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/manufacturers')}
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
            {isEditMode ? 'Сохранить изменения' : 'Создать производителя'}
          </Button>
        </div>
      </form>
    </section>
  );
}
