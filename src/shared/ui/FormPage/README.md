# FormPage — универсальный компонент для страниц форм

Единый шаблон для всех страниц создания/редактирования. Компонент предоставляет готовую шапку с кнопкой "Назад", заголовок, форму с кнопками сохранения и отмены.

## Расположение

```
src/shared/ui/FormPage/
├── FormPage.jsx          # Основной компонент
├── FormPage.module.css   # Стили
└── index.js              # Экспорт
```

## Использование

### Базовый пример

```jsx
import { FormPage } from '../../../shared/ui/FormPage';

export function CategoryFormPage() {
  const { categoryId } = useParams();
  const isEditMode = Boolean(categoryId);

  const handleSubmit = async (stayOnPage = false) => {
    // Логика сохранения
  };

  return (
    <FormPage
      title={isEditMode ? 'Редактирование категории' : 'Создание категории'}
      backUrl={`/categories/${categoryId}`}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onSubmit={() => handleSubmit(false)}
      onSubmitAndStay={() => handleSubmit(true)}
      showSubmitStay={true}
    >
      {/* Поля формы */}
      <FormSection title="Основная информация">
        <FormGrid columns={2}>
          <FormField label="Название">
            <input value={name} onChange={handleChange} />
          </FormField>
        </FormGrid>
      </FormSection>
    </FormPage>
  );
}
```

## API

### Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `title` | string | - | **Обязательный**. Заголовок страницы |
| `backUrl` | string | - | URL для возврата назад |
| `isLoading` | boolean | false | Индикатор загрузки данных |
| `isSubmitting` | boolean | false | Индикатор отправки формы |
| `onBack` | function | - | Обработчик нажатия кнопки "Назад" |
| `onSubmit` | function | - | **Обязательный**. Обработчик отправки формы |
| `onSubmitAndStay` | function | - | Обработчик отправки с оставаться на странице |
| `children` | ReactNode | - | Содержимое формы (поля, секции) |
| `showSubmitStay` | boolean | false | Показывать кнопку "Сохранить и остаться" |
| `submitText` | string | 'Сохранить' | Текст кнопки сохранения |
| `submitStayText` | string | 'Сохранить и остаться' | Текст кнопки "Сохранить и остаться" |

## Особенности

### Автоматическая блокировка Enter
Компонент автоматически предотвращает стандартную отправку формы при нажатии Enter (кроме textarea и кнопок).

### Адаптивность
- На десктопе: шапка, контент и кнопки сохранения в одном потоке
- На мобильных:
  - Шапка фиксируется сверху
  - Кнопки сохранения фиксируются снизу
  - Контент прокручивается между ними

### Кнопки действий
- **Отмена** — возвращает назад без сохранения
- **Сохранить и остаться** (опционально) — сохраняет и остаётся на странице
- **Сохранить** — сохраняет и перенаправляет назад

## Примеры использования

### Простая форма (без "Сохранить и остаться")

```jsx
<FormPage
  title="Создание производителя"
  backUrl="/catalog/manufacturers"
  isLoading={isLoading}
  isSubmitting={isSubmitting}
  onSubmit={handleSubmit}
>
  <FormSection title="Основная информация">
    <FormGrid>
      <FormField label="Название">
        <input value={name} onChange={handleChange} />
      </FormField>
      <FormField label="Описание">
        <textarea value={description} onChange={handleChange} />
      </FormField>
    </FormGrid>
  </FormSection>
</FormPage>
```

### Форма с изображениями

```jsx
<FormPage
  title="Редактирование категории"
  backUrl={`/categories/${categoryId}`}
  isLoading={isLoading}
  isSubmitting={isSubmitting}
  onSubmit={() => handleSubmit(false)}
  onSubmitAndStay={() => handleSubmit(true)}
  showSubmitStay={true}
>
  <FormSection title="Основная информация">
    <FormGrid columns={2}>
      <FormField label="Название">
        <input value={name} onChange={handleChange} />
      </FormField>
    </FormGrid>
  </FormSection>

  <FormSection title="Изображения">
    <ImageCarousel
      images={images}
      onImagesChange={handleImagesChange}
      multiple
    />
  </FormSection>
</FormPage>
```

### Форма с кастомным обработчиком назад

```jsx
<FormPage
  title="Редактирование товара"
  isLoading={isLoading}
  isSubmitting={isSubmitting}
  onBack={() => navigate(`/products/${productId}`)}
  onSubmit={handleSubmit}
>
  {/* Поля формы */}
</FormPage>
```

## Миграция существующих страниц

### До

```jsx
// Старый код
export function OldFormPage() {
  return (
    <section className={styles.formPage}>
      <PageHeader title="Создание" onBack={handleBack} />
      
      <form onSubmit={handleSubmit}>
        <FormSection title="Информация">
          {/* Поля */}
        </FormSection>
        
        <PageActions>
          <Button onClick={handleBack}>Отмена</Button>
          <Button type="submit">Сохранить</Button>
        </PageActions>
      </form>
    </section>
  );
}
```

### После

```jsx
// Новый код
export function NewFormPage() {
  return (
    <FormPage
      title="Создание"
      backUrl="/list"
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <FormSection title="Информация">
        {/* Поля */}
      </FormSection>
    </FormPage>
  );
}
```

## Преимущества

- ✅ Единый стиль для всех форм
- ✅ Меньше кода в каждой странице
- ✅ Готовая адаптивность
- ✅ Автоматическая обработка Enter
- ✅ Консистентный UX
- ✅ Легко поддерживать
