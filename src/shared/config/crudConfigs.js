/**
 * Конфигурация CRUD-разделов
 * Этот файл содержит конфигурации для всех CRUD-страниц приложения
 *
 * Каждая конфигурация включает:
 * - fetchFn: функция получения данных
 * - createFn: функция создания записи
 * - updateFn: функция обновления записи
 * - deleteFn: функция удаления записи
 * - entityName: название сущности в единственном числе
 * - entityNamePlural: название сущности во множественном числе
 * - permissions: права доступа
 * - fields: поля сущности
 * - tabs: вкладки (опционально)
 * - filters: фильтры (опционально)
 */

import { authorizedApi, productApi } from '../api/http';
import { API_ENDPOINTS } from './env';
import {
  getPagesRequest,
  createPageRequest,
  updatePageRequest,
  deletePageRequest,
  getFaqsRequest,
  createFaqRequest,
  updateFaqRequest,
  deleteFaqRequest,
  getSeoListRequest,
  createSeoRequest,
  updateSeoRequest,
  deleteSeoRequest,
  getEmailTemplatesRequest,
  createEmailTemplateRequest,
  updateEmailTemplateRequest,
  deleteEmailTemplateRequest,
  getFeatureFlagsRequest,
  createFeatureFlagRequest,
  updateFeatureFlagRequest,
  deleteFeatureFlagRequest,
} from '../../pages/cms/api/cmsApi';

// === Manufacturers / Производители ===
export const manufacturersConfig = {
  fetchFn: async ({ page = 1, limit = 20, search } = {}) => {
    const offset = (page - 1) * limit;
    const params = { limit, offset };
    if (search) params.name = search;
    const response = await productApi.get(API_ENDPOINTS.manufacturers, { params });
    const data = response.data?.data ?? response.data;
    const items = Array.isArray(data?.items) ? data.items : [];
    const total = data?.total ?? items.length;
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
    return { items, pagination };
  },

  createFn: async (payload) => {
    const response = await productApi.post(API_ENDPOINTS.manufacturers, payload);
    return response.data?.data ?? response.data;
  },

  updateFn: async (id, payload) => {
    const response = await productApi.put(`${API_ENDPOINTS.manufacturers}/${id}`, payload);
    return response.data?.data ?? response.data;
  },

  deleteFn: async (id) => {
    const response = await productApi.delete(`${API_ENDPOINTS.manufacturers}/${id}`);
    return (response.data?.data ?? response.data)?.deleted ?? true;
  },

  entityName: 'Производитель',
  entityNamePlural: 'Производители',

  permissions: {
    view: ['manufacturer', 'manufacturer:view'],
    create: ['manufacturer:create'],
    update: ['manufacturer:update'],
    delete: ['manufacturer:delete'],
  },

  fields: {
    list: [
      { key: 'name', label: 'Название', render: (item) => <p className="crud-item__title">{item.name}</p> },
      { key: 'description', label: 'Описание', render: (item) => <p className="crud-item__description">{item.description || 'Без описания'}</p> },
    ],
    form: [
      { key: 'name', label: 'Название', required: true, placeholder: 'Введите название производителя' },
      { key: 'description', label: 'Описание', type: 'textarea', placeholder: 'Введите описание производителя' },
    ],
  },
};

