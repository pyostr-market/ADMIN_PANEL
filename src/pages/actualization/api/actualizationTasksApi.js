import { pricingApi } from '../../../shared/api/http';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

// ==================== ACTUALIZATION TASKS ====================

/**
 * Получение списка задач актуализации с пагинацией и фильтрами
 * @param {Object} params - Параметры запроса
 * @param {number} [params.page=1] - Номер страницы
 * @param {number} [params.limit=100] - Количество записей на странице
 * @param {string} [params.status] - Фильтр по статусу задачи
 * @param {number} [params.user_id] - Фильтр по ID пользователя
 */
export async function getActualizationTasksRequest({
  page = 1,
  limit = 100,
  status,
  user_id,
} = {}) {
  const offset = (page - 1) * limit;
  const queryParams = {};
  if (status) queryParams.status = status;
  if (user_id) queryParams.user_id = user_id;
  queryParams.limit = limit;
  queryParams.offset = offset;

  const response = await pricingApi.get('/admin/catalog/actualizations', { params: queryParams });
  const data = unwrapResponse(response);

  // Формат ответа API: { items: [...], total: N }
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return {
    items,
    total,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/**
 * Получение задачи актуализации по ID
 * @param {string} taskId - UUID задачи
 */
export async function getActualizationTaskByIdRequest(taskId) {
  const response = await pricingApi.get(`/admin/catalog/actualizations/${taskId}`);
  return unwrapResponse(response);
}

/**
 * Удаление задачи актуализации (каскадно удаляет все привязанные товары)
 * @param {string} taskId - UUID задачи
 */
export async function deleteActualizationTaskRequest(taskId) {
  const response = await pricingApi.delete(`/admin/catalog/actualizations/${taskId}`);
  return unwrapResponse(response);
}
