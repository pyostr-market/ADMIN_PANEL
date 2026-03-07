import { productApi } from '../../api/http';
import { API_ENDPOINTS } from '../../config/env';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * Получение списка поставщиков
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
 */
export async function getSupplierByIdRequest(supplierId) {
  const response = await productApi.get(`${API_ENDPOINTS.suppliers}/${supplierId}`);
  return unwrapResponse(response);
}

/**
 * Создание поставщика
 */
export async function createSupplierRequest(payload) {
  const response = await productApi.post(API_ENDPOINTS.suppliers, payload);
  return unwrapResponse(response);
}

/**
 * Обновление поставщика (PUT)
 */
export async function updateSupplierRequest(supplierId, payload) {
  const response = await productApi.put(`${API_ENDPOINTS.suppliers}/${supplierId}`, payload);
  return unwrapResponse(response);
}

/**
 * Удаление поставщика
 */
export async function deleteSupplierRequest(supplierId) {
  const response = await productApi.delete(`${API_ENDPOINTS.suppliers}/${supplierId}`);
  return unwrapResponse(response);
}

/**
 * Получение аудита поставщиков
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
