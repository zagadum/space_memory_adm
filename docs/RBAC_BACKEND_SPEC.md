# RBAC System — Спецификация для Backend-разработчика

> **Проект:** GLS Admin / Space Memory CRM  
> **Дата:** 2026-04-07  
> **Автор:** Frontend-команда  
> **Статус:** Frontend реализован с mock-данными, ожидает backend-интеграции

---

## 1. Что мы сделали и зачем

### Проблема (было)

Система доступа работала **только на уровне ролей** — все пользователи одной роли видели одинаковые страницы. Это создавало проблемы:

1. **Нельзя дать конкретному учителю доступ к дополнительным страницам**  
   Например, `dawidfrymus@gmail.com` — учитель, но ему нужен доступ к финансам. Единственный вариант — сменить ему роль, но тогда он потеряет доступ к панели тренера.

2. **Нельзя забрать доступ у конкретного сотрудника**  
   Если один из сейлзов не должен видеть архив — надо было создавать новую роль.

3. **Роли не соответствовали бизнесу**  
   Teacher видел слишком много (students, groups, всю recruitment), хотя реально ему нужен только Import DB. Sales видел секретариат, хотя ему нужен только recruitment.

### Решение (стало)

**Двухуровневая модель доступа:**

```
Финальный доступ пользователя = Дефолты роли + Per-User Overrides
```

```
┌──────────────────────┐     ┌────────────────────────┐
│  Дефолты роли        │     │ Per-user overrides     │
│  (ROLE_MENU_ACCESS)  │ ──► │ (из таблицы users /    │ ──► Финальная матрица
│  Код / конфиг        │     │  отдельной таблицы)    │     { resource: mode }
└──────────────────────┘     └────────────────────────┘
```

**Пример:**
- Роль `teacher` по дефолту видит: `{ "import-db": "active" }`
- Override для Dawid Frymus: `{ "students": "active", "finance": "active" }`
- Результат: `{ "import-db": "active", "students": "active", "finance": "active" }`

### Почему мы считаем это правильным

1. **Минимальное изменение архитектуры** — роли остаются, мы просто добавляем слой overrides. Не ломаем ничего существующего.

2. **Backend мёржит, фронтенд не знает деталей** — `GET /me/access-control` возвращает ГОТОВУЮ матрицу. Фронтенд не различает, что из дефолта, а что из override. Это значительно проще и безопаснее.

3. **Гранулярность** — можно как ДАТЬ, так и ЗАБРАТЬ доступ у конкретного пользователя. Override `"students": "hidden"` заберёт доступ, даже если роль его даёт по дефолту.

4. **Обратная совместимость** — если у пользователя нет overrides, всё работает ровно как раньше — по дефолтам роли.

---

## 2. Обновлённые дефолты ролей

### Таблица: что видит каждая роль по умолчанию

| Роль | Доступные секции | Скрытые секции |
|------|------------------|----------------|
| **super-admin** | ВСЁ | — |
| **admin** | ВСЁ | — |
| **teacher** | recruitment → import-db (только эта страница) | Всё остальное |
| **sales** | recruitment → new-students, leads, target-mail, expelled, new-groups, archived, import-db | secretariat, finance, quality, hr, trainer, settings |
| **quality** | secretariat (всё), recruitment (всё + import-db actions), quality (всё) | finance, accounting, hr, trainer, settings |
| **finance** | dashboard, my-cabinet, finance (всё), accounting (всё), students (read-only) | recruitment, quality, hr, trainer, settings |
| **secretariat** | dashboard, my-cabinet, secretariat (всё) | recruitment, finance, quality, hr, trainer, settings |
| **hr** | secretariat → groups + teachers, hr (всё) | recruitment, finance, quality, trainer, settings |

> ⚠️ **Вопрос**: Эти дефолты захардкожены на фронте в `roleMenuAccess.config.ts`. **Должен ли backend дублировать эту логику?** Или backend доверяет фронт-конфигу и просто хранит/отдаёт overrides?

