import { FiInbox } from 'react-icons/fi';
import styles from './EmptyState.module.css';

export function EmptyState({
  icon,
  title = 'Нет данных',
  description,
  action,
  className = '',
}) {
  const IconComponent = icon || FiInbox;

  return (
    <div className={`${styles.emptyState} ${className}`}>
      <div className={styles.emptyStateIcon}>
        <IconComponent />
      </div>
      {title && <h3 className={styles.emptyStateTitle}>{title}</h3>}
      {description && <p className={styles.emptyStateDescription}>{description}</p>}
      {action && <div className={styles.emptyStateAction}>{action}</div>}
    </div>
  );
}
