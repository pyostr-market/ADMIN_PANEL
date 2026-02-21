import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { LoginPage } from '../../pages/login/LoginPage';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';
import { SupportPage } from '../../pages/support/SupportPage';
import { ErrorPage } from '../../pages/errors/ErrorPage';
import { UsersListPage } from '../../pages/users/UsersListPage';
import { UserDetailPage } from '../../pages/users/UserDetailPage';
import { UserCreatePage } from '../../pages/users/UserCreatePage';
import { SuppliersPage } from '../../pages/suppliers/SuppliersPage';
import { CatalogPage } from '../../pages/catalog/CatalogPage';
import { ManufacturersPage } from '../../pages/manufacturers/ManufacturersPage';
import { ProductsPage } from '../../pages/products/ProductsPage';
import { ProductTypesPage } from '../../pages/productTypes/ProductTypesPage';
import { PermissionsGroupsPage } from '../../pages/permissionsGroups/PermissionsGroupsPage';
import { PrivateRoute, PublicOnlyRoute } from './routeGuards';

function ErrorPageByCode() {
  const { code } = useParams();
  return <ErrorPage code={code} />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route path="/support" element={<SupportPage />} />
      <Route path="/error/:code" element={<ErrorPageByCode />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          <Route element={<PrivateRoute permission={["users", "users:view", "admin:user", "admin:user:view"]} mode="any" />}>
            <Route path="/users" element={<UsersListPage />} />
            <Route path="/users/create" element={<UserCreatePage />} />
            <Route path="/users/:userId" element={<UserDetailPage />} />
          </Route>

          <Route element={<PrivateRoute permission={["permission:view", "permission:update", "admin:group:create", "admin:group:update", "admin:group:delete", "admin:group:view"]} mode="any" />}>
            <Route path="/users/permissions-groups" element={<PermissionsGroupsPage />} />
          </Route>

          <Route element={<PrivateRoute permission={["supplier", "supplier:view"]} mode="any" />}>
            <Route path="/suppliers" element={<SuppliersPage />} />
          </Route>

          <Route element={<PrivateRoute permission={["product", "product:view", "manufacturer", "manufacturer:view", "device_type", "device-type:view", "product_type", "product_type:view"]} mode="any" />}>
            <Route path="/catalog" element={<CatalogPage />} />
          </Route>

          <Route element={<PrivateRoute permission={["product", "product:view"]} mode="any" />}>
            <Route path="/catalog/products" element={<ProductsPage />} />
          </Route>

          <Route element={<PrivateRoute permission={["manufacturer", "manufacturer:view"]} mode="any" />}>
            <Route path="/catalog/manufacturers" element={<ManufacturersPage />} />
          </Route>

          <Route element={<PrivateRoute permission={["device_type", "device_type:view", "product_type", "product-type:view"]} mode="any" />}>
            <Route path="/catalog/device_type" element={<ProductTypesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/error/404" replace />} />
    </Routes>
  );
}
