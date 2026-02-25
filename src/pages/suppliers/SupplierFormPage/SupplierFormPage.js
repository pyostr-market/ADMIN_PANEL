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
  getSupplierByIdRequest,
  createSupplierRequest,
  updateSupplierRequest,
} from '../api/suppliersApi';
import styles from './SupplierFormPage.module.css';

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
      <section className={styles.supplierFormPage}>
        <LoadingState message="Загрузка данных поставщика..." size="lg" />
      </section>
    );
  }

  return (
    <section className={styles.supplierFormPage}>
      <PageHeader
        title={isEditMode ? 'Редактирование поставщика' : 'Создание поставщика'}
        onBack={() => navigate(isEditMode ? `/suppliers/${supplierId}` : '/suppliers')}
      />

      <form className={styles.supplierFormPageForm} onSubmit={handleSubmit}>
        <FormSection
          icon={<span>📦</span>}
          iconVariant="primary"
          title="Основная информация"
          description="Данные о поставщике"
        >
          <FormGrid columns={2}>
            <div className={styles.supplierFormField}>
              <label className={styles.supplierFormLabel}>
                Название <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Введите название поставщика"
                className={errors.name ? styles.inputError : ''}
              />
              {errors.name && (
                <span className={styles.supplierFormError}>{errors.name}</span>
              )}
            </div>

            <div className={styles.supplierFormField}>
              <label className={styles.supplierFormLabel}>
                Email для связи
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="supplier@example.com"
                className={errors.contact_email ? styles.inputError : ''}
              />
              {errors.contact_email && (
                <span className={styles.supplierFormError}>{errors.contact_email}</span>
              )}
            </div>

            <div className={styles.supplierFormField}>
              <label className={styles.supplierFormLabel}>
                Телефон
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+7 (999) 000-00-00"
                className={errors.phone ? styles.inputError : ''}
              />
              {errors.phone && (
                <span className={styles.supplierFormError}>{errors.phone}</span>
              )}
            </div>
          </FormGrid>
        </FormSection>

        <PageActions>
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
        </PageActions>
      </form>
    </section>
  );
}
