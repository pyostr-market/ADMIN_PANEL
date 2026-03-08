import { Route } from 'react-router-dom';
import { SuppliersPage } from '../../../pages/suppliers/SuppliersPage/SuppliersPage';
import { SupplierFormPage } from '../../../pages/suppliers/SupplierFormPage/SupplierFormPage';
import { SupplierDetailPage } from '../../../pages/suppliers/SupplierDetailPage/SupplierDetailPage';
import { SupplierAuditPage } from '../../../pages/suppliers/SupplierAuditPage/SupplierAuditPage';
import { PrivateRoute } from '../routeGuards';

/**
 * Маршруты для поставщиков
 */
export function createSuppliersRoutes() {
  return (
    <>
      <Route
        element={<PrivateRoute permission={['supplier', 'supplier:view', 'supplier:create']} mode="any" />}
      >
        <Route path="catalog/suppliers" element={<SuppliersPage />} />
        <Route path="catalog/suppliers/create" element={<SupplierFormPage />} />
        <Route path="catalog/suppliers/:supplierId/edit" element={<SupplierFormPage />} />
        <Route path="catalog/suppliers/:supplierId" element={<SupplierDetailPage />} />
        <Route path="catalog/suppliers/:supplierId/audit" element={<SupplierAuditPage />} />
      </Route>
    </>
  );
}
