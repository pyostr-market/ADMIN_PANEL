import { Route } from 'react-router-dom';
import { CategoryPricingPoliciesPage } from '../../../pages/billing/CategoryPricingPoliciesPage/CategoryPricingPoliciesPage';
import { CategoryPricingPolicyDetailPage } from '../../../pages/billing/CategoryPricingPolicyDetailPage/CategoryPricingPolicyDetailPage';
import { CategoryPricingPolicyFormPage } from '../../../pages/billing/CategoryPricingPolicyFormPage/CategoryPricingPolicyFormPage';
import { CategoryPricingPolicyAuditPage } from '../../../pages/billing/CategoryPricingPolicyAuditPage/CategoryPricingPolicyAuditPage';
import { PrivateRoute } from '../routeGuards';

/**
 * Маршруты для биллинга
 */
export function createBillingRoutes() {
  return (
    <>
      <Route
        element={<PrivateRoute permission={['billing']} mode="any" />}
      >
        <Route path="billing/pricing-policies" element={<CategoryPricingPoliciesPage />} />
        <Route path="billing/pricing-policies/create" element={<CategoryPricingPolicyFormPage />} />
        <Route path="billing/pricing-policies/:pricingPolicyId/edit" element={<CategoryPricingPolicyFormPage />} />
        <Route path="billing/pricing-policies/:pricingPolicyId" element={<CategoryPricingPolicyDetailPage />} />
        <Route path="billing/pricing-policies/:pricingPolicyId/audit" element={<CategoryPricingPolicyAuditPage />} />
      </Route>
    </>
  );
}
