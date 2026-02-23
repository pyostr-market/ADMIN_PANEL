import { useState, useRef, useCallback, useEffect } from 'react';
import { FiUpload, FiTrash2, FiImage, FiLoader } from 'react-icons/fi';
import { Button } from './Button';
import './ImageCarousel.css';

const UPLOAD_TIMEOUT = 10000; // 10 секунд

/**
 * Компонент карусели изображений с поддержкой drag-and-drop и загрузкой на сервер
 * @param {Array} images - Массив изображений [{image_url: string, is_main: bool, ordering?: number, upload_id?: number}]
 * @param {Function} onImagesChange - Callback при изменении изображений
 * @param {boolean} multiple - Возможность загрузки нескольких изображений
 * @param {boolean} showDelete - Показывать кнопку удаления
 * @param {boolean} disabled - Отключено ли редактирование
 * @param {string} folder - Папка для загрузки файлов (products, categories, manufacturers, etc.)
 * @param {Function} onUploadStart - Callback при начале загрузки
 * @param {Function} onUploadComplete - Callback при завершении загрузки (успех или ошибка)
 */
export function ImageCarousel({
  images = [],
  onImagesChange,
  multiple = true,
  showDelete = true,
  disabled = false,
  folder = 'products',
  onUploadStart,
  onUploadComplete,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDragOverZone, setIsDragOverZone] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({}); // { [key]: { progress: number, startTime: number } }
  const fileInputRef = useRef(null);
  const imagesRef = useRef(images);
  const uploadingRef = useRef(uploadingFiles);

  // Обновляем ref при изменении images и uploadingFiles
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    uploadingRef.current = uploadingFiles;
  }, [uploadingFiles]);

  // Функция загрузки одного файла
  const uploadSingleFile = useCallback(async (file, imageIndex) => {
    const startTime = Date.now();
    const uploadKey = `${file.name}-${file.size}-${imageIndex}`;

    // Инициализируем состояние загрузки
    setUploadingFiles(prev => ({
      ...prev,
      [uploadKey]: { progress: 0, startTime, file },
    }));

    onUploadStart?.();

    try {
      // Создаем AbortController для таймаута
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, UPLOAD_TIMEOUT);

      const result = await window.uploadApi.uploadFileRequest(file, folder, {
        originalFilename: file.name,
        onProgress: (progress) => {
          setUploadingFiles(prev => ({
            ...prev,
            [uploadKey]: { ...prev[uploadKey], progress },
          }));
        },
        abortSignal: abortController.signal,
      });

      clearTimeout(timeoutId);

      // Обновляем изображение с данными от сервера
      const currentImages = imagesRef.current;
      const updatedImages = currentImages.map((img, idx) => {
        if (idx === imageIndex && img.pendingUploadKey === uploadKey) {
          return {
            ...img,
            upload_id: result.upload_id,
            file_path: result.file_path,
            public_url: result.public_url,
            image_url: result.public_url, // Используем public_url для отображения
            isNew: true, // Оставляем isNew=true для отправки action: 'to_create'
            pendingUploadKey: null,
          };
        }
        return img;
      });

      onImagesChange(updatedImages);

      // Удаляем из состояния загрузки
      setUploadingFiles(prev => {
        const next = { ...prev };
        delete next[uploadKey];
        return next;
      });

      onUploadComplete?.({ success: true, result });
      return result;
    } catch (error) {
      console.error('[ImageCarousel] Ошибка загрузки файла:', error);

      // Помечаем как ошибку загрузки
      const currentImages = imagesRef.current;
      const updatedImages = currentImages.map((img, idx) => {
        if (idx === imageIndex && img.pendingUploadKey === uploadKey) {
          return {
            ...img,
            uploadError: error.message || 'Ошибка загрузки',
          };
        }
        return img;
      });
      onImagesChange(updatedImages);

      // Удаляем из состояния загрузки
      setUploadingFiles(prev => {
        const next = { ...prev };
        delete next[uploadKey];
        return next;
      });

      onUploadComplete?.({ success: false, error });
      throw error;
    }
  }, [folder, onImagesChange, onUploadStart, onUploadComplete]);

  // Обработка файлов - загрузка на сервер
  const processFiles = useCallback(async (files) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const currentImages = imagesRef.current;
    const startOrdering = currentImages.length;

    // Создаем записи для новых изображений с пометкой о pending загрузке
    const newImages = fileArray.map((file, index) => {
      const uploadKey = `${file.name}-${file.size}-${startOrdering + index}`;
      return {
        file,
        image_url: URL.createObjectURL(file), // Blob URL для предпросмотра
        is_main: currentImages.length === 0 && index === 0, // Первое изображение становится главным
        isNew: true,
        image_id: null,
        image_key: null,
        upload_id: null,
        toDelete: false,
        ordering: startOrdering + index,
        pendingUploadKey: uploadKey, // Ключ для отслеживания загрузки
        uploadError: null,
      };
    });

    const updatedImages = multiple
      ? [...currentImages, ...newImages]
      : newImages.slice(0, 1);

    console.log('[ImageCarousel] Загрузка файлов:', {
      loadedFiles: fileArray.length,
      existingImages: currentImages.length,
      newImagesCount: newImages.length,
      totalImages: updatedImages.length,
      multiple,
    });

    onImagesChange(updatedImages);

    // Запускаем загрузку всех файлов асинхронно
    const uploadPromises = fileArray.map((file, index) =>
      uploadSingleFile(file, startOrdering + index)
    );

    // Ждем завершения всех загрузок (но не блокируем UI)
    await Promise.allSettled(uploadPromises);
  }, [multiple, onImagesChange, uploadSingleFile]);

  const handleFileSelect = useCallback((e) => {
    processFiles(e.target.files);
    // Сбрасываем value input, чтобы можно было загрузить тот же файл снова
    e.target.value = '';
  }, [processFiles]);

  const handleDropZone = useCallback((e) => {
    e.preventDefault();
    setIsDragOverZone(false);

    if (disabled) return;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      // Фильтруем только изображения
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        processFiles(imageFiles);
      }
    }
  }, [disabled, processFiles]);

  const handleDragOverZone = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOverZone(true);
  }, [disabled]);

  const handleDragLeaveZone = useCallback(() => {
    setIsDragOverZone(false);
  }, []);

  const handleDeleteImage = useCallback((index) => {
    const imageToDelete = images[index];

    // Освобождаем память от blob URL для новых изображений
    if (imageToDelete.isNew && imageToDelete.image_url?.startsWith('blob:')) {
      URL.revokeObjectURL(imageToDelete.image_url);
    }

    // Если изображение существующее (не новое), помечаем его на удаление
    if (!imageToDelete.isNew && (imageToDelete.image_id || imageToDelete.image_key || imageToDelete.upload_id)) {
      const updatedImages = images.map((img, i) =>
        i === index ? { ...img, toDelete: true } : img
      );
      onImagesChange(updatedImages);
      return;
    }

    // Для новых изображений (включая те, что загружаются) просто удаляем из списка
    const updatedImages = images.filter((_, i) => i !== index);

    // Если удалили главное изображение, делаем первое главным
    if (imageToDelete.is_main && updatedImages.length > 0) {
      updatedImages[0] = { ...updatedImages[0], is_main: true };
    }

    onImagesChange(updatedImages);
  }, [images, onImagesChange]);

  const handleSetMainImage = useCallback((index) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      is_main: i === index,
    }));

    // Проверка: убеждаемся, что только одно изображение главное
    const mainCount = updatedImages.filter(img => img.is_main).length;
    console.log('[ImageCarousel] Смена главного изображения:', {
      newIndex: index,
      mainImagesCount: mainCount,
      updatedImages: updatedImages.map(i => ({
        image_id: i.image_id,
        image_key: i.image_key,
        upload_id: i.upload_id,
        is_main: i.is_main,
        ordering: i.ordering,
        isNew: i.isNew
      })),
    });

    if (mainCount !== 1) {
      console.error('[ImageCarousel] ОШИБКА: Должно быть только одно главное изображение!');
    }

    onImagesChange(updatedImages);
  }, [images, onImagesChange]);

  const handleDragStart = useCallback((e, index) => {
    if (disabled) return;
    // Не разрешаем перетаскивание для загружаемых файлов
    if (images[index]?.pendingUploadKey) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Создаем прозрачный drag image
    const dragImage = document.createElement('div');
    dragImage.style.opacity = '0.5';
    dragImage.textContent = '🖼️';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 50);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }, [disabled, images]);

  const handleDragOver = useCallback((e, index) => {
    if (disabled || draggedIndex === null || draggedIndex === index) return;
    // Не разрешаем перетаскивание на загружаемые файлы
    if (images[index]?.pendingUploadKey) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, [disabled, draggedIndex, images]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    if (disabled || draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    // Не разрешаем сброс на загружаемые файлы
    if (images[dropIndex]?.pendingUploadKey) return;

    e.preventDefault();

    const updatedImages = [...images];
    const [draggedItem] = updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(dropIndex, 0, draggedItem);

    // Пересчитываем ordering для всех изображений
    updatedImages.forEach((img, idx) => {
      img.ordering = idx;
    });

    console.log('[ImageCarousel] Изменение порядка:', {
      from: draggedIndex,
      to: dropIndex,
      newOrdering: updatedImages.map(i => ({
        image_id: i.image_id,
        image_key: i.image_key,
        upload_id: i.upload_id,
        ordering: i.ordering
      })),
    });

    onImagesChange(updatedImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [disabled, draggedIndex, images, onImagesChange]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const triggerFileInput = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Получение ключа для React key
  const getImageKey = (image, index) => {
    if (image.upload_id) return `uploaded-${image.upload_id}`;
    if (image.image_id) return `existing-${image.image_id}`;
    if (image.pendingUploadKey) return `uploading-${image.pendingUploadKey}`;
    return image.image_url || index;
  };

  // Проверка: идет ли загрузка какого-либо файла
  const hasUploadingFiles = Object.keys(uploadingFiles).length > 0;

  return (
    <div className="image-carousel">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="image-carousel__file-input"
        disabled={disabled}
      />

      {images.length > 0 || hasUploadingFiles ? (
        <div className="image-carousel__grid">
          {images.map((image, index) => {
            const uploadKey = image.pendingUploadKey;
            const uploadState = uploadKey ? uploadingFiles[uploadKey] : null;
            const isUploading = !!uploadState;
            const uploadProgress = uploadState?.progress || 0;
            const timeElapsed = uploadState ? Date.now() - uploadState.startTime : 0;
            const timeRemaining = Math.max(0, UPLOAD_TIMEOUT - timeElapsed);

            return (
              <div
                key={getImageKey(image, index)}
                className={`image-carousel__item ${image.is_main ? 'image-carousel__item--main' : ''} ${
                  dragOverIndex === index ? 'image-carousel__item--drag-over' : ''
                } ${draggedIndex === index ? 'image-carousel__item--dragging' : ''} ${
                  image.toDelete ? 'image-carousel__item--to-delete' : ''
                } ${isUploading ? 'image-carousel__item--uploading' : ''} ${
                  image.uploadError ? 'image-carousel__item--error' : ''
                }`}
                draggable={!disabled && !image.toDelete && !isUploading}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="image-carousel__image-wrapper">
                  {image.image_url ? (
                    <img
                      src={image.image_url}
                      alt={`Изображение ${index + 1}`}
                      className="image-carousel__image"
                      style={{ opacity: isUploading ? 0.5 : 1 }}
                    />
                  ) : (
                    <div className="image-carousel__placeholder">
                      <FiImage size={32} />
                    </div>
                  )}

                  {/* Спиннер загрузки */}
                  {isUploading && (
                    <div className="image-carousel__upload-overlay">
                      <div className="image-carousel__upload-spinner">
                        <FiLoader className="image-carousel__spinner-icon" />
                        <span className="image-carousel__upload-progress">{uploadProgress}%</span>
                      </div>
                      <div className="image-carousel__upload-timer">
                        {Math.ceil(timeRemaining / 1000)}с
                      </div>
                    </div>
                  )}

                  {/* Ошибка загрузки */}
                  {image.uploadError && (
                    <div className="image-carousel__upload-error">
                      <span>Ошибка</span>
                      <button
                        type="button"
                        className="image-carousel__retry-btn"
                        onClick={() => uploadSingleFile(image.file, index)}
                      >
                        Повторить
                      </button>
                    </div>
                  )}

                  {image.is_main && !image.toDelete && !isUploading && (
                    <span className="image-carousel__main-badge">Главное</span>
                  )}
                  {image.toDelete && (
                    <span className="image-carousel__delete-badge">
                      <FiTrash2 /> Будет удалено
                    </span>
                  )}
                </div>

                {!disabled && !image.toDelete && !isUploading && (
                  <div className="image-carousel__controls">
                    {!image.is_main && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetMainImage(index)}
                        className="image-carousel__control-btn"
                        title="Сделать главным"
                      >
                        Сделать главным
                      </Button>
                    )}
                    {showDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteImage(index)}
                        className="image-carousel__control-btn image-carousel__control-btn--delete"
                        title="Удалить изображение"
                      >
                        <FiTrash2 />
                      </Button>
                    )}
                  </div>
                )}

                {image.toDelete && !disabled && (
                  <div className="image-carousel__restore">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const updatedImages = images.map((img, i) =>
                          i === index ? { ...img, toDelete: false } : img
                        );
                        onImagesChange(updatedImages);
                      }}
                    >
                      Восстановить
                    </Button>
                  </div>
                )}

                {!disabled && !image.toDelete && !isUploading && (
                  <div className="image-carousel__drag-handle">
                    <span>⋮⋮</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className={`image-carousel__empty ${isDragOverZone ? 'image-carousel__empty--drag-over' : ''}`}
          onClick={!disabled ? triggerFileInput : undefined}
          onDrop={handleDropZone}
          onDragOver={handleDragOverZone}
          onDragLeave={handleDragLeaveZone}
        >
          <FiImage size={48} />
          <p>Нет изображений</p>
          {!disabled && (
            <>
              <span className="image-carousel__empty-hint">
                Перетащите изображения сюда или нажмите кнопку
              </span>
              <Button
                variant="secondary"
                leftIcon={<FiUpload />}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}
              >
                Загрузить изображения
              </Button>
            </>
          )}
        </div>
      )}

      {!disabled && images.length > 0 && (
        <div className="image-carousel__actions">
          <Button
            variant="secondary"
            leftIcon={<FiUpload />}
            onClick={triggerFileInput}
            disabled={hasUploadingFiles}
          >
            {multiple ? 'Добавить изображения' : 'Загрузить изображение'}
          </Button>
          {hasUploadingFiles && (
            <span className="image-carousel__uploading-hint">
              Загрузка {Object.keys(uploadingFiles).length} файл(ов)...
            </span>
          )}
        </div>
      )}
    </div>
  );
}
