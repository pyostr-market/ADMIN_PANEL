import { FiMoon, FiSun } from 'react-icons/fi';
import styles from './AppSidebar.module.css';

/**
 * Кнопка переключения темы сайдбара
 * @component
 *
 * @param {Object} props
 * @param {string} props.theme - Текущая тема ('light' | 'dark')
 * @param {Function} props.onToggle - Обработчик переключения темы
 */
export function SidebarThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className={styles.sidebarPanelThemeBtn}
      aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
      onClick={onToggle}
      title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
    >
      {theme === 'light' ? <FiMoon /> : <FiSun />}
    </button>
  );
}
