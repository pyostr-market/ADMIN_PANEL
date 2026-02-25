import styles from './FormGrid.module.css';

export function FormGrid({
  children,
  columns = 2,
  className = '',
}) {
  return (
    <div
      className={`${styles.formGrid} ${styles[`formGrid${columns}Col`]} ${className}`}
      style={{ '--grid-columns': columns }}
    >
      {children}
    </div>
  );
}
