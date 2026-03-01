import { forwardRef } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Input } from '../Input/Input';
import styles from './SearchInput.module.css';

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
    <div className={`${styles.searchInput} ${className}`}>
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        leftIcon={<FiSearch />}
        wrapperClassName={styles.searchInputWrapper}
        rightIcon={loading ? <span className={styles.searchInputLoadingIndicator} /> : null}
        {...props}
      />
    </div>
  );
});
