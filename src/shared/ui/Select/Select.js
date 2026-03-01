import { forwardRef } from 'react';
import styles from './Select.module.css';

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
    <div className={`${styles.selectWrapper} ${wrapperClassName}`}>
      {label && <label className={styles.selectLabel}>{label}</label>}
      <select
        ref={ref}
        className={`${styles.select} ${className}`}
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
      {error && <span className={styles.selectError}>{error}</span>}
    </div>
  );
});
