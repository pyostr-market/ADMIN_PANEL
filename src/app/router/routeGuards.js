import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../../entities/session/model/SessionProvider';
import { hasPermission } from '../../shared/lib/permissions/permissions';

export function PrivateRoute({ permission, mode = 'all' }) {
  const location = useLocation();
  const { isAuthenticated, isLoading, permissions } = useSession();

  if (isLoading) {
    return <div className="page-state">Проверка сессии...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!hasPermission(permissions, permission, mode)) {
    return <Navigate to="/error/403" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return <div className="page-state">Проверка сессии...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
