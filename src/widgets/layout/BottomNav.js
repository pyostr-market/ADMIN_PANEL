import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NAVIGATION_CONFIG, isActivePath } from '../../shared/config/navigation';
import { Icons } from '../../shared/config/navigation-icons';
import '../../shared/styles/BottomNav.css';

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
      <nav className="bottom-nav">
        <ul className="bottom-nav__list">
          <li className="bottom-nav__item">
            <button
              className={`bottom-nav__button ${activeMenu === 'crm' ? 'bottom-nav__button--active' : ''}`}
              onClick={() => toggleMenu('crm')}
            >
              {renderIcon('crm', 22)}
              <span className="bottom-nav__label">{NAVIGATION_CONFIG.crm.title}</span>
            </button>
          </li>
          <li className="bottom-nav__item">
            <button
              className={`bottom-nav__button ${activeMenu === 'catalog' ? 'bottom-nav__button--active' : ''}`}
              onClick={() => toggleMenu('catalog')}
            >
              {renderIcon('catalog', 22)}
              <span className="bottom-nav__label">{NAVIGATION_CONFIG.catalog.title}</span>
            </button>
          </li>
          <li className="bottom-nav__item">
            <button
              className={`bottom-nav__button ${activeMenu === 'warehouse' ? 'bottom-nav__button--active' : ''}`}
              onClick={() => toggleMenu('warehouse')}
            >
              {renderIcon('warehouse', 22)}
              <span className="bottom-nav__label">{NAVIGATION_CONFIG.warehouse.title}</span>
            </button>
          </li>
          <li className="bottom-nav__item">
            <button
              className={`bottom-nav__button ${activeMenu === 'billing' ? 'bottom-nav__button--active' : ''}`}
              onClick={() => toggleMenu('billing')}
            >
              {renderIcon('billing', 22)}
              <span className="bottom-nav__label">{NAVIGATION_CONFIG.billing.title}</span>
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
            className={`mobile-sidebar ${activeMenu === menuKey ? 'mobile-sidebar--open' : ''}`}
          >
            <div className="mobile-sidebar__header">
              <h3 className="mobile-sidebar__title">{menu.title}</h3>
              <button className="mobile-sidebar__close" onClick={closeMenu}>
                {renderIcon('close', 18)}
              </button>
            </div>

            <nav className="mobile-sidebar__nav">
              {menu.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-sidebar__link ${isActivePath(currentPath, item.path) ? 'mobile-sidebar__link--active' : ''}`}
                  onClick={closeMenu}
                >
                  {renderIcon(item.icon, 20)}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Футер с профилем и темой - кнопки в ряд */}
            <div className="mobile-sidebar__footer">
              <div className="mobile-sidebar__footer-row">
                {NAVIGATION_CONFIG.footer.map((item) => (
                  <button
                    key={item.label}
                    className="mobile-sidebar__footer-btn"
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
                        className="mobile-sidebar__footer-link"
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
        <div className="mobile-overlay mobile-overlay--visible" onClick={closeMenu} />
      )}
    </>
  );
}
