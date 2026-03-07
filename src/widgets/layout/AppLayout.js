import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../../entities/session/model/SessionProvider';
import { NotificationsPanel } from './NotificationsPanel';
import { AppSidebar } from '../sidebar/AppSidebar';
import { BottomNav } from './BottomNav';
import styles from './AppLayout.module.css';

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
    <div className={`${styles.appShell}${sidebarCollapsed ? ` ${styles.appShellCollapsed}` : ''}`}>
      <AppSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />

      <div className={styles.appShellMain}>
        {/* Десктопная шапка */}
        <header className={styles.appShellHeader}>
          <nav className={styles.appShellNav}>
            <Link to="/">Главная</Link>
            <Link to="/support">Поддержка</Link>
          </nav>
          <button type="button" onClick={logout}>
            Выйти
          </button>
        </header>

        <main className={styles.appShellContent}>
          <NotificationsPanel />
          <Outlet />
        </main>

        {/* Нижняя навигация для мобильных */}
        <BottomNav currentPath={location.pathname} />
      </div>
    </div>
  );
}
