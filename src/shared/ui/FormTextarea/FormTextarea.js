import { forwardRef } from 'react';
import './FormTextarea.css';

export const FormTextarea = forwardRef(function FormTextarea(
  {
    label,
    error,
    hint,
    required = false,
    rows = 4,
    className = '',
    ...props
  },
  ref,
) {
  return (
    <div className={`form-textarea-wrapper ${className}`}>
      {label && (
        <label className="form-textarea__label">
          {label}
          {required && <span className="form-textarea__required">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`form-textarea ${error ? 'form-textarea--error' : ''}`}
        {...props}
      />
      {hint && !error && <span className="form-textarea__hint">{hint}</span>}
      {error && <span className="form-textarea__error">{error}</span>}
    </div>
  );
});
