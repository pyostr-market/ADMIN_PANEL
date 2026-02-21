import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiUser, FiLock, FiPhone, FiShield, FiCheckCircle } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import { getAllGroupsRequest } from './api/usersApi';
import './UserCreatePage.css';

export function UserCreatePage() {
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [formData, setFormData] = useState({
    phone_number: '',
    password: '',
    confirmPassword: '',
    is_active: true,
    is_verified: false,
    group_id: '',
  });

  const [groups, setGroups] = useState([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Введите номер телефона';
    } else if (!/^\+?[\d\s()-]{10,}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Введите корректный номер телефона';
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      notifications.error('Исправьте ошибки в форме');
      return;
    }

    setIsSubmitting(true);

    try {
      // Примечание: API создания пользователя должно быть добавлено на бэкенде
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
      {/* Header */}
      <header className="user-create-page__header">
        <div className="user-create-page__header-left">
          <Button variant="ghost" onClick={() => navigate('/users')} className="back-button">
            ← Назад
          </Button>
          <div className="user-create-page__title-wrapper">
            <h1 className="user-create-page__title">Создание пользователя</h1>
            <p className="user-create-page__subtitle">Заполните форму для добавления нового пользователя</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <form className="user-create-page__form" onSubmit={handleSubmit}>
        <div className="user-create-form">
          {/* Основные данные */}
          <div className="user-create-form__section">
            <div className="user-create-form__section-header">
              <div className="user-create-form__section-icon user-create-form__section-icon--primary">
                <FiUser />
              </div>
              <div>
                <h2 className="user-create-form__section-title">Основные данные</h2>
                <p className="user-create-form__section-description">Учётные данные пользователя</p>
              </div>
            </div>
            
            <div className="user-create-form__grid">
              <div className="user-create-form__field">
                <label className="user-create-form__label">
                  <FiPhone className="user-create-form__label-icon" />
                  Номер телефона <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) => handleChange('phone_number', e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className={errors.phone_number ? 'input-error' : ''}
                />
                {errors.phone_number && (
                  <span className="user-create-form__error">{errors.phone_number}</span>
                )}
              </div>

              <div className="user-create-form__field">
                <label className="user-create-form__label">
                  <FiLock className="user-create-form__label-icon" />
                  Пароль <span className="required">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Минимум 8 символов"
                  className={errors.password ? 'input-error' : ''}
                />
                {errors.password && (
                  <span className="user-create-form__error">{errors.password}</span>
                )}
              </div>

              <div className="user-create-form__field">
                <label className="user-create-form__label">
                  <FiLock className="user-create-form__label-icon" />
                  Подтверждение пароля <span className="required">*</span>
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Повторите пароль"
                  className={errors.confirmPassword ? 'input-error' : ''}
                />
                {errors.confirmPassword && (
                  <span className="user-create-form__error">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          </div>

          {/* Статус */}
          <div className="user-create-form__section">
            <div className="user-create-form__section-header">
              <div className="user-create-form__section-icon user-create-form__section-icon--success">
                <FiCheckCircle />
              </div>
              <div>
                <h2 className="user-create-form__section-title">Статус</h2>
                <p className="user-create-form__section-description">Настройки доступа и верификации</p>
              </div>
            </div>
            
            <div className="user-create-form__toggles">
              <label className="user-create-form__toggle">
                <div className="user-create-form__toggle-content">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                  />
                  <div className="user-create-form__toggle-info">
                    <span className="user-create-form__toggle-title">Активный пользователь</span>
                    <span className="user-create-form__toggle-description">
                      Пользователь сможет войти в систему
                    </span>
                  </div>
                </div>
                <span className={`user-create-form__toggle-status ${formData.is_active ? 'status-active' : 'status-inactive'}`}>
                  {formData.is_active ? 'Активен' : 'Неактивен'}
                </span>
              </label>

              <label className="user-create-form__toggle">
                <div className="user-create-form__toggle-content">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => handleChange('is_verified', e.target.checked)}
                  />
                  <div className="user-create-form__toggle-info">
                    <span className="user-create-form__toggle-title">Верифицирован</span>
                    <span className="user-create-form__toggle-description">
                      Подтверждённая учётная запись
                    </span>
                  </div>
                </div>
                <span className={`user-create-form__toggle-status ${formData.is_verified ? 'status-active' : 'status-inactive'}`}>
                  {formData.is_verified ? 'Да' : 'Нет'}
                </span>
              </label>
            </div>
          </div>

          {/* Группа */}
          <div className="user-create-form__section">
            <div className="user-create-form__section-header">
              <div className="user-create-form__section-icon user-create-form__section-icon--info">
                <FiShield />
              </div>
              <div>
                <h2 className="user-create-form__section-title">Группа</h2>
                <p className="user-create-form__section-description">Назначение группы прав</p>
              </div>
            </div>
            
            <div className="user-create-form__field">
              <label className="user-create-form__label">Группа пользователей</label>
              <select
                value={formData.group_id}
                onChange={(e) => handleChange('group_id', e.target.value)}
                onFocus={loadGroups}
                disabled={isLoadingGroups}
              >
                <option value="">Без группы (базовые права)</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              {isLoadingGroups && (
                <span className="user-create-form__loading">Загрузка групп...</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="user-create-page__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/users')}
            leftIcon={<FiX />}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<FiSave />}
            loading={isSubmitting}
            size="lg"
          >
            Создать пользователя
          </Button>
        </div>
      </form>
    </section>
  );
}
