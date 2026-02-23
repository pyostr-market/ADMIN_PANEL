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
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allOptions, setAllOptions] = useState([]); // Все загруженные опции
  const [filteredOptions, setFilteredOptions] = useState([]); // Отфильтрованные опции
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasLoadedAllOptions, setHasLoadedAllOptions] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Фильтрация опций на клиенте при изменении searchQuery
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOptions(allOptions);
    } else {
      const query = searchQuery.toLowerCase().trim();
      setFilteredOptions(
        allOptions.filter((opt) => {
          const label = getOptionLabel(opt).toLowerCase();
          return label.includes(query);
        })
      );
    }
  }, [searchQuery, allOptions, getOptionLabel]);

  // Загружаем все опции при первом открытии dropdown
  const loadAllOptions = useCallback(async () => {
    if (!fetchOptions || hasLoadedAllOptions) return;

    setIsLoading(true);
    try {
      const results = await fetchOptions({ limit: 100, offset: 0 });
      const optionsArray = Array.isArray(results) ? results : [];
      setAllOptions(optionsArray);
      setFilteredOptions(optionsArray);
      setHasLoadedAllOptions(true);
    } catch (err) {
      console.error('Error loading all options:', err);
      setAllOptions([]);
      setFilteredOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchOptions, hasLoadedAllOptions]);

  // Загружаем выбранную опцию по ID при монтировании (если value уже есть)
  useEffect(() => {
    if (value && !isInitialized) {
      const loadSelectedOption = async () => {
        try {
          // Загружаем все опции без фильтра, чтобы найти нужную по ID
          const results = await fetchOptions({ limit: 100, offset: 0 });
          if (Array.isArray(results)) {
            const found = results.find((opt) => String(getOptionValue(opt)) === String(value));
            if (found) {
              setSelectedOption(found);
            }
            setAllOptions(results);
            setFilteredOptions(results);
            setHasLoadedAllOptions(true);
          }
        } catch (err) {
          console.error('Error loading selected option:', err);
        } finally {
          setIsInitialized(true);
        }
      };
      loadSelectedOption();
    } else if (!value) {
      setIsInitialized(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Закрываем dropdown при клике вне компонента
  useClickOutside([inputRef, dropdownRef], () => {
    setIsOpen(false);
  });

  const handleOpenDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      setSearchQuery('');
      setHighlightedIndex(-1);
      // Загружаем все опции при открытии dropdown
      loadAllOptions();
    }
  }, [disabled, loadAllOptions]);

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
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        handleCloseDropdown();
        break;
      default:
        break;
    }
  }, [isOpen, filteredOptions, highlightedIndex, handleSelectOption, handleCloseDropdown]);

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
          ) : filteredOptions.length === 0 ? (
            <div className="autocomplete-input__option autocomplete-input__option--empty">
              {searchQuery ? 'Ничего не найдено' : 'Начните ввод для поиска'}
            </div>
          ) : (
            filteredOptions.map((option, index) => {
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
