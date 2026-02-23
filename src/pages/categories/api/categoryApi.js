import { productApi } from '../../../shared/api/http';
import { API_ENDPOINTS } from '../../../shared/config/env';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * Получение списка категорий
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов на странице
 * @param {string} params.name - Фильтр по названию
 */
export async function getCategoriesRequest({
  page = 1,
  limit = 20,
  name,
} = {}) {
  const offset = (page - 1) * limit;
  const requestParams = { limit, offset };
  if (name) requestParams.name = name;

  const response = await productApi.get(API_ENDPOINTS.categories, { params: requestParams });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  // Нормализуем данные: если есть вложенные parent/manufacturer, извлекаем ID
  const normalizedItems = items.map(item => {
    const normalized = { ...item };
    if (item?.parent && typeof item.parent === 'object') {
      normalized.parent_id = item.parent.id;
    }
    if (item?.manufacturer && typeof item.manufacturer === 'object') {
      normalized.manufacturer_id = item.manufacturer.id;
    }
    return normalized;
  });
  const total = data?.total ?? normalizedItems.length;
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return { items: normalizedItems, pagination };
}

/**
 * Получение данных категории по ID
 * @param {number} categoryId - ID категории
 */
export async function getCategoryByIdRequest(categoryId) {
  const response = await productApi.get(`${API_ENDPOINTS.categories}/${categoryId}`);
  const data = unwrapResponse(response);
  // Нормализуем данные: если есть вложенные parent/manufacturer, извлекаем ID
  if (data?.parent && typeof data.parent === 'object') {
    data.parent_id = data.parent.id;
  }
  if (data?.manufacturer && typeof data.manufacturer === 'object') {
    data.manufacturer_id = data.manufacturer.id;
  }
  return data;
}

/**
 * Создание категории
 * @param {Object} payload - Данные категории
 * @param {string} payload.name - Название (обяз.)
 * @param {string | null} payload.description - Описание
 * @param {number | null} payload.parent_id - ID родительской категории
 * @param {number | null} payload.manufacturer_id - ID производителя
 * @param {string} payload.images_json - JSON-массив операций с изображениями
 */
export async function createCategoryRequest(payload) {
  const formData = new FormData();
  formData.append('name', payload.name);

  if (payload.description !== null && payload.description !== undefined) {
    formData.append('description', payload.description);
  }

  if (payload.parent_id !== null && payload.parent_id !== undefined) {
    formData.append('parent_id', payload.parent_id);
  }

  if (payload.manufacturer_id !== null && payload.manufacturer_id !== undefined) {
    formData.append('manufacturer_id', payload.manufacturer_id);
  }

  // Отправляем images_json
  if (payload.images_json) {
    formData.append('images_json', payload.images_json);
  }

  const response = await productApi.post(API_ENDPOINTS.categories, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return unwrapResponse(response);
}

/**
 * Обновление категории (PUT)
 * @param {number} categoryId - ID категории
 * @param {Object} payload - Данные для обновления
 * @param {string | null} payload.name - Название
 * @param {string | null} payload.description - Описание
 * @param {number | null} payload.parent_id - ID родительской категории
 * @param {number | null} payload.manufacturer_id - ID производителя
 * @param {string} payload.images_json - JSON-массив операций с изображениями
 */
export async function updateCategoryRequest(categoryId, payload) {
  const formData = new FormData();

  if (payload.name !== null && payload.name !== undefined) {
    formData.append('name', payload.name);
  }

  if (payload.description !== null && payload.description !== undefined) {
    formData.append('description', payload.description);
  }

  if (payload.parent_id !== null && payload.parent_id !== undefined) {
    formData.append('parent_id', payload.parent_id);
  }

  if (payload.manufacturer_id !== null && payload.manufacturer_id !== undefined) {
    formData.append('manufacturer_id', payload.manufacturer_id);
  }

  // Отправляем images_json
  if (payload.images_json) {
    formData.append('images_json', payload.images_json);
  }

  const response = await productApi.put(`${API_ENDPOINTS.categories}/${categoryId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return unwrapResponse(response);
}

/**
 * Удаление категории
 * @param {number} categoryId - ID категории
 */
export async function deleteCategoryRequest(categoryId) {
  const response = await productApi.delete(`${API_ENDPOINTS.categories}/${categoryId}`);
  return unwrapResponse(response);
}

/**
 * Получение аудита категорий
 * @param {Object} params - Параметры запроса
 * @param {number | null} params.category_id - Фильтр по ID категории
 * @param {number | null} params.user_id - Фильтр по ID пользователя
 * @param {string | null} params.action - Фильтр по действию
 * @param {number} params.limit - Количество элементов
 * @param {number} params.offset - Смещение
 */
export async function getCategoryAuditRequest({
  category_id,
  user_id,
  action,
  limit = 20,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (category_id !== undefined && category_id !== null) params.category_id = category_id;
  if (user_id !== undefined && user_id !== null) params.user_id = user_id;
  if (action) params.action = action;

  const response = await productApi.get(`${API_ENDPOINTS.categories}/admin/audit`, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}
