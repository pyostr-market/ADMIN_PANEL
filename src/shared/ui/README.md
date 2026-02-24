# UI Components Documentation

## Обзор

Эта директория содержит универсальные UI-компоненты для использования во всём приложении.

---

## Layout Components

### PageHeader

Заголовок страницы с кнопкой "Назад" и опциональными действиями.

**Импорт:**
```js
import { PageHeader } from '../../shared/ui/PageHeader/PageHeader';
```

**Пропсы:**
- `title` (string) — заголовок страницы
- `subtitle` (string) — подзаголовок
- `onBack` (function) — обработчик клика назад
- `backUrl` (string) — URL для возврата
- `actions` (ReactNode) — кнопки действий справа
- `className` (string) — дополнительный класс

**Пример:**
```jsx
<PageHeader
  title="Создание категории"
  subtitle="Заполните форму для добавления новой категории"
  onBack={() => navigate('/categories')}
  actions={
    <Button variant="primary">Действие</Button>
  }
/>
```

---

### FormSection

Секция формы с иконкой, заголовком и описанием.

**Импорт:**
```js
import { FormSection } from '../../shared/ui/FormSection/FormSection';
```

**Пропсы:**
- `icon` (ReactNode) — иконка секции
- `iconVariant` ('primary' | 'secondary' | 'success' | 'info' | 'warning' | 'accent')
- `title` (string) — заголовок секции
- `description` (string) — описание
- `children` (ReactNode) — содержимое секции
- `className` (string) — дополнительный класс

**Пример:**
```jsx
<FormSection
  icon={<FiUser />}
  iconVariant="primary"
  title="Основные данные"
  description="Учётные данные пользователя"
>
  <FormGrid columns={2}>
    {/* поля формы */}
  </FormGrid>
</FormSection>
```

---

### FormGrid

Сетка для полей формы.

**Импорт:**
```js
import { FormGrid } from '../../shared/ui/FormGrid/FormGrid';
```

**Пропсы:**
- `columns` (number) — количество колонок (1, 2, 3)
- `children` (ReactNode) — содержимое
- `className` (string) — дополнительный класс

**Пример:**
```jsx
<FormGrid columns={2}>
  <div>Поле 1</div>
  <div>Поле 2</div>
</FormGrid>
```

---

### PageActions

Панель кнопок действий внизу страницы.

**Импорт:**
```js
import { PageActions } from '../../shared/ui/PageActions/PageActions';
```

**Пропсы:**
- `align` ('start' | 'end' | 'center' | 'space-between')
- `children` (ReactNode) — кнопки
- `className` (string) — дополнительный класс

**Пример:**
```jsx
<PageActions>
  <Button variant="secondary">Отмена</Button>
  <Button variant="primary">Сохранить</Button>
</PageActions>
```

---

### Card

Универсальная карточка.

**Импорт:**
```js
import { Card } from '../../shared/ui/Card/Card';
```

**Пропсы:**
- `variant` ('default' | 'secondary' | 'muted' | 'no-shadow' | 'no-border')
- `padding` ('sm' | 'md' | 'lg' | 'none')
- `children` (ReactNode) — содержимое
- `className` (string) — дополнительный класс

**Пример:**
```jsx
<Card variant="default" padding="md">
  <h3>Заголовок</h3>
  <p>Содержимое карточки</p>
</Card>
```

---

## Form Components

### FormField

Обёртка для поля формы.

**Импорт:**
```js
import { FormField } from '../../shared/ui/FormField/FormField';
```

**Пропсы:**
- `label` (string) — метка
- `error` (string) — сообщение об ошибке
- `hint` (string) — подсказка
- `required` (boolean) — обязательное поле
- `children` (ReactNode) — input/textarea/select
- `className` (string) — дополнительный класс

**Пример:**
```jsx
<FormField
  label="Название"
  required
  error={errors.name}
  hint="Введите название категории"
>
  <input
    type="text"
    value={formData.name}
    onChange={(e) => handleChange('name', e.target.value)}
  />
</FormField>
```

---

### FormTextarea

Текстовое поле с меткой и ошибкой.

**Импорт:**
```js
import { FormTextarea } from '../../shared/ui/FormTextarea/FormTextarea';
```

