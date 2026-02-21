import { productApi } from '../../../shared/api/http';
import { API_ENDPOINTS } from '../../../shared/config/env';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * Получение списка типов продуктов
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов на странице
 * @param {string} params.name - Фильтр по названию
 */
export async function getProductTypesRequest({
  page = 1,
  limit = 20,
  name,
} = {}) {
  const offset = (page - 1) * limit;
  const requestParams = { limit, offset };
  if (name) requestParams.name = name;
  console.log(requestParams);
  console.log(API_ENDPOINTS.productTypes);

  const response = await productApi.get(API_ENDPOINTS.productTypes, { params: requestParams });
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
 * Получение данных типа продукта по ID
 * @param {number} productTypeId - ID типа продукта
 */
export async function getProductTypeByIdRequest(productTypeId) {
  const response = await productApi.get(`${API_ENDPOINTS.productTypes}/${productTypeId}`);
  return unwrapResponse(response);
}

/**
 * Создание типа продукта
 * @param {Object} payload - Данные типа продукта
 * @param {string} payload.name - Название (обяз.)
 * @param {number | null} payload.parent_id - ID родительского типа
 */
export async function createProductTypeRequest(payload) {
  const response = await productApi.post(API_ENDPOINTS.productTypes, payload);
  return unwrapResponse(response);
}

/**
 * Обновление типа продукта (PUT)
 * @param {number} productTypeId - ID типа продукта
 * @param {Object} payload - Данные для обновления
 * @param {string | null} payload.name - Название
 * @param {number | null} payload.parent_id - ID родительского типа
 */
export async function updateProductTypeRequest(productTypeId, payload) {
  const response = await productApi.put(`${API_ENDPOINTS.productTypes}/${productTypeId}`, payload);
  return unwrapResponse(response);
}

/**
 * Удаление типа продукта
 * @param {number} productTypeId - ID типа продукта
 */
export async function deleteProductTypeRequest(productTypeId) {
  const response = await productApi.delete(`${API_ENDPOINTS.productTypes}/${productTypeId}`);
  return unwrapResponse(response);
}

/**
 * Получение аудита типов продуктов
 * @param {Object} params - Параметры запроса
 * @param {number | null} params.product_type_id - Фильтр по ID типа продукта
 * @param {number | null} params.user_id - Фильтр по ID пользователя
 * @param {string | null} params.action - Фильтр по действию
 * @param {number} params.limit - Количество элементов
 * @param {number} params.offset - Смещение
 */
export async function getProductTypeAuditRequest({
  product_type_id,
  user_id,
  action,
  limit = 20,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (product_type_id !== undefined && product_type_id !== null) params.product_type_id = product_type_id;
  if (user_id !== undefined && user_id !== null) params.user_id = user_id;
  if (action) params.action = action;

  const response = await productApi.get(`${API_ENDPOINTS.productTypes}/admin/audit`, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}
