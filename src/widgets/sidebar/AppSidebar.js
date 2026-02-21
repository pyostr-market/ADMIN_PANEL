import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiBox,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiLayers,
  FiMoon,
  FiSettings,
  FiSun,
  FiTruck,
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiTag,
} from 'react-icons/fi';
import { useSession } from '../../entities/session/model/SessionProvider';
import { hasPermission } from '../../shared/lib/permissions/permissions';
import './AppSidebar.css';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'market-admin:sidebar-collapsed';
const THEME_STORAGE_KEY = 'market-admin:theme';

const PERMISSIONS = {
  usersList: ['users', 'users:view', 'admin:user', 'admin:user:view'],
  permissionsGroups: [
    'permission:view',
    'permission:update',
    'admin:group:create',
    'admin:group:update',
    'admin:group:delete',
    'admin:group:view',
  ],
  products: ['product', 'product:view'],
  suppliers: ['supplier', 'supplier:view'],
  manufacturers: ['manufacturer', 'manufacturer:view'],
  deviceTypes: ['device_type', 'device_type:view', 'product_type', 'product_type:view'],
};

const catalogItems = [
  {
    id: 'products',
    label: 'Товары',
    icon: FiShoppingBag,
    to: '/catalog/products',
    permission: PERMISSIONS.products,
  },
  {
    id: 'manufacturers',
    label: 'Производители',
    icon: FiPackage,
    to: '/catalog/manufacturers',
    permission: PERMISSIONS.manufacturers,
  },
  {
    id: 'device_type',
    label: 'Типы устройств',
    icon: FiTag,
    to: '/catalog/device_type',
    permission: PERMISSIONS.deviceTypes,
  },
];

function SidebarItemLink({ to, label, icon: Icon, collapsed }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link--active' : ''}`}
    >
      <span className="sidebar-link__icon" aria-hidden="true"><Icon /></span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

export function AppSidebar({ collapsed, onCollapse }) {
  const location = useLocation();
  const { permissions } = useSession();
  const catalogHoverTimerRef = useRef(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    return window.localStorage.getItem(THEME_STORAGE_KEY) || 'light';
  });
  const [isCatalogOpen, setCatalogOpen] = useState(location.pathname.startsWith('/catalog'));
  const [isUsersOpen, setUsersOpen] = useState(location.pathname.startsWith('/users'));

  useEffect(() => {
    if (location.pathname.startsWith('/catalog')) {
      setCatalogOpen(true);
    }
    if (location.pathname.startsWith('/users')) {
      setUsersOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleCollapseToggle = () => {
    onCollapse((prev) => !prev);
  };

  useEffect(
    () => () => {
      if (catalogHoverTimerRef.current) {
        window.clearTimeout(catalogHoverTimerRef.current);
      }
    },
    [],
  );

  const visibleCatalogItems = useMemo(
    () => catalogItems.filter((item) => hasPermission(permissions, item.permission, 'any')),
    [permissions],
  );

  const canSeeUsersList = hasPermission(permissions, PERMISSIONS.usersList, 'any');
  const canSeePermissionsGroups = hasPermission(permissions, PERMISSIONS.permissionsGroups, 'any');
  const canSeeSuppliers = hasPermission(permissions, PERMISSIONS.suppliers, 'any');
  const canSeeCatalog = visibleCatalogItems.length > 0;
  const canSeeUsersGroup = canSeeUsersList || canSeePermissionsGroups;

  const handleCatalogMouseEnter = () => {
    if (collapsed) {
      return;
    }

    if (catalogHoverTimerRef.current) {
      window.clearTimeout(catalogHoverTimerRef.current);
    }

    catalogHoverTimerRef.current = window.setTimeout(() => {
      setCatalogOpen(true);
      catalogHoverTimerRef.current = null;
    }, 1000);
  };

  const handleCatalogMouseLeave = () => {
    if (catalogHoverTimerRef.current) {
      window.clearTimeout(catalogHoverTimerRef.current);
      catalogHoverTimerRef.current = null;
    }
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
        {canSeeUsersGroup && (
          <div className="sidebar-group">
            <button
              type="button"
              className="sidebar-group__trigger"
              title={collapsed ? 'Пользователи' : undefined}
              onClick={() => setUsersOpen((prev) => !prev)}
              aria-expanded={isUsersOpen}
            >
              <span className="sidebar-link__icon" aria-hidden="true"><FiUsers /></span>
              {!collapsed && <span>Пользователи</span>}
              {!collapsed && (
                <span className="sidebar-group__chevron" aria-hidden="true">
                  {isUsersOpen ? <FiChevronDown /> : <FiChevronRight />}
                </span>
              )}
            </button>

            {isUsersOpen && !collapsed && (
              <div className="sidebar-group__items">
                {canSeeUsersList && (
                  <SidebarItemLink to="/users" label="Список пользователей" icon={FiUsers} collapsed={collapsed} />
                )}
                {canSeePermissionsGroups && (
                  <SidebarItemLink to="/users/permissions-groups" label="Права и группы" icon={FiSettings} collapsed={collapsed} />
                )}
              </div>
            )}
          </div>
        )}

        {canSeeCatalog && (
          <div
            className="sidebar-group"
            onMouseEnter={handleCatalogMouseEnter}
            onMouseLeave={handleCatalogMouseLeave}
          >
            <button
              type="button"
              className="sidebar-group__trigger"
              title={collapsed ? 'Каталог' : undefined}
              onClick={() => setCatalogOpen((prev) => !prev)}
              aria-expanded={isCatalogOpen}
            >
              <span className="sidebar-link__icon" aria-hidden="true"><FiGrid /></span>
              {!collapsed && <span>Каталог</span>}
              {!collapsed && (
                <span className="sidebar-group__chevron" aria-hidden="true">
                  {isCatalogOpen ? <FiChevronDown /> : <FiChevronRight />}
                </span>
              )}
            </button>

            {isCatalogOpen && !collapsed && (
              <div className="sidebar-group__items">
                {visibleCatalogItems.map((item) => (
                  <SidebarItemLink
                    key={item.id}
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {canSeeSuppliers && (
          <SidebarItemLink to="/suppliers" label="Поставщики" icon={FiTruck} collapsed={collapsed} />
        )}

        {!canSeeUsersGroup && !canSeeSuppliers && !canSeeCatalog && (
          <p className="sidebar-panel__empty">Нет доступных разделов.</p>
        )}
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
