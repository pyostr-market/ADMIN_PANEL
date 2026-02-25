import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiTag, FiClock } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
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
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [attribute, setAttribute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    navigate(`/catalog/attributes/${attributeId}/edit`);
  };

  const handleDeleteAttribute = async () => {
    setIsDeleting(true);
    try {
      await deleteAttributeRequest(attributeId);
      notificationsRef.current?.info('Атрибут удален');
      navigate('/catalog/attributes');
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
        <div className={styles.attributeDetailPageError}>
          <h2>Атрибут не найден</h2>
          <p>Запрошенный атрибут не существует или был удален</p>
          <Button variant="primary" onClick={() => navigate('/catalog/attributes')}>
            К списку атрибутов
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.attributeDetailPage}>
      <header className={styles.attributeDetailPageHeader}>
        <Button variant="ghost" onClick={() => navigate('/catalog/attributes')} className={styles.backButton}>
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
        <div className={styles.attributeDetailPagePanel}>
          <div className="panel-header">
            <div className="panel-header__content">
              <h2 className="panel-title">Информация</h2>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiClock />}
                onClick={() => navigate(`/catalog/attributes/${attribute.id}/audit`)}
              >
                История
              </Button>
            </div>
          </div>

          <div className={styles.attributeInfoGrid}>
            <div className={styles.infoCard}>
              <div className={`${styles.infoCardIcon} ${styles.infoCardIconPrimary}`}>
                <FiTag />
              </div>
              <div className={styles.infoCard__content}>
                <span className={styles.infoCardLabel}>ID атрибута</span>
                <span className={styles.infoCardValue}>{attribute.id}</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={`${styles.infoCardIcon} ${styles.infoCardIconSecondary}`}>
                <span>🏷️</span>
              </div>
              <div className={styles.infoCard__content}>
                <span className={styles.infoCardLabel}>Название</span>
                <span className={styles.infoCardValue}>{attribute.name || '—'}</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={`${styles.infoCardIcon} ${styles.infoCardIconInfo}`}>
                <span>📝</span>
              </div>
              <div className={styles.infoCard__content}>
                <span className={styles.infoCardLabel}>Значение</span>
                <span className={styles.infoCardValue}>{attribute.value || '—'}</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={`${styles.infoCardIcon} ${styles.infoCardIconSuccess}`}>
                <span>🔍</span>
              </div>
              <div className={styles.infoCard__content}>
                <span className={styles.infoCardLabel}>Фильтруемый</span>
                <span className={styles.infoCardValue}>{attribute.is_filterable ? 'Да' : 'Нет'}</span>
              </div>
            </div>
          </div>
        </div>
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
