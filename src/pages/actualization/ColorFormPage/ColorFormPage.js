import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiTrash2, FiDisc } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { FormPage } from '../../../shared/ui/FormPage';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getColorByNameRequest,
  createColorRequest,
  updateColorRequest,
  getColorAssignsRequest,
  createColorAssignRequest,
  updateColorAssignRequest,
  deleteColorAssignRequest,
} from '../api/actualizationApi';
import styles from './ColorFormPage.module.css';

export function ColorFormPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { colorName } = useParams();

  const isEditMode = Boolean(colorName);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [formData, setFormData] = useState({
    name: '',
  });

  const [colorAssigns, setColorAssigns] = useState([]);
  const [newAssign, setNewAssign] = useState({ key: '', color: '' });
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);
  const [errors, setErrors] = useState({});

  const loadColor = useCallback(async () => {
    if (!colorName) return;
    
    setIsLoading(true);
    try {
      const data = await getColorByNameRequest(colorName);
      setFormData({
        name: data.name || '',
      });

      // Загружаем все назначения для этого цвета
      const assigns = await getColorAssignsRequest({ color: data.name });
      setColorAssigns(assigns);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [colorName]);

  useEffect(() => {
    if (isEditMode && colorName) {
      loadColor();
    }
  }, [colorName, isEditMode, loadColor]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите название цвета';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Название цвета не должно превышать 50 символов';
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

  const handleAssignChange = (field, value) => {
    setNewAssign((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAssign = async () => {
    const newErrors = {};
    if (!newAssign.key.trim()) {
      newErrors.key = 'Введите ключ назначения';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return;
    }

    setIsSubmittingAssign(true);
    try {
      const payload = {
        key: newAssign.key.trim(),
        color: formData.name.trim(), // Всегда используем название текущего цвета
      };

      await createColorAssignRequest(payload);
      notificationsRef.current?.info('Назначение цвета создано');
      
      setNewAssign({ key: '', color: '' });
      
      // Обновляем список назначений
      const assigns = await getColorAssignsRequest({ color: formData.name });
      setColorAssigns(assigns);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  const handleUpdateAssign = async (assignId, updatedData) => {
    setIsSubmittingAssign(true);
    try {
      await updateColorAssignRequest(assignId, updatedData);
      notificationsRef.current?.info('Назначение цвета обновлено');
      
      // Обновляем список назначений
      const assigns = await getColorAssignsRequest({ color: formData.name });
      setColorAssigns(assigns);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  const handleDeleteAssign = async (assignId) => {
    try {
      await deleteColorAssignRequest(assignId);
      notificationsRef.current?.info('Назначение цвета удалено');
      
      // Обновляем список назначений
      const assigns = await getColorAssignsRequest({ color: formData.name });
      setColorAssigns(assigns);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    }
  };

  const handleSubmit = async (stayOnPage = false) => {
    if (!validateForm()) {
      notificationsRef.current?.error('Исправьте ошибки в форме');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
      };

      if (isEditMode) {
        await updateColorRequest(colorName, payload);
        notificationsRef.current?.info('Цвет обновлен');

        if (stayOnPage) {
          // После обновления перенаправляем на новую страницу с новым именем
          navigate(`/actualization/colors/${encodeURIComponent(formData.name)}/edit`);
        }
      } else {
        await createColorRequest(payload);
        notificationsRef.current?.info('Цвет создан');

        if (stayOnPage) {
          // После создания перенаправляем на страницу редактирования
          navigate(`/actualization/colors/${encodeURIComponent(formData.name)}/edit`);
        }
      }

      if (!stayOnPage) {
        navigate('/actualization/colors');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(isEditMode ? `/actualization/colors/${encodeURIComponent(colorName)}` : '/actualization/colors');
  };

  return (
    <FormPage
      title={isEditMode ? 'Редактирование цвета' : 'Создание цвета'}
      backUrl={isEditMode ? `/actualization/colors/${encodeURIComponent(colorName)}` : '/actualization/colors'}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onSubmit={() => handleSubmit(false)}
      onSubmitAndStay={() => handleSubmit(true)}
      showSubmitStay={true}
      submitText={isEditMode ? 'Сохранить' : 'Создать'}
    >
      <FormSection
        icon={<FiDisc />}
        iconVariant="primary"
        title="Основная информация"
        description="Данные о цвете"
      >
        <FormGrid columns={1}>
          <div className={styles.colorFormField}>
            <label className={styles.colorFormLabel}>
              Название цвета <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Введите название цвета"
              className={errors.name ? 'input-error' : ''}
              disabled={isSubmitting}
            />
            {errors.name && (
              <span className={styles.colorFormError}>{errors.name}</span>
            )}
          </div>
        </FormGrid>
      </FormSection>

      {isEditMode && (
        <FormSection
          icon={<FiPlus />}
          iconVariant="secondary"
          title="Назначения цветов (Color Assign)"
          description="Создавайте и управляйте назначениями цветов"
        >
          <div className={styles.assignForm}>
            <div className={styles.assignFormRow}>
              <div className={styles.assignFormField}>
                <label className={styles.assignFormLabel}>Ключ (key)</label>
                <input
                  type="text"
                  value={newAssign.key}
                  onChange={(e) => handleAssignChange('key', e.target.value)}
                  placeholder="Введите ключ"
                  className={errors.key ? 'input-error' : ''}
                  disabled={isSubmittingAssign}
                />
                {errors.key && (
                  <span className={styles.colorFormError}>{errors.key}</span>
                )}
              </div>

              <div className={styles.assignFormField}>
                <label className={styles.assignFormLabel}>Цвет (color)</label>
                <input
                  type="text"
                  value={formData.name}
                  disabled
                  className={styles.inlineInputDisabled}
                />

              </div>

              <Button
                variant="primary"
                onClick={handleAddAssign}
                loading={isSubmittingAssign}
                disabled={!newAssign.key.trim() || !formData.name.trim()}
                className={styles.btnAddAssign}
              >
                Добавить
              </Button>
            </div>
          </div>

          {colorAssigns.length > 0 && (
            <div className={styles.assignsList}>
              <table className={styles.assignsTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ключ (key)</th>
                    <th>Цвет (color)</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {colorAssigns.map((assign) => (
                    <tr key={assign.id}>
                      <td>{assign.id}</td>
                      <td>
                        <input
                          type="text"
                          defaultValue={assign.key}
                          onBlur={(e) => {
                            if (e.target.value !== assign.key) {
                              handleUpdateAssign(assign.id, { key: e.target.value });
                            }
                          }}
                          className={styles.inlineInput}
                          disabled={isSubmittingAssign}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          defaultValue={assign.color}
                          disabled
                          className={styles.inlineInputDisabled}
                        />
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAssign(assign.id)}
                          disabled={isSubmittingAssign}
                          className={styles.btnDeleteAssign}
                        >
                          <FiTrash2 />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </FormSection>
      )}
    </FormPage>
  );
}
