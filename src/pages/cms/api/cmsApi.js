import { authorizedApi, productApi } from '../../../shared/api/http';

function unwrapResponse(response) {
  return response.data?.data ?? response.data;
}

// ============================================================================
// PAGES API
// ============================================================================

/**
 * Получение списка страниц
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов на странице
 * @param {string} params.title - Фильтр по заголовку
 * @param {boolean} params.is_published - Фильтр по статусу публикации
 */
export async function getPagesRequest({
  page = 1,
  limit = 20,
  title,
  is_published,
} = {}) {
  const offset = (page - 1) * limit;
  const params = { limit, offset };
  if (title) params.title = title;
  if (is_published !== undefined) params.is_published = is_published;

  const response = await productApi.get('/cms/pages', { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return { items, pagination };
}

/**
 * Получение страницы по ID
 * @param {number} pageId - ID страницы
 */
export async function getPageByIdRequest(pageId) {
  const response = await productApi.get(`/cms/pages/${pageId}`);
  return unwrapResponse(response);
}

/**
 * Получение страницы по slug
 * @param {string} slug - Slug страницы
 */
export async function getPageBySlugRequest(slug) {
  const response = await productApi.get(`/cms/pages/slug/${slug}`);
  return unwrapResponse(response);
}

/**
 * Создание страницы
 * @param {Object} payload - Данные страницы
 * @param {string} payload.slug - URL идентификатор
 * @param {string} payload.title - Заголовок страницы
 * @param {boolean} payload.is_published - Статус публикации
 * @param {Array} payload.blocks_json - JSON массив блоков
 */
export async function createPageRequest(payload) {
  const formData = new FormData();
  formData.append('slug', payload.slug);
  formData.append('title', payload.title);
  if (payload.is_published !== undefined) {
    formData.append('is_published', payload.is_published ? 'true' : 'false');
  }
  if (payload.blocks_json) {
    formData.append('blocks_json', JSON.stringify(payload.blocks_json));
  }

  const response = await productApi.post('/cms/pages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapResponse(response);
}

/**
 * Обновление страницы (PUT)
 * @param {number} pageId - ID страницы
 * @param {Object} payload - Данные для обновления
 * @param {string} payload.slug - URL идентификатор
 * @param {string} payload.title - Заголовок страницы
 * @param {boolean} payload.is_published - Статус публикации
 * @param {Array} payload.blocks_json - JSON операций с блоками
 */
export async function updatePageRequest(pageId, payload) {
  const formData = new FormData();
  if (payload.slug !== undefined) formData.append('slug', payload.slug);
  if (payload.title !== undefined) formData.append('title', payload.title);
  if (payload.is_published !== undefined) {
    formData.append('is_published', payload.is_published ? 'true' : 'false');
  }
  if (payload.blocks_json !== undefined) {
    formData.append('blocks_json', JSON.stringify(payload.blocks_json));
  }

  const response = await productApi.put(`/cms/pages/${pageId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapResponse(response);
}

/**
 * Удаление страницы
 * @param {number} pageId - ID страницы
 */
export async function deletePageRequest(pageId) {
  const response = await productApi.delete(`/cms/pages/${pageId}`);
  return unwrapResponse(response);
}

/**
 * Добавление блока на страницу
 * @param {number} pageId - ID страницы
 * @param {Object} payload - Данные блока
 * @param {string} payload.block_type - Тип блока
 * @param {Object} payload.data_json - JSON данные блока
 * @param {number} payload.order - Порядок отображения
 */
export async function addPageBlockRequest(pageId, payload) {
  const formData = new FormData();
  formData.append('block_type', payload.block_type);
  if (payload.data_json) {
    formData.append('data_json', JSON.stringify(payload.data_json));
  }
  if (payload.order !== undefined) {
    formData.append('order', payload.order);
  }

  const response = await productApi.post(`/cms/pages/${pageId}/blocks`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrapResponse(response);
}

/**
 * Получение аудит-логов страниц
 * @param {Object} params - Параметры запроса
 * @param {number} params.page_id - Фильтр по ID страницы
 * @param {number} params.user_id - Фильтр по ID пользователя
 * @param {string} params.action - Фильтр по действию
 * @param {number} params.limit - Количество элементов
 * @param {number} params.offset - Смещение
 */
export async function getPageAuditRequest({
  page_id,
  user_id,
  action,
  limit = 20,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (page_id !== undefined && page_id !== null) params.page_id = page_id;
  if (user_id !== undefined && user_id !== null) params.user_id = user_id;
  if (action) params.action = action;

  const response = await productApi.get('/cms/pages/audit', { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}

// ============================================================================
// FAQ API
// ============================================================================

/**
 * Получение списка FAQ
 * @param {Object} params - Параметры запроса
 * @param {string} params.category - Фильтр по категории
 */
export async function getFaqsRequest({ category } = {}) {
  const params = {};
  if (category) params.category = category;

  const response = await productApi.get('/cms/faq', { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}

/**
 * Получение категорий FAQ
 */
export async function getFaqCategoriesRequest() {
  const response = await productApi.get('/cms/faq/categories');
  return unwrapResponse(response);
}

/**
 * Создание FAQ
 * @param {Object} payload - Данные FAQ
 * @param {string} payload.question - Текст вопроса
 * @param {string} payload.answer - Текст ответа
 * @param {string} payload.category - Категория
 * @param {number} payload.order - Порядок
 * @param {boolean} payload.is_active - Статус активности
 */
export async function createFaqRequest(payload) {
  const response = await productApi.post('/cms/faq/admin', payload);
  return unwrapResponse(response);
}

/**
 * Обновление FAQ
 * @param {number} faqId - ID FAQ
 * @param {Object} payload - Данные для обновления
 */
export async function updateFaqRequest(faqId, payload) {
  const response = await productApi.put(`/cms/faq/admin/${faqId}`, payload);
  return unwrapResponse(response);
}

/**
 * Удаление FAQ
 * @param {number} faqId - ID FAQ
 */
export async function deleteFaqRequest(faqId) {
  const response = await productApi.delete(`/cms/faq/admin/${faqId}`);
  return unwrapResponse(response);
}

// ============================================================================
// SEO API
// ============================================================================

/**
 * Получение SEO данных по page_slug
 * @param {string} pageSlug - Slug страницы
 */
export async function getSeoDataRequest(pageSlug) {
  const response = await productApi.get(`/cms/seo/${pageSlug}/meta`);
  return unwrapResponse(response);
}

/**
 * Создание SEO данных
 * @param {Object} payload - Данные SEO
 * @param {string} payload.page_slug - Slug страницы
 * @param {string} payload.title - SEO заголовок
 * @param {string} payload.description - SEO описание
 * @param {Array} payload.keywords - Ключевые слова
 * @param {number} payload.og_image_id - ID изображения для OG
 */
export async function createSeoRequest(payload) {
  const response = await productApi.post('/cms/seo/admin', payload);
  return unwrapResponse(response);
}

/**
 * Обновление SEO данных
 * @param {number} seoId - ID SEO записи
 * @param {Object} payload - Данные для обновления
 */
export async function updateSeoRequest(seoId, payload) {
  const response = await productApi.put(`/cms/seo/admin/${seoId}`, payload);
  return unwrapResponse(response);
}

/**
 * Удаление SEO данных
 * @param {number} seoId - ID SEO записи
 */
export async function deleteSeoRequest(seoId) {
  const response = await productApi.delete(`/cms/seo/admin/${seoId}`);
  return unwrapResponse(response);
}

/**
 * Получение списка всех SEO записей (админ)
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов
 */
export async function getSeoListRequest({ page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const params = { limit, offset };

  const response = await productApi.get('/cms/seo/admin', { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return { items, pagination };
}

// ============================================================================
// EMAIL TEMPLATES API
// ============================================================================

/**
 * Получение списка email шаблонов
 */
export async function getEmailTemplatesRequest() {
  const response = await productApi.get('/cms/email-templates');
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}

/**
 * Получение шаблона по ключу
 * @param {string} key - Ключ шаблона
 */
export async function getEmailTemplateByKeyRequest(key) {
  const response = await productApi.get(`/cms/email-templates/${key}`);
  return unwrapResponse(response);
}

/**
 * Создание email шаблона
 * @param {Object} payload - Данные шаблона
 * @param {string} payload.key - Уникальный ключ шаблона
 * @param {string} payload.subject - Тема письма
 * @param {string} payload.body_html - HTML тело письма
 * @param {string} payload.body_text - Текстовое тело письма
 * @param {Array} payload.variables - Переменные шаблона
 * @param {boolean} payload.is_active - Статус активности
 */
export async function createEmailTemplateRequest(payload) {
  const response = await productApi.post('/cms/email-templates/admin', payload);
  return unwrapResponse(response);
}

/**
 * Обновление email шаблона
 * @param {number} templateId - ID шаблона
 * @param {Object} payload - Данные для обновления
 */
export async function updateEmailTemplateRequest(templateId, payload) {
  const response = await productApi.put(`/cms/email-templates/admin/${templateId}`, payload);
  return unwrapResponse(response);
}

/**
 * Удаление email шаблона
 * @param {number} templateId - ID шаблона
 */
export async function deleteEmailTemplateRequest(templateId) {
  const response = await productApi.delete(`/cms/email-templates/admin/${templateId}`);
  return unwrapResponse(response);
}

// ============================================================================
// FEATURE FLAGS API
// ============================================================================

/**
 * Получение списка feature flags
 */
export async function getFeatureFlagsRequest() {
  const response = await productApi.get('/cms/feature-flags');
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}

/**
 * Получение включенных feature flags (публичный эндпоинт)
 */
export async function getEnabledFeatureFlagsRequest() {
  const response = await productApi.get('/cms/feature-flags/enabled');
  return unwrapResponse(response);
}

/**
 * Создание feature flag
 * @param {Object} payload - Данные флага
 * @param {string} payload.key - Уникальный ключ флага
 * @param {boolean} payload.enabled - Статус флага
 * @param {string} payload.description - Описание флага
 */
export async function createFeatureFlagRequest(payload) {
  const response = await productApi.post('/cms/feature-flags/admin', payload);
  return unwrapResponse(response);
}

/**
 * Обновление feature flag
 * @param {number} flagId - ID флага
 * @param {Object} payload - Данные для обновления
 */
export async function updateFeatureFlagRequest(flagId, payload) {
  const response = await productApi.put(`/cms/feature-flags/admin/${flagId}`, payload);
  return unwrapResponse(response);
}

/**
 * Удаление feature flag
 * @param {number} flagId - ID флага
 */
export async function deleteFeatureFlagRequest(flagId) {
  const response = await productApi.delete(`/cms/feature-flags/admin/${flagId}`);
  return unwrapResponse(response);
}
