import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../../entities/session/model/SessionProvider';
import { NotificationsPanel } from './NotificationsPanel';
import { AppSidebar } from '../sidebar/AppSidebar';
import { BottomNav } from './BottomNav';
import './AppLayout.css';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'market-admin:sidebar-collapsed';

export function AppLayout() {
  const { logout } = useSession();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === '1';
  });

  return (
    <div className={`app-shell${sidebarCollapsed ? ' app-shell--collapsed' : ''}`}>
      <AppSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />

      <div className="app-shell__main">
        {/* Десктопная шапка */}
        <header className="app-shell__header">
          <nav className="app-shell__nav">
            <Link to="/">Главная</Link>
            <Link to="/support">Поддержка</Link>
          </nav>
          <button type="button" onClick={logout}>
            Выйти
          </button>
        </header>

        <main className="app-shell__content">
          <NotificationsPanel />
          <Outlet />
        </main>

        {/* Нижняя навигация для мобильных */}
        <BottomNav currentPath={location.pathname} />
      </div>
    </div>
  );
}
