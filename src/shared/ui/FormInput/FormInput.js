import { forwardRef } from 'react';
import { Input as BaseInput } from '../Input/Input';
import styles from './FormInput.module.css';

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
    <div className={`${styles.formInputWrapper} ${wrapperClassName}`}>
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
