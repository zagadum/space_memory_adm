# AGENTS.md — GLS Admin: полное руководство проекта

> Этот файл — единственный источник правды для AI-агентов и разработчиков.
> Содержит архитектуру, бизнес-логику, правила кода, схему БД и API-документацию.

---

## ЧАСТЬ 1 — АРХИТЕКТУРА ПРОЕКТА

### Три сервиса (локальная разработка)

| Сервис | URL | Репозиторий | Роль | Ветка (Development) |
|---|---|---|---|---|
| **Frontend Admin** | http://localhost:5173 | `space_memory_adm` | CRM для сотрудников | `artem1` |
| **Space Memory Backend** | http://localhost:8000 | `space_memory-recrut` | Основной бэкенд | `recrut_indigo2` |
| **Indigo Backend** | http://localhost:8001 | `Indigo` | Бэкенд LMS | `recrut_indigo2` |

**Кто куда ходит:**
- Ученик взаимодействует только с `space_memory-recrut` (регистрация, личный кабинет, оплата)
- Сотрудники (отдел продаж, секретариат) работают только в `space_memory_adm` (этот проект)
- Активация аккаунта ученика происходит из `space_memory_adm` — через "Старт группы"

### HTTP-клиенты (src/api/http.ts)

В проекте **три Axios-клиента** — они не взаимозаменяемы:

| Клиент | Назначение | baseURL |
|---|---|---|
| `http` | Основной — финансы, студенты, зарплаты | динамически из `getActiveProjectApiUrl()` |
| `httpRecruitment` | Рекрутация Space Memory | `:8000/api/v1/` |
| `httpRecruitmentIndigo` | Рекрутация Indigo | `:8001/api/v1/` |

```typescript
// Вариант A — через хелпер (когда backend передаётся как параметр)
import { getRecruitmentHttpClient } from '../api/http'
const client = getRecruitmentHttpClient('indigo')  // → httpRecruitmentIndigo
const client = getRecruitmentHttpClient()           // → httpRecruitment (Space Memory)

// Вариант B — прямой импорт (допустимо, если модуль явно работает с двумя бэкендами)
// Пример: newGroupsApi.ts использует локальный getClient(backend) с http | httpRecruitmentIndigo
import { http, httpRecruitmentIndigo } from '../api/http'
```

`http` переключается автоматически при смене проекта в UI через `useProjectStore`.

### Проекты в базе данных

| id | code | name |
|----|------|------|
| 1 | `space_memory` | Space Memory |
| 2 | `indigo` | Indigo |

Все финансовые операции привязаны к `project_id`. Всегда передавать и сохранять.

### Тестовые данные

Файл `indigo_recruting.sql` в корне — дамп БД с тестовыми данными для Indigo:
```bash
psql -U postgres -d indigo_db < indigo_recruting.sql
```

---

## ЧАСТЬ 2 — БИЗНЕС-ЛОГИКА И ПУТЬ КЛИЕНТА

> Читай перед реализацией любой фичи, связанной со студентами, группами или оплатой.

### Откуда приходит ученик

```
Внешняя CRM отдела продаж (мы её НЕ разрабатываем)
    → Клиент добавлен в CRM
    → Пробный урок
    → Понравилось → Создаём группу для постоянных занятий
    → Email клиенту со ссылкой на регистрацию
    → Клиент регистрируется в space_memory-recrut
    → Появляется в "Новые ученики" в space_memory_adm (этот проект)
```

### Флоу нового ученика (5 шагов)

**Шаг 1 — Регистрация**
Клиент заполняет форму: email+пароль, имя родителя, имя ребёнка, дата рождения, адрес.
3 обязательных согласия: данные + политика + фото/видео.
После регистрации — аккаунт создан, статус "новый ученик".

**Шаг 2 — Личный кабинет**
Контент платформы **закрыт** до активации. Доступны только:
- **Документы** — договор по тарифу (формируется автоматически)
- **Оплата** — через Imoje (ING Bank): карта, Apple Pay, Google Pay

**Шаг 3 — Оплата**
После оплаты автоматически формируется фактура (invoice).
**Оплата НЕ активирует аккаунт.** Ученик получает сообщение: "Ждём старта группы".

**Шаг 4 — Ожидание старта**
- Отдел продаж в `space_memory_adm` формирует группу (~10 человек)
- Каждый ученик добавляется в группу **вручную**
- Когда **все** в группе оплатили и подписали → нажимается **"Старт группы"**

