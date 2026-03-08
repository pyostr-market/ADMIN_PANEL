import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit, FiMail } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { InfoBlock } from '../../../shared/ui/InfoBlock/InfoBlock';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { getEmailTemplatesRequest } from '../api/cmsApi';
import styles from './EmailTemplateDetailPage.module.css';

export function EmailTemplateDetailPage() {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTemplate = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getEmailTemplatesRequest({});
      const foundTemplate = (data.items || []).find(item => item.id === parseInt(templateId));
      setTemplate(foundTemplate || null);
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error('Ошибка загрузки шаблона:', message);
    } finally {
      setIsLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    loadTemplate();
  }, [templateId, loadTemplate]);

  const handleEdit = () => {
    navigate(`/cms/email-templates/${templateId}/edit`);
  };

  const handleBack = () => {
    navigate('/cms/email-templates');
  };

  if (isLoading) {
    return (
      <section className={styles.templateDetailPage}>
        <div className={styles.templateDetailPageLoading}>
          <div className="loading-spinner" />
          <p>Загрузка email шаблона...</p>
        </div>
      </section>
    );
  }

  if (!template) {
    return (
      <section className={styles.templateDetailPage}>
        <div className={styles.templateDetailPageEmpty}>
          <h1>Email шаблон не найден</h1>
          <Button variant="primary" onClick={handleBack}>
            ← Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.templateDetailPage}>
      <header className={styles.templateDetailPageHeader}>
        <Button variant="ghost" onClick={handleBack} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.templateDetailPageActions}>
          <PermissionGate permission={['cms:update']} fallback={null}>
            <Button
              variant="secondary"
              leftIcon={<FiEdit />}
              onClick={handleEdit}
            >
              Редактировать
            </Button>
          </PermissionGate>
        </div>
      </header>

      <div className={styles.templateDetailPageContent}>
        <InfoBlock
          title="Информация о шаблоне"
          headerIcon={<FiMail />}
          items={[
            {
              label: 'ID',
              value: template.id,
              iconVariant: 'primary',
            },
            {
              label: 'Ключ',
              value: template.key,
              iconVariant: 'secondary',
            },
            {
              label: 'Статус',
              value: template.is_active ? 'Активен' : 'Неактивен',
              iconVariant: template.is_active ? 'success' : 'warning',
            },
            {
              label: 'Переменные',
              value: template.variables?.join(', ') || '—',
              iconVariant: 'info',
            },
          ]}
        />

        <div className={styles.templateDetailPagePanel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderContent}>
              <h2 className={styles.panelTitle}>Содержимое шаблона</h2>
            </div>
          </div>
          <div className={styles.panelContent}>
            <div className={styles.templateContent}>
              <div className={styles.templateItem}>
                <h3>Тема письма</h3>
                <p>{template.subject}</p>
              </div>
              {template.body_html && (
                <div className={styles.templateItem}>
                  <h3>HTML тело</h3>
                  <pre className={styles.templateCode}>{template.body_html}</pre>
                </div>
              )}
              {template.body_text && (
                <div className={styles.templateItem}>
                  <h3>Текстовое тело</h3>
                  <pre className={styles.templateText}>{template.body_text}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
