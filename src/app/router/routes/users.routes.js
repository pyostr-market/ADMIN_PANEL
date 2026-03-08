import { Route } from 'react-router-dom';
import { UsersListPage } from '../../../pages/users/UsersListPage/UsersListPage';
import { UserDetailPage } from '../../../pages/users/UserDetailPage/UserDetailPage';
import { UserCreatePage } from '../../../pages/users/UserCreatePage/UserCreatePage';
import { PermissionsGroupsPage } from '../../../pages/permissionsGroups/permissionsGroupsPage/PermissionsGroupsPage';
import { PrivateRoute } from '../routeGuards';

/**
 * Маршруты для управления пользователями и группами доступа
 */
export function createUsersRoutes() {
  return (
    <>
      {/* Пользователи */}
      <Route
        element={<PrivateRoute permission={['users', 'users:view', 'users:create', 'admin:user', 'admin:user:view']} mode="any" />}
      >
        <Route path="users" element={<UsersListPage />} />
        <Route path="users/create" element={<UserCreatePage />} />
        <Route path="users/:userId" element={<UserDetailPage />} />
      </Route>

      {/* Группы доступа */}
      <Route
        element={
          <PrivateRoute
            permission={['permission', 'permission:view', 'admin:group:create', 'admin:group:update', 'admin:group:delete', 'admin:group:view']}
            mode="any"
          />
        }
      >
        <Route path="users/permissions-groups" element={<PermissionsGroupsPage />} />
      </Route>
    </>
  );
}
