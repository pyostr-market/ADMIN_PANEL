import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import { Button } from '../Button/Button';
import { LoadingState } from '../LoadingState/LoadingState';
import styles from './FormPage.module.css';

/**
 * Универсальный компонент страницы формы (создание/редактирование)
 * @component
 *
 * @param {Object} props
 * @param {string} props.title - Заголовок страницы
 * @param {string} props.backUrl - URL для возврата назад
 * @param {boolean} props.isLoading - Индикатор загрузки данных
 * @param {boolean} props.isSubmitting - Индикатор отправки формы
 * @param {Function} props.onBack - Обработчик нажатия кнопки "Назад"
 * @param {Function} props.onSubmit - Обработчик отправки формы
 * @param {Function} props.onSubmitAndStay - Обработчик отправки формы с оставаться на странице
 * @param {React.ReactNode} props.children - Содержимое формы
 * @param {boolean} props.showSubmitStay - Показывать ли кнопку "Сохранить и остаться"
 * @param {string} props.submitText - Текст кнопки сохранения
 * @param {string} props.submitStayText - Текст кнопки "Сохранить и остаться"
 * @param {React.ReactNode} props.headerActions - Дополнительные действия в шапке (справа)
 *
 * @example
 * <FormPage
 *   title={isEditMode ? "Редактирование категории" : "Создание категории"}
 *   backUrl={`/categories/${categoryId}`}
 *   isLoading={isLoading}
 *   isSubmitting={isSubmitting}
 *   onSubmit={() => handleSubmit(false)}
 *   onSubmitAndStay={() => handleSubmit(true)}
 *   showSubmitStay={true}
 * >
 *   <FormSection title="Основная информация">
 *     <FormGrid>
 *       <FormField label="Название">
 *         <input value={name} onChange={handleChange} />
 *       </FormField>
 *     </FormGrid>
 *   </FormSection>
 * </FormPage>
 */
export function FormPage({
  title,
  backUrl,
  isLoading = false,
  isSubmitting = false,
  onBack,
  onSubmit,
  onSubmitAndStay,
  children,
  showSubmitStay = false,
  submitText = 'Сохранить',
  submitStayText = 'Сохранить и остаться',
  headerActions,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onSubmit) {
      onSubmit();
    }
  };

  const handleSubmitAndStay = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onSubmitAndStay) {
      onSubmitAndStay();
    }
  };

  // Блокируем стандартную отправку формы при нажатии Enter
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === 'Enter' &&
        event.target.tagName !== 'TEXTAREA' &&
        event.target.tagName !== 'BUTTON'
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return <LoadingState message="Загрузка данных..." />;
  }

  return (
    <section className={styles.formPage}>
      <header className={styles.formPageHeader}>
        <Button
          variant="ghost"
          onClick={handleBack}
          className={styles.formPageBackButton}
        >
          ← Назад
        </Button>
        {headerActions && (
          <div className={styles.formPageHeaderActions}>
            {headerActions}
          </div>
        )}
      </header>

      <div className={styles.formPageContent}>
        {children}
      </div>

      <footer className={styles.formPageFooter}>
        <div className={styles.formPageFooterLeft}>
          <Button
            variant="ghost"
            type="button"
            onClick={handleBack}
            leftIcon={<FiX />}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
        </div>

        <div className={styles.formPageFooterRight}>
          {showSubmitStay && onSubmitAndStay && (
            <Button
              variant="secondary"
              type="button"
              onClick={handleSubmitAndStay}
              leftIcon={<FiSave />}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {submitStayText}
            </Button>
          )}

          <Button
            variant="primary"
            type="button"
            onClick={handleSubmit}
            leftIcon={<FiSave />}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {submitText}
          </Button>
        </div>
      </footer>
    </section>
  );
}
