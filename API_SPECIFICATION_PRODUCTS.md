# API Specification — Товары (Модуль «Actualization / Catalog»)

> Base URL: `/admin/catalog/products`
>
> Все endpoints требуют авторизации (Bearer Token в заголовке `Authorization`).
>
> Все ответы обёрнуты в единый формат: `{ "success": true, "data": ... }` или `{ "success": false, "error": { "code": "...", "message": "..." } }`.

---

## 1. Аутентификация и права доступа

| Permission | Endpoint |
|-----------|----------|
| `pricing_engine:view` | `GET /admin/catalog/products` , `GET /admin/catalog/products/{id}` |
| `pricing_engine:create` | `POST /admin/catalog/products` |
| `pricing_engine:update` | `PUT /admin/catalog/products/{id}` |
| `pricing_engine:delete` | `DELETE /admin/catalog/products/{id}` |

> **Примечание для фронтенда:** Токен передаётся в заголовке `Authorization: Bearer <token>`. Если у пользователя нет нужного права — сервер вернёт `403 Forbidden`.

---

## 2. Формат ответов

### Успешный ответ (одиночный товар)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "actualization_task_id": "123e4567-e89b-12d3-a456-426614174000",
    "external_id": 1001,
    "name": "Смартфон Samsung Galaxy S24",
    "price": 59990.00,
    "description": "Флагманский смартфон с AMOLED-дисплеем",
    "category_id": 10,
    "category_name": "Электроника",
    "supplier_id": 5,
    "supplier_name": "ООО ТехноТрейд",
    "product_type_id": 3,
    "product_type_name": "Смартфоны",
    "attributes": {
      "Цвет": "Чёрный",
      "Память": "256 ГБ",
      "Диагональ": "6.2\""
    }
  }
}
```

### Успешный ответ (список товаров с пагинацией)
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "actualization_task_id": "123e4567-e89b-12d3-a456-426614174000",
        "external_id": 1001,
        "name": "Смартфон Samsung Galaxy S24",
        "price": 59990.00,
        "description": "Флагманский смартфон",
        "category_id": 10,
        "category_name": "Электроника",
        "supplier_id": 5,
        "supplier_name": "ООО ТехноТрейд",
        "product_type_id": 3,
        "product_type_name": "Смартфоны",
        "attributes": { "Цвет": "Чёрный" }
      }
    ],
    "total": 250
  }
}
```

### Ответ с ошибкой
```json
{
  "success": false,
  "error": {
    "code": "product_not_found",
    "message": "Товар 550e8400-e29b-41d4-a716-446655440000 не найден",
    "details": {}
  }
}
```

### HTTP-коды ошибок
| Код | Ситуация |
|-----|----------|
| `400` | Ошибка валидации (имя пустое, external_id ≤ 0, price < 0) |
| `401` | Нет авторизации |
| `403` | Нет нужного permission |
| `404` | Товар не найден |
| `409` | Конфликт: товар с таким `actualization_task_id + external_id` уже существует |
| `422` | Нарушение внешних ключей (задача актуализации не существует) |

---

## 3. Схемы данных

### ProductCreateRequest — тело запроса для создания товара
| Поле | Тип | Обязательное | Ограничения | Описание |
|------|-----|-------------|-------------|----------|
| `actualization_task_id` | UUID | ✅ | — | ID задачи актуализации, к которой привязан товар |
| `external_id` | int | ✅ | > 0 | Внешний ID товара из каталога-источника |
| `name` | string | ✅ | 1–500 символов | Название товара |
| `price` | float | ❌ | ≥ 0 | Цена товара. `null` если цена не указана |
| `description` | string | ❌ | — | Описание товара |
| `category_id` | int | ❌ | > 0 | ID категории во внешней системе |
| `category_name` | string | ❌ | ≤ 255 символов | Название категории |
| `supplier_id` | int | ❌ | > 0 | ID поставщика во внешней системе |
| `supplier_name` | string | ❌ | ≤ 255 символов | Название поставщика |
| `product_type_id` | int | ❌ | > 0 | ID типа товара во внешней системе |
| `product_type_name` | string | ❌ | ≤ 255 символов | Название типа товара |
| `attributes` | object | ❌ | JSON | Дополнительные атрибуты товара (произвольный JSON-объект) |

