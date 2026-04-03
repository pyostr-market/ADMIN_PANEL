import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiClock, FiUser, FiArrowLeft } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { InfoBlock } from '../../../shared/ui/InfoBlock/InfoBlock';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import { getActualizationTaskByIdRequest } from '../api/actualizationTasksApi';
import styles from './ActualizationTaskDetailPage.module.css';

const STATUS_BADGE_CONFIG = {
  CREATED: { label: 'Создана', className: 'info' },
  EXPORTING: { label: 'Экспорт', className: 'warning' },
  EXPORT_FAILED: { label: 'Ошибка экспорта', className: 'danger' },
  IMPORT_FAILED: { label: 'Ошибка импорта', className: 'danger' },
  COMPLETED: { label: 'Завершена', className: 'success' },
};

function getStatusBadge(status) {
  const config = STATUS_BADGE_CONFIG[status] || { label: status, className: 'secondary' };
  return (
    <span className={`${styles.statusBadge} ${styles[`statusBadge${config.className}`]}`}>
      {config.label}
    </span>
  );
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function ActualizationTaskDetailPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { taskId } = useParams();

  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const loadTask = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getActualizationTaskByIdRequest(taskId);
      setTask(data);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const handleBack = () => {
    navigate('/actualization/actualization');
  };

  if (isLoading) {
    return (
      <section className={styles.taskDetailPage}>
        <div className="loading-spinner-wrapper">
          <div className="loading-spinner" />
          <p>Загрузка задачи...</p>
        </div>
      </section>
    );
  }

  if (!task) {
    return (
      <section className={styles.taskDetailPage}>
        <div className={styles.errorState}>
          <h2>Задача не найдена</h2>
          <p>Запрошенная задача не существует или была удалена</p>
          <Button variant="primary" leftIcon={<FiArrowLeft />} onClick={handleBack}>
            Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.taskDetailPage}>
      <header className={styles.taskDetailPageHeader}>
        <Button variant="ghost" onClick={handleBack} className={styles.backButton}>
          ← Назад
        </Button>
      </header>

      <div className={styles.taskDetailPageContent}>
        <InfoBlock
          title="Информация"
          headerIcon={<FiClock />}
          items={[
            {
              label: 'ID задачи',
              value: task.id,
              iconVariant: 'primary',
            },
            {
              label: 'Пользователь',
              value: task.user_full_name || `ID: ${task.user_id}`,
              icon: <FiUser />,
              iconVariant: 'secondary',
            },
            {
              label: 'Статус',
              value: getStatusBadge(task.status),
              iconVariant: 'info',
            },
            {
              label: 'Дата создания',
              value: formatDate(task.created_at),
              iconVariant: 'accent',
            },
          ]}
        />
      </div>
    </section>
  );
}
