import { useParams } from 'react-router-dom';
import { AuditPage } from '../../../shared/ui/AuditPage';
import { getSupplierAuditRequest } from '../api/suppliersApi';

export function SupplierAuditPage() {
  const { supplierId } = useParams();

  const fetchAudit = (params) =>
    getSupplierAuditRequest({
      supplier_id: supplierId,
      ...params,
    });

  return (
    <AuditPage
      title="История изменений поставщика"
      backUrl={`/suppliers/${supplierId}`}
      fetchAudit={fetchAudit}
    />
  );
}
