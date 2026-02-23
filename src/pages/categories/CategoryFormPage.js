import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiUpload, FiTrash2, FiImage } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import {
  getCategoryByIdRequest,
  createCategoryRequest,
  updateCategoryRequest,
} from './api/categoryApi';
import './CategoryFormPage.css';
import './CategoryFormPage-Mobile.css';

export function CategoryFormPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { categoryId } = useParams();

  const isEditMode = Boolean(categoryId);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    manufacturer_id: '',
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const loadCategory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCategoryByIdRequest(categoryId);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        parent_id: data.parent_id || '',
        manufacturer_id: data.manufacturer_id || '',
      });
      
      if (data.images && data.images.length > 0) {
        setExistingImages(data.images.map(img => ({
          ordering: img.ordering,
          image_url: img.image_url,
        })));
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (isEditMode && categoryId) {
      loadCategory();
    }
  }, [categoryId, isEditMode, loadCategory]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите название категории';
    }

    // При создании изображения обязательны
    if (!isEditMode && images.length === 0 && existingImages.length === 0) {
      newErrors.images = 'Загрузите хотя бы одно изображение';
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      ordering: images.length + existingImages.length + index,
    }));

    setImages((prev) => [...prev, ...newImages]);
    
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: null }));
    }
  };

  const removeNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateImageOrdering = (index, newOrdering) => {
    setImages((prev) => prev.map((img, i) => 
      i === index ? { ...img, ordering: Number(newOrdering) } : img
    ));
  };

  const updateExistingImageOrdering = (index, newOrdering) => {
    setExistingImages((prev) => prev.map((img, i) => 
      i === index ? { ...img, ordering: Number(newOrdering) } : img
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      notificationsRef.current?.error('Исправьте ошибки в форме');
      return;
    }

    setIsSubmitting(true);

    try {
      const allImages = [...existingImages, ...images];
      const orderings = allImages.map(img => img.ordering);
      const imageFiles = images.map(img => img.file);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
        manufacturer_id: formData.manufacturer_id ? Number(formData.manufacturer_id) : null,
        images: imageFiles,
        orderings: orderings,
      };

      if (isEditMode) {
        await updateCategoryRequest(categoryId, payload);
        notificationsRef.current?.info('Категория обновлена');
      } else {
        await createCategoryRequest(payload);
        notificationsRef.current?.info('Категория создана');
      }

      navigate('/categories');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="category-form-page">
        <div className="category-form-page__loading">
          <div className="loading-spinner" />
          <p>Загрузка данных категории...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="category-form-page">
      <header className="category-form-page__header">
        <div className="category-form-page__header-left">
          <Button variant="ghost" onClick={() => navigate('/categories')} className="back-button">
            ← Назад
          </Button>
          <div className="category-form-page__title-wrapper">
            <h1 className="category-form-page__title">
              {isEditMode ? 'Редактирование категории' : 'Создание категории'}
            </h1>
            <p className="category-form-page__subtitle">
              {isEditMode ? 'Внесите изменения в данные категории' : 'Заполните форму для добавления новой категории'}
            </p>
          </div>
        </div>
      </header>

      <form className="category-form-page__form" onSubmit={handleSubmit}>
        <div className="category-form">
          <div className="category-form__section">
            <div className="category-form__section-header">
              <div className="category-form__section-icon category-form__section-icon--primary">
                <span>📁</span>
              </div>
              <div>
                <h2 className="category-form__section-title">Основная информация</h2>
                <p className="category-form__section-description">Данные о категории</p>
              </div>
            </div>

            <div className="category-form__grid">
              <div className="category-form__field">
                <label className="category-form__label">
                  Название <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Введите название категории"
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && (
                  <span className="category-form__error">{errors.name}</span>
                )}
              </div>

              <div className="category-form__field">
                <label className="category-form__label">
                  ID родительской категории
                </label>
                <input
                  type="number"
                  value={formData.parent_id}
                  onChange={(e) => handleChange('parent_id', e.target.value)}
                  placeholder="ID родительской категории (необязательно)"
                  min="1"
                />
                <span className="category-form__hint">
                  Укажите ID родительской категории для создания иерархии
                </span>
              </div>

              <div className="category-form__field">
                <label className="category-form__label">
                  ID производителя
                </label>
                <input
                  type="number"
                  value={formData.manufacturer_id}
                  onChange={(e) => handleChange('manufacturer_id', e.target.value)}
                  placeholder="ID производителя (необязательно)"
                  min="1"
                />
                <span className="category-form__hint">
                  Укажите ID производителя, к которому относится категория
                </span>
              </div>

              <div className="category-form__field category-form__field--full">
                <label className="category-form__label">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Введите описание категории"
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="category-form__section">
            <div className="category-form__section-header">
              <div className="category-form__section-icon category-form__section-icon--secondary">
                <FiImage />
              </div>
              <div>
                <h2 className="category-form__section-title">Изображения</h2>
                <p className="category-form__section-description">Загрузите изображения категории</p>
              </div>
            </div>

            {errors.images && (
              <span className="category-form__error category-form__error--block">{errors.images}</span>
            )}

            <div className="category-images">
              {/* Существующие изображения */}
              {existingImages.length > 0 && (
                <div className="category-images__list">
                  <h3 className="category-images__subtitle">Существующие изображения</h3>
                  {existingImages.map((img, index) => (
                    <div key={index} className="category-image-item">
                      <div className="category-image-item__preview">
                        <img src={img.image_url} alt={`Изображение ${index + 1}`} />
                      </div>
                      <div className="category-image-item__info">
                        <label className="category-image-item__label">
                          Порядок:
                          <input
                            type="number"
                            value={img.ordering}
                            onChange={(e) => updateExistingImageOrdering(index, e.target.value)}
                            min="0"
                            className="category-image-item__ordering"
                          />
                        </label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExistingImage(index)}
                        className="category-image-item__remove"
                        aria-label="Удалить изображение"
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Новые изображения */}
              {images.length > 0 && (
                <div className="category-images__list">
                  <h3 className="category-images__subtitle">Новые изображения</h3>
                  {images.map((img, index) => (
                    <div key={index} className="category-image-item">
                      <div className="category-image-item__preview">
                        <img src={img.preview} alt={`Изображение ${index + 1}`} />
                      </div>
                      <div className="category-image-item__info">
                        <label className="category-image-item__label">
                          Порядок:
                          <input
                            type="number"
                            value={img.ordering}
                            onChange={(e) => updateImageOrdering(index, e.target.value)}
                            min="0"
                            className="category-image-item__ordering"
                          />
                        </label>
                        <span className="category-image-item__filename">{img.file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeNewImage(index)}
                        className="category-image-item__remove"
                        aria-label="Удалить изображение"
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Кнопка загрузки */}
              <div className="category-images__upload">
                <label className="category-images__upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="category-images__upload-input"
                  />
                  <span className="category-images__upload-button">
                    <FiUpload />
                    <span>Выбрать изображения</span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="category-form-page__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/categories')}
            leftIcon={<FiX />}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<FiSave />}
            loading={isSubmitting}
            size="lg"
          >
            {isEditMode ? 'Сохранить изменения' : 'Создать категорию'}
          </Button>
        </div>
      </form>
    </section>
  );
}
