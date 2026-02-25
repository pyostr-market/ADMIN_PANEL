import { forwardRef } from 'react';
import styles from './Input.module.css';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    leftIcon,
    rightIcon,
    className = '',
    wrapperClassName = '',
    ...props
  },
  ref,
) {
  return (
    <div className={`${styles.inputWrapper} ${wrapperClassName}`}>
      {label && <label className={styles.inputLabel}>{label}</label>}
      <div className={styles.inputContainer}>
        {leftIcon && <span className={`${styles.inputIcon} ${styles.inputIconLeft}`}>{leftIcon}</span>}
        <input
          ref={ref}
          className={`${styles.input} ${className}`}
          {...props}
        />
        {rightIcon && <span className={`${styles.inputIcon} ${styles.inputIconRight}`}>{rightIcon}</span>}
      </div>
      {error && <span className={styles.inputError}>{error}</span>}
    </div>
  );
});
