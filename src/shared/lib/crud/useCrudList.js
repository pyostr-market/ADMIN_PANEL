import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '../../api/apiError';
import { useNotifications } from '../notifications/NotificationProvider';
import { PRODUCT_SERVICE_BASE_URL, USER_SERVICE_BASE_URL } from '../../config/env';

const EMPTY_PAGINATION = { page: 1, limit: 20, total: 0, pages: 1 };
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;

// Статусы ошибок, при которых не нужно делать повторные попытки
const NO_RETRY_STATUSES = [404, 405];

/**
 * Хук для управления CRUD-списком
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
  const notificationsRef = useRef(notifications);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(defaultLimit);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Refs для отслеживания состояния
  const hasLoadedRef = useRef(false);
  const retryAttemptRef = useRef(0);
  const isRequestInProgressRef = useRef(false);

  // Refs для хранения актуальных значений
  const pageRef = useRef(page);
  const searchRef = useRef(search);
  const filtersRef = useRef(filters);
  const fetchFnRef = useRef(fetchFn);
  const limitRef = useRef(limit);
  const normalizeFnRef = useRef(normalizeFn);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    limitRef.current = limit;
  }, [limit]);

  useEffect(() => {
    normalizeFnRef.current = normalizeFn;
  }, [normalizeFn]);

  const getServiceName = useCallback(() => {
    try {
      const fetchFnStr = fetchFn?.toString() || '';
      if (fetchFnStr.includes(PRODUCT_SERVICE_BASE_URL)) {
        return 'Product API';
      }
      if (fetchFnStr.includes(USER_SERVICE_BASE_URL)) {
        return 'User API';
      }
    } catch (e) {
      // ignore
    }
    return 'API';
  }, [fetchFn]);

  // Основная функция выполнения запроса
  const executeFetch = useCallback(async () => {
    if (isRequestInProgressRef.current) {
      return;
    }

    isRequestInProgressRef.current = true;
    setIsLoading(true);
    setError(null);

    const actualPage = pageRef.current;
    const actualSearch = searchRef.current;
    const actualFilters = filtersRef.current;

    try {
      const data = await fetchFnRef.current({
        page: actualPage,
        limit: limitRef.current,
        search: actualSearch || undefined,
        ...actualFilters,
      });

      const normalizedItems = Array.isArray(data.items)
        ? data.items.map(normalizeFnRef.current)
        : [];

      setItems(normalizedItems);
      setPagination(data.pagination ?? {
        page: actualPage,
        limit: limitRef.current,
        total: normalizedItems.length,
        pages: 1,
      });
      hasLoadedRef.current = true;
      retryAttemptRef.current = 0;
    } catch (err) {
      const status = err?.response?.status;
      const code = status || err?.code || 'N/A';

      // При 404/405 ошибках не делаем повторные попытки
      if (status && NO_RETRY_STATUSES.includes(status)) {
        const serviceName = getServiceName();
        const finalMessage = `Сервис "${serviceName}" недоступен. Код ошибки: ${code}`;
        setError(finalMessage);
        notificationsRef.current?.error(finalMessage);
        setItems([]);
        setPagination(EMPTY_PAGINATION);
        retryAttemptRef.current = MAX_RETRY_ATTEMPTS;
        setIsLoading(false);
        isRequestInProgressRef.current = false;
        return;
      }

      retryAttemptRef.current += 1;

      if (retryAttemptRef.current >= MAX_RETRY_ATTEMPTS) {
        const serviceName = getServiceName();
        const finalMessage = `Сервис "${serviceName}" недоступен. Код ошибки: ${code}`;
        setError(finalMessage);
        notificationsRef.current?.error(finalMessage);
        setItems([]);
        setPagination(EMPTY_PAGINATION);
        setIsLoading(false);
        isRequestInProgressRef.current = false;
        return;
      } else {
        const message = getApiErrorMessage(err);
        setError(message);
        notificationsRef.current?.error(`${message}. Попытка ${retryAttemptRef.current} из ${MAX_RETRY_ATTEMPTS}...`);
        setItems([]);
        setPagination(EMPTY_PAGINATION);

        // Запускаем таймер для повторной попытки
        setTimeout(() => {
          isRequestInProgressRef.current = false;
          executeFetch();
        }, RETRY_DELAY_MS);
        return;
      }
    }

    setIsLoading(false);
    isRequestInProgressRef.current = false;
  }, [getServiceName]);

  // Эффект для загрузки при изменении параметров (включая первоначальную загрузку)
  useEffect(() => {
    // Сбрасываем счетчик попыток при изменении параметров
    retryAttemptRef.current = 0;

    if (!isRequestInProgressRef.current) {
      executeFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, filters]);

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
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
        notificationsRef.current?.info(`${entityName} создана`);

        return normalized;
      } catch (err) {
        const message = getApiErrorMessage(err);
        notificationsRef.current?.error(message);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [createFn, normalizeFn, entityName],
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
        notificationsRef.current?.info(`${entityName} обновлена`);

        return normalized;
      } catch (err) {
        const message = getApiErrorMessage(err);
        notificationsRef.current?.error(message);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [updateFn, normalizeFn, entityName],
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!deleteFn) {
        throw new Error('deleteFn is not provided');
      }

      setIsSubmitting(true);

      try {
        await deleteFn(id);
        setItems((prev) => prev.filter((item) => item.id !== id));
        notificationsRef.current?.info(`${entityName} удалена`);
        return true;
      } catch (err) {
        const message = getApiErrorMessage(err);
        notificationsRef.current?.error(message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [deleteFn, entityName],
  );

  const refresh = useCallback(() => {
    if (!isRequestInProgressRef.current) {
      retryAttemptRef.current = 0;
      executeFetch();
    }
  }, [executeFetch]);

  const retry = useCallback(() => {
    if (!isRequestInProgressRef.current) {
      retryAttemptRef.current = 0;
      executeFetch();
    }
  }, [executeFetch]);

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
    retry,
    create: handleCreate,
    update: handleUpdate,
    delete: handleDelete,
  };
}
