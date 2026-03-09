import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiFileText } from 'react-icons/fi';
import { FormPage } from '../../../shared/ui/FormPage';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getPageByIdRequest,
  createPageRequest,
  updatePageRequest,
} from '../api/cmsApi';
import styles from './PageFormPage.module.css';

const BLOCK_TYPES = [
  { value: 'text', label: 'Текст' },
  { value: 'image', label: 'Изображение' },
  { value: 'video', label: 'Видео' },
  { value: 'html', label: 'HTML' },
  { value: 'accordion', label: 'Аккордеон' },
  { value: 'features', label: 'Преимущества' },
];

export function PageFormPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { pageId } = useParams();

  const isEditMode = Boolean(pageId);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    is_published: false,
    blocks_json: '[]',
  });

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode && pageId) {
      getPageByIdRequest(pageId)
        .then((data) => {
          setFormData({
            slug: data.slug || '',
            title: data.title || '',
            is_published: data.is_published || false,
            blocks_json: data.blocks ? JSON.stringify(data.blocks, null, 2) : '[]',
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
  }, [pageId, isEditMode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.slug) {
      newErrors.slug = 'Введите slug';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug должен содержать только латиницу, цифры и дефис';
    }

    if (!formData.title) {
      newErrors.title = 'Введите заголовок';
    }

    try {
      JSON.parse(formData.blocks_json || '[]');
    } catch {
      newErrors.blocks_json = 'Некорректный JSON блоков';
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
        slug: formData.slug,
        title: formData.title,
        is_published: formData.is_published,
        blocks: formData.blocks_json ? JSON.parse(formData.blocks_json) : [],
      };

      if (isEditMode) {
        await updatePageRequest(pageId, payload);
        notificationsRef.current?.info('Страница обновлена');
      } else {
        const responseData = await createPageRequest(payload);
        notificationsRef.current?.info('Страница создана');

        if (stayOnPage) {
          const newPageId = responseData?.id;
          if (newPageId) {
            navigate(`/cms/pages/${newPageId}`);
          }
        }
      }

      if (!stayOnPage) {
        navigate('/cms/pages');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(isEditMode ? `/cms/pages/${pageId}` : '/cms/pages');
  };

  return (
    <FormPage
      title={isEditMode ? 'Редактирование страницы' : 'Создание страницы'}
      backUrl={isEditMode ? `/cms/pages/${pageId}` : '/cms/pages'}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onSubmit={() => handleSubmit(false)}
      onSubmitAndStay={() => handleSubmit(true)}
      showSubmitStay={true}
      submitText={isEditMode ? 'Сохранить' : 'Создать'}
    >
      <FormSection
        icon={<FiFileText />}
        iconVariant="primary"
        title="Параметры страницы"
        description="Укажите основные параметры страницы"
      >
        <FormGrid columns={2}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="about-us"
              className={errors.slug ? styles.inputError : ''}
              disabled={isEditMode}
            />
            {errors.slug && (
              <span className={styles.formError}>{errors.slug}</span>
            )}
            <span className={styles.formHint}>
              URL идентификатор (латиница, цифры и дефис)
            </span>
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>
              Заголовок *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="О компании"
              className={errors.title ? styles.inputError : ''}
            />
            {errors.title && (
              <span className={styles.formError}>{errors.title}</span>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.formCheckbox}>
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => handleChange('is_published', e.target.checked)}
              />
              <span>Опубликована</span>
            </label>
          </div>

          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>
              Блоки (JSON)
            </label>
            <textarea
              rows={10}
              value={formData.blocks_json}
              onChange={(e) => handleChange('blocks_json', e.target.value)}
              placeholder='[{"block_type": "text", "data": {"content": "Текст"}, "order": 0}]'
              className={`${styles.formTextarea}${errors.blocks_json ? ` ${styles.inputError}` : ''}`}
            />
            {errors.blocks_json && (
              <span className={styles.formError}>{errors.blocks_json}</span>
            )}
            <span className={styles.formHint}>
              Типы блоков: {BLOCK_TYPES.map(t => t.label).join(', ')}
            </span>
          </div>
        </FormGrid>
      </FormSection>
    </FormPage>
  );
}
