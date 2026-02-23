import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiTag, FiClock } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { Modal } from '../../shared/ui/Modal';
import { PermissionGate } from '../../shared/ui/PermissionGate';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import {
  getAttributeByIdRequest,
  updateAttributeRequest,
  deleteAttributeRequest,
} from './api/attributesApi';
import './AttributeDetailPage.css';

function EditAttributeModal({ attribute, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: attribute?.name || '',
    value: attribute?.value || '',
    is_filterable: attribute?.is_filterable || false,
  });

  useEffect(() => {
    setFormData({
      name: attribute?.name || '',
      value: attribute?.value || '',
      is_filterable: attribute?.is_filterable || false,
    });
  }, [attribute]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Редактирование атрибута"
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
      <div className="edit-attribute-form">
        <label className="edit-attribute-form__field">
          <span className="edit-attribute-form__label">Название</span>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Введите название"
          />
        </label>

        <label className="edit-attribute-form__field">
          <span className="edit-attribute-form__label">Значение</span>
          <input
            type="text"
            value={formData.value}
            onChange={(e) => handleChange('value', e.target.value)}
            placeholder="Введите значение"
          />
        </label>

        <label className="edit-attribute-form__checkbox">
          <input
            type="checkbox"
            checked={formData.is_filterable}
            onChange={() => handleCheckboxChange('is_filterable')}
          />
          <span>Использовать для фильтрации</span>
        </label>
      </div>
    </Modal>
  );
}

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
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
  }, [loadAttribute]);

  const handleSaveAttribute = async (payload) => {
    setIsSaving(true);
    try {
      await updateAttributeRequest(attributeId, payload);
      await loadAttribute();
      notificationsRef.current?.info('Атрибут обновлен');
      setIsEditModalOpen(false);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSaving(false);
    }
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
      <section className="attribute-detail-page">
        <div className="attribute-detail-page__loading">
          <div className="loading-spinner" />
          <p>Загрузка данных атрибута...</p>
        </div>
      </section>
    );
  }

  if (!attribute) {
    return (
      <section className="attribute-detail-page">
        <div className="attribute-detail-page__error">
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
    <section className="attribute-detail-page">
      <header className="attribute-detail-page__header">
        <div className="attribute-detail-page__header-left">
          <Button variant="ghost" onClick={() => navigate('/catalog/attributes')} className="back-button">
            ← Назад
          </Button>
          <div className="attribute-detail-page__user-info">
            <div className="attribute-detail-page__avatar">
              <FiTag />
            </div>
            <div className="attribute-detail-page__header-text">
              <h1 className="attribute-detail-page__title">
                {attribute.name || `Атрибут #${attribute.id}`}
              </h1>
            </div>
          </div>
        </div>
        <div className="attribute-detail-page__actions">
          <PermissionGate permission={['product_attribute:update']} fallback={null}>
            <Button
              variant="secondary"
              leftIcon={<FiEdit2 />}
              onClick={() => setIsEditModalOpen(true)}
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

      <div className="attribute-detail-page__content">
        <div className="attribute-detail-page__panel">
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

          <div className="attribute-info-grid">
            <div className="info-card">
              <div className="info-card__icon info-card__icon--primary">
                <FiTag />
              </div>
              <div className="info-card__content">
                <span className="info-card__label">ID атрибута</span>
                <span className="info-card__value">{attribute.id}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__icon info-card__icon--secondary">
                <span>🏷️</span>
              </div>
              <div className="info-card__content">
                <span className="info-card__label">Название</span>
                <span className="info-card__value">{attribute.name || '—'}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__icon info-card__icon--info">
                <span>📝</span>
              </div>
              <div className="info-card__content">
                <span className="info-card__label">Значение</span>
                <span className="info-card__value">{attribute.value || '—'}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__icon info-card__icon--success">
                <span>🔍</span>
              </div>
              <div className="info-card__content">
                <span className="info-card__label">Фильтруемый</span>
                <span className="info-card__value">{attribute.is_filterable ? 'Да' : 'Нет'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditAttributeModal
          attribute={attribute}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleSaveAttribute}
          isSubmitting={isSaving}
        />
      )}

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