**Шаг 5 — Старт группы**
- Вся группа активируется одновременно
- Ученики → раздел "Ученики" (Секретариат)
- Группа → "Активные группы" (Секретариат)
- Письма клиентам + тренеру

### Карта статусов ученика

```
[Внешняя CRM] → Пробный урок → Email
                                   ↓
                         [Форма регистрации]
                         (space_memory-recrut)
                                   ↓
                    "Новые ученики" в space_memory_adm
                                   ↓
                   Добавление в "Новую группу" (вручную)
                              ↙        ↘
               [Оплатил + подписал]   [Не оплатил / не подписал]
                         ↓                         ↓
          Ожидает старта группы          "Выписанные ученики"
          (аккаунт НЕ активен)                  ↙        ↘
                         ↓              [Вернётся]   [Не вернётся]
    [Все в группе готовы → Старт]           ↓              ↓
                         ↓             (остаётся)      "Архив"
         "Ученики" + "Активные группы"
               (Секретариат) 🎉
```

### Ключевые разделы GLS Admin

| Раздел | Вкладка | Что содержит | Кто работает |
|--------|---------|--------------|--------------|
| Новые ученики | Рекрутинг | Зарегистрировались, ещё не в группе / не оплатили | Отдел продаж |
| Новые группы | Рекрутинг | Группы в наборе (не стартовали) | Отдел продаж |
| Выписанные ученики | Рекрутинг | Выписаны, статус неопределён | Отдел продаж |
| Ученики | Секретариат | Активные ученики с оплатой и договором | Секретариат |
| Активные группы | Секретариат | Группы, которые начали занятия | Секретариат |
| Архив | — | Все кто прекратил обучение навсегда | — |

### Автоматизация событий

| Событие | Автоматическое действие |
|---------|------------------------|
| Регистрация завершена | Аккаунт создан, статус "registered", появляется в "Новых учениках" |
| Оплата прошла (Imoje) | Запись в `gls_payment_transactions` (direction='in', status='completed') |
| Договор подписан | Запись в `gls_documents` (doc_status='signed', doc_type='contract') |
| Старт группы нажат | Группа и ученики → Секретариат, аккаунты активируются (необратимо) |
| Старт занятий | Письмо клиенту + письмо тренеру |

### 10 критических бизнес-правил

1. **Регистрация только по ссылке** — открытой регистрации нет
2. **3 согласия обязательны** при регистрации
3. **Контент закрыт** до активации — жёсткое правило
4. **Оплата ≠ Активация** — после оплаты аккаунт остаётся неактивным
5. **Группа стартует целиком** — ~10 человек одновременно
6. **Старт группы** — только из `space_memory_adm`, только после оплаты+подписи всех
7. **Старт группы необратим** — после старта нельзя вернуть в набор
8. **Архив** — финальный статус, возврат не предусмотрен
9. **Выписанные** — промежуточный статус для продаж, это НЕ архив
10. **Внешняя CRM** — отдельная система, прямой интеграции нет

---

## ЧАСТЬ 3 — СТЕК И СТРУКТУРА ПРОЕКТА

### Стек

**Frontend:**
- Vue 3 — Composition API + `<script setup lang="ts">`
- Pinia — Setup Store (загрузка данных в store, не в компоненте)
- Vite — сборщик и дев-сервер
- TypeScript 5.6
- vue-i18n — 4 локали: ru, uk, pl, en
- Axios — 3 клиента с перехватчиками токена

**Backend (оба сервиса):**
- Laravel 11 + PHP 8
- PostgreSQL — основные БД: `space_memory-recrut` (порт 8000) и `Indigo` (порт 8001)
- Redis — кеш и очереди
- Laravel Sanctum — токен-аутентификация
- **Структура контроллеров**:
  - `Api/V1/` — Legacy API и публичные формы (регистрация)
  - `Api/Gls/` — Новое API для админ-панели (финансы, группы, доступ)

### Структура `src/`

```
src/
  api/
    http.ts          ← три Axios-клиента + interceptors
    endpoints.ts     ← ВСЕ URL эндпоинтов (не хардкодить строки!)
    mockAdapter.ts   ← офлайн-разработка без бэкенда
    *.api.ts         ← функции запросов по модулям
  app/
    main.ts, router.ts, i18n.ts
  config/
    projectApi.ts    ← URL по проектам + getActiveProjectApiUrl()
    env.ts           ← типизированный доступ к import.meta.env
  components/
    ui/              ← UiButton, UiInput, UiBadge, ToastContainer
    layout/          ← навигация, sidebar
  layouts/
    AppLayout.vue, AuthLayout.vue
  stores/            ← Pinia stores (вся бизнес-логика)
  views/             ← страницы по роутам
  modals/            ← ModalHost.vue и модальные окна
  locales/           ← ru.json, uk.json, pl.json, en.json
  styles/            ← base.css, layout.css (CSS-переменные)
  types/             ← общие TypeScript интерфейсы
  utils/             ← dayjs, форматирование дат/сумм
```

