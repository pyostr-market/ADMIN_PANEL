import { forwardRef } from 'react';
import styles from './Button.module.css';

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    className = '',
    ...props
  },
  ref,
) {
  const classNames = [
    styles.btn,
    styles[`btn${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`btn${size.charAt(0).toUpperCase() + size.slice(1)}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type="button"
      className={classNames}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className={styles.btnLoader} />}
      {leftIcon && <span className={`${styles.btnIcon} ${styles.btnIconLeft}`}>{leftIcon}</span>}
      {children}
      {rightIcon && <span className={`${styles.btnIcon} ${styles.btnIconRight}`}>{rightIcon}</span>}
    </button>
  );
});
