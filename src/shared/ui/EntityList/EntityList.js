import styles from './EntityList.module.css';

export function EntityList({
  items,
  renderItem,
  emptyMessage = 'Список пуст',
  loading = false,
  className = '',
}) {
  if (loading) {
    return <p className={styles.entityListMessage}>Загрузка...</p>;
  }

  if (!items || items.length === 0) {
    return <p className={styles.entityListMessage}>{emptyMessage}</p>;
  }

  return (
    <div className={`${styles.entityList} ${className}`}>
      {items.map((item, index) => (
        <div key={item.id ?? index} className={styles.entityListItem}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