### Mock-режим

```bash
# .env.local
VITE_USE_MOCK=true          # все запросы → mockAdapter
VITE_MOCK_ONLY=salary       # только /salary → mock
VITE_REAL_ONLY=auth,students # auth и students всегда реальные
```

### Безопасность и Доступ (Access Control)

В проекте внедрена гибкая матричная система прав доступа (`AccessControlMatrix`).

**Основные сущности:**
- **Роли**:
  - `super-admin` (мапится из `admin`) — полный доступ.
  - `franchisee-manager` (мапится из `manager`) — доступ к своим филиалам.
- **Access Modes** (режимы доступа для каждого ресурса):
  - `active` — чтение и запись.
  - `read-only` — только чтение.
  - `hidden` — ресурс полностью скрыт в UI.

**Эндпоинты:**
- `GET /v1/gls/me/access-control` — получение текущей матрицы прав пользователя.
- `GET /v1/gls/settings/access-control` — настройка матрицы (только для super-admin).

---

## ЧАСТЬ 4 — ПРАВИЛА НАПИСАНИЯ КОДА

### Vue — обязательно

- Всегда `<script setup lang="ts">` — никакого Options API
- `defineProps<{...}>()` — типизировать все props
- `defineEmits<{...}>()` — типизировать все emits
- `useI18n()` для всех текстов — никаких хардкоженных строк
- Переводы в ВСЕ 4 файла: `ru.json`, `uk.json`, `pl.json`, `en.json`
- `<style scoped>` внутри компонента
- Использовать UI-компоненты: `UiButton`, `UiInput`, `UiBadge`

```vue
<!-- Шаблон компонента -->
<template>
  <!-- семантический HTML -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ id: number; name: string }>()
const emit = defineEmits<{ (e: 'close'): void }>()
const { t } = useI18n()
</script>

<style scoped>
/* только стили этого компонента */
</style>
```

**Состояния — ВСЕГДА:**
- `isLoading` — показывать skeleton / spinner
- `error` — показывать понятное сообщение
- Пустое состояние — что показывать, когда данных нет

```typescript
// ✓ Правильно — данные в store
const store = useStudentsStore()
onMounted(() => store.fetchStudents())

// ✗ Неправильно — axios напрямую в компоненте
const data = await axios.get('/students')
```

**Компоненты — где размещать:**
- Reusable (2+ страниц) → `src/components/ui/ComponentName.vue`
- Специфичный для страницы → `src/views/[page]/components/ComponentName.vue`

### API слой — обязательно

```typescript
// ✓ Правильно — через endpoints.ts
import { STUDENTS } from '../api/endpoints'
const response = await http.get(STUDENTS.LIST)

// ✗ Неправильно — строка напрямую
const response = await http.get('/v1/students')

// ✗ Неправильно — httpClient.ts (не используется)
import { httpClient } from '../api/httpClient'
```

- Все URL — через `src/api/endpoints.ts`
- Все пути начинаются с `/v1/`
- Типизировать request и response интерфейсы

### Pinia Store — обязательно

```typescript
// Setup Store — единственный стиль
export const useStudentsStore = defineStore('students', () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const items = ref<Student[]>([])

  async function fetchStudents() {
    isLoading.value = true
    error.value = null
    try {
      items.value = await studentsApi.getList()
    } catch (e) {
      error.value = 'Ошибка загрузки'
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, error, items, fetchStudents }
})
```

### Laravel — обязательно

**Архитектура одного эндпоинта:**
1. **Migration** — `database/migrations/`
2. **Form Request** — `app/Http/Requests/V1/` или `Gls/`
3. **API Resource** — `app/Http/Resources/V1/` или `Gls/`
4. **Controller** — в зависимости от назначения:
   - `app/Http/Controllers/Api/V1/` — для общедоступных/старых методов.
   - `app/Http/Controllers/Api/Gls/` — для новых функциональных модулей.
5. **Route** — `routes/api.php` с соответствующим префиксом.

