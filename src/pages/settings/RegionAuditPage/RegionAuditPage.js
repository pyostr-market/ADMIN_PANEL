import { useParams } from 'react-router-dom';
import { AuditPage } from '../../../shared/ui/AuditPage';
import { getRegionAuditRequest } from '../api/regionsApi';

export function RegionAuditPage() {
  const { regionId } = useParams();

  const fetchAudit = (params) =>
    getRegionAuditRequest({
      region_id: regionId,
      ...params,
    });

  return (
    <AuditPage
      title="История изменений региона"
      backUrl={`/settings/regions/${regionId}`}
      fetchAudit={fetchAudit}
    />
  );
}
