import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';
import { Button } from '../Button/Button';
import { Pagination } from '../Pagination/Pagination';
import { Modal } from '../Modal/Modal';
import { getUsersInfo, formatUserDisplay } from '../../../shared/lib/user/userInfo';
import { withRetry } from '../../../shared/lib/retry';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import styles from './AuditPage.module.css';

/**
 * Универсальный компонент для отображения деталей аудита в модальном окне
 */
function AuditDetailModal({ auditRecord, userInfo, onClose }) {
  const renderValue = useCallback((value) => {
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
  }, []);

  const renderDataBlock = useCallback((data, title) => {
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
              <span className={styles.auditDataRowValue}>{renderValue(value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }, [renderValue]);

  if (!auditRecord) return null;

  const userDisplay = userInfo
    ? formatUserDisplay(auditRecord.user_id, userInfo)
    : `ID: ${auditRecord.user_id}`;

  const actionClass = styles[`auditAction${auditRecord.action.charAt(0).toUpperCase() + auditRecord.action.slice(1)}`];

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
            <span className={`${styles.auditDetailValue} ${actionClass}`}>
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

/**
 * Универсальный компонент страницы аудита
 * @component
 *
 * @param {Object} props
 * @param {string} props.title - Заголовок страницы
 * @param {string} props.backUrl - URL для возврата назад
 * @param {Function} props.fetchAudit - Функция для получения данных аудита { limit, offset } => { items, total }
 * @param {boolean} props.useRetry - Использовать ли повторные запросы (по умолчанию true)
 * @param {number} props.maxRetries - Максимальное количество попыток (по умолчанию 3)
 * @param {number} props.pageSize - Размер страницы (по умолчанию 20)
 * @param {boolean} props.showErrorNotifications - Показывать ли уведомления об ошибках (по умолчанию true)
 *
 * @example
 * <AuditPage
 *   title="История изменений производителя"
 *   backUrl={`/catalog/manufacturers/${manufacturerId}`}
 *   fetchAudit={(params) => getManufacturerAuditRequest({ manufacturer_id: manufacturerId, ...params })}
 * />
 */
export function AuditPage({
  title = 'История изменений',
  backUrl,
  fetchAudit,
  useRetry = true,
  maxRetries = 3,
  pageSize = 20,
  showErrorNotifications = true,
}) {
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

  const loadAudit = useCallback(async () => {
    if (hasShownError) return;

    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * pageSize;
      const limit = pageSize;

      const fetchFunction = () => fetchAudit({ limit, offset });
      const result = useRetry
        ? await withRetry(fetchFunction, maxRetries)
        : await fetchFunction();

      const { items, total: totalItems } = result;

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
          setTimeout(() => {
            loadAudit();
          }, 500);
          return;
        }

        // После 3 попыток показываем ошибку и останавливаемся
        if (!hasShownError && showErrorNotifications) {
          const message = getApiErrorMessage(error);
          notifications?.error(message);
          setHasShownError(true);
        }
        return;
      }

      // Для других ошибок показываем сразу
      if (!hasShownError && showErrorNotifications) {
        const message = getApiErrorMessage(error);
        notifications?.error(message);
        setHasShownError(true);
      }
    } finally {
      if (!hasShownError) {
        setIsLoading(false);
      }
    }
  }, [currentPage, pageSize, fetchAudit, useRetry, maxRetries, hasShownError, showErrorNotifications, notifications]);

  useEffect(() => {
    loadAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, fetchAudit]);

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
  };

  const handleCloseModal = () => {
    setSelectedRecord(null);
  };

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <section className={styles.auditPage}>
        <div className={styles.auditPageLoading}>
          <div className={styles.loadingSpinner} />
          <p>Загрузка истории...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.auditPage}>
      <header className={styles.auditPageHeader}>
        <Button
          variant="ghost"
          onClick={handleBack}
          className={styles.auditPageBackButton}
        >
          ← Назад
        </Button>
        <h1 className={styles.auditPageTitle}>{title}</h1>
      </header>

      <div className={styles.auditPageContent}>
        <div className={styles.auditPagePanel}>
          {auditData.length === 0 ? (
            <div className={styles.auditPageEmpty}>
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

                      const actionClass = styles[`auditActionBadge${record.action.charAt(0).toUpperCase() + record.action.slice(1)}`];

                      return (
                        <tr key={record.id} className={styles.auditTableRow}>
                          <td className={styles.auditTableCell}>
                            <span className={`${styles.auditActionBadge} ${actionClass}`}>
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
                  className={styles.auditPagePagination}
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
