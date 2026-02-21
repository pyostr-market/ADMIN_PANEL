export function Tabs({ children, className = '' }) {
  return <div className={`tabs ${className}`}>{children}</div>;
}

export function Tab({ active, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      className={`tab ${active ? 'tab--active' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
