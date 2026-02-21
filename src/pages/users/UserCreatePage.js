import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import { getAllGroupsRequest } from './api/usersApi';
import './UserCreatePage.css';

// Временная заглушка, так как API создания пользователя может отличаться
// По документации endpoint POST /users/admin/users не указан явно
// Используем PATCH для демонстрации функционала

export function UserCreatePage() {
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [formData, setFormData] = useState({
    phone_number: '',
    password: '',
    is_active: true,
    is_verified: false,
    group_id: '',
  });

  const [groups, setGroups] = useState([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadGroups = useCallback(async () => {
    if (groups.length > 0 || isLoadingGroups) return;

    setIsLoadingGroups(true);
    try {
      const allGroups = await getAllGroupsRequest();
      setGroups(allGroups);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [groups.length, isLoadingGroups, notifications]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация
    if (!formData.phone_number.trim()) {
      notifications.error('Введите номер телефона');
      return;
    }

    if (!formData.password.trim()) {
      notifications.error('Введите пароль');
      return;
    }

    setIsSubmitting(true);

    try {
      // Примечание: API создания пользователя должно быть добавлено на бэкенде
      // Временно показываем уведомление о том, что функционал в разработке
      notifications.info('Функция создания пользователя будет доступна после добавления API endpoint');
      
      // Когда API будет готов, раскомментировать:
      // const payload = {
      //   phone_number: formData.phone_number,
      //   password: formData.password,
      //   is_active: formData.is_active,
      //   is_verified: formData.is_verified,
      //   group_id: formData.group_id ? Number(formData.group_id) : undefined,
      // };
      // await createUserRequest(payload);
      // notifications.info('Пользователь создан');
      // navigate('/users');
      
    } catch (error) {
      const message = getApiErrorMessage(error);
      notifications.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="user-create-page">
      <header className="user-create-page__header">
        <div className="user-create-page__header-left">
          <Button variant="ghost" onClick={() => navigate('/users')}>
            ← Назад
          </Button>
          <h1 className="user-create-page__title">Создание пользователя</h1>
        </div>
      </header>

      <form className="user-create-page__form" onSubmit={handleSubmit}>
        <div className="user-create-form">
          <div className="user-create-form__section">
            <h2 className="user-create-form__section-title">Основные данные</h2>
            
            <label className="user-create-form__field">
              <span className="user-create-form__label">
                Номер телефона <span className="required">*</span>
              </span>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => handleChange('phone_number', e.target.value)}
                placeholder="+7 (999) 000-00-00"
                required
              />
            </label>

            <label className="user-create-form__field">
              <span className="user-create-form__label">
                Пароль <span className="required">*</span>
              </span>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Минимум 8 символов"
                required
                minLength={8}
              />
            </label>
          </div>

          <div className="user-create-form__section">
            <h2 className="user-create-form__section-title">Статус</h2>
            
            <div className="user-create-form__row">
              <label className="user-create-form__checkbox">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                />
                <span>Активный пользователь</span>
              </label>

              <label className="user-create-form__checkbox">
                <input
                  type="checkbox"
                  checked={formData.is_verified}
                  onChange={(e) => handleChange('is_verified', e.target.checked)}
                />
                <span>Верифицирован</span>
              </label>
            </div>
          </div>

          <div className="user-create-form__section">
            <h2 className="user-create-form__section-title">Группа</h2>
            
            <label className="user-create-form__field">
              <span className="user-create-form__label">Группа пользователей</span>
              <select
                value={formData.group_id}
                onChange={(e) => handleChange('group_id', e.target.value)}
                onFocus={loadGroups}
                disabled={isLoadingGroups}
              >
                <option value="">Без группы</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="user-create-page__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/users')}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<FiSave />}
            loading={isSubmitting}
          >
            Создать пользователя
          </Button>
        </div>
      </form>
    </section>
  );
}