// === Suppliers / Поставщики ===
export const suppliersConfig = {
  fetchFn: async ({ page = 1, limit = 20, search } = {}) => {
    const offset = (page - 1) * limit;
    const params = { limit, offset };
    if (search) params.name = search;
    const response = await productApi.get(API_ENDPOINTS.suppliers, { params });
    const data = response.data?.data ?? response.data;
    const items = Array.isArray(data?.items) ? data.items : [];
    const total = data?.total ?? items.length;
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
    return { items, pagination };
  },

  createFn: async (payload) => {
    const response = await productApi.post(API_ENDPOINTS.suppliers, payload);
    return response.data?.data ?? response.data;
  },

  updateFn: async (id, payload) => {
    const response = await productApi.put(`${API_ENDPOINTS.suppliers}/${id}`, payload);
    return response.data?.data ?? response.data;
  },

  deleteFn: async (id) => {
    const response = await productApi.delete(`${API_ENDPOINTS.suppliers}/${id}`);
    return (response.data?.data ?? response.data)?.deleted ?? true;
  },

  entityName: 'Поставщик',
  entityNamePlural: 'Поставщики',

  permissions: {
    view: ['supplier', 'supplier:view'],
    create: ['supplier:create'],
    update: ['supplier:update'],
    delete: ['supplier:delete'],
  },

  fields: {
    list: [
      { key: 'name', label: 'Название', render: (item) => <p className="crud-item__title">{item.name}</p> },
      { key: 'contact_email', label: 'Email', render: (item) => <p className="crud-item__description">{item.contact_email || '—'}</p> },
      { key: 'phone', label: 'Телефон', render: (item) => <p className="crud-item__description">{item.phone || '—'}</p> },
    ],
    form: [
      { key: 'name', label: 'Название', required: true, placeholder: 'Введите название поставщика' },
      { key: 'contact_email', label: 'Email для связи', type: 'email', placeholder: 'supplier@example.com' },
      { key: 'phone', label: 'Телефон', type: 'tel', placeholder: '+7 (999) 000-00-00' },
    ],
  },
};

// === Product Types / Типы продуктов ===
export const productTypesConfig = {
  fetchFn: async ({ page = 1, limit = 20, search } = {}) => {
    const offset = (page - 1) * limit;
    const params = { limit, offset };
    if (search) params.name = search;
    const response = await productApi.get(API_ENDPOINTS.productTypes, { params });
    const data = response.data?.data ?? response.data;
    const items = Array.isArray(data?.items) ? data.items : [];
    const total = data?.total ?? items.length;
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
    return { items, pagination };
  },

  createFn: async (payload) => {
    const response = await productApi.post(API_ENDPOINTS.productTypes, payload);
    return response.data?.data ?? response.data;
  },

  updateFn: async (id, payload) => {
    const response = await productApi.put(`${API_ENDPOINTS.productTypes}/${id}`, payload);
    return response.data?.data ?? response.data;
  },

  deleteFn: async (id) => {
    const response = await productApi.delete(`${API_ENDPOINTS.productTypes}/${id}`);
    return (response.data?.data ?? response.data)?.deleted ?? true;
  },

  entityName: 'Тип продукта',
  entityNamePlural: 'Типы продуктов',

  permissions: {
    view: ['product_type', 'product_type:view'],
    create: ['product_type:create'],
    update: ['product_type:update'],
    delete: ['product_type:delete'],
  },

  fields: {
    list: [
      { key: 'name', label: 'Название', render: (item) => <p className="crud-item__title">{item.name}</p> },
      { key: 'parent_id', label: 'Родительский тип', render: (item) => <p className="crud-item__description">{item.parent_id ? `ID: ${item.parent_id}` : '—'}</p> },
    ],
    form: [
      { key: 'name', label: 'Название', required: true, placeholder: 'Введите название типа' },
      { key: 'parent_id', label: 'Родительский тип', type: 'number', placeholder: 'ID родительского типа (необязательно)' },
    ],
  },
};

