import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit, FiFlag } from 'react-icons/fi';
import { PermissionGate } from '../../../shared/ui/PermissionGate/PermissionGate';
import { Button } from '../../../shared/ui/Button/Button';
import { InfoBlock } from '../../../shared/ui/InfoBlock/InfoBlock';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { getFeatureFlagsRequest } from '../api/cmsApi';
import styles from './FeatureFlagDetailPage.module.css';

export function FeatureFlagDetailPage() {
  const { flagId } = useParams();
  const navigate = useNavigate();

  const [flag, setFlag] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFlag = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getFeatureFlagsRequest({});
      const foundFlag = (data.items || []).find(item => item.id === parseInt(flagId));
      setFlag(foundFlag || null);
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error('Ошибка загрузки feature flag:', message);
    } finally {
      setIsLoading(false);
    }
  }, [flagId]);

  useEffect(() => {
    loadFlag();
  }, [flagId, loadFlag]);

  const handleEdit = () => {
    navigate(`/cms/feature-flags/${flagId}/edit`);
  };

  const handleBack = () => {
    navigate('/cms/feature-flags');
  };

  if (isLoading) {
    return (
      <section className={styles.flagDetailPage}>
        <div className={styles.flagDetailPageLoading}>
          <div className="loading-spinner" />
          <p>Загрузка feature flag...</p>
        </div>
      </section>
    );
  }

  if (!flag) {
    return (
      <section className={styles.flagDetailPage}>
        <div className={styles.flagDetailPageEmpty}>
          <h1>Feature flag не найден</h1>
          <Button variant="primary" onClick={handleBack}>
            ← Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.flagDetailPage}>
      <header className={styles.flagDetailPageHeader}>
        <Button variant="ghost" onClick={handleBack} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.flagDetailPageActions}>
          <PermissionGate permission={['cms:update']} fallback={null}>
            <Button
              variant="secondary"
              leftIcon={<FiEdit />}
              onClick={handleEdit}
            >
              Редактировать
            </Button>
          </PermissionGate>
        </div>
      </header>

      <div className={styles.flagDetailPageContent}>
        <InfoBlock
          title="Информация о feature flag"
          headerIcon={<FiFlag />}
          items={[
            {
              label: 'ID',
              value: flag.id,
              iconVariant: 'primary',
            },
            {
              label: 'Ключ',
              value: flag.key,
              iconVariant: 'secondary',
            },
            {
              label: 'Статус',
              value: flag.enabled ? 'Включен' : 'Выключен',
              iconVariant: flag.enabled ? 'success' : 'warning',
            },
          ]}
        />

        {flag.description && (
          <div className={styles.flagDetailPagePanel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelHeaderContent}>
                <h2 className={styles.panelTitle}>Описание</h2>
              </div>
            </div>
            <div className={styles.panelContent}>
              <p className={styles.flagDescription}>{flag.description}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
