import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiBox, FiClock } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getProductTypeByIdRequest,
  deleteProductTypeRequest,
} from '../api/productTypesApi';
import styles from './ProductTypeDetailPage.module.css';

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
      <p className={styles.modalConfirmText}>
        Вы уверены, что хотите удалить тип продукта{' '}
        <strong>{productType.name || `ID: ${productType.id}`}</strong>?
      </p>
      <p className={styles.modalConfirmNote}>
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
  const [productType, setProductType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

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

  const handleEditProductType = () => {
    navigate(`/catalog/device_type/${productTypeId}/edit`);
  };

  const handleDeleteProductType = async () => {
    try {
      await deleteProductTypeRequest(productTypeId);
      notificationsRef.current?.info('Тип продукта удален');
      navigate('/catalog/device_type');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    }
  };

  if (isLoading) {
    return (
      <section className={styles.productTypeDetailPage}>
        <div className={styles.loadingState}>
          <p>Загрузка данных типа продукта...</p>
        </div>
      </section>
    );
  }

  if (!productType) {
    return (
      <section className={styles.productTypeDetailPage}>
        <div className={styles.errorState}>
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
    <section className={styles.productTypeDetailPage}>
      <header className={styles.productTypeDetailPageHeader}>
        <h1 className={styles.productTypeDetailPageTitle}>
          {productType.name || `Тип продукта #${productType.id}`}
        </h1>
        <div className={styles.productTypeDetailPageControls}>
          <PermissionGate permission={['product_type:update']} fallback={null}>
            <Button
              variant="secondary"
              leftIcon={<FiEdit2 />}
              onClick={handleEditProductType}
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

      <div className={styles.productTypeDetailPageContent}>
        <div className={styles.productTypeDetailPageCard}>
          <h2 className={styles.productTypeDetailPageCardTitle}>
            <FiClock style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Информация
          </h2>
          <div className={styles.productTypeDetailPageGrid}>
            <div className={styles.productTypeDetailPageField}>
              <span className={styles.productTypeDetailPageFieldLabel}>ID</span>
              <span className={styles.productTypeDetailPageFieldValue}>{productType.id}</span>
            </div>
            <div className={styles.productTypeDetailPageField}>
              <span className={styles.productTypeDetailPageFieldLabel}>Название</span>
              <span className={styles.productTypeDetailPageFieldValue}>{productType.name || '—'}</span>
            </div>
            {productType.parent_id && (
              <div className={styles.productTypeDetailPageField}>
                <span className={styles.productTypeDetailPageFieldLabel}>Родительский тип</span>
                <span className={styles.productTypeDetailPageFieldValue}>ID: {productType.parent_id}</span>
              </div>
            )}
            {productType.created_at && (
              <div className={styles.productTypeDetailPageField}>
                <span className={styles.productTypeDetailPageFieldLabel}>Создан</span>
                <span className={styles.productTypeDetailPageFieldValue}>
                  {new Date(productType.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isDeleteModalOpen && (
        <DeleteProductTypeModal
          productType={productType}
          onClose={() => setIsDeleteModalOpen(false)}
          onSubmit={handleDeleteProductType}
        />
      )}
    </section>
  );
}
