import './InfoCard.css';

export function InfoCard({
  label,
  value,
  icon,
  variant = 'default',
  className = '',
}) {
  return (
    <div className={`info-card info-card--${variant} ${className}`}>
      {icon && <div className="info-card__icon">{icon}</div>}
      <div className="info-card__content">
        {label && <div className="info-card__label">{label}</div>}
        <div className="info-card__value">{value}</div>
      </div>
    </div>
  );
}
