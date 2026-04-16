---
description: 
---

# New Laravel API
**Description:** Создаёт полный стек Laravel для нового эндпоинта: Migration → Model → Form Request → Resource → Controller → Route. Соблюдает архитектуру GLS Admin.

## Steps

### Step 1 — Определить эндпоинт
Уточнить у пользователя:
- **В каком бэкенде?** Space Memory (`:8000`, проект `space_memory-recrut`) или Indigo (`:8001`)?
- Что за ресурс? (students, groups, payments, reports...)
- Какие HTTP методы нужны? (GET list, GET detail, POST, PUT, DELETE)
- Нужна ли связь с другими таблицами?
- Это быстрая операция (<1 сек) или тяжёлая (расчёты, синхронизация)?

> Если эндпоинт для рекрутации Indigo — фронтенд будет использовать `httpRecruitmentIndigo`,
> если для Space Memory — `httpRecruitment`. Основная CRM → `http`.

### Step 2 — Создать Migration
```
php artisan make:migration create_{table}_table
```
Обязательные поля:
- `id()` — первичный ключ
- `status` — если есть State Machine (string, не enum)
- `drupal_id`, `space_memory_id` — если ресурс связан с внешними системами
- `timestamps()`

Добавить индексы на поля по которым будет фильтрация.

### Step 3 — Создать Model
```
php artisan make:model {ModelName}
```
- Заполнить `$fillable`
- Добавить `$casts` для дат и JSON полей
- Добавить отношения (`hasMany`, `belongsTo`)
- Если есть счётчики — НЕ использовать withCount(), использовать денормализованное поле

### Step 4 — Form Request
```
php artisan make:request V1/Store{ModelName}Request
php artisan make:request V1/Update{ModelName}Request
```
Все правила валидации здесь, не в контроллере.

### Step 5 — API Resource
```
php artisan make:resource V1/{ModelName}Resource
php artisan make:resource V1/{ModelName}Collection
```
- Включать только поля безопасные для фронта
- НЕ включать: drupal_id, space_memory_id, internal поля
- Форматировать даты: `$this->created_at->toISOString()`

### Step 6 — Controller
```
php artisan make:controller Api/V1/{ModelName}Controller --api
```
Каждый метод должен:
1. Принять Form Request (валидация автоматическая)
2. Выполнить бизнес-логику (или диспатчить Job)
3. Вернуть Resource

Если операция тяжёлая:
```php
$job = HeavyOperationJob::dispatch($data);
return response()->json(['job_id' => $job->getJobId(), 'status' => 'processing']);
```

### Step 7 — Route
Добавить в `routes/api.php`:
```php
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::apiResource('{resource}', {Controller}::class);
    // или отдельные маршруты если не все методы нужны
});
```

### Step 8 — Обновить frontend endpoints.ts
Открыть `src/api/endpoints.ts` и добавить константы для нового эндпоинта.

### Step 9 — Создать API функцию на фронте
Создать `src/api/{module}.api.ts` со всеми функциями для нового модуля.

### Step 10 — Проверка
- [ ] Migration создана с правильными индексами
- [ ] Счётчики через инкремент, не COUNT(*)
- [ ] Тяжёлые операции идут через Job
- [ ] Route защищён через `auth:sanctum`
- [ ] Resource не раскрывает internal поля
- [ ] Добавлена запись в `webhook_logs` если это webhook-обработчик
