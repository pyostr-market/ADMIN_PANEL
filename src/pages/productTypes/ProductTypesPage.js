import { CrudPageTemplate } from '../../shared/ui/CrudPageTemplate';
import { productTypesConfig } from '../../shared/config/crudConfigs';

export function ProductTypesPage() {
  return (
    <CrudPageTemplate
      title="Типы продуктов"
      config={productTypesConfig}
    />
  );
}