---

## 3. API-контракт — Что нужно от Backend

### 3.1. `GET /api/v1/me/access-control` (СУЩЕСТВУЕТ, нужна доработка)

**Текущее поведение:** Возвращает роль и матрицу дефолтов.

**Нужное поведение:** Возвращает роль и **финальную** матрицу (дефолты + overrides пользователя, уже смёрженные).

```json
// Response
{
  "role": "teacher",
  "version": 5,
  "matrix": {
    "dashboard": "hidden",
    "my-cabinet": "hidden",
    "secretariat": "hidden",
    "students": "active",        // ← override (дефолт teacher = hidden)
    "groups": "hidden",
    "recruitment": "active",
    "import-db": "active",       // ← дефолт teacher
    "finance": "active",         // ← override
    "quality": "hidden"
    // ... все остальные resource keys
  }
}
```

> **Вопрос:** Поле `overrides` в ответе — нужно ли его отдавать отдельно? Сейчас фронтенд использует только `matrix`. Но для admin UI (страница управления overrides) мы запрашиваем overrides через отдельный endpoint.

---

### 3.2. `GET /api/v1/settings/users` (НОВЫЙ)

Список всех пользователей для admin-интерфейса управления доступами.

```json
// Response
{
  "items": [
    {
      "id": 3,
      "name": "Dawid Frymus",
      "email": "dawidfrymus@gmail.com",
      "role": "teacher",
      "overrides": {
        "students": "active",
        "finance": "active"
      }
    },
    {
      "id": 4,
      "name": "Anna Nowak",
      "email": "anna@gls.pl",
      "role": "sales",
      "overrides": {}
    }
  ]
}
```

> **Вопросы:**
> 1. Нужна ли пагинация? Сколько у нас пользователей? Если < 100, можно без пагинации.
> 2. Этот endpoint доступен только для `super-admin` и `admin`?
> 3. Нужно ли включать неактивных / заблокированных пользователей?

---

### 3.3. `PUT /api/v1/settings/users/{id}/overrides` (НОВЫЙ)

Сохранение per-user overrides.

```json
// Request Body
{
  "overrides": {
    "students": "active",
    "finance": "active",
    "hr": "hidden"
  }
}

// Response
{
  "ok": true
}
```

**Правила:**
- Пустой объект `{}` = удалить все overrides (вернуть к чистым дефолтам роли)
- Значения: `"active"`, `"read-only"`, `"hidden"`
- Ключи — это resource keys из матрицы (например: `students`, `import-db`, `quality-monitoring` и т.д.)

> **Вопрос:** Валидация keys — нужно ли проверять, что ключ существует? Или принимать любые строки и игнорировать несуществующие при мёрже?

---

## 4. Вопросы по базе данных

### 4.1. Где хранить overrides?

**Вариант А: JSON-колонка в таблице `users`**
```sql
ALTER TABLE users ADD COLUMN access_overrides JSONB DEFAULT '{}';
```

- ✅ Простая реализация
- ✅ Один запрос для получения данных пользователя
- ❌ Сложнее делать запросы типа "найти всех, у кого есть override на finance"

**Вариант Б: Отдельная таблица `user_access_overrides`**
```sql
CREATE TABLE user_access_overrides (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    resource_key VARCHAR(100) NOT NULL,
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('active', 'read-only', 'hidden')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, resource_key)
);
```

- ✅ Нормализованная структура
- ✅ Легко искать/фильтровать по ресурсам
- ✅ Аудит — когда добавлен override
- ❌ Больше запросов (JOIN или подзапрос)

> **Какой вариант предпочитаешь?** Мы рекомендуем вариант Б (отдельная таблица), т.к.:
> - Удобно для аудита (кто когда дал доступ)
> - Легко расширить (добавить `granted_by`, `expires_at`)
> - PostgreSQL JOINы работают быстро при малом кол-ве записей

---