**Приоритет авторизации (AuthenticatesUsers):**
Система сначала проверяет guard `admin`, а затем `recruting_student`. Это позволяет администраторам входить в систему под своим email, даже если он совпадает с email ученика в другой таблице.

```php
// Controller — один метод, одна ответственность
public function store(StoreStudentRequest $request): JsonResponse {
    $student = Student::create($request->validated());
    return new StudentResource($student);
}

// Route
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::apiResource('students', StudentsController::class);
});
```

**Счётчики и статусы — КРИТИЧНО:**
```php
// ✗ НИКОГДА — полагаться на RecrutingStudent::status для финансов
$paid = RecrutingStudent::where('status', 'paid')->count();

// ✓ ВСЕГДА — использовать JOIN-ы к сырым таблицам транзакций и документов
// Пример из NewGroupsController:
$paidStudentsSub = DB::table('gls_payment_transactions')
    ->select('student_id')
    ->selectRaw("MAX(CASE WHEN direction = 'in' AND status = 'completed' THEN 1 ELSE 0 END) as has_paid")
    ->groupBy('student_id');

// Использовать инкремент только для простых счетчиков
DB::table('counters')->where('key', 'active_students')->increment('value');
```

**Особенности API нейминга (Legacy Hardcore):**
Из-за исторических опечаток в базе и API, некоторые поля имеют два варианта. Фронтенд должен поддерживать оба для совместимости:
- `amount_paymant` / `amout_paymant` (с опечаткой)
- `isPaid` (boolean) / `payment_status` (string: 'paid'|'pending')
- `students_count` (из БД) -> `studentsCount` (во Vue)

**Тяжёлые операции (>1 сек) → Jobs:**
```php
public function generateReport(Request $request): JsonResponse {
    $job = GenerateSalaryReportJob::dispatch($request->teacher_id, $request->year);
    return response()->json([
        'job_id' => $job->getJobId(),
        'status' => 'processing',
    ]);
}
// Отдельный эндпоинт: GET /v1/jobs/{jobId}/status
```

**Webhook-обработчики — идемпотентность:**
```php
// Всегда проверять transaction_id — внешняя система может прислать дубль
public function handlePayment(Request $request): JsonResponse {
    $existing = WebhookLog::where('transaction_id', $request->transaction_id)->first();
    if ($existing) {
        return response()->json(['ok' => true]); // дубль — игнорируем
    }
    WebhookLog::create([...]);
    ProcessPaymentJob::dispatch($request->all());
    return response()->json(['ok' => true]);
}
```

**Redis Cache:**
```php
$stats = Cache::remember('dashboard:stats', 900, fn() => DashboardStats::calculate());
Cache::forget('dashboard:stats'); // инвалидировать при изменении
```

### Backend vs Frontend: Реальность именования

> [!IMPORTANT]
> Это критически важный раздел для предотвращения ошибок при работе с API.

**Реальность Backend (Laravel & PostgreSQL):**
Бэкенд всегда использует `snake_case` для имен полей в базе данных и в «сырых» ответах API.
- `students_count` (не `studentsCount`)
- `start_date` (не `startDate`)
- `total_slots` (не `totalSlots`)
- `teacher_id`, `paid_signed`, `paid_count` и т.д.

**Реалность Frontend (Vue & Pinia):**
Фронтенд исторически использует `camelCase` для моделей данных. 

**Золотое правило для агентов:**
1. **При получении данных**: В функциях нормализации (в сторах или API слое) ВСЕГДА проверяйте оба варианта, но приоритет отдавайте `snake_case`.
   ```typescript
   studentsCount: Number(item.students_count ?? item.studentsCount ?? 0)
   ```
2. **При отправке данных**: Проверяйте `endpoints.ts` и `api` файлы. Большинство POST-запросов ожидают `snake_case`.
3. **Рефакторинг**: НИКОГДА не переводите весь фронтенд на `snake_case` без явного указания. Это сломает UI-компоненты.

### Именование

| Тип | Стиль | Пример |
|-----|-------|--------|
| Vue-компонент | PascalCase | `StudentCard.vue` |
| Pinia store | `camelCase.store.ts` | `students.store.ts` |
| API файл | два принятых варианта | `studentsApi.ts` или `students.api.ts` |
| CSS класс | kebab-case | `.student-card` |
| Переменные/функции | camelCase | `fetchStudents()` |
| **API Response (Raw)** | **snake_case** | `students_count` |
| **Frontend Model** | **camelCase** | `studentsCount` |

