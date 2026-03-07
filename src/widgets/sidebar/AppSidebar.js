import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import { useSession } from '../../entities/session/model/SessionProvider';
import { NAVIGATION_CONFIG } from '../../shared/config/navigation';
import { Icons } from '../../shared/config/navigation-icons';
import { hasMenuPermission } from '../../shared/config/menuPermissions';
import { SidebarItemLink } from './SidebarItemLink';
import { SidebarGroup } from './SidebarGroup';
import { SidebarThemeToggle } from './SidebarThemeToggle';
import styles from './AppSidebar.module.css';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'market-admin:sidebar-collapsed';
const THEME_STORAGE_KEY = 'market-admin:theme';

export function AppSidebar({ collapsed, onCollapse }) {
  const location = useLocation();
  const { permissions } = useSession();
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    return window.localStorage.getItem(THEME_STORAGE_KEY) || 'light';
  });

  // Состояния для раскрытия групп
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const initial = {};
    Object.keys(NAVIGATION_CONFIG).forEach((key) => {
      if (key !== 'footer' && key !== 'additional') {
        initial[key] = location.pathname.startsWith(
          NAVIGATION_CONFIG[key].items[0]?.path.split('/')[1] || ''
        );
      }
    });
    return initial;
  });

  useEffect(() => {
    // Обновляем раскрытые группы на основе текущего пути
    const newExpanded = { ...expandedGroups };
    Object.keys(NAVIGATION_CONFIG).forEach((key) => {
      if (key !== 'footer' && key !== 'additional') {
        const menu = NAVIGATION_CONFIG[key];
        const isPathInGroup = menu.items.some((item) =>
          location.pathname.startsWith(item.path)
        );
        if (isPathInGroup) {
          newExpanded[key] = true;
        }
      }
    });
    setExpandedGroups(newExpanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleCollapseToggle = () => {
    onCollapse((prev) => !prev);
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  // Получаем иконку по имени
  const getIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent || Icons.catalog;
  };

  const profilePath = NAVIGATION_CONFIG.footer.find((i) => i.icon === 'profile')?.path || '/profile';

  return (
    <aside
      className={`${styles.sidebarPanel}${collapsed ? ` ${styles.sidebarPanelCollapsed}` : ''}`}
      aria-label="Навигация по разделам"
    >
      <div className={styles.sidebarPanelHeader}>
        {!collapsed && <h2>Разделы</h2>}
        <button
          type="button"
          className={styles.sidebarPanelCollapseBtn}
          aria-label={collapsed ? 'Развернуть сайдбар' : 'Свернуть сайдбар'}
          onClick={handleCollapseToggle}
        >
          <FiChevronLeft />
        </button>
      </div>

      <nav className={styles.sidebarPanelNav}>
        {/* Профиль */}
        <SidebarItemLink
          to={profilePath}
          label="Профиль"
          Icon={getIcon('profile')}
          collapsed={collapsed}
        />

        {/* Динамические группы меню с проверкой прав */}
        {Object.keys(NAVIGATION_CONFIG).map((groupKey) => {
          if (groupKey === 'footer' || groupKey === 'additional') return null;

          // Проверяем права доступа к группе
          if (!hasMenuPermission(permissions, groupKey)) {
            return null;
          }

          const group = NAVIGATION_CONFIG[groupKey];
          const isOpen = expandedGroups[groupKey] || false;

          return (
            <SidebarGroup
              key={groupKey}
              groupKey={groupKey}
              group={group}
              isOpen={isOpen}
              collapsed={collapsed}
              onToggle={toggleGroup}
              getIcon={getIcon}
            />
          );
        })}
      </nav>

      <div className={styles.sidebarPanelFooter}>
        <SidebarThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>
    </aside>
  );
}
