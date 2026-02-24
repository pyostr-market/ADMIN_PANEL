import { productApi } from '../api/http';

/**
 * Unwraps API response to get actual data
 * @param {Object} response - Axios response
 * @returns {*} Data from response
 */
function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

/**
 * Creates CRUD API functions for a given entity
 * @param {string} endpoint - API endpoint (e.g., '/categories')
 * @param {Object} options - Options
 * @param {string} options.entityName - Entity name for messages
 * @param {string} options.idParam - Name of ID parameter (default: 'id')
 * @returns {Object} CRUD API functions
 */
export function createCrudApi(endpoint, { entityName = 'entity', idParam = 'id' } = {}) {
  /**
   * Get list of entities with pagination and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search query
   * @returns {Promise<{items: Array, pagination: Object}>}
   */
  async function getListRequest({ page = 1, limit = 20, search, ...filters } = {}) {
    const offset = (page - 1) * limit;
    const requestParams = { limit, offset, ...filters };

    if (search) {
      requestParams.name = search;
    }

    const response = await productApi.get(endpoint, { params: requestParams });
    const data = unwrapResponse(response);
    const items = Array.isArray(data?.items) ? data.items : [];
    const total = data?.total ?? items.length;
    const pagination = { page, limit, total, pages: Math.ceil(total / limit) };

    return { items, pagination };
  }

  /**
   * Get single entity by ID
   * @param {string|number} entityId - Entity ID
   * @returns {Promise<Object>}
   */
  async function getByIdRequest(entityId) {
    const response = await productApi.get(`${endpoint}/${entityId}`);
    return unwrapResponse(response);
  }

  /**
   * Create new entity
   * @param {Object} payload - Entity data
   * @returns {Promise<Object>}
   */
  async function createRequest(payload) {
    const response = await productApi.post(endpoint, payload);
    return unwrapResponse(response);
  }

  /**
   * Update existing entity
   * @param {string|number} entityId - Entity ID
   * @param {Object} payload - Updated data
   * @returns {Promise<Object>}
   */
  async function updateRequest(entityId, payload) {
    const response = await productApi.put(`${endpoint}/${entityId}`, payload);
    return unwrapResponse(response);
  }

  /**
   * Delete entity
   * @param {string|number} entityId - Entity ID
   * @returns {Promise<void>}
   */
  async function deleteRequest(entityId) {
    const response = await productApi.delete(`${endpoint}/${entityId}`);
    return unwrapResponse(response);
  }

  /**
   * Get audit log for entity
   * @param {Object} params - Query parameters
   * @param {string|number} params.entityId - Entity ID
   * @param {string|number} params.user_id - User ID filter
   * @param {string} params.action - Action filter (create/update/delete)
   * @param {number} params.limit - Items per page
   * @param {number} params.offset - Offset
   * @returns {Promise<{items: Array, total: number}>}
   */
  async function getAuditRequest({ entityId, user_id, action, limit = 20, offset = 0 } = {}) {
    const params = { limit, offset };

    if (entityId !== undefined && entityId !== null) {
      params[idParam] = entityId;
    }
    if (user_id !== undefined && user_id !== null) {
      params.user_id = user_id;
    }
    if (action) {
      params.action = action;
    }

    const response = await productApi.get(`${endpoint}/admin/audit`, { params });
    const data = unwrapResponse(response);
    const items = Array.isArray(data?.items) ? data.items : [];
    const total = data?.total ?? items.length;

    return { items, total };
  }

  return {
    getListRequest,
    getByIdRequest,
    createRequest,
    updateRequest,
    deleteRequest,
    getAuditRequest,
  };
}

/**
 * Get users info by IDs
 * @param {Array<string|number>} userIds - Array of user IDs
 * @returns {Promise<Map>} Map of user ID to user info
 */
export async function getUsersInfo(userIds) {
  if (!userIds || userIds.length === 0) {
    return new Map();
  }

  const uniqueIds = [...new Set(userIds)];
  const response = await productApi.get('/users/admin/bulk', {
    params: { ids: uniqueIds },
  });

  const data = unwrapResponse(response);
  const usersMap = new Map();

  if (Array.isArray(data)) {
    data.forEach((user) => {
      usersMap.set(user.id, user);
    });
  }

  return usersMap;
}

/**
 * Format user display name
 * @param {string|number} userId - User ID
 * @param {Map} userCache - Map of user ID to user info
 * @returns {string} Formatted user display name
 */
export function formatUserDisplay(userId, userCache) {
  if (!userId) return '—';

  const user = userCache?.get(userId);
  if (user) {
    return user.fio || user.username || user.phone_number || `ID: ${user.id}`;
  }

  return `ID: ${userId}`;
}
