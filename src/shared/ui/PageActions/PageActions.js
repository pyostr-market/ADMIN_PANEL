import './PageActions.css';

export function PageActions({
  children,
  align = 'end',
  className = '',
}) {
  return (
    <div className={`page-actions page-actions--${align} ${className}`}>
      {children}
    </div>
  );
}
