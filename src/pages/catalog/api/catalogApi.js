import { productApi } from '../../../shared/api/http';
import { API_ENDPOINTS } from '../../../shared/config/env';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

// ==================== Manufacturers ====================

/**
 * Получение списка производителей
 */
export async function getManufacturersRequest({
  name = null,
  limit = 10,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (name) params.name = name;

  const response = await productApi.get(API_ENDPOINTS.manufacturers, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const pagination = {
    total: data?.total ?? items.length,
    limit,
    offset,
  };

  return { items, pagination };
}

/**
 * Получение производителя по ID
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
  manufacturer_id = null,
  user_id = null,
  action = null,
  limit = 20,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (manufacturer_id !== null) params.manufacturer_id = manufacturer_id;
  if (user_id !== null) params.user_id = user_id;
  if (action !== null) params.action = action;

  const response = await productApi.get(`${API_ENDPOINTS.manufacturers}/admin/audit`, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const pagination = {
    total: data?.total ?? items.length,
    limit,
    offset,
  };

  return { items, pagination };
}

// ==================== Suppliers ====================

/**
 * Получение списка поставщиков
 */
export async function getSuppliersRequest({
  name = null,
  limit = 10,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (name) params.name = name;

  const response = await productApi.get(API_ENDPOINTS.suppliers, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const pagination = {
    total: data?.total ?? items.length,
    limit,
    offset,
  };

  return { items, pagination };
}

/**
 * Получение поставщика по ID
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
  supplier_id = null,
  user_id = null,
  action = null,
  limit = 20,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (supplier_id !== null) params.supplier_id = supplier_id;
  if (user_id !== null) params.user_id = user_id;
  if (action !== null) params.action = action;

  const response = await productApi.get(`${API_ENDPOINTS.suppliers}/admin/audit`, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const pagination = {
    total: data?.total ?? items.length,
    limit,
    offset,
  };

  return { items, pagination };
}

// ==================== Categories ====================

/**
 * Получение списка категорий
 */
export async function getCategoriesRequest({
  name = null,
  limit = 10,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (name) params.name = name;

  const response = await productApi.get(API_ENDPOINTS.categories, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const pagination = {
    total: data?.total ?? items.length,
    limit,
    offset,
  };

  return { items, pagination };
}

/**
 * Получение категории по ID
 */
export async function getCategoryByIdRequest(categoryId) {
  const response = await productApi.get(`${API_ENDPOINTS.categories}/${categoryId}`);
  return unwrapResponse(response);
}

/**
 * Создание категории (multipart/form-data)
 */
export async function createCategoryRequest(formData) {
  const response = await productApi.post(API_ENDPOINTS.categories, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return unwrapResponse(response);
}

/**
 * Обновление категории (PUT, multipart/form-data)
 */
export async function updateCategoryRequest(categoryId, formData) {
  const response = await productApi.put(`${API_ENDPOINTS.categories}/${categoryId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return unwrapResponse(response);
}

/**
 * Удаление категории
 */
export async function deleteCategoryRequest(categoryId) {
  const response = await productApi.delete(`${API_ENDPOINTS.categories}/${categoryId}`);
  return unwrapResponse(response);
}

/**
 * Получение аудита категорий
 */
export async function getCategoryAuditRequest({
  category_id = null,
  user_id = null,
  action = null,
  limit = 20,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (category_id !== null) params.category_id = category_id;
  if (user_id !== null) params.user_id = user_id;
  if (action !== null) params.action = action;

  const response = await productApi.get(`${API_ENDPOINTS.categories}/admin/audit`, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const pagination = {
    total: data?.total ?? items.length,
    limit,
    offset,
  };

  return { items, pagination };
}

// ==================== Products ====================

/**
 * Получение списка товаров
 */
export async function getProductsRequest({
  name = null,
  category_id = null,
  product_type_id = null,
  limit = 10,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (name) params.name = name;
  if (category_id !== null) params.category_id = category_id;
  if (product_type_id !== null) params.product_type_id = product_type_id;

  const response = await productApi.get(API_ENDPOINTS.products, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const pagination = {
    total: data?.total ?? items.length,
    limit,
    offset,
  };

  return { items, pagination };
}

/**
 * Получение товара по ID
 */
export async function getProductByIdRequest(productId) {
  const response = await productApi.get(`${API_ENDPOINTS.products}/${productId}`);
  return unwrapResponse(response);
}

/**
 * Получение связанных вариантов товаров
 */
export async function getRelatedProductVariantsRequest({
  product_id = null,
  name = null,
} = {}) {
  const params = {};
  if (product_id !== null) params.product_id = product_id;
  if (name) params.name = name;

  const response = await productApi.get(`${API_ENDPOINTS.products}/related/variants`, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const pagination = {
    total: data?.total ?? items.length,
    limit: items.length,
    offset: 0,
  };

  return { items, pagination };
}

/**
 * Создание товара (multipart/form-data)
 */
export async function createProductRequest(formData) {
  const response = await productApi.post(API_ENDPOINTS.products, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return unwrapResponse(response);
}

/**
 * Обновление товара (PUT, multipart/form-data)
 */
export async function updateProductRequest(productId, formData) {
  const response = await productApi.put(`${API_ENDPOINTS.products}/${productId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return unwrapResponse(response);
}

/**
 * Удаление товара
 */
export async function deleteProductRequest(productId) {
  const response = await productApi.delete(`${API_ENDPOINTS.products}/${productId}`);
  return unwrapResponse(response);
}

/**
 * Получение аудита товаров
 */
export async function getProductAuditRequest({
  product_id = null,
  user_id = null,
  action = null,
  limit = 20,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (product_id !== null) params.product_id = product_id;
  if (user_id !== null) params.user_id = user_id;
  if (action !== null) params.action = action;

  const response = await productApi.get(`${API_ENDPOINTS.products}/admin/audit`, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const pagination = {
    total: data?.total ?? items.length,
    limit,
    offset,
  };

  return { items, pagination };
}
