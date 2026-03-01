import { getUserByIdRequest } from '../../../pages/users/api/usersApi';

/**
 * Кэш пользователей для хранения fio
 * Map<userId, { fio: string|null, phone: string|null }>
 */
const userCache = new Map();

/**
 * Получение информации о пользователе по ID
 * @param {number} userId - ID пользователя
 * @returns {Promise<{fio: string|null, phone: string|null}>}
 */
export async function getUserInfo(userId) {
  if (!userId) return { fio: null, phone: null };

  // Проверяем кэш
  const cached = userCache.get(userId);
  if (cached) {
    return cached;
  }

  try {
    const user = await getUserByIdRequest(userId);
    const userInfo = {
      fio: user?.fio ?? null,
      phone: user?.primary_phone?.phone_number ?? null,
    };
    userCache.set(userId, userInfo);
    return userInfo;
  } catch (_error) {
    // Если не удалось получить данные, возвращаем null
    const fallback = { fio: null, phone: null };
    userCache.set(userId, fallback);
    return fallback;
  }
}

/**
 * Массовое получение информации о пользователях
 * @param {number[]} userIds - Массив ID пользователей
 * @returns {Promise<Map<number, {fio: string|null, phone: string|null}>>}
 */
export async function getUsersInfo(userIds) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  const result = new Map();

  // Сначала берём из кэша
  const uncachedIds = [];
  uniqueIds.forEach((id) => {
    const cached = userCache.get(id);
    if (cached) {
      result.set(id, cached);
    } else {
      uncachedIds.push(id);
    }
  });

  // Загружаем недостающие
  if (uncachedIds.length > 0) {
    await Promise.all(
      uncachedIds.map(async (id) => {
        const info = await getUserInfo(id);
        result.set(id, info);
      })
    );
  }

  return result;
}

/**
 * Очистка кэша пользователей
 */
export function clearUserCache() {
  userCache.clear();
}

/**
 * Форматирование отображения пользователя
 * @param {number} userId - ID пользователя
 * @param {{fio: string|null, phone: string|null}} userInfo - Информация о пользователе
 * @returns {string}
 */
export function formatUserDisplay(userId, userInfo) {
  if (!userInfo) return `ID: ${userId}`;
  
  const parts = [];
  if (userInfo.fio) parts.push(userInfo.fio);
  if (userInfo.phone) parts.push(userInfo.phone);
  
  if (parts.length > 0) {
    return parts.join(' | ') + ` (ID: ${userId})`;
  }
  
  return `ID: ${userId}`;
}
