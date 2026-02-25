import styles from './InfoCard.module.css';

export function InfoCard({
  label,
  value,
  icon,
  variant = 'default',
  className = '',
}) {
  return (
    <div className={`${styles.infoCard} ${styles[`infoCard${variant.charAt(0).toUpperCase() + variant.slice(1)}`]} ${className}`}>
      {icon && <div className={styles.infoCardIcon}>{icon}</div>}
      <div className={styles.infoCardContent}>
        {label && <div className={styles.infoCardLabel}>{label}</div>}
        <div className={styles.infoCardValue}>{value}</div>
      </div>
    </div>
  );
}
