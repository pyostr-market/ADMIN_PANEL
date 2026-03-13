import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiImage, FiUpload, FiTrash2, FiLoader } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { FormPage } from '../../../shared/ui/FormPage';
import { AutocompleteInput } from '../../../shared/ui/AutocompleteInput/AutocompleteInput';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
import { FormTextarea } from '../../../shared/ui/FormTextarea/FormTextarea';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import { uploadFileRequest } from '../../../shared/api/uploadApi';
import {
  getCategoryByIdRequest,
  createCategoryRequest,
  updateCategoryRequest,
  getCategoriesForAutocompleteRequest,
  getManufacturersForAutocompleteRequest,
} from '../api/categoryApi';
import styles from './CategoryFormPage.module.css';

const UPLOAD_TIMEOUT = 10000;

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

  // Состояние для одного изображения категории
  const [image, setImage] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(null);
  const fileInputRef = useRef(null);

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

      // Загружаем изображение если есть (берём первое из массива)
      if (data.images && data.images.length > 0) {
        const firstImage = data.images[0];
        setImage({
          upload_id: firstImage.upload_id,
          image_url: firstImage.image_url,
          ordering: firstImage.ordering,
          toDelete: false,
          isNew: false,
        });
      } else {
        setImage(null);
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
    // Очищаем выбранный объект при сбросе значения
    if (field === 'parent_id' && !value) {
      setSelectedParent(null);
    }
    if (field === 'manufacturer_id' && !value) {
      setSelectedManufacturer(null);
    }
  };

  // Загрузка файла изображения
  const handleImageUpload = useCallback(async (file) => {
    if (!file) return;

    const startTime = Date.now();
    setUploadingFile({ progress: 0, startTime, fileName: file.name, fileSize: file.size });

    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, UPLOAD_TIMEOUT);

      const result = await uploadFileRequest(file, 'categories', {
        originalFilename: file.name,
        onProgress: (progress) => {
          setUploadingFile((prev) => ({ ...prev, progress }));
        },
        abortSignal: abortController.signal,
      });

      clearTimeout(timeoutId);

      // Если было старое изображение, помечаем его на удаление
      setImage((prevImage) => {
        const oldUploadId = prevImage && prevImage.upload_id ? prevImage.upload_id : null;
        return {
          upload_id: result.upload_id,
          image_url: result.public_url || result.file_path,
          ordering: 0,
          toDelete: false,
          oldUploadId,
          isNew: true,
        };
      });

      setUploadingFile(null);
      notificationsRef.current?.info('Изображение загружено');
    } catch (error) {
      console.error('[CategoryForm] Ошибка загрузки изображения:', error);
      setUploadingFile(null);
      notificationsRef.current?.error('Ошибка загрузки изображения');
    }
  }, []);

  // Удаление изображения
  const handleImageDelete = useCallback(() => {
    setImage((prevImage) => {
      if (!prevImage) return null;

      // Если изображение уже было на сервере, помечаем на удаление
      if (prevImage.upload_id && !prevImage.isNew) {
        return {
          ...prevImage,
          toDelete: true,
        };
      }

      // Если новое изображение ещё не было отправлено, просто удаляем
      return null;
    });
  }, []);

  // Восстановление изображения (снятие пометки на удаление)
  const handleImageRestore = useCallback(() => {
    setImage((prevImage) => {
      if (!prevImage) return null;
      return {
        ...prevImage,
        toDelete: false,
      };
    });
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
    e.target.value = '';
  }, [handleImageUpload]);

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleSubmit = async (stayOnPage = false) => {
    if (!validateForm()) {
      notificationsRef.current?.error('Исправьте ошибки в форме');
      return;
    }

    // Проверяем, что загрузка изображения завершена
    if (uploadingFile) {
      notificationsRef.current?.error('Дождитесь завершения загрузки изображения');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
        manufacturer_id: formData.manufacturer_id ? Number(formData.manufacturer_id) : null,
      };

      // Обработка изображения
      if (image) {
        if (image.toDelete) {
          // Удаление изображения (только для редактирования)
          if (isEditMode) {
            payload.image = { action: 'delete', upload_id: image.upload_id };
          }
        } else if (image.upload_id) {
          // Есть загруженное изображение
          if (image.isNew || image.oldUploadId) {
            // Новое изображение или замена старого
            payload.image = {
              action: 'create',
              upload_id: image.upload_id,
            };
          } else {
            // Существующее изображение без изменений (только для редактирования)
            if (isEditMode) {
              payload.image = {
                action: 'pass',
                upload_id: image.upload_id,
              };
            }
          }
        }
      }

      if (isEditMode) {
        const responseData = await updateCategoryRequest(categoryId, payload);
        notificationsRef.current?.info('Категория обновлена');

        if (stayOnPage && responseData) {
          setFormData({
            name: responseData.name || formData.name,
            description: responseData.description || formData.description,
            parent_id: responseData.parent_id || formData.parent_id,
            manufacturer_id: responseData.manufacturer_id || formData.manufacturer_id,
          });
          // Обновляем полные объекты для autocomplete
          setSelectedParent(responseData.parent || selectedParent);
          setSelectedManufacturer(responseData.manufacturer || selectedManufacturer);
          // Обновляем изображение из ответа
          if (responseData.images && responseData.images.length > 0) {
            setImage({
              upload_id: responseData.images[0].upload_id,
              image_url: responseData.images[0].image_url,
              ordering: responseData.images[0].ordering,
              toDelete: false,
              oldUploadId: null,
              isNew: false,
            });
          } else {
            setImage(null);
          }
        }
      } else {
        // Для создания используем простой массив изображений
        if (image && image.upload_id) {
          payload.images = [{
            upload_id: image.upload_id,
            ordering: image.ordering || 0,
          }];
        }

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
        title="Изображение категории"
        description="Загрузите изображение категории"
      >
        <div className={styles.imageSection}>
          {/* Input для выбора файла */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className={styles.fileInput}
            disabled={isSubmitting || !!uploadingFile}
          />

          {/* Есть изображение */}
          {image && !image.toDelete && (
            <div className={styles.imagePreview}>
              <div className={styles.imageWrapper}>
                {image.image_url ? (
                  <img
                    src={image.image_url}
                    alt="Изображение категории"
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <FiImage size={48} />
                  </div>
                )}

                {/* Индикатор загрузки */}
                {uploadingFile && (
                  <div className={styles.uploadOverlay}>
                    <div className={styles.spinner}>
                      <FiLoader className={styles.spinnerIcon} />
                      <span>{uploadingFile.progress}%</span>
                    </div>
                  </div>
                )}

                {/* Бейдж "Будет удалено" */}
                {image.toDelete && (
                  <span className={styles.deleteBadge}>
                    <FiTrash2 /> Будет удалено
                  </span>
                )}
              </div>

              {!uploadingFile && (
                <div className={styles.imageActions}>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiUpload />}
                    onClick={triggerFileInput}
                    disabled={isSubmitting}
                  >
                    Заменить
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<FiTrash2 />}
                    onClick={handleImageDelete}
                    disabled={isSubmitting}
                  >
                    Удалить
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Изображение помечено на удаление */}
          {image && image.toDelete && (
            <div className={styles.restoreSection}>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleImageRestore}
                disabled={isSubmitting}
              >
                Восстановить изображение
              </Button>
            </div>
          )}

          {/* Нет изображения */}
          {!image && (
            <div
              className={styles.emptyState}
              onClick={!isSubmitting && !uploadingFile ? triggerFileInput : undefined}
            >
              <FiImage size={48} />
              <p>Нет изображения</p>
              {!isSubmitting && !uploadingFile && (
                <>
                  <span className={styles.emptyHint}>
                    Нажмите кнопку или перетащите файл
                  </span>
                  <Button
                    variant="secondary"
                    leftIcon={<FiUpload />}
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerFileInput();
                    }}
                    disabled={isSubmitting || !!uploadingFile}
                  >
                    Загрузить изображение
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </FormSection>
    </FormPage>
  );
}
