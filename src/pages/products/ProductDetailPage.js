import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiBox, FiDollarSign, FiTag, FiPackage, FiFileText, FiClock, FiImage, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { Modal } from '../../shared/ui/Modal';
import { PermissionGate } from '../../shared/ui/PermissionGate';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import {
  getProductByIdRequest,
  updateProductRequest,
  deleteProductRequest,
} from './api/productsApi';
import './ProductDetailPage.css';

function EditProductModal({ product, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price?.toString() || '',
    description: product?.description || '',
  });

  useEffect(() => {
    setFormData({
      name: product?.name || '',
      price: product?.price?.toString() || '',
      description: product?.description || '',
    });
  }, [product]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Редактирование товара"
      size="md"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            variant="primary"
            onClick={() => onSubmit(formData)}
            loading={isSubmitting}
          >
            Сохранить
          </Button>
        </>
      )}
    >
      <div className="edit-product-form">
        <label className="edit-product-form__field">
          <span className="edit-product-form__label">Название</span>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Введите название"
          />
        </label>

        <label className="edit-product-form__field">
          <span className="edit-product-form__label">Цена</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
            placeholder="0.00"
          />
        </label>

        <label className="edit-product-form__field">
          <span className="edit-product-form__label">Описание</span>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Введите описание"
            rows={4}
          />
        </label>
      </div>
    </Modal>
  );
}

function DeleteProductModal({ product, onClose, onSubmit, isSubmitting }) {
  if (!product) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление товара"
      size="sm"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button
            variant="danger"
            onClick={onSubmit}
            loading={isSubmitting}
          >
            Удалить
          </Button>
        </>
      )}
    >
      <p className="modal-confirm-text">
        Вы уверены, что хотите удалить товар{' '}
        <strong>{product.name || `ID: ${product.id}`}</strong>?
      </p>
      <p className="modal-confirm-note">
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

function ImageGallery({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="product-images__empty">
        <FiImage size={48} />
        <p>Нет изображений</p>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="product-images">
      <div className="product-images__main">
        <img
          src={images[currentIndex]?.image_url}
          alt={`Изображение ${currentIndex + 1}`}
          className="product-images__main-image"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="product-images__nav product-images__nav--prev"
              onClick={goToPrevious}
            >
              <FiChevronLeft />
            </button>
            <button
              type="button"
              className="product-images__nav product-images__nav--next"
              onClick={goToNext}
            >
              <FiChevronRight />
            </button>
          </>
        )}
        {images[currentIndex]?.is_main && (
          <span className="product-images__main-badge">Главное</span>
        )}
      </div>

      {images.length > 1 && (
        <div className="product-images__thumbnails">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              className={`product-images__thumbnail ${
                index === currentIndex ? 'product-images__thumbnail--active' : ''
              } ${image.is_main ? 'product-images__thumbnail--main' : ''}`}
              onClick={() => setCurrentIndex(index)}
            >
              <img src={image.image_url} alt={`Миниатюра ${index + 1}`} />
              {image.is_main && <span className="product-images__thumbnail-badge">★</span>}
            </button>
          ))}
        </div>
      )}

      <div className="product-images__counter">
        {currentIndex + 1} из {images.length}
      </div>
    </div>
  );
}

