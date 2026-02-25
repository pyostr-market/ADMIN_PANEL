import styles from './PageActions.module.css';

export function PageActions({
  children,
  align = 'end',
  className = '',
}) {
  return (
    <div className={`${styles.pageActions} ${styles[`pageActions${align.charAt(0).toUpperCase() + align.slice(1)}`]} ${className}`}>
      {children}
    </div>
  );
}
