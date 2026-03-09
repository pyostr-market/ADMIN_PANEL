import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiHelpCircle } from 'react-icons/fi';
import { FormPage } from '../../../shared/ui/FormPage';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getFaqByIdRequest,
  createFaqRequest,
  updateFaqRequest,
} from '../api/cmsApi';
import styles from './FaqFormPage.module.css';

export function FaqFormPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { faqId } = useParams();

  const isEditMode = Boolean(faqId);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    order: '0',
    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const loadFaq = useEffect(() => {
    if (isEditMode && faqId) {
      getFaqByIdRequest(faqId)
        .then((data) => {
          setFormData({
            question: data.question || '',
            answer: data.answer || '',
            category: data.category || '',
            order: String(data.order || 0),
            is_active: data.is_active ?? true,
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
  }, [faqId, isEditMode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.question) {
      newErrors.question = 'Введите вопрос';
    }

    if (!formData.answer) {
      newErrors.answer = 'Введите ответ';
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
        question: formData.question,
        answer: formData.answer,
        category: formData.category || null,
        order: parseInt(formData.order) || 0,
        is_active: formData.is_active,
      };

      if (isEditMode) {
        await updateFaqRequest(faqId, payload);
        notificationsRef.current?.info('FAQ обновлен');
      } else {
        await createFaqRequest(payload);
        notificationsRef.current?.info('FAQ создан');
      }

      if (!stayOnPage) {
        navigate('/cms/faq');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(isEditMode ? `/cms/faq/${faqId}` : '/cms/faq');
  };

  return (
    <FormPage
      title={isEditMode ? 'Редактирование FAQ' : 'Создание FAQ'}
      backUrl={isEditMode ? `/cms/faq/${faqId}` : '/cms/faq'}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onSubmit={() => handleSubmit(false)}
      onSubmitAndStay={() => handleSubmit(true)}
      showSubmitStay={true}
      submitText={isEditMode ? 'Сохранить' : 'Создать'}
    >
      <FormSection
        icon={<FiHelpCircle />}
        iconVariant="primary"
        title="Параметры FAQ"
        description="Укажите вопрос и ответ"
      >
        <FormGrid columns={2}>
          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>
              Вопрос *
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => handleChange('question', e.target.value)}
              placeholder="Как оформить заказ?"
              className={errors.question ? styles.inputError : ''}
            />
            {errors.question && (
              <span className={styles.formError}>{errors.question}</span>
            )}
          </div>

          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>
              Ответ *
            </label>
            <textarea
              rows={6}
              value={formData.answer}
              onChange={(e) => handleChange('answer', e.target.value)}
              placeholder="Для оформления заказа..."
              className={`${styles.formTextarea}${errors.answer ? ` ${styles.inputError}` : ''}`}
            />
            {errors.answer && (
              <span className={styles.formError}>{errors.answer}</span>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>
              Категория
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="Заказы"
            />
            <span className={styles.formHint}>
              Оставьте пустым для общей категории
            </span>
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>
              Порядок
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => handleChange('order', e.target.value)}
              placeholder="0"
              min="0"
            />
            <span className={styles.formHint}>
              Чем меньше число, тем выше в списке
            </span>
          </div>

          <div className={styles.formField}>
            <label className={styles.formCheckbox}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
              />
              <span>Активен</span>
            </label>
          </div>
        </FormGrid>
      </FormSection>
    </FormPage>
  );
}
