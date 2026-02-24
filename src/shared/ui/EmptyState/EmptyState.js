import { FiInbox } from 'react-icons/fi';
import './EmptyState.css';

export function EmptyState({
  icon,
  title = 'Нет данных',
  description,
  action,
  className = '',
}) {
  const IconComponent = icon || FiInbox;

  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state__icon">
        <IconComponent />
      </div>
      {title && <h3 className="empty-state__title">{title}</h3>}
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
