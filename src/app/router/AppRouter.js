import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { LoginPage } from '../../pages/login/LoginPage/LoginPage';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';
import { SupportPage } from '../../pages/support/SupportPage';
import { ErrorPage } from '../../pages/errors/ErrorPage/ErrorPage';
import { ProfilePage } from '../../pages/profile/ProfilePage';
import { PrivateRoute, PublicOnlyRoute } from './routeGuards';

// Модули маршрутов
import { createUsersRoutes } from './routes/users.routes';
import { createSuppliersRoutes } from './routes/suppliers.routes';
import { createCatalogRoutes } from './routes/catalog.routes';
import { createCrmRoutes } from './routes/crm.routes';
import { createWarehouseRoutes } from './routes/warehouse.routes';
import { createBillingRoutes } from './routes/billing.routes';
import { createActualizationRoutes } from './routes/actualization.routes';
import { createCmsRoutes } from './routes/cms.routes';

function ErrorPageByCode() {
  const { code } = useParams();
  return <ErrorPage code={code} />;
}

export function AppRouter() {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Общедоступные маршруты */}
      <Route path="/support" element={<SupportPage />} />
      <Route path="/error/:code" element={<ErrorPageByCode />} />

      {/* Приватные маршруты */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          {/* Главная */}
          <Route index element={<DashboardPage />} />

          {/* Профиль */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Пользователи и группы доступа */}
          {createUsersRoutes()}

          {/* Поставщики */}
          {createSuppliersRoutes()}

          {/* Каталог */}
          {createCatalogRoutes()}

          {/* CRM */}
          {createCrmRoutes()}

          {/* Актуализация */}
          {createActualizationRoutes()}

          {/* Склад */}
          {createWarehouseRoutes()}

          {/* Биллинг */}
          {createBillingRoutes()}

          {/* CMS */}
          {createCmsRoutes()}
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/error/404" replace />} />
    </Routes>
  );
}
