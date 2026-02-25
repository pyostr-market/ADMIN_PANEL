import { useState, useRef, useCallback, useEffect } from 'react';
import { FiUpload, FiTrash2, FiImage, FiLoader } from 'react-icons/fi';
import { Button } from '../Button/Button';
import styles from './ImageCarousel.module.css';

const UPLOAD_TIMEOUT = 10000;

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
  const [uploadingFiles, setUploadingFiles] = useState({});
  const fileInputRef = useRef(null);
  const imagesRef = useRef(images);
  const uploadingRef = useRef(uploadingFiles);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    uploadingRef.current = uploadingFiles;
  }, [uploadingFiles]);

  const uploadSingleFile = useCallback(async (file, imageIndex) => {
    const startTime = Date.now();
    const uploadKey = `${file.name}-${file.size}-${imageIndex}`;

    setUploadingFiles(prev => ({
      ...prev,
      [uploadKey]: { progress: 0, startTime, file },
    }));

    onUploadStart?.();

    try {
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

      const currentImages = imagesRef.current;
      const updatedImages = currentImages.map((img, idx) => {
        if (idx === imageIndex && img.pendingUploadKey === uploadKey) {
          console.log(result)
          return {
            ...img,
            upload_id: result.upload_id,
            file_path: result.file_path,
            public_url: result.public_url,
            image_url: result.public_url,
            isNew: true,
            pendingUploadKey: null,
          };
        }
        return img;
      });

      onImagesChange(updatedImages);

      setUploadingFiles(prev => {
        const next = { ...prev };
        delete next[uploadKey];
        return next;
      });

      onUploadComplete?.({ success: true, result });
      return result;
    } catch (error) {
      console.error('[ImageCarousel] Ошибка загрузки файла:', error);

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

      setUploadingFiles(prev => {
        const next = { ...prev };
        delete next[uploadKey];
        return next;
      });

      onUploadComplete?.({ success: false, error });
      throw error;
    }
  }, [folder, onImagesChange, onUploadStart, onUploadComplete]);

  const processFiles = useCallback(async (files) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const currentImages = imagesRef.current;
    const startOrdering = currentImages.length;

    const newImages = fileArray.map((file, index) => {
      const uploadKey = `${file.name}-${file.size}-${startOrdering + index}`;
      return {
        file,
        image_url: URL.createObjectURL(file),
        is_main: currentImages.length === 0 && index === 0,
        isNew: true,
        image_id: null,
        image_key: null,
        upload_id: null,
        toDelete: false,
        ordering: startOrdering + index,
        pendingUploadKey: uploadKey,
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

    const uploadPromises = fileArray.map((file, index) =>
      uploadSingleFile(file, startOrdering + index)
    );

    await Promise.allSettled(uploadPromises);
  }, [multiple, onImagesChange, uploadSingleFile]);

  const handleFileSelect = useCallback((e) => {
    processFiles(e.target.files);
    e.target.value = '';
  }, [processFiles]);

  const handleDropZone = useCallback((e) => {
    e.preventDefault();
    setIsDragOverZone(false);

    if (disabled) return;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
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

    if (imageToDelete.isNew && imageToDelete.image_url?.startsWith('blob:')) {
      URL.revokeObjectURL(imageToDelete.image_url);
    }

    if (!imageToDelete.isNew && (imageToDelete.image_id || imageToDelete.image_key || imageToDelete.upload_id)) {
      const updatedImages = images.map((img, i) =>
        i === index ? { ...img, toDelete: true } : img
      );
      onImagesChange(updatedImages);
      return;
    }

    const updatedImages = images.filter((_, i) => i !== index);

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
    if (images[index]?.pendingUploadKey) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    const dragImage = document.createElement('div');
    dragImage.style.opacity = '0.5';
    dragImage.textContent = '🖼️';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 50);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }, [disabled, images]);

  const handleDragOver = useCallback((e, index) => {
    if (disabled || draggedIndex === null || draggedIndex === index) return;
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
    if (images[dropIndex]?.pendingUploadKey) return;

    e.preventDefault();

    const updatedImages = [...images];
    const [draggedItem] = updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(dropIndex, 0, draggedItem);

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

  const getImageKey = (image, index) => {
    if (image.upload_id) return `uploaded-${image.upload_id}`;
    if (image.image_id) return `existing-${image.image_id}`;
    if (image.pendingUploadKey) return `uploading-${image.pendingUploadKey}`;
    return image.image_url || index;
  };

  const hasUploadingFiles = Object.keys(uploadingFiles).length > 0;

  return (
    <div className={styles.imageCarousel}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className={styles.imageCarouselFileInput}
        disabled={disabled}
      />

      {images.length > 0 || hasUploadingFiles ? (
        <div className={styles.imageCarouselGrid}>
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
                className={`${styles.imageCarouselItem} ${image.is_main ? styles.imageCarouselItemMain : ''} ${
                  dragOverIndex === index ? styles.imageCarouselItemDragOver : ''
                } ${draggedIndex === index ? styles.imageCarouselItemDragging : ''} ${
                  image.toDelete ? styles.imageCarouselItemToDelete : ''
                } ${isUploading ? styles.imageCarouselItemUploading : ''} ${
                  image.uploadError ? styles.imageCarouselItemError : ''
                }`}
                draggable={!disabled && !image.toDelete && !isUploading}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className={styles.imageCarouselImageWrapper}>
                  {image.image_url ? (
                    <img
                      src={image.image_url}
                      alt={`Изображение ${index + 1}`}
                      className={styles.imageCarouselImage}
                      style={{ opacity: isUploading ? 0.5 : 1 }}
                    />
                  ) : (
                    <div className={styles.imageCarouselPlaceholder}>
                      <FiImage size={32} />
                    </div>
                  )}

                  {isUploading && (
                    <div className={styles.imageCarouselUploadOverlay}>
                      <div className={styles.imageCarouselUploadSpinner}>
                        <FiLoader className={styles.imageCarouselSpinnerIcon} />
                        <span className={styles.imageCarouselUploadProgress}>{uploadProgress}%</span>
                      </div>
                      <div className={styles.imageCarouselUploadTimer}>
                        {Math.ceil(timeRemaining / 1000)}с
                      </div>
                    </div>
                  )}

                  {image.uploadError && (
                    <div className={styles.imageCarouselUploadError}>
                      <span>Ошибка</span>
                      <button
                        type="button"
                        className={styles.imageCarouselRetryBtn}
                        onClick={() => uploadSingleFile(image.file, index)}
                      >
                        Повторить
                      </button>
                    </div>
                  )}

                  {image.is_main && !image.toDelete && !isUploading && (
                    <span className={styles.imageCarouselMainBadge}>Главное</span>
                  )}
                  {image.toDelete && (
                    <span className={styles.imageCarouselDeleteBadge}>
                      <FiTrash2 /> Будет удалено
                    </span>
                  )}
                </div>

                {!disabled && !image.toDelete && !isUploading && (
                  <div className={styles.imageCarouselControls}>
                    {!image.is_main && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetMainImage(index)}
                        className={styles.imageCarouselControlBtn}
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
                        className={`${styles.imageCarouselControlBtn} ${styles.imageCarouselControlBtnDelete}`}
                        title="Удалить изображение"
                      >
                        <FiTrash2 />
                      </Button>
                    )}
                  </div>
                )}

                {image.toDelete && !disabled && (
                  <div className={styles.imageCarouselRestore}>
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
                  <div className={styles.imageCarouselDragHandle}>
                    <span>⋮⋮</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className={`${styles.imageCarouselEmpty} ${isDragOverZone ? styles.imageCarouselEmptyDragOver : ''}`}
          onClick={!disabled ? triggerFileInput : undefined}
          onDrop={handleDropZone}
          onDragOver={handleDragOverZone}
          onDragLeave={handleDragLeaveZone}
        >
          <FiImage size={48} />
          <p>Нет изображений</p>
          {!disabled && (
            <>
              <span className={styles.imageCarouselEmptyHint}>
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
        <div className={styles.imageCarouselActions}>
          <Button
            variant="secondary"
            leftIcon={<FiUpload />}
            onClick={triggerFileInput}
            disabled={hasUploadingFiles}
          >
            {multiple ? 'Добавить изображения' : 'Загрузить изображение'}
          </Button>
          {hasUploadingFiles && (
            <span className={styles.imageCarouselUploadingHint}>
              Загрузка {Object.keys(uploadingFiles).length} файл(ов)...
            </span>
          )}
        </div>
      )}
    </div>
  );
}