**Пропсы:**
- `label` (string) — метка
- `error` (string) — сообщение об ошибке
- `hint` (string) — подсказка
- `required` (boolean) — обязательное поле
- `rows` (number) — количество строк
- `className` (string) — дополнительный класс

**Пример:**
```jsx
<FormTextarea
  label="Описание"
  value={formData.description}
  onChange={(e) => handleChange('description', e.target.value)}
  rows={4}
  hint="Введите подробное описание"
/>
```

---

### FormSelect

Выпадающий список с меткой и ошибкой.

**Импорт:**
```js
import { FormSelect } from '../../shared/ui/FormSelect/FormSelect';
```

**Пропсы:**
- `label` (string) — метка
- `error` (string) — сообщение об ошибке
- `hint` (string) — подсказка
- `required` (boolean) — обязательное поле
- `options` (array) — опции [{value, label}]
- `placeholder` (string) — текст заглушки

**Пример:**
```jsx
<FormSelect
  label="Группа"
  value={formData.group_id}
  onChange={(e) => handleChange('group_id', e.target.value)}
  options={[
    { value: '1', label: 'Администратор' },
    { value: '2', label: 'Менеджер' },
  ]}
  placeholder="Выберите группу"
/>
```

---

## State Components

### LoadingState

Состояние загрузки.

**Импорт:**
```js
import { LoadingState } from '../../shared/ui/LoadingState/LoadingState';
```

**Пропсы:**
- `message` (string) — сообщение
- `size` ('sm' | 'md' | 'lg')
- `className` (string) — дополнительный класс

**Пример:**
```jsx
{isLoading && <LoadingState message="Загрузка..." size="lg" />}
```

---

### ErrorState

Состояние ошибки.

**Импорт:**
```js
import { ErrorState } from '../../shared/ui/ErrorState/ErrorState';
```

**Пропсы:**
- `message` (string) — сообщение об ошибке
- `onRetry` (function) — обработчик повтора
- `retryLabel` (string) — текст кнопки повтора

**Пример:**
```jsx
{error && (
  <ErrorState
    message="Не удалось загрузить данные"
    onRetry={loadData}
    retryLabel="Повторить"
  />
)}
```

---

### EmptyState

Пустое состояние списка.

**Импорт:**
```js
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState';
```

**Пропсы:**
- `icon` (ReactNode) — иконка
- `title` (string) — заголовок
- `description` (string) — описание
- `action` (ReactNode) — кнопка действия

**Пример:**
```jsx
{items.length === 0 && (
  <EmptyState
    title="Нет данных"
    description="Список пуст"
    action={<Button>Добавить</Button>}
  />
)}
```

---

## Миграция существующих страниц

### До:
```jsx
<header className="category-form-page__header">
  <Button onClick={() => navigate('/categories')}>← Назад</Button>
  <h1 className="category-form-page__title">Создание категории</h1>
</header>

<section className="category-form__section">
  <div className="category-form__section-header">
    <div className="category-form__section-icon">📁</div>
    <div>
      <h2 className="category-form__section-title">Основная информация</h2>
      <p className="category-form__section-description">Данные о категории</p>
    </div>
  </div>
  
  <div className="category-form__grid">
    <div className="category-form__field">
      <label className="category-form__label">Название</label>
      <input type="text" value={formData.name} />
    </div>
  </div>
</section>

<div className="category-form-page__actions">
  <Button>Отмена</Button>
  <Button>Сохранить</Button>
</div>
```

### После:
```jsx
<PageHeader
  title="Создание категории"
  onBack={() => navigate('/categories')}
/>

<FormSection
  icon={<span>📁</span>}
  iconVariant="primary"
  title="Основная информация"
  description="Данные о категории"
>
  <FormGrid columns={2}>
    <div className="category-form__field">
      <label className="category-form__label">Название</label>
      <input type="text" value={formData.name} />
    </div>
  </FormGrid>
</FormSection>

<PageActions>
  <Button variant="secondary">Отмена</Button>
  <Button variant="primary">Сохранить</Button>
</PageActions>
```

---

## Преимущества

1. **Уменьшение дублирования** — стили вынесены в общие компоненты
2. **Консистентность** — единый дизайн во всём приложении
3. **Лёгкость поддержки** — изменения в одном месте применяются везде
4. **Ускорение разработки** — готовые компоненты для повторного использования
