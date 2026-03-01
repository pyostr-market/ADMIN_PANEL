import { authorizedApi } from '../../../shared/api/http';
import { API_ENDPOINTS } from '../../../shared/config/env';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * Получение данных профиля текущего пользователя
 */
export async function getProfileRequest() {
  const response = await authorizedApi.get(API_ENDPOINTS.profile);
  return unwrapResponse(response);
}

/**
 * Обновление профиля текущего пользователя (PATCH)
 * @param {Object} payload - Данные для обновления
 * @param {string|null} payload.fio - ФИО пользователя
 */
export async function updateProfileRequest(payload) {
  const response = await authorizedApi.patch(API_ENDPOINTS.profile, payload);
  return unwrapResponse(response);
}
