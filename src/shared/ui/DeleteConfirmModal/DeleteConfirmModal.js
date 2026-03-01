import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import { FiAlertTriangle } from 'react-icons/fi';
import styles from './DeleteConfirmModal.module.css';

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  entityName = 'элемент',
  entityTitle,
}) {
  if (!isOpen) return null;

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
            Удалить
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
            Вы уверены, что хотите удалить <strong>{entityTitle || entityName}</strong>?
          </p>
          <p className={styles.deleteConfirmModalNote}>
            Это действие нельзя отменить. Все связанные данные также будут удалены.
          </p>
        </div>
      </div>
    </Modal>
  );
}
