import { forwardRef } from 'react';
import styles from './FormTextarea.module.css';

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
    <div className={`${styles.formTextareaWrapper} ${className}`}>
      {label && (
        <label className={styles.formTextareaLabel}>
          {label}
          {required && <span className={styles.formTextareaRequired}>*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`${styles.formTextarea} ${error ? styles.formTextareaError : ''}`}
        {...props}
      />
      {hint && !error && <span className={styles.formTextareaHint}>{hint}</span>}
      {error && <span className={styles.formTextareaErrorText}>{error}</span>}
    </div>
  );
});