// === Permissions / Права ===
export const permissionsConfig = {
  fetchFn: async ({ page = 1, limit = 20, search } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    const response = await authorizedApi.get(API_ENDPOINTS.permissions, { params });
    const data = response.data?.data ?? response.data;
    const items = Array.isArray(data?.items) ? data.items : [];
    const pagination = data?.pagination ?? { page, limit, total: items.length, pages: 1 };
    return { items, pagination };
  },

  createFn: async (payload) => {
    const response = await authorizedApi.post(API_ENDPOINTS.permissions, payload);
    return response.data?.data ?? response.data;
  },

  updateFn: async (id, payload) => {
    const response = await authorizedApi.patch(`${API_ENDPOINTS.permissions}${id}`, payload);
    return response.data?.data ?? response.data;
  },

  entityName: 'Право',
  entityNamePlural: 'Права',

  permissions: {
    view: ['permission', 'permission:view'],
    create: ['permission:create'],
    update: ['permission:update'],
    delete: ['permission:delete'],
  },

  fields: {
    list: [
      { key: 'name', label: 'Ключ', render: (item) => <p className="crud-item__title">{item.name}</p> },
      { key: 'description', label: 'Описание', render: (item) => <p className="crud-item__description">{item.description || 'Без описания'}</p> },
    ],
    form: [
      { key: 'name', label: 'Ключ', required: true, placeholder: 'Например: product:view' },
      { key: 'description', label: 'Описание', type: 'textarea', placeholder: 'Описание права' },
    ],
  },
};

// === Groups / Группы ===
export const groupsConfig = {
  fetchFn: async ({ page = 1, limit = 20, search } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    const response = await authorizedApi.get(API_ENDPOINTS.groups, { params });
    const data = response.data?.data ?? response.data;
    const items = Array.isArray(data?.items) ? data.items : [];
    const pagination = data?.pagination ?? { page, limit, total: items.length, pages: 1 };
    return { items, pagination };
  },

  createFn: async (payload) => {
    const response = await authorizedApi.post(API_ENDPOINTS.groups, payload);
    return response.data?.data ?? response.data;
  },

  updateFn: async (id, payload) => {
    const response = await authorizedApi.patch(`${API_ENDPOINTS.groups}/${id}`, payload);
    return response.data?.data ?? response.data;
  },

  deleteFn: async (id) => {
    const response = await authorizedApi.delete(`${API_ENDPOINTS.groups}/${id}`);
    return response.data?.data ?? response.data;
  },

  entityName: 'Группа',
  entityNamePlural: 'Группы',

  permissions: {
    view: ['admin:group:view'],
    create: ['admin:group:create'],
    update: ['admin:group:update'],
    delete: ['admin:group:delete'],
  },

  fields: {
    list: [
      { key: 'name', label: 'Название', render: (item) => <p className="crud-item__title">{item.name}</p> },
      { key: 'description', label: 'Описание', render: (item) => <p className="crud-item__description">{item.description || 'Без описания'}</p> },
      { key: 'permission_ids', label: 'Количество прав', render: (item) => (
        <p className="crud-item__meta">
          <span>Прав: {Array.isArray(item.permission_ids) ? item.permission_ids.length : 0}</span>
        </p>
      ) },
    ],
    form: [
      { key: 'name', label: 'Название группы', required: true, placeholder: 'Введите название группы' },
      { key: 'description', label: 'Описание', type: 'textarea', placeholder: 'Описание группы' },
    ],
  },
};

// === Products / Продукты ===
export const productsConfig = {
  fetchFn: async ({ page = 1, limit = 20, search } = {}) => {
    const params = { limit, offset: (page - 1) * limit };
    if (search) params.name = search;
    const response = await productApi.get(API_ENDPOINTS.products, { params });
    const data = response.data?.data ?? response.data;
    const items = Array.isArray(data?.items) ? data.items : [];
    const total = data?.total ?? items.length;
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
    return { items, pagination };
  },

  createFn: async (payload) => {
    const response = await productApi.post(API_ENDPOINTS.products, payload);
    return response.data?.data ?? response.data;
  },

  updateFn: async (id, payload) => {
    const response = await productApi.put(`${API_ENDPOINTS.products}/${id}`, payload);
    return response.data?.data ?? response.data;
  },

  deleteFn: async (id) => {
    const response = await productApi.delete(`${API_ENDPOINTS.products}/${id}`);
    return response.data?.data ?? response.data;
  },

  entityName: 'Продукт',
  entityNamePlural: 'Продукты',

  permissions: {
    view: ['product', 'product:view'],
    create: ['product:create'],
    update: ['product:update'],
    delete: ['product:delete'],
  },

  fields: {
    list: [
      { key: 'name', label: 'Название', render: (item) => <p className="crud-item__title">{item.name}</p> },
      { key: 'description', label: 'Описание', render: (item) => <p className="crud-item__description">{item.description || 'Без описания'}</p> },
    ],
    form: [
      { key: 'name', label: 'Название', required: true, placeholder: 'Введите название продукта' },
      { key: 'description', label: 'Описание', type: 'textarea', placeholder: 'Введите описание продукта' },
    ],
  },
};

