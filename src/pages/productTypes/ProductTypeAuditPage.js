import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { Pagination } from '../../shared/ui/Pagination';
import { Modal } from '../../shared/ui/Modal';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import { getProductTypeAuditRequest } from './api/productTypesApi';
import { getUsersInfo, formatUserDisplay } from '../../shared/lib/user/userInfo';
import { withRetry } from '../../shared/lib/retry';
import './ProductTypeAuditPage.css';

function AuditDetailModal({ auditRecord, onClose, userInfo }) {
  if (!auditRecord) return null;

  const userDisplay = userInfo
    ? formatUserDisplay(auditRecord.user_id, userInfo)
    : `ID: ${auditRecord.user_id}`;

  const renderDataBlock = (data, title) => {
    if (!data || typeof data !== 'object') {
      return (
        <div className="audit-data-block">
          <h4 className="audit-data-block__title">{title}</h4>
          <pre className="audit-data-block__value">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    }

    const entries = Object.entries(data);
    if (entries.length === 0) {
      return (
        <div className="audit-data-block">
          <h4 className="audit-data-block__title">{title}</h4>
          <span className="audit-data-block__empty">Нет данных</span>
        </div>
      );
    }

    return (
      <div className="audit-data-block">
        <h4 className="audit-data-block__title">{title}</h4>
        <div className="audit-data-block__content">
          {entries.map(([key, value]) => (
            <div key={key} className="audit-data-row">
              <span className="audit-data-row__key">{key}:</span>
              <span className="audit-data-row__value">
                {renderValue(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderValue = (value) => {
    if (value === null || value === undefined) {
      return <span className="audit-value-null">null</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="audit-value-empty">[]</span>;
      }
      return (
        <div className="audit-value-array">
          {value.map((item, index) => (
            <div key={index} className="audit-array-item">
              <span className="audit-array-item__index">[{index}]</span>
              {typeof item === 'object' && item !== null ? (
                <div className="audit-array-item__content">
                  {Object.entries(item).map(([k, v]) => (
                    <div key={k} className="audit-data-row audit-data-row--nested">
                      <span className="audit-data-row__key">{k}:</span>
                      <span className="audit-data-row__value">{renderValue(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                renderValue(item)
              )}
            </div>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      return (
        <div className="audit-value-object">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="audit-data-row audit-data-row--nested">
              <span className="audit-data-row__key">{k}:</span>
              <span className="audit-data-row__value">{renderValue(v)}</span>
            </div>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'boolean') {
      return <span className={value ? 'audit-value-true' : 'audit-value-false'}>{String(value)}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="audit-value-number">{value}</span>;
    }
    
    return <span className="audit-value-string">{String(value)}</span>;
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Детали аудита #${auditRecord.id}`}
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Закрыть
        </Button>
      }
    >
      <div className="audit-detail-modal">
        <div className="audit-detail-modal__header">
          <div className="audit-detail-row">
            <span className="audit-detail-label">Действие:</span>
            <span className={`audit-detail-value audit-action-${auditRecord.action}`}>
              {auditRecord.action}
            </span>
          </div>
          <div className="audit-detail-row">
            <span className="audit-detail-label">Пользователь:</span>
            <span className="audit-detail-value">{userDisplay}</span>
          </div>
          <div className="audit-detail-row">
            <span className="audit-detail-label">Время:</span>
            <span className="audit-detail-value">
              {new Date(auditRecord.created_at).toLocaleString('ru-RU')}
            </span>
          </div>
        </div>

        <div className="audit-detail-modal__data">
          {renderDataBlock(auditRecord.old_data, 'Старые данные')}
          {renderDataBlock(auditRecord.new_data, 'Новые данные')}
        </div>
      </div>
    </Modal>
  );
}

export function ProductTypeAuditPage() {
  const { productTypeId } = useParams();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [auditData, setAuditData] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [userCache, setUserCache] = useState(new Map());
  const [hasShownError, setHasShownError] = useState(false);
  const retryCountRef = useRef(0);

  const maxRetries = 3;
  const limit = 20;

  const loadAudit = useCallback(async () => {
    if (hasShownError) return;
    
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * limit;
      const { items, total: totalItems } = await withRetry(
        () => getProductTypeAuditRequest({
          product_type_id: productTypeId,
          limit,
          offset,
        }),
        maxRetries,
      );
      setAuditData(items);
      setTotal(totalItems);
      retryCountRef.current = 0;

      // Загружаем информацию о пользователях
      const userIds = items.map((item) => item.user_id).filter(Boolean);
      if (userIds.length > 0) {
        const usersInfo = await getUsersInfo(userIds);
        setUserCache(usersInfo);
      }
    } catch (error) {
      const status = error?.response?.status;
      
      // При 404/405 не показываем ошибку сразу, пробуем до 3 раз
      if (status === 404 || status === 405) {
        retryCountRef.current += 1;
        
        if (retryCountRef.current < maxRetries) {
          // Пробуем снова через небольшую задержку
          setTimeout(() => {
            loadAudit();
          }, 500);
          return;
        }
        
        // После 3 попыток показываем ошибку и останавливаемся
        if (!hasShownError) {
          const message = getApiErrorMessage(error);
          notifications?.error(message);
          setHasShownError(true);
        }
        return;
      }
      
      // Для других ошибок показываем сразу
      if (!hasShownError) {
        const message = getApiErrorMessage(error);
        notifications?.error(message);
        setHasShownError(true);
      }
    } finally {
      if (!hasShownError) {
        setIsLoading(false);
      }
    }
  }, [productTypeId, currentPage, notifications, hasShownError]);

  useEffect(() => {
    loadAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productTypeId, currentPage]);

  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
  };

  const handleCloseModal = () => {
    setSelectedRecord(null);
  };

  if (isLoading) {
    return (
      <section className="product-type-audit-page">
        <div className="product-type-audit-page__loading">
          <div className="loading-spinner" />
          <p>Загрузка истории...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="product-type-audit-page">
      <header className="product-type-audit-page__header">
        <div className="product-type-audit-page__header-left">
          <Button
            variant="ghost"
            onClick={() => navigate(`/catalog/device_type/${productTypeId}`)}
            className="back-button"
          >
            ← Назад
          </Button>
          <h1 className="product-type-audit-page__title">История изменений типа продукта</h1>
        </div>
      </header>

      <div className="product-type-audit-page__content">
        <div className="product-type-audit-page__panel">
          {auditData.length === 0 ? (
            <div className="product-type-audit-page__empty">
              <p>История изменений пуста</p>
            </div>
          ) : (
            <>
              <div className="audit-table-wrapper">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th className="audit-table__header">Действие</th>
                      <th className="audit-table__header">Пользователь</th>
                      <th className="audit-table__header">Дата</th>
                      <th className="audit-table__header audit-table__header--actions">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditData.map((record) => {
                      const userInfo = userCache.get(record.user_id);
                      const userDisplay = userInfo
                        ? formatUserDisplay(record.user_id, userInfo)
                        : `ID: ${record.user_id}`;

                      return (
                        <tr key={record.id} className="audit-table__row">
                          <td className="audit-table__cell">
                            <span className={`audit-action-badge audit-action-badge--${record.action}`}>
                              {record.action}
                            </span>
                          </td>
                          <td className="audit-table__cell">
                            <span className="audit-user-info" title={userDisplay}>
                              {userDisplay}
                            </span>
                          </td>
                          <td className="audit-table__cell">
                            <span className="audit-date">
                              {new Date(record.created_at).toLocaleString('ru-RU')}
                            </span>
                          </td>
                          <td className="audit-table__cell audit-table__cell--actions">
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<FiEye />}
                              onClick={() => handleViewDetails(record)}
                            >
                              Подробнее
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={total}
                  onPageChange={handlePageChange}
                  loading={isLoading}
                  className="product-type-audit-page__pagination"
                />
              )}
            </>
          )}
        </div>
      </div>

      {selectedRecord && (
        <AuditDetailModal
          auditRecord={selectedRecord}
          userInfo={userCache.get(selectedRecord.user_id)}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
}
