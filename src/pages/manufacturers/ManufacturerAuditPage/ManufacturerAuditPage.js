import { useParams } from 'react-router-dom';
import { AuditPage } from '../../../shared/ui/AuditPage';
import { getManufacturerAuditRequest } from '../api/manufacturersApi';

export function ManufacturerAuditPage() {
  const { manufacturerId } = useParams();

  const fetchAudit = (params) =>
    getManufacturerAuditRequest({
      manufacturer_id: manufacturerId,
      ...params,
    });

  return (
    <AuditPage
      title="История изменений производителя"
      backUrl={`/catalog/manufacturers/${manufacturerId}`}
      fetchAudit={fetchAudit}
    />
  );
}
