import { Route } from 'react-router-dom';
import { WarehousePage } from '../../../pages/warehouse/WarehousePage';
import { StockPage } from '../../../pages/warehouse/StockPage';
import { StockMovementsPage } from '../../../pages/warehouse/StockMovementsPage';
import { InventoryPage } from '../../../pages/warehouse/InventoryPage';

/**
 * Маршруты для склада
 */
export function createWarehouseRoutes() {
  return (
    <>
      <Route path="warehouse" element={<WarehousePage />} />
      <Route path="warehouse/stock" element={<StockPage />} />
      <Route path="warehouse/movements" element={<StockMovementsPage />} />
      <Route path="warehouse/inventory" element={<InventoryPage />} />
    </>
  );
}
