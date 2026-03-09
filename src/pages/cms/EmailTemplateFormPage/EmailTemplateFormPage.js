import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';
import { FormPage } from '../../../shared/ui/FormPage';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getEmailTemplateByIdRequest,
  createEmailTemplateRequest,
  updateEmailTemplateRequest,
} from '../api/cmsApi';
import styles from './EmailTemplateFormPage.module.css';

export function EmailTemplateFormPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { templateId } = useParams();

  const isEditMode = Boolean(templateId);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [formData, setFormData] = useState({
    key: '',
    subject: '',
    body_html: '',
    body_text: '',
    variables: '',
    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode && templateId) {
      getEmailTemplateByIdRequest(templateId)
        .then((data) => {
          setFormData({
            key: data.key || '',
            subject: data.subject || '',
            body_html: data.body_html || '',
            body_text: data.body_text || '',
            variables: Array.isArray(data.variables) ? data.variables.join(', ') : '',
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
  }, [templateId, isEditMode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.key) {
      newErrors.key = 'Введите ключ шаблона';
    } else if (!/^[a-z0-9_]+$/.test(formData.key)) {
      newErrors.key = 'Ключ должен содержать только латиницу, цифры и подчеркивание';
    }

    if (!formData.subject) {
      newErrors.subject = 'Введите тему письма';
    }

    if (!formData.body_html) {
      newErrors.body_html = 'Введите HTML тело письма';
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
      const variablesArray = formData.variables
        ? formData.variables.split(',').map(v => v.trim()).filter(v => v)
        : [];

      const payload = {
        key: formData.key,
        subject: formData.subject,
        body_html: formData.body_html,
        body_text: formData.body_text || null,
        variables: variablesArray,
        is_active: formData.is_active,
      };

      if (isEditMode) {
        await updateEmailTemplateRequest(templateId, payload);
        notificationsRef.current?.info('Шаблон обновлен');
      } else {
        await createEmailTemplateRequest(payload);
        notificationsRef.current?.info('Шаблон создан');
      }

      if (!stayOnPage) {
        navigate('/cms/email-templates');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(isEditMode ? `/cms/email-templates/${templateId}` : '/cms/email-templates');
  };

  return (
    <FormPage
      title={isEditMode ? 'Редактирование email шаблона' : 'Создание email шаблона'}
      backUrl={isEditMode ? `/cms/email-templates/${templateId}` : '/cms/email-templates'}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onSubmit={() => handleSubmit(false)}
      onSubmitAndStay={() => handleSubmit(true)}
      showSubmitStay={true}
      submitText={isEditMode ? 'Сохранить' : 'Создать'}
    >
      <FormSection
        icon={<FiMail />}
        iconVariant="primary"
        title="Параметры email шаблона"
        description="Укажите данные шаблона для email рассылки"
      >
        <FormGrid columns={2}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>
              Ключ *
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => handleChange('key', e.target.value)}
              placeholder="order_confirmation"
              className={errors.key ? styles.inputError : ''}
              disabled={isEditMode}
            />
            {errors.key && (
              <span className={styles.formError}>{errors.key}</span>
            )}
            {isEditMode && (
              <span className={styles.formHint}>
                Ключ нельзя изменить после создания
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>
              Тема письма *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="Подтверждение заказа"
              className={errors.subject ? styles.inputError : ''}
            />
            {errors.subject && (
              <span className={styles.formError}>{errors.subject}</span>
            )}
          </div>

          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>
              HTML тело *
            </label>
            <textarea
              rows={10}
              value={formData.body_html}
              onChange={(e) => handleChange('body_html', e.target.value)}
              placeholder="<html><body>Ваш заказ подтверждён...</body></html>"
              className={`${styles.formTextarea}${styles.formTextareaHtml}${errors.body_html ? ` ${styles.inputError}` : ''}`}
            />
            {errors.body_html && (
              <span className={styles.formError}>{errors.body_html}</span>
            )}
          </div>

          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>
              Текстовое тело
            </label>
            <textarea
              rows={6}
              value={formData.body_text}
              onChange={(e) => handleChange('body_text', e.target.value)}
              placeholder="Ваш заказ подтверждён..."
              className={styles.formTextarea}
            />
            <span className={styles.formHint}>
              Версия для текстовых email клиентов
            </span>
          </div>

          <div className={styles.formFieldFull}>
            <label className={styles.formLabel}>
              Переменные
            </label>
            <input
              type="text"
              value={formData.variables}
              onChange={(e) => handleChange('variables', e.target.value)}
              placeholder="order_id, customer_name, items"
            />
            <span className={styles.formHint}>
              Перечислите через запятую. В шаблоне используйте #имя_переменной
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
