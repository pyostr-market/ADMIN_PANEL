# InfoBlock — универсальный компонент блока информации

Единый компонент для отображения информации в карточках с иконками. Используется на всех страницах детального просмотра (DetailPage).

## Расположение

```
src/shared/ui/InfoBlock/
├── InfoBlock.jsx          # Основной компонент
├── InfoBlock.module.css   # Стили
└── index.js               # Экспорт
```

## Использование

### Базовый пример

```jsx
import { InfoBlock } from '../../../shared/ui/InfoBlock';
import { FiBox, FiTag, FiClock } from 'react-icons/fi';

<InfoBlock
  title="Информация"
  headerIcon={<FiBox />}
  items={[
    {
      label: 'ID',
      value: product.id,
      iconVariant: 'primary',
    },
    {
      label: 'Название',
      value: product.name,
      iconVariant: 'secondary',
    },
    {
      label: 'Описание',
      value: product.description,
      iconVariant: 'info',
      fullWidth: true,
    },
  ]}
  auditUrl="/products/1/audit"
  onAuditClick={handleViewAudit}
/>
```

## API

### Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `title` | string | 'Информация' | Заголовок блока |
| `headerIcon` | ReactNode | `<FiBox />` | Иконка в заголовке |
| `items` | InfoItem[] | - | **Обязательный**. Массив элементов для отображения |
| `auditUrl` | string | - | URL для перехода на страницу аудита (если указан, показывается кнопка "История") |
| `onAuditClick` | function | - | Обработчик клика по кнопке "История" |
| `className` | string | '' | Дополнительный CSS-класс |

### InfoItem

| Свойство | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `label` | string | - | **Обязательный**. Метка поля |
| `value` | ReactNode | - | **Обязательный**. Значение поля |
| `icon` | ReactNode | `<FiBox />` | Иконка для карточки |
| `iconVariant` | string | 'primary' | Вариант иконки: `'primary' \| 'secondary' \| 'info' \| 'success' \| 'accent'` |
| `fullWidth` | boolean | false | Растянуть на всю ширину (grid-column: 1 / -1) |

### Варианты иконок

| Variant | Цвет | Градиент |
|---------|------|----------|
| `primary` | Синий | `var(--accent-blue-bg)` |
| `secondary` | Зелёный | `var(--accent-green-bg)` |
| `info` | Оранжевый | `var(--accent-orange-bg)` |
| `success` | Синий | `var(--accent-blue-bg)` |
| `accent` | Фиолетовый | `var(--accent-purple-bg)` |

## Примеры использования

### ProductTypeDetailPage

```jsx
<InfoBlock
  title="Информация"
  headerIcon={<FiBox />}
  items={[
    {
      label: 'ID типа продукта',
      value: productType.id,
      iconVariant: 'primary',
    },
    {
      label: 'Название',
      value: productType.name || '—',
      iconVariant: 'secondary',
    },
    {
      label: 'Родительский тип',
      value: productType.parent_id ? `ID: ${productType.parent_id}` : '—',
      iconVariant: 'accent',
    },
    {
      label: 'Создан',
      value: productType.created_at
        ? new Date(productType.created_at).toLocaleDateString('ru-RU')
        : '—',
      iconVariant: 'info',
    },
  ]}
  auditUrl={`/catalog/device_type/${productTypeId}/audit`}
  onAuditClick={handleViewAudit}
/>
```

### ManufacturerDetailPage

```jsx
<InfoBlock
  title="Информация"
  headerIcon={<FiBox />}
  items={[
    {
      label: 'ID производителя',
      value: manufacturer.id,
      iconVariant: 'primary',
    },
    {
      label: 'Название',
      value: manufacturer.name || '—',
      iconVariant: 'secondary',
    },
    {
      label: 'Описание',
      value: manufacturer.description,
      iconVariant: 'info',
      fullWidth: true,
    },
  ]}
  headerAction={
    <Button variant="secondary" size="sm" leftIcon={<FiClock />} onClick={handleViewAudit}>
      История
    </Button>
  }
/>
```

### SupplierDetailPage

```jsx
<InfoBlock
  title="Информация"
  headerIcon={<FiBox />}
  items={[
    {
      label: 'ID поставщика',
      value: supplier.id,
      iconVariant: 'primary',
    },
    {
      label: 'Название',
      value: supplier.name || '—',
      iconVariant: 'secondary',
    },
    {
      label: 'Email',
      value: supplier.contact_email,
      icon: <FiMail />,
      iconVariant: 'success',
    },
    {
      label: 'Телефон',
      value: supplier.phone,
      icon: <FiPhone />,
      iconVariant: 'info',
    },
  ]}
  headerAction={
    <Button variant="secondary" size="sm" leftIcon={<FiClock />} onClick={handleViewAudit}>
      История
    </Button>
  }
/>
```

### С кастомными иконками

```jsx
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

<InfoBlock
  title="Контакты"
  items={[
    {
      label: 'Email',
      value: company.email,
      icon: <FiMail />,
      iconVariant: 'success',
    },
    {
      label: 'Телефон',
      value: company.phone,
      icon: <FiPhone />,
      iconVariant: 'info',
    },
    {
      label: 'Адрес',
      value: company.address,
      icon: <FiMapPin />,
      iconVariant: 'accent',
      fullWidth: true,
    },
  ]}
/>
```

## Особенности

### Автоматическая обработка пустых значений
Если `value` равно `null`, `undefined` или пустой строке, отображается '—'.

### Grid layout
Карточки автоматически располагаются в сетке:
- На десктопе: `repeat(auto-fill, minmax(200px, 1fr))`
- На мобильных: `1fr` (одна колонка)

### Hover эффекты
При наведении карточка немного поднимается и появляется тень.

### Адаптивность
- На мобильных устройствах шапка фиксируется сверху
- Карточки располагаются в одну колонку
- Уменьшаются размеры иконок и шрифтов

## Преимущества

- ✅ Единый стиль для всех DetailPage
- ✅ Меньше дублирования кода
- ✅ Легко добавлять новые поля
- ✅ Готовая адаптивность
- ✅ Консистентный UX
- ✅ Гибкая настройка иконок и вариантов
