import { useState, useEffect, useCallback, useRef } from 'react';
import { FiTag, FiTrash2, FiCheck } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getAllTagsRequest,
  getProductTagsRequest,
  addTagToProductRequest,
  removeTagFromProductRequest,
  createTagRequest,
} from '../api/productTagsApi';
import styles from './TagsTab.module.css';

// Теги, которые создаются автоматически при первом запуске
const DEFAULT_TAGS = [
  'Скидка',
  'Популярный товар',
  'BU',
  'Уценка',
  'Распродажа',
  'Акция',
];

export function TagsTab({ productId, disabled }) {
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [availableTags, setAvailableTags] = useState([]);
  const [productTags, setProductTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState(new Set());

  // Инициализация дефолтных тегов (если их нет в системе)
  const initDefaultTags = useCallback(async () => {
    try {
      for (const name of DEFAULT_TAGS) {
        await createTagRequest({ name, description: null });
      }
    } catch (error) {
      // Игнорируем ошибки — теги могут уже существовать (409 Conflict)
    }
  }, []);

  // Загрузка всех доступных тегов
  const loadAvailableTags = useCallback(async () => {
    try {
      const { items } = await getAllTagsRequest({ limit: 1000 });

      // Если тегов нет — создаём дефолтные и загружаем снова
      if (items.length === 0) {
        await initDefaultTags();
        const { items: newItems } = await getAllTagsRequest({ limit: 1000 });
        setAvailableTags(newItems);
      } else {
        setAvailableTags(items);
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error('Ошибка загрузки тегов:', message);
      notificationsRef.current?.error('Не удалось загрузить теги');
    }
  }, [initDefaultTags]);

  // Загрузка тегов товара
  const loadProductTags = useCallback(async () => {
    if (!productId) return;

    setIsLoading(true);
    try {
      const { items } = await getProductTagsRequest(productId, { limit: 100 });
      setProductTags(items);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  // Загрузка при монтировании
  useEffect(() => {
    loadAvailableTags();
    loadProductTags();
  }, [loadAvailableTags, loadProductTags]);

  // Получаем ID уже назначенных тегов
  const assignedTagIds = new Set(productTags.map(pt => pt.tag_id));

  // Переключение выбора тега
  const handleToggleTag = (tagId) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  };

  // Добавление выбранных тегов
  const handleAddTags = async () => {
    if (selectedTags.size === 0) {
      notificationsRef.current?.error('Выберите хотя бы один тег');
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const tagId of selectedTags) {
        try {
          await addTagToProductRequest({
            product_id: parseInt(productId, 10),
            tag_id: tagId,
          });
          successCount++;
        } catch (error) {
          const message = getApiErrorMessage(error);
          console.error(`Ошибка добавления тега ${tagId}:`, message);
          errorCount++;
        }
      }

      // Обновляем список тегов товара
      await loadProductTags();
      setSelectedTags(new Set());

      if (successCount > 0 && errorCount === 0) {
        notificationsRef.current?.info(`Тег${successCount > 1 ? 'и' : ''} успешно добавлен${successCount > 1 ? 'ы' : ''}`);
      } else if (successCount > 0 && errorCount > 0) {
        notificationsRef.current?.warning(`Добавлено: ${successCount}, Ошибок: ${errorCount}`);
      } else {
        notificationsRef.current?.error('Не удалось добавить теги');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Удаление тега
  const handleRemoveTag = async (tagId) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await removeTagFromProductRequest(parseInt(productId, 10), tagId);
      notificationsRef.current?.info('Тег удалён');
      await loadProductTags();
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Проверка, назначен ли тег товару
  const isTagAssigned = (tagId) => assignedTagIds.has(tagId);

  // Проверка, выбран ли тег
  const isTagSelected = (tagId) => selectedTags.has(tagId);

  return (
    <div className={styles.tagsTab}>
      {/* Выбор тегов для добавления — сверху */}
      <div className={styles.tagsSection}>
        <h3 className={styles.tagsSectionTitle}>Доступные теги</h3>
        <div className={styles.tagsGrid}>
          {availableTags.length === 0 ? (
            <div className={styles.tagsEmpty}>
              <div className="loading-spinner" />
              <p>Загрузка тегов...</p>
            </div>
          ) : (
            availableTags.map((tag) => {
              const assigned = isTagAssigned(tag.tag_id);
              const selected = isTagSelected(tag.tag_id);

              return (
                <button
                  key={tag.tag_id}
                  type="button"
                  className={`
                    ${styles.tagChip}
                    ${assigned ? styles.tagChipAssigned : ''}
                    ${selected ? styles.tagChipSelected : ''}
                  `}
                  onClick={() => !assigned && handleToggleTag(tag.tag_id)}
                  disabled={assigned || isSubmitting || disabled}
                >
                  {assigned && <FiCheck className={styles.tagChipIcon} />}
                  <span className={styles.tagChipName}>{tag.name}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Кнопка добавления */}
        {selectedTags.size > 0 && (
          <div className={styles.tagsAddButtonWrapper}>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleAddTags}
              disabled={isSubmitting || disabled}
            >
              Добавить выбранные ({selectedTags.size})
            </Button>
          </div>
        )}
      </div>

      {/* Разделитель */}
      <div className={styles.tagsDivider} />

      {/* Список уже назначенных тегов — снизу */}
      <div className={styles.tagsSection}>
        <h3 className={styles.tagsSectionTitle}>Назначенные теги</h3>
        {isLoading ? (
          <div className={styles.tagsLoading}>
            <div className="loading-spinner" />
            <p>Загрузка тегов...</p>
          </div>
        ) : productTags.length === 0 ? (
          <div className={styles.tagsEmpty}>
            <FiTag size={32} />
            <p>Нет назначенных тегов</p>
            <span className={styles.tagsEmptyHint}>
              Выберите теги из списка выше и нажмите «Добавить»
            </span>
          </div>
        ) : (
          <div className={styles.assignedTagsList}>
            {productTags.map((productTag) => (
              <div key={productTag.id} className={styles.assignedTagItem}>
                <span className={styles.assignedTagName}>
                  <FiTag className={styles.assignedTagIcon} />
                  {productTag.tag?.name || `Тег #${productTag.tag_id}`}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTag(productTag.tag_id)}
                  disabled={isSubmitting || disabled}
                  className={styles.assignedTagDelete}
                  title="Удалить тег"
                >
                  <FiTrash2 />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
