import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiMapPin, FiArrowLeft } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { InfoBlock } from '../../../shared/ui/InfoBlock/InfoBlock';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getRegionByIdRequest,
  deleteRegionRequest,
} from '../api/regionsApi';
import styles from './RegionDetailPage.module.css';

function DeleteRegionModal({ region, onClose, onSubmit, isSubmitting }) {
  if (!region) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Удаление региона"
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
        Вы уверены, что хотите удалить регион{' '}
        <strong>{region.name || `ID: ${region.id}`}</strong>?
      </p>
      <p className={styles.modalConfirmNote}>
        Это действие нельзя отменить. Все дочерние регионы будут удалены каскадно.
      </p>
    </Modal>
  );
}

export function RegionDetailPage() {
  const { regionId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const [region, setRegion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const navigateWithParams = useCallback((path) => {
    const paramsString = searchParams.toString();
    const fullPath = paramsString ? `${path}?${paramsString}` : path;
    navigate(fullPath);
  }, [navigate, searchParams]);

  const loadRegion = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getRegionByIdRequest(regionId);
      setRegion(data);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [regionId]);

  useEffect(() => {
    loadRegion();
  }, [loadRegion]);

  const handleEditRegion = () => {
    navigateWithParams(`/settings/regions/${regionId}/edit`);
  };

  const handleViewAudit = () => {
    navigateWithParams(`/settings/regions/${regionId}/audit`);
  };

  const handleBack = () => {
    navigateWithParams('/settings/regions');
  };

  const handleDeleteRegion = async () => {
    setIsSubmitting(true);
    try {
      await deleteRegionRequest(regionId);
      notificationsRef.current?.info('Регион удален');
      navigateWithParams('/settings/regions');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className={styles.regionDetailPage}>
        <div className={styles.loadingState}>
          <p>Загрузка данных региона...</p>
        </div>
      </section>
    );
  }

  if (!region) {
    return (
      <section className={styles.regionDetailPage}>
        <div className={styles.errorState}>
          <h2>Регион не найден</h2>
          <p>Запрошенный регион не существует или был удален</p>
          <Button variant="primary" leftIcon={<FiArrowLeft />} onClick={handleBack}>
            Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.regionDetailPage}>
      <header className={styles.regionDetailPageHeader}>
        <Button variant="ghost" onClick={handleBack} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.regionDetailPageActions}>
          <PermissionGate permission={['region:update']} fallback={null}>
            <Button
              variant="secondary"
              leftIcon={<FiEdit2 />}
              onClick={handleEditRegion}
            >
              Редактировать
            </Button>
          </PermissionGate>
          <PermissionGate permission={['region:delete']} fallback={null}>
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

      <div className={styles.regionDetailPageContent}>
        <InfoBlock
          title="Информация"
          headerIcon={<FiMapPin />}
          items={[
            {
              label: 'ID региона',
              value: region.id,
              iconVariant: 'primary',
            },
            {
              label: 'Название',
              value: region.name || '—',
              iconVariant: 'secondary',
            },
            {
              label: 'Родительский регион',
              value: region.parent_id ? `ID: ${region.parent_id}` : '—',
              iconVariant: 'accent',
            },
            {
              label: 'Создан',
              value: region.created_at
                ? new Date(region.created_at).toLocaleDateString('ru-RU')
                : '—',
              iconVariant: 'info',
            },
            {
              label: 'Обновлен',
              value: region.updated_at
                ? new Date(region.updated_at).toLocaleDateString('ru-RU')
                : '—',
              iconVariant: 'info',
            },
          ]}
          auditUrl={`/settings/regions/${regionId}/audit`}
          onAuditClick={handleViewAudit}
        />
      </div>

      {isDeleteModalOpen && (
        <DeleteRegionModal
          region={region}
          onClose={() => setIsDeleteModalOpen(false)}
          onSubmit={handleDeleteRegion}
          isSubmitting={isSubmitting}
        />
      )}
    </section>
  );
}
