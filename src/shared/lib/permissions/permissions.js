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
