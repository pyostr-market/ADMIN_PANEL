import { authorizedApi, publicApi } from '../../../shared/api/http';
import { API_ENDPOINTS } from '../../../shared/config/env';

function toFormData(payload) {
  const params = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    params.append(key, value ?? '');
  });

  return params;
}

export async function loginRequest({ username, password }) {
  const response = await publicApi.post(
    API_ENDPOINTS.login,
    toFormData({ username, password }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  return response.data;
}

export async function refreshTokenRequest(refreshToken) {
  const response = await publicApi.post(
    `${API_ENDPOINTS.refresh}?refresh_token=${encodeURIComponent(refreshToken)}`,
  );

  const data = response.data?.data ?? response.data;

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  };
}

export async function myPermissionsRequest() {
  const response = await authorizedApi.get(API_ENDPOINTS.myPermissions);
  const payload = response.data?.data ?? response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.permissions)) {
    return payload.permissions;
  }

  return [];
}
