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
};
