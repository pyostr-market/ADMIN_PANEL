import { forwardRef } from 'react';
import styles from './FormField.module.css';

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
    <div className={`${styles.formField} ${className} ${hasError ? styles.formFieldError : ''}`}>
      {label && (
        <label className={styles.formFieldLabel}>
          {label}
          {required && <span className={styles.formFieldRequired}>*</span>}
        </label>
      )}
      {children}
      {hint && !hasError && <span className={styles.formFieldHint}>{hint}</span>}
      {error && <span className={styles.formFieldErrorText}>{error}</span>}
    </div>
  );
});
