import { useParams } from 'react-router-dom';
import { AuditPage } from '../../../shared/ui/AuditPage';
import { getProductAuditRequest } from '../api/productsApi';

export function ProductAuditPage() {
  const { productId } = useParams();

  const fetchAudit = (params) =>
    getProductAuditRequest({
      product_id: productId,
      ...params,
    });

  return (
    <AuditPage
      title="История изменений товара"
      backUrl={`/catalog/products/${productId}`}
      fetchAudit={fetchAudit}
    />
  );
}