### 4.2. Дефолты ролей — в коде или в БД?

Сейчас дефолты ролей захардкожены на фронте (`roleMenuAccess.config.ts`). 

**Вопрос:** Должен ли backend тоже хранить/знать дефолты ролей? Два варианта:

**Вариант 1: Backend не знает дефолтов**
- Фронтенд при логине запрашивает `GET /me/access-control`
- Backend возвращает только overrides и роль
- Фронтенд сам мёржит дефолты (из конфига) + overrides

```
Плюсы: Backend проще
Минусы: Дефолты только на фронте → нет серверной проверки доступа
```

**Вариант 2: Backend тоже хранит дефолты (рекомендуем)**
- Backend имеет свою копию дефолтов (config, seeder, или таблица)
- Backend мёржит дефолты + overrides и возвращает ГОТОВУЮ матрицу
- Backend также проверяет доступ на middleware level

```
Плюсы: Полная серверная авторизация, нельзя обойти через DevTools
Минусы: Нужно держать дефолты в синхронизации front↔back
```

> **Мы СИЛЬНО рекомендуем Вариант 2.** Без серверной проверки любой пользователь с DevTools может вызвать любой API endpoint.

---

## 5. Вопросы по безопасности

### 5.1. Middleware для проверки доступа

На каждом API endpoint нужно проверять, что пользователь имеет право вызвать его.

**Пример middleware (Laravel):**
```php
// app/Http/Middleware/CheckResourceAccess.php

class CheckResourceAccess
{
    public function handle($request, Closure $next, string $resource)
    {
        $user = $request->user();
        $mode = $this->getUserAccessMode($user, $resource);
        
        if ($mode === 'hidden') {
            abort(403, 'Access denied to resource: ' . $resource);
        }
        
        if ($mode === 'read-only' && !$request->isMethod('GET')) {
            abort(403, 'Read-only access to resource: ' . $resource);
        }
        
        return $next($request);
    }
    
    private function getUserAccessMode(User $user, string $resource): string
    {
        // 1. Проверить per-user override
        $override = $user->accessOverrides()
            ->where('resource_key', $resource)
            ->first();
        
        if ($override) return $override->mode;
        
        // 2. Вернуть дефолт роли
        return RoleDefaults::getModeForRole($user->role, $resource);
    }
}
```

**Использование в routes:**
```php
Route::middleware(['auth:sanctum', 'access:students'])->group(function () {
    Route::get('/students', [StudentController::class, 'index']);
    // ...
});

Route::middleware(['auth:sanctum', 'access:finance'])->group(function () {
    Route::get('/finance/debtors', [FinanceController::class, 'debtors']);
    // ...
});
```

> **Вопрос:** Есть ли уже middleware для проверки ролей? Если да — его нужно расширить, не заменять.

---

### 5.2. Кэширование

Матрица доступа запрашивается при каждом логине. При большом кол-ве пользователей:

- Кэшировать ли финальную матрицу в Redis? (`user:{id}:access-matrix`)
- Инвалидировать кэш при:
  - Изменении overrides (`PUT /settings/users/:id/overrides`)
  - Изменении роли пользователя
  - Обновлении дефолтов ролей (если они в БД)

> **Вопрос:** Используем ли мы Redis для кэширования? Если да — средний TTL кэша?

---

### 5.3. Аудит изменений

Кто и когда изменил доступы пользователю — критично для безопасности.

**Рекомендуем логировать:**
```json
{
  "action": "access_override_changed",
  "target_user_id": 3,
  "changed_by_user_id": 1,
  "changes": {
    "added": { "students": "active" },
    "removed": { "hr": "hidden" }
  },
  "timestamp": "2026-04-07T21:00:00Z"
}
```

> **Вопрос:** Есть ли таблица аудита / audit log? Или используете Laravel activity log?

---

## 6. Edge Cases — Что нужно обсудить

### 6.1. Что если роль пользователя изменилась?

