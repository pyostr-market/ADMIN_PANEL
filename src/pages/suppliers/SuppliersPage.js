import { CrudPageTemplate } from '../../shared/ui/CrudPageTemplate';
import { suppliersConfig } from '../../shared/config/crudConfigs';

export function SuppliersPage() {
  return (
    <CrudPageTemplate
      title="Поставщики"
      config={suppliersConfig}
    />
  );
}
