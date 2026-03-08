import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSearch, FiSave } from 'react-icons/fi';
import { FormPage } from '../../../shared/ui/FormPage';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  createSeoRequest,
  updateSeoRequest,
} from '../api/cmsApi';
import styles from './SeoFormPage.module.css';

export function SeoFormPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { seoId } = useParams();

  const isEditMode = Boolean(seoId);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [formData, setFormData] = useState({
    page_slug: '',
    title: '',
    description: '',
    keywords: '',
    og_image_id: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (stayOnPage = false) => {
    if (!validateForm()) {
      notificationsRef.current?.error('Исправьте ошибки в форме');
      return;
    }

    setIsSubmitting(true);

    try {
      const keywordsArray = formData.keywords
        ? formData.keywords.split(',').map(k => k.trim()).filter(k => k)
        : [];

      const payload = {
        page_slug: formData.page_slug,
        title: formData.title || null,
        description: formData.description || null,
        keywords: keywordsArray,
        og_image_id: formData.og_image_id ? parseInt(formData.og_image_id) : null,
      };

      if (isEditMode) {
        await updateSeoRequest(seoId, payload);
        notificationsRef.current?.info('SEO данные обновлены');
      } else {
        await createSeoRequest(payload);
        notificationsRef.current?.info('SEO данные созданы');
      }

      if (!stayOnPage) {
        navigate('/cms/seo');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.page_slug) {
      newErrors.page_slug = 'Введите slug страницы';
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

  const handleBack = () => {
    navigate(isEditMode ? `/cms/seo/${seoId}` : '/cms/seo');
  };

  return (
    <FormPage
      title={isEditMode ? 'Редактирование SEO данных' : 'Создание SEO данных'}
      backUrl={isEditMode ? `/cms/seo/${seoId}` : '/cms/seo'}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onSubmit={() => handleSubmit(false)}
      onSubmitAndStay={() => handleSubmit(true)}
      showSubmitStay={true}
      submitText={isEditMode ? 'Сохранить' : 'Создать'}
    >
      <FormSection
        icon={<FiSearch />}
        iconVariant="primary"
        title="Параметры SEO"
        description="Укажите SEO данные для страницы"
      >
        <FormGrid columns={2}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>
              Slug страницы *
            </label>
            <input
              type="text"
              value={formData.page_slug}
              onChange={(e) => handleChange('page_slug', e.target.value)}
              placeholder="about-us"
              className={errors.page_slug ? styles.inputError : ''}
              disabled={isEditMode}
            />
            {errors.page_slug && (
              <span className={styles.formError}>{errors.page_slug}</span>
            )}
            {isEditMode && (
              <span className={styles.formHint}>
                Slug нельзя изменить после создания
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>
              SEO заголовок
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="О компании - Название магазина"
            />
            <span className={styles.formHint}>
              Рекомендуется до 60 символов
            </span>
          </div>

          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>
              SEO описание
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Информация о нашей компании..."
              className={styles.formTextarea}
            />
            <span className={styles.formHint}>
              Рекомендуется до 160 символов
            </span>
          </div>

          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>
              Ключевые слова
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => handleChange('keywords', e.target.value)}
              placeholder="компания, магазин, о нас"
            />
            <span className={styles.formHint}>
              Перечислите через запятую
            </span>
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>
              OG Image ID
            </label>
            <input
              type="number"
              value={formData.og_image_id}
              onChange={(e) => handleChange('og_image_id', e.target.value)}
              placeholder="1"
              min="0"
            />
            <span className={styles.formHint}>
              ID изображения для социальных сетей
            </span>
          </div>
        </FormGrid>
      </FormSection>
    </FormPage>
  );
}
