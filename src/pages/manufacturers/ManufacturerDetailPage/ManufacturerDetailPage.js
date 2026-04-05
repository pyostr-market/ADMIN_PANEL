import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiBox, FiClock, FiArrowLeft, FiImage } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { InfoBlock } from '../../../shared/ui/InfoBlock/InfoBlock';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getManufacturerByIdRequest,
  deleteManufacturerRequest,
} from '../../../shared/api/modules/manufacturersApi';
import styles from './ManufacturerDetailPage.module.css';

function DeleteManufacturerModal({ manufacturer, onClose, onSubmit, isSubmitting }) {
  if (!manufacturer) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление производителя"
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
        Вы уверены, что хотите удалить производителя{' '}
        <strong>{manufacturer.name || `ID: ${manufacturer.id}`}</strong>?
      </p>
      <p className="modal-confirm-note">
        Это действие нельзя отменить.
      </p>
    </Modal>
  );
}

export function ManufacturerDetailPage() {
  const { manufacturerId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [manufacturer, setManufacturer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  /**
   * Вспомогательная функция для навигации с сохранением URL-параметров
   */
  const navigateWithParams = useCallback((path) => {
    const paramsString = searchParams.toString();
    const fullPath = paramsString ? `${path}?${paramsString}` : path;
    navigate(fullPath);
  }, [navigate, searchParams]);

  const loadManufacturer = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getManufacturerByIdRequest(manufacturerId);
      setManufacturer(data);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [manufacturerId]);

  useEffect(() => {
    loadManufacturer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manufacturerId]);

  const handleEditManufacturer = () => {
    navigateWithParams(`/catalog/manufacturers/${manufacturerId}/edit`);
  };

  const handleViewAudit = () => {
    navigateWithParams(`/catalog/manufacturers/${manufacturerId}/audit`);
  };

  const handleBack = () => {
    navigateWithParams('/catalog/manufacturers');
  };

  const handleDeleteManufacturer = async () => {
    setIsDeleting(true);
    try {
      await deleteManufacturerRequest(manufacturerId);
      notificationsRef.current?.info('Производитель удален');
      navigateWithParams('/catalog/manufacturers');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <section className={styles.manufacturerDetailPage}>
        <div className="manufacturer-detail-page__loading">
          <div className="loading-spinner" />
          <p>Загрузка данных производителя...</p>
        </div>
      </section>
    );
  }

  if (!manufacturer) {
    return (
      <section className={styles.manufacturerDetailPage}>
        <div className={styles.errorState}>
          <h2>Производитель не найден</h2>
          <p>Запрошенный производитель не существует или был удален</p>
          <Button variant="primary" leftIcon={<FiArrowLeft />} onClick={handleBack}>
            Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.manufacturerDetailPage}>
      <header className={styles.manufacturerDetailPageHeader}>
        <Button variant="ghost" onClick={handleBack} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.manufacturerDetailPageActions}>
          <PermissionGate permission={['manufacturer:update']} fallback={null}>
            <Button
              variant="secondary"
              leftIcon={<FiEdit2 />}
              onClick={handleEditManufacturer}
            >
              Редактировать
            </Button>
          </PermissionGate>
          <PermissionGate permission={['manufacturer:delete']} fallback={null}>
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

      <div className={styles.manufacturerDetailPageContent}>
        <InfoBlock
          title="Информация"
          headerIcon={<FiBox />}
          items={[
            {
              label: 'ID производителя',
              value: manufacturer.id,
              iconVariant: 'primary',
            },
            {
              label: 'Название',
              value: manufacturer.name || '—',
              iconVariant: 'secondary',
            },
            {
              label: 'Описание',
              value: manufacturer.description,
              iconVariant: 'info',
              fullWidth: !!manufacturer.description,
            },
          ]}
          customContent={
            manufacturer.image ? (
              <div className={styles.imageSection}>
                <div className={styles.imageLabel}>
                  <FiImage /> Изображение
                </div>
                <div className={styles.imageWrapper}>
                  <img
                    src={manufacturer.image.image_url}
                    alt={manufacturer.name || 'Изображение производителя'}
                    className={styles.image}
                  />
                </div>
              </div>
            ) : null
          }
          auditUrl={`/catalog/manufacturers/${manufacturerId}/audit`}
          onAuditClick={handleViewAudit}
        />
      </div>

      {isDeleteModalOpen && (
        <DeleteManufacturerModal
          manufacturer={manufacturer}
          onClose={() => setIsDeleteModalOpen(false)}
          onSubmit={handleDeleteManufacturer}
          isSubmitting={isDeleting}
        />
      )}
    </section>
  );
}
