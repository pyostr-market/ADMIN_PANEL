import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { SidebarItemLink } from './SidebarItemLink';
import styles from './AppSidebar.module.css';

/**
 * Группа меню сайдбара с раскрывающимся списком
 * @component
 *
 * @param {Object} props
 * @param {string} props.groupKey - Ключ группы
 * @param {Object} props.group - Конфигурация группы
 * @param {boolean} props.isOpen - Раскрыта ли группа
 * @param {boolean} props.collapsed - Сайдбар свёрнут
 * @param {Function} props.onToggle - Обработчик переключения раскрытия
 * @param {Function} props.getIcon - Функция получения иконки по имени
 */
export function SidebarGroup({ groupKey, group, isOpen, collapsed, onToggle, getIcon }) {
  const Icon = getIcon(group.icon);

  return (
    <div className={styles.sidebarGroup}>
      <button
        type="button"
        className={styles.sidebarGroupTrigger}
        title={collapsed ? group.title : undefined}
        onClick={() => onToggle(groupKey)}
        aria-expanded={isOpen}
      >
        <span className={styles.sidebarLinkIcon} aria-hidden="true">
          <Icon />
        </span>
        {!collapsed && <span>{group.title}</span>}
        {!collapsed && (
          <span className={styles.sidebarGroupChevron} aria-hidden="true">
            {isOpen ? <FiChevronDown /> : <FiChevronRight />}
          </span>
        )}
      </button>

      {isOpen && !collapsed && (
        <div className={styles.sidebarGroupItems}>
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
}
