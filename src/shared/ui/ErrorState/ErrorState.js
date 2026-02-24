import { FiAlertTriangle } from 'react-icons/fi';
import { Button } from '../Button';
import './ErrorState.css';

export function ErrorState({
  message = 'Произошла ошибка',
  onRetry,
  retryLabel = 'Повторить',
  className = '',
}) {
  return (
    <div className={`error-state ${className}`}>
      <div className="error-state__icon">
        <FiAlertTriangle />
      </div>
      {message && <p className="error-state__message">{message}</p>}
      {onRetry && (
        <Button
          variant="primary"
          onClick={onRetry}
          className="error-state__retry"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
