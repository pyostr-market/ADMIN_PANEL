export function setCookie(name, value, days = 30) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getCookie(name) {
  const encodedName = `${name}=`;
  const parts = document.cookie.split(';').map((part) => part.trim());
  const found = parts.find((part) => part.startsWith(encodedName));

  if (!found) {
    return null;
  }

  return decodeURIComponent(found.slice(encodedName.length));
}

export function removeCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}
