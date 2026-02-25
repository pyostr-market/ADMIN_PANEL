import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiMail, FiPhone, FiBox, FiClock } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getSupplierByIdRequest,
  deleteSupplierRequest,
} from '../api/suppliersApi';
import styles from './SupplierDetailPage.module.css';

function DeleteSupplierModal({ supplier, onClose, onSubmit, isSubmitting }) {
  if (!supplier) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление поставщика"
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
        Вы уверены, что хотите удалить поставщика{' '}
        <strong>{supplier.name || `ID: ${supplier.id}`}</strong>?
      </p>
      <p className={styles.modalConfirmNote}>
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function SupplierDetailPage() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [supplier, setSupplier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loadSupplier = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSupplierByIdRequest(supplierId);
      setSupplier(data);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    loadSupplier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId]);

  const handleEditSupplier = () => {
    navigate(`/suppliers/${supplierId}/edit`);
  };

  const handleDeleteSupplier = async () => {
    setIsDeleting(true);
    try {
      await deleteSupplierRequest(supplierId);
      notificationsRef.current?.info('Поставщик удален');
      navigate('/suppliers');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <section className={styles.supplierDetailPage}>
        <div className={styles.supplierDetailPageLoading}>
          <div className={styles.loadingSpinner} />
          <p>Загрузка данных поставщика...</p>
        </div>
      </section>
    );
  }

  if (!supplier) {
    return (
      <section className={styles.supplierDetailPage}>
        <div className={styles.supplierDetailPageError}>
          <h2>Поставщик не найден</h2>
          <p>Запрошенный поставщик не существует или был удален</p>
          <Button variant="primary" onClick={() => navigate('/suppliers')}>
            К списку поставщиков
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.supplierDetailPage}>
      <header className={styles.supplierDetailPageHeader}>
        <Button variant="ghost" onClick={() => navigate('/suppliers')} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.supplierDetailPageActions}>
          <PermissionGate permission={['supplier:update']} fallback={null}>
            <Button
              variant="secondary"
              leftIcon={<FiEdit2 />}
              onClick={handleEditSupplier}
            >
              Редактировать
            </Button>
          </PermissionGate>
          <PermissionGate permission={['supplier:delete']} fallback={null}>
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

      <div className={styles.supplierDetailPageContent}>
        <div className={styles.supplierDetailPagePanel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderContent}>
              <h2 className={styles.panelTitle}>Информация</h2>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiClock />}
                onClick={() => navigate(`/suppliers/${supplier.id}/audit`)}
              >
                История
              </Button>
            </div>
          </div>

          <div className={styles.supplierInfoGrid}>
            <div className={styles.infoCard}>
              <div className={`${styles.infoCardIcon} ${styles.infoCardIconPrimary}`}>
                <FiBox />
              </div>
              <div className={styles.infoCardContent}>
                <span className={styles.infoCardLabel}>ID поставщика</span>
                <span className={styles.infoCardValue}>{supplier.id}</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={`${styles.infoCardIcon} ${styles.infoCardIconSecondary}`}>
                <span>📦</span>
              </div>
              <div className={styles.infoCardContent}>
                <span className={styles.infoCardLabel}>Название</span>
                <span className={styles.infoCardValue}>{supplier.name || '—'}</span>
              </div>
            </div>

            {supplier.contact_email && (
              <div className={styles.infoCard}>
                <div className={`${styles.infoCardIcon} ${styles.infoCardIconSuccess}`}>
                  <FiMail />
                </div>
                <div className={styles.infoCardContent}>
                  <span className={styles.infoCardLabel}>Email</span>
                  <span className={styles.infoCardValue}>{supplier.contact_email}</span>
                </div>
              </div>
            )}

            {supplier.phone && (
              <div className={styles.infoCard}>
                <div className={`${styles.infoCardIcon} ${styles.infoCardIconInfo}`}>
                  <FiPhone />
                </div>
                <div className={styles.infoCardContent}>
                  <span className={styles.infoCardLabel}>Телефон</span>
                  <span className={styles.infoCardValue}>{supplier.phone}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isDeleteModalOpen && (
        <DeleteSupplierModal
          supplier={supplier}
          onClose={() => setIsDeleteModalOpen(false)}
          onSubmit={handleDeleteSupplier}
          isSubmitting={isDeleting}
        />
      )}
    </section>
  );
}
