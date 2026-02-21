import { CrudPageTemplate } from '../../shared/ui/CrudPageTemplate';
import { manufacturersConfig } from '../../shared/config/crudConfigs';

export function ManufacturersPage() {
  return (
    <CrudPageTemplate
      title="Производители"
      config={manufacturersConfig}
    />
  );
}
