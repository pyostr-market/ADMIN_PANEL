import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiArrowLeft } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { Pagination } from '../../../shared/ui/Pagination/Pagination';
import { EntityList } from '../../../shared/ui/EntityList/EntityList';
import { CrudListLayout } from '../../../shared/ui/CrudListLayout/CrudListLayout';
import { useCrudList } from '../../../shared/lib/crud';
import { getPageAuditRequest } from '../api/cmsApi';
import styles from './PageAuditPage.module.css';
import entityListStyles from '../../../shared/ui/EntityList/EntityList.module.css';

const PAGE_LIMIT = 20;

const ACTION_LABELS = {
  create: 'Создание',
  update: 'Обновление',
  delete: 'Удаление',
};

const ACTION_COLORS = {
  create: 'success',
  update: 'info',
  delete: 'danger',
};

export function PageAuditPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();

  const auditCrud = useCrudList({
    fetchFn: async ({ page = 1, limit = PAGE_LIMIT } = {}) => {
      const data = await getPageAuditRequest({
        page_id: pageId,
        page,
        limit,
      });
      return {
        items: data.items,
        pagination: {
          page,
          limit,
          total: data.total,
          pages: Math.ceil(data.total / limit),
        },
      };
    },
    entityName: 'Запись аудита',
    defaultLimit: PAGE_LIMIT,
  });

  const handleBack = () => {
    navigate(`/cms/pages/${pageId}`);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatJsonDiff = (data) => {
    if (!data) return '—';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <>
      <CrudListLayout
        header={(
          <>
            <div className={styles.auditHeader}>
              <Button variant="ghost" onClick={handleBack} className={styles.backButton}>
                <FiArrowLeft />
                Назад
              </Button>
              <h1 className={styles.auditTitle}>Аудит страницы</h1>
            </div>
          </>
        )}
        showSearch={false}
        showFilters={false}

        pagination={
          !auditCrud.isLoading && auditCrud.items && auditCrud.items.length > 0 ? (
            <Pagination
              currentPage={auditCrud.page}
              totalPages={auditCrud.pagination.pages}
              totalItems={auditCrud.pagination.total}
              onPageChange={auditCrud.setPage}
              loading={auditCrud.isLoading}
            />
          ) : null
        }
      >
        <EntityList
          items={auditCrud.items}
          renderItem={(record) => {
            const actionColor = ACTION_COLORS[record.action] || 'secondary';
            return (
              <div className={entityListStyles.entityItemContent}>
                <div className={entityListStyles.entityItemMain}>
                  <div className={entityListStyles.entityItemAvatar}>
                    <FiClock />
                  </div>
                  <div className={entityListStyles.entityItemInfo}>
                    <div className={entityListStyles.entityItemHeader}>
                      <p className={entityListStyles.entityItemTitle}>
                        <span className={`${styles.actionBadge} ${styles[`actionBadge${actionColor}`]}`}>
                          {ACTION_LABELS[record.action] || record.action}
                        </span>
                      </p>
                    </div>
                    <div className={entityListStyles.entityItemMeta}>
                      <span className={entityListStyles.entityItemMetaItem}>
                        <span className={entityListStyles.entityItemMetaLabel}>Дата:</span>{' '}
                        {formatDateTime(record.created_at)}
                      </span>
                      <span className={entityListStyles.entityItemSeparator}>•</span>
                      <span className={entityListStyles.entityItemMetaItem}>
                        <span className={entityListStyles.entityItemMetaLabel}>User ID:</span>{' '}
                        {record.user_id || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
          emptyMessage={
            auditCrud.isLoading
              ? 'Загрузка аудита...'
              : 'Записи аудита не найдены.'
          }
          loading={auditCrud.isLoading}
        />
      </CrudListLayout>
    </>
  );
}
