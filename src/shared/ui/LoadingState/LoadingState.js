import styles from './LoadingState.module.css';

export function LoadingState({
  message = 'Загрузка...',
  size = 'md',
  className = '',
}) {
  return (
    <div className={`${styles.loadingState} ${styles[`loadingState${size.charAt(0).toUpperCase() + size.slice(1)}`]} ${className}`}>
      <div className={styles.loadingStateSpinner} />
      {message && <p className={styles.loadingStateMessage}>{message}</p>}
    </div>
  );
}
