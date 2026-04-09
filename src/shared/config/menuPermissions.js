import { hasPermission } from '../lib/permissions/permissions';

/**
 * Конфигурация прав доступа для групп меню
 * Ключ — имя группы, значение — массив необходимых прав
 */
export const MENU_PERMISSIONS = {
  crm: [
    'users',
    'users:view',
    'admin:user',
    'admin:user:view',
    'permission',
    'permission:view',
    'admin:group:create',
    'admin:group:update',
    'admin:group:delete',
    'admin:group:view',
  ],
  catalog: [
    'product',
    'product:view',
    'manufacturer',
    'manufacturer:view',
    'device_type',
    'device-type:view',
    'product_type',
    'product_type:view',
    'category',
    'category:view',
    'supplier',
    'supplier:view',
  ],
  warehouse: ['warehouse', 'warehouse:view'],
  billing: ['billing', 'billing:view'],
  cms: ['cms', 'cms:view', 'cms:create', 'cms:update', 'cms:delete'],
  settings: ['region', 'region:view', 'region:create', 'region:update', 'region:delete'],
  actualization: ['pricing_engine', 'pricing_engine:start'],
};

/**
 * Проверяет, есть ли у пользователя доступ к группе меню
 * @param {string[]} userPermissions - Права пользователя
 * @param {string} groupKey - Ключ группы меню
 * @returns {boolean} Есть ли доступ
 */
export function hasMenuPermission(userPermissions, groupKey) {
  const requiredPermissions = MENU_PERMISSIONS[groupKey];

  // Если прав нет в конфиге, показываем всегда
  if (!requiredPermissions) {
    return true;
  }

  return hasPermission(userPermissions, requiredPermissions, 'any');
}
