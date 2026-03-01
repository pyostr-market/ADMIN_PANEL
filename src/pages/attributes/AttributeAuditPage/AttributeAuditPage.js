import { useParams } from 'react-router-dom';
import { AuditPage } from '../../../shared/ui/AuditPage';
import { getAttributeAuditRequest } from '../api/attributesApi';

export function AttributeAuditPage() {
  const { attributeId } = useParams();

  const fetchAudit = (params) =>
    getAttributeAuditRequest({
      attribute_id: attributeId,
      ...params,
    });

  return (
    <AuditPage
      title="История изменений атрибута"
      backUrl={`/catalog/attributes/${attributeId}`}
      fetchAudit={fetchAudit}
    />
  );
}
