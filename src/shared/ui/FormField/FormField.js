import { forwardRef } from 'react';
import './FormField.css';

export const FormField = forwardRef(function FormField(
  {
    label,
    error,
    hint,
    required = false,
    className = '',
    children,
    ...props
  },
  ref,
) {
  const childArray = children.length ? children : [children];
  const inputChild = childArray.find(
    (child) => child?.type === 'input' || child?.type?.displayName === 'Input'
  );

  const hasError = Boolean(error);

  return (
    <div className={`form-field ${className} ${hasError ? 'form-field--error' : ''}`}>
      {label && (
        <label className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      {children}
      {hint && !hasError && <span className="form-field__hint">{hint}</span>}
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
});