> В проекте сосуществуют оба стиля API-файлов: `newGroupsApi.ts` и `archivedStudents.api.ts`.
> Оба допустимы. Внутри одного модуля придерживайся уже существующего стиля.


### Производительность — критично

- **НИКОГДА** `SELECT COUNT(*)` для счётчиков → таблица `counters`
- **НИКОГДА** `setInterval` для обновления данных на фронте
- **НИКОГДА** загружать полный список без пагинации
- Тяжёлые расчёты → Job → вернуть `job_id` → фронт показывает статус

### Даты

- Использовать `dayjs` из `src/utils/` — не `new Date()` и не нативный `Date`
- Всегда нормализовать таймзону через утилиты проекта (баг со смещением дней уже решён через dayjs)

### Student ID

- В базе: целое число (`1`, `2`, `3`)
- В URL: `/v1/students/1`
- В mock-данных: строка с префиксом `s_1` — при подключении реального API конвертировать

---

## ЧАСТЬ 5 — СХЕМА БАЗЫ ДАННЫХ

> Таблицы Space Memory Backend (`:8000`). Все с префиксом `gls_`.

### Основные принципы

- Все финансовые операции привязаны к `project_id`
- **Начисление и платёж — разные сущности** (не путать!)
- Один платёж может закрывать несколько начислений
- Дополнительные занятия создают отдельные начисления

### gls_payment_charges — начисления ученикам

> ЧТО должен заплатить ученик. Не реальный платёж.

| Поле | Описание |
|------|----------|
| `id` | PK |
| `project_id` | проект |
| `student_id` | ученик |
| `group_id` | группа |
| `charge_type` | тип начисления |
| `period_year` / `period_month` | период |
| `base_amount` | базовая цена |
| `discount_amount` | скидка |
| `final_amount` | итог к оплате |
| `status` | статус |

**Статусы:** `draft`, `pending`, `paid`, `partially_paid`, `overdue`, `cancelled`, `paused`, `overpayment`, `closed`, `refunded`

**Типы (`charge_type`):** `monthly_start`, `monthly_alignment`, `monthly_standard`, `platform`, `extra_lesson`, `bonus_class`, `material`, `manual_adjustment`, `refund_adjustment`

### gls_payment_transactions — реальные платежи

> ФАКТ оплаты. Связывается с начислениями через `gls_payment_allocations`.

| Поле | Описание |
|------|----------|
| `id`, `student_id`, `project_id` | основные поля |
| `provider` | `imoje` \| `cash` \| `bank_transfer` \| `manual` |
| `direction` | `in` (приход) \| `out` (возврат) |
| `amount`, `currency`, `status` | сумма и статус |

### gls_payment_allocations — распределение платежей

Связующая таблица: какая транзакция закрывает какое начисление.

| Поле | Описание |
|------|----------|
| `id`, `transaction_id`, `charge_id`, `amount` | — |

### gls_lesson_additional — дополнительные занятия

Поля: `id`, `student_group_task_id`, `student_id`, `project_id`, `group_id`, `teacher_id`, `lesson_date`, `additional_type`, `base_amount`, `discount_amount`, `final_amount`, `status`, `comment`

### gls_invoice_documents — счета и документы (KSeF)

Поля: `id`, `student_id`, `project_id`, `transaction_id` (nullable), `charge_id` (nullable), `document_type`, `number`, `issue_date`, `service_date_from`, `service_date_to`, `title`, `amount_net`, `amount_gross`, `currency`, `ksef_status`, `ksef_reference`, `pdf_path`, `meta` (JSON)

### gls_salary_calculations — расчёт зарплаты преподавателя

| Поле | Описание |
|------|----------|
| `id`, `project_id`, `teacher_id` | основные |
| `period_year`, `period_month` | период расчёта |
| `base_subscriptions` | кол-во подписок |
| `pct_subscriptions` | процент от подписок |
| `substitutions_amount` | замены занятий |
| `methodical_amount` | методическая работа |
| `individual_amount` | индивидуальные занятия |
| `olympiad_amount` | олимпиады |
| `admin_duty_amount` | административные обязанности (3%, QA-оценка) |
| `bonuses_amount` | бонусы |
| `trial_lessons_amount` | пробные уроки |
| `retention_bonus_amount` | бонус за удержание |
| `total` | итоговая сумма к выплате |
| `status` | `draft` \| `confirmed` \| `paid` \| `disputed` |
| `confirmed_at`, `paid_at` | даты |
| `payload` | JSON с детализацией по каждому компоненту |

