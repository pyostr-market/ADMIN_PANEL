import { useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Tabs, Tab } from '../../../shared/ui/Tabs/Tabs';
import styles from './ActualizationPage.module.css';

const TABS = [
  { id: 'actualization', label: 'Актуализация', path: '/actualization/actualization' },
  { id: 'prices', label: 'Прайсы', path: '/actualization/prices' },
  { id: 'colors', label: 'Цвета', path: '/actualization/colors' },
  { id: 'logs', label: 'Логи', path: '/actualization/logs' },
];

export function ActualizationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useCallback(() => {
    const pathname = location.pathname;
    // Определяем активную вкладку по пути
    if (pathname === '/actualization' || pathname === '/actualization/actualization' || pathname.startsWith('/actualization/actualization/')) {
      return 'actualization';
    }
    if (pathname === '/actualization/prices' || pathname.startsWith('/actualization/prices/')) {
      return 'prices';
    }
    if (pathname === '/actualization/colors' || pathname.startsWith('/actualization/colors/')) {
      return 'colors';
    }
    if (pathname === '/actualization/logs') {
      return 'logs';
    }
    return null;
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    const tab = TABS.find(t => t.id === tabId);
    if (tab) {
      navigate(tab.path);
    }
  };

  const currentTab = activeTab();

  return (
    <section className={styles.actualizationPage}>
      <Tabs className={styles.actualizationTabs}>
        {TABS.map(tab => (
          <Tab
            key={tab.id}
            active={currentTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </Tab>
        ))}
      </Tabs>

      <Outlet />
    </section>
  );
}
