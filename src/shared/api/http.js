import axios from 'axios';
import { USER_SERVICE_BASE_URL, API_ENDPOINTS } from '../config/env';

export const publicApi = axios.create({
  baseURL: USER_SERVICE_BASE_URL,
  timeout: 15000,
});

export const authorizedApi = axios.create({
  baseURL: USER_SERVICE_BASE_URL,
  timeout: 15000,
});

export function setupAuthorizedApiInterceptors({
  getAccessToken,
  getRefreshToken,
  refreshAccessToken,
  onUnauthorized,
}) {
  let refreshPromise = null;

  const attachToken = (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  };

  const publicRequestId = publicApi.interceptors.request.use(attachToken);
  const requestId = authorizedApi.interceptors.request.use(attachToken);

  const responseId = authorizedApi.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { response, config } = error;

      if (!response || !config || response.status !== 401) {
        return Promise.reject(error);
      }

      const isRefreshRequest = config.url?.includes(API_ENDPOINTS.refresh);

      if (isRefreshRequest || config._retry) {
        onUnauthorized();
        return Promise.reject(error);
      }

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        onUnauthorized();
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken(refreshToken).finally(() => {
            refreshPromise = null;
          });
        }

        await refreshPromise;

        config._retry = true;
        return authorizedApi(config);
      } catch (refreshError) {
        onUnauthorized();
        return Promise.reject(refreshError);
      }
    },
  );

  return () => {
    publicApi.interceptors.request.eject(publicRequestId);
    authorizedApi.interceptors.request.eject(requestId);
    authorizedApi.interceptors.response.eject(responseId);
  };
}
