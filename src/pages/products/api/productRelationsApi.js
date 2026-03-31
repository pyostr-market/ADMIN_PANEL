import { productApi } from '../../../shared/api/http';
import { API_ENDPOINTS } from '../../../shared/config/env';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * Создание связи между товарами
 * @param {Object} params - Параметры связи
 * @param {number} params.product_id - ID основного товара
 * @param {number} params.related_product_id - ID связанного товара
 * @param {string} params.relation_type - Тип связи (accessory, similar, bundle, upsell)
 * @param {number} params.sort_order - Порядок отображения
 */
export async function createProductRelationRequest({
  product_id,
  related_product_id,
  relation_type,
  sort_order = 0,
}) {
  const response = await productApi.post(`${API_ENDPOINTS.products}/product-relations`, {
    product_id,
    related_product_id,
    relation_type,
    sort_order,
  });
  return unwrapResponse(response);
}

/**
 * Обновление связи между товарами
 * @param {number} relationId - ID связи
 * @param {Object} params - Параметры для обновления
 * @param {string} [params.relation_type] - Новый тип связи
 * @param {number} [params.sort_order] - Новый порядок отображения
 */
export async function updateProductRelationRequest(relationId, {
  relation_type,
  sort_order,
}) {
  const data = {};
  if (relation_type !== undefined) data.relation_type = relation_type;
  if (sort_order !== undefined) data.sort_order = sort_order;

  const response = await productApi.put(`${API_ENDPOINTS.products}/product-relations/${relationId}`, data);
  return unwrapResponse(response);
}

/**
 * Удаление связи между товарами
 * @param {number} relationId - ID связи
 */
export async function deleteProductRelationRequest(relationId) {
  const response = await productApi.delete(`${API_ENDPOINTS.products}/product-relations/${relationId}`);
  return unwrapResponse(response);
}

/**
 * Получение списка связей товара
 * @param {number} productId - ID товара
 * @param {Object} params - Параметры запроса
 * @param {string} [params.relation_type] - Фильтр по типу связи
 * @param {number} [params.page] - Номер страницы
 * @param {number} [params.limit] - Количество элементов
 */
export async function getProductRelationsRequest(productId, {
  relation_type,
  page = 1,
  limit = 100,
} = {}) {
  const offset = (page - 1) * limit;
  const queryParams = { limit, offset };
  if (relation_type) queryParams.relation_type = relation_type;

  const response = await productApi.get(`${API_ENDPOINTS.products}/products/${productId}/relations`, {
    params: queryParams,
  });
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
 * Получение рекомендаций для товара
 * @param {number} productId - ID товара
 * @param {Object} params - Параметры запроса
 * @param {string} [params.relation_type] - Фильтр по типу рекомендации
 * @param {number} [params.page] - Номер страницы
 * @param {number} [params.limit] - Количество элементов
 */
export async function getProductRecommendationsRequest(productId, {
  relation_type,
  page = 1,
  limit = 100,
} = {}) {
  const offset = (page - 1) * limit;
  const queryParams = { limit, offset };
  if (relation_type) queryParams.relation_type = relation_type;

  const response = await productApi.get(`${API_ENDPOINTS.products}/products/${productId}/recommendations`, {
    params: queryParams,
  });
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
