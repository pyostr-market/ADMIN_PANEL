import { useMemo } from 'react';
import { CategoryTreeNode } from './CategoryTreeNode';
import styles from './CategoryTree.module.css';

/**
 * Компонент дерева категорий
 * @param {Object} props
 * @param {Array} props.categories - Массив категорий с иерархией
 * @param {number | null} props.selectedId - ID выбранной категории
 * @param {Function} props.onSelect - Обработчик выбора категории
 * @param {boolean} props.isLoading - Индикатор загрузки
 */
export function CategoryTree({
  categories = [],
  selectedId = null,
  onSelect,
  isLoading = false,
}) {
  const hasCategories = useMemo(() => {
    return Array.isArray(categories) && categories.length > 0;
  }, [categories]);

  if (isLoading) {
    return (
      <div className={styles.categoryTree}>
        <div>Загрузка категорий...</div>
      </div>
    );
  }

  if (!hasCategories) {
    return (
      <div className={styles.categoryTree}>
        <div>Категории не найдены</div>
      </div>
    );
  }

  return (
    <div className={styles.categoryTree}>
      <ul className={styles.treeNode}>
        {categories.map((category) => (
          <CategoryTreeNode
            key={category.id}
            category={category}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </div>
  );
}
