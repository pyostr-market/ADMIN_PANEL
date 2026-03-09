import { Navigate, Route } from 'react-router-dom';
import { ActualizationPage } from '../../../pages/actualization/ActualizationPage/ActualizationPage';
import { ColorsListPage } from '../../../pages/actualization/ColorsListPage/ColorsListPage';
import { ColorFormPage } from '../../../pages/actualization/ColorFormPage/ColorFormPage';
import { ColorDetailPage } from '../../../pages/actualization/ColorDetailPage/ColorDetailPage';
import { PricesListPage } from '../../../pages/actualization/PricesListPage/PricesListPage';
import { PriceFormPage } from '../../../pages/actualization/PriceFormPage/PriceFormPage';
import { PriceDetailPage } from '../../../pages/actualization/PriceDetailPage/PriceDetailPage';

/**
 * Маршруты для актуализации
 */
export function createActualizationRoutes() {
  return (
    <>
      <Route path="actualization" element={<ActualizationPage />}>
        <Route index element={<Navigate to="/actualization/prices" replace />} />
        <Route path="prices" element={<PricesListPage />} />
        <Route path="prices/create" element={<PriceFormPage />} />
        <Route path="prices/:priceId/edit" element={<PriceFormPage />} />
        <Route path="prices/:priceId" element={<PriceDetailPage />} />
        <Route path="colors" element={<ColorsListPage />} />
        <Route path="colors/create" element={<ColorFormPage />} />
        <Route path="colors/:colorName/edit" element={<ColorFormPage />} />
        <Route path="colors/:colorName" element={<ColorDetailPage />} />
        <Route path="logs" element={<ActualizationPage />} />
      </Route>
    </>
  );
}
