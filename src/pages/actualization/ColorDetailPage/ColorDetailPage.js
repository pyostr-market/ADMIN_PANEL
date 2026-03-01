import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit, FiArrowLeft, FiDisc, FiList } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { InfoBlock } from '../../../shared/ui/InfoBlock/InfoBlock';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import {
  getColorByNameRequest,
  getColorAssignsRequest,
} from '../api/actualizationApi';
import styles from './ColorDetailPage.module.css';

export function ColorDetailPage() {
  const { colorName } = useParams();
  const navigate = useNavigate();

  const [color, setColor] = useState(null);
  const [colorAssigns, setColorAssigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadColorData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getColorByNameRequest(colorName);
      setColor(data);

      // Загружаем все назначения для этого цвета
      const assigns = await getColorAssignsRequest({ color: data.name });
      setColorAssigns(assigns);
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error('Ошибка загрузки цвета:', message);
    } finally {
      setIsLoading(false);
    }
  }, [colorName]);

  useEffect(() => {
    loadColorData();
  }, [colorName, loadColorData]);

  const handleEdit = () => {
    navigate(`/actualization/colors/${encodeURIComponent(colorName)}/edit`);
  };

  const handleBack = () => {
    navigate('/actualization/colors');
  };

  if (isLoading) {
    return (
      <section className={styles.colorDetailPage}>
        <div className={styles.colorDetailPageLoading}>
          <div className="loading-spinner" />
          <p>Загрузка данных цвета...</p>
        </div>
      </section>
    );
  }

  if (!color) {
    return (
      <section className={styles.colorDetailPage}>
        <div className={styles.colorDetailPageEmpty}>
          <h1>Цвет не найден</h1>
          <Button variant="primary" leftIcon={<FiArrowLeft />} onClick={handleBack}>
            Назад к списку
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.colorDetailPage}>
      <header className={styles.colorDetailPageHeader}>
        <Button variant="ghost" onClick={handleBack} className={styles.backButton}>
          ← Назад
        </Button>
        <div className={styles.colorDetailPageActions}>
          <Button
            variant="secondary"
            leftIcon={<FiEdit />}
            onClick={handleEdit}
          >
            Редактировать
          </Button>
        </div>
      </header>

      <div className={styles.colorDetailPageContent}>
        <InfoBlock
          title="Информация"
          headerIcon={<FiDisc />}
          items={[
            {
              label: 'Название цвета',
              value: color.name || '—',
              iconVariant: 'primary',
            },
          ]}
        />

        {colorAssigns.length > 0 && (
          <div className={styles.colorDetailPagePanel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelHeaderContent}>
                <FiList className={styles.panelIcon} />
                <h2 className={styles.panelTitle}>Назначения цветов</h2>
              </div>
            </div>
            <div className={styles.panelContent}>
              <table className={styles.colorAssignsTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ключ (key)</th>
                    <th>Цвет (color)</th>
                  </tr>
                </thead>
                <tbody>
                  {colorAssigns.map((assign) => (
                    <tr key={assign.id}>
                      <td>{assign.id}</td>
                      <td>{assign.key}</td>
                      <td>{assign.color}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {colorAssigns.length === 0 && (
          <div className={styles.colorDetailPagePanel}>
            <div className={styles.panelContent}>
              <p className={styles.emptyMessage}>
                Назначения цветов отсутствуют. Создайте их на странице редактирования.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
