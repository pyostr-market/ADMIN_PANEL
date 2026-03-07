import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Хук для управления действиями сущности (просмотр, редактирование, создание, удаление)
 * @param {Object} options - Опции хука
 * @param {string} options.baseUrl - Базовый URL для сущности (например, '/catalog/products')
 * @param {string} options.listUrl - URL списка (по умолчанию baseUrl)
 * @param {Function} options.onDelete - Функция удаления (опционально)
 * @param {Function} options.onSuccess - Callback после успешного действия
 * @returns {Object} Методы для управления сущностью
 */
export function useEntityActions({
  baseUrl,
  listUrl = baseUrl,
  onDelete,
  onSuccess,
} = {}) {
  const navigate = useNavigate();

  /**
   * Переход к странице просмотра сущности
   * @param {string|number} id - ID сущности
   * @param {string} [customPath] - Кастомный путь (опционально)
   */
  const view = useCallback((id, customPath) => {
    const path = customPath || `${baseUrl}/${id}`;
    navigate(path);
  }, [baseUrl, navigate]);

  /**
   * Переход к странице редактирования сущности
   * @param {string|number} id - ID сущности
   * @param {string} [customPath] - Кастомный путь (опционально)
   */
  const edit = useCallback((id, customPath) => {
    const path = customPath || `${baseUrl}/${id}/edit`;
    navigate(path);
  }, [baseUrl, navigate]);

  /**
   * Переход к странице создания сущности
   * @param {string} [customPath] - Кастомный путь (опционально)
   */
  const create = useCallback((customPath) => {
    const path = customPath || `${baseUrl}/create`;
    navigate(path);
  }, [baseUrl, navigate]);

  /**
   * Переход к странице аудита сущности
   * @param {string|number} id - ID сущности
   * @param {string} [customPath] - Кастомный путь (опционально)
   */
  const audit = useCallback((id, customPath) => {
    const path = customPath || `${baseUrl}/${id}/audit`;
    navigate(path);
  }, [baseUrl, navigate]);

  /**
   * Переход к списку сущностей
   */
  const backToList = useCallback(() => {
    navigate(listUrl);
  }, [listUrl, navigate]);

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
    edit,
    create,
    audit,
    backToList,
    remove,
  };
}