// === Users / Пользователи ===
export const usersConfig = {
  fetchFn: async ({ page = 1, limit = 20, search, is_active, is_verified, group } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (is_active !== undefined) params.is_active = is_active;
    if (is_verified !== undefined) params.is_verified = is_verified;
    if (group) params.group = group;
    
    const response = await authorizedApi.get(API_ENDPOINTS.users, { params });
    const data = response.data?.data ?? response.data;
    const items = Array.isArray(data?.items) ? data.items : [];
    const pagination = data?.pagination ?? { page, limit, total: items.length, pages: 1 };
    return { items, pagination };
  },

  createFn: async (payload) => {
    // TODO: Добавить API для создания пользователя
    const response = await authorizedApi.post(API_ENDPOINTS.users, payload);
    return response.data?.data ?? response.data;
  },

  updateFn: async (id, payload) => {
    const response = await authorizedApi.patch(`${API_ENDPOINTS.users}/${id}`, payload);
    return response.data?.data ?? response.data;
  },

  deleteFn: async (id) => {
    const response = await authorizedApi.delete(`${API_ENDPOINTS.users}/${id}`);
    return response.data?.data ?? response.data;
  },

  entityName: 'Пользователь',
  entityNamePlural: 'Пользователи',

  permissions: {
    view: ['users', 'users:view', 'admin:user', 'admin:user:view'],
    create: ['admin:user:create'],
    update: ['admin:user:update'],
    delete: ['admin:user:delete'],
  },

  fields: {
    list: [
      { key: 'primary_phone', label: 'Телефон', render: (item) => (
        <p className="crud-item__title">{item.primary_phone?.phone_number || 'Без телефона'}</p>
      ) },
      { key: 'group', label: 'Группа', render: (item) => (
        <p className="crud-item__description">{item.group?.name || 'Без группы'}</p>
      ) },
      { key: 'is_active', label: 'Статус', render: (item) => (
        <p className="crud-item__meta">
          <span>{item.is_active ? 'Активен' : 'Заблокирован'}</span>
        </p>
      ) },
    ],
    form: [
      { key: 'phone_number', label: 'Номер телефона', required: true, placeholder: '+7 (999) 000-00-00' },
      { key: 'password', label: 'Пароль', type: 'password', placeholder: 'Минимум 8 символов' },
      { key: 'is_active', label: 'Активен', type: 'checkbox' },
      { key: 'is_verified', label: 'Верифицирован', type: 'checkbox' },
    ],
  },
};

