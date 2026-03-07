import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NAVIGATION_CONFIG, isActivePath } from '../../shared/config/navigation';
import { Icons } from '../../shared/config/navigation-icons';
import styles from '../../shared/styles/BottomNav.module.css';

export function BottomNav({ currentPath }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const closeMenu = () => {
    setActiveMenu(null);
  };

  const toggleTheme = () => {
    const newTheme = isDarkTheme ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    setIsDarkTheme(!isDarkTheme);
  };

  const handleFooterAction = (item) => {
    if (item.action === 'toggle-theme') {
      toggleTheme();
    }
  };

  const renderIcon = (iconName, size = 20) => {
    const IconComponent = Icons[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={size} />;
  };

  return (
    <>
      {/* Нижняя навигация */}
      <nav className={styles.bottomNav}>
        <ul className={styles.bottomNavList}>
          <li className={styles.bottomNavItem}>
            <button
              className={`${styles.bottomNavButton} ${activeMenu === 'crm' ? styles.bottomNavButtonActive : ''}`}
              onClick={() => toggleMenu('crm')}
            >
              {renderIcon('crm', 22)}
              <span className={styles.bottomNavLabel}>{NAVIGATION_CONFIG.crm.title}</span>
            </button>
          </li>
          <li className={styles.bottomNavItem}>
            <button
              className={`${styles.bottomNavButton} ${activeMenu === 'catalog' ? styles.bottomNavButtonActive : ''}`}
              onClick={() => toggleMenu('catalog')}
            >
              {renderIcon('catalog', 22)}
              <span className={styles.bottomNavLabel}>{NAVIGATION_CONFIG.catalog.title}</span>
            </button>
          </li>
          <li className={styles.bottomNavItem}>
            <button
              className={`${styles.bottomNavButton} ${activeMenu === 'warehouse' ? styles.bottomNavButtonActive : ''}`}
              onClick={() => toggleMenu('warehouse')}
            >
              {renderIcon('warehouse', 22)}
              <span className={styles.bottomNavLabel}>{NAVIGATION_CONFIG.warehouse.title}</span>
            </button>
          </li>
          <li className={styles.bottomNavItem}>
            <button
              className={`${styles.bottomNavButton} ${activeMenu === 'billing' ? styles.bottomNavButtonActive : ''}`}
              onClick={() => toggleMenu('billing')}
            >
              {renderIcon('billing', 22)}
              <span className={styles.bottomNavLabel}>{NAVIGATION_CONFIG.billing.title}</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Мобильные сайдбары */}
      {['crm', 'catalog', 'warehouse', 'billing'].map((menuKey) => {
        const menu = NAVIGATION_CONFIG[menuKey];
        return (
          <div
            key={menuKey}
            className={`${styles.mobileSidebar} ${activeMenu === menuKey ? styles.mobileSidebarOpen : ''}`}
          >
            <div className={styles.mobileSidebarHeader}>
              <h3 className={styles.mobileSidebarTitle}>{menu.title}</h3>
              <button className={styles.mobileSidebarClose} onClick={closeMenu}>
                {renderIcon('close', 18)}
              </button>
            </div>

            <nav className={styles.mobileSidebarNav}>
              {menu.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${styles.mobileSidebarLink} ${isActivePath(currentPath, item.path) ? styles.mobileSidebarLinkActive : ''}`}
                  onClick={closeMenu}
                >
                  {renderIcon(item.icon, 20)}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Футер с профилем и темой - кнопки в ряд */}
            <div className={styles.mobileSidebarFooter}>
              <div className={styles.mobileSidebarFooterRow}>
                {NAVIGATION_CONFIG.footer.map((item) => (
                  <button
                    key={item.label}
                    className={styles.mobileSidebarFooterBtn}
                    onClick={() => item.action ? handleFooterAction(item) : null}
                  >
                    {item.action ? (
                      <>
                        {renderIcon(isDarkTheme ? 'theme' : 'theme', 18)}
                        <span>{isDarkTheme ? 'Светлая' : 'Тёмная'}</span>
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        className={styles.mobileSidebarFooterLink}
                        onClick={closeMenu}
                      >
                        {renderIcon('profile', 18)}
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Оверлей для закрытия меню */}
      {activeMenu && (
        <div className={`${styles.mobileOverlay} ${styles.mobileOverlayVisible}`} onClick={closeMenu} />
      )}
    </>
  );
}
