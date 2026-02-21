import { getCookie, removeCookie, setCookie } from '../../../shared/lib/cookie/cookie';

const REFRESH_COOKIE_KEY = 'market_refresh_token';

let accessToken = null;
let expiresAt = null;

export function setSessionTokens({ accessToken: nextAccessToken, refreshToken, expiresAt: nextExpiresAt }) {
  accessToken = nextAccessToken ?? null;
  expiresAt = nextExpiresAt ?? null;

  if (refreshToken) {
    setCookie(REFRESH_COOKIE_KEY, refreshToken);
  }
}

export function clearSessionTokens() {
  accessToken = null;
  expiresAt = null;
  removeCookie(REFRESH_COOKIE_KEY);
}

export function getAccessToken() {
  return accessToken;
}

export function getAccessTokenExpiresAt() {
  return expiresAt;
}

export function getRefreshToken() {
  return getCookie(REFRESH_COOKIE_KEY);
}
