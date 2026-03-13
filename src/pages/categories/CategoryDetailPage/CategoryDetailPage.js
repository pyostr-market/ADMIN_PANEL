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
    navigate(`/catalog/categories/${categoryId}/edit`);
  };

  const handleViewAudit = () => {
    navigate(`/catalog/categories/${categoryId}/audit`);
  };

  const handleBack = () => {
    navigate('/catalog/categories');
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
          customContent={
            category.image ? (
              <div className={styles.imageSection}>
                <div className={styles.imageLabel}>
                  <FiImage /> Изображение
                </div>
                <div className={styles.imageWrapper}>
                  <img
                    src={category.image.image_url}
                    alt={category.name || 'Изображение категории'}
                    className={styles.image}
                  />
                </div>
              </div>
            ) : null
          }
          auditUrl={`/categories/${categoryId}/audit`}
          onAuditClick={handleViewAudit}
        />
      </div>
    </section>
  );
}
