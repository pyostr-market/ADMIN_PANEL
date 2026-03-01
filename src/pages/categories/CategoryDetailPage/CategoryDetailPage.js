import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit, FiClock, FiArrowLeft, FiTag, FiFileText, FiBox, FiImage } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { InfoBlock } from '../../../shared/ui/InfoBlock/InfoBlock';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { getCategoryByIdRequest } from '../api/categoryApi';
import styles from './CategoryDetailPage.module.css';

export function CategoryDetailPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCategoryByIdRequest(categoryId);
      setCategory(data);
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error('Ошибка загрузки категории:', message);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const handleEdit = () => {
    navigate(`/categories/${categoryId}/edit`);
  };

  const handleViewAudit = () => {
    navigate(`/categories/${categoryId}/audit`);
  };

  const handleBack = () => {
    navigate('/categories');
  };

  if (isLoading) {
    return (
      <section className={styles.categoryDetailPage}>
        <div className={styles.categoryDetailPageLoading}>
          <div className="loading-spinner" />
          <p>Загрузка данных категории...</p>
        </div>
      </section>
    );
  }

  if (!category) {
    return (
      <section className={styles.categoryDetailPage}>
        <div className={styles.categoryDetailPageEmpty}>
          <h1>Категория не найдена</h1>
          <Button variant="primary" leftIcon={<FiArrowLeft />} onClick={handleBack}>
            Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.categoryDetailPage}>
      <header className={styles.categoryDetailPageHeader}>
        <Button variant="ghost" onClick={handleBack} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.categoryDetailPageActions}>
          <PermissionGate permission={['category:update']} fallback={null}>
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

      <div className={styles.categoryDetailPageContent}>
        <InfoBlock
          title="Информация"
          headerIcon={<FiTag />}
          items={[
            {
              label: 'Название',
              value: category.name || '—',
              iconVariant: 'primary',
            },
            {
              label: 'Родительская категория',
              value: category.parent?.name || '—',
              iconVariant: 'secondary',
            },
            {
              label: 'Производитель',
              value: category.manufacturer?.name || '—',
              iconVariant: 'accent',
            },
            {
              label: 'Описание',
              value: category.description,
              iconVariant: 'info',
              fullWidth: !!category.description,
            },
          ]}
          auditUrl={`/categories/${categoryId}/audit`}
          onAuditClick={handleViewAudit}
        />

        {category.images && category.images.length > 0 && (
          <div className={styles.categoryDetailPagePanel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelHeaderContent}>
                <h2 className={styles.panelTitle}>Изображения</h2>
              </div>
            </div>
            <div className={styles.panelContent}>
              <div className={styles.categoryImagesGrid}>
                {category.images
                  .sort((a, b) => a.ordering - b.ordering)
                  .map((image, index) => (
                    <div key={index} className={styles.categoryImageCard}>
                      <img
                        src={image.image_url}
                        alt={`Изображение ${index + 1}`}
                        className={styles.categoryImageCardImage}
                      />
                      <div className={styles.categoryImageCardInfo}>
                        <span className={styles.categoryImageCardOrder}>
                          Порядок: {image.ordering}
                        </span>
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
