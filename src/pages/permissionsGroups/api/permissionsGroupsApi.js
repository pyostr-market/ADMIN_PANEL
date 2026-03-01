import { authorizedApi } from '../../../shared/api/http';
import { API_ENDPOINTS } from '../../../shared/config/env';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

export async function getPermissionsRequest({ page = 1, limit = 20, search } = {}) {
  const params = { page, limit };
  if (search) {
    params.search = search;
  }

  const response = await authorizedApi.get(API_ENDPOINTS.permissions, { params });
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

export async function createPermissionRequest(payload) {
  const response = await authorizedApi.post(API_ENDPOINTS.permissions, payload);
  return unwrapResponse(response);
}

export async function updatePermissionRequest(permissionId, payload) {
  const response = await authorizedApi.patch(`${API_ENDPOINTS.permissions}${permissionId}`, payload);
  return unwrapResponse(response);
}

export async function deletePermissionRequest(permissionId) {
  const response = await authorizedApi.delete(`${API_ENDPOINTS.permissions}${permissionId}`);
  return unwrapResponse(response);
}

export async function getGroupsRequest({ page = 1, limit = 20, search } = {}) {
  const params = { page, limit };
  if (search) {
    params.search = search;
  }

  const response = await authorizedApi.get(API_ENDPOINTS.groups, { params });
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

export async function createGroupRequest(payload) {
  const response = await authorizedApi.post(API_ENDPOINTS.groups, payload);
  return unwrapResponse(response);
}

export async function updateGroupRequest(groupId, payload) {
  const response = await authorizedApi.patch(`${API_ENDPOINTS.groups}/${groupId}`, payload);
  return unwrapResponse(response);
}

export async function deleteGroupRequest(groupId) {
  const response = await authorizedApi.delete(`${API_ENDPOINTS.groups}/${groupId}`);
  return unwrapResponse(response);
}
