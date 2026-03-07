import styles from './EntityCard.module.css';

/**
 * Универсальная карточка сущности для списков
 * @component
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Иконка сущности (FiTag, FiBox и т.д.)
 * @param {string} props.image - URL изображения (приоритет над icon)
 * @param {string} props.title - Заголовок (название сущности)
 * @param {React.ReactNode} props.badges - Бейджи (статусы, метки)
 * @param {React.ReactNode} props.meta - Мета-информация (цена, категория и т.д.)
 * @param {string} props.description - Описание сущности
 * @param {boolean} props.clickable - Клик по всей карточке
 * @param {Function} props.onClick - Обработчик клика
 * @param {React.ReactNode} props.actions - Кнопки действий справа
 * @param {string} props.className - Дополнительный класс
 * @param {string} props.avatarColor - Цвет аватарки (если нет image)
 */
export function EntityCard({
  icon,
  image,
  title,
  badges,
  meta,
  description,
  clickable = true,
  onClick,
  actions,
  className = '',
  avatarColor,
}) {
  const hasImage = Boolean(image);
  const hasIcon = Boolean(icon) && !hasImage;
  const hasDescription = Boolean(description);

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div className={`${styles.entityCard}${className ? ` ${className}` : ''}`}>
      {/* Основная часть с кликом */}
      <div
        className={`${styles.entityCardContent}${clickable ? ` ${styles.entityCardContentClickable}` : ''}`}
        onClick={handleClick}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={clickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
      >
        <div className={styles.entityCardMain}>
          {/* Аватарка/Изображение */}
          <div className={styles.entityCardAvatar}>
            {hasImage ? (
              <img src={image} alt={title} className={styles.entityCardImage} />
            ) : hasIcon ? (
              <span className={avatarColor ? styles.entityCardAvatarColor : ''} aria-hidden="true">
                {icon}
              </span>
            ) : (
              <span aria-hidden="true">?</span>
            )}
          </div>

          {/* Информация */}
          <div className={styles.entityCardInfo}>
            {/* Заголовок + бейджи */}
            <div className={styles.entityCardHeader}>
              <h3 className={styles.entityCardTitle}>{title || 'Без названия'}</h3>
              {badges && <div className={styles.entityCardBadges}>{badges}</div>}
            </div>

            {/* Мета-информация */}
            {meta && <div className={styles.entityCardMeta}>{meta}</div>}

            {/* Описание */}
            {hasDescription && (
              <p className={styles.entityCardDescription}>{description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      {actions && <div className={styles.entityCardActions}>{actions}</div>}
    </div>
  );
}

/**
 * Компонент мета-элемента для удобного добавления мета-информации
 */
export function EntityCardMetaItem({ icon, children, className = '' }) {
  return (
    <span className={`${styles.entityCardMetaItem}${className ? ` ${className}` : ''}`}>
      {icon && <span className={styles.entityCardMetaIcon} aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

/**
 * Компонент бейджа для статусов
 */
export function EntityCardBadge({ variant = 'default', children, className = '' }) {
  const variantClass = styles[`entityCardBadge--${variant}`] || '';
  
  return (
    <span className={`${styles.entityCardBadge}${variantClass}${className ? ` ${className}` : ''}`}>
      {children}
    </span>
  );
}
