import './Card.css';

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
}) {
  return (
    <div className={`card card--${variant} card--padding-${padding} ${className}`}>
      {children}
    </div>
  );
}
