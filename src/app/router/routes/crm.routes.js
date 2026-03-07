import { Route } from 'react-router-dom';
import { CrmPage } from '../../../pages/crm/CrmPage';
import { OrdersPage } from '../../../pages/crm/OrdersPage';
import { CustomersPage } from '../../../pages/crm/CustomersPage';
import { TicketsPage } from '../../../pages/crm/TicketsPage';

/**
 * Маршруты для CRM
 */
export function createCrmRoutes() {
  return (
    <>
      <Route path="crm" element={<CrmPage />} />
      <Route path="crm/orders" element={<OrdersPage />} />
      <Route path="crm/customers" element={<CustomersPage />} />
      <Route path="crm/tickets" element={<TicketsPage />} />
    </>
  );
}
