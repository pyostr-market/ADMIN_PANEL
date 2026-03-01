import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiImage, FiTag, FiFileText, FiTrash2, FiPlus } from 'react-icons/fi';
import { Button } from '../../../shared/ui/Button/Button';
import { FormPage } from '../../../shared/ui/FormPage';
import { FormSection } from '../../../shared/ui/FormSection/FormSection';
import { FormGrid } from '../../../shared/ui/FormGrid/FormGrid';
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

  const handleSubmit = async (stayOnPage = false) => {
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

  const handleBack = () => {
    navigate(isEditMode ? `/catalog/products/${productId}` : '/catalog/products');
  };

  return (
    <FormPage
      title={isEditMode ? 'Редактирование товара' : 'Создание товара'}
      backUrl={isEditMode ? `/catalog/products/${productId}` : '/catalog/products'}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onSubmit={() => handleSubmit(false)}
      onSubmitAndStay={() => handleSubmit(true)}
      showSubmitStay={true}
      submitText={isEditMode ? 'Сохранить' : 'Создать'}
    >
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

      {activeTab === TABS.MAIN && (
        <FormSection
          icon={<FiTag />}
          iconVariant="primary"
          title="Основная информация"
          description="Базовые данные о товаре"
        >
          <FormGrid columns={2}>
            <div className={styles.productFormField}>
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

            <div className={`${styles.productFormField} ${styles.productFormFieldFull}`}>
              <label className={styles.productFormLabel}>Описание товара</label>
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
          </FormGrid>
        </FormSection>
      )}

      {activeTab === TABS.IMAGES && (
        <FormSection
          icon={<FiImage />}
          iconVariant="secondary"
          title="Изображения товара"
          description="Загрузите изображения товара. Перетаскивайте для изменения порядка. Первое изображение будет главным."
        >
          <ImageCarousel
            images={images}
            onImagesChange={handleImagesChange}
            multiple
            showDelete
            disabled={isSubmitting}
            folder="products"
          />
        </FormSection>
      )}

      {activeTab === TABS.ATTRIBUTES && (
        <FormSection
          icon={<FiFileText />}
          iconVariant="info"
          title="Атрибуты товара"
          description="Добавьте характеристики товара (размер, цвет, материал и т.д.)"
        >
          {/* Форма добавления нового атрибута */}
          <div className={styles.attributesForm}>
            <div className={styles.attributesFormCard}>
              <div className={styles.attributesFormRow}>
                <div className={styles.attributesFormField}>
                  <label className={styles.attributesFormLabel}>Название</label>
                  <input
                    type="text"
                    value={newAttribute.name}
                    onChange={(e) => setNewAttribute((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Например: Цвет"
                    className={styles.attributesFormInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAttribute();
                      }
                    }}
                  />
                </div>
                <div className={styles.attributesFormField}>
                  <label className={styles.attributesFormLabel}>Значение</label>
                  <input
                    type="text"
                    value={newAttribute.value}
                    onChange={(e) => setNewAttribute((prev) => ({ ...prev, value: e.target.value }))}
                    placeholder="Например: Красный"
                    className={styles.attributesFormInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAttribute();
                      }
                    }}
                  />
                </div>
                <div className={styles.attributesFormField}>
                  <label className={styles.attributesFormLabel}>
                    <input
                      type="checkbox"
                      checked={newAttribute.is_filterable}
                      onChange={(e) => setNewAttribute((prev) => ({ ...prev, is_filterable: e.target.checked }))}
                      className={styles.attributesFormCheckboxInput}
                    />
                    Фильтруемый
                  </label>
                  <span className={styles.attributesFormHint}>
                    Показывать в фильтрах
                  </span>
                </div>
                <div className={styles.attributesFormButtonWrapper}>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    leftIcon={<FiPlus />}
                    onClick={handleAddAttribute}
                    className={styles.attributesFormAddButton}
                  >
                    Добавить
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Список атрибутов */}
          {attributes.length > 0 ? (
            <div className={styles.attributesList}>
              <div className={styles.attributesListHeader}>
                <span className={`${styles.attributesListCol} ${styles.attributesListColName}`}>Название</span>
                <span className={`${styles.attributesListCol} ${styles.attributesListColValue}`}>Значение</span>
                <span className={`${styles.attributesListCol} ${styles.attributesListColFilter}`}>В фильтрах</span>
                <span className={`${styles.attributesListCol} ${styles.attributesListColActions}`}></span>
              </div>
              <div className={styles.attributesListBody}>
                {attributes.map((attr, index) => (
                  <div key={index} className={styles.attributesListRow}>
                    <div className={styles.attributesListCell}>
                      <input
                        type="text"
                        value={attr.name}
                        onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                        className={styles.attributesListInput}
                        placeholder="Название"
                      />
                    </div>
                    <div className={styles.attributesListCell}>
                      <input
                        type="text"
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                        className={styles.attributesListInput}
                        placeholder="Значение"
                      />
                    </div>
                    <div className={styles.attributesListCell}>
                      <label className={styles.attributesListCheckbox}>
                        <input
                          type="checkbox"
                          checked={attr.is_filterable}
                          onChange={(e) => handleAttributeChange(index, 'is_filterable', e.target.checked)}
                          className={styles.attributesListCheckboxInput}
                        />
                        <span className={styles.attributesListCheckboxText}>
                          {attr.is_filterable ? 'Да' : 'Нет'}
                        </span>
                      </label>
                    </div>
                    <div className={styles.attributesListCell}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAttribute(index)}
                        className={styles.attributesListDelete}
                        title="Удалить атрибут"
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.attributesListEmpty}>
              <div className={styles.attributesListEmptyIcon}>
                <FiFileText size={48} />
              </div>
              <p className={styles.attributesListEmptyTitle}>Атрибуты не добавлены</p>
              <span className={styles.attributesListEmptyHint}>
                Добавьте характеристики товара с помощью формы выше
              </span>
            </div>
          )}
        </FormSection>
      )}
    </FormPage>
  );
}
