import { forwardRef } from 'react';
import './Button.css';

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
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
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
      {loading && <span className="btn__loader" />}
      {leftIcon && <span className="btn__icon btn__icon--left">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="btn__icon btn__icon--right">{rightIcon}</span>}
    </button>
  );
});
