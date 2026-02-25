import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiUser, FiLock, FiPhone, FiShield, FiCheckCircle } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { PageHeader } from '../../../shared/ui/PageHeader/PageHeader';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
import { PageActions } from '../../../shared/ui/PageActions/PageActions';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import { getAllGroupsRequest } from '../api/usersApi';
import styles from './UserCreatePage.module.css';

export function UserCreatePage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);

  // Обновляем ref при изменении notifications
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

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
      notificationsRef.current?.error(message);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [groups.length, isLoadingGroups]);

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

  const handleSubmit = async (e, stayOnPage = false) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      notificationsRef.current?.error('Исправьте ошибки в форме');
      return;
    }

    setIsSubmitting(true);

    try {
      // Примечание: API создания пользователя должно быть добавлено на бэкенде
      notificationsRef.current?.info('Функция создания пользователя будет доступна после добавления API endpoint');

      // Когда API будет готов, раскомментировать:
      // const payload = {
      //   phone_number: formData.phone_number,
      //   password: formData.password,
      //   is_active: formData.is_active,
      //   is_verified: formData.is_verified,
      //   group_id: formData.group_id ? Number(formData.group_id) : undefined,
      // };
      // await createUserRequest(payload);
      // notifications.success('Пользователь создан');
      // if (!stayOnPage) {
      //   navigate('/users');
      // }

    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.userCreatePage}>
      <PageHeader
        title="Создание пользователя"
        subtitle="Заполните форму для добавления нового пользователя"
        onBack={() => navigate('/users')}
      />

      <form className={styles.userCreatePageForm} onSubmit={handleSubmit}>
        <div className={styles.userCreateForm}>
          <FormSection
            icon={<FiUser />}
            iconVariant="primary"
            title="Основные данные"
            description="Учётные данные пользователя"
          >
            <FormGrid columns={2}>
              <div className={styles.userCreateFormField}>
                <label className={styles.userCreateFormLabel}>
                  <FiPhone className={styles.userCreateFormLabelIcon} />
                  Номер телефона <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) => handleChange('phone_number', e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className={errors.phone_number ? styles.inputError : ''}
                />
                {errors.phone_number && (
                  <span className={styles.userCreateFormError}>{errors.phone_number}</span>
                )}
              </div>

              <div className={styles.userCreateFormField}>
                <label className={styles.userCreateFormLabel}>
                  <FiLock className={styles.userCreateFormLabelIcon} />
                  Пароль <span className="required">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Минимум 8 символов"
                  className={errors.password ? styles.inputError : ''}
                />
                {errors.password && (
                  <span className={styles.userCreateFormError}>{errors.password}</span>
                )}
              </div>

              <div className={`${styles.userCreateFormField} ${styles.userCreateFormFieldFull}`}>
                <label className={styles.userCreateFormLabel}>
                  <FiLock className={styles.userCreateFormLabelIcon} />
                  Подтверждение пароля <span className="required">*</span>
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Повторите пароль"
                  className={errors.confirmPassword ? styles.inputError : ''}
                />
                {errors.confirmPassword && (
                  <span className={styles.userCreateFormError}>{errors.confirmPassword}</span>
                )}
              </div>
            </FormGrid>
          </FormSection>

          <FormSection
            icon={<FiCheckCircle />}
            iconVariant="success"
            title="Статус"
            description="Настройки доступа и верификации"
          >
            <div className={styles.userCreateFormToggles}>
              <label className={styles.userCreateFormToggle}>
                <div className={styles.userCreateFormToggleContent}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                  />
                  <div className={styles.userCreateFormToggleInfo}>
                    <span className={styles.userCreateFormToggleTitle}>Активный пользователь</span>
                    <span className={styles.userCreateFormToggleDescription}>
                      Пользователь сможет войти в систему
                    </span>
                  </div>
                </div>
                <span className={`${styles.userCreateFormToggleStatus} ${formData.is_active ? styles.statusActive : styles.statusInactive}`}>
                  {formData.is_active ? 'Активен' : 'Неактивен'}
                </span>
              </label>

              <label className={styles.userCreateFormToggle}>
                <div className={styles.userCreateFormToggleContent}>
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => handleChange('is_verified', e.target.checked)}
                  />
                  <div className={styles.userCreateFormToggleInfo}>
                    <span className={styles.userCreateFormToggleTitle}>Верифицирован</span>
                    <span className={styles.userCreateFormToggleDescription}>
                      Подтверждённая учётная запись
                    </span>
                  </div>
                </div>
                <span className={`${styles.userCreateFormToggleStatus} ${formData.is_verified ? styles.statusActive : styles.statusInactive}`}>
                  {formData.is_verified ? 'Да' : 'Нет'}
                </span>
              </label>
            </div>
          </FormSection>

          <FormSection
            icon={<FiShield />}
            iconVariant="info"
            title="Группа"
            description="Назначение группы прав"
          >
            <div className={styles.userCreateFormField}>
              <label className={styles.userCreateFormLabel}>Группа пользователей</label>
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
                <span className={styles.userCreateFormLoading}>Загрузка групп...</span>
              )}
            </div>
          </FormSection>
        </div>

        <PageActions>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/users')}
            leftIcon={<FiX />}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="primary"
            leftIcon={<FiSave />}
            loading={isSubmitting}
            size="lg"
            onClick={() => handleSubmit(null, true)}
          >
            Сохранить и продолжить редактирование
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
        </PageActions>
      </form>
    </section>
  );
}