> **Важно для фронтенда:**
> - `actualization_task_id` — **обязательное** поле. Каждый товар привязан к задаче актуализации.
> - Уникальность товара определяется парой `actualization_task_id + external_id`.
> - `attributes` — произвольный JSON-объект, например: `{ "Цвет": "Чёрный", "Вес": "1.5 кг" }`.

### ProductUpdateRequest — тело запроса для обновления товара
| Поле | Тип | Обязательное | Ограничения | Описание |
|------|-----|-------------|-------------|----------|
| `actualization_task_id` | UUID | ❌ | — | ID задачи актуализации |
| `external_id` | int | ❌ | > 0 | Внешний ID товара |
| `name` | string | ❌ | 1–500 символов | Название товара |
| `price` | float | ❌ | ≥ 0 | Цена товара |
| `description` | string | ❌ | — | Описание товара |
| `category_id` | int | ❌ | > 0 | ID категории |
| `category_name` | string | ❌ | ≤ 255 символов | Название категории |
| `supplier_id` | int | ❌ | > 0 | ID поставщика |
| `supplier_name` | string | ❌ | ≤ 255 символов | Название поставщика |
| `product_type_id` | int | ❌ | > 0 | ID типа товара |
| `product_type_name` | string | ❌ | ≤ 255 символов | Название типа товара |
| `attributes` | object | ❌ | JSON | Дополнительные атрибуты |

> **Важно:** Все поля необязательны. Обновляются только переданные. Оставшиеся `null` поля игнорируются.

### ProductResponse — ответ с данными товара
| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Уникальный ID товара (внутренний, формат `550e8400-...`) |
| `actualization_task_id` | UUID | ID задачи актуализации |
| `external_id` | int | Внешний ID из каталога-источника |
| `name` | string | Название товара |
| `price` | float \| null | Цена товара |
| `description` | string \| null | Описание товара |
| `category_id` | int \| null | ID категории во внешней системе |
| `category_name` | string \| null | Название категории |
| `supplier_id` | int \| null | ID поставщика во внешней системе |
| `supplier_name` | string \| null | Название поставщика |
| `product_type_id` | int \| null | ID типа товара во внешней системе |
| `product_type_name` | string \| null | Название типа товара |
| `attributes` | object \| null | Дополнительные атрибуты (JSON-объект) |

### PaginatedResponse — ответ списка
| Поле | Тип | Описание |
|------|-----|----------|
| `items` | ProductResponse[] | Массив товаров текущей страницы |
| `total` | int | Общее количество записей (без пагинации) |

---

## 4. Endpoints

---

### 4.1 GET `/admin/catalog/products` — Список товаров

**Permission:** `pricing_engine:view`

**Query-параметры:**

| Параметр | Тип | По умолчанию | Ограничения | Описание |
|----------|-----|-------------|-------------|----------|
| `actualization_task_id` | UUID (string) | — | — | Фильтр по задаче актуализации |
| `external_id` | int | — | — | Фильтр по внешнему ID |
| `category_id` | int | — | — | Фильтр по ID категории |
| `supplier_id` | int | — | — | Фильтр по ID поставщика |
| `limit` | int | `100` | 1–1000 | Количество записей на странице |
| `offset` | int | `0` | ≥ 0 | Смещение от начала списка |

> **Примечание для фронтенда:**
> - Все фильтры **независимы** и могут комбинироваться.
> - Сортировка — по `created_at` (убывание, newest first).
> - Для пагинации используйте `limit` + `offset`. Общее количество записей — в поле `total`.

**Пример запроса:**
```
GET /admin/catalog/products?actualization_task_id=123e4567-e89b-12d3-a456-426614174000&limit=20&offset=0
```

