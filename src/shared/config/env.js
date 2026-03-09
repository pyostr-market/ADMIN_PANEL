
const USER_SERVICE_BASE_URL = process.env.REACT_APP_USER_SERVICE_BASE_URL

const PRODUCT_SERVICE_BASE_URL = process.env.REACT_APP_PRODUCT_SERVICE_BASE_URL

const PRICING_ENGINE_BASE_URL = process.env.REACT_APP_PRICING_ENGINE_BASE_URL

export {
  USER_SERVICE_BASE_URL,
  PRODUCT_SERVICE_BASE_URL,
  PRICING_ENGINE_BASE_URL
};
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
