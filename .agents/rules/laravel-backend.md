---
trigger: glob
globs: app/**/*.php
---

# Laravel — Правило для Backend кода
**Activation: Glob — `app/**/*.php`, `routes/*.php`, `database/**/*.php`**

> Этот проект имеет ДВА Laravel-бэкенда:
> - **Space Memory** (`:8000`) — основная CRM, финансы, студенты
> - **Indigo** (`:8001`) — отдельный сервер со своей базой данных
>
> Правила ниже применяются к обоим проектам одинаково.

## Архитектура эндпоинта (обязательный порядок)

Для каждого нового API-эндпоинта создавать в таком порядке:

### 1. Migration
```php
// database/migrations/YYYY_MM_DD_create_X_table.php
Schema::create('table_name', function (Blueprint $table) {
    $table->id();
    $table->string('status')->default('pending'); // ENUM через string
    // external IDs для интеграций
    $table->string('drupal_id')->nullable()->index();
    $table->string('space_memory_id')->nullable();
    $table->timestamps();
});
```

### 2. Form Request (валидация)
```php
// app/Http/Requests/V1/StoreStudentRequest.php
public function rules(): array {
    return [
        'name' => ['required', 'string', 'max:255'],
        // ...
    ];
}
```

### 3. API Resource (трансформация)
```php
// app/Http/Resources/V1/StudentResource.php
// Никогда не отдавать raw модель — только через Resource
public function toArray(Request $request): array {
    return [
        'id'     => $this->id,
        'name'   => $this->name,
        'status' => $this->status,
        // НЕ включать: drupal_id, space_memory_id, internal поля
    ];
}
```

### 4. Controller
```php
// app/Http/Controllers/Api/V1/StudentsController.php
// Один метод = одна ответственность
public function store(StoreStudentRequest $request): JsonResponse {
    $student = Student::create($request->validated());
    return new StudentResource($student);
}
```

### 5. Route
```php
// routes/api.php — всегда с префиксом v1
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::apiResource('students', StudentsController::class);
});
```

## Счётчики — КРИТИЧНО
```php
// ✗ НИКОГДА ТАК — убивает базу под нагрузкой
$count = Student::where('status', 'active')->count();

// ✓ ВСЕГДА ТАК — инкремент в отдельной таблице
DB::table('counters')->where('key', 'active_students')->increment('value');

// ✓ ИЛИ денормализация на модели
$group->increment('students_count'); // поле в таблице groups
```

## Тяжёлые операции → Jobs
```php
// Если операция > 1 сек — обязательно через Job
public function generateSalaryReport(Request $request): JsonResponse {
    $job = GenerateSalaryReportJob::dispatch(
        $request->teacher_id,
        $request->year
    );
    
    return response()->json([
        'job_id'  => $job->getJobId(),
        'status'  => 'processing',
        'message' => 'Расчёт запущен, результат будет готов через 1-2 минуты'
    ]);
}

// Отдельный эндпоинт для статуса
// GET /v1/jobs/{jobId}/status → { status: pending|running|done|failed, result? }
```

## Redis Cache — правила
```php
// Кешировать данные которые не меняются часто
$stats = Cache::remember('dashboard:stats', 900, function () {
    // 900 сек = 15 минут
    return DashboardStats::calculate();
});

// Инвалидировать кеш при изменении данных
Cache::forget('dashboard:stats');
```

## Webhook-обработчики — идемпотентность

> Применяется к любым входящим webhook'ам: от Drupal (LMS/платёжная система) или от Indigo.
```php
// Всегда проверять transaction_id — внешняя система может прислать дубль
public function handlePayment(Request $request): JsonResponse {
    $existing = WebhookLog::where('transaction_id', $request->transaction_id)->first();
    if ($existing) {
        return response()->json(['ok' => true]); // дубль — игнорируем
    }
    
    WebhookLog::create([...]);
    ProcessPaymentJob::dispatch($request->all());
    
    return response()->json(['ok' => true]); // мгновенный ответ Drupal
}
```

## Логирование
```php
// Все webhooks логировать в webhook_logs таблицу
// Все исходящие запросы к LMS логировать в integration_logs
// При ошибке Job — писать в Log::error() с полным контекстом
```
