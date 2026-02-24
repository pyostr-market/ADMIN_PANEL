import './LoadingState.css';

export function LoadingState({
  message = 'Загрузка...',
  size = 'md',
  className = '',
}) {
  return (
    <div className={`loading-state loading-state--${size} ${className}`}>
      <div className="loading-state__spinner" />
      {message && <p className="loading-state__message">{message}</p>}
    </div>
  );
}
