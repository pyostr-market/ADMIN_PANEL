import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiFileText, FiEdit2, FiTrash2, FiUser, FiMapPin, FiArrowLeft } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { InfoBlock } from '../../../shared/ui/InfoBlock/InfoBlock';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import { getPriceByIdRequest, deletePriceRequest } from '../api/pricesApi';
import styles from './PriceDetailPage.module.css';

export function PriceDetailPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { priceId } = useParams();

  const [price, setPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadPrice = useCallback(async () => {
    if (!priceId) return;

    setIsLoading(true);
    try {
      const data = await getPriceByIdRequest(priceId);
      setPrice(data);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [priceId]);

  useEffect(() => {
    if (priceId) {
      loadPrice();
    }
  }, [priceId, loadPrice]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePriceRequest(priceId);
      notificationsRef.current?.info('Прайс удален');
      navigate('/actualization/prices');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEdit = () => {
    navigate(`/actualization/prices/${priceId}/edit`);
  };

  const handleBack = () => {
    navigate('/actualization/prices');
  };

  if (isLoading) {
    return (
      <section className={styles.priceDetailPage}>
        <div className={styles.priceDetailPageLoading}>
          <div className="loading-spinner" />
          <p>Загрузка прайса...</p>
        </div>
      </section>
    );
  }

  if (!price) {
    return (
      <section className={styles.priceDetailPage}>
        <div className={styles.priceDetailPageEmpty}>
          <h1>Прайс не найден</h1>
          <Button variant="primary" leftIcon={<FiArrowLeft />} onClick={handleBack}>
            Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.priceDetailPage}>
      <header className={styles.priceDetailPageHeader}>
        <Button variant="ghost" onClick={handleBack} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.priceDetailPageActions}>
          <Button
            variant="secondary"
            leftIcon={<FiEdit2 />}
            onClick={handleEdit}
          >
            Редактировать
          </Button>
          <Button
            variant="danger"
            leftIcon={<FiTrash2 />}
            onClick={() => setShowDeleteModal(true)}
            loading={isDeleting}
          >
            Удалить
          </Button>
        </div>
      </header>

      <div className={styles.priceDetailPageContent}>
        <InfoBlock
          title="Информация"
          headerIcon={<FiFileText />}
          items={[
            {
              label: 'Категория',
              value: price.category || '—',
              iconVariant: 'primary',
            },
            {
              label: 'Поставщик',
              value: price.supplier || '—',
              iconVariant: 'secondary',
            },
            {
              label: 'Регион',
              value: price.region || '—',
              iconVariant: 'accent',
            },
            {
              label: 'Текст прайса',
              value: price.price_text,
              iconVariant: 'info',
              fullWidth: !!price.price_text,
            },
          ]}
        />
      </div>

      {showDeleteModal && (
        <Modal
          isOpen
          onClose={() => setShowDeleteModal(false)}
          title="Удаление прайса"
          size="sm"
          footer={(
            <>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Отмена
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={isDeleting}
              >
                Удалить
              </Button>
            </>
          )}
        >
          <p className={styles.modalConfirmText}>
            Вы уверены, что хотите удалить прайс{' '}
            <strong>{price.category || `ID: ${price.id}`}</strong>?
          </p>
          <p className={styles.modalConfirmNote}>
            Это действие нельзя отменить.
          </p>
        </Modal>
      )}
    </section>
  );
}
