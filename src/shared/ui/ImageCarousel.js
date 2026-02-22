import { useState, useRef, useCallback, useEffect } from 'react';
import { FiUpload, FiTrash2, FiImage } from 'react-icons/fi';
import { Button } from './Button';
import './ImageCarousel.css';

/**
 * Компонент карусели изображений с поддержкой drag-and-drop
 * @param {Array} images - Массив изображений [{image_url: string, is_main: bool, ordering?: number}]
 * @param {Function} onImagesChange - Callback при изменении изображений
 * @param {boolean} multiple - Возможность загрузки нескольких изображений
 * @param {boolean} showDelete - Показывать кнопку удаления
 * @param {boolean} disabled - Отключено ли редактирование
 */
export function ImageCarousel({
  images = [],
  onImagesChange,
  multiple = true,
  showDelete = true,
  disabled = false,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDragOverZone, setIsDragOverZone] = useState(false);
  const fileInputRef = useRef(null);
  const imagesRef = useRef(images);

  // Обновляем ref при изменении images
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const processFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const currentImages = imagesRef.current;
    const newImages = fileArray.map((file, index) => ({
      file,
      image_url: URL.createObjectURL(file),
      is_main: currentImages.length === 0 && index === 0, // Первое изображение становится главным
      isNew: true,
      image_id: null,
      image_key: null,
      toDelete: false,
    }));

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
  }, [multiple, onImagesChange]);

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
    // вместо физического удаления, чтобы отправить to_delete на сервер
    if (!imageToDelete.isNew && (imageToDelete.image_id || imageToDelete.image_key)) {
      const updatedImages = images.map((img, i) =>
        i === index ? { ...img, toDelete: true } : img
      );
      onImagesChange(updatedImages);
      return;
    }

    // Для новых изображений просто удаляем из списка
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
    console.log('[ImageCarousel] Смена главного изображения:', {
      newIndex: index,
      updatedImages: updatedImages.map(i => ({ 
        image_id: i.image_id, 
        image_key: i.image_key, 
        is_main: i.is_main,
        isNew: i.isNew 
      })),
    });
    onImagesChange(updatedImages);
  }, [images, onImagesChange]);

  const handleDragStart = useCallback((e, index) => {
    if (disabled) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Создаем прозрачный drag image
    const dragImage = document.createElement('div');
    dragImage.style.opacity = '0.5';
    dragImage.textContent = '🖼️';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 50);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }, [disabled]);

  const handleDragOver = useCallback((e, index) => {
    if (disabled || draggedIndex === null || draggedIndex === index) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, [disabled, draggedIndex]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    if (disabled || draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    e.preventDefault();

    const updatedImages = [...images];
    const [draggedItem] = updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(dropIndex, 0, draggedItem);

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

      {images.length > 0 ? (
        <div className="image-carousel__grid">
          {images.map((image, index) => (
            <div
              key={image.image_id ? `existing-${image.image_id}` : image.image_url || index}
              className={`image-carousel__item ${image.is_main ? 'image-carousel__item--main' : ''} ${
                dragOverIndex === index ? 'image-carousel__item--drag-over' : ''
              } ${draggedIndex === index ? 'image-carousel__item--dragging' : ''} ${
                image.toDelete ? 'image-carousel__item--to-delete' : ''
              }`}
              draggable={!disabled && !image.toDelete}
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
                  />
                ) : (
                  <div className="image-carousel__placeholder">
                    <FiImage size={32} />
                  </div>
                )}
                {image.is_main && !image.toDelete && (
                  <span className="image-carousel__main-badge">Главное</span>
                )}
                {image.toDelete && (
                  <span className="image-carousel__delete-badge">
                    <FiTrash2 /> Будет удалено
                  </span>
                )}
              </div>

              {!disabled && !image.toDelete && (
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

              {!disabled && !image.toDelete && (
                <div className="image-carousel__drag-handle">
                  <span>⋮⋮</span>
                </div>
              )}
            </div>
          ))}
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
          >
            {multiple ? 'Добавить изображения' : 'Загрузить изображение'}
          </Button>
        </div>
      )}
    </div>
  );
}
