import { useState, useEffect, useCallback, useRef } from 'react';
import { FiTrash2, FiPackage } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { AutocompleteInput } from '../../../shared/ui/AutocompleteInput/AutocompleteInput';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  createProductRelationRequest,
  deleteProductRelationRequest,
  getProductRelationsRequest,
} from '../api/productRelationsApi';
import { getProductsForAutocompleteRequest } from '../api/productsApi';
import styles from './RecommendationsTab.module.css';

const RELATION_TYPES = {
  accessory: { label: 'Аксессуар', color: 'Blue' },
  similar: { label: 'Похожий товар', color: 'Green' },
  bundle: { label: 'Комплект', color: 'Purple' },
  upsell: { label: 'Более дорогая альтернатива', color: 'Orange' },
};

export function RecommendationsTab({ productId, disabled }) {
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [relations, setRelations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRelationType, setSelectedRelationType] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedRelationTypeForNew, setSelectedRelationTypeForNew] = useState('accessory');

  const loadRelations = useCallback(async () => {
    if (!productId) return;

    setIsLoading(true);
    try {
      const { items } = await getProductRelationsRequest(productId, {
        relation_type: selectedRelationType || undefined,
        limit: 100,
      });
      setRelations(items);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [productId, selectedRelationType]);

  useEffect(() => {
    loadRelations();
  }, [loadRelations]);

  const handleAddRelation = async (selectedOption) => {
    if (!selectedOption) {
      notificationsRef.current?.error('Выберите товар');
      return;
    }

    const relatedProductId = selectedOption.id;

    // Проверка: не добавляем ли мы тот же самый товар
    if (String(relatedProductId) === String(productId)) {
      notificationsRef.current?.error('Нельзя добавить связь товара с самим собой');
      setSelectedProduct(null);
      return;
    }

    // Проверка на дубликат
    const exists = relations.find(
      (r) => String(r.id) === String(relatedProductId) && r.relation_type === selectedRelationTypeForNew
    );
    if (exists) {
      notificationsRef.current?.error('Такая связь уже существует');
      setSelectedProduct(null);
      return;
    }

    try {
      await createProductRelationRequest({
        product_id: productId,
        related_product_id: relatedProductId,
        relation_type: selectedRelationTypeForNew,
        sort_order: relations.length,
      });

      notificationsRef.current?.info('Связь добавлена');
      setSelectedProduct(null);
      await loadRelations();
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    }
  };

  const handleDeleteRelation = async (relationId) => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteProductRelationRequest(relationId);
      notificationsRef.current?.info('Связь удалена');
      await loadRelations();
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRelationTypeChange = (type) => {
    setSelectedRelationType(type);
  };

  const getRelationTypeLabel = (type) => {
    return RELATION_TYPES[type]?.label || type;
  };

  const getRelationTypeColor = (type) => {
    return RELATION_TYPES[type]?.color || 'Gray';
  };

  return (
    <div className={styles.recommendationsTab}>
      {/* Форма добавления */}
      <div className={styles.recommendationsForm}>
        <div className={styles.recommendationsFormRow}>
          <div className={styles.recommendationsFormField}>
            <label className={styles.recommendationsFormLabel}>Тип связи</label>
            <select
              value={selectedRelationTypeForNew}
              onChange={(e) => setSelectedRelationTypeForNew(e.target.value)}
              className={styles.recommendationsFormSelect}
              disabled={disabled}
            >
              {Object.entries(RELATION_TYPES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.recommendationsFormFieldFull}>
            <AutocompleteInput
              label="Выберите товар"
              value={selectedProduct?.id || ''}
              onChange={(value) => {
                // onChange вызывается при выборе, но мы используем onOptionSelect
              }}
              fetchOptions={(params) => getProductsForAutocompleteRequest({
                product_id: productId,
                name: params.name,
              })}
              placeholder="Начните ввод для поиска товара..."
              selectedOption={selectedProduct}
              onOptionSelect={handleAddRelation}
              disabled={disabled}
              getOptionLabel={(option) => option.name || `Товар #${option.id}`}
              getOptionValue={(option) => option.id}
            />
          </div>
        </div>
        <p className={styles.recommendationsFormHint}>
          После выбора товара связь будет создана автоматически
        </p>
      </div>

      {/* Фильтры по типу связи */}
      <div className={styles.recommendationsFilters}>
        <button
          type="button"
          className={`${styles.recommendationsFilter} ${
            selectedRelationType === '' ? styles.recommendationsFilterActive : ''
          }`}
          onClick={() => handleRelationTypeChange('')}
        >
          Все
        </button>
        {Object.entries(RELATION_TYPES).map(([key, { label, color }]) => (
          <button
            key={key}
            type="button"
            className={`${styles.recommendationsFilter} ${
              selectedRelationType === key ? styles.recommendationsFilterActive : ''
            } ${styles[`recommendationsFilter${color}`]}`}
            onClick={() => handleRelationTypeChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Список связей */}
      <div className={styles.recommendationsList}>
        {isLoading ? (
          <div className={styles.recommendationsListLoading}>
            <div className="loading-spinner" />
            <p>Загрузка связей...</p>
          </div>
        ) : relations.length === 0 ? (
          <div className={styles.recommendationsListEmpty}>
            <FiPackage size={48} />
            <p>Нет связанных товаров</p>
            <span className={styles.recommendationsListEmptyHint}>
              Добавьте товары, используя форму выше
            </span>
          </div>
        ) : (
          <div className={styles.recommendationsListBody}>
            <div className={styles.recommendationsListHeader}>
              <span className={styles.recommendationsListCol}>Товар</span>
              <span className={styles.recommendationsListCol}>Тип связи</span>
              <span className={styles.recommendationsListCol}>Цена</span>
              <span className={styles.recommendationsListCol}></span>
            </div>
            {relations.map((relation) => (
              <div key={relation.id} className={styles.recommendationsListItem}>
                <div className={styles.recommendationsListCell}>
                  <span className={styles.recommendationsListProductName}>
                    {relation.name || `Товар #${relation.id}`}
                  </span>
                  <span className={styles.recommendationsListProductId}>
                    ID: {relation.id}
                  </span>
                </div>
                <div className={styles.recommendationsListCell}>
                  <span className={`${styles.recommendationsListType} ${
                    styles[`recommendationsListType${getRelationTypeColor(relation.relation_type)}`]
                  }`}>
                    {getRelationTypeLabel(relation.relation_type)}
                  </span>
                </div>
                <div className={styles.recommendationsListCell}>
                  <span className={styles.recommendationsListPrice}>
                    {relation.price?.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className={styles.recommendationsListCell}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRelation(relation.id)}
                    disabled={isDeleting || disabled}
                    className={styles.recommendationsListDelete}
                    title="Удалить связь"
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
