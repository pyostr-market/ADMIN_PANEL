import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FormPage } from '../../../shared/ui/FormPage';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
import { AutocompleteInput } from '../../../shared/ui/AutocompleteInput/AutocompleteInput';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getRegionByIdRequest,
  createRegionRequest,
  updateRegionRequest,
  getRegionsForAutocompleteRequest,
} from '../api/regionsApi';
import styles from './RegionFormPage.module.css';

export function RegionFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { regionId } = useParams();

  const isEditMode = Boolean(regionId);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
  });

  // Храним полный объект для autocomplete
  const [selectedParent, setSelectedParent] = useState(null);

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const navigateWithParams = useCallback((path) => {
    const paramsString = searchParams.toString();
    const fullPath = paramsString ? `${path}?${paramsString}` : path;
    navigate(fullPath);
  }, [navigate, searchParams]);

  const loadRegion = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getRegionByIdRequest(regionId);
      setFormData({
        name: data.name || '',
        parent_id: data.parent_id || '',
      });
      // Сохраняем полный объект для autocomplete
      if (data.parent) {
        setSelectedParent(data.parent);
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [regionId]);

  useEffect(() => {
    if (isEditMode && regionId) {
      loadRegion();
    }
  }, [regionId, isEditMode, loadRegion]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите название региона';
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

  const handleSubmit = async (stayOnPage = false) => {
    if (!validateForm()) {
      notificationsRef.current?.error('Исправьте ошибки в форме');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
      };

      if (isEditMode) {
        const responseData = await updateRegionRequest(regionId, payload);
        notificationsRef.current?.info('Регион обновлен');

        if (stayOnPage && responseData) {
          setFormData({
            name: responseData.name || formData.name,
            parent_id: responseData.parent_id || formData.parent_id,
          });
          setSelectedParent(responseData.parent || selectedParent);
        }
      } else {
        const responseData = await createRegionRequest(payload);
        notificationsRef.current?.info('Регион создан');

        if (stayOnPage) {
          const newRegionId = responseData?.id;
          if (newRegionId) {
            navigateWithParams(`/settings/regions/${newRegionId}`);
          }
        }
      }

      if (!stayOnPage) {
        navigateWithParams('/settings/regions');
      }
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    const backUrl = isEditMode ? `/settings/regions/${regionId}` : '/settings/regions';
    navigateWithParams(backUrl);
  };

  return (
    <FormPage
      title={isEditMode ? 'Редактирование региона' : 'Создание региона'}
      backUrl={isEditMode ? `/settings/regions/${regionId}` : '/settings/regions'}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onSubmit={() => handleSubmit(false)}
      onSubmitAndStay={() => handleSubmit(true)}
      showSubmitStay={true}
      submitText={isEditMode ? 'Сохранить' : 'Создать'}
    >
      <FormSection
        icon={<span>🗺️</span>}
        iconVariant="primary"
        title="Основная информация"
        description="Данные о регионе"
      >
        <FormGrid columns={2}>
          <div className={styles.regionFormField}>
            <label className={styles.regionFormLabel}>
              Название <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Введите название региона"
              className={errors.name ? 'input-error' : ''}
              disabled={isSubmitting}
            />
            {errors.name && (
              <span className={styles.regionFormError}>{errors.name}</span>
            )}
          </div>

          <div className={styles.regionFormField}>
            <AutocompleteInput
              label="Родительский регион"
              value={formData.parent_id}
              onChange={(value) => handleChange('parent_id', value)}
              fetchOptions={getRegionsForAutocompleteRequest}
              placeholder="Начните ввод для поиска родительского региона..."
              selectedOption={selectedParent}
              getOptionValue={(option) => option.name}
            />
            <span className={styles.regionFormHint}>
              Укажите родительский регион для создания иерархии
            </span>
          </div>
        </FormGrid>
      </FormSection>
    </FormPage>
  );
}
