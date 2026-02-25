import { productApi } from '../../../shared/api/http';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * Получение списка политик ценообразования категорий
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов на странице
 * @param {number | null} params.category_id - Фильтр по ID категории
 */
export async function getCategoryPricingPoliciesRequest({
  page = 1,
  limit = 20,
  category_id = null,
} = {}) {
  const offset = (page - 1) * limit;
  const requestParams = { limit, offset };
  if (category_id !== null) requestParams.category_id = category_id;

  const response = await productApi.get('/category-pricing-policy', { params: requestParams });
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
 * Получение политики ценообразования по ID
 * @param {number} pricingPolicyId - ID политики ценообразования
 */
export async function getCategoryPricingPolicyByIdRequest(pricingPolicyId) {
  const response = await productApi.get(`/category-pricing-policy/${pricingPolicyId}`);
  return unwrapResponse(response);
}

/**
 * Получение политики ценообразования по ID категории
 * @param {number} categoryId - ID категории
 */
export async function getCategoryPricingPolicyByCategoryIdRequest(categoryId) {
  const response = await productApi.get(`/category-pricing-policy/by-category/${categoryId}`);
  return unwrapResponse(response);
}

/**
 * Создание политики ценообразования
 * @param {Object} payload - Данные политики
 * @param {number} payload.category_id - ID категории (обяз.)
 * @param {number | null} payload.markup_fixed - Фиксированная наценка
 * @param {number | null} payload.markup_percent - Наценка в процентах (0-100)
 * @param {number | null} payload.commission_percent - Комиссия маркетплейса в процентах (0-100)
 * @param {number | null} payload.discount_percent - Скидка категории в процентах (0-100)
 * @param {number} payload.tax_rate - Ставка НДС (0-100)
 */
export async function createCategoryPricingPolicyRequest(payload) {
  const response = await productApi.post('/category-pricing-policy', payload);
  return unwrapResponse(response);
}

/**
 * Обновление политики ценообразования (PUT)
 * @param {number} pricingPolicyId - ID политики
 * @param {Object} payload - Данные для обновления
 * @param {number | null} payload.markup_fixed - Фиксированная наценка
 * @param {number | null} payload.markup_percent - Наценка в процентах (0-100)
 * @param {number | null} payload.commission_percent - Комиссия маркетплейса в процентах (0-100)
 * @param {number | null} payload.discount_percent - Скидка категории в процентах (0-100)
 * @param {number | null} payload.tax_rate - Ставка НДС (0-100)
 */
export async function updateCategoryPricingPolicyRequest(pricingPolicyId, payload) {
  const response = await productApi.put(`/category-pricing-policy/${pricingPolicyId}`, payload);
  return unwrapResponse(response);
}

/**
 * Удаление политики ценообразования
 * @param {number} pricingPolicyId - ID политики
 */
export async function deleteCategoryPricingPolicyRequest(pricingPolicyId) {
  const response = await productApi.delete(`/category-pricing-policy/${pricingPolicyId}`);
  return unwrapResponse(response);
}

/**
 * Получение списка категорий (для автокомплита)
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

  const response = await productApi.get('/category', { params: queryParams });
  const data = unwrapResponse(response);
  return Array.isArray(data?.items) ? data.items : [];
}