**Пример ответа (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "actualization_task_id": "123e4567-e89b-12d3-a456-426614174000",
        "external_id": 1001,
        "name": "Смартфон Samsung Galaxy S24",
        "price": 59990.00,
        "description": "Флагманский смартфон",
        "category_id": 10,
        "category_name": "Электроника",
        "supplier_id": 5,
        "supplier_name": "ООО ТехноТрейд",
        "product_type_id": 3,
        "product_type_name": "Смартфоны",
        "attributes": { "Цвет": "Чёрный" }
      }
    ],
    "total": 1
  }
}
```

**Пример ответа (пустой список, 200):**
```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0
  }
}
```

---

### 4.2 GET `/admin/catalog/products/{product_id}` — Получить товар по ID

**Permission:** `pricing_engine:view`

**Path-параметры:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `product_id` | UUID (string) | Уникальный ID товара (формат `550e8400-e29b-41d4-a716-...`) |

**Пример ответа (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "actualization_task_id": "123e4567-e89b-12d3-a456-426614174000",
    "external_id": 1001,
    "name": "Смартфон Samsung Galaxy S24",
    "price": 59990.00,
    "description": "Флагманский смартфон с AMOLED-дисплеем",
    "category_id": 10,
    "category_name": "Электроника",
    "supplier_id": 5,
    "supplier_name": "ООО ТехноТрейд",
    "product_type_id": 3,
    "product_type_name": "Смартфоны",
    "attributes": {
      "Цвет": "Чёрный",
      "Память": "256 ГБ"
    }
  }
}
```

**Пример ответа (404 — не найден):**
```json
{
  "success": false,
  "error": {
    "code": "product_not_found",
    "message": "Товар 550e8400-e29b-41d4-a716-446655440000 не найден",
    "details": {}
  }
}
```

---

### 4.3 POST `/admin/catalog/products` — Создать товар

**Permission:** `pricing_engine:create`

**Тело запроса:** `ProductCreateRequest`

```json
{
  "actualization_task_id": "123e4567-e89b-12d3-a456-426614174000",
  "external_id": 1001,
  "name": "Смартфон Samsung Galaxy S24",
  "price": 59990.00,
  "description": "Флагманский смартфон",
  "category_id": 10,
  "category_name": "Электроника",
  "supplier_id": 5,
  "supplier_name": "ООО ТехноТрейд",
  "product_type_id": 3,
  "product_type_name": "Смартфоны",
  "attributes": {
    "Цвет": "Чёрный",
    "Память": "256 ГБ"
  }
}
```

**Пример ответа (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "actualization_task_id": "123e4567-e89b-12d3-a456-426614174000",
    "external_id": 1001,
    "name": "Смартфон Samsung Galaxy S24",
    "price": 59990.00,
    "description": "Флагманский смартфон",
    "category_id": 10,
    "category_name": "Электроника",
    "supplier_id": 5,
    "supplier_name": "ООО ТехноТрейд",
    "product_type_id": 3,
    "product_type_name": "Смартфоны",
    "attributes": {
      "Цвет": "Чёрный",
      "Память": "256 ГБ"
    }
  }
}
```

**Пример ответа (409 — уже существует):**
```json
{
  "success": false,
  "error": {
    "code": "product_already_exists",
    "message": "Товар с внешним ID 1001 уже существует в задаче 123e4567-e89b-12d3-a456-426614174000",
    "details": {}
  }
}
```

**Пример ответа (422 — задача актуализации не существует):**
```json
{
  "success": false,
  "error": {
    "code": "product_foreign_key_violation",
    "message": "Задача актуализации 123e4567-e89b-12d3-a456-426614174000 не существует",
    "details": {}
  }
}
```

> **Примечание для фронтенда:**
> - `actualization_task_id` — обязательное поле. Перед созданием товара убедитесь, что задача актуализации существует.
> - Уникальность: комбинация `actualization_task_id + external_id` должна быть уникальной.
> - `price` может быть `null` — если цена не указана.
> - `attributes` — произвольный JSON-объект. Сервер не валидирует содержимое.

---

### 4.4 PUT `/admin/catalog/products/{product_id}` — Обновить товар

**Permission:** `pricing_engine:update`

**Path-параметры:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `product_id` | UUID (string) | Уникальный ID товара |

**Тело запроса:** `ProductUpdateRequest`

```json
{
  "price": 54990.00,
  "attributes": {
    "Цвет": "Белый",
    "Память": "512 ГБ"
  }
}
```

> **Важно:** Передавайте только те поля, которые нужно обновить. Остальные будут сохранены.

**Пример ответа (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "actualization_task_id": "123e4567-e89b-12d3-a456-426614174000",
    "external_id": 1001,
    "name": "Смартфон Samsung Galaxy S24",
    "price": 54990.00,
    "description": "Флагманский смартфон",
    "category_id": 10,
    "category_name": "Электроника",
    "supplier_id": 5,
    "supplier_name": "ООО ТехноТрейд",
    "product_type_id": 3,
    "product_type_name": "Смартфоны",
    "attributes": {
      "Цвет": "Белый",
      "Память": "512 ГБ"
    }
  }
}
```

