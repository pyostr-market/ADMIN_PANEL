import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearSessionTokens,
  getAccessToken,
  getRefreshToken,
  setSessionTokens,
} from './sessionStore';
import {
  loginRequest,
  myPermissionsRequest,
  refreshTokenRequest,
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

export function SessionProvider({ children }) {
  const socket = useSocket();
  const [authStatus, setAuthStatus] = useState(AUTH_STATUS.loading);
  const [permissions, setPermissions] = useState([]);

  const logout = useCallback(() => {
    clearSessionTokens();
    setPermissions([]);
    setAuthStatus(AUTH_STATUS.anonymous);
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

    return data.access_token;
  }, []);

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

      await syncPermissions();
      setAuthStatus(AUTH_STATUS.authenticated);
    },
    [syncPermissions],
  );

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
        setAuthStatus(AUTH_STATUS.authenticated);
      } catch (_error) {
        logout();
      }
    };

    bootstrap();
  }, [logout, refreshSession, syncPermissions]);

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
      login,
      logout,
      refreshSession,
      syncPermissions,
    }),
    [authStatus, login, logout, permissions, refreshSession, syncPermissions],
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
