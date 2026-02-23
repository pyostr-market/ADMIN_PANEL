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
 * @param {Object} payload - Данные категории (FormData)
 * @param {string} payload.name - Название (обяз.)
 * @param {string | null} payload.description - Описание
 * @param {number | null} payload.parent_id - ID родительской категории
 * @param {number | null} payload.manufacturer_id - ID производителя
 * @param {File[]} payload.images - Файлы изображений (обяз.)
 * @param {number[]} payload.orderings - Порядок сортировки для изображений (обяз.)
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
  
  // Добавляем изображения и orderings
  if (payload.images && payload.images.length > 0) {
    payload.images.forEach((image, index) => {
      formData.append('images', image);
    });
    
    if (payload.orderings && payload.orderings.length > 0) {
      payload.orderings.forEach((ordering) => {
        formData.append('orderings', ordering);
      });
    } else {
      // Если orderings не указаны, добавляем по порядку
      payload.images.forEach((_, index) => {
        formData.append('orderings', index);
      });
    }
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
 * @param {Object} payload - Данные для обновления (FormData)
 * @param {string | null} payload.name - Название
 * @param {string | null} payload.description - Описание
 * @param {number | null} payload.parent_id - ID родительской категории
 * @param {number | null} payload.manufacturer_id - ID производителя
 * @param {File[] | null} payload.images - Новые файлы изображений
 * @param {number[] | null} payload.orderings - Порядок сортировки для новых изображений
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
  
  // Добавляем изображения и orderings только если они переданы
  if (payload.images && payload.images.length > 0) {
    payload.images.forEach((image) => {
      formData.append('images', image);
    });
    
    if (payload.orderings && payload.orderings.length > 0) {
      payload.orderings.forEach((ordering) => {
        formData.append('orderings', ordering);
      });
    } else {
      // Если orderings не указаны, добавляем по порядку
      payload.images.forEach((_, index) => {
        formData.append('orderings', index);
      });
    }
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
