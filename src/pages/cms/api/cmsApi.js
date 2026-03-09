import { productApi } from '../../../shared/api/http';

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
  limit = 10,
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
 * Поиск страниц по заголовку
 * @param {Object} params - Параметры поиска
 * @param {string} params.q - Поисковый запрос
 * @param {number} params.limit - Лимит
 * @param {number} params.offset - Смещение
 */
export async function searchPagesRequest({
  q,
  limit = 10,
  offset = 0,
} = {}) {
  const params = { q, limit, offset };
  const response = await productApi.get('/cms/pages/search', { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}

/**
 * Создание страницы
 * @param {Object} payload - Данные страницы
 * @param {string} payload.slug - URL идентификатор
 * @param {string} payload.title - Заголовок страницы
 * @param {boolean} payload.is_published - Статус публикации
 * @param {Array} payload.blocks - Массив блоков
 */
export async function createPageRequest(payload) {
  const response = await productApi.post('/cms/admin', payload);
  return unwrapResponse(response);
}

/**
 * Обновление страницы (PUT)
 * @param {number} pageId - ID страницы
 * @param {Object} payload - Данные для обновления
 */
export async function updatePageRequest(pageId, payload) {
  const response = await productApi.put(`/cms/admin/${pageId}`, payload);
  return unwrapResponse(response);
}

/**
 * Удаление страницы
 * @param {number} pageId - ID страницы
 */
export async function deletePageRequest(pageId) {
  const response = await productApi.delete(`/cms/admin/${pageId}`);
  return unwrapResponse(response);
}

/**
 * Добавление блока на страницу
 * @param {number} pageId - ID страницы
 * @param {Object} payload - Данные блока
 */
export async function addPageBlockRequest(pageId, payload) {
  const response = await productApi.post(`/cms/admin/${pageId}/blocks`, payload);
  return unwrapResponse(response);
}

/**
 * Получение аудит-логов страниц
 * @param {Object} params - Параметры запроса
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

  const response = await productApi.get('/cms/admin/audit', { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}

// ============================================================================
// FAQ API
// ============================================================================

/**
 * Получение списка FAQ (public)
 * @param {Object} params - Параметры запроса
 * @param {string} params.category - Фильтр по категории
 * @param {number} params.limit - Лимит
 * @param {number} params.offset - Смещение
 */
export async function getFaqsRequest({ category, limit = 10, offset = 0 } = {}) {
  const params = { limit, offset };
  if (category) params.category = category;

  const response = await productApi.get('/cms/faq', { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}

/**
 * Получение списка FAQ (admin)
 * @param {Object} params - Параметры запроса
 * @param {number} params.limit - Лимит
 * @param {number} params.offset - Смещение
 */
export async function getFaqsAdminRequest({ limit = 10, offset = 0 } = {}) {
  const params = { limit, offset };
  const response = await productApi.get('/cms/faq/admin', { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}

/**
 * Получение FAQ по ID
 * @param {number} faqId - ID FAQ
 */
export async function getFaqByIdRequest(faqId) {
  const response = await productApi.get(`/cms/faq/admin/${faqId}`);
  return unwrapResponse(response);
}

/**
 * Поиск FAQ
 * @param {Object} params - Параметры поиска
 * @param {string} params.q - Поисковый запрос
 * @param {string} params.category - Категория
 * @param {number} params.limit - Лимит
 * @param {number} params.offset - Смещение
 */
export async function searchFaqsRequest({
  q,
  category,
  limit = 10,
  offset = 0,
} = {}) {
  const params = { q, limit, offset };
  if (category) params.category = category;

  const response = await productApi.get('/cms/faq/admin/search', { params });
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
 * Получение SEO данных по page_slug (public)
 * @param {string} pageSlug - Slug страницы
 */
export async function getSeoDataRequest(pageSlug) {
  const response = await productApi.get(`/cms/seo/${pageSlug}/meta`);
  return unwrapResponse(response);
}

/**
 * Получение SEO данных по ID (admin)
 * @param {number} seoId - ID SEO записи
 */
export async function getSeoByIdRequest(seoId) {
  const response = await productApi.get(`/cms/seo/admin/${seoId}`);
  return unwrapResponse(response);
}

/**
 * Получение списка всех SEO записей (admin)
 * @param {Object} params - Параметры запроса
 * @param {string} params.page_slug - Фильтр по slug
 * @param {string} params.title - Фильтр по заголовку
 * @param {number} params.limit - Лимит
 * @param {number} params.offset - Смещение
 */
export async function getSeoListRequest({
  page_slug,
  title,
  limit = 10,
  offset = 0,
} = {}) {
  const params = { limit, offset };
  if (page_slug) params.page_slug = page_slug;
  if (title) params.title = title;

  const response = await productApi.get('/cms/seo/admin', { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;
  const pagination = {
    page: Math.floor(offset / limit) + 1,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return { items, pagination };
}

/**
 * Поиск SEO данных
 * @param {Object} params - Параметры поиска
 * @param {string} params.q - Поисковый запрос
 * @param {number} params.limit - Лимит
 * @param {number} params.offset - Смещение
 */
export async function searchSeoRequest({
  q,
  limit = 10,
  offset = 0,
} = {}) {
  const params = { q, limit, offset };
  const response = await productApi.get('/cms/seo/admin/search', { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;

  return { items, total };
}

/**
 * Создание SEO данных
 * @param {Object} payload - Данные SEO
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

// ============================================================================
// EMAIL TEMPLATES API
// ============================================================================

/**
 * Получение списка email шаблонов
 * @param {Object} params - Параметры запроса
 * @param {number} params.limit - Лимит
 * @param {number} params.offset - Смещение
 */
export async function getEmailTemplatesRequest({ limit = 10, offset = 0 } = {}) {
  const params = { limit, offset };
  const response = await productApi.get('/cms/email-templates/admin', { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;
  const pagination = {
    page: Math.floor(offset / limit) + 1,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return { items, pagination };
}

/**
 * Получение шаблона по ключу (public)
 * @param {string} key - Ключ шаблона
 */
export async function getEmailTemplateByKeyRequest(key) {
  const response = await productApi.get(`/cms/email-templates/${key}`);
  return unwrapResponse(response);
}

/**
 * Получение шаблона по ID (admin)
 * @param {number} templateId - ID шаблона
 */
export async function getEmailTemplateByIdRequest(templateId) {
  const response = await productApi.get(`/cms/email-templates/admin/${templateId}`);
  return unwrapResponse(response);
}

/**
 * Создание email шаблона
 * @param {Object} payload - Данные шаблона
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
 * @param {Object} params - Параметры запроса
 * @param {number} params.limit - Лимит
 * @param {number} params.offset - Смещение
 */
export async function getFeatureFlagsRequest({ limit = 10, offset = 0 } = {}) {
  const params = { limit, offset };
  const response = await productApi.get('/cms/feature-flags/admin', { params });
  const data = unwrapResponse(response);
  const items = Array.isArray(data?.items) ? data.items : [];
  const total = data?.total ?? items.length;
  const pagination = {
    page: Math.floor(offset / limit) + 1,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return { items, pagination };
}

/**
 * Получение включенных feature flags (public)
 */
export async function getEnabledFeatureFlagsRequest() {
  const response = await productApi.get('/cms/feature-flags/enabled');
  return unwrapResponse(response);
}

/**
 * Получение feature flag по ID
 * @param {number} flagId - ID флага
 */
export async function getFeatureFlagByIdRequest(flagId) {
  const response = await productApi.get(`/cms/feature-flags/admin/${flagId}`);
  return unwrapResponse(response);
}

/**
 * Создание feature flag
 * @param {Object} payload - Данные флага
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
