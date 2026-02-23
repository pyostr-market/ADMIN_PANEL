import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit, FiClock, FiArrowLeft } from 'react-icons/fi';
import { PermissionGate } from '../../shared/ui/PermissionGate';
import { Button } from '../../shared/ui/Button';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { getCategoryByIdRequest } from './api/categoryApi';
import './CategoryDetailPage.css';
import './CategoryDetailPage-Mobile.css';

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
  }, [loadCategory]);

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
      <section className="category-detail-page">
        <div className="category-detail-page__loading">
          <div className="loading-spinner" />
          <p>Загрузка данных категории...</p>
        </div>
      </section>
    );
  }

  if (!category) {
    return (
      <section className="category-detail-page">
        <div className="category-detail-page__empty">
          <h1>Категория не найдена</h1>
          <Button variant="primary" leftIcon={<FiArrowLeft />} onClick={handleBack}>
            Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="category-detail-page">
      <header className="category-detail-page__header">
        <Button variant="ghost" onClick={handleBack} className="back-button">
          ← Назад
        </Button>
        <div className="category-detail-page__actions">
          <PermissionGate permission={['category:update']} fallback={null}>
            <Button
              variant="primary"
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
              История изменений
            </Button>
          </PermissionGate>
        </div>
      </header>

      <div className="category-detail-page__content">
        <div className="category-detail-page__main">
          <div className="category-detail-card">
            <div className="category-detail-card__header">
              <h2 className="category-detail-card__title">Основная информация</h2>
            </div>
            <div className="category-detail-card__body">
              <div className="category-detail-row">
                <span className="category-detail-row__label">ID:</span>
                <span className="category-detail-row__value">{category.id}</span>
              </div>
              <div className="category-detail-row">
                <span className="category-detail-row__label">Название:</span>
                <span className="category-detail-row__value">{category.name || '—'}</span>
              </div>
              <div className="category-detail-row">
                <span className="category-detail-row__label">Описание:</span>
                <span className="category-detail-row__value">
                  {category.description || '—'}
                </span>
              </div>
              <div className="category-detail-row">
                <span className="category-detail-row__label">Родительская категория:</span>
                <span className="category-detail-row__value">
                  {category.parent?.name ? `${category.parent.name} (ID: ${category.parent.id})` : 
                   category.parent_id ? `ID: ${category.parent_id}` : '—'}
                </span>
              </div>
              <div className="category-detail-row">
                <span className="category-detail-row__label">Производитель:</span>
                <span className="category-detail-row__value">
                  {category.manufacturer?.name ? `${category.manufacturer.name} (ID: ${category.manufacturer.id})` : 
                   category.manufacturer_id ? `ID: ${category.manufacturer_id}` : '—'}
                </span>
              </div>
            </div>
          </div>

          {category.images && category.images.length > 0 && (
            <div className="category-detail-card">
              <div className="category-detail-card__header">
                <h2 className="category-detail-card__title">Изображения</h2>
              </div>
              <div className="category-detail-card__body">
                <div className="category-images-grid">
                  {category.images
                    .sort((a, b) => a.ordering - b.ordering)
                    .map((image, index) => (
                      <div key={index} className="category-image-card">
                        <img
                          src={image.image_url}
                          alt={`Изображение ${index + 1}`}
                          className="category-image-card__image"
                        />
                        <div className="category-image-card__info">
                          <span className="category-image-card__order">
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
      </div>
    </section>
  );
}