> `payload` — основной источник данных для отображения зарплаты в UI.

### Связи

```
gls_payment_transactions (1) ──→ (N) gls_payment_allocations ←── (1) gls_payment_charges
gls_payment_transactions (1) ──→ (1?) gls_invoice_documents
gls_salary_calculations  (1) ──→ (N)  gls_salary_disputes
```

---

## ЧАСТЬ 6 — API SPACE MEMORY (`:8000/api/v1/`)

> Основной бэкенд. Используется через `http` клиент.

**Аутентификация:** `Authorization: Bearer <token>` (Laravel Sanctum)

### Полный список эндпоинтов

**Auth**
```
POST   /auth/sign-in
GET    /auth/me
POST   /auth/logout
GET    /auth/profile
POST   /auth/verify-token
```

**Dashboard**
```
GET    /dashboard/stats
```

**Students (список)**
```
GET    /students                     ← список с фильтрами + пагинация
GET    /students/{id}/payments
GET    /students/groups-filter
GET    /students/teacher-filter
```

**Student (профиль)**
```
GET    /student/info                 ← профиль ученика
POST   /student/info                 ← обновить профиль
GET    /student/groups
POST   /student/change-group
GET    /student/attendance
POST   /student/attendance
GET    /student/notes
POST   /student/notes
GET    /student/progress
POST   /student/trainer-presence
```

**Payments (финансы)**
```
GET    /payments/student/{id}        ← история платежей ученика
GET    /payments/transactions
POST   /payments/archive
POST   /payments/correct-balance
POST   /payments/discount
POST   /payments/extra
POST   /payments/invoice / edit-invoice
GET    /payments/ksef-invoices
POST   /payments/pause
POST   /payments/refund
POST   /payments/resume
POST   /payments/split
POST   /payments/tariff / update-tariff
POST   /payments/unlock
POST   /payments/change-group
```

**New Groups (рекрутинг)**
```
GET    /new-groups                   ← список (per_page=1000 по умолчанию)
POST   /new-groups/create            ← создать новую группу
POST   /new-groups/delete            ← удалить группу в наборе
POST   /new-groups/add-students      ← добавить студентов в группу
POST   /new-groups/remove-student    ← убрать студента (group_id -> null)
POST   /new-groups/start             ← СТАРТ ГРУППЫ (необратимо!)
GET    /new-groups/students          ← ученики конкретной группы (с деталями оплаты)
GET    /new-groups/teachers          ← список учителей для создания/пикера
GET    /new-groups/master-students   ← свободные ученики (без группы)
GET    /groups/new-groups            ← пагинированный список для пикера
```

> [!NOTE]
> В разделе рекрутинга (`NewStudentsPage`) интегрировано создание группы "на лету" — через `onCreateGroup` вызывается `getTeachers` и `getMasterStudents` для инициализации `CreateGroupModal`.

**Salary**
```
GET    /salary/teacher/{teacherId}?month=YYYY-MM&project_id=1
POST   /salary/{id}/confirm
POST   /salary/{id}/dispute
```

**Settings**
```
GET    /settings/users
PATCH  /settings/users/{id}
DELETE /settings/users/{id}
```

**Dictionaries**
```
GET    /dictionaries/discount-types
GET    /dictionaries/pause-reasons
GET    /dictionaries/payment-methods
GET    /dictionaries/refund-reasons
GET    /dictionaries/tariffs
```

---

## ЧАСТЬ 7 — API SALARY (детально)

**Base URL:** `GET /api/v1/salary/teacher/{teacherId}?month=YYYY-MM&project_id=1`

**Статусы расчёта:** `draft` → `confirmed` → `paid` | `disputed`

### Структура ответа GET salary

```json
{
  "id": "1",
  "month": "2026-02",
  "trainerName": "Anna Kowalska",
  "status": "draft",
  "teacherId": 1,
  "projectId": 1,
  "subscriptions": {
    "amount": 2847.64,
    "base": 25887.6,
    "rate": 11,
    "childrenCount": 58,
    "groups": [{ "name": "SM-01", "day": "Tue 17:00", "kids": 16, "base": 7840, "salary": 862.4 }]
  },
  "substitutions": { "amount": 150.7, "rows": [...] },
  "methodical":    { "amount": 125.6, "rate": 31.4, "rows": [...] },
  "individual":    { "amount": 280,   "rate": 40,   "rows": [...] },
  "olympiad":      { "amount": 160,   "rate": 40,   "rows": [...] },
  "admin3pct":     { "amount": 660.93, "base": 25887.6, "pct": 85, "checklist": [...] },
  "bonuses":       { "amount": 500,   "rows": [...] },
  "trialLessons":  { "amount": 70, "rate": 35, "threshold": 51, "rows": [...] },
  "rezygnacje":    []
}
```

