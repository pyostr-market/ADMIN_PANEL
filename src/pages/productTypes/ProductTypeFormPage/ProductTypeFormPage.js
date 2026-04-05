import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiImage, FiUpload, FiTrash2, FiLoader } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { FormPage } from '../../../shared/ui/FormPage';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
import { AutocompleteInput } from '../../../shared/ui/AutocompleteInput/AutocompleteInput';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import { uploadFileRequest } from '../../../shared/api/uploadApi';
import {
  getProductTypeByIdRequest,
  createProductTypeRequest,
  updateProductTypeRequest,
  getProductTypesForAutocompleteRequest,
} from '../api/productTypesApi';
import styles from './ProductTypeFormPage.module.css';

const UPLOAD_TIMEOUT = 10000;

export function ProductTypeFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { productTypeId } = useParams();

  const isEditMode = Boolean(productTypeId);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
  });

  // Храним полный объект для autocomplete
  const [selectedParent, setSelectedParent] = useState(null);

  // Состояние для одного изображения типа продукта
  const [image, setImage] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(null);
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const navigateWithParams = useCallback((path) => {
    const paramsString = searchParams.toString();
    const fullPath = paramsString ? `${path}?${paramsString}` : path;
    navigate(fullPath);
  }, [navigate, searchParams]);

  const loadProductType = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProductTypeByIdRequest(productTypeId);
      setFormData({
        name: data.name || '',
        parent_id: data.parent_id || '',
      });
      // Сохраняем полный объект для autocomplete
      if (data.parent) {
        setSelectedParent(data.parent);
      }
      // Загружаем изображение если есть
      if (data.image) {
        setImage({
          upload_id: data.image.upload_id,
          image_url: data.image.image_url,
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
  }, [productTypeId]);

  useEffect(() => {
    if (isEditMode && productTypeId) {
      loadProductType();
    }
  }, [productTypeId, isEditMode, loadProductType]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите название типа продукта';
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

      const result = await uploadFileRequest(file, 'product_types', {
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
          toDelete: false,
          oldUploadId,
          isNew: true,
        };
      });

      setUploadingFile(null);
      notificationsRef.current?.success('Изображение загружено');
    } catch (error) {
      console.error('[ProductTypeForm] Ошибка загрузки изображения:', error);
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
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
      };

      // Обработка изображения
      if (image) {
        if (image.toDelete) {
          // Удаление изображения (только для редактирования)
          if (isEditMode) {
            payload.image_action = 'delete';
          }
        } else if (image.upload_id) {
          // Есть загруженное изображение
          if (image.isNew || image.oldUploadId) {
            // Новое изображение или замена старого
            payload.image_action = 'create';
            payload.image_upload_id = image.upload_id;
          } else {
            // Существующее изображение без изменений (только для редактирования)
            if (isEditMode) {
              payload.image_action = 'pass';
              payload.image_upload_id = image.upload_id;
            }
          }
        }
      }

      if (isEditMode) {
        const responseData = await updateProductTypeRequest(productTypeId, payload);
        notificationsRef.current?.info('Тип продукта обновлен');

        if (stayOnPage && responseData) {
          setFormData({
            name: responseData.name || formData.name,
            parent_id: responseData.parent_id || formData.parent_id,
          });
          setSelectedParent(responseData.parent || selectedParent);
          // Обновляем изображение из ответа
          if (responseData.image) {
            setImage({
              upload_id: responseData.image.upload_id,
              image_url: responseData.image.image_url,
              toDelete: false,
              oldUploadId: null,
              isNew: false,
            });
          } else {
            setImage(null);
          }
        }
      } else {
        const responseData = await createProductTypeRequest(payload);
        notificationsRef.current?.info('Тип продукта создан');

        if (stayOnPage) {
          const newProductTypeId = responseData?.id;
          if (newProductTypeId) {
            navigateWithParams(`/catalog/device_type/${newProductTypeId}`);
          }
        }
      }

      if (!stayOnPage) {
        navigateWithParams('/catalog/device_type');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    const backUrl = isEditMode ? `/catalog/device_type/${productTypeId}` : '/catalog/device_type';
    navigateWithParams(backUrl);
  };

  return (
    <FormPage
      title={isEditMode ? 'Редактирование типа продукта' : 'Создание типа продукта'}
      backUrl={isEditMode ? `/catalog/device_type/${productTypeId}` : '/catalog/device_type'}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onSubmit={() => handleSubmit(false)}
      onSubmitAndStay={() => handleSubmit(true)}
      showSubmitStay={true}
      submitText={isEditMode ? 'Сохранить' : 'Создать'}
    >
      <FormSection
        icon={<span>🏷️</span>}
        iconVariant="primary"
        title="Основная информация"
        description="Данные о типе продукта"
      >
        <FormGrid columns={2}>
          <div className={styles.productTypeFormField}>
            <label className={styles.productTypeFormLabel}>
              Название <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Введите название типа продукта"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && (
              <span className={styles.productTypeFormError}>{errors.name}</span>
            )}
          </div>

          <div className={styles.productTypeFormField}>
            <AutocompleteInput
              label="Родительский тип"
              value={formData.parent_id}
              onChange={(value) => handleChange('parent_id', value)}
              fetchOptions={getProductTypesForAutocompleteRequest}
              placeholder="Начните ввод для поиска родительского типа..."
              selectedOption={selectedParent}
            />
            <span className={styles.productTypeFormHint}>
              Укажите родительский тип для создания иерархии
            </span>
          </div>
        </FormGrid>
      </FormSection>

      <FormSection
        icon={<FiImage />}
        iconVariant="secondary"
        title="Изображение типа продукта"
        description="Загрузите изображение типа продукта"
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
                    alt="Изображение типа продукта"
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
