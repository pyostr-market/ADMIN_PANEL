export const USER_SERVICE_BASE_URL = 'https://market-user.open-gpt.ru';
export const PRODUCT_SERVICE_BASE_URL = 'https://market-product.open-gpt.ru';

export const API_ENDPOINTS = {
  // User service
  login: '/auth/login',
  refresh: '/auth/refresh',
  myPermissions: '/permissions/me',
  permissions: '/permissions/',
  groups: '/users/admin/groups',
  users: '/users/admin/users',

  // Product service (catalog)
  manufacturers: '/manufacturer',
  suppliers: '/supplier',
  categories: '/category',
  products: '/product',
  productTypes: '/product-types',
};
