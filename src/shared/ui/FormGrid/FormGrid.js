import './FormGrid.css';

export function FormGrid({
  children,
  columns = 2,
  className = '',
}) {
  return (
    <div
      className={`form-grid form-grid--${columns}-col ${className}`}
      style={{ '--grid-columns': columns }}
    >
      {children}
    </div>
  );
}
