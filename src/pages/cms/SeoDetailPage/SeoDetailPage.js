import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit, FiSearch } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { InfoBlock } from '../../../shared/ui/InfoBlock/InfoBlock';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { getSeoListRequest } from '../api/cmsApi';
import styles from './SeoDetailPage.module.css';

export function SeoDetailPage() {
  const { seoId } = useParams();
  const navigate = useNavigate();

  const [seo, setSeo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSeo = useCallback(async () => {
    setIsLoading(true);
    try {
      // Получаем список и находим нужный элемент
      // В реальном API может быть эндпоинт для получения по ID
      const data = await getSeoListRequest({ limit: 100 });
      const foundSeo = (data.items || []).find(item => item.id === parseInt(seoId));
      setSeo(foundSeo || null);
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error('Ошибка загрузки SEO:', message);
    } finally {
      setIsLoading(false);
    }
  }, [seoId]);

  useEffect(() => {
    loadSeo();
  }, [seoId, loadSeo]);

  const handleEdit = () => {
    navigate(`/cms/seo/${seoId}/edit`);
  };

  const handleBack = () => {
    navigate('/cms/seo');
  };

  if (isLoading) {
    return (
      <section className={styles.seoDetailPage}>
        <div className={styles.seoDetailPageLoading}>
          <div className="loading-spinner" />
          <p>Загрузка SEO данных...</p>
        </div>
      </section>
    );
  }

  if (!seo) {
    return (
      <section className={styles.seoDetailPage}>
        <div className={styles.seoDetailPageEmpty}>
          <h1>SEO данные не найдены</h1>
          <Button variant="primary" onClick={handleBack}>
            ← Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.seoDetailPage}>
      <header className={styles.seoDetailPageHeader}>
        <Button variant="ghost" onClick={handleBack} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.seoDetailPageActions}>
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

      <div className={styles.seoDetailPageContent}>
        <InfoBlock
          title="SEO данные"
          headerIcon={<FiSearch />}
          items={[
            {
              label: 'ID',
              value: seo.id,
              iconVariant: 'primary',
            },
            {
              label: 'Slug страницы',
              value: seo.page_slug,
              iconVariant: 'secondary',
            },
            {
              label: 'OG Image ID',
              value: seo.og_image_id || '—',
              iconVariant: 'accent',
            },
          ]}
        />

        <div className={styles.seoDetailPagePanel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderContent}>
              <h2 className={styles.panelTitle}>SEO параметры</h2>
            </div>
          </div>
          <div className={styles.panelContent}>
            <div className={styles.seoContent}>
              {seo.title && (
                <div className={styles.seoItem}>
                  <h3>Заголовок</h3>
                  <p>{seo.title}</p>
                </div>
              )}
              {seo.description && (
                <div className={styles.seoItem}>
                  <h3>Описание</h3>
                  <p>{seo.description}</p>
                </div>
              )}
              {seo.keywords && seo.keywords.length > 0 && (
                <div className={styles.seoItem}>
                  <h3>Ключевые слова</h3>
                  <div className={styles.keywordsList}>
                    {seo.keywords.map((keyword, index) => (
                      <span key={index} className={styles.keywordTag}>
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
