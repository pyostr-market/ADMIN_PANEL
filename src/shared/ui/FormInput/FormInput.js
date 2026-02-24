import { forwardRef } from 'react';
import { Input as BaseInput } from '../Input';
import './FormInput.css';

export const FormInput = forwardRef(function FormInput(
  {
    label,
    error,
    hint,
    required = false,
    leftIcon,
    rightIcon,
    className = '',
    wrapperClassName = '',
    ...props
  },
  ref,
) {
  return (
    <div className={`form-input-wrapper ${wrapperClassName}`}>
      <BaseInput
        ref={ref}
        label={label}
        error={error}
        hint={hint}
        required={required}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        className={className}
        {...props}
      />
    </div>
  );
});
