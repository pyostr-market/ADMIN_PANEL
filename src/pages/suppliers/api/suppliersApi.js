import { productApi } from '../../../shared/api/http';
import { API_ENDPOINTS } from '../../../shared/config/env';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * Получение списка поставщиков
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов на странице
 * @param {string} params.name - Фильтр по названию
 */
export async function getSuppliersRequest({
  page = 1,
  limit = 20,
  name,
} = {}) {
  const offset = (page - 1) * limit;
  const params = { limit, offset };
  if (name) params.name = name;

  const response = await productApi.get(API_ENDPOINTS.suppliers, { params });
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
 * Получение данных поставщика по ID
 * @param {number} supplierId - ID поставщика
 */
export async function getSupplierByIdRequest(supplierId) {
  const response = await productApi.get(`${API_ENDPOINTS.suppliers}/${supplierId}`);
  return unwrapResponse(response);
}

/**
 * Создание поставщика
 * @param {Object} payload - Данные поставщика
 * @param {string} payload.name - Название (обяз.)
 * @param {string | null} payload.contact_email - Email для связи
 * @param {string | null} payload.phone - Телефон
 */
export async function createSupplierRequest(payload) {
  const response = await productApi.post(API_ENDPOINTS.suppliers, payload);
  return unwrapResponse(response);
}

/**
 * Обновление поставщика (PUT)
 * @param {number} supplierId - ID поставщика
 * @param {Object} payload - Данные для обновления
 * @param {string | null} payload.name - Название
 * @param {string | null} payload.contact_email - Email для связи
 * @param {string | null} payload.phone - Телефон
 */
export async function updateSupplierRequest(supplierId, payload) {
  const response = await productApi.put(`${API_ENDPOINTS.suppliers}/${supplierId}`, payload);
  return unwrapResponse(response);
}

/**
 * Удаление поставщика
 * @param {number} supplierId - ID поставщика
 */
export async function deleteSupplierRequest(supplierId) {
  const response = await productApi.delete(`${API_ENDPOINTS.suppliers}/${supplierId}`);
  return unwrapResponse(response);
}

/**
 * Получение аудита поставщиков
 * @param {Object} params - Параметры запроса
 * @param {number | null} params.supplier_id - Фильтр по ID поставщика
 * @param {number | null} params.user_id - Фильтр по ID пользователя
 * @param {string | null} params.action - Фильтр по действию
 * @param {number} params.limit - Количество элементов
 * @param {number} params.offset - Смещение
 */
export async function getSupplierAuditRequest({
  supplier_id,
  user_id,
  action,
  limit = 20,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (supplier_id !== undefined && supplier_id !== null) params.supplier_id = supplier_id;
  if (user_id !== undefined && user_id !== null) params.user_id = user_id;
  if (action) params.action = action;

  const response = await productApi.get(`${API_ENDPOINTS.suppliers}/admin/audit`, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}
