import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { LoginPage } from '../../pages/login/LoginPage/LoginPage';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';
import { SupportPage } from '../../pages/support/SupportPage';
import { ErrorPage } from '../../pages/errors/ErrorPage/ErrorPage';
import { UsersListPage } from '../../pages/users/UsersListPage/UsersListPage';
import { UserDetailPage } from '../../pages/users/UserDetailPage/UserDetailPage';
import { UserCreatePage } from '../../pages/users/UserCreatePage/UserCreatePage';
import { ProfilePage } from '../../pages/profile/ProfilePage';
import { SuppliersPage } from '../../pages/suppliers/SuppliersPage/SuppliersPage';
import { SupplierFormPage } from '../../pages/suppliers/SupplierFormPage/SupplierFormPage';
import { SupplierDetailPage } from '../../pages/suppliers/SupplierDetailPage/SupplierDetailPage';
import { SupplierAuditPage } from '../../pages/suppliers/SupplierAuditPage/SupplierAuditPage';
import { ManufacturersPage } from '../../pages/manufacturers/ManufacturersPage/ManufacturersPage';
import { ManufacturerFormPage } from '../../pages/manufacturers/ManufacturerFormPage/ManufacturerFormPage';
import { ManufacturerDetailPage } from '../../pages/manufacturers/ManufacturerDetailPage/ManufacturerDetailPage';
import { ManufacturerAuditPage } from '../../pages/manufacturers/ManufacturerAuditPage/ManufacturerAuditPage';
import { ProductTypesPage } from '../../pages/productTypes/ProductTypesPage/ProductTypesPage';
import { ProductTypeFormPage } from '../../pages/productTypes/ProductTypeFormPage/ProductTypeFormPage';
import { ProductTypeDetailPage } from '../../pages/productTypes/ProductTypeDetailPage/ProductTypeDetailPage';
import { ProductTypeAuditPage } from '../../pages/productTypes/ProductTypeAuditPage/ProductTypeAuditPage';
import { AttributesPage } from '../../pages/attributes/AttributesPage/AttributesPage';
import { AttributeFormPage } from '../../pages/attributes/AttributeFormPage/AttributeFormPage';
import { AttributeDetailPage } from '../../pages/attributes/AttributeDetailPage/AttributeDetailPage';
import { AttributeAuditPage } from '../../pages/attributes/AttributeAuditPage/AttributeAuditPage';
import { CategoriesPage } from '../../pages/categories/CategoriesPage/CategoriesPage';
import { CategoryFormPage } from '../../pages/categories/CategoryFormPage/CategoryFormPage';
import { CategoryDetailPage } from '../../pages/categories/CategoryDetailPage/CategoryDetailPage';
import { CategoryAuditPage } from '../../pages/categories/CategoryAuditPage/CategoryAuditPage';
import { PermissionsGroupsPage } from '../../pages/permissionsGroups/permissionsGroupsPage/PermissionsGroupsPage';
import { PrivateRoute, PublicOnlyRoute } from './routeGuards';
import { ProductsPage } from '../../pages/products/ProductsPage/ProductsPage';
import { ProductFormPage } from '../../pages/products/ProductFormPage/ProductFormPage';
import { ProductDetailPage } from '../../pages/products/ProductDetailPage/ProductDetailPage';
import { ProductAuditPage } from '../../pages/products/ProductAuditPage/ProductAuditPage';
import { CatalogPage } from '../../pages/catalog/CatalogPage';

// CRM
import { CrmPage } from '../../pages/crm/CrmPage';
import { OrdersPage } from '../../pages/crm/OrdersPage';
import { CustomersPage } from '../../pages/crm/CustomersPage';
import { TicketsPage } from '../../pages/crm/TicketsPage';

// Warehouse
import { WarehousePage } from '../../pages/warehouse/WarehousePage';
import { StockPage } from '../../pages/warehouse/StockPage';
import { StockMovementsPage } from '../../pages/warehouse/StockMovementsPage';
import { InventoryPage } from '../../pages/warehouse/InventoryPage';

// Billing
import { CategoryPricingPoliciesPage } from '../../pages/billing/CategoryPricingPoliciesPage/CategoryPricingPoliciesPage';
import { CategoryPricingPolicyDetailPage } from '../../pages/billing/CategoryPricingPolicyDetailPage/CategoryPricingPolicyDetailPage';
import { CategoryPricingPolicyFormPage } from '../../pages/billing/CategoryPricingPolicyFormPage/CategoryPricingPolicyFormPage';
import { CategoryPricingPolicyAuditPage } from '../../pages/billing/CategoryPricingPolicyAuditPage/CategoryPricingPolicyAuditPage';

// Actualization
import { ActualizationPage } from '../../pages/actualization/ActualizationPage/ActualizationPage';
import { ColorsListPage } from '../../pages/actualization/ColorsListPage/ColorsListPage';
import { ColorFormPage } from '../../pages/actualization/ColorFormPage/ColorFormPage';
import { ColorDetailPage } from '../../pages/actualization/ColorDetailPage/ColorDetailPage';

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
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/create" element={<CategoryFormPage />} />
            <Route path="/categories/:categoryId/edit" element={<CategoryFormPage />} />
            <Route path="/categories/:categoryId" element={<CategoryDetailPage />} />
            <Route path="/categories/:categoryId/audit" element={<CategoryAuditPage />} />
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

          {/* CRM Routes */}
          <Route path="/crm" element={<CrmPage />} />
          <Route path="/crm/orders" element={<OrdersPage />} />
          <Route path="/crm/customers" element={<CustomersPage />} />
          <Route path="/crm/tickets" element={<TicketsPage />} />

          {/* Actualization Routes */}
          <Route path="/actualization" element={<ActualizationPage />} />
          <Route path="/actualization/colors" element={<ColorsListPage />} />
          <Route path="/actualization/colors/create" element={<ColorFormPage />} />
          <Route path="/actualization/colors/:colorName/edit" element={<ColorFormPage />} />
          <Route path="/actualization/colors/:colorName" element={<ColorDetailPage />} />

          {/* Warehouse Routes */}
          <Route path="/warehouse" element={<WarehousePage />} />
          <Route path="/warehouse/stock" element={<StockPage />} />
          <Route path="/warehouse/movements" element={<StockMovementsPage />} />
          <Route path="/warehouse/inventory" element={<InventoryPage />} />

          {/* Billing Routes */}
          <Route element={<PrivateRoute permission={['billing']} mode="any" />}>
            <Route path="/billing/pricing-policies" element={<CategoryPricingPoliciesPage />} />
            <Route path="/billing/pricing-policies/create" element={<CategoryPricingPolicyFormPage />} />
            <Route path="/billing/pricing-policies/:pricingPolicyId/edit" element={<CategoryPricingPolicyFormPage />} />
            <Route path="/billing/pricing-policies/:pricingPolicyId" element={<CategoryPricingPolicyDetailPage />} />
            <Route path="/billing/pricing-policies/:pricingPolicyId/audit" element={<CategoryPricingPolicyAuditPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/error/404" replace />} />
    </Routes>
  );
}
