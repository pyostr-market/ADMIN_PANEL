import { forwardRef } from 'react';
import { Select as BaseSelect } from '../Select';
import './FormSelect.css';

export const FormSelect = forwardRef(function FormSelect(
  {
    label,
    error,
    hint,
    required = false,
    options = [],
    placeholder = 'Выберите значение',
    className = '',
    ...props
  },
  ref,
) {
  return (
    <div className={`form-select-wrapper ${className}`}>
      {label && (
        <label className="form-select__label">
          {label}
          {required && <span className="form-select__required">*</span>}
        </label>
      )}
      <BaseSelect
        ref={ref}
        options={options}
        placeholder={placeholder}
        className={error ? 'form-select--error' : ''}
        {...props}
      />
      {hint && !error && <span className="form-select__hint">{hint}</span>}
      {error && <span className="form-select__error">{error}</span>}
    </div>
  );
});
