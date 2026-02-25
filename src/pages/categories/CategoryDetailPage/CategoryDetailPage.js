import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit, FiClock, FiArrowLeft, FiTag, FiFileText, FiBox, FiImage } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
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
          <PermissionGate permission={['category:audit']} fallback={null}>
            <Button
              variant="secondary"
              leftIcon={<FiClock />}
              onClick={handleViewAudit}
            >
              История
            </Button>
          </PermissionGate>
        </div>
      </header>

      <div className={styles.categoryDetailPageContent}>
        <div className={styles.categoryDetailPagePanel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderContent}>
              <h2 className={styles.panelTitle}>Информация</h2>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiClock />}
                onClick={handleViewAudit}
              >
                История
              </Button>
            </div>
          </div>

          <div className={styles.categoryInfoGrid}>
            <div className={styles.infoCard}>
              <div className={`${styles.infoCardIcon} ${styles.infoCardIconPrimary}`}>
                <FiTag />
              </div>
              <div className={styles.infoCardContent}>
                <span className={styles.infoCardLabel}>Название</span>
                <span className={styles.infoCardValue}>{category.name || '—'}</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={`${styles.infoCardIcon} ${styles.infoCardIconSecondary}`}>
                <FiBox />
              </div>
              <div className={styles.infoCardContent}>
                <span className={styles.infoCardLabel}>Родительская категория</span>
                <span className={styles.infoCardValue}>{category.parent?.name || '—'}</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={`${styles.infoCardIcon} ${styles.infoCardIconAccent}`}>
                <FiImage />
              </div>
              <div className={styles.infoCardContent}>
                <span className={styles.infoCardLabel}>Производитель</span>
                <span className={styles.infoCardValue}>{category.manufacturer?.name || '—'}</span>
              </div>
            </div>

            {category.description && (
              <div className={`${styles.infoCard} ${styles.infoCardFull}`}>
                <div className={`${styles.infoCardIcon} ${styles.infoCardIconInfo}`}>
                  <FiFileText />
                </div>
                <div className={styles.infoCardContent}>
                  <span className={styles.infoCardLabel}>Описание</span>
                  <span className={styles.infoCardValue}>{category.description}</span>
                </div>
              </div>
            )}
          </div>
        </div>

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
