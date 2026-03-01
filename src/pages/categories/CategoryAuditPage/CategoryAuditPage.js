import { useParams } from 'react-router-dom';
import { AuditPage } from '../../../shared/ui/AuditPage';
import { getCategoryAuditRequest } from '../api/categoryApi';

export function CategoryAuditPage() {
  const { categoryId } = useParams();

  const fetchAudit = (params) =>
    getCategoryAuditRequest({
      category_id: categoryId,
      ...params,
    });

  return (
    <AuditPage
      title="История изменений категории"
      backUrl={`/categories/${categoryId}`}
      fetchAudit={fetchAudit}
    />
  );
}
