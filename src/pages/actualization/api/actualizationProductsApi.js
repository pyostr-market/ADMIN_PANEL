import { pricingApi } from '../../../shared/api/http';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

// ==================== ACTUALIZATION PRODUCTS ====================

/**
 * Получение списка товаров конкретной задачи актуализации
 * @param {Object} params - Параметры запроса
 * @param {number} [params.page=1] - Номер страницы
 * @param {number} [params.limit=20] - Количество записей на странице
 * @param {string} [params.actualization_task_id] - UUID задачи актуализации
 * @param {number} [params.category_id] - Фильтр по ID категории
 * @param {number} [params.supplier_id] - Фильтр по ID поставщика
 */
export async function getActualizationProductsRequest({
  page = 1,
  limit = 20,
  actualization_task_id,
  category_id,
  supplier_id,
} = {}) {
  const offset = (page - 1) * limit;
  const queryParams = { limit, offset };
  if (actualization_task_id) queryParams.actualization_task_id = actualization_task_id;
  if (category_id !== undefined && category_id !== null) queryParams.category_id = category_id;
  if (supplier_id !== undefined && supplier_id !== null) queryParams.supplier_id = supplier_id;

  const response = await pricingApi.get('/admin/catalog/products', { params: queryParams });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;
  const pagination = {
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
  };

  return { items, total, pagination };
}

/**
 * Получение товара по ID
 * @param {string} productId - UUID товара
 */
export async function getActualizationProductByIdRequest(productId) {
  const response = await pricingApi.get(`/admin/catalog/products/${productId}`);
  return unwrapResponse(response);
}

/**
 * Удаление товара
 * @param {string} productId - UUID товара
 */
export async function deleteActualizationProductRequest(productId) {
  const response = await pricingApi.delete(`/admin/catalog/products/${productId}`);
  return unwrapResponse(response);
}
