import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiBox, FiDollarSign, FiTag, FiPackage, FiFileText, FiClock, FiImage, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getProductByIdRequest,
  deleteProductRequest,
} from '../api/productsApi';
import styles from './ProductDetailPage.module.css';

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
      <p className={styles.modalConfirmText}>
        Вы уверены, что хотите удалить товар{' '}
        <strong>{product.name || `ID: ${product.id}`}</strong>?
      </p>
      <p className={styles.modalConfirmNote}>
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

function ImageGallery({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={styles.productImagesEmpty}>
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
    <div className={styles.productImages}>
      <div className={styles.productImagesMain}>
        <img
          src={images[currentIndex]?.image_url}
          alt={`Изображение ${currentIndex + 1}`}
          className={styles.productImagesMainImage}
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.productImagesNav} ${styles.productImagesNavPrev}`}
              onClick={goToPrevious}
            >
              <FiChevronLeft />
            </button>
            <button
              type="button"
              className={`${styles.productImagesNav} ${styles.productImagesNavNext}`}
              onClick={goToNext}
            >
              <FiChevronRight />
            </button>
          </>
        )}
        {images[currentIndex]?.is_main && (
          <span className={styles.productImagesMainBadge}>Главное</span>
        )}
      </div>

      {images.length > 1 && (
        <div className={styles.productImagesThumbnails}>
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.productImagesThumbnail} ${
                index === currentIndex ? styles.productImagesThumbnailActive : ''
              } ${image.is_main ? styles.productImagesThumbnailMain : ''}`}
              onClick={() => setCurrentIndex(index)}
            >
              <img src={image.image_url} alt={`Миниатюра ${index + 1}`} />
              {image.is_main && <span className={styles.productImagesThumbnailBadge}>★</span>}
            </button>
          ))}
        </div>
      )}

      <div className={styles.productImagesCounter}>
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
  const [isDeleting, setIsDeleting] = useState(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleEditProduct = () => {
    navigate(`/catalog/products/${productId}/edit`);
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
      <section className={styles.productDetailPage}>
        <div className={styles.productDetailPageLoading}>
          <div className="loading-spinner" />
          <p>Загрузка данных товара...</p>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className={styles.productDetailPage}>
        <div className={styles.productDetailPageError}>
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
    <section className={styles.productDetailPage}>
      <header className={styles.productDetailPageHeader}>
        <Button variant="ghost" onClick={() => navigate('/catalog/products')} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.productDetailPageActions}>
          <PermissionGate permission={['product:update']} fallback={null}>
            <Button
              variant="secondary"
              leftIcon={<FiEdit2 />}
              onClick={handleEditProduct}
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

      <div className={styles.productDetailPageContent}>
        <div className={styles.productDetailPageGrid}>
          {/* Левая колонка - Изображения */}
          <div className={styles.productDetailPagePanel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelHeaderContent}>
                <h2 className={styles.panelTitle}>
                  <FiImage className={styles.panelTitleIcon} />
                  Изображения
                </h2>
              </div>
            </div>
            <div className={styles.panelContent}>
              <ImageGallery images={product.images} />
            </div>
          </div>

          {/* Правая колонка - Информация */}
          <div className={styles.productDetailPagePanel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelHeaderContent}>
                <h2 className={styles.panelTitle}>
                  <FiBox className={styles.panelTitleIcon} />
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
            <div className={styles.panelContent}>
              <div className={styles.productInfoGrid}>
                <div className={`${styles.infoCard} ${styles.infoCardHighlight}`}>
                  <div className={`${styles.infoCardIcon} ${styles.infoCardIconPrimary}`}>
                    <FiDollarSign />
                  </div>
                  <div className={styles.infoCardContent}>
                    <span className={styles.infoCardLabel}>Цена</span>
                    <span className={`${styles.infoCardValue} ${styles.infoCardValueLarge}`}>
                      {product.price?.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <div className={`${styles.infoCardIcon} ${styles.infoCardIconSecondary}`}>
                    <FiTag />
                  </div>
                  <div className={styles.infoCardContent}>
                    <span className={styles.infoCardLabel}>ID товара</span>
                    <span className={styles.infoCardValue}>{product.id}</span>
                  </div>
                </div>

                {product.category && (
                  <div className={styles.infoCard}>
                    <div className={`${styles.infoCardIcon} ${styles.infoCardIconAccent}`}>
                      <FiTag />
                    </div>
                    <div className={styles.infoCardContent}>
                      <span className={styles.infoCardLabel}>Категория</span>
                      <span className={styles.infoCardValue}>{product.category.name}</span>
                    </div>
                  </div>
                )}

                {product.product_type && (
                  <div className={styles.infoCard}>
                    <div className={`${styles.infoCardIcon} ${styles.infoCardIconInfo}`}>
                      <FiPackage />
                    </div>
                    <div className={styles.infoCardContent}>
                      <span className={styles.infoCardLabel}>Тип продукта</span>
                      <span className={styles.infoCardValue}>{product.product_type.name}</span>
                    </div>
                  </div>
                )}

                {product.supplier && (
                  <div className={styles.infoCard}>
                    <div className={`${styles.infoCardIcon} ${styles.infoCardIconSuccess}`}>
                      <FiBox />
                    </div>
                    <div className={styles.infoCardContent}>
                      <span className={styles.infoCardLabel}>Поставщик</span>
                      <span className={styles.infoCardValue}>{product.supplier.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Нижняя секция: Атрибуты и Описание */}
        <div className={styles.productDetailPageBottomGrid}>
          {/* Атрибуты */}
          {product.attributes && product.attributes.length > 0 && (
            <div className={styles.productDetailPagePanel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelHeaderContent}>
                  <h2 className={styles.panelTitle}>
                    <FiFileText className={styles.panelTitleIcon} />
                    Атрибуты
                  </h2>
                </div>
              </div>
              <div className={styles.panelContent}>
                <div className={styles.attributesGrid}>
                  {product.attributes.map((attr, index) => (
                    <div key={index} className={styles.attributeCard}>
                      <div className={styles.attributeCardHeader}>
                        <span className={styles.attributeCardName}>{attr.name}</span>
                        {attr.is_filterable && (
                          <span className={styles.attributeCardFilterable}>Фильтруемый</span>
                        )}
                      </div>
                      <span className={styles.attributeCardValue}>{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Описание */}
          {product.description && (
            <div className={styles.productDetailPagePanel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelHeaderContent}>
                  <h2 className={styles.panelTitle}>
                    <FiFileText className={styles.panelTitleIcon} />
                    Описание
                  </h2>
                </div>
              </div>
              <div className={styles.panelContent}>
                <div
                  className={styles.productDescriptionText}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

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
