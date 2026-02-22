import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { LoginPage } from '../../pages/login/LoginPage';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';
import { SupportPage } from '../../pages/support/SupportPage';
import { ErrorPage } from '../../pages/errors/ErrorPage';
import { UsersListPage } from '../../pages/users/UsersListPage';
import { UserDetailPage } from '../../pages/users/UserDetailPage';
import { UserCreatePage } from '../../pages/users/UserCreatePage';
import { ProfilePage } from '../../pages/profile/ProfilePage';
import { SuppliersPage } from '../../pages/suppliers/SuppliersPage';
import { SupplierFormPage } from '../../pages/suppliers/SupplierFormPage';
import { SupplierDetailPage } from '../../pages/suppliers/SupplierDetailPage';
import { SupplierAuditPage } from '../../pages/suppliers/SupplierAuditPage';
import { CatalogPage } from '../../pages/catalog/CatalogPage';
import { ManufacturersPage } from '../../pages/manufacturers/ManufacturersPage';
import { ManufacturerFormPage } from '../../pages/manufacturers/ManufacturerFormPage';
import { ManufacturerDetailPage } from '../../pages/manufacturers/ManufacturerDetailPage';
import { ManufacturerAuditPage } from '../../pages/manufacturers/ManufacturerAuditPage';
import { ProductsPage } from '../../pages/products/ProductsPage';
import { ProductFormPage } from '../../pages/products/ProductFormPage';
import { ProductDetailPage } from '../../pages/products/ProductDetailPage';
import { ProductAuditPage } from '../../pages/products/ProductAuditPage';
import { ProductTypesPage } from '../../pages/productTypes/ProductTypesPage';
import { ProductTypeFormPage } from '../../pages/productTypes/ProductTypeFormPage';
import { ProductTypeDetailPage } from '../../pages/productTypes/ProductTypeDetailPage';
import { ProductTypeAuditPage } from '../../pages/productTypes/ProductTypeAuditPage';
import { AttributesPage } from '../../pages/attributes/AttributesPage';
import { AttributeFormPage } from '../../pages/attributes/AttributeFormPage';
import { AttributeDetailPage } from '../../pages/attributes/AttributeDetailPage';
import { AttributeAuditPage } from '../../pages/attributes/AttributeAuditPage';
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

          <Route path="/profile" element={<ProfilePage />} />

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
            <Route path="/suppliers/create" element={<SupplierFormPage />} />
            <Route path="/suppliers/:supplierId/edit" element={<SupplierFormPage />} />
            <Route path="/suppliers/:supplierId" element={<SupplierDetailPage />} />
            <Route path="/suppliers/:supplierId/audit" element={<SupplierAuditPage />} />
          </Route>

          <Route element={<PrivateRoute permission={["product", "product:view", "manufacturer", "manufacturer:view", "device_type", "device-type:view", "product_type", "product_type:view"]} mode="any" />}>
            <Route path="/catalog" element={<CatalogPage />} />
          </Route>

          <Route element={<PrivateRoute permission={["product", "product:view"]} mode="any" />}>
            <Route path="/catalog/products" element={<ProductsPage />} />
            <Route path="/catalog/products/create" element={<ProductFormPage />} />
            <Route path="/catalog/products/:productId/edit" element={<ProductFormPage />} />
            <Route path="/catalog/products/:productId" element={<ProductDetailPage />} />
            <Route path="/catalog/products/:productId/audit" element={<ProductAuditPage />} />
          </Route>

          <Route element={<PrivateRoute permission={["manufacturer", "manufacturer:view"]} mode="any" />}>
            <Route path="/catalog/manufacturers" element={<ManufacturersPage />} />
            <Route path="/catalog/manufacturers/create" element={<ManufacturerFormPage />} />
            <Route path="/catalog/manufacturers/:manufacturerId/edit" element={<ManufacturerFormPage />} />
            <Route path="/catalog/manufacturers/:manufacturerId" element={<ManufacturerDetailPage />} />
            <Route path="/catalog/manufacturers/:manufacturerId/audit" element={<ManufacturerAuditPage />} />
          </Route>

          <Route element={<PrivateRoute permission={["device_type", "device_type:view", "product_type", "product_type:view"]} mode="any" />}>
            <Route path="/catalog/device_type" element={<ProductTypesPage />} />
            <Route path="/catalog/device_type/create" element={<ProductTypeFormPage />} />
            <Route path="/catalog/device_type/:productTypeId/edit" element={<ProductTypeFormPage />} />
            <Route path="/catalog/device_type/:productTypeId" element={<ProductTypeDetailPage />} />
            <Route path="/catalog/device_type/:productTypeId/audit" element={<ProductTypeAuditPage />} />
          </Route>

          <Route element={<PrivateRoute permission={["product_attribute", "product_attribute:view"]} mode="any" />}>
            <Route path="/catalog/attributes" element={<AttributesPage />} />
            <Route path="/catalog/attributes/create" element={<AttributeFormPage />} />
            <Route path="/catalog/attributes/:attributeId/edit" element={<AttributeFormPage />} />
            <Route path="/catalog/attributes/:attributeId" element={<AttributeDetailPage />} />
            <Route path="/catalog/attributes/:attributeId/audit" element={<AttributeAuditPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/error/404" replace />} />
    </Routes>
  );
}
