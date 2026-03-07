import { NavLink } from 'react-router-dom';
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
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) => `${styles.sidebarLink}${isActive ? ` ${styles.sidebarLinkActive}` : ''}`}
    >
      <span className={styles.sidebarLinkIcon} aria-hidden="true">
        <Icon />
      </span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}
