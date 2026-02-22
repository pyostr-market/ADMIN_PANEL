import { productApi } from '../../../shared/api/http';
import { API_ENDPOINTS } from '../../../shared/config/env';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * Получение списка товаров
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов на странице
 * @param {string} params.name - Фильтр по названию
 * @param {number | null} params.category_id - Фильтр по категории
 * @param {number | null} params.product_type_id - Фильтр по типу продукта
 */
export async function getProductsRequest({
  page = 1,
  limit = 20,
  name,
  category_id,
  product_type_id,
} = {}) {
  const offset = (page - 1) * limit;
  const queryParams = { limit, offset };
  if (name) queryParams.name = name;
  if (category_id !== undefined && category_id !== null) queryParams.category_id = category_id;
  if (product_type_id !== undefined && product_type_id !== null) queryParams.product_type_id = product_type_id;

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
 * @param {number} productId - ID товара
 */
export async function getProductByIdRequest(productId) {
  const response = await productApi.get(`${API_ENDPOINTS.products}/${productId}`);
  return unwrapResponse(response);
}

/**
 * Создание товара
 * @param {FormData} formData - FormData с данными товара
 * @param {string} formData.name - Название (обяз.)
 * @param {number} formData.price - Цена (обяз.)
 * @param {string | null} formData.description - Описание
 * @param {number | null} formData.category_id - ID категории
 * @param {number | null} formData.supplier_id - ID поставщика
 * @param {number | null} formData.product_type_id - ID типа продукта
 * @param {File[] | null} formData.images - Массив изображений
 * @param {string[] | null} formData.image_is_main - Массив is_main флагов
 * @param {string | null} formData.attributes_json - JSON атрибутов
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
 * @param {number} productId - ID товара
 * @param {FormData} formData - FormData с данными товара
 * @param {string} formData.name - Название
 * @param {number} formData.price - Цена
 * @param {string | null} formData.description - Описание
 * @param {number | null} formData.category_id - ID категории
 * @param {number | null} formData.supplier_id - ID поставщика
 * @param {number | null} formData.product_type_id - ID типа продукта
 * @param {string | null} formData.attributes_json - JSON атрибутов
 * @param {string | null} formData.images_json - JSON операций с изображениями
 * @param {File[] | null} formData.images - Массив изображений для to_create
 * @param {string[] | null} formData.image_is_main - Массив is_main флагов для новых изображений
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
 * @param {number} productId - ID товара
 */
export async function deleteProductRequest(productId) {
  const response = await productApi.delete(`${API_ENDPOINTS.products}/${productId}`);
  return unwrapResponse(response);
}

/**
 * Получение аудита товаров
 * @param {Object} params - Параметры запроса
 * @param {number | null} params.product_id - Фильтр по ID товара
 * @param {number | null} params.user_id - Фильтр по ID пользователя
 * @param {string | null} params.action - Фильтр по действию
 * @param {number} params.limit - Количество элементов
 * @param {number} params.offset - Смещение
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
 * Получение связанных вариантов товаров (для автокомплита)
 * @param {Object} params - Параметры запроса
 * @param {number | null} params.product_id - ID товара для исключения
 * @param {string | null} params.name - Поиск по названию
 */
export async function getProductVariantsRequest({
  product_id,
  name,
} = {}) {
  const queryParams = {};
  if (product_id !== undefined && product_id !== null) queryParams.product_id = product_id;
  if (name) queryParams.name = name;

  const response = await productApi.get(`${API_ENDPOINTS.products}/related/variants`, { params: queryParams });
  const data = unwrapResponse(response);
  return Array.isArray(data?.items) ? data.items : [];
}

/**
 * Получение списка категорий (для автокомплита)
 * @param {Object} params - Параметры запроса
 * @param {number} params.limit - Количество элементов
 * @param {number} params.offset - Смещение
 * @param {string} params.name - Фильтр по названию
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
 * @param {Object} params - Параметры запроса
 * @param {number} params.limit - Количество элементов
 * @param {number} params.offset - Смещение
 * @param {string} params.name - Фильтр по названию
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

/**
 * Получение списка типов продуктов (для автокомплита)
 * @param {Object} params - Параметры запроса
 * @param {number} params.limit - Количество элементов
 * @param {number} params.offset - Смещение
 * @param {string} params.name - Фильтр по названию
 */
export async function getProductTypesForAutocompleteRequest({
  limit = 100,
  offset = 0,
  name,
} = {}) {
  const queryParams = { limit, offset };
  if (name) queryParams.name = name;

  const response = await productApi.get(API_ENDPOINTS.productTypes, { params: queryParams });
  const data = unwrapResponse(response);
  return Array.isArray(data?.items) ? data.items : [];
}
