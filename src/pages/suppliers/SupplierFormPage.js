import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import {
  getSupplierByIdRequest,
  createSupplierRequest,
  updateSupplierRequest,
} from './api/suppliersApi';
import './SupplierFormPage.css';

export function SupplierFormPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { supplierId } = useParams();

  const isEditMode = Boolean(supplierId);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    phone: '',
  });

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const loadSupplier = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSupplierByIdRequest(supplierId);
      setFormData({
        name: data.name || '',
        contact_email: data.contact_email || '',
        phone: data.phone || '',
      });
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    if (isEditMode && supplierId) {
      loadSupplier();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId, isEditMode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите название поставщика';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Введите корректный email';
    }

    if (formData.phone && !/^[\d\s()+-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Введите корректный номер телефона';
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
        contact_email: formData.contact_email.trim() || null,
        phone: formData.phone.trim() || null,
      };

      if (isEditMode) {
        const responseData = await updateSupplierRequest(supplierId, payload);
        notificationsRef.current?.info('Поставщик обновлен');
        
        if (stayOnPage) {
          // Обновляем данные формы из ответа
          if (responseData) {
            setFormData({
              name: responseData.name || formData.name,
              contact_email: responseData.contact_email || formData.contact_email,
              phone: responseData.phone || formData.phone,
            });
          }
        }
      } else {
        const responseData = await createSupplierRequest(payload);
        notificationsRef.current?.info('Поставщик создан');
        
        if (stayOnPage) {
          // После создания перенаправляем на страницу редактирования с новым ID
          const newSupplierId = responseData?.id;
          if (newSupplierId) {
            navigate(`/suppliers/${newSupplierId}`);
          }
        }
      }

      if (!stayOnPage) {
        navigate('/suppliers');
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
      <section className="supplier-form-page">
        <div className="supplier-form-page__loading">
          <div className="loading-spinner" />
          <p>Загрузка данных поставщика...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="supplier-form-page">
      <header className="supplier-form-page__header">
        <Button variant="ghost" onClick={() => navigate(isEditMode ? `/suppliers/${supplierId}` : '/suppliers')} className="back-button">
          ← Назад
        </Button>
        <h1 className="supplier-form-page__title">
          {isEditMode ? 'Редактирование поставщика' : 'Создание поставщика'}
        </h1>
      </header>

      <form className="supplier-form-page__form" onSubmit={handleSubmit}>
        <div className="supplier-form">
          <div className="supplier-form__section">
            <div className="supplier-form__section-header">
              <div className="supplier-form__section-icon supplier-form__section-icon--primary">
                <span>📦</span>
              </div>
              <div>
                <h2 className="supplier-form__section-title">Основная информация</h2>
                <p className="supplier-form__section-description">Данные о поставщике</p>
              </div>
            </div>

            <div className="supplier-form__grid">
              <div className="supplier-form__field">
                <label className="supplier-form__label">
                  Название <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Введите название поставщика"
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && (
                  <span className="supplier-form__error">{errors.name}</span>
                )}
              </div>

              <div className="supplier-form__field">
                <label className="supplier-form__label">
                  Email для связи
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  placeholder="supplier@example.com"
                  className={errors.contact_email ? 'input-error' : ''}
                />
                {errors.contact_email && (
                  <span className="supplier-form__error">{errors.contact_email}</span>
                )}
              </div>

              <div className="supplier-form__field">
                <label className="supplier-form__label">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className={errors.phone ? 'input-error' : ''}
                />
                {errors.phone && (
                  <span className="supplier-form__error">{errors.phone}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="supplier-form-page__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/suppliers')}
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
        </div>
      </form>
    </section>
  );
}
