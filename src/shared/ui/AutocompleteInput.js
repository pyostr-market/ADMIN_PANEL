import { useState, useRef, useEffect, useCallback } from 'react';
import { FiChevronDown, FiSearch, FiX } from 'react-icons/fi';
import { useClickOutside } from '../lib/clickOutside';
import './AutocompleteInput.css';

const PAGE_SIZE = 10;

/**
 * Компонент автокомплита с выпадающим списком и пагинацией
 * @param {string} label - Лейбл поля
 * @param {string} value - Текущее значение (ID)
 * @param {Function} onChange - Callback при изменении значения
 * @param {Function} fetchOptions - Функция для получения опций (принимает { limit, offset, name })
 * @param {string} placeholder - Плейсхолдер
 * @param {boolean} disabled - Отключено ли поле
 * @param {string} error - Сообщение об ошибке
 * @param {Function} getOptionLabel - Функция для получения лейбла опции
 * @param {Function} getOptionValue - Функция для получения значения опции
 * @param {Object} selectedOption - Выбранная опция (полный объект из API)
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
  selectedOption: propSelectedOption = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [didLoadOnce, setDidLoadOnce] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Используем selectedOption из prop или из состояния
  const effectiveSelectedOption = propSelectedOption !== null ? propSelectedOption : selectedOption;

  // Закрываем dropdown при клике вне компонента
  useClickOutside([inputRef, dropdownRef], () => {
    setIsOpen(false);
  });

  // Загрузка опций (с серверным поиском и пагинацией)
  const loadOptions = useCallback(async (query, currentOffset = 0, append = false) => {
    if (!fetchOptions) return;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params = {
        limit: PAGE_SIZE,
        offset: currentOffset,
      };
      if (query !== undefined && query !== null && String(query).trim() !== '') {
        params.name = String(query).trim();
      }

      const results = await fetchOptions(params);
      const optionsArray = Array.isArray(results) ? results : [];

      if (append) {
        setOptions((prev) => [...prev, ...optionsArray]);
      } else {
        setOptions(optionsArray);
      }

      // Есть ли еще данные для загрузки
      setHasMore(optionsArray.length === PAGE_SIZE);
    } catch (err) {
      console.error('Error loading options:', err);
      if (!append) {
        setOptions([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [fetchOptions]);

  // Debounce для поиска при вводе текста (не срабатывает при первом открытии)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Загружаем только если dropdown открыт И уже была загрузка при открытии
    if (isOpen && didLoadOnce) {
      debounceRef.current = setTimeout(() => {
        loadOptions(searchQuery, 0, false);
      }, 300);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, isOpen, didLoadOnce, loadOptions]);

  // Находим выбранную опцию в загруженных опциях (если не передана извне)
  useEffect(() => {
    if (value && options.length > 0 && propSelectedOption === null) {
      const found = options.find((opt) => String(getOptionValue(opt)) === String(value));
      if (found) {
        setSelectedOption(found);
      }
    } else if (!value && propSelectedOption === null) {
      setSelectedOption(null);
    }
  }, [value, options, getOptionValue, propSelectedOption]);

  // Сброс offset и опций при изменении searchQuery
  useEffect(() => {
    setOffset(0);
  }, [searchQuery]);

  // Observer для бесконечного скролла
  useEffect(() => {
    if (!isOpen || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          const newOffset = offset + PAGE_SIZE;
          setOffset(newOffset);
          loadOptions(searchQuery, newOffset, true);
        }
      },
      { threshold: 0.5, root: dropdownRef.current }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isOpen, hasMore, isLoadingMore, offset, searchQuery, loadOptions]);

  const handleOpenDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      setSearchQuery('');
      setHighlightedIndex(-1);
      setOffset(0);
      // Загружаем данные сразу при открытии (без debounce)
      if (!didLoadOnce) {
        loadOptions('', 0, false);
        setDidLoadOnce(true);
      }
    }
  }, [disabled, didLoadOnce, loadOptions]);

  const handleCloseDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
    setDidLoadOnce(false); // Сбрасываем чтобы при следующем открытии снова загрузить данные
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
    if (propSelectedOption === null) {
      setSelectedOption(null);
    }
    setSearchQuery('');
    inputRef.current?.focus();
  }, [onChange, propSelectedOption]);

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
            value={isOpen ? searchQuery : effectiveSelectedOption ? getOptionLabel(effectiveSelectedOption) : ''}
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
            <>
              {options.map((option, index) => {
                const optionValue = getOptionValue(option);
                const isSelected = String(optionValue) === String(value);
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={`${optionValue}-${index}`}
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
              })}
              {hasMore && (
                <div
                  ref={loadMoreRef}
                  className="autocomplete-input__load-more"
                >
                  {isLoadingMore ? 'Загрузка...' : ''}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
