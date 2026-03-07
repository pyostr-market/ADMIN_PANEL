import { productApi } from '../../api/http';
import { API_ENDPOINTS } from '../../config/env';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * Получение списка производителей
 */
export async function getManufacturersRequest({
  page = 1,
  limit = 20,
  name,
} = {}) {
  const offset = (page - 1) * limit;
  const params = { limit, offset };
  if (name) params.name = name;

  const response = await productApi.get(API_ENDPOINTS.manufacturers, { params });
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
 * Получение данных производителя по ID
 */
export async function getManufacturerByIdRequest(manufacturerId) {
  const response = await productApi.get(`${API_ENDPOINTS.manufacturers}/${manufacturerId}`);
  return unwrapResponse(response);
}

/**
 * Создание производителя
 */
export async function createManufacturerRequest(payload) {
  const response = await productApi.post(API_ENDPOINTS.manufacturers, payload);
  return unwrapResponse(response);
}

/**
 * Обновление производителя (PUT)
 */
export async function updateManufacturerRequest(manufacturerId, payload) {
  const response = await productApi.put(`${API_ENDPOINTS.manufacturers}/${manufacturerId}`, payload);
  return unwrapResponse(response);
}

/**
 * Удаление производителя
 */
export async function deleteManufacturerRequest(manufacturerId) {
  const response = await productApi.delete(`${API_ENDPOINTS.manufacturers}/${manufacturerId}`);
  return unwrapResponse(response);
}

/**
 * Получение аудита производителей
 */
export async function getManufacturerAuditRequest({
  manufacturer_id,
  user_id,
  action,
  limit = 20,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (manufacturer_id !== undefined && manufacturer_id !== null) params.manufacturer_id = manufacturer_id;
  if (user_id !== undefined && user_id !== null) params.user_id = user_id;
  if (action) params.action = action;

  const response = await productApi.get(`${API_ENDPOINTS.manufacturers}/admin/audit`, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}
