import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiImage } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { FormPage } from '../../../shared/ui/FormPage';
import { ImageCarousel } from '../../../shared/ui/ImageCarousel/ImageCarousel';
import { AutocompleteInput } from '../../../shared/ui/AutocompleteInput/AutocompleteInput';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
import { FormTextarea } from '../../../shared/ui/FormTextarea/FormTextarea';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getCategoryByIdRequest,
  createCategoryRequest,
  updateCategoryRequest,
  getCategoriesForAutocompleteRequest,
  getManufacturersForAutocompleteRequest,
} from '../api/categoryApi';
import styles from './CategoryFormPage.module.css';

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

  // Храним полные объекты для autocomplete
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);

  const [images, setImages] = useState([]);
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

      // Сохраняем полные объекты для autocomplete
      if (data.parent) {
        setSelectedParent(data.parent);
      }
      if (data.manufacturer) {
        setSelectedManufacturer(data.manufacturer);
      }

      if (data.images && data.images.length > 0) {
        // Существующие изображения уже загружены на сервер
        setImages(data.images.map(img => ({
          upload_id: img.upload_id,
          image_key: img.file_path || img.image_url,
          image_url: img.image_url,
          ordering: img.ordering,
          is_main: false, // Для категорий нет понятия главного изображения
          isNew: false,
          toDelete: false,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, isEditMode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите название категории';
    }

    // При создании изображения обязательны
    if (!isEditMode && images.length === 0) {
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

  const handleImagesChange = useCallback((newImages) => {
    setImages(newImages);
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: null }));
    }
  }, [errors.images]);

  const handleSubmit = async (stayOnPage = false) => {
    if (!validateForm()) {
      notificationsRef.current?.error('Исправьте ошибки в форме');
      return;
    }

    // Проверяем, что все изображения загружены (есть upload_id)
    const uploadingImages = images.filter(img => img.pendingUploadKey || !img.upload_id);
    if (uploadingImages.length > 0) {
      notificationsRef.current?.error('Дождитесь завершения загрузки всех изображений');
      return;
    }

    setIsSubmitting(true);

    try {
      // Формируем images_json для отправки
      const imagesToSend = images.filter(img => !img.toDelete);
      const imagesJson = imagesToSend.map((image, idx) => ({
        action: image.isNew ? 'to_create' : 'pass',
        upload_id: image.upload_id,
        orderings: idx,
      }));

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
        manufacturer_id: formData.manufacturer_id ? Number(formData.manufacturer_id) : null,
        images_json: JSON.stringify(imagesJson),
      };

      if (isEditMode) {
        const responseData = await updateCategoryRequest(categoryId, payload);
        notificationsRef.current?.info('Категория обновлена');

        if (stayOnPage) {
          // Обновляем данные формы из ответа
          if (responseData) {
            setFormData({
              name: responseData.name || formData.name,
              description: responseData.description || formData.description,
              parent_id: responseData.parent_id || formData.parent_id,
              manufacturer_id: responseData.manufacturer_id || formData.manufacturer_id,
            });
            // Обновляем полные объекты для autocomplete
            setSelectedParent(responseData.parent || selectedParent);
            setSelectedManufacturer(responseData.manufacturer || selectedManufacturer);
            // Обновляем изображения
            if (responseData.images) {
              setImages(responseData.images.map(img => ({
                upload_id: img.upload_id,
                image_key: img.file_path || img.image_url,
                image_url: img.image_url,
                ordering: img.ordering,
                is_main: false,
                isNew: false,
                toDelete: false,
              })));
            }
          }
        }
      } else {
        const responseData = await createCategoryRequest(payload);
        notificationsRef.current?.info('Категория создана');

        if (stayOnPage) {
          // После создания перенаправляем на страницу редактирования с новым ID
          const newCategoryId = responseData?.id;
          if (newCategoryId) {
            navigate(`/catalog/categories/${newCategoryId}`);
          }
        }
      }

      if (!stayOnPage) {
        navigate('/catalog/categories');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(isEditMode ? `/catalog/categories/${categoryId}` : '/catalog/categories');
  };

  return (
    <FormPage
      title={isEditMode ? 'Редактирование категории' : 'Создание категории'}
      backUrl={isEditMode ? `/catalog/categories/${categoryId}` : '/catalog/categories'}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onSubmit={() => handleSubmit(false)}
      onSubmitAndStay={() => handleSubmit(true)}
      showSubmitStay={true}
      submitText={isEditMode ? 'Сохранить' : 'Создать'}
    >
      <FormSection
        icon={<span>📁</span>}
        iconVariant="primary"
        title="Основная информация"
        description="Данные о категории"
      >
        <FormGrid columns={2}>
          <div className={styles.categoryFormField}>
            <label className={styles.categoryFormLabel}>
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
              <span className={styles.categoryFormError}>{errors.name}</span>
            )}
          </div>

          <div className={styles.categoryFormField}>
            <AutocompleteInput
              label="Родительская категория"
              value={formData.parent_id}
              onChange={(value) => handleChange('parent_id', value)}
              fetchOptions={getCategoriesForAutocompleteRequest}
              placeholder="Начните ввод для поиска родительской категории..."
              selectedOption={selectedParent}
            />
            <span className={styles.categoryFormHint}>
              Укажите родительскую категорию для создания иерархии
            </span>
          </div>

          <div className={styles.categoryFormField}>
            <AutocompleteInput
              label="Производитель"
              value={formData.manufacturer_id}
              onChange={(value) => handleChange('manufacturer_id', value)}
              fetchOptions={getManufacturersForAutocompleteRequest}
              placeholder="Начните ввод для поиска производителя..."
              selectedOption={selectedManufacturer}
            />
            <span className={styles.categoryFormHint}>
              Укажите производителя, к которому относится категория
            </span>
          </div>

          <div className={`${styles.categoryFormField} ${styles.categoryFormFieldFull}`}>
            <FormTextarea
              label="Описание"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Введите описание категории"
              rows={4}
            />
          </div>
        </FormGrid>
      </FormSection>

      <FormSection
        icon={<FiImage />}
        iconVariant="secondary"
        title="Изображения"
        description="Загрузите изображения категории"
      >
        {errors.images && (
          <span className={`${styles.categoryFormError} ${styles.categoryFormErrorBlock}`}>{errors.images}</span>
        )}

        <ImageCarousel
          images={images}
          onImagesChange={handleImagesChange}
          multiple
          showDelete
          disabled={isSubmitting}
          folder="categories"
        />
      </FormSection>
    </FormPage>
  );
}
