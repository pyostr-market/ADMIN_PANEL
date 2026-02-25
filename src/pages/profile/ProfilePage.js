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
import './ProfilePage.css';

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
      <section className="profile-page">
        <LoadingState message="Загрузка профиля..." size="lg" />
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="profile-page">
        <div className="profile-page__error">
          <h2>Ошибка загрузки профиля</h2>
          <Button variant="primary" onClick={() => navigate('/')}>
            На главную
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <header className="profile-page__header">
        <h1 className="profile-page__title">Мой профиль</h1>
        {!isEditing ? (
          <Button
            variant="secondary"
            leftIcon={<FiEdit2 />}
            onClick={handleEdit}
          >
            Редактировать
          </Button>
        ) : (
          <div className="profile-page__actions">
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

      <div className="profile-page__content">
        <Card>
          <div className="profile-card__avatar">
            <FiUser />
          </div>

          <div className="profile-card__info">
            <div className="profile-card__row">
              <div className="profile-card__label">
                <FiUser className="profile-card__icon" />
                ФИО
              </div>
              {isEditing ? (
                <input
                  type="text"
                  name="fio"
                  value={formData.fio}
                  onChange={handleChange}
                  placeholder="Иванов Иван Иванович"
                  className="profile-card__input"
                  maxLength={255}
                />
              ) : (
                <div className="profile-card__value">
                  {profile.fio || 'Не указано'}
                </div>
              )}
            </div>

            <div className="profile-card__row">
              <div className="profile-card__label">
                <FiPhone className="profile-card__icon" />
                Телефон
              </div>
              <div className="profile-card__value">
                {profile.phones?.[0]?.phone_number || 'Не указан'}
              </div>
            </div>

            <div className="profile-card__row">
              <div className="profile-card__label">
                <FiShield className="profile-card__icon" />
                Статус
              </div>
              <div className="profile-card__value">
                <span className={`profile-card__status ${profile.is_active ? 'status-active' : 'status-inactive'}`}>
                  {profile.is_active ? 'Активен' : 'Заблокирован'}
                </span>
              </div>
            </div>

            <div className="profile-card__row">
              <div className="profile-card__label">
                <FiCheckCircle className="profile-card__icon" />
                Верификация
              </div>
              <div className="profile-card__value">
                <span className={`profile-card__status ${profile.is_verified ? 'status-active' : 'status-inactive'}`}>
                  {profile.is_verified ? 'Верифицирован' : 'Не верифицирован'}
                </span>
              </div>
            </div>

            <div className="profile-card__row">
              <div className="profile-card__label">
                <FiCalendar className="profile-card__icon" />
                Дата регистрации
              </div>
              <div className="profile-card__value">
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
              <div className="profile-card__row">
                <div className="profile-card__label">
                  <FiCalendar className="profile-card__icon" />
                  Последнее обновление
                </div>
                <div className="profile-card__value">
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
          <h2 className="profile-card__subtitle">Дополнительная информация</h2>

          <div className="profile-card__row">
            <div className="profile-card__label">ID пользователя</div>
            <div className="profile-card__value code">{profile.id}</div>
          </div>

          <div className="profile-card__row">
            <div className="profile-card__label">Публичный ID</div>
            <div className="profile-card__value code">{profile.public_id || '—'}</div>
          </div>

          {profile.last_login_at && (
            <div className="profile-card__row">
              <div className="profile-card__label">Последний вход</div>
              <div className="profile-card__value">
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
