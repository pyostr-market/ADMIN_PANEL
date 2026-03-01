import { Button } from '../Button/Button';
import { FiArrowLeft } from 'react-icons/fi';
import styles from './PageHeader.module.css';

export function PageHeader({
  title,
  subtitle,
  onBack,
  backUrl,
  actions,
  className = '',
}) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      window.history.back();
    }
  };

  const showBack = onBack || backUrl;

  return (
    <header className={`${styles.pageHeader} ${className}`}>
      <div className={styles.pageHeaderLeft}>
        {showBack && (
          <Button
            variant="ghost"
            onClick={handleBack}
            className={styles.pageHeaderBackButton}
            leftIcon={<FiArrowLeft />}
          >
            Назад
          </Button>
        )}
        <div className={styles.pageHeaderTitleWrapper}>
          <h1 className={styles.pageHeaderTitle}>{title}</h1>
          {subtitle && <p className={styles.pageHeaderSubtitle}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div className={styles.pageHeaderActions}>{actions}</div>}
    </header>
  );
}
