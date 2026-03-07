import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import { FiAlertTriangle, FiBell, FiCalendar, FiMail, FiXCircle } from 'react-icons/fi';
import styles from './NotificationsPanel.module.css';

const ICON_BY_TYPE = {
  info: FiBell,
  error: FiXCircle,
  mail: FiMail,
  event: FiCalendar,
  warning: FiAlertTriangle,
};

export function NotificationsPanel() {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <aside className={styles.toastStack} aria-live="polite" aria-label="Уведомления">
      {toasts.map((toast) => {
        const Icon = ICON_BY_TYPE[toast.type] ?? ICON_BY_TYPE.info;

        return (
          <article key={toast.id} className={`${styles.toast} ${styles[`toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`]}`}>
            <div className={styles.toastContent}>
              <span className={styles.toastIcon} aria-hidden="true"><Icon /></span>
              <p className={styles.toastMessage}>{toast.message}</p>
              <button
                type="button"
                className={styles.toastClose}
                aria-label="Закрыть уведомление"
                onClick={() => removeToast(toast.id)}
              >
                ×
              </button>
            </div>
            <div
              className={styles.toastProgress}
              style={{ animationDuration: `${toast.lifetimeMs}ms` }}
            />
          </article>
        );
      })}
    </aside>
  );
}
