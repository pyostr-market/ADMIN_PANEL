import './FormSection.css';

export function FormSection({
  icon,
  iconVariant = 'primary',
  title,
  description,
  children,
  className = '',
}) {
  return (
    <section className={`form-section ${className}`}>
      <div className="form-section__header">
        {icon && (
          <div className={`form-section__icon form-section__icon--${iconVariant}`}>
            {icon}
          </div>
        )}
        <div>
          {title && <h2 className="form-section__title">{title}</h2>}
          {description && <p className="form-section__description">{description}</p>}
        </div>
      </div>
      <div className="form-section__content">
        {children}
      </div>
    </section>
  );
}
