import { Route } from 'react-router-dom';
import { RegionsListPage } from '../../../pages/settings/RegionsListPage/RegionsListPage';
import { RegionFormPage } from '../../../pages/settings/RegionFormPage/RegionFormPage';
import { RegionDetailPage } from '../../../pages/settings/RegionDetailPage/RegionDetailPage';
import { RegionAuditPage } from '../../../pages/settings/RegionAuditPage/RegionAuditPage';
import { PrivateRoute } from '../routeGuards';

/**
 * Маршруты для раздела настроек (регионы)
 */
export function createSettingsRoutes() {
  return (
    <>
      {/* Регионы */}
      <Route
        element={<PrivateRoute permission={['region', 'region:view', 'region:create']} mode="any" />}
      >
        <Route path="settings/regions" element={<RegionsListPage />} />
        <Route path="settings/regions/create" element={<RegionFormPage />} />
        <Route path="settings/regions/:regionId/edit" element={<RegionFormPage />} />
        <Route path="settings/regions/:regionId" element={<RegionDetailPage />} />
        <Route path="settings/regions/:regionId/audit" element={<RegionAuditPage />} />
      </Route>
    </>
  );
}
