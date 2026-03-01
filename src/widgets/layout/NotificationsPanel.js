import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import { FiAlertTriangle, FiBell, FiCalendar, FiMail, FiXCircle } from 'react-icons/fi';
import './NotificationsPanel.css';

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
    <aside className="toast-stack" aria-live="polite" aria-label="Уведомления">
      {toasts.map((toast) => {
        const Icon = ICON_BY_TYPE[toast.type] ?? ICON_BY_TYPE.info;

        return (
          <article key={toast.id} className={`toast toast--${toast.type}`}>
            <div className="toast__content">
              <span className="toast__icon" aria-hidden="true"><Icon /></span>
              <p className="toast__message">{toast.message}</p>
              <button
                type="button"
                className="toast__close"
                aria-label="Закрыть уведомление"
                onClick={() => removeToast(toast.id)}
              >
                ×
              </button>
            </div>
            <div
              className="toast__progress"
              style={{ animationDuration: `${toast.lifetimeMs}ms` }}
            />
          </article>
        );
      })}
    </aside>
  );
}
