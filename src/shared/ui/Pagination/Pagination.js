import { Button } from '../Button/Button';
import styles from './Pagination.module.css';

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  loading = false,
  className = '',
}) {
  const safeCurrentPage = Math.max(1, currentPage || 1);
  const safeTotalPages = Math.max(1, totalPages || 1);

  const handlePrev = () => {
    if (safeCurrentPage > 1 && !loading) {
      onPageChange(safeCurrentPage - 1);
    }
  };

  const handleNext = () => {
    if (safeCurrentPage < safeTotalPages && !loading) {
      onPageChange(safeCurrentPage + 1);
    }
  };

  return (
    <div className={`${styles.pagination} ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        onClick={handlePrev}
        disabled={loading || safeCurrentPage <= 1}
      >
        Назад
      </Button>
      <span className={styles.paginationInfo}>
        Страница {safeCurrentPage} из {safeTotalPages} · всего {totalItems || 0}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleNext}
        disabled={loading || safeCurrentPage >= safeTotalPages}
      >
        Вперед
      </Button>
    </div>
  );
}
