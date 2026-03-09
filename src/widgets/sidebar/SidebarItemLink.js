import { useLocation, NavLink } from 'react-router-dom';
import styles from './AppSidebar.module.css';

/**
 * Ссылка элемента меню сайдбара
 * @component
 *
 * @param {Object} props
 * @param {string} props.to - URL ссылки
 * @param {string} props.label - Текст ссылки
 * @param {React.ComponentType} props.Icon - Компонент иконки
 * @param {boolean} props.collapsed - Сайдбар свёрнут
 */
export function SidebarItemLink({ to, label, Icon, collapsed }) {
  const location = useLocation();
  
  // Точная проверка активного пути
  const isActive = location.pathname === to || location.pathname === to + '/';

  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={`${styles.sidebarLink}${isActive ? ` ${styles.sidebarLinkActive}` : ''}`}
    >
      <span className={styles.sidebarLinkIcon} aria-hidden="true">
        <Icon />
      </span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}
