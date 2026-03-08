import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit, FiHelpCircle } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { InfoBlock } from '../../../shared/ui/InfoBlock/InfoBlock';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { getFaqsRequest } from '../api/cmsApi';
import styles from './FaqDetailPage.module.css';

export function FaqDetailPage() {
  const { faqId } = useParams();
  const navigate = useNavigate();

  const [faq, setFaq] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFaq = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getFaqsRequest({});
      const foundFaq = (data.items || []).find(item => item.id === parseInt(faqId));
      setFaq(foundFaq || null);
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error('Ошибка загрузки FAQ:', message);
    } finally {
      setIsLoading(false);
    }
  }, [faqId]);

  useEffect(() => {
    loadFaq();
  }, [faqId, loadFaq]);

  const handleEdit = () => {
    navigate(`/cms/faq/${faqId}/edit`);
  };

  const handleBack = () => {
    navigate('/cms/faq');
  };

  if (isLoading) {
    return (
      <section className={styles.faqDetailPage}>
        <div className={styles.faqDetailPageLoading}>
          <div className="loading-spinner" />
          <p>Загрузка данных FAQ...</p>
        </div>
      </section>
    );
  }

  if (!faq) {
    return (
      <section className={styles.faqDetailPage}>
        <div className={styles.faqDetailPageEmpty}>
          <h1>FAQ не найден</h1>
          <Button variant="primary" onClick={handleBack}>
            ← Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.faqDetailPage}>
      <header className={styles.faqDetailPageHeader}>
        <Button variant="ghost" onClick={handleBack} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.faqDetailPageActions}>
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

      <div className={styles.faqDetailPageContent}>
        <InfoBlock
          title="Информация о FAQ"
          headerIcon={<FiHelpCircle />}
          items={[
            {
              label: 'ID',
              value: faq.id,
              iconVariant: 'primary',
            },
            {
              label: 'Категория',
              value: faq.category || '—',
              iconVariant: 'secondary',
            },
            {
              label: 'Порядок',
              value: faq.order || 0,
              iconVariant: 'accent',
            },
            {
              label: 'Статус',
              value: faq.is_active ? 'Активен' : 'Неактивен',
              iconVariant: faq.is_active ? 'success' : 'warning',
            },
          ]}
        />

        <div className={styles.faqDetailPagePanel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderContent}>
              <h2 className={styles.panelTitle}>Вопрос и ответ</h2>
            </div>
          </div>
          <div className={styles.panelContent}>
            <div className={styles.faqContent}>
              <div className={styles.faqQuestion}>
                <h3>Вопрос</h3>
                <p>{faq.question}</p>
              </div>
              <div className={styles.faqAnswer}>
                <h3>Ответ</h3>
                <p>{faq.answer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
