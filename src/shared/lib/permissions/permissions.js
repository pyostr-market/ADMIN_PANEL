function normalizePermissions(permissions) {
  if (!Array.isArray(permissions)) {
    return [];
  }

  return permissions
    .map((permission) => {
      if (typeof permission === 'string') {
        return permission;
      }

      if (permission && typeof permission.name === 'string') {
        return permission.name;
      }

      return null;
    })
    .filter(Boolean);
}

/**
 * Проверяет, является ли право глобальным (без двоеточия)
 */
export function isGlobalPermission(permissionName) {
  return typeof permissionName === 'string' && !permissionName.includes(':');
}

/**
 * Извлекает секцию из права (часть до первого двоеточия)
 */
export function getPermissionSection(permissionName) {
  if (typeof permissionName !== 'string') {
    return null;
  }
  const parts = permissionName.split(':');
  return parts[0] || null;
}

/**
 * Группирует права по секциям (часть имени до первого двоеточия)
 * @param {Array} permissions - Массив прав (объектов с полем name)
 * @returns {Object} Объект, где ключи - секции, значения - массивы прав
 */
export function buildPermissionBuckets(permissions) {
  return permissions.reduce((acc, permission) => {
    const key = typeof permission.name === 'string'
      ? permission.name.split(':').filter(Boolean)[0] || 'other'
      : 'other';

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(permission);
    return acc;
  }, {});
}

/**
 * Проверяет, является ли право view-правом в своей секции
 */
export function isViewPermission(permissionName) {
  if (typeof permissionName !== 'string') {
    return false;
  }
  const parts = permissionName.split(':');
  return parts.length === 2 && parts[1] === 'view';
}

/**
 * Возвращает view-право для заданной секции
 */
export function getViewPermissionForSection(section) {
  return `${section}:view`;
}

/**
 * Определяет, какие права должны быть заблокированы и выбраны при выборе глобального права
 * Возвращает объект { shouldDisable: boolean, disabledByGlobal: string | null }
 */
export function getGlobalPermissionEffect(selectedPermissionIds, allPermissions, currentPermissionId) {
  const permissionMap = new Map(allPermissions.map(p => [p.id, p.name]));
  const selectedNames = selectedPermissionIds
    .map(id => permissionMap.get(id))
    .filter(Boolean);

  // Находим глобальные права среди выбранных
  const globalPermissions = selectedNames.filter(isGlobalPermission);

  // Если есть глобальные права, проверяем текущее право
  if (globalPermissions.length > 0) {
    const currentPermissionName = permissionMap.get(currentPermissionId);
    const currentSection = getPermissionSection(currentPermissionName);

    // Проверяем, принадлежит ли текущее право к той же секции, что и глобальное
    const hasGlobalForSection = globalPermissions.some(globalPerm => {
      return globalPerm === currentSection;
    });

    if (hasGlobalForSection) {
      // Это право заблокировано глобальным
      const globalPermId = allPermissions.find(p => p.name === currentSection)?.id;
      return {
        shouldDisable: true,
        disabledByGlobal: globalPermId,
      };
    }
  }

  return {
    shouldDisable: false,
    disabledByGlobal: null,
  };
}

/**
 * Определяет, должно ли view-право быть автоматически выбрано и заблокировано
 * для заданного права в той же секции
 */
export function getViewPermissionEffect(selectedPermissionIds, allPermissions, currentPermissionId) {
  const permissionMap = new Map(allPermissions.map(p => [p.id, p.name]));
  const currentPermissionName = permissionMap.get(currentPermissionId);

  if (!currentPermissionName) {
    return { shouldForceSelect: false, lockedByView: false };
  }

  const currentSection = getPermissionSection(currentPermissionName);

  // Если текущее право - само view, проверяем, есть ли другие права в этой секции
  if (isViewPermission(currentPermissionName)) {
    const sectionPermissions = allPermissions.filter(p => {
      const section = getPermissionSection(p.name);
      return section === currentSection && !isViewPermission(p.name);
    });

    const hasOtherSelectedInSection = sectionPermissions.some(p =>
      selectedPermissionIds.includes(p.id)
    );

    return {
      shouldForceSelect: false,
      lockedByView: hasOtherSelectedInSection,
    };
  }

  // Если текущее право не view, проверяем, нужно ли авто-выбрать view
  if (currentSection && !isGlobalPermission(currentPermissionName)) {
    const viewPermissionName = getViewPermissionForSection(currentSection);
    const viewPermission = allPermissions.find(p => p.name === viewPermissionName);

    if (viewPermission) {
      return {
        shouldForceSelect: selectedPermissionIds.includes(viewPermission.id),
        lockedByView: false,
      };
    }
  }

  return {
    shouldForceSelect: false,
    lockedByView: false,
  };
}

function getPermissionFallbacks(permission) {
  const segments = permission.split(':').filter(Boolean);

  if (segments.length <= 1) {
    return [];
  }

  const fallbacks = [];

  for (let end = segments.length - 1; end > 0; end -= 1) {
    fallbacks.push(segments.slice(0, end).join(':'));
  }

  return fallbacks;
}

function canByRule(userPermissions, requiredPermission) {
  if (!requiredPermission) {
    return true;
  }

  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  return getPermissionFallbacks(requiredPermission)
    .some((permission) => userPermissions.includes(permission));
}

export function hasPermission(userPermissions, requiredPermission, mode = 'all') {
  const normalizedUserPermissions = normalizePermissions(userPermissions);

  if (!requiredPermission) {
    return true;
  }

  const requiredList = Array.isArray(requiredPermission)
    ? requiredPermission
    : [requiredPermission];

  if (requiredList.length === 0) {
    return true;
  }

  if (mode === 'any') {
    return requiredList.some((permission) => canByRule(normalizedUserPermissions, permission));
  }

  return requiredList.every((permission) => canByRule(normalizedUserPermissions, permission));
}
