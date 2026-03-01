import { useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Tabs, Tab } from '../../../shared/ui/Tabs/Tabs';
import styles from './ActualizationPage.module.css';

const TABS = [
  { id: 'actualization', label: 'Актуализация', path: '/actualization' },
  { id: 'colors', label: 'Цвета', path: '/actualization/colors' },
  { id: 'logs', label: 'Логи', path: '/actualization/logs' },
];

export function ActualizationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useCallback(() => {
    const pathname = location.pathname;
    const tab = TABS.find(t => pathname === t.path);
    return tab?.id || null;
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

      {currentTab === 'actualization' && (
        <div className={styles.tabContent}>
          <div className={styles.emptyState}>
            <h2>Актуализация</h2>
            <p>Страница находится в разработке</p>
          </div>
        </div>
      )}

      {currentTab === 'logs' && (
        <div className={styles.tabContent}>
          <div className={styles.emptyState}>
            <h2>Логи</h2>
            <p>Страница находится в разработке</p>
          </div>
        </div>
      )}

      <Outlet />
    </section>
  );
}