// === Attributes / Атрибуты продуктов ===
export const attributesConfig = {
  fetchFn: async ({ page = 1, limit = 20, search } = {}) => {
    const offset = (page - 1) * limit;
    const params = { limit, offset };
    if (search) params.name = search;
    const response = await productApi.get(API_ENDPOINTS.attributes, { params });
    const data = response.data?.data ?? response.data;
    const items = Array.isArray(data?.items) ? data.items : [];
    const total = data?.total ?? items.length;
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
    return { items, pagination };
  },

  createFn: async (payload) => {
    const response = await productApi.post(API_ENDPOINTS.attributes, payload);
    return response.data?.data ?? response.data;
  },

  updateFn: async (id, payload) => {
    const response = await productApi.put(`${API_ENDPOINTS.attributes}/${id}`, payload);
    return response.data?.data ?? response.data;
  },

  deleteFn: async (id) => {
    const response = await productApi.delete(`${API_ENDPOINTS.attributes}/${id}`);
    return (response.data?.data ?? response.data)?.deleted ?? true;
  },

  entityName: 'Атрибут',
  entityNamePlural: 'Атрибуты продуктов',

  permissions: {
    view: ['product_attribute', 'product_attribute:view'],
    create: ['product_attribute:create'],
    update: ['product_attribute:update'],
    delete: ['product_attribute:delete'],
  },

  fields: {
    list: [
      { key: 'name', label: 'Название', render: (item) => <p className="crud-item__title">{item.name}</p> },
      { key: 'value', label: 'Значение', render: (item) => <p className="crud-item__description">{item.value}</p> },
      { key: 'is_filterable', label: 'Фильтруемый', render: (item) => (
        <p className="crud-item__meta">
          <span>{item.is_filterable ? 'Да' : 'Нет'}</span>
        </p>
      ) },
    ],
    form: [
      { key: 'name', label: 'Название', required: true, placeholder: 'Введите название атрибута' },
      { key: 'value', label: 'Значение', required: true, placeholder: 'Введите значение атрибута' },
      { key: 'is_filterable', label: 'Использовать для фильтрации', type: 'checkbox' },
    ],
  },
};

// === CMS Pages / Страницы CMS ===
export const cmsPagesConfig = {
  fetchFn: async ({ page = 1, limit = 20, search } = {}) => {
    const response = await getPagesRequest({ page, limit, title: search });
    return response;
  },

  createFn: async (payload) => {
    const response = await createPageRequest(payload);
    return response;
  },

  updateFn: async (id, payload) => {
    const response = await updatePageRequest(id, payload);
    return response;
  },

  deleteFn: async (id) => {
    const response = await deletePageRequest(id);
    return response;
  },

  entityName: 'Страница',
  entityNamePlural: 'Страницы',

  permissions: {
    view: ['cms:view'],
    create: ['cms:create'],
    update: ['cms:update'],
    delete: ['cms:delete'],
  },

  fields: {
    list: [
      { key: 'title', label: 'Заголовок', render: (item) => <p className="crud-item__title">{item.title}</p> },
      { key: 'slug', label: 'Slug', render: (item) => <p className="crud-item__description">{item.slug}</p> },
      { key: 'is_published', label: 'Статус', render: (item) => (
        <p className="crud-item__meta">
          <span>{item.is_published ? 'Опубликована' : 'Черновик'}</span>
        </p>
      ) },
    ],
    form: [
      { key: 'slug', label: 'Slug', required: true, placeholder: 'about-us' },
      { key: 'title', label: 'Заголовок', required: true, placeholder: 'О компании' },
      { key: 'is_published', label: 'Опубликована', type: 'checkbox' },
    ],
  },
};

