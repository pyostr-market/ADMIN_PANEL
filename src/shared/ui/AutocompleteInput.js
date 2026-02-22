import { useState, useRef, useEffect, useCallback } from 'react';
import { FiChevronDown, FiSearch, FiX } from 'react-icons/fi';
import { useClickOutside } from '../lib/clickOutside';
import './AutocompleteInput.css';

/**
 * Компонент автокомплита с выпадающим списком
 * @param {string} label - Лейбл поля
 * @param {string} value - Текущее значение (ID)
 * @param {Function} onChange - Callback при изменении значения
 * @param {Function} fetchOptions - Функция для получения опций
 * @param {string} placeholder - Плейсхолдер
 * @param {boolean} disabled - Отключено ли поле
 * @param {string} error - Сообщение об ошибке
 * @param {Function} getOptionLabel - Функция для получения лейбла опции
 * @param {Function} getOptionValue - Функция для получения значения опции
 * @param {string} searchField - Поле для поиска
 */
export function AutocompleteInput({
  label,
  value = '',
  onChange,
  fetchOptions,
  placeholder = 'Начните ввод для поиска...',
  disabled = false,
  error,
  getOptionLabel = (option) => option.name || `ID: ${option.id}`,
  getOptionValue = (option) => option.id,
  searchField = 'name',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Загружаем опции при изменении searchQuery
  const loadOptions = useCallback(async (query) => {
    if (!fetchOptions) return;

    setIsLoading(true);
    try {
      const params = query ? { [searchField]: query } : {};
      const results = await fetchOptions(params);
      setOptions(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error('Error loading options:', err);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchOptions, searchField]);

  // Debounce для поиска
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (isOpen) {
      debounceRef.current = setTimeout(() => {
        loadOptions(searchQuery);
      }, 300);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, isOpen, loadOptions]);

  // Находим выбранную опцию при изменении value
  useEffect(() => {
    if (value && options.length > 0) {
      const found = options.find((opt) => String(getOptionValue(opt)) === String(value));
      if (found) {
        setSelectedOption(found);
      }
    } else if (!value) {
      setSelectedOption(null);
    }
  }, [value, options, getOptionValue]);

  // Закрываем dropdown при клике вне компонента
  useClickOutside([inputRef, dropdownRef], () => {
    setIsOpen(false);
  });

  const handleOpenDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  }, [disabled]);

  const handleCloseDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  }, []);

  const handleSelectOption = useCallback((option) => {
    const optionValue = getOptionValue(option);
    onChange(optionValue);
    setSelectedOption(option);
    setIsOpen(false);
    setSearchQuery('');
  }, [onChange, getOptionValue]);

  const handleClear = useCallback(() => {
    onChange('');
    setSelectedOption(null);
    setSearchQuery('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    if (!isOpen) {
      setIsOpen(true);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          handleSelectOption(options[highlightedIndex]);
        }
        break;
      case 'Escape':
        handleCloseDropdown();
        break;
      default:
        break;
    }
  }, [isOpen, options, highlightedIndex, handleSelectOption, handleCloseDropdown]);

  // Скроллим к выделенному элементу
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      );
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="autocomplete-input-wrapper">
      {label && <label className="autocomplete-input-label">{label}</label>}

      <div className="autocomplete-input">
        <div className="autocomplete-input__field">
          <FiSearch className="autocomplete-input__icon" />
          <input
            ref={inputRef}
            type="text"
            value={isOpen ? searchQuery : selectedOption ? getOptionLabel(selectedOption) : ''}
            onChange={handleInputChange}
            onFocus={handleOpenDropdown}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`autocomplete-input__field-input ${error ? 'autocomplete-input__field-input--error' : ''}`}
            disabled={disabled}
          />
          {value && (
            <button
              type="button"
              className="autocomplete-input__clear"
              onClick={handleClear}
              disabled={disabled}
            >
              <FiX />
            </button>
          )}
          <button
            type="button"
            className={`autocomplete-input__toggle ${isOpen ? 'autocomplete-input__toggle--open' : ''}`}
            onClick={handleOpenDropdown}
            disabled={disabled}
          >
            <FiChevronDown />
          </button>
        </div>
      </div>

      {error && <span className="autocomplete-input-error">{error}</span>}

      {isOpen && (
        <div
          ref={dropdownRef}
          className="autocomplete-input__dropdown"
          role="listbox"
        >
          {isLoading ? (
            <div className="autocomplete-input__option autocomplete-input__option--loading">
              Загрузка...
            </div>
          ) : options.length === 0 ? (
            <div className="autocomplete-input__option autocomplete-input__option--empty">
              {searchQuery ? 'Ничего не найдено' : 'Начните ввод для поиска'}
            </div>
          ) : (
            options.map((option, index) => {
              const optionValue = getOptionValue(option);
              const isSelected = String(optionValue) === String(value);
              const isHighlighted = index === highlightedIndex;

              return (
                <div
                  key={optionValue}
                  data-index={index}
                  className={`autocomplete-input__option ${
                    isSelected ? 'autocomplete-input__option--selected' : ''
                  } ${isHighlighted ? 'autocomplete-input__option--highlighted' : ''}`}
                  onClick={() => handleSelectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="autocomplete-input__option-label">
                    {getOptionLabel(option)}
                  </span>
                  <span className="autocomplete-input__option-value">
                    ID: {optionValue}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
