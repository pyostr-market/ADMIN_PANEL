// Конфигурация навигации для мобильного и десктопного меню
// Все разделы добавляются в одном месте

export const NAVIGATION_CONFIG = {
  // CRM разделы
  crm: {
    title: 'CRM',
    icon: 'crm',
    items: [
      {
        label: 'Заказы',
        path: '/crm/orders',
        icon: 'orders',
      },
      {
        label: 'Клиенты',
        path: '/crm/customers',
        icon: 'customers',
      },
      {
        label: 'Обращения',
        path: '/crm/tickets',
        icon: 'tickets',
      },
      {
        label: 'Актуализация',
        path: '/actualization',
        icon: 'colors',
      },
      {
        label: 'Пользователи',
        path: '/users',
        icon: 'users',
      },
      {
        label: 'Группы доступа',
        path: '/users/permissions-groups',
        icon: 'permissions',
      },

    ],
  },

  // Каталог разделы
  catalog: {
    title: 'Каталог',
    icon: 'catalog',
    items: [
      {
        label: 'Товары',
        path: '/catalog/products',
        icon: 'products',
      },
      {
        label: 'Категории',
        path: '/categories',
        icon: 'categories',
      },
      {
        label: 'Производители',
        path: '/catalog/manufacturers',
        icon: 'manufacturers',
      },
      {
        label: 'Поставщики',
        path: '/suppliers',
        icon: 'suppliers',
      },
      {
        label: 'Типы товаров',
        path: '/catalog/device_type',
        icon: 'product-types',
      },
      // {
      //   label: 'Атрибуты',
      //   path: '/catalog/attributes',
      //   icon: 'attributes',
      // },
    ],
  },

  // Склад разделы
  warehouse: {
    title: 'Склад',
    icon: 'warehouse',
    items: [
      {
        label: 'Товары на складе',
        path: '/warehouse/stock',
        icon: 'warehouse-products',
      },
      {
        label: 'Движение товаров',
        path: '/warehouse/movements',
        icon: 'movements',
      },
      {
        label: 'Инвентаризация',
        path: '/warehouse/inventory',
        icon: 'inventory',
      },
    ],
  },

  // Биллинг разделы
  billing: {
    title: 'Биллинг',
    icon: 'billing',
    items: [
      {
        label: 'Тарифы категорий',
        path: '/billing/pricing-policies',
        icon: 'pricing',
      },
    ],
  },

  // Дополнительные разделы (для ПК навигации)
  additional: [
    {
      label: 'Главная',
      path: '/',
      icon: 'home',
    },
    {
      label: 'Поддержка',
      path: '/support',
      icon: 'support',
    },
    {
      label: 'Дашборд',
      path: '/dashboard',
      icon: 'dashboard',
    },
  ],

  // Футер меню (профиль и тема)
  footer: [
    {
      label: 'Профиль',
      path: '/profile',
      icon: 'profile',
    },
    {
      label: 'Тема',
      action: 'toggle-theme',
      icon: 'theme',
    },
  ],
};

// Экспортируем все пути для удобной проверки активных состояний
export const getAllPaths = () => {
  const paths = [];
  
  Object.keys(NAVIGATION_CONFIG).forEach((key) => {
    if (key === 'footer' || key === 'additional') {
      NAVIGATION_CONFIG[key].forEach((item) => {
        if (item.path) paths.push(item.path);
      });
    } else {
      NAVIGATION_CONFIG[key].items.forEach((item) => {
        paths.push(item.path);
      });
    }
  });
  
  return paths;
};

// Проверка активного пути
export const isActivePath = (currentPath, itemPath) => {
  if (!currentPath || !itemPath) return false;
  return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
};
