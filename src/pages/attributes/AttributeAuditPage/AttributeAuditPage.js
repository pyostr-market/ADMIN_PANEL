import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import { getAttributeAuditRequest } from '../api/attributesApi';
import { getUsersInfo, formatUserDisplay } from '../../../shared/lib/user/userInfo';
import { withRetry } from '../../../shared/lib/retry';
import styles from './AttributeAuditPage.module.css';

function AuditDetailModal({ auditRecord, onClose, userInfo }) {
  if (!auditRecord) return null;

  const userDisplay = userInfo
    ? formatUserDisplay(auditRecord.user_id, userInfo)
    : `ID: ${auditRecord.user_id}`;

  const renderDataBlock = (data, title) => {
    if (!data || typeof data !== 'object') {
      return (
        <div className={styles.auditDataBlock}>
          <h4 className={styles.auditDataBlockTitle}>{title}</h4>
          <pre className={styles.auditDataBlockValue}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    }

    const entries = Object.entries(data);
    if (entries.length === 0) {
      return (
        <div className={styles.auditDataBlock}>
          <h4 className={styles.auditDataBlockTitle}>{title}</h4>
          <span className={styles.auditDataBlockEmpty}>Нет данных</span>
        </div>
      );
    }

    return (
      <div className={styles.auditDataBlock}>
        <h4 className={styles.auditDataBlockTitle}>{title}</h4>
        <div className={styles.auditDataBlockContent}>
          {entries.map(([key, value]) => (
            <div key={key} className={styles.auditDataRow}>
              <span className={styles.auditDataRowKey}>{key}:</span>
              <span className={styles.auditDataRowValue}>
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
      return <span className={styles.auditValueNull}>null</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className={styles.auditValueEmpty}>[]</span>;
      }
      return (
        <div className={styles.auditValueArray}>
          {value.map((item, index) => (
            <div key={index} className={styles.auditArrayItem}>
              <span className={styles.auditArrayItemIndex}>[{index}]</span>
              {typeof item === 'object' && item !== null ? (
                <div className={styles.auditArrayItemContent}>
                  {Object.entries(item).map(([k, v]) => (
                    <div key={k} className={`${styles.auditDataRow} ${styles.auditDataRowNested}`}>
                      <span className={styles.auditDataRowKey}>{k}:</span>
                      <span className={styles.auditDataRowValue}>{renderValue(v)}</span>
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
        <div className={styles.auditValueObject}>
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className={`${styles.auditDataRow} ${styles.auditDataRowNested}`}>
              <span className={styles.auditDataRowKey}>{k}:</span>
              <span className={styles.auditDataRowValue}>{renderValue(v)}</span>
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return <span className={value ? styles.auditValueTrue : styles.auditValueFalse}>{String(value)}</span>;
    }

    if (typeof value === 'number') {
      return <span className={styles.auditValueNumber}>{value}</span>;
    }

    return <span className={styles.auditValueString}>{String(value)}</span>;
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
      <div className={styles.auditDetailModal}>
        <div className={styles.auditDetailModalHeader}>
          <div className={styles.auditDetailRow}>
            <span className={styles.auditDetailLabel}>Действие:</span>
            <span className={`${styles.auditDetailValue} ${styles[`auditAction${auditRecord.action.charAt(0).toUpperCase() + auditRecord.action.slice(1)}`]}`}>
              {auditRecord.action}
            </span>
          </div>
          <div className={styles.auditDetailRow}>
            <span className={styles.auditDetailLabel}>Пользователь:</span>
            <span className={styles.auditDetailValue}>{userDisplay}</span>
          </div>
          <div className={styles.auditDetailRow}>
            <span className={styles.auditDetailLabel}>Время:</span>
            <span className={styles.auditDetailValue}>
              {new Date(auditRecord.created_at).toLocaleString('ru-RU')}
            </span>
          </div>
        </div>

        <div className={styles.auditDetailModalData}>
          {renderDataBlock(auditRecord.old_data, 'Старые данные')}
          {renderDataBlock(auditRecord.new_data, 'Новые данные')}
        </div>
      </div>
    </Modal>
  );
}

export function AttributeAuditPage() {
  const { attributeId } = useParams();
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
        () => getAttributeAuditRequest({
          attribute_id: attributeId,
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
  }, [attributeId, currentPage, notifications, hasShownError]);

  useEffect(() => {
    loadAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributeId, currentPage]);

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
      <section className={styles.attributeAuditPage}>
        <div className={styles.attributeAuditPageLoading}>
          <div className="loading-spinner" />
          <p>Загрузка истории...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.attributeAuditPage}>
      <header className={styles.attributeAuditPageHeader}>
        <div className={styles.attributeAuditPageHeaderLeft}>
          <Button
            variant="ghost"
            onClick={() => navigate(`/catalog/attributes/${attributeId}`)}
            className={styles.backButton}
          >
            ← Назад
          </Button>
          <h1 className={styles.attributeAuditPageTitle}>История изменений атрибута</h1>
        </div>
      </header>

      <div className={styles.attributeAuditPageContent}>
        <div className={styles.attributeAuditPagePanel}>
          {auditData.length === 0 ? (
            <div className={styles.attributeAuditPageEmpty}>
              <p>История изменений пуста</p>
            </div>
          ) : (
            <>
              <div className={styles.auditTableWrapper}>
                <table className={styles.auditTable}>
                  <thead>
                    <tr>
                      <th className={styles.auditTableHeader}>Действие</th>
                      <th className={styles.auditTableHeader}>Пользователь</th>
                      <th className={styles.auditTableHeader}>Дата</th>
                      <th className={`${styles.auditTableHeader} ${styles.auditTableHeaderActions}`}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditData.map((record) => {
                      const userInfo = userCache.get(record.user_id);
                      const userDisplay = userInfo
                        ? formatUserDisplay(record.user_id, userInfo)
                        : `ID: ${record.user_id}`;

                      return (
                        <tr key={record.id} className={styles.auditTableRow}>
                          <td className={styles.auditTableCell}>
                            <span className={`${styles.auditActionBadge} ${styles[`auditActionBadge${record.action.charAt(0).toUpperCase() + record.action.slice(1)}`]}`}>
                              {record.action}
                            </span>
                          </td>
                          <td className={styles.auditTableCell}>
                            <span className={styles.auditUserInfo} title={userDisplay}>
                              {userDisplay}
                            </span>
                          </td>
                          <td className={styles.auditTableCell}>
                            <span className={styles.auditDate}>
                              {new Date(record.created_at).toLocaleString('ru-RU')}
                            </span>
                          </td>
                          <td className={`${styles.auditTableCell} ${styles.auditTableCellActions}`}>
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
                  className={styles.attributeAuditPagePagination}
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
