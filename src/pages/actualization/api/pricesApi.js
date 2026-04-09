import { pricingApi, productApi } from '../../../shared/api/http';
import { API_ENDPOINTS } from '../../../shared/config/env';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * Получение списка всех прайсов
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов на странице
 * @param {string} params.category - Фильтр по категории
 * @param {string} params.supplier - Фильтр по поставщику
 * @param {string} params.region - Фильтр по региону
 * @param {string} params.actualization_task_id - Фильтр по задаче актуализации
 */
export async function getPricesRequest({
  page = 1,
  limit = 20,
  category,
  supplier,
  region,
  actualization_task_id,
} = {}) {
  const offset = (page - 1) * limit;
  const requestParams = { limit, offset };
  if (category) requestParams.category = category;
  if (supplier) requestParams.supplier = supplier;
  if (region) requestParams.region = region;
  if (actualization_task_id) requestParams.actualization_task_id = actualization_task_id;

  const response = await pricingApi.get('/price/', { params: requestParams });
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
 * Получение прайса по ID
 * @param {number} priceId - ID прайса
 */
export async function getPriceByIdRequest(priceId) {
  const response = await pricingApi.get(`/price/${priceId}`);
  return unwrapResponse(response);
}

/**
 * Создание прайса
 * @param {Object} payload - Данные прайса
 * @param {string} payload.category - Категория (1-100 символов)
 * @param {string} payload.supplier - Поставщик (1-200 символов)
 * @param {string} payload.region - Регион (1-100 символов)
 * @param {string} payload.price_text - Текст прайса (мин. 1 символ)
 */
export async function createPriceRequest(payload) {
  const response = await pricingApi.post('/price/', payload);
  return unwrapResponse(response);
}

/**
 * Обновление прайса
 * @param {number} priceId - ID прайса
 * @param {Object} payload - Данные для обновления
 * @param {string} [payload.category] - Категория
 * @param {string} [payload.supplier] - Поставщик
 * @param {string} [payload.region] - Регион
 * @param {string} [payload.price_text] - Текст прайса
 */
export async function updatePriceRequest(priceId, payload) {
  const response = await pricingApi.put(`/price/${priceId}`, payload);
  return unwrapResponse(response);
}

/**
 * Удаление прайса
 * @param {number} priceId - ID прайса
 */
export async function deletePriceRequest(priceId) {
  const response = await pricingApi.delete(`/price/${priceId}`);
  return unwrapResponse(response);
}

/**
 * Получение списка категорий для автокомплита
 * @param {Object} params - Параметры запроса
 * @param {number} params.limit - Количество элементов
 * @param {number} params.offset - Смещение
 * @param {string} params.name - Фильтр по названию
 */
export async function getCategoriesForAutocompleteRequest({
  limit = 10,
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
 * Получение списка поставщиков для автокомплита
 * @param {Object} params - Параметры запроса
 * @param {number} params.limit - Количество элементов
 * @param {number} params.offset - Смещение
 * @param {string} params.name - Фильтр по названию
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
