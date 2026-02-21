import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearSessionTokens,
  getAccessToken,
  getRefreshToken,
  setSessionTokens,
  setFio,
} from './sessionStore';
import {
  loginRequest,
  myPermissionsRequest,
  refreshTokenRequest,
  authMeRequest,
} from '../api/authApi';
import { setupAuthorizedApiInterceptors } from '../../../shared/api/http';
import { useSocket } from '../../../shared/lib/socket/SocketProvider';

const SessionContext = createContext(null);

const AUTH_STATUS = {
  loading: 'loading',
  authenticated: 'authenticated',
  anonymous: 'anonymous',
};

let refreshInFlightPromise = null;

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (_error) {
    return null;
  }
}

function extractFioFromToken() {
  const token = getAccessToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  return payload?.fio ?? null;
}

export function SessionProvider({ children }) {
  const socket = useSocket();
  const [authStatus, setAuthStatus] = useState(AUTH_STATUS.loading);
  const [permissions, setPermissions] = useState([]);
  const [fio, setFioState] = useState(null);

  const logout = useCallback(() => {
    clearSessionTokens();
    setPermissions([]);
    setFioState(null);
    setAuthStatus(AUTH_STATUS.anonymous);
  }, []);

  const syncFio = useCallback(() => {
    const fioFromToken = extractFioFromToken();
    setFio(fioFromToken);
    setFioState(fioFromToken);
  }, []);

  const refreshSession = useCallback(async (tokenFromArg) => {
    const refreshToken = tokenFromArg ?? getRefreshToken();

    if (!refreshToken) {
      throw new Error('Refresh token is not available');
    }

    if (!refreshInFlightPromise) {
      refreshInFlightPromise = refreshTokenRequest(refreshToken).finally(() => {
        refreshInFlightPromise = null;
      });
    }

    const data = await refreshInFlightPromise;

    setSessionTokens({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
    });

    syncFio();

    return data.access_token;
  }, [syncFio]);

  const syncPermissions = useCallback(async () => {
    try {
      const currentPermissions = await myPermissionsRequest();
      setPermissions(currentPermissions);
    } catch (_error) {
      setPermissions([]);
    }
  }, []);

  const login = useCallback(
    async ({ username, password }) => {
      const data = await loginRequest({ username, password });

      setSessionTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
      });

      syncFio();
      await syncPermissions();
      setAuthStatus(AUTH_STATUS.authenticated);
    },
    [syncFio, syncPermissions],
  );

  const fetchProfile = useCallback(async () => {
    try {
      const profileData = await authMeRequest();
      if (profileData?.fio) {
        setFio(profileData.fio);
        setFioState(profileData.fio);
      }
    } catch (_error) {
      // Игнорируем ошибки, fio уже может быть установлен из токена
    }
  }, []);

  useEffect(() => {
    const teardown = setupAuthorizedApiInterceptors({
      getAccessToken,
      getRefreshToken,
      refreshAccessToken: refreshSession,
      onUnauthorized: logout,
    });

    return teardown;
  }, [logout, refreshSession]);

  useEffect(() => {
    const bootstrap = async () => {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        setAuthStatus(AUTH_STATUS.anonymous);
        return;
      }

      try {
        await refreshSession(refreshToken);
        await syncPermissions();
        await fetchProfile();
        setAuthStatus(AUTH_STATUS.authenticated);
      } catch (_error) {
        logout();
      }
    };

    bootstrap();
  }, [logout, refreshSession, syncPermissions, fetchProfile]);

  useEffect(() => {
    const unsubscribeBanned = socket.subscribe('user:banned', () => {
      logout();
    });

    const unsubscribePermissionsUpdated = socket.subscribe('user:permissions:update', async () => {
      try {
        await refreshSession();
        await syncPermissions();
      } catch (_error) {
        logout();
      }
    });

    return () => {
      unsubscribeBanned();
      unsubscribePermissionsUpdated();
    };
  }, [logout, refreshSession, socket, syncPermissions]);

  const contextValue = useMemo(
    () => ({
      authStatus,
      isAuthenticated: authStatus === AUTH_STATUS.authenticated,
      isLoading: authStatus === AUTH_STATUS.loading,
      permissions,
      fio,
      login,
      logout,
      refreshSession,
      syncPermissions,
      fetchProfile,
    }),
    [authStatus, fio, login, logout, permissions, refreshSession, syncPermissions, fetchProfile],
  );

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used inside SessionProvider');
  }

  return context;
}
