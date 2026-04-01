import { useState } from 'react';
import { FiChevronRight, FiFolder } from 'react-icons/fi';
import styles from './CategoryTree.module.css';

/**
 * Компонент узла дерева категорий
 */
export function CategoryTreeNode({
  category,
  selectedId,
  onSelect,
  level = 0,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedId === category.id;

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
    onSelect(category.id);
  };

  return (
    <li className={styles.treeNodeItem}>
      <button
        className={`${styles.treeNodeButton} ${hasChildren ? styles.hasChildren : ''} ${isSelected ? styles.active : ''}`}
        onClick={handleToggle}
        style={{ paddingLeft: `${12 + level * 8}px` }}
      >
        {/* Иконка раскрытия */}
        <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''} ${!hasChildren ? styles.hidden : ''}`}>
          <FiChevronRight size={16} />
        </span>

        {/* Иконка категории */}
        <span className={styles.categoryIcon}>
          <FiFolder size={18} />
        </span>

        {/* Название категории */}
        <span className={styles.categoryName}>
          {category.name}
        </span>

        {/* Счетчик товаров (если есть) */}
        {category.products_count !== undefined && (
          <span className={styles.categoryCount}>
            ({category.products_count})
          </span>
        )}
      </button>

      {/* Дочерние категории */}
      {hasChildren && (
        <ul
          className={`${styles.childrenContainer} ${isExpanded ? styles.expanded : styles.collapsed}`}
        >
          {category.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