// === CMS FAQ / FAQ ===
export const cmsFaqConfig = {
  fetchFn: async ({ page = 1, limit = 20, search } = {}) => {
    const response = await getFaqsRequest({});
    let items = response.items || [];
    if (search) {
      items = items.filter(item =>
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.answer.toLowerCase().includes(search.toLowerCase())
      );
    }
    const total = items.length;
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
    const start = (page - 1) * limit;
    const end = start + limit;
    return { items: items.slice(start, end), pagination };
  },

  createFn: async (payload) => {
    const response = await createFaqRequest(payload);
    return response;
  },

  updateFn: async (id, payload) => {
    const response = await updateFaqRequest(id, payload);
    return response;
  },

  deleteFn: async (id) => {
    const response = await deleteFaqRequest(id);
    return response;
  },

  entityName: 'FAQ',
  entityNamePlural: 'FAQ',

  permissions: {
    view: ['cms:view'],
    create: ['cms:create'],
    update: ['cms:update'],
    delete: ['cms:delete'],
  },

  fields: {
    list: [
      { key: 'question', label: 'Вопрос', render: (item) => <p className="crud-item__title">{item.question}</p> },
      { key: 'answer', label: 'Ответ', render: (item) => <p className="crud-item__description">{item.answer}</p> },
      { key: 'category', label: 'Категория', render: (item) => <p className="crud-item__meta">{item.category || '—'}</p> },
    ],
    form: [
      { key: 'question', label: 'Вопрос', required: true, placeholder: 'Как оформить заказ?' },
      { key: 'answer', label: 'Ответ', required: true, type: 'textarea', placeholder: 'Для оформления заказа...' },
      { key: 'category', label: 'Категория', placeholder: 'Заказы' },
      { key: 'order', label: 'Порядок', type: 'number', placeholder: '0' },
      { key: 'is_active', label: 'Активен', type: 'checkbox' },
    ],
  },
};

// === CMS SEO / SEO данные ===
export const cmsSeoConfig = {
  fetchFn: async ({ page = 1, limit = 20, search } = {}) => {
    const response = await getSeoListRequest({ page, limit });
    let items = response.items || [];
    if (search) {
      items = items.filter(item =>
        item.page_slug.toLowerCase().includes(search.toLowerCase()) ||
        (item.title && item.title.toLowerCase().includes(search.toLowerCase()))
      );
    }
    return { items, pagination: response.pagination };
  },

  createFn: async (payload) => {
    const response = await createSeoRequest(payload);
    return response;
  },

  updateFn: async (id, payload) => {
    const response = await updateSeoRequest(id, payload);
    return response;
  },

  deleteFn: async (id) => {
    const response = await deleteSeoRequest(id);
    return response;
  },

  entityName: 'SEO запись',
  entityNamePlural: 'SEO записи',

  permissions: {
    view: ['cms:view'],
    create: ['cms:create'],
    update: ['cms:update'],
    delete: ['cms:delete'],
  },

  fields: {
    list: [
      { key: 'page_slug', label: 'Slug страницы', render: (item) => <p className="crud-item__title">{item.page_slug}</p> },
      { key: 'title', label: 'SEO заголовок', render: (item) => <p className="crud-item__description">{item.title || '—'}</p> },
      { key: 'description', label: 'Описание', render: (item) => <p className="crud-item__description">{item.description || '—'}</p> },
    ],
    form: [
      { key: 'page_slug', label: 'Slug страницы', required: true, placeholder: 'about-us' },
      { key: 'title', label: 'SEO заголовок', placeholder: 'О компании - Название магазина' },
      { key: 'description', label: 'SEO описание', type: 'textarea', placeholder: 'Информация о нашей компании...' },
      { key: 'keywords', label: 'Ключевые слова', type: 'textarea', placeholder: 'компания, магазин, о нас' },
      { key: 'og_image_id', label: 'OG Image ID', type: 'number', placeholder: '1' },
    ],
  },
};