Если admin сменит роль пользователя с `teacher` на `sales`:
- **Overrides сбрасываются?** Или остаются?
- Рекомендация: **сбрасывать** overrides при смене роли. Старые overrides могут конфликтовать с новыми дефолтами.

### 6.2. Что если добавляется новый ресурс (новая страница)?

- По дефолту новый ресурс = `hidden` для всех ролей, кроме admin/super-admin
- Admin/super-admin автоматически получают `active` на всё

### 6.3. Временные overrides (expires_at)?

Нужно ли поддерживать overrides с датой истечения?
- Пример: "Дать учителю доступ к финансам до 2026-05-01"
- Если да — нужна колонка `expires_at` в таблице overrides + cron для очистки

### 6.4. Одновременный доступ к admin UI

Если два админа одновременно редактируют overrides одного пользователя:
- `version` поле в ответе `/me/access-control` — можно использовать для optimistic locking
- Или принять стратегию "last write wins" (проще)

---

## 7. Полный список resource keys

Frontend использует следующие ключи ресурсов. **Backend должен знать этот список** для валидации и middleware:

```
# Общие
dashboard, my-cabinet

# Секретариат
secretariat, students, groups, teachers, course-endings

# Рекрутинг
recruitment, new-students, leads, target-mail, expelled, 
new-groups, archived, import-db,
import-db-update, import-db-delete, import-db-resend-invitation

# Финансы
finance, student-finance, debtors, nadplaty, settings,
accounting, faktury, returns, projects, salary-calculator, finance-ustawienia

# Тренер
trainer, trainer-dashboard, trainer-students, trainer-groups, 
lesson-tracker, salary-demo, trainer-materials, trainer-exam, trainer-mail

# Качество
quality, rezygnacje, holidays-return, quality-monitoring, 
quality-analytics, trial-lessons-qd, quality-zaliczenia, quality-olimpiad,
spotkania, sciezka, quality-materials, zaliczenia-calendar, all-tasks, quality-stats

# HR
hr, hr-active, hr-training, hr-pipeline, hr-personal, hr-analytics

# Настройки
settings-section, access-control, integrations, reports
```

**Всего: ~60 resource keys**

> **Вопрос:** Хранить ли этот список в базе / конфиге Backend? Или валидировать только на фронте?

---

## 8. Чек-лист для Backend-разработчика

### Минимально необходимо (MVP):

- [ ] Решить формат хранения overrides (JSON vs отдельная таблица)
- [ ] Доработать `GET /api/v1/me/access-control` — мёржить overrides в матрицу
- [ ] Реализовать `GET /api/v1/settings/users` — список пользователей с overrides
- [ ] Реализовать `PUT /api/v1/settings/users/{id}/overrides` — сохранение overrides
- [ ] Ограничить доступ к `settings/users/*` только для admin/super-admin

### Рекомендуется:

- [ ] Middleware для проверки доступа на каждом API endpoint
- [ ] Кэширование матрицы в Redis (invalidate при изменении overrides/роли)
- [ ] Аудит: логировать кто и когда изменил overrides
- [ ] Миграция: создать таблицу / добавить колонку

### На будущее:

- [ ] Временные overrides (`expires_at`)
- [ ] Сброс overrides при смене роли
- [ ] Синхронизация дефолтов ролей между front и back (config seeder)
- [ ] Bulk-операции: "Дать всем sales доступ к X"

---

## 9. Контакт и координация

**Frontend mock-данные:** Весь функционал работает через `mockAdapter.ts`. Mock полностью эмулирует описанные выше endpoints. Можно запустить `npm run dev` и протестировать UI без backend.

**Критический путь:**
1. Backend реализует 3 endpoints ↑
2. Frontend убирает `VITE_USE_MOCK=true` в `.env`
3. Тестируем вместе
4. Добавляем middleware для серверной проверки

**При вопросах:** обращаться с конкретными примерами request/response, приложив скриншоты из фронтенда.
