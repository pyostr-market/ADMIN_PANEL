import { productApi } from '../../../shared/api/http';
import { API_ENDPOINTS } from '../../../shared/config/env';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * Получение списка регионов
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов на странице
 * @param {string} params.name - Фильтр по названию
 * @param {number | null} params.parent_id - Фильтр по родительскому региону
 */
export async function getRegionsRequest({
  page = 1,
  limit = 20,
  name,
  parent_id,
} = {}) {
  const offset = (page - 1) * limit;
  const requestParams = { limit, offset };
  if (name) requestParams.name = name;
  if (parent_id !== undefined && parent_id !== null) requestParams.parent_id = parent_id;

  const response = await productApi.get(API_ENDPOINTS.regions, { params: requestParams });
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
 * Получение региона по ID
 * @param {number} regionId - ID региона
 */
export async function getRegionByIdRequest(regionId) {
  const response = await productApi.get(`${API_ENDPOINTS.regions}/${regionId}`);
  return unwrapResponse(response);
}

/**
 * Создание региона
 * @param {Object} payload - Данные региона
 * @param {string} payload.name - Название (обяз.)
 * @param {number | null} payload.parent_id - ID родительского региона
 */
export async function createRegionRequest(payload) {
  const body = {
    name: payload.name,
  };

  if (payload.parent_id !== null && payload.parent_id !== undefined) {
    body.parent_id = payload.parent_id;
  }

  const response = await productApi.post(API_ENDPOINTS.regions, body);
  return unwrapResponse(response);
}

/**
 * Обновление региона (PUT)
 * @param {number} regionId - ID региона
 * @param {Object} payload - Данные для обновления
 * @param {string | null} payload.name - Название
 * @param {number | null} payload.parent_id - ID родительского региона
 */
export async function updateRegionRequest(regionId, payload) {
  const body = {};

  if (payload.name !== null && payload.name !== undefined) {
    body.name = payload.name;
  }

  if (payload.parent_id !== null && payload.parent_id !== undefined) {
    body.parent_id = payload.parent_id;
  }

  const response = await productApi.put(`${API_ENDPOINTS.regions}/${regionId}`, body);
  return unwrapResponse(response);
}

/**
 * Удаление региона
 * @param {number} regionId - ID региона
 */
export async function deleteRegionRequest(regionId) {
  const response = await productApi.delete(`${API_ENDPOINTS.regions}/${regionId}`);
  return unwrapResponse(response);
}

/**
 * Получение дочерних регионов
 * @param {number} parentId - ID родительского региона
 */
export async function getRegionChildrenRequest(parentId) {
  const response = await productApi.get(`${API_ENDPOINTS.regions}/${parentId}/children`);
  const data = unwrapResponse(response);
  return Array.isArray(data) ? data : [];
}

/**
 * Получение аудита регионов
 * @param {Object} params - Параметры запроса
 * @param {number | null} params.region_id - Фильтр по ID региона
 * @param {number | null} params.user_id - Фильтр по ID пользователя
 * @param {string | null} params.action - Фильтр по действию
 * @param {number} params.limit - Количество элементов
 * @param {number} params.offset - Смещение
 */
export async function getRegionAuditRequest({
  region_id,
  user_id,
  action,
  limit = 20,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (region_id !== undefined && region_id !== null) params.region_id = region_id;
  if (user_id !== undefined && user_id !== null) params.user_id = user_id;
  if (action) params.action = action;

  const response = await productApi.get(`${API_ENDPOINTS.regions}/admin/audit`, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}

/**
 * Получение списка регионов для автокомплита
 * @param {Object} params - Параметры запроса
 * @param {number} params.limit - Количество элементов
 * @param {number} params.offset - Смещение
 * @param {string} params.name - Фильтр по названию
 */
export async function getRegionsForAutocompleteRequest({
  limit = 100,
  offset = 0,
  name,
} = {}) {
  const queryParams = { limit, offset };
  if (name) queryParams.name = name;

  const response = await productApi.get(API_ENDPOINTS.regions, { params: queryParams });
  const data = unwrapResponse(response);
  return Array.isArray(data?.items) ? data.items : [];
}
