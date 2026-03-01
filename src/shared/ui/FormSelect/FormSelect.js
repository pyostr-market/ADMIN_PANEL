import { forwardRef } from 'react';
import { Select as BaseSelect } from '../Select/Select';
import styles from './FormSelect.module.css';

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
    <div className={`${styles.formSelectWrapper} ${className}`}>
      {label && (
        <label className={styles.formSelectLabel}>
          {label}
          {required && <span className={styles.formSelectRequired}>*</span>}
        </label>
      )}
      <BaseSelect
        ref={ref}
        options={options}
        placeholder={placeholder}
        className={error ? styles.formSelectError : ''}
        {...props}
      />
      {hint && !error && <span className={styles.formSelectHint}>{hint}</span>}
      {error && <span className={styles.formSelectErrorText}>{error}</span>}
    </div>
  );
});
