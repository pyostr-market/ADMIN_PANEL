import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiPlus, FiTrash2, FiImage, FiTag, FiFileText } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { Tabs, Tab } from '../../../shared/ui/Tabs/Tabs';
import { ImageCarousel } from '../../../shared/ui/ImageCarousel/ImageCarousel';
import { AutocompleteInput } from '../../../shared/ui/AutocompleteInput/AutocompleteInput';
import { RichTextEditor } from '../../../shared/ui/RichTextEditor/RichTextEditor';
import { getApiErrorMessage } from '../../../shared/api/apiError';
import { useNotifications } from '../../../shared/lib/notifications/NotificationProvider';
import {
  getProductByIdRequest,
  createProductRequest,
  updateProductRequest,
  getCategoriesForAutocompleteRequest,
  getSuppliersForAutocompleteRequest,
  getProductTypesForAutocompleteRequest,
} from '../api/productsApi';
import styles from './ProductFormPage.module.css';

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

  // Храним полные объекты для autocomplete
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedProductType, setSelectedProductType] = useState(null);

  const [images, setImages] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [newAttribute, setNewAttribute] = useState({ name: '', value: '', is_filterable: false });

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const loadProduct = useCallback(async () => {
    if (!productId) return;

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
      // Сохраняем полные объекты для autocomplete
      if (data.category) {
        setSelectedCategory(data.category);
      }
      if (data.supplier) {
        setSelectedSupplier(data.supplier);
      }
      if (data.product_type) {
        setSelectedProductType(data.product_type);
      }
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isEditMode && productId) {
      loadProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, isEditMode]);

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

  const handleSubmit = async (e, stayOnPage = false) => {
    if (e) {
      e.preventDefault();
    }

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

        if (stayOnPage) {
          // При обновлении с stayOnPage просто обновляем данные формы из ответа
          if (responseData) {
            setFormData({
              name: responseData.name || formData.name,
              price: responseData.price?.toString() || formData.price,
              description: responseData.description || formData.description,
              category_id: responseData.category_id?.toString() || formData.category_id,
              supplier_id: responseData.supplier_id?.toString() || formData.supplier_id,
              product_type_id: responseData.product_type_id?.toString() || formData.product_type_id,
            });
            // Обновляем полные объекты для autocomplete
            setSelectedCategory(responseData.category || selectedCategory);
            setSelectedSupplier(responseData.supplier || selectedSupplier);
            setSelectedProductType(responseData.product_type || selectedProductType);
            // Обновляем атрибуты
            if (responseData.attributes) {
              setAttributes(responseData.attributes.map(attr => ({
                id: attr.id,
                name: attr.name,
                value: attr.value,
                is_filterable: attr.is_filterable,
              })));
            }
          }
        }
      } else {
        const responseData = await createProductRequest(formDataToSend);
        console.log('[ProductForm] Ответ от createProductRequest:', responseData);
        handleApiResponse(responseData);
        notificationsRef.current?.info('Товар создан');

        if (stayOnPage) {
          // После создания перенаправляем на страницу редактирования с новым ID
          const newProductId = responseData?.id || responseData?.product_id;
          if (newProductId) {
            navigate(`/catalog/products/${newProductId}`);
          }
        }
      }

      if (!stayOnPage) {
        navigate('/catalog/products');
      }
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
      <section className={styles.productFormPage}>
        <div className={styles.productFormPageLoading}>
          <div className="loading-spinner" />
          <p>Загрузка данных товара...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.productFormPage}>
      <header className={styles.productFormPageHeader}>
        <Button variant="ghost" onClick={() => navigate(isEditMode ? `/catalog/products/${productId}` : '/catalog/products')} className={styles.backButton}>
          ← Назад
        </Button>
        <h1 className={styles.productFormPageTitle}>
          {isEditMode ? 'Редактирование товара' : 'Создание товара'}
        </h1>
      </header>

      <div className={styles.productFormPageTabs}>
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

      <form className={styles.productFormPageForm} onSubmit={handleSubmit}>
        {activeTab === TABS.MAIN && (
          <div className={styles.productForm}>
            <div className={styles.productFormSection}>
              <div className={styles.productFormSectionHeader}>
                <div className={`${styles.productFormSectionIcon} ${styles.productFormSectionIconPrimary}`}>
                  <FiTag />
                </div>
                <div>
                  <h2 className={styles.productFormSectionTitle}>Основная информация</h2>
                  <p className={styles.productFormSectionDescription}>Базовые данные о товаре</p>
                </div>
              </div>

              <div className={styles.productFormGrid}>
                <div className={`${styles.productFormField} ${styles.productFormFieldFull}`}>
                  <label className={styles.productFormLabel}>
                    Название <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Введите название товара"
                    className={errors.name ? styles.inputError : ''}
                  />
                  {errors.name && (
                    <span className={styles.productFormError}>{errors.name}</span>
                  )}
                </div>

                <div className={styles.productFormField}>
                  <label className={styles.productFormLabel}>
                    Цена <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="0.00"
                    className={errors.price ? styles.inputError : ''}
                  />
                  {errors.price && (
                    <span className={styles.productFormError}>{errors.price}</span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.productFormSection}>
              <div className={styles.productFormSectionHeader}>
                <div className={`${styles.productFormSectionIcon} ${styles.productFormSectionIconSecondary}`}>
                  <FiPackage />
                </div>
                <div>
                  <h2 className={styles.productFormSectionTitle}>Классификация</h2>
                  <p className={styles.productFormSectionDescription}>Категория, тип продукта и поставщики</p>
                </div>
              </div>

              <div className={styles.productFormGrid}>
                <div className={styles.productFormField}>
                  <AutocompleteInput
                    label="Категория"
                    value={formData.category_id}
                    onChange={(value) => handleChange('category_id', value)}
                    fetchOptions={getCategoriesForAutocompleteRequest}
                    placeholder="Начните ввод для поиска категории..."
                    selectedOption={selectedCategory}
                  />
                </div>

                <div className={styles.productFormField}>
                  <AutocompleteInput
                    label="Тип продукта"
                    value={formData.product_type_id}
                    onChange={(value) => handleChange('product_type_id', value)}
                    fetchOptions={getProductTypesForAutocompleteRequest}
                    placeholder="Начните ввод для поиска типа продукта..."
                    selectedOption={selectedProductType}
                  />
                </div>

                <div className={styles.productFormField}>
                  <AutocompleteInput
                    label="Поставщик"
                    value={formData.supplier_id}
                    onChange={(value) => handleChange('supplier_id', value)}
                    fetchOptions={getSuppliersForAutocompleteRequest}
                    placeholder="Начните ввод для поиска поставщика..."
                    selectedOption={selectedSupplier}
                  />
                </div>
              </div>
            </div>

            <div className={`${styles.productFormSection} ${styles.productFormSectionDescriptionSection}`}>
              <div className={styles.productFormSectionHeader}>
                <div className={`${styles.productFormSectionIcon} ${styles.productFormSectionIconInfo}`}>
                  <FiFileText />
                </div>
                <div>
                  <h2 className={styles.productFormSectionTitle}>Описание товара</h2>
                  <p className={styles.productFormSectionDescription}>
                    Подробное описание товара с возможностью форматирования текста
                  </p>
                </div>
              </div>

              <div className={`${styles.productFormField} ${styles.productFormFieldFull}`}>
                <RichTextEditor
                  value={formData.description}
                  onChange={(html) => handleChange('description', html)}
                  placeholder="Введите описание товара..."
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <span className={styles.productFormError}>{errors.description}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === TABS.IMAGES && (
          <div className={styles.productForm}>
            <div className={styles.productFormSection}>
              <div className={styles.productFormSectionHeader}>
                <div className={`${styles.productFormSectionIcon} ${styles.productFormSectionIconAccent}`}>
                  <FiImage />
                </div>
                <div>
                  <h2 className={styles.productFormSectionTitle}>Изображения товара</h2>
                  <p className={styles.productFormSectionDescription}>
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
          <div className={styles.productForm}>
            <div className={styles.productFormSection}>
              <div className={styles.productFormSectionHeader}>
                <div className={`${styles.productFormSectionIcon} ${styles.productFormSectionIconInfo}`}>
                  <FiFileText />
                </div>
                <div>
                  <h2 className={styles.productFormSectionTitle}>Атрибуты товара</h2>
                  <p className={styles.productFormSectionDescription}>
                    Добавьте характеристики товара (размер, цвет, материал и т.д.)
                  </p>
                </div>
              </div>

              {/* Форма добавления нового атрибута */}
              <div className={styles.attributesForm}>
                <div className={styles.attributesFormRow}>
                  <input
                    type="text"
                    value={newAttribute.name}
                    onChange={(e) => setNewAttribute((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Название атрибута (например, Цвет)"
                    className={styles.attributesFormInput}
                  />
                  <input
                    type="text"
                    value={newAttribute.value}
                    onChange={(e) => setNewAttribute((prev) => ({ ...prev, value: e.target.value }))}
                    placeholder="Значение (например, Красный)"
                    className={styles.attributesFormInput}
                  />
                  <label className={styles.attributesFormCheckbox}>
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
                <div className={styles.attributesList}>
                  <div className={styles.attributesListHeader}>
                    <span className={`${styles.attributesListCol}`}>Название</span>
                    <span className={`${styles.attributesListCol}`}>Значение</span>
                    <span className={`${styles.attributesListCol} ${styles.attributesListColCheckbox}`}>Фильтруемый</span>
                    <span className={`${styles.attributesListCol} ${styles.attributesListColActions}`}>Действия</span>
                  </div>
                  {attributes.map((attr, index) => (
                    <div key={index} className={styles.attributesListRow}>
                      <input
                        type="text"
                        value={attr.name}
                        onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                        className={styles.attributesListInput}
                        placeholder="Название"
                      />
                      <input
                        type="text"
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                        className={styles.attributesListInput}
                        placeholder="Значение"
                      />
                      <label className={styles.attributesListCheckbox}>
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
                        className={styles.attributesListDelete}
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.attributesListEmpty}>
                  <FiFileText size={48} />
                  <p>Атрибуты не добавлены</p>
                  <span className={styles.attributesListEmptyHint}>
                    Добавьте характеристики товара с помощью формы выше
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.productFormPageActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/catalog/products')}
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
            {isEditMode ? 'Сохранить' : 'Создать'}
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
