import { Route } from 'react-router-dom';
import { ManufacturersPage } from '../../../pages/manufacturers/ManufacturersPage/ManufacturersPage';
import { ManufacturerFormPage } from '../../../pages/manufacturers/ManufacturerFormPage/ManufacturerFormPage';
import { ManufacturerDetailPage } from '../../../pages/manufacturers/ManufacturerDetailPage/ManufacturerDetailPage';
import { ManufacturerAuditPage } from '../../../pages/manufacturers/ManufacturerAuditPage/ManufacturerAuditPage';
import { ProductTypesPage } from '../../../pages/productTypes/ProductTypesPage/ProductTypesPage';
import { ProductTypeFormPage } from '../../../pages/productTypes/ProductTypeFormPage/ProductTypeFormPage';
import { ProductTypeDetailPage } from '../../../pages/productTypes/ProductTypeDetailPage/ProductTypeDetailPage';
import { ProductTypeAuditPage } from '../../../pages/productTypes/ProductTypeAuditPage/ProductTypeAuditPage';
import { AttributesPage } from '../../../pages/attributes/AttributesPage/AttributesPage';
import { AttributeFormPage } from '../../../pages/attributes/AttributeFormPage/AttributeFormPage';
import { AttributeDetailPage } from '../../../pages/attributes/AttributeDetailPage/AttributeDetailPage';
import { AttributeAuditPage } from '../../../pages/attributes/AttributeAuditPage/AttributeAuditPage';
import { CategoriesPage } from '../../../pages/categories/CategoriesPage/CategoriesPage';
import { CategoryFormPage } from '../../../pages/categories/CategoryFormPage/CategoryFormPage';
import { CategoryDetailPage } from '../../../pages/categories/CategoryDetailPage/CategoryDetailPage';
import { CategoryAuditPage } from '../../../pages/categories/CategoryAuditPage/CategoryAuditPage';
import { ProductsPage } from '../../../pages/products/ProductsPage/ProductsPage';
import { ProductFormPage } from '../../../pages/products/ProductFormPage/ProductFormPage';
import { ProductDetailPage } from '../../../pages/products/ProductDetailPage/ProductDetailPage';
import { ProductAuditPage } from '../../../pages/products/ProductAuditPage/ProductAuditPage';
import { CatalogPage } from '../../../pages/catalog/CatalogPage';
import { PrivateRoute } from '../routeGuards';

/**
 * Маршруты для каталога товаров
 */
export function createCatalogRoutes() {
  return (
    <>
      {/* Общий каталог */}
      <Route
        element={<PrivateRoute permission={['product', 'product:view', 'manufacturer', 'manufacturer:view', 'device_type', 'device-type:view', 'product_type', 'product_type:view']} mode="any" />}
      >
        <Route path="catalog" element={<CatalogPage />} />
      </Route>

      {/* Категории */}
      <Route
        element={<PrivateRoute permission={['product', 'product:view']} mode="any" />}
      >
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/create" element={<CategoryFormPage />} />
        <Route path="categories/:categoryId/edit" element={<CategoryFormPage />} />
        <Route path="categories/:categoryId" element={<CategoryDetailPage />} />
        <Route path="categories/:categoryId/audit" element={<CategoryAuditPage />} />
      </Route>

      {/* Товары */}
      <Route
        element={<PrivateRoute permission={['product', 'product:view']} mode="any" />}
      >
        <Route path="catalog/products" element={<ProductsPage />} />
        <Route path="catalog/products/create" element={<ProductFormPage />} />
        <Route path="catalog/products/:productId/edit" element={<ProductFormPage />} />
        <Route path="catalog/products/:productId" element={<ProductDetailPage />} />
        <Route path="catalog/products/:productId/audit" element={<ProductAuditPage />} />
      </Route>

      {/* Производители */}
      <Route
        element={<PrivateRoute permission={['manufacturer', 'manufacturer:view']} mode="any" />}
      >
        <Route path="catalog/manufacturers" element={<ManufacturersPage />} />
        <Route path="catalog/manufacturers/create" element={<ManufacturerFormPage />} />
        <Route path="catalog/manufacturers/:manufacturerId/edit" element={<ManufacturerFormPage />} />
        <Route path="catalog/manufacturers/:manufacturerId" element={<ManufacturerDetailPage />} />
        <Route path="catalog/manufacturers/:manufacturerId/audit" element={<ManufacturerAuditPage />} />
      </Route>

      {/* Типы товаров */}
      <Route
        element={<PrivateRoute permission={['device_type', 'device_type:view', 'product_type', 'product_type:view']} mode="any" />}
      >
        <Route path="catalog/device_type" element={<ProductTypesPage />} />
        <Route path="catalog/device_type/create" element={<ProductTypeFormPage />} />
        <Route path="catalog/device_type/:productTypeId/edit" element={<ProductTypeFormPage />} />
        <Route path="catalog/device_type/:productTypeId" element={<ProductTypeDetailPage />} />
        <Route path="catalog/device_type/:productTypeId/audit" element={<ProductTypeAuditPage />} />
      </Route>

      {/* Атрибуты */}
      <Route
        element={<PrivateRoute permission={['product_attribute', 'product_attribute:view']} mode="any" />}
      >
        <Route path="catalog/attributes" element={<AttributesPage />} />
        <Route path="catalog/attributes/create" element={<AttributeFormPage />} />
        <Route path="catalog/attributes/:attributeId/edit" element={<AttributeFormPage />} />
        <Route path="catalog/attributes/:attributeId" element={<AttributeDetailPage />} />
        <Route path="catalog/attributes/:attributeId/audit" element={<AttributeAuditPage />} />
      </Route>
    </>
  );
}
