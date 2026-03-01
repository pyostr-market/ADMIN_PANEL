import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

  const getActiveTab = useCallback(() => {
    const pathname = location.pathname;
    const tab = TABS.find(t => pathname === t.path || pathname.startsWith(t.path + '/'));
    return tab?.id || 'actualization';
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState(getActiveTab());

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const tab = TABS.find(t => t.id === tabId);
    if (tab) {
      navigate(tab.path);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'actualization':
        return (
          <div className={styles.tabContent}>
            <div className={styles.emptyState}>
              <h2>Актуализация</h2>
              <p>Страница находится в разработке</p>
            </div>
          </div>
        );
      case 'colors':
        return null; // Контент рендерится через роутинг
      case 'logs':
        return (
          <div className={styles.tabContent}>
            <div className={styles.emptyState}>
              <h2>Логи</h2>
              <p>Страница находится в разработке</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className={styles.actualizationPage}>
      <Tabs className={styles.actualizationTabs}>
        {TABS.map(tab => (
          <Tab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </Tab>
        ))}
      </Tabs>

      {renderTabContent()}
    </section>
  );
}