**Блоки зарплаты:**
- `subscriptions` — от абонементов по группам (ставка 11%)
- `substitutions` — замены занятий за других преподавателей
- `methodical` — методические встречи
- `individual` — индивидуальные занятия
- `olympiad` — олимпиады / спецзанятия
- `admin3pct` — административная часть (3%, зависит от QA-оценки, `pct` — % выполнения)
- `bonuses` — дополнительные бонусы
- `trialLessons` — пробные уроки (порог конверсии ≥51% для начисления)
- `rezygnacje` — отказы / выбытия

### Подтвердить зарплату
```
POST /api/v1/salary/{id}/confirm
Body: { "project_id": 1 }
Response: { "id": 1, "status": "confirmed", "confirmedAt": "2026-03-10 14:22:31" }
```

### Оспорить зарплату
```
POST /api/v1/salary/{id}/dispute
Body: { "project_id": 1, "teacher_id": 1, "reason": "..." }
Response: { "id": 1 (ID спора), "salary_calculation_id": 1, "status": "disputed" }
```

> При споре создаётся запись в `gls_salary_disputes`, статус расчёта → `disputed`.

---

## ЧАСТЬ 8 — API INDIGO INTEGRATION (`:8001`)

> Интеграция GLS Admin с LMS-платформой Indigo.
> Используется через `httpRecruitmentIndigo` клиент.
> Base URL: `http://localhost:8001/integration/v1`

### Жизненный цикл (порядок вызовов)

```
[1] Создать учителя     →  POST /integration/v1/teachers/create
[2] Создать группу      →  POST /integration/v1/groups/create
[3] Ученик посетил урок →  POST /integration/v1/students/attendance
[4] Подождать execute_after (~5 мин)
[5] Создать ученика     →  POST /integration/v1/students/create
--- ежемесячно ---
[6] Проверка оплаты     →  POST /integration/v1/billing/checks
[7] Блокировка          →  PATCH /integration/v1/students/block
[8] Разблокировка       →  PATCH /integration/v1/students/unblock
--- при смене группы ---
[9] Перевод             →  POST /integration/v1/students/transfers
```

**Формат ответа:**
```json
{ "success": true, "data": {} }
```

### ID-маппинг GLS ↔ Indigo

| Сущность | ID в GLS | ID в Indigo | Где получить |
|----------|----------|-------------|--------------|
| Учитель | `teacher_id` | `ext_teacher_id` | POST /teachers |
| Группа | `group_id` | `ext_group_id` | POST /groups |
| Ученик | `student_id` | `ext_student_id` | POST /students |
| Посещение | `attendance_id` | `ext_attendance_id` | POST /students/attendance |

> Все `ext_*` ID сохранять в БД GLS — нужны для последующих запросов.

### 1. Создать учителя
```
POST /integration/v1/teachers/create
{
  "teacher_id": "tch_1001",
  "surname": "Kowalski",
  "first_name": "Jan",
  "email": "jan.kowalski@example.com",
  "phone": "+48500100200",
  "status": "active"
}
→ Response: { "teacher_id": "tch_1001", "ext_teacher_id": "ind_t_98765", "status": "created" }
```
> Сохранить `ext_teacher_id` — нужен для создания группы.

### 2. Создать группу
```
POST /integration/v1/groups/create
{
  "group_id": "grp_2001",
  "group_name": "Mental Math Junior Mon/Wed 18:00",
  "format": "online",           // "online" | "offline"
  "address": "online",
  "start_date": "2026-05-04",   // YYYY-MM-DD
  "start_time": "18:00",        // HH:mm
  "weekdays": ["mon", "wed"],   // mon|tue|wed|thu|fri|sat|sun
  "teacher_id": "tch_1001",
  "age_group": "junior"
}
→ Response: { "group_id": "grp_2001", "ext_group_id": "ind_g_54321", "ext_teacher_id": "ind_t_98765", "status": "created" }
```
> Сохранить `ext_group_id` — нужен при создании ученика.

