import { Button } from '../Button';
import { FiArrowLeft } from 'react-icons/fi';
import './PageHeader.css';

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
    <header className={`page-header ${className}`}>
      <div className="page-header__left">
        {showBack && (
          <Button
            variant="ghost"
            onClick={handleBack}
            className="page-header__back-button"
            leftIcon={<FiArrowLeft />}
          >
            Назад
          </Button>
        )}
        <div className="page-header__title-wrapper">
          <h1 className="page-header__title">{title}</h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
