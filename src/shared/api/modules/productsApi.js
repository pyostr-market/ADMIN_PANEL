import { productApi } from '../../api/http';
import { API_ENDPOINTS } from '../../config/env';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * Получение списка товаров
 */
export async function getProductsRequest({
  page = 1,
  limit = 20,
  name,
  category_id,
  attributes,
} = {}) {
  const offset = (page - 1) * limit;
  const queryParams = { limit, offset };
  if (name) queryParams.name = name;
  if (category_id !== undefined && category_id !== null) queryParams.category_id = category_id;
  if (attributes !== undefined && attributes !== null) {
    queryParams.attributes = JSON.stringify(attributes);
  }

  const response = await productApi.get(API_ENDPOINTS.products, { params: queryParams });
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
 * Получение данных товара по ID
 */
export async function getProductByIdRequest(productId) {
  const response = await productApi.get(`${API_ENDPOINTS.products}/${productId}`);
  return unwrapResponse(response);
}

/**
 * Получение связанных вариантов товаров (для автокомплита)
 */
export async function getProductVariantsRequest({ product_id, name } = {}) {
  const queryParams = {};
  if (product_id !== undefined && product_id !== null) queryParams.product_id = product_id;
  if (name) queryParams.name = name;

  const response = await productApi.get(`${API_ENDPOINTS.products}/related/variants`, { params: queryParams });
  const data = unwrapResponse(response);
  return Array.isArray(data?.items) ? data.items : [];
}

/**
 * Создание товара
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
 * Обновление товара (PUT)
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
  product_id,
  user_id,
  action,
  limit = 20,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (product_id !== undefined && product_id !== null) params.product_id = product_id;
  if (user_id !== undefined && user_id !== null) params.user_id = user_id;
  if (action) params.action = action;

  const response = await productApi.get(`${API_ENDPOINTS.products}/admin/audit`, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}

/**
 * Получение списка категорий (для автокомплита)
 */
export async function getCategoriesForAutocompleteRequest({
  limit = 100,
  offset = 0,
  name,
} = {}) {
  const queryParams = { limit, offset };
  if (name) queryParams.name = name;

  const response = await productApi.get(API_ENDPOINTS.categories, { params: queryParams });
  const data = unwrapResponse(response);
  return Array.isArray(data?.items) ? data.items : [];
}

/**
 * Получение списка производителей (для автокомплита)
 */
export async function getManufacturersForAutocompleteRequest({
  limit = 100,
  offset = 0,
  name,
} = {}) {
  const queryParams = { limit, offset };
  if (name) queryParams.name = name;

  const response = await productApi.get(API_ENDPOINTS.manufacturers, { params: queryParams });
  const data = unwrapResponse(response);
  return Array.isArray(data?.items) ? data.items : [];
}

/**
 * Получение списка поставщиков (для автокомплита)
 */
export async function getSuppliersForAutocompleteRequest({
  limit = 100,
  offset = 0,
  name,
} = {}) {
  const queryParams = { limit, offset };
  if (name) queryParams.name = name;

  const response = await productApi.get(API_ENDPOINTS.suppliers, { params: queryParams });
  const data = unwrapResponse(response);
  return Array.isArray(data?.items) ? data.items : [];
}
