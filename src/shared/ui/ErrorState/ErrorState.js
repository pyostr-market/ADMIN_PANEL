import { FiAlertTriangle } from 'react-icons/fi';
import { Button } from '../Button/Button';
import styles from './ErrorState.module.css';

export function ErrorState({
  message = 'Произошла ошибка',
  onRetry,
  retryLabel = 'Повторить',
  className = '',
}) {
  return (
    <div className={`${styles.errorState} ${className}`}>
      <div className={styles.errorStateIcon}>
        <FiAlertTriangle />
      </div>
      {message && <p className={styles.errorStateMessage}>{message}</p>}
      {onRetry && (
        <Button
          variant="primary"
          onClick={onRetry}
          className={styles.errorStateRetry}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
