import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '../../api/apiError';
import { useNotifications } from '../notifications/NotificationProvider';

const EMPTY_PAGINATION = { page: 1, limit: 20, total: 0, pages: 1 };

/**
 * Хук для управления CRUD-списком
 * @param {Object} config - Конфигурация хука
 * @param {Function} config.fetchFn - Функция для получения данных (принимает { page, limit, search, filters })
 * @param {Function} config.createFn - Функция для создания записи
 * @param {Function} config.updateFn - Функция для обновления записи
 * @param {Function} config.deleteFn - Функция для удаления записи
 * @param {number} config.defaultLimit - Количество элементов на странице
 * @param {string} config.entityName - Название сущности (для уведомлений)
 * @param {Function} config.normalizeFn - Функция нормализации данных (опционально)
 * @returns {Object} - Методы и состояние для управления списком
 */
export function useCrudList({
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  defaultLimit = 20,
  entityName = 'Запись',
  normalizeFn = (data) => data,
}) {
  const notifications = useNotifications();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(defaultLimit);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const hasLoadedRef = useRef(false);

  // Refs для хранения актуальных значений без пересоздания refresh
  const pageRef = useRef(page);
  const searchRef = useRef(search);
  const filtersRef = useRef(filters);

  // Обновляем ref при изменении значений
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const refresh = useCallback(
    async (pageNum, searchValue, filterValues) => {
      // Используем переданные значения или значения из ref
      const actualPage = pageNum ?? pageRef.current;
      const actualSearch = searchValue ?? searchRef.current;
      const actualFilters = filterValues ?? filtersRef.current;

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchFn({
          page: actualPage,
          limit,
          search: actualSearch || undefined,
          ...actualFilters,
        });

        const normalizedItems = Array.isArray(data.items)
          ? data.items.map(normalizeFn)
          : [];

        setItems(normalizedItems);
        setPagination(data.pagination ?? {
          page: actualPage,
          limit,
          total: normalizedItems.length,
          pages: 1,
        });
        hasLoadedRef.current = true;
      } catch (err) {
        const message = getApiErrorMessage(err);
        setError(message);
        notifications.error(message);
        setItems([]);
        setPagination(EMPTY_PAGINATION);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFn, limit, normalizeFn, notifications],
  );

  useEffect(() => {
    if (!hasLoadedRef.current) {
      refresh();
    }
  }, [refresh]);

  useEffect(() => {
    if (hasLoadedRef.current) {
      refresh();
    }
  }, [page, search, filters]);

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  const handleCreate = useCallback(
    async (payload) => {
      if (!createFn) {
        throw new Error('createFn is not provided');
      }

      setIsSubmitting(true);

      try {
        const created = await createFn(payload);
        const normalized = normalizeFn(created);

        setItems((prev) => [normalized, ...prev]);
        notifications.info(`${entityName} создана`);

        await refresh();
        return normalized;
      } catch (err) {
        const message = getApiErrorMessage(err);
        notifications.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [createFn, normalizeFn, entityName, notifications, refresh],
  );

  const handleUpdate = useCallback(
    async (id, payload) => {
      if (!updateFn) {
        throw new Error('updateFn is not provided');
      }

      setIsSubmitting(true);

      try {
        const updated = await updateFn(id, payload);
        const normalized = normalizeFn(updated);

        setItems((prev) => prev.map((item) => (item.id === id ? normalized : item)));
        notifications.info(`${entityName} обновлена`);

        return normalized;
      } catch (err) {
        const message = getApiErrorMessage(err);
        notifications.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [updateFn, normalizeFn, entityName, notifications],
  );

  const handleDelete = useCallback(
    async (id, confirmMessage = `Удалить ${entityName.toLowerCase()}?`) => {
      if (!deleteFn) {
        throw new Error('deleteFn is not provided');
      }

      const shouldDelete = window.confirm(confirmMessage);
      if (!shouldDelete) {
        return false;
      }

      setIsSubmitting(true);

      try {
        await deleteFn(id);
        setItems((prev) => prev.filter((item) => item.id !== id));
        notifications.info(`${entityName} удалена`);
        return true;
      } catch (err) {
        const message = getApiErrorMessage(err);
        notifications.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [deleteFn, entityName, notifications],
  );

  return {
    items,
    page,
    pagination,
    search,
    filters,
    isLoading,
    isSubmitting,
    error,
    setPage,
    setSearch: handleSearch,
    setFilters: handleFilterChange,
    refresh,
    create: handleCreate,
    update: handleUpdate,
    delete: handleDelete,
  };
}
