import {useState, useEffect, useRef, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiEdit2, FiSave, FiX, FiShield, FiPhone, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button/Button';
import { Card } from '../../shared/ui/Card/Card';
import { LoadingState } from '../../shared/ui/LoadingState/LoadingState';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import { useSession } from '../../entities/session/model/SessionProvider';
import { getProfileRequest, updateProfileRequest } from './api/profileApi';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { fetchProfile } = useSession();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ fio: '' });

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProfileRequest();
      setProfile(data);
      setFormData({ fio: data.fio || '' });
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ fio: profile?.fio || '' });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfileRequest({ fio: formData.fio || null });
      await loadProfile();
      await fetchProfile();
      notificationsRef.current?.info('Профиль обновлён');
      setIsEditing(false);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isLoading) {
    return (
      <section className={styles.profilePage}>
        <LoadingState message="Загрузка профиля..." size="lg" />
      </section>
    );
  }

  if (!profile) {
    return (
      <section className={styles.profilePage}>
        <div className={styles.profilePageError}>
          <h2>Ошибка загрузки профиля</h2>
          <Button variant="primary" onClick={() => navigate('/')}>
            На главную
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.profilePage}>
      <header className={styles.profilePageHeader}>
        <h1 className={styles.profilePageTitle}>Мой профиль</h1>
        {!isEditing ? (
          <Button
            variant="secondary"
            leftIcon={<FiEdit2 />}
            onClick={handleEdit}
          >
            Редактировать
          </Button>
        ) : (
          <div className={styles.profilePageActions}>
            <Button
              variant="secondary"
              leftIcon={<FiX />}
              onClick={handleCancel}
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              leftIcon={<FiSave />}
              onClick={handleSave}
              loading={isSaving}
            >
              Сохранить
            </Button>
          </div>
        )}
      </header>

      <div className={styles.profilePageContent}>
        <Card>
          <div className={styles.profileCardAvatar}>
            <FiUser />
          </div>

          <div className={styles.profileCardInfo}>
            <div className={styles.profileCardRow}>
              <div className={styles.profileCardLabel}>
                <FiUser className={styles.profileCardIcon} />
                ФИО
              </div>
              {isEditing ? (
                <input
                  type="text"
                  name="fio"
                  value={formData.fio}
                  onChange={handleChange}
                  placeholder="Иванов Иван Иванович"
                  className={styles.profileCardInput}
                  maxLength={255}
                />
              ) : (
                <div className={styles.profileCardValue}>
                  {profile.fio || 'Не указано'}
                </div>
              )}
            </div>

            <div className={styles.profileCardRow}>
              <div className={styles.profileCardLabel}>
                <FiPhone className={styles.profileCardIcon} />
                Телефон
              </div>
              <div className={styles.profileCardValue}>
                {profile.phones?.[0]?.phone_number || 'Не указан'}
              </div>
            </div>

            <div className={styles.profileCardRow}>
              <div className={styles.profileCardLabel}>
                <FiShield className={styles.profileCardIcon} />
                Статус
              </div>
              <div className={styles.profileCardValue}>
                <span className={`${styles.profileCardStatus} ${profile.is_active ? styles.profileCardStatusActive : styles.profileCardStatusInactive}`}>
                  {profile.is_active ? 'Активен' : 'Заблокирован'}
                </span>
              </div>
            </div>

            <div className={styles.profileCardRow}>
              <div className={styles.profileCardLabel}>
                <FiCheckCircle className={styles.profileCardIcon} />
                Верификация
              </div>
              <div className={styles.profileCardValue}>
                <span className={`${styles.profileCardStatus} ${profile.is_verified ? styles.profileCardStatusActive : styles.profileCardStatusInactive}`}>
                  {profile.is_verified ? 'Верифицирован' : 'Не верифицирован'}
                </span>
              </div>
            </div>

            <div className={styles.profileCardRow}>
              <div className={styles.profileCardLabel}>
                <FiCalendar className={styles.profileCardIcon} />
                Дата регистрации
              </div>
              <div className={styles.profileCardValue}>
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'}
              </div>
            </div>

            {profile.updated_at && (
              <div className={styles.profileCardRow}>
                <div className={styles.profileCardLabel}>
                  <FiCalendar className={styles.profileCardIcon} />
                  Последнее обновление
                </div>
                <div className={styles.profileCardValue}>
                  {new Date(profile.updated_at).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card variant="secondary">
          <h2 className={styles.profileCardSubtitle}>Дополнительная информация</h2>

          <div className={styles.profileCardRow}>
            <div className={styles.profileCardLabel}>ID пользователя</div>
            <div className={`${styles.profileCardValue} ${styles.profileCardValueCode}`}>{profile.id}</div>
          </div>

          <div className={styles.profileCardRow}>
            <div className={styles.profileCardLabel}>Публичный ID</div>
            <div className={`${styles.profileCardValue} ${styles.profileCardValueCode}`}>{profile.public_id || '—'}</div>
          </div>

          {profile.last_login_at && (
            <div className={styles.profileCardRow}>
              <div className={styles.profileCardLabel}>Последний вход</div>
              <div className={styles.profileCardValue}>
                {new Date(profile.last_login_at).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
