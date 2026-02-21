import { hasPermission } from '../lib/permissions/permissions';
import { useSession } from '../../entities/session/model/SessionProvider';

export function PermissionGate({ permission, mode = 'all', fallback = null, children }) {
  const { permissions } = useSession();

  if (!hasPermission(permissions, permission, mode)) {
    return fallback;
  }

  return children;
}
