import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiMail, FiPhone, FiBox, FiClock } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { Modal } from '../../shared/ui/Modal';
import { PermissionGate } from '../../shared/ui/PermissionGate';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import {
  getSupplierByIdRequest,
  updateSupplierRequest,
  deleteSupplierRequest,
} from './api/suppliersApi';
import './SupplierDetailPage.css';

function EditSupplierModal({ supplier, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    contact_email: supplier?.contact_email || '',
    phone: supplier?.phone || '',
  });

  useEffect(() => {
    setFormData({
      name: supplier?.name || '',
      contact_email: supplier?.contact_email || '',
      phone: supplier?.phone || '',
    });
  }, [supplier]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Редактирование поставщика"
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
      <div className="edit-supplier-form">
        <label className="edit-supplier-form__field">
          <span className="edit-supplier-form__label">Название</span>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Введите название"
          />
        </label>

        <label className="edit-supplier-form__field">
          <span className="edit-supplier-form__label">Email для связи</span>
          <input
            type="email"
            value={formData.contact_email}
            onChange={(e) => handleChange('contact_email', e.target.value)}
            placeholder="supplier@example.com"
          />
        </label>

        <label className="edit-supplier-form__field">
          <span className="edit-supplier-form__label">Телефон</span>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+7 (999) 000-00-00"
          />
        </label>
      </div>
    </Modal>
  );
}

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
      <p className="modal-confirm-text">
        Вы уверены, что хотите удалить поставщика{' '}
        <strong>{supplier.name || `ID: ${supplier.id}`}</strong>?
      </p>
      <p className="modal-confirm-note">
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
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
  }, [loadSupplier]);

  const handleSaveSupplier = async (payload) => {
    setIsSaving(true);
    try {
      await updateSupplierRequest(supplierId, payload);
      await loadSupplier();
      notificationsRef.current?.info('Поставщик обновлен');
      setIsEditModalOpen(false);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSaving(false);
    }
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
      <section className="supplier-detail-page">
        <div className="supplier-detail-page__loading">
          <div className="loading-spinner" />
          <p>Загрузка данных поставщика...</p>
        </div>
      </section>
    );
  }

  if (!supplier) {
    return (
      <section className="supplier-detail-page">
        <div className="supplier-detail-page__error">
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
    <section className="supplier-detail-page">
      <header className="supplier-detail-page__header">
        <div className="supplier-detail-page__header-left">
          <Button variant="ghost" onClick={() => navigate('/suppliers')} className="back-button">
            ← Назад
          </Button>
          <div className="supplier-detail-page__user-info">
            <div className="supplier-detail-page__avatar">
              <FiBox />
            </div>
            <div className="supplier-detail-page__header-text">
              <h1 className="supplier-detail-page__title">
                {supplier.name || `Поставщик #${supplier.id}`}
              </h1>
            </div>
          </div>
        </div>
        <div className="supplier-detail-page__actions">
          <PermissionGate permission={['supplier:update']} fallback={null}>
            <Button
              variant="secondary"
              leftIcon={<FiEdit2 />}
              onClick={() => setIsEditModalOpen(true)}
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

      <div className="supplier-detail-page__content">
        <div className="supplier-detail-page__panel">
          <div className="panel-header">
            <div className="panel-header__content">
              <h2 className="panel-title">Информация</h2>
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

          <div className="supplier-info-grid">
            <div className="info-card">
              <div className="info-card__icon info-card__icon--primary">
                <FiBox />
              </div>
              <div className="info-card__content">
                <span className="info-card__label">ID поставщика</span>
                <span className="info-card__value">{supplier.id}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__icon info-card__icon--secondary">
                <span>📦</span>
              </div>
              <div className="info-card__content">
                <span className="info-card__label">Название</span>
                <span className="info-card__value">{supplier.name || '—'}</span>
              </div>
            </div>

            {supplier.contact_email && (
              <div className="info-card">
                <div className="info-card__icon info-card__icon--success">
                  <FiMail />
                </div>
                <div className="info-card__content">
                  <span className="info-card__label">Email</span>
                  <span className="info-card__value">{supplier.contact_email}</span>
                </div>
              </div>
            )}

            {supplier.phone && (
              <div className="info-card">
                <div className="info-card__icon info-card__icon--info">
                  <FiPhone />
                </div>
                <div className="info-card__content">
                  <span className="info-card__label">Телефон</span>
                  <span className="info-card__value">{supplier.phone}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditSupplierModal
          supplier={supplier}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleSaveSupplier}
          isSubmitting={isSaving}
        />
      )}

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