### 3. Зафиксировать посещение (provision-запрос)
```
POST /integration/v1/students/attendance
{
  "student_id": "stu_3001",
  "group_id": "grp_2001",
  "attendance_id": "att_7001",
  "status": "present",
  "lesson_date": "2026-05-04",
  "observed_at": "2026-05-04T18:20:00Z"
}
→ Response: { "ext_attendance_id": "spr_8001", "status": "scheduled", "execute_after": "2026-05-04T18:25:00Z" }
```
> Подождать до `execute_after` (~5 мин), затем вызывать создание ученика.

### 4. Создать ученика
```
POST /integration/v1/students/create
{
  "student_id": "stu_3001",
  "group_id": "grp_2001",
  "email": "misha.nick",          // никнейм без домена
  "phone": "+48555111222",
  "first_name": "Mikhail",
  "last_name": "Ivanov",
  "dob": "2016-01-14",
  "child_password": "ParentPass2026",
  "parent": { "first_name": "Olga", "last_name": "Ivanova", "password": "..." },
  "language": "pl",               // всегда "pl"
  "pricing": {
    "first_month_price": 316.13,  // пропорционально оставшимся дням месяца
    "second_month_price": 350.00, // всегда 350.00
    "currency": "PLN"
  }
}
→ Response: { "ext_student_id": "ind_s_112233", "ext_group_id": "ind_g_54321", "status": "created" }
```

**Расчёт `first_month_price`:**
```
first_month_price = (350.00 / дней_в_месяце) × оставшихся_дней
Пример: урок 4 мая, в мае 31 день, осталось 28: (350/31) × 28 ≈ 316.13 PLN
```

### 5. Проверка оплаты (ежемесячно)
```
POST /integration/v1/billing/checks
{ "billing_date": "2026-06-03", "student_ids": ["3001", "3002"] }
→ Response: { "paid": 93, "unpaid": 27, "scheduled_actions": { "to_block": 27 } }
```

### 6. Блокировка / Разблокировка
```
PATCH /integration/v1/students/block
{ "student_id": "1", "status": "blocked", "reason": "payment_missing", "effective_at": "..." }

PATCH /integration/v1/students/unblock
{ "student_id": "1", "status": "active", "reason": "payment_received", "effective_at": "..." }
```

### 7. Перевод ученика
```
POST /integration/v1/students/transfers
{ "old_group_id": "grp_2001", "new_group_id": "grp_2002", "effective_date": "2026-06-10", "reason": "schedule_change" }
→ Response: { "transfer_id": "trf_9001", "status": "scheduled", "effective_date": "2026-06-10" }
```

### Коды ошибок Indigo

| Код | Описание |
|-----|----------|
| `400` | Неверный запрос |
| `401` | Не авторизован |
| `404` | Сущность не найдена |
| `409` | Конфликт (ученик/группа уже существует) |
| `422` | Ошибка валидации |
| `500` | Внутренняя ошибка Indigo |

---

## ЧАСТЬ 9 — ВОРКФЛОУ: ЧТО ДЕЛАТЬ ПРИ...

### Создании нового Vue-компонента

1. Проверить — нет ли похожего в `src/components/ui/`
2. Создать файл по правилу (script setup → i18n → store → emits)
3. Добавить переводы в все 4 файла локализации
4. Если нужен новый API — добавить в `src/api/endpoints.ts`
5. Чеклист: нет хардкода / есть isLoading / есть error / есть пустое состояние

### Создании нового Laravel API

1. Уточнить: в каком бэкенде? `:8000` или `:8001`?
2. Migration → Model → Form Request → API Resource → Controller → Route
3. Счётчики через инкремент, не `COUNT(*)`
4. Операции >1 сек → Job
5. Webhook-обработчики → проверка на дубль (`transaction_id`)
6. Обновить `src/api/endpoints.ts` и создать `src/api/xxx.api.ts`

### Рефакторинге

Проверить на типичные проблемы проекта:
- Axios напрямую в компоненте → перенести в store/api
- Хардкоженные строки → `t('key')`
- Строки URL в api-функциях → `endpoints.ts` константы
- `COUNT(*)` для счётчиков → инкремент
- Тяжёлые операции в контроллере → Job
- Дублирование webhook → проверка `transaction_id`

### Написании тестов

**Приоритеты:**
1. Высокий: webhook-обработчики (идемпотентность), смена статуса ученика, расчёт платежей
2. Средний: фильтрация, авторизация эндпоинтов
3. Низкий: UI-компоненты

**Всегда тестировать:** happy path + error path + edge case (дубль, пустой список) + auth (401 без токена)
