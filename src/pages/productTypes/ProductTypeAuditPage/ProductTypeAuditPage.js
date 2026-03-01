import { useParams } from 'react-router-dom';
import { AuditPage } from '../../../shared/ui/AuditPage';
import { getProductTypeAuditRequest } from '../api/productTypesApi';

export function ProductTypeAuditPage() {
  const { productTypeId } = useParams();

  const fetchAudit = (params) =>
    getProductTypeAuditRequest({
      product_type_id: productTypeId,
      ...params,
    });

  return (
    <AuditPage
      title="История изменений типа продукта"
      backUrl={`/catalog/device_type/${productTypeId}`}
      fetchAudit={fetchAudit}
    />
  );
}