// === CMS Email Templates / Email шаблоны ===
export const cmsEmailTemplatesConfig = {
  fetchFn: async ({ page = 1, limit = 20, search } = {}) => {
    const response = await getEmailTemplatesRequest({});
    let items = response.items || [];
    if (search) {
      items = items.filter(item =>
        item.key.toLowerCase().includes(search.toLowerCase()) ||
        item.subject.toLowerCase().includes(search.toLowerCase())
      );
    }
    const total = items.length;
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
    const start = (page - 1) * limit;
    const end = start + limit;
    return { items: items.slice(start, end), pagination };
  },

  createFn: async (payload) => {
    const response = await createEmailTemplateRequest(payload);
    return response;
  },

  updateFn: async (id, payload) => {
    const response = await updateEmailTemplateRequest(id, payload);
    return response;
  },

  deleteFn: async (id) => {
    const response = await deleteEmailTemplateRequest(id);
    return response;
  },

  entityName: 'Email шаблон',
  entityNamePlural: 'Email шаблоны',

  permissions: {
    view: ['cms:view'],
    create: ['cms:create'],
    update: ['cms:update'],
    delete: ['cms:delete'],
  },

  fields: {
    list: [
      { key: 'key', label: 'Ключ', render: (item) => <p className="crud-item__title">{item.key}</p> },
      { key: 'subject', label: 'Тема', render: (item) => <p className="crud-item__description">{item.subject}</p> },
      { key: 'is_active', label: 'Статус', render: (item) => (
        <p className="crud-item__meta">
          <span>{item.is_active ? 'Активен' : 'Неактивен'}</span>
        </p>
      ) },
    ],
    form: [
      { key: 'key', label: 'Ключ', required: true, placeholder: 'order_confirmation' },
      { key: 'subject', label: 'Тема письма', required: true, placeholder: 'Подтверждение заказа' },
      { key: 'body_html', label: 'HTML тело', required: true, type: 'textarea', placeholder: '<html>...</html>' },
      { key: 'body_text', label: 'Текстовое тело', type: 'textarea', placeholder: 'Ваш заказ подтверждён...' },
      { key: 'variables', label: 'Переменные', type: 'textarea', placeholder: 'order_id, customer_name' },
      { key: 'is_active', label: 'Активен', type: 'checkbox' },
    ],
  },
};

// === CMS Feature Flags / Feature Flags ===
export const cmsFeatureFlagsConfig = {
  fetchFn: async ({ page = 1, limit = 20, search } = {}) => {
    const response = await getFeatureFlagsRequest({});
    let items = response.items || [];
    if (search) {
      items = items.filter(item =>
        item.key.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
      );
    }
    const total = items.length;
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
    const start = (page - 1) * limit;
    const end = start + limit;
    return { items: items.slice(start, end), pagination };
  },

  createFn: async (payload) => {
    const response = await createFeatureFlagRequest(payload);
    return response;
  },

  updateFn: async (id, payload) => {
    const response = await updateFeatureFlagRequest(id, payload);
    return response;
  },

  deleteFn: async (id) => {
    const response = await deleteFeatureFlagRequest(id);
    return response;
  },

  entityName: 'Feature Flag',
  entityNamePlural: 'Feature Flags',

  permissions: {
    view: ['cms:view'],
    create: ['cms:create'],
    update: ['cms:update'],
    delete: ['cms:delete'],
  },

  fields: {
    list: [
      { key: 'key', label: 'Ключ', render: (item) => <p className="crud-item__title">{item.key}</p> },
      { key: 'description', label: 'Описание', render: (item) => <p className="crud-item__description">{item.description || '—'}</p> },
      { key: 'enabled', label: 'Статус', render: (item) => (
        <p className="crud-item__meta">
          <span>{item.enabled ? 'Включен' : 'Выключен'}</span>
        </p>
      ) },
    ],
    form: [
      { key: 'key', label: 'Ключ', required: true, placeholder: 'new_checkout_enabled' },
      { key: 'description', label: 'Описание', placeholder: 'Включить новый процесс оформления заказа' },
      { key: 'enabled', label: 'Включен', type: 'checkbox' },
    ],
  },
};

// Экспорт всех конфигураций
export const CRUD_CONFIGS = {
  manufacturers: manufacturersConfig,
  suppliers: suppliersConfig,
  productTypes: productTypesConfig,
  permissions: permissionsConfig,
  groups: groupsConfig,
  products: productsConfig,
  users: usersConfig,
  attributes: attributesConfig,
  cmsPages: cmsPagesConfig,
  cmsFaq: cmsFaqConfig,
  cmsSeo: cmsSeoConfig,
  cmsEmailTemplates: cmsEmailTemplatesConfig,
  cmsFeatureFlags: cmsFeatureFlagsConfig,
};