export function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProductByIdRequest(productId);
      setProduct(data);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleSaveProduct = async (payload) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('price', parseFloat(payload.price));
      formData.append('description', payload.description);

      await updateProductRequest(productId, formData);
      await loadProduct();
      notificationsRef.current?.info('Товар обновлен');
      setIsEditModalOpen(false);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    setIsDeleting(true);
    try {
      await deleteProductRequest(productId);
      notificationsRef.current?.info('Товар удален');
      navigate('/catalog/products');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="product-detail-page">
        <div className="product-detail-page__loading">
          <div className="loading-spinner" />
          <p>Загрузка данных товара...</p>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="product-detail-page">
        <div className="product-detail-page__error">
          <h2>Товар не найден</h2>
          <p>Запрошенный товар не существует или был удален</p>
          <Button variant="primary" onClick={() => navigate('/catalog/products')}>
            К списку товаров
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="product-detail-page">
      <header className="product-detail-page__header">
        <div className="product-detail-page__header-left">
          <Button variant="ghost" onClick={() => navigate('/catalog/products')} className="back-button">
            ← Назад
          </Button>
          <div className="product-detail-page__user-info">
            <div className="product-detail-page__avatar">
              <FiBox />
            </div>
            <div className="product-detail-page__header-text">
              <h1 className="product-detail-page__title">
                {product.name || `Товар #${product.id}`}
              </h1>
            </div>
          </div>
        </div>
        <div className="product-detail-page__actions">
          <PermissionGate permission={['product:update']} fallback={null}>
            <Button
              variant="secondary"
              leftIcon={<FiEdit2 />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Редактировать
            </Button>
          </PermissionGate>
          <PermissionGate permission={['product:delete']} fallback={null}>
            <Button
              variant="danger"
              leftIcon={<FiTrash2 />}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Удалить
            </Button>
          </PermissionGate>
        </div>
      </header>

      <div className="product-detail-page__content">
        <div className="product-detail-page__grid">
          {/* Левая колонка - Изображения */}
          <div className="product-detail-page__panel">
            <div className="panel-header">
              <div className="panel-header__content">
                <h2 className="panel-title">
                  <FiImage className="panel-title__icon" />
                  Изображения
                </h2>
              </div>
            </div>
            <div className="panel-content">
              <ImageGallery images={product.images} />
            </div>
          </div>

          {/* Правая колонка - Информация */}
          <div className="product-detail-page__panel">
            <div className="panel-header">
              <div className="panel-header__content">
                <h2 className="panel-title">
                  <FiBox className="panel-title__icon" />
                  Информация
                </h2>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<FiClock />}
                  onClick={() => navigate(`/catalog/products/${productId}/audit`)}
                >
                  История
                </Button>
              </div>
            </div>
            <div className="panel-content">
              <div className="product-info-grid">
                <div className="info-card info-card--highlight">
                  <div className="info-card__icon info-card__icon--primary">
                    <FiDollarSign />
                  </div>
                  <div className="info-card__content">
                    <span className="info-card__label">Цена</span>
                    <span className="info-card__value info-card__value--large">
                      {product.price?.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-card__icon info-card__icon--secondary">
                    <FiTag />
                  </div>
                  <div className="info-card__content">
                    <span className="info-card__label">ID товара</span>
                    <span className="info-card__value">{product.id}</span>
                  </div>
                </div>

                {product.category_id && (
                  <div className="info-card">
                    <div className="info-card__icon info-card__icon--accent">
                      <FiTag />
                    </div>
                    <div className="info-card__content">
                      <span className="info-card__label">Категория</span>
                      <span className="info-card__value">{product.category_id}</span>
                    </div>
                  </div>
                )}

                {product.product_type_id && (
                  <div className="info-card">
                    <div className="info-card__icon info-card__icon--info">
                      <FiPackage />
                    </div>
                    <div className="info-card__content">
                      <span className="info-card__label">Тип продукта</span>
                      <span className="info-card__value">{product.product_type_id}</span>
                    </div>
                  </div>
                )}

                {product.supplier_id && (
                  <div className="info-card">
                    <div className="info-card__icon info-card__icon--success">
                      <FiBox />
                    </div>
                    <div className="info-card__content">
                      <span className="info-card__label">Поставщик</span>
                      <span className="info-card__value">{product.supplier_id}</span>
                    </div>
                  </div>
                )}
              </div>

              {product.description && (
                <div className="product-description">
                  <h3 className="product-description__title">Описание</h3>
                  <p className="product-description__text">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Атрибуты */}
        {product.attributes && product.attributes.length > 0 && (
          <div className="product-detail-page__panel">
            <div className="panel-header">
              <div className="panel-header__content">
                <h2 className="panel-title">
                  <FiFileText className="panel-title__icon" />
                  Атрибуты
                </h2>
              </div>
            </div>
            <div className="panel-content">
              <div className="attributes-grid">
                {product.attributes.map((attr, index) => (
                  <div key={index} className="attribute-card">
                    <div className="attribute-card__header">
                      <span className="attribute-card__name">{attr.name}</span>
                      {attr.is_filterable && (
                        <span className="attribute-card__filterable">Фильтруемый</span>
                      )}
                    </div>
                    <span className="attribute-card__value">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <EditProductModal
          product={product}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleSaveProduct}
          isSubmitting={isSaving}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteProductModal
          product={product}
          onClose={() => setIsDeleteModalOpen(false)}
          onSubmit={handleDeleteProduct}
          isSubmitting={isDeleting}
        />
      )}
    </section>
  );
}
