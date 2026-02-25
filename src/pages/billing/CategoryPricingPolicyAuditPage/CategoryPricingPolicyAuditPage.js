import { useParams } from 'react-router-dom';
import { AuditPage } from '../../../shared/ui/AuditPage/AuditPage';
import { getCategoryPricingPolicyAuditRequest } from '../api/categoryPricingPolicyApi';

export function CategoryPricingPolicyAuditPage() {
  const { pricingPolicyId } = useParams();

  const fetchAudit = (params) =>
    getCategoryPricingPolicyAuditRequest({
      pricing_policy_id: pricingPolicyId,
      ...params,
    });

  return (
    <AuditPage
      title="История изменений тарифа категории"
      backUrl={`/billing/pricing-policies/${pricingPolicyId}`}
      fetchAudit={fetchAudit}
    />
  );
}
