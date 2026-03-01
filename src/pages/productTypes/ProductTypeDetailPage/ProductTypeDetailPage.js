import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiBox, FiClock, FiArrowLeft } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { InfoBlock } from '../../../shared/ui/InfoBlock/InfoBlock';
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

  const handleViewAudit = () => {
    navigate(`/catalog/device_type/${productTypeId}/audit`);
  };

  const handleBack = () => {
    navigate('/catalog/device_type');
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
          <Button variant="primary" leftIcon={<FiArrowLeft />} onClick={handleBack}>
            Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.productTypeDetailPage}>
      <header className={styles.productTypeDetailPageHeader}>
        <Button variant="ghost" onClick={handleBack} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.productTypeDetailPageActions}>
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
        <InfoBlock
          title="Информация"
          headerIcon={<FiBox />}
          items={[
            {
              label: 'ID типа продукта',
              value: productType.id,
              iconVariant: 'primary',
            },
            {
              label: 'Название',
              value: productType.name || '—',
              iconVariant: 'secondary',
            },
            {
              label: 'Родительский тип',
              value: productType.parent_id ? `ID: ${productType.parent_id}` : '—',
              iconVariant: 'accent',
            },
            {
              label: 'Создан',
              value: productType.created_at
                ? new Date(productType.created_at).toLocaleDateString('ru-RU')
                : '—',
              iconVariant: 'info',
            },
          ]}
          auditUrl={`/catalog/device_type/${productTypeId}/audit`}
          onAuditClick={handleViewAudit}
        />
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
