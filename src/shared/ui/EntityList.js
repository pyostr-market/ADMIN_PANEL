import './EntityList.css';

export function EntityList({
  items,
  renderItem,
  emptyMessage = 'Список пуст',
  loading = false,
  className = '',
}) {
  if (loading) {
    return <p className="entity-list__message">Загрузка...</p>;
  }

  if (!items || items.length === 0) {
    return <p className="entity-list__message">{emptyMessage}</p>;
  }

  return (
    <div className={`entity-list ${className}`}>
      {items.map((item, index) => (
        <div key={item.id ?? index} className="entity-list__item">
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
