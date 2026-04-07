import { productApi } from '../../../shared/api/http';
import { API_ENDPOINTS } from '../../../shared/config/env';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * Создание тега
 * @param {Object} data - Данные для создания тега
 * @param {string} data.name - Название тега
 * @param {string|null} [data.description] - Описание тега
 */
export async function createTagRequest({ name, description }) {
  const body = { name };
  if (description !== undefined && description !== null) {
    body.description = description;
  }
  const response = await productApi.post(API_ENDPOINTS.productTags, body);
  return unwrapResponse(response);
}

/**
 * Получение всех доступных тегов
 * @param {Object} params - Параметры запроса
 * @param {number} params.limit - Количество элементов
 * @param {number} params.offset - Смещение
 */
export async function getAllTagsRequest({
  limit = 1000,
  offset = 0,
} = {}) {
  const queryParams = { limit, offset };
  const response = await productApi.get(API_ENDPOINTS.productTags, { params: queryParams });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}

/**
 * Получение всех тегов товара
 * @param {number} productId - ID товара
 * @param {Object} params - Параметры запроса
 * @param {number} params.limit - Количество элементов
 * @param {number} params.offset - Смещение
 */
export async function getProductTagsRequest(productId, {
  limit = 100,
  offset = 0,
} = {}) {
  const queryParams = { limit, offset };
  const response = await productApi.get(`${API_ENDPOINTS.productTagsRelations}/${productId}`, { params: queryParams });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}

/**
 * Добавление тега к товару
 * @param {Object} data - Данные для создания связи
 * @param {number} data.product_id - ID товара
 * @param {number} data.tag_id - ID тега
 */
export async function addTagToProductRequest({ product_id, tag_id }) {
  const response = await productApi.post(API_ENDPOINTS.productTagsRelations, {
    product_id,
    tag_id,
  });
  return unwrapResponse(response);
}

/**
 * Удаление тега у товара
 * @param {number} productId - ID товара
 * @param {number} tagId - ID тега
 */
export async function removeTagFromProductRequest(productId, tagId) {
  const response = await productApi.delete(`${API_ENDPOINTS.productTagsRelations}/${productId}/${tagId}`);
  return unwrapResponse(response);
}
