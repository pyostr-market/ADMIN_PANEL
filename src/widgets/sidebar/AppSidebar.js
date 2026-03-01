import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiMoon, FiSun } from 'react-icons/fi';
import { useSession } from '../../entities/session/model/SessionProvider';
import { NAVIGATION_CONFIG } from '../../shared/config/navigation';
import { Icons } from '../../shared/config/navigation-icons';
import { hasPermission } from '../../shared/lib/permissions/permissions';
import './AppSidebar.css';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'market-admin:sidebar-collapsed';
const THEME_STORAGE_KEY = 'market-admin:theme';

// Конфигурация прав для групп меню
const MENU_PERMISSIONS = {
  crm: ['users', 'users:view', 'admin:user', 'admin:user:view', 'permission', 'permission:view', 'admin:group:create', 'admin:group:update', 'admin:group:delete', 'admin:group:view'],
  catalog: ['product', 'product:view', 'manufacturer', 'manufacturer:view', 'device_type', 'device-type:view', 'product_type', 'product_type:view'],
  warehouse: ['warehouse', 'warehouse:view'],
  billing: ['billing'],
};

/**
 * Проверяет, есть ли у пользователя доступ к группе меню
 */
function hasMenuPermission(userPermissions, groupKey) {
  const requiredPermissions = MENU_PERMISSIONS[groupKey];
  
  // Если прав нет в конфиге, показываем всегда
  if (!requiredPermissions) {
    return true;
  }
  
  return hasPermission(userPermissions, requiredPermissions, 'any');
}

function SidebarItemLink({ to, label, Icon, collapsed }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link--active' : ''}`}
    >
      <span className="sidebar-link__icon" aria-hidden="true">
        <Icon />
      </span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

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

  return (
    <aside
      className={`sidebar-panel${collapsed ? ' sidebar-panel--collapsed' : ''}`}
      aria-label="Навигация по разделам"
    >
      <div className="sidebar-panel__header">
        {!collapsed && <h2>Разделы</h2>}
        <button
          type="button"
          className="sidebar-panel__collapse-btn"
          aria-label={collapsed ? 'Развернуть сайдбар' : 'Свернуть сайдбар'}
          onClick={handleCollapseToggle}
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      <nav className="sidebar-panel__nav">
        {/* Профиль */}
        <SidebarItemLink
          to={NAVIGATION_CONFIG.footer.find((i) => i.icon === 'profile')?.path || '/profile'}
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
          const Icon = getIcon(group.icon);

          return (
            <div key={groupKey} className="sidebar-group">
              <button
                type="button"
                className="sidebar-group__trigger"
                title={collapsed ? group.title : undefined}
                onClick={() => toggleGroup(groupKey)}
                aria-expanded={isOpen}
              >
                <span className="sidebar-link__icon" aria-hidden="true">
                  <Icon />
                </span>
                {!collapsed && <span>{group.title}</span>}
                {!collapsed && (
                  <span className="sidebar-group__chevron" aria-hidden="true">
                    {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                  </span>
                )}
              </button>

              {isOpen && !collapsed && (
                <div className="sidebar-group__items">
                  {group.items.map((item) => (
                    <SidebarItemLink
                      key={item.path}
                      to={item.path}
                      label={item.label}
                      Icon={getIcon(item.icon)}
                      collapsed={collapsed}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-panel__footer">
        <button
          type="button"
          className="sidebar-panel__theme-btn"
          aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
          onClick={toggleTheme}
          title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
        >
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>
      </div>
    </aside>
  );
}
