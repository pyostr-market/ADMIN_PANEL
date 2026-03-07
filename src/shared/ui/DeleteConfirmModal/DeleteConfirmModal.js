import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import { FiAlertTriangle } from 'react-icons/fi';
import styles from './DeleteConfirmModal.module.css';

/**
 * Универсальное модальное окно подтверждения удаления
 * @component
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Открыто ли окно
 * @param {Function} props.onClose - Обработчик закрытия
 * @param {Function} props.onSubmit - Обработчик подтверждения удаления
 * @param {boolean} props.isSubmitting - Идёт ли процесс удаления
 * @param {string} props.entityName - Название сущности в родительном падеже (категории, товара, пользователя)
 * @param {string} props.entityTitle - Заголовок сущности (имя, название)
 * @param {string} props.confirmationText - Кастомный текст подтверждения
 * @param {string} props.noteText - Кастомный текст примечания
 * @param {string} props.submitButtonLabel - Кастомная надпись кнопки подтверждения
 */
export function DeleteConfirmModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  entityName = 'элемент',
  entityTitle,
  confirmationText,
  noteText = 'Это действие нельзя отменить. Все связанные данные также будут удалены.',
  submitButtonLabel = 'Удалить',
}) {
  if (!isOpen) return null;

  const defaultConfirmationText = `Вы уверены, что хотите удалить ${entityTitle ? <strong>{entityTitle}</strong> : `этот ${entityName}`}?`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Удаление: ${entityTitle || entityName}`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button
            variant="danger"
            onClick={onSubmit}
            loading={isSubmitting}
            leftIcon={<FiAlertTriangle />}
          >
            {submitButtonLabel}
          </Button>
        </>
      }
    >
      <div className={styles.deleteConfirmModal}>
        <div className={styles.deleteConfirmModalIcon}>
          <FiAlertTriangle />
        </div>
        <div className={styles.deleteConfirmModalContent}>
          <p className={styles.deleteConfirmModalText}>
            {confirmationText || defaultConfirmationText}
          </p>
          {noteText && (
            <p className={styles.deleteConfirmModalNote}>
              {noteText}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
