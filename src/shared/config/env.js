export const USER_SERVICE_BASE_URL = 'https://market-user.open-gpt.ru';
export const PRODUCT_SERVICE_BASE_URL = 'https://market-product.open-gpt.ru';
// export const PRODUCT_SERVICE_BASE_URL = 'http://0.0.0.0:8000';

export const API_ENDPOINTS = {
  // User service - Auth
  login: '/auth/login',
  logout: '/auth/logout',
  register: '/auth/register',
  refresh: '/auth/refresh',
  authMe: '/auth/me',

  // User service - Profile
  profile: '/users/profile',

  // User service - Permissions
  myPermissions: '/permissions/me',
  permissions: '/permissions/',

  // User service - Groups
  groups: '/users/admin/groups',

  // User service - Admin users
  users: '/users/admin/users',

  // Product service (catalog)
  manufacturers: '/manufacturer',
  suppliers: '/supplier',
  categories: '/category',
  products: '/product',
  productTypes: '/product/type',
  attributes: '/product/attribute',
};
