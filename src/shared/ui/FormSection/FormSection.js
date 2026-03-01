import styles from './FormSection.module.css';

export function FormSection({
  icon,
  iconVariant = 'primary',
  title,
  description,
  children,
  className = '',
}) {
  return (
    <section className={`${styles.formSection} ${className}`}>
      <div className={styles.formSectionHeader}>
        {icon && (
          <div className={`${styles.formSectionIcon} ${styles[`formSectionIcon${iconVariant.charAt(0).toUpperCase() + iconVariant.slice(1)}`]}`}>
            {icon}
          </div>
        )}
        <div>
          {title && <h2 className={styles.formSectionTitle}>{title}</h2>}
          {description && <p className={styles.formSectionDescription}>{description}</p>}
        </div>
      </div>
      <div className={styles.formSectionContent}>
        {children}
      </div>
    </section>
  );
}
