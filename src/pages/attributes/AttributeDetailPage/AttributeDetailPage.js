import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiTag, FiClock, FiArrowLeft } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { InfoBlock } from '../../../shared/ui/InfoBlock/InfoBlock';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getAttributeByIdRequest,
  deleteAttributeRequest,
} from '../api/attributesApi';
import styles from './AttributeDetailPage.module.css';

function DeleteAttributeModal({ attribute, onClose, onSubmit, isSubmitting }) {
  if (!attribute) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление атрибута"
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
        Вы уверены, что хотите удалить атрибут{' '}
        <strong>{attribute.name || `ID: ${attribute.id}`}</strong>?
      </p>
      <p className="modal-confirm-note">
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function AttributeDetailPage() {
  const { attributeId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [attribute, setAttribute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const navigateWithParams = useCallback((path) => {
    const paramsString = searchParams.toString();
    const fullPath = paramsString ? `${path}?${paramsString}` : path;
    navigate(fullPath);
  }, [navigate, searchParams]);

  const loadAttribute = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAttributeByIdRequest(attributeId);
      setAttribute(data);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [attributeId]);

  useEffect(() => {
    loadAttribute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributeId]);

  const handleEditAttribute = () => {
    navigateWithParams(`/catalog/attributes/${attributeId}/edit`);
  };

  const handleViewAudit = () => {
    navigateWithParams(`/catalog/attributes/${attributeId}/audit`);
  };

  const handleBack = () => {
    navigateWithParams('/catalog/attributes');
  };

  const handleDeleteAttribute = async () => {
    setIsDeleting(true);
    try {
      await deleteAttributeRequest(attributeId);
      notificationsRef.current?.info('Атрибут удален');
      navigateWithParams('/catalog/attributes');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <section className={styles.attributeDetailPage}>
        <div className={styles.attributeDetailPageLoading}>
          <div className="loading-spinner" />
          <p>Загрузка данных атрибута...</p>
        </div>
      </section>
    );
  }

  if (!attribute) {
    return (
      <section className={styles.attributeDetailPage}>
        <div className={styles.errorState}>
          <h2>Атрибут не найден</h2>
          <p>Запрошенный атрибут не существует или был удален</p>
          <Button variant="primary" leftIcon={<FiArrowLeft />} onClick={handleBack}>
            Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.attributeDetailPage}>
      <header className={styles.attributeDetailPageHeader}>
        <Button variant="ghost" onClick={handleBack} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.attributeDetailPageActions}>
          <PermissionGate permission={['product_attribute:update']} fallback={null}>
            <Button
              variant="secondary"
              leftIcon={<FiEdit2 />}
              onClick={handleEditAttribute}
            >
              Редактировать
            </Button>
          </PermissionGate>
          <PermissionGate permission={['product_attribute:delete']} fallback={null}>
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

      <div className={styles.attributeDetailPageContent}>
        <InfoBlock
          title="Информация"
          headerIcon={<FiTag />}
          items={[
            {
              label: 'ID атрибута',
              value: attribute.id,
              iconVariant: 'primary',
            },
            {
              label: 'Название',
              value: attribute.name || '—',
              iconVariant: 'secondary',
            },
            {
              label: 'Значение',
              value: attribute.value || '—',
              iconVariant: 'info',
            },
            {
              label: 'Фильтруемый',
              value: attribute.is_filterable ? 'Да' : 'Нет',
              iconVariant: 'success',
            },
            {
              label: 'Группируемый',
              value: attribute.is_groupable ? 'Да' : 'Нет',
              iconVariant: 'warning',
            },
          ]}
          auditUrl={`/catalog/attributes/${attributeId}/audit`}
          onAuditClick={handleViewAudit}
        />
      </div>

      {isDeleteModalOpen && (
        <DeleteAttributeModal
          attribute={attribute}
          onClose={() => setIsDeleteModalOpen(false)}
          onSubmit={handleDeleteAttribute}
          isSubmitting={isDeleting}
        />
      )}
    </section>
  );
}