**Пример ответа (404 — не найден):**
```json
{
  "success": false,
  "error": {
    "code": "product_not_found",
    "message": "Товар 550e8400-e29b-41d4-a716-446655440000 не найден",
    "details": {}
  }
}
```

---

### 4.5 DELETE `/admin/catalog/products/{product_id}` — Удалить товар

**Permission:** `pricing_engine:delete`

**Path-параметры:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `product_id` | UUID (string) | Уникальный ID товара |

**Пример ответа (200):**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

**Пример ответа (404 — не найден):**
```json
{
  "success": false,
  "error": {
    "code": "product_not_found",
    "message": "Товар 550e8400-e29b-41d4-a716-446655440000 не найден",
    "details": {}
  }
}
```

> **Примечание для фронтенда:**
> - Удаление товара необратимо.
> - Товар удаляется каскадно при удалении привязанной задачи актуализации (`ON DELETE CASCADE`).

---

## 5. Сводная таблица endpoints

| Method | Path | Permission | Описание |
|--------|------|-----------|----------|
| `GET` | `/admin/catalog/products` | `pricing_engine:view` | Список товаров с фильтрацией и пагинацией |
| `GET` | `/admin/catalog/products/{id}` | `pricing_engine:view` | Получить товар по ID |
| `POST` | `/admin/catalog/products` | `pricing_engine:create` | Создать товар |
| `PUT` | `/admin/catalog/products/{id}` | `pricing_engine:update` | Обновить товар (частичное обновление) |
| `DELETE` | `/admin/catalog/products/{id}` | `pricing_engine:delete` | Удалить товар |

---

## 6. Рекомендации для фронтенда

### 6.1 Страница списка товаров (таблица)
- Используйте `GET /admin/catalog/products` с `limit=50` (или настраиваемым).
- Реализуйте клиентскую пагинацию через `offset` и `total`.
- Фильтры:
  - `actualization_task_id` — выпадающий список задач актуализации.
  - `category_id`, `supplier_id` — текстовые поля или выпадающие списки (если есть справочники).
  - `external_id` — поле для точного поиска.
- Сортировка на серверке: newest first (по `created_at DESC`).
- При удалении строки — оптимистичное обновление UI, затем `DELETE` запрос.

### 6.2 Страница создания/редактирования товара
- **Создание:** форма с обязательным `actualization_task_id`, `external_id` (int > 0), `name` (1–500). Остальные поля опциональны.
- **Редактирование:** предзаполните форму данными из `GET /admin/catalog/products/{id}`, отправляйте `PUT /admin/catalog/products/{id}` только изменённые поля.
- Поле `price`: числовое, допускает `null` (пустое поле).
- Поле `attributes`: JSON-редактор или динамическая форма «ключ-значение».

### 6.3 Связь с задачами актуализации
- Каждый товар привязан к задаче актуализации (`actualization_task_id`).
- Перед созданием товара убедитесь, что задача существует. Если нет — создайте её через API задач актуализации.
- При удалении задачи актуализации все привязанные товары удаляются каскадно.

### 6.4 Обработка ошибок
- `409` — «Товар с таким внешним ID уже существует в этой задаче».
- `422` — «Задача актуализации не существует».
- `404` — «Товар не найден».
- `401`/`403` — редирект на страницу входа или сообщение «Нет прав».

### 6.5 Отображение атрибутов
- `attributes` — произвольный JSON-объект. Отображайте как таблицу «ключ → значение» или список тегов.
- Пример: `{ "Цвет": "Чёрный", "Память": "256 ГБ" }` → отображайте как:
  ```
  Цвет: Чёрный
  Память: 256 ГБ
  ```

---

## 7. Архитектурные детали (для контекста)

> Это информационный раздел. Фронтенд не обязан его знать, но он помогает понять поведение API.

- **CQRS:** Чтение (Queries) и запись (Commands) разделены на уровне приложения.
- **UUID:** ID товаров — UUID v4 (строки формата `550e8400-e29b-41d4-a716-...`).
- **Внешний каталог:** Существует интеграция с внешним API каталога. Товары могут быть импортированы через `CatalogImportService`.
- **Unique constraint:** `actualization_task_id + external_id` — уникальная пара.
- **Индексы:** `ix_products_task_external (actualization_task_id, external_id)` — для быстрого поиска.
