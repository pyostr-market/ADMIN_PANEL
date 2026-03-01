import { useState, useCallback, useRef, useEffect } from 'react';
import { useNotifications } from '../notifications/NotificationProvider';
import { withRetry } from '../retry';

/**
 * Хук для управления CRUD страницами списков
 * @param {Object} config - Конфигурация
 * @param {Function} config.fetchFn - Функция получения списка
 * @param {Function} config.deleteFn - Функция удаления
 * @param {string} config.entityName - Название сущности (в родительном падеже)
 * @param {number} config.defaultLimit - Количество элементов на странице
 * @param {number} config.maxRetries - Максимум попыток при ошибке
 * @returns {Object} Методы и состояния для страницы списка
 */
export function useEntityListPage({
  fetchFn,
  deleteFn,
  entityName = 'элемент',
  defaultLimit = 20,
  maxRetries = 3,
}) {
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Загрузка списка
  const loadItems = useCallback(async () => {
    if (hasError) return;

    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * defaultLimit;
      const { items: data, pagination } = await withRetry(
        () => fetchFn({
          page: currentPage,
          limit: defaultLimit,
          search: searchQuery,
          offset,
        }),
        maxRetries,
      );

      setItems(data);
      setTotal(pagination?.total ?? data.length);
      setRetryCount(0);
      setHasError(false);
    } catch (error) {
      console.error(`Ошибка загрузки ${entityName}:`, error);
      if (retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1);
      } else {
        const message = error.response?.data?.message || error.message || `Не удалось загрузить ${entityName}`;
        notificationsRef.current?.error(message);
        setHasError(true);
      }
    } finally {
      if (!hasError) {
        setIsLoading(false);
      }
    }
  }, [currentPage, searchQuery, fetchFn, entityName, maxRetries, retryCount, hasError, defaultLimit]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Удаление элемента
  const handleDelete = useCallback(async (entity) => {
    setIsDeleting(true);
    try {
      await deleteFn(entity.id);
      notificationsRef.current?.info(`${entityName} удалён`);

      // Перезагружаем список
      setItems((prev) => prev.filter((item) => item.id !== entity.id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (error) {
      const message = error.response?.data?.message || error.message || `Не удалось удалить ${entityName}`;
      notificationsRef.current?.error(message);
      throw error; // Пробрасываем ошибку дальше для обработки в компоненте
    } finally {
      setIsDeleting(false);
    }
  }, [deleteFn, entityName]);

  // Поиск
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Изменение страницы
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Сброс ошибки и повторная загрузка
  const handleRetry = useCallback(() => {
    setHasError(false);
    setRetryCount(0);
    loadItems();
  }, [loadItems]);

  return {
    // Состояния
    items,
    total,
    currentPage,
    searchQuery,
    isLoading,
    isDeleting,
    hasError,
    retryCount,

    // Методы
    loadItems,
    handleDelete,
    handleSearch,
    handlePageChange,
    handleRetry,

    // Вычисленные значения
    totalPages: Math.ceil(total / defaultLimit),
  };
}
