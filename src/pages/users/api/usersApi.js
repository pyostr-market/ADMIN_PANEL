import { authorizedApi } from '../../../shared/api/http';
import { API_ENDPOINTS } from '../../../shared/config/env';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * Получение списка пользователей
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов на странице
 * @param {string} params.search - Поисковый запрос
 * @param {number} params.id - Фильтр по ID
 * @param {string} params.public_id - Фильтр по public_id
 * @param {boolean} params.is_active - Фильтр по активности
 * @param {boolean} params.is_verified - Фильтр по верификации
 * @param {string} params.group - Фильтр по группе
 * @param {string} params.phone_number - Фильтр по телефону
 */
export async function getUsersRequest({
  page = 1,
  limit = 20,
  search,
  id,
  public_id,
  is_active,
  is_verified,
  group,
  phone_number,
} = {}) {
  const params = { page, limit };
  if (search) params.search = search;
  if (id !== undefined) params.id = id;
  if (public_id) params.public_id = public_id;
  if (is_active !== undefined) params.is_active = is_active;
  if (is_verified !== undefined) params.is_verified = is_verified;
  if (group) params.group = group;
  if (phone_number) params.phone_number = phone_number;

  const response = await authorizedApi.get(API_ENDPOINTS.users, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const pagination = data?.pagination ?? {
    page,
    limit,
    total: items.length,
    pages: 1,
  };

  return { items, pagination };
}

/**
 * Получение данных пользователя по ID
 * @param {number} userId - ID пользователя
 */
export async function getUserByIdRequest(userId) {
  const response = await authorizedApi.get(`${API_ENDPOINTS.users}/${userId}`);
  return unwrapResponse(response);
}

/**
 * Обновление пользователя (PATCH)
 * @param {number} userId - ID пользователя
 * @param {Object} payload - Данные для обновления
 */
export async function updateUserRequest(userId, payload) {
  const response = await authorizedApi.patch(`${API_ENDPOINTS.users}/${userId}`, payload);
  return unwrapResponse(response);
}

/**
 * Полное обновление пользователя (PUT)
 * @param {number} userId - ID пользователя
 * @param {Object} payload - Данные для обновления
 */
export async function fullUpdateUserRequest(userId, payload) {
  const response = await authorizedApi.put(`${API_ENDPOINTS.users}/${userId}`, payload);
  return unwrapResponse(response);
}

/**
 * Бан пользователя
 * @param {number} userId - ID пользователя
 */
export async function banUserRequest(userId) {
  const response = await authorizedApi.post(`${API_ENDPOINTS.users}/${userId}/ban`);
  return unwrapResponse(response);
}

/**
 * Удаление пользователя
 * @param {number} userId - ID пользователя
 */
export async function deleteUserRequest(userId) {
  const response = await authorizedApi.delete(`${API_ENDPOINTS.users}/${userId}`);
  return unwrapResponse(response);
}

/**
 * Назначение права пользователю
 * @param {number} userId - ID пользователя
 * @param {number} permissionId - ID права
 */
export async function assignPermissionRequest(userId, permissionId) {
  const response = await authorizedApi.post(`${API_ENDPOINTS.permissions}/assign`, {
    user_id: userId,
    permission_id: permissionId,
  });
  return unwrapResponse(response);
}

/**
 * Массовое назначение прав пользователю
 * @param {number} userId - ID пользователя
 * @param {number[]} permissionIds - Массив ID прав
 */
export async function assignPermissionsBulkRequest(userId, permissionIds) {
  const response = await authorizedApi.post(`${API_ENDPOINTS.permissions}/assign/bulk`, {
    user_id: userId,
    permission_ids: permissionIds,
  });
  return unwrapResponse(response);
}

/**
 * Отзыв права у пользователя
 * @param {number} userId - ID пользователя
 * @param {number} permissionId - ID права
 */
export async function revokePermissionRequest(userId, permissionId) {
  const response = await authorizedApi.post(`${API_ENDPOINTS.permissions}/revoke`, {
    user_id: userId,
    permission_id: permissionId,
  });
  return unwrapResponse(response);
}

/**
 * Назначение группы пользователю
 * @param {number} userId - ID пользователя
 * @param {number} groupId - ID группы
 */
export async function assignGroupRequest(userId, groupId) {
  const response = await authorizedApi.post(`${API_ENDPOINTS.users}/${userId}/group`, {
    group_id: groupId,
  });
  return unwrapResponse(response);
}

/**
 * Получение списка всех прав (для модальных окон)
 * @param {number} page - Номер страницы
 * @param {number} limit - Количество элементов
 */
export async function getAllPermissionsRequest(page = 1, limit = 100) {
  const params = { page, limit };
  const response = await authorizedApi.get(API_ENDPOINTS.permissions, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const totalPages = data?.pagination?.pages ?? 1;

  // Если есть ещё страницы, загружаем их
  if (totalPages > 1) {
    const allItems = [...items];
    for (let p = 2; p <= totalPages; p += 1) {
      const pageResponse = await authorizedApi.get(API_ENDPOINTS.permissions, {
        params: { page: p, limit },
      });
      const pageData = unwrapResponse(pageResponse);
      if (Array.isArray(pageData?.items)) {
        allItems.push(...pageData.items);
      }
    }
    return allItems;
  }

  return items;
}

/**
 * Получение списка всех групп
 * @param {number} page - Номер страницы
 * @param {number} limit - Количество элементов
 */
export async function getAllGroupsRequest(page = 1, limit = 100) {
  const params = { page, limit };
  const response = await authorizedApi.get(API_ENDPOINTS.groups, { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const totalPages = data?.pagination?.pages ?? 1;

  // Если есть ещё страницы, загружаем их
  if (totalPages > 1) {
    const allItems = [...items];
    for (let p = 2; p <= totalPages; p += 1) {
      const pageResponse = await authorizedApi.get(API_ENDPOINTS.groups, {
        params: { page: p, limit },
      });
      const pageData = unwrapResponse(pageResponse);
      if (Array.isArray(pageData?.items)) {
        allItems.push(...pageData.items);
      }
    }
    return allItems;
  }

  return items;
}
