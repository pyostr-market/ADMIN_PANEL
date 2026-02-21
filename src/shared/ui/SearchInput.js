import { forwardRef } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Input } from './Input';
import './SearchInput.css';

export const SearchInput = forwardRef(function SearchInput(
  {
    value,
    onChange,
    placeholder = 'Поиск...',
    disabled = false,
    loading = false,
    className = '',
    ...props
  },
  ref,
) {
  return (
    <div className={`search-input ${className}`}>
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled || loading}
        leftIcon={<FiSearch />}
        wrapperClassName="search-input__wrapper"
        {...props}
      />
    </div>
  );
});
