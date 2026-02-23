import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiBox, FiClock } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { Modal } from '../../shared/ui/Modal';
import { PermissionGate } from '../../shared/ui/PermissionGate';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import {
  getProductTypeByIdRequest,
  updateProductTypeRequest,
  deleteProductTypeRequest,
} from './api/productTypesApi';
import './ProductTypeDetailPage.css';

function EditProductTypeModal({ productType, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: productType?.name || '',
    parent_id: productType?.parent_id || '',
  });

  useEffect(() => {
    setFormData({
      name: productType?.name || '',
      parent_id: productType?.parent_id || '',
    });
  }, [productType]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Редактирование типа продукта"
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
      <div className="edit-product-type-form">
        <label className="edit-product-type-form__field">
          <span className="edit-product-type-form__label">Название</span>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Введите название"
          />
        </label>

        <label className="edit-product-type-form__field">
          <span className="edit-product-type-form__label">Родительский тип</span>
          <input
            type="number"
            value={formData.parent_id}
            onChange={(e) => handleChange('parent_id', e.target.value)}
            placeholder="ID родительского типа"
            min="1"
          />
        </label>
      </div>
    </Modal>
  );
}

function DeleteProductTypeModal({ productType, onClose, onSubmit, isSubmitting }) {
  if (!productType) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление типа продукта"
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
        Вы уверены, что хотите удалить тип продукта{' '}
        <strong>{productType.name || `ID: ${productType.id}`}</strong>?
      </p>
      <p className="modal-confirm-note">
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function ProductTypeDetailPage() {
  const { productTypeId } = useParams();
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [productType, setProductType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loadProductType = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProductTypeByIdRequest(productTypeId);
      setProductType(data);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [productTypeId]);

  useEffect(() => {
    loadProductType();
  }, [loadProductType]);

  const handleSaveProductType = async (payload) => {
    setIsSaving(true);
    try {
      await updateProductTypeRequest(productTypeId, payload);
      await loadProductType();
      notificationsRef.current?.info('Тип продукта обновлен');
      setIsEditModalOpen(false);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProductType = async () => {
    setIsDeleting(true);
    try {
      await deleteProductTypeRequest(productTypeId);
      notificationsRef.current?.info('Тип продукта удален');
      navigate('/catalog/device_type');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="product-type-detail-page">
        <div className="product-type-detail-page__loading">
          <div className="loading-spinner" />
          <p>Загрузка данных типа продукта...</p>
        </div>
      </section>
    );
  }

  if (!productType) {
    return (
      <section className="product-type-detail-page">
        <div className="product-type-detail-page__error">
          <h2>Тип продукта не найден</h2>
          <p>Запрошенный тип продукта не существует или был удален</p>
          <Button variant="primary" onClick={() => navigate('/catalog/device_type')}>
            К списку типов продуктов
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="product-type-detail-page">
      <header className="product-type-detail-page__header">
        <div className="product-type-detail-page__header-left">
          <Button variant="ghost" onClick={() => navigate('/catalog/device_type')} className="back-button">
            ← Назад
          </Button>
          <div className="product-type-detail-page__user-info">
            <div className="product-type-detail-page__avatar">
              <FiBox />
            </div>
            <div className="product-type-detail-page__header-text">
              <h1 className="product-type-detail-page__title">
                {productType.name || `Тип продукта #${productType.id}`}
              </h1>
            </div>
          </div>
        </div>
        <div className="product-type-detail-page__actions">
          <PermissionGate permission={['product_type:update']} fallback={null}>
            <Button
              variant="secondary"
              leftIcon={<FiEdit2 />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Редактировать
            </Button>
          </PermissionGate>
          <PermissionGate permission={['product_type:delete']} fallback={null}>
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

      <div className="product-type-detail-page__content">
        <div className="product-type-detail-page__panel">
          <div className="panel-header">
            <div className="panel-header__content">
              <h2 className="panel-title">Информация</h2>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiClock />}
                onClick={() => navigate(`/catalog/device_type/${productType.id}/audit`)}
              >
                История
              </Button>
            </div>
          </div>

          <div className="product-type-info-grid">
            <div className="info-card">
              <div className="info-card__icon info-card__icon--primary">
                <FiBox />
              </div>
              <div className="info-card__content">
                <span className="info-card__label">ID типа продукта</span>
                <span className="info-card__value">{productType.id}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__icon info-card__icon--secondary">
                <span>🏷️</span>
              </div>
              <div className="info-card__content">
                <span className="info-card__label">Название</span>
                <span className="info-card__value">{productType.name || '—'}</span>
              </div>
            </div>

            {productType.parent_id && (
              <div className="info-card">
                <div className="info-card__icon info-card__icon--info">
                  <span>🔗</span>
                </div>
                <div className="info-card__content">
                  <span className="info-card__label">Родительский тип</span>
                  <span className="info-card__value">ID: {productType.parent_id}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProductTypeModal
          productType={productType}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleSaveProductType}
          isSubmitting={isSaving}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteProductTypeModal
          productType={productType}
          onClose={() => setIsDeleteModalOpen(false)}
          onSubmit={handleDeleteProductType}
          isSubmitting={isDeleting}
        />
      )}
    </section>
  );
}
