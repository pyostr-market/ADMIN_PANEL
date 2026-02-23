import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiBox, FiClock } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { Modal } from '../../shared/ui/Modal';
import { PermissionGate } from '../../shared/ui/PermissionGate';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import {
  getManufacturerByIdRequest,
  deleteManufacturerRequest,
} from './api/manufacturersApi';
import './ManufacturerDetailPage.css';

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
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [manufacturer, setManufacturer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    navigate(`/catalog/manufacturers/${manufacturerId}/edit`);
  };

  const handleDeleteManufacturer = async () => {
    setIsDeleting(true);
    try {
      await deleteManufacturerRequest(manufacturerId);
      notificationsRef.current?.info('Производитель удален');
      navigate('/catalog/manufacturers');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="manufacturer-detail-page">
        <div className="manufacturer-detail-page__loading">
          <div className="loading-spinner" />
          <p>Загрузка данных производителя...</p>
        </div>
      </section>
    );
  }

  if (!manufacturer) {
    return (
      <section className="manufacturer-detail-page">
        <div className="manufacturer-detail-page__error">
          <h2>Производитель не найден</h2>
          <p>Запрошенный производитель не существует или был удален</p>
          <Button variant="primary" onClick={() => navigate('/catalog/manufacturers')}>
            К списку производителей
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="manufacturer-detail-page">
      <header className="manufacturer-detail-page__header">
        <Button variant="ghost" onClick={() => navigate('/catalog/manufacturers')} className="back-button">
          ← Назад
        </Button>
        <div className="manufacturer-detail-page__actions">
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

      <div className="manufacturer-detail-page__content">
        <div className="manufacturer-detail-page__panel">
          <div className="panel-header">
            <div className="panel-header__content">
              <h2 className="panel-title">Информация</h2>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiClock />}
                onClick={() => navigate(`/catalog/manufacturers/${manufacturerId}/audit`)}
              >
                История
              </Button>
            </div>
          </div>

          <div className="manufacturer-info-grid">
            <div className="info-card">
              <div className="info-card__icon info-card__icon--primary">
                <FiBox />
              </div>
              <div className="info-card__content">
                <span className="info-card__label">ID производителя</span>
                <span className="info-card__value">{manufacturer.id}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__icon info-card__icon--secondary">
                <span>🏭</span>
              </div>
              <div className="info-card__content">
                <span className="info-card__label">Название</span>
                <span className="info-card__value">{manufacturer.name || '—'}</span>
              </div>
            </div>

            {manufacturer.description && (
              <div className="info-card info-card--full">
                <div className="info-card__icon info-card__icon--info">
                  <span>📝</span>
                </div>
                <div className="info-card__content">
                  <span className="info-card__label">Описание</span>
                  <span className="info-card__value">{manufacturer.description}</span>
                </div>
              </div>
            )}
          </div>
        </div>
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
