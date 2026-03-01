import { productApi } from '../../../shared/api/http';
import { API_ENDPOINTS } from '../../../shared/config/env';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * Получение списка атрибутов продуктов
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов на странице
 * @param {string} params.name - Фильтр по названию
 */
export async function getAttributesRequest({
  page = 1,
  limit = 20,
  name,
} = {}) {
  const offset = (page - 1) * limit;
  const requestParams = { limit, offset };
  if (name) requestParams.name = name;

  const response = await productApi.get(API_ENDPOINTS.attributes, { params: requestParams });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return { items, pagination };
}

/**
 * Получение данных атрибута по ID
 * @param {number} attributeId - ID атрибута
 */
export async function getAttributeByIdRequest(attributeId) {
  const response = await productApi.get(`${API_ENDPOINTS.attributes}/${attributeId}`);
  return unwrapResponse(response);
}

/**
 * Создание атрибута
 * @param {Object} payload - Данные атрибута
 * @param {string} payload.name - Название (обяз.)
 * @param {string} payload.value - Значение (обяз.)
 * @param {boolean} payload.is_filterable - Возможность фильтрации
 */
export async function createAttributeRequest(payload) {
  const response = await productApi.post(API_ENDPOINTS.attributes, payload);
  return unwrapResponse(response);
}

/**
 * Обновление атрибута (PUT)
 * @param {number} attributeId - ID атрибута
 * @param {Object} payload - Данные для обновления
 * @param {string | null} payload.name - Название
 * @param {string | null} payload.value - Значение
 * @param {boolean | null} payload.is_filterable - Возможность фильтрации
 */
export async function updateAttributeRequest(attributeId, payload) {
  const response = await productApi.put(`${API_ENDPOINTS.attributes}/${attributeId}`, payload);
  return unwrapResponse(response);
}

/**
 * Удаление атрибута
 * @param {number} attributeId - ID атрибута
 */
export async function deleteAttributeRequest(attributeId) {
  const response = await productApi.delete(`${API_ENDPOINTS.attributes}/${attributeId}`);
  return unwrapResponse(response);
}

/**
 * Получение аудита атрибутов продуктов
 * @param {Object} params - Параметры запроса
 * @param {number | null} params.attribute_id - Фильтр по ID атрибута
 * @param {number | null} params.user_id - Фильтр по ID пользователя
 * @param {string | null} params.action - Фильтр по действию
 * @param {number} params.limit - Количество элементов
 * @param {number} params.offset - Смещение
 */
export async function getAttributeAuditRequest({
  attribute_id,
  user_id,
  action,
  limit = 20,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (attribute_id !== undefined && attribute_id !== null) params.attribute_id = attribute_id;
  if (user_id !== undefined && user_id !== null) params.user_id = user_id;
  if (action) params.action = action;

  const response = await productApi.get(`${API_ENDPOINTS.attributes}/admin/audit`, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}
