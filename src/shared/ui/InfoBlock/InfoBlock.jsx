import { FiBox, FiClock } from 'react-icons/fi';
import { Button } from '../Button/Button';
import styles from './InfoBlock.module.css';

/**
 * @typedef {Object} InfoItem
 * @property {string} label - Метка поля (например, "ID", "Название")
 * @property {React.ReactNode} value - Значение поля
 * @property {React.ReactNode} [icon] - Иконка (по умолчанию FiBox)
 * @property {string} [iconVariant] - Вариант иконки: 'primary' | 'secondary' | 'info' | 'success' | 'accent'
 * @property {boolean} [fullWidth] - Растянуть на всю ширину
 */

/**
 * Универсальный компонент блока информации
 * @component
 *
 * @param {Object} props
 * @param {string} [props.title] - Заголовок блока (например, "Информация")
 * @param {React.ReactNode} [props.headerIcon] - Иконка в заголовке
 * @param {InfoItem[]} props.items - Массив элементов для отображения
 * @param {string} [props.auditUrl] - URL для перехода на страницу аудита (если указан, показывается кнопка "История")
 * @param {Function} [props.onAuditClick] - Обработчик клика по кнопке "История" (если указан, используется вместо навигации)
 * @param {string} [props.className] - Дополнительный CSS-класс
 *
 * @example
 * <InfoBlock
 *   title="Информация"
 *   headerIcon={<FiBox />}
 *   items={[
 *     { label: 'ID', value: product.id, iconVariant: 'primary' },
 *     { label: 'Название', value: product.name, iconVariant: 'secondary' },
 *     { label: 'Описание', value: product.description, iconVariant: 'info', fullWidth: true },
 *   ]}
 *   auditUrl="/products/1/audit"
 * />
 */
export function InfoBlock({
  title = 'Информация',
  headerIcon,
  items,
  auditUrl,
  onAuditClick,
  className = '',
}) {
  const getIconClass = (variant) => {
    switch (variant) {
      case 'primary':
        return styles.infoCardIconPrimary;
      case 'secondary':
        return styles.infoCardIconSecondary;
      case 'info':
        return styles.infoCardIconInfo;
      case 'success':
        return styles.infoCardIconSuccess;
      case 'accent':
        return styles.infoCardIconAccent;
      default:
        return styles.infoCardIconPrimary;
    }
  };

  const DefaultIcon = headerIcon || FiBox;

  const handleAuditClick = () => {
    if (onAuditClick) {
      onAuditClick();
    }
    // Если onAuditClick не указан и auditUrl указан, навигация будет через onClick на кнопке
  };

  return (
    <div className={`${styles.infoBlock} ${className}`}>
      <div className={styles.infoBlockPanel}>
        <div className={styles.infoBlockHeader}>
          <div className={styles.infoBlockHeaderContent}>
            <h2 className={styles.infoBlockTitle}>
              {headerIcon || <DefaultIcon className={styles.infoBlockTitleIcon} />}
              {title}
            </h2>
            {auditUrl && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiClock />}
                onClick={handleAuditClick}
                className={styles.infoBlockAuditButton}
              >
                История
              </Button>
            )}
          </div>
        </div>

        <div className={styles.infoBlockGrid}>
          {items.map((item, index) => (
            <div
              key={index}
              className={`${styles.infoCard} ${item.fullWidth ? styles.infoCardFull : ''}`}
            >
              <div className={`${styles.infoCardIcon} ${getIconClass(item.iconVariant || 'primary')}`}>
                {item.icon || <FiBox />}
              </div>
              <div className={styles.infoCard__content}>
                <span className={styles.infoCardLabel}>{item.label}</span>
                <span className={styles.infoCardValue}>{item.value || '—'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
