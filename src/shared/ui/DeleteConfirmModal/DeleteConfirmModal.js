import { Button } from '../Button';
import { Modal } from '../Modal';
import { FiAlertTriangle } from 'react-icons/fi';
import './DeleteConfirmModal.css';

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
      <div className="delete-confirm-modal">
        <div className="delete-confirm-modal__icon">
          <FiAlertTriangle />
        </div>
        <div className="delete-confirm-modal__content">
          <p className="delete-confirm-modal__text">
            Вы уверены, что хотите удалить <strong>{entityTitle || entityName}</strong>?
          </p>
          <p className="delete-confirm-modal__note">
            Это действие нельзя отменить. Все связанные данные также будут удалены.
          </p>
        </div>
      </div>
    </Modal>
  );
}
