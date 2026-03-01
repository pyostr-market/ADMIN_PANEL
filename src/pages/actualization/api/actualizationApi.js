import { pricingApi } from '../../../shared/api/http';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

// ==================== COLOR ====================

/**
 * Получение списка всех цветов
 */
export async function getColorsRequest() {
  const response = await pricingApi.get('/color/');
  const data = unwrapResponse(response);
  return Array.isArray(data) ? data : [];
}

/**
 * Получение цвета по имени
 * @param {string} name - имя цвета
 */
export async function getColorByNameRequest(name) {
  const response = await pricingApi.get(`/color/${encodeURIComponent(name)}`);
  return unwrapResponse(response);
}

/**
 * Создание цвета
 * @param {Object} payload - Данные цвета
 * @param {string} payload.name - Название цвета (1-50 символов)
 */
export async function createColorRequest(payload) {
  const response = await pricingApi.post('/color/', payload);
  return unwrapResponse(response);
}

/**
 * Обновление цвета
 * @param {string} name - текущее имя цвета
 * @param {Object} payload - Данные для обновления
 * @param {string} payload.name - новое имя цвета
 */
export async function updateColorRequest(name, payload) {
  const response = await pricingApi.put(`/color/${encodeURIComponent(name)}`, payload);
  return unwrapResponse(response);
}

/**
 * Удаление цвета
 * @param {string} name - имя цвета
 */
export async function deleteColorRequest(name) {
  const response = await pricingApi.delete(`/color/${encodeURIComponent(name)}`);
  return unwrapResponse(response);
}

// ==================== COLOR_ASSIGN ====================

/**
 * Получение списка всех назначений цветов
 * @param {Object} params - Параметры запроса
 * @param {string} params.color - фильтр по имени цвета (optional)
 */
export async function getColorAssignsRequest({ color } = {}) {
  const params = {};
  if (color) params.color = color;

  const response = await pricingApi.get('/color-assign/', { params });
  const data = unwrapResponse(response);
  return Array.isArray(data) ? data : [];
}

/**
 * Получение назначения по ID
 * @param {number} assignId - ID назначения
 */
export async function getColorAssignByIdRequest(assignId) {
  const response = await pricingApi.get(`/color-assign/${assignId}`);
  return unwrapResponse(response);
}

/**
 * Создание назначения цвета
 * @param {Object} payload - Данные назначения
 * @param {string} payload.key - ключ назначения (1-50 символов)
 * @param {string} payload.color - имя цвета (1-50 символов, должно существовать)
 */
export async function createColorAssignRequest(payload) {
  const response = await pricingApi.post('/color-assign/', payload);
  return unwrapResponse(response);
}

/**
 * Обновление назначения
 * @param {number} assignId - ID назначения
 * @param {Object} payload - Данные для обновления
 * @param {string} [payload.key] - новый ключ (optional)
 * @param {string} [payload.color] - новое имя цвета (optional)
 */
export async function updateColorAssignRequest(assignId, payload) {
  const response = await pricingApi.put(`/color-assign/${assignId}`, payload);
  return unwrapResponse(response);
}

/**
 * Удаление назначения
 * @param {number} assignId - ID назначения
 */
export async function deleteColorAssignRequest(assignId) {
  const response = await pricingApi.delete(`/color-assign/${assignId}`);
  return unwrapResponse(response);
}
