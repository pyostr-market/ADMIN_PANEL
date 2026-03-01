import styles from './Tabs.module.css';

export function Tabs({ children, className = '' }) {
  return <div className={`${styles.tabs} ${className}`}>{children}</div>;
}

export function Tab({ active, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      className={`${styles.tab} ${active ? styles.tabActive : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
