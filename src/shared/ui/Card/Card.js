import styles from './Card.module.css';

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
}) {
  const paddingClass = padding === 'none' 
    ? styles.cardPaddingNone 
    : styles[`cardPadding${padding.charAt(0).toUpperCase() + padding.slice(1)}`];
    
  return (
    <div className={`${styles.card} ${styles[`card${variant.charAt(0).toUpperCase() + variant.slice(1)}`]} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
}
