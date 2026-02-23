import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiPlus, FiTrash2, FiImage, FiTag, FiFileText } from 'react-icons/fi';
import { Button } from '../../shared/ui/Button';
import { Tabs, Tab } from '../../shared/ui/Tabs';
import { ImageCarousel } from '../../shared/ui/ImageCarousel';
import { AutocompleteInput } from '../../shared/ui/AutocompleteInput';
import { getApiErrorMessage } from '../../shared/api/apiError';
import { useNotifications } from '../../shared/lib/notifications/NotificationProvider';
import {
  getProductByIdRequest,
  createProductRequest,
  updateProductRequest,
  getCategoriesForAutocompleteRequest,
  getSuppliersForAutocompleteRequest,
  getProductTypesForAutocompleteRequest,
} from './api/productsApi';
import './ProductFormPage.css';

// Вкладки формы
const TABS = {
  MAIN: 'main',
  IMAGES: 'images',
  ATTRIBUTES: 'attributes',
};

export function ProductFormPage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const notificationsRef = useRef(notifications);
  const { productId } = useParams();

  const isEditMode = Boolean(productId);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const [activeTab, setActiveTab] = useState(TABS.MAIN);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category_id: '',
    supplier_id: '',
    product_type_id: '',
  });

  const [images, setImages] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [newAttribute, setNewAttribute] = useState({ name: '', value: '', is_filterable: false });

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProductByIdRequest(productId);
      console.log('[ProductForm] Загруженные данные товара:', data);
      console.log('[ProductForm] Изображения из API:', data.images);
      setFormData({
        name: data.name || '',
        price: data.price?.toString() || '',
        description: data.description || '',
        category_id: data.category_id?.toString() || '',
        supplier_id: data.supplier_id?.toString() || '',
        product_type_id: data.product_type_id?.toString() || '',
      });
      // Сохраняем все данные изображения
      // API возвращает: image_id, image_key (путь к файлу), image_url (полный URL), ordering, upload_id
      const processedImages = data.images?.map((img, index) => {
        console.log('[ProductForm] Обработка изображения:', img);
        return {
          image_id: img.image_id,
          image_key: img.image_key, // путь к файлу в S3
          image_url: img.image_url, // полный URL для отображения
          upload_id: img.upload_id, // ID загруженного файла
          is_main: img.is_main === true,
          ordering: img.ordering ?? index, // порядок из API или по индексу
          isNew: false,
          toDelete: false,
        };
      }) || [];
      
      // Проверка: сколько главных изображений вернул сервер
      const mainCount = processedImages.filter(img => img.is_main).length;
      console.log('[ProductForm] Обработанные изображения:', processedImages);
      console.log('[ProductForm] Главных изображений из API:', mainCount);
      
      if (mainCount > 1) {
        console.warn('[ProductForm] СЕРВЕР вернул несколько главных изображений! Устанавливаем только первое.');
        processedImages.forEach((img, idx) => {
          img.is_main = idx === 0;
        });
      } else if (mainCount === 0 && processedImages.length > 0) {
        console.warn('[ProductForm] СЕРВЕР не вернул главное изображение! Устанавливаем первое.');
        processedImages[0].is_main = true;
      }
      
      setImages(processedImages);
      setAttributes(data.attributes?.map(attr => ({
        id: attr.id,
        name: attr.name,
        value: attr.value,
        is_filterable: attr.is_filterable,
      })) || []);
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (isEditMode && productId) {
      loadProduct();
    }
  }, [productId, isEditMode, loadProduct]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите название товара';
    }

    if (!formData.price) {
      newErrors.price = 'Введите цену товара';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Введите корректную цену (неотрицательное число)';
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

  const handleImagesChange = useCallback((newImages) => {
    setImages(newImages);
  }, []);

  const handleAddAttribute = useCallback(() => {
    if (!newAttribute.name.trim() || !newAttribute.value) {
      notificationsRef.current?.error('Заполните название и значение атрибута');
      return;
    }

    setAttributes((prev) => [
      ...prev,
      {
        id: null,
        name: newAttribute.name.trim(),
        value: newAttribute.value,
        is_filterable: newAttribute.is_filterable,
        isNew: true,
      },
    ]);
    setNewAttribute({ name: '', value: '', is_filterable: false });
  }, [newAttribute]);

  const handleRemoveAttribute = useCallback((index) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAttributeChange = useCallback((index, field, value) => {
    setAttributes((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr))
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      notificationsRef.current?.error('Исправьте ошибки в форме');
      return;
    }

    // Проверяем, что все изображения загружены (есть upload_id)
    const uploadingImages = images.filter(img => img.pendingUploadKey || !img.upload_id);
    if (uploadingImages.length > 0) {
      notificationsRef.current?.error('Дождитесь завершения загрузки всех изображений');
      return;
    }

    // Проверяем, что есть изображения с upload_id
    const uploadedImages = images.filter(img => img.upload_id && !img.toDelete);
    if (uploadedImages.length === 0 && images.length > 0) {
      notificationsRef.current?.error('Изображения не загружены или помечены на удаление');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Основные поля
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('price', parseFloat(formData.price));
      if (formData.description) {
        formDataToSend.append('description', formData.description.trim());
      }
      if (formData.category_id) {
        formDataToSend.append('category_id', parseInt(formData.category_id, 10));
      }
      if (formData.supplier_id) {
        formDataToSend.append('supplier_id', parseInt(formData.supplier_id, 10));
      }
      if (formData.product_type_id) {
        formDataToSend.append('product_type_id', parseInt(formData.product_type_id, 10));
      }

      // Атрибуты
      if (attributes.length > 0) {
        const attributesJson = JSON.stringify(
          attributes.map(({ id, name, value, is_filterable }) => ({
            id,
            name,
            value,
            is_filterable,
          }))
        );
        formDataToSend.append('attributes_json', attributesJson);
      }

      // Изображения
      // К моменту отправки все изображения уже загружены на сервер и имеют upload_id
      const imagesToSend = images.filter(img => !img.toDelete);

      const imagesJson = imagesToSend.map((image, idx) => {
        // Новые изображения (isNew=true) отправляем с action: 'to_create'
        // Существующие изображения отправляем с action: 'pass'
        return {
          action: image.isNew ? 'to_create' : 'pass',
          upload_id: image.upload_id,
          is_main: image.is_main === true,
          ordering: idx,
        };
      });

      // Добавляем операции to_delete для удалённых изображений
      images
        .filter(img => img.toDelete)
        .forEach((image) => {
          imagesJson.push({
            action: 'to_delete',
            upload_id: image.upload_id,
          });
        });

      // Проверка: только одно изображение должно быть главным
      const mainImages = imagesJson.filter(img => img.is_main === true);
      if (mainImages.length > 1) {
        console.warn('[ProductForm] ВНИМАНИЕ: Несколько главных изображений!', mainImages.length);
        // Исправляем: оставляем только первое главное
        let foundMain = false;
        imagesJson.forEach(img => {
          if (img.is_main === true) {
            if (foundMain) {
              img.is_main = false;
            }
            foundMain = true;
          }
        });
      }
      if (mainImages.length === 0 && imagesJson.filter(img => img.action !== 'to_delete').length > 0) {
        console.warn('[ProductForm] ВНИМАНИЕ: Нет главного изображения!');
      }

      console.log('[ProductForm] Отправка изображений:', {
        total: images.length,
        toDelete: images.filter(i => i.toDelete).length,
        pass: images.filter(i => !i.toDelete).length,
        allImages: images.map(i => ({
          image_id: i.image_id,
          image_key: i.image_key,
          upload_id: i.upload_id,
          is_main: i.is_main,
          ordering: i.ordering,
          isNew: i.isNew,
          toDelete: i.toDelete
        })),
        imagesJson,
      });

      formDataToSend.append('images_json', JSON.stringify(imagesJson));

      if (isEditMode) {
        const responseData = await updateProductRequest(productId, formDataToSend);
        console.log('[ProductForm] Ответ от updateProductRequest:', responseData);
        handleApiResponse(responseData);
        notificationsRef.current?.info('Товар обновлен');
      } else {
        const responseData = await createProductRequest(formDataToSend);
        console.log('[ProductForm] Ответ от createProductRequest:', responseData);
        handleApiResponse(responseData);
        notificationsRef.current?.info('Товар создан');
      }

      navigate('/catalog/products');
    } catch (error) {
      const message = getApiErrorMessage(error);
      notificationsRef.current?.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработка ответа от сервера после обновления
  const handleApiResponse = useCallback((responseData) => {
    console.log('[ProductForm] Ответ от сервера:', responseData);
    if (responseData.images) {
      // Обновляем изображения с новыми данными от сервера (image_id, image_key, ordering, upload_id)
      const updatedImages = responseData.images.map((apiImg) => ({
        image_id: apiImg.image_id,
        image_key: apiImg.image_key,
        image_url: apiImg.image_url,
        upload_id: apiImg.upload_id,
        is_main: apiImg.is_main,
        ordering: apiImg.ordering,
        isNew: false, // Теперь это не новые изображения
        toDelete: false,
      }));
      console.log('[ProductForm] Обновлённые изображения:', updatedImages);
      setImages(updatedImages);
    }
  }, []);

  if (isLoading) {
    return (
      <section className="product-form-page">
        <div className="product-form-page__loading">
          <div className="loading-spinner" />
          <p>Загрузка данных товара...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="product-form-page">
      <header className="product-form-page__header">
        <Button variant="ghost" onClick={() => navigate(isEditMode ? `/catalog/products/${productId}` : '/catalog/products')} className="back-button">
          ← Назад
        </Button>
        <h1 className="product-form-page__title">
          {isEditMode ? 'Редактирование товара' : 'Создание товара'}
        </h1>
      </header>

      <div className="product-form-page__tabs">
        <Tabs>
          <Tab
            active={activeTab === TABS.MAIN}
            onClick={() => setActiveTab(TABS.MAIN)}
          >
            <FiTag /> Основная информация
          </Tab>
          <Tab
            active={activeTab === TABS.IMAGES}
            onClick={() => setActiveTab(TABS.IMAGES)}
          >
            <FiImage /> Изображения ({images.length})
          </Tab>
          <Tab
            active={activeTab === TABS.ATTRIBUTES}
            onClick={() => setActiveTab(TABS.ATTRIBUTES)}
          >
            <FiFileText /> Атрибуты ({attributes.length})
          </Tab>
        </Tabs>
      </div>

      <form className="product-form-page__form" onSubmit={handleSubmit}>
        {activeTab === TABS.MAIN && (
          <div className="product-form">
            <div className="product-form__section">
              <div className="product-form__section-header">
                <div className="product-form__section-icon product-form__section-icon--primary">
                  <FiTag />
                </div>
                <div>
                  <h2 className="product-form__section-title">Основная информация</h2>
                  <p className="product-form__section-description">Базовые данные о товаре</p>
                </div>
              </div>

              <div className="product-form__grid">
                <div className="product-form__field product-form__field--full">
                  <label className="product-form__label">
                    Название <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Введите название товара"
                    className={errors.name ? 'input-error' : ''}
                  />
                  {errors.name && (
                    <span className="product-form__error">{errors.name}</span>
                  )}
                </div>

                <div className="product-form__field">
                  <label className="product-form__label">
                    Цена <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="0.00"
                    className={errors.price ? 'input-error' : ''}
                  />
                  {errors.price && (
                    <span className="product-form__error">{errors.price}</span>
                  )}
                </div>

                <div className="product-form__field product-form__field--full">
                  <label className="product-form__label">
                    <FiFileText className="product-form__label-icon" />
                    Описание
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Введите описание товара"
                    rows={4}
                    className={errors.description ? 'input-error' : ''}
                  />
                  {errors.description && (
                    <span className="product-form__error">{errors.description}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="product-form__section">
              <div className="product-form__section-header">
                <div className="product-form__section-icon product-form__section-icon--secondary">
                  <FiPackage />
                </div>
                <div>
                  <h2 className="product-form__section-title">Классификация</h2>
                  <p className="product-form__section-description">Категория, тип продукта и поставщики</p>
                </div>
              </div>

              <div className="product-form__grid">
                <div className="product-form__field">
                  <AutocompleteInput
                    label="Категория"
                    value={formData.category_id}
                    onChange={(value) => handleChange('category_id', value)}
                    fetchOptions={getCategoriesForAutocompleteRequest}
                    placeholder="Начните ввод для поиска категории..."
                    searchField="name"
                  />
                </div>

                <div className="product-form__field">
                  <AutocompleteInput
                    label="Тип продукта"
                    value={formData.product_type_id}
                    onChange={(value) => handleChange('product_type_id', value)}
                    fetchOptions={getProductTypesForAutocompleteRequest}
                    placeholder="Начните ввод для поиска типа продукта..."
                    searchField="name"
                  />
                </div>

                <div className="product-form__field">
                  <AutocompleteInput
                    label="Поставщик"
                    value={formData.supplier_id}
                    onChange={(value) => handleChange('supplier_id', value)}
                    fetchOptions={getSuppliersForAutocompleteRequest}
                    placeholder="Начните ввод для поиска поставщика..."
                    searchField="name"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === TABS.IMAGES && (
          <div className="product-form">
            <div className="product-form__section">
              <div className="product-form__section-header">
                <div className="product-form__section-icon product-form__section-icon--accent">
                  <FiImage />
                </div>
                <div>
                  <h2 className="product-form__section-title">Изображения товара</h2>
                  <p className="product-form__section-description">
                    Загрузите изображения товара. Перетаскивайте для изменения порядка. Первое изображение будет главным.
                  </p>
                </div>
              </div>

              <ImageCarousel
                images={images}
                onImagesChange={handleImagesChange}
                multiple
                showDelete
                disabled={isSubmitting}
                folder="products"
              />
            </div>
          </div>
        )}

        {activeTab === TABS.ATTRIBUTES && (
          <div className="product-form">
            <div className="product-form__section">
              <div className="product-form__section-header">
                <div className="product-form__section-icon product-form__section-icon--info">
                  <FiFileText />
                </div>
                <div>
                  <h2 className="product-form__section-title">Атрибуты товара</h2>
                  <p className="product-form__section-description">
                    Добавьте характеристики товара (размер, цвет, материал и т.д.)
                  </p>
                </div>
              </div>

              {/* Форма добавления нового атрибута */}
              <div className="attributes-form">
                <div className="attributes-form__row">
                  <input
                    type="text"
                    value={newAttribute.name}
                    onChange={(e) => setNewAttribute((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Название атрибута (например, Цвет)"
                    className="attributes-form__input"
                  />
                  <input
                    type="text"
                    value={newAttribute.value}
                    onChange={(e) => setNewAttribute((prev) => ({ ...prev, value: e.target.value }))}
                    placeholder="Значение (например, Красный)"
                    className="attributes-form__input"
                  />
                  <label className="attributes-form__checkbox">
                    <input
                      type="checkbox"
                      checked={newAttribute.is_filterable}
                      onChange={(e) => setNewAttribute((prev) => ({ ...prev, is_filterable: e.target.checked }))}
                    />
                    <span>Фильтруемый</span>
                  </label>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    leftIcon={<FiPlus />}
                    onClick={handleAddAttribute}
                  >
                    Добавить
                  </Button>
                </div>
              </div>

              {/* Список атрибутов */}
              {attributes.length > 0 ? (
                <div className="attributes-list">
                  <div className="attributes-list__header">
                    <span className="attributes-list__col">Название</span>
                    <span className="attributes-list__col">Значение</span>
                    <span className="attributes-list__col attributes-list__col--checkbox">Фильтруемый</span>
                    <span className="attributes-list__col attributes-list__col--actions">Действия</span>
                  </div>
                  {attributes.map((attr, index) => (
                    <div key={index} className="attributes-list__row">
                      <input
                        type="text"
                        value={attr.name}
                        onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                        className="attributes-list__input"
                        placeholder="Название"
                      />
                      <input
                        type="text"
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                        className="attributes-list__input"
                        placeholder="Значение"
                      />
                      <label className="attributes-list__checkbox">
                        <input
                          type="checkbox"
                          checked={attr.is_filterable}
                          onChange={(e) => handleAttributeChange(index, 'is_filterable', e.target.checked)}
                        />
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAttribute(index)}
                        className="attributes-list__delete"
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="attributes-list__empty">
                  <FiFileText size={48} />
                  <p>Атрибуты не добавлены</p>
                  <span className="attributes-list__empty-hint">
                    Добавьте характеристики товара с помощью формы выше
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="product-form-page__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/catalog/products')}
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
            {isEditMode ? 'Сохранить изменения' : 'Создать товар'}
          </Button>
        </div>
      </form>
    </section>
  );
}

function FiPackage({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
