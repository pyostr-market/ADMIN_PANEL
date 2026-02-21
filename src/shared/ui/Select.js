import { forwardRef } from 'react';
import './Select.css';

export const Select = forwardRef(function Select(
  {
    label,
    error,
    options = [],
    className = '',
    wrapperClassName = '',
    placeholder = 'Выберите значение',
    ...props
  },
  ref,
) {
  return (
    <div className={`select-wrapper ${wrapperClassName}`}>
      {label && <label className="select-label">{label}</label>}
      <select
        ref={ref}
        className={`select ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="select-error">{error}</span>}
    </div>
  );
});
