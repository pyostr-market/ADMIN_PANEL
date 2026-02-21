import { forwardRef } from 'react';
import './Input.css';

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
    <div className={`input-wrapper ${wrapperClassName}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        {leftIcon && <span className="input-icon input-icon--left">{leftIcon}</span>}
        <input
          ref={ref}
          className={`input ${className}`}
          {...props}
        />
        {rightIcon && <span className="input-icon input-icon--right">{rightIcon}</span>}
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
});
