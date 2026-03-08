import { Route } from 'react-router-dom';
import { PagesListPage } from '../../../pages/cms/PagesListPage/PagesListPage';
import { PageFormPage } from '../../../pages/cms/PageFormPage/PageFormPage';
import { PageDetailPage } from '../../../pages/cms/PageDetailPage/PageDetailPage';
import { PageAuditPage } from '../../../pages/cms/PageAuditPage/PageAuditPage';
import { FaqListPage } from '../../../pages/cms/FaqListPage/FaqListPage';
import { FaqFormPage } from '../../../pages/cms/FaqFormPage/FaqFormPage';
import { FaqDetailPage } from '../../../pages/cms/FaqDetailPage/FaqDetailPage';
import { SeoListPage } from '../../../pages/cms/SeoListPage/SeoListPage';
import { SeoFormPage } from '../../../pages/cms/SeoFormPage/SeoFormPage';
import { SeoDetailPage } from '../../../pages/cms/SeoDetailPage/SeoDetailPage';
import { EmailTemplatesListPage } from '../../../pages/cms/EmailTemplatesListPage/EmailTemplatesListPage';
import { EmailTemplateFormPage } from '../../../pages/cms/EmailTemplateFormPage/EmailTemplateFormPage';
import { EmailTemplateDetailPage } from '../../../pages/cms/EmailTemplateDetailPage/EmailTemplateDetailPage';
import { FeatureFlagsListPage } from '../../../pages/cms/FeatureFlagsListPage/FeatureFlagsListPage';
import { FeatureFlagFormPage } from '../../../pages/cms/FeatureFlagFormPage/FeatureFlagFormPage';
import { FeatureFlagDetailPage } from '../../../pages/cms/FeatureFlagDetailPage/FeatureFlagDetailPage';

/**
 * Маршруты для CMS
 */
export function createCmsRoutes() {
  return (
    <>
      {/* Pages */}
      <Route path="cms/pages" element={<PagesListPage />} />
      <Route path="cms/pages/create" element={<PageFormPage />} />
      <Route path="cms/pages/:pageId" element={<PageDetailPage />} />
      <Route path="cms/pages/:pageId/edit" element={<PageFormPage />} />
      <Route path="cms/pages/:pageId/audit" element={<PageAuditPage />} />

      {/* FAQ */}
      <Route path="cms/faq" element={<FaqListPage />} />
      <Route path="cms/faq/create" element={<FaqFormPage />} />
      <Route path="cms/faq/:faqId" element={<FaqDetailPage />} />
      <Route path="cms/faq/:faqId/edit" element={<FaqFormPage />} />

      {/* SEO */}
      <Route path="cms/seo" element={<SeoListPage />} />
      <Route path="cms/seo/create" element={<SeoFormPage />} />
      <Route path="cms/seo/:seoId" element={<SeoDetailPage />} />
      <Route path="cms/seo/:seoId/edit" element={<SeoFormPage />} />

      {/* Email Templates */}
      <Route path="cms/email-templates" element={<EmailTemplatesListPage />} />
      <Route path="cms/email-templates/create" element={<EmailTemplateFormPage />} />
      <Route path="cms/email-templates/:templateId" element={<EmailTemplateDetailPage />} />
      <Route path="cms/email-templates/:templateId/edit" element={<EmailTemplateFormPage />} />

      {/* Feature Flags */}
      <Route path="cms/feature-flags" element={<FeatureFlagsListPage />} />
      <Route path="cms/feature-flags/create" element={<FeatureFlagFormPage />} />
      <Route path="cms/feature-flags/:flagId" element={<FeatureFlagDetailPage />} />
      <Route path="cms/feature-flags/:flagId/edit" element={<FeatureFlagFormPage />} />
    </>
  );
}
