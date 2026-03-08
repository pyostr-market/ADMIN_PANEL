import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit, FiFileText } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { InfoBlock } from '../../../shared/ui/InfoBlock/InfoBlock';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { getPageByIdRequest } from '../api/cmsApi';
import styles from './PageDetailPage.module.css';

export function PageDetailPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPage = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPageByIdRequest(pageId);
      setPage(data);
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error('Ошибка загрузки страницы:', message);
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    loadPage();
  }, [pageId, loadPage]);

  const handleEdit = () => {
    navigate(`/cms/pages/${pageId}/edit`);
  };

  const handleViewAudit = () => {
    navigate(`/cms/pages/${pageId}/audit`);
  };

  const handleBack = () => {
    navigate('/cms/pages');
  };

  const formatBlockType = (type) => {
    const types = {
      text: 'Текст',
      image: 'Изображение',
      video: 'Видео',
      html: 'HTML',
      accordion: 'Аккордеон',
      features: 'Преимущества',
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <section className={styles.pageDetailPage}>
        <div className={styles.pageDetailPageLoading}>
          <div className="loading-spinner" />
          <p>Загрузка данных страницы...</p>
        </div>
      </section>
    );
  }

  if (!page) {
    return (
      <section className={styles.pageDetailPage}>
        <div className={styles.pageDetailPageEmpty}>
          <h1>Страница не найдена</h1>
          <Button variant="primary" onClick={handleBack}>
            ← Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.pageDetailPage}>
      <header className={styles.pageDetailPageHeader}>
        <Button variant="ghost" onClick={handleBack} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.pageDetailPageActions}>
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

      <div className={styles.pageDetailPageContent}>
        <InfoBlock
          title="Параметры страницы"
          headerIcon={<FiFileText />}
          items={[
            {
              label: 'ID страницы',
              value: page.id,
              iconVariant: 'primary',
            },
            {
              label: 'Заголовок',
              value: page.title,
              iconVariant: 'secondary',
            },
            {
              label: 'Slug',
              value: page.slug,
              iconVariant: 'accent',
            },
            {
              label: 'Статус',
              value: page.is_published ? 'Опубликована' : 'Черновик',
              iconVariant: page.is_published ? 'success' : 'warning',
            },
            {
              label: 'Количество блоков',
              value: page.blocks?.length || 0,
              iconVariant: 'info',
            },
          ]}
          auditUrl={`/cms/pages/${pageId}/audit`}
          onAuditClick={handleViewAudit}
        />

        {page.blocks && page.blocks.length > 0 && (
          <div className={styles.pageDetailPagePanel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelHeaderContent}>
                <h2 className={styles.panelTitle}>Блоки страницы</h2>
              </div>
            </div>
            <div className={styles.panelContent}>
              <div className={styles.blocksList}>
                {page.blocks.map((block) => (
                  <div key={block.id} className={styles.blockItem}>
                    <div className={styles.blockItemHeader}>
                      <span className={styles.blockOrder}>#{block.order + 1}</span>
                      <span className={styles.blockType}>{formatBlockType(block.block_type)}</span>
                      <span className={styles.blockStatus}>
                        {block.is_active ? 'Активен' : 'Неактивен'}
                      </span>
                    </div>
                    <div className={styles.blockItemData}>
                      <pre className={styles.blockDataJson}>
                        {JSON.stringify(block.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
