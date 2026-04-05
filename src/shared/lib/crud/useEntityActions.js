import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Хук для управления действиями сущности (просмотр, редактирование, создание, удаление)
 * @param {Object} options - Опции хука
 * @param {string} options.baseUrl - Базовый URL для сущности (например, '/catalog/products')
 * @param {string} options.listUrl - URL списка (по умолчанию baseUrl)
 * @param {Function} options.onDelete - Функция удаления (опционально)
 * @param {Function} options.onSuccess - Callback после успешного действия
 * @param {boolean} options.syncWithUrl - Сохранять URL-параметры при навигации (по умолчанию false)
 * @returns {Object} Методы для управления сущностью
 */
export function useEntityActions({
  baseUrl,
  listUrl = baseUrl,
  onDelete,
  onSuccess,
  syncWithUrl = false,
} = {}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /**
   * Вспомогательная функция для получения URL с сохранением searchParams
   */
  const getUrlWithParams = useCallback((path) => {
    if (!syncWithUrl || !searchParams) return path;
    const paramsString = searchParams.toString();
    return paramsString ? `${path}?${paramsString}` : path;
  }, [syncWithUrl, searchParams]);

  /**
   * Переход к странице просмотра сущности
   * @param {string|number} id - ID сущности
   * @param {string} [customPath] - Кастомный путь (опционально)
   */
  const view = useCallback((id, customPath) => {
    const path = customPath || `${baseUrl}/${id}`;
    navigate(getUrlWithParams(path));
  }, [baseUrl, navigate, getUrlWithParams]);

  const viewHandler = useCallback((e, id, customPath) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    const path = customPath || `${baseUrl}/${id}`;
    navigate(getUrlWithParams(path));
  }, [baseUrl, navigate, getUrlWithParams]);

  /**
   * Переход к странице редактирования сущности
   * @param {string|number} id - ID сущности
   * @param {string} [customPath] - Кастомный путь (опционально)
   */
  const edit = useCallback((id, customPath) => {
    const path = customPath || `${baseUrl}/${id}/edit`;
    navigate(getUrlWithParams(path));
  }, [baseUrl, navigate, getUrlWithParams]);

  const editHandler = useCallback((e, id, customPath) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    const path = customPath || `${baseUrl}/${id}/edit`;
    navigate(getUrlWithParams(path));
  }, [baseUrl, navigate, getUrlWithParams]);

  /**
   * Переход к странице создания сущности
   * @param {string} [customPath] - Кастомный путь (опционально)
   */
  const create = useCallback((customPath) => {
    const path = customPath || `${baseUrl}/create`;
    navigate(getUrlWithParams(path));
  }, [baseUrl, navigate, getUrlWithParams]);

  const createHandler = useCallback((e, customPath) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    const path = customPath || `${baseUrl}/create`;
    navigate(getUrlWithParams(path));
  }, [baseUrl, navigate, getUrlWithParams]);

  /**
   * Переход к странице аудита сущности
   * @param {string|number} id - ID сущности
   * @param {string} [customPath] - Кастомный путь (опционально)
   */
  const audit = useCallback((id, customPath) => {
    const path = customPath || `${baseUrl}/${id}/audit`;
    navigate(getUrlWithParams(path));
  }, [baseUrl, navigate, getUrlWithParams]);

  const auditHandler = useCallback((e, id, customPath) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    const path = customPath || `${baseUrl}/${id}/audit`;
    navigate(getUrlWithParams(path));
  }, [baseUrl, navigate, getUrlWithParams]);

  /**
   * Переход к списку сущностей
   */
  const backToList = useCallback(() => {
    navigate(getUrlWithParams(listUrl));
  }, [listUrl, navigate, getUrlWithParams]);

  const backToListHandler = useCallback((e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate(getUrlWithParams(listUrl));
  }, [listUrl, navigate, getUrlWithParams]);

  /**
   * Удаление сущности
   * @param {string|number} id - ID сущности
   * @returns {Promise<boolean>} Результат удаления
   */
  const remove = useCallback(async (id) => {
    if (!onDelete) {
      throw new Error('onDelete function is required');
    }

    const result = await onDelete(id);

    if (result && onSuccess) {
      onSuccess('delete');
    }

    return result;
  }, [onDelete, onSuccess]);

  return {
    view,
    viewHandler,
    edit,
    editHandler,
    create,
    createHandler,
    audit,
    auditHandler,
    backToList,
    backToListHandler,
    remove,
  };
}
