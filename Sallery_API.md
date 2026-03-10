# Sallery API

Документ описывает фактически реализованный salary API между `space_memory-php8` и `memory-adm`.

## Где реализовано
- Маршруты: `space_memory-php8/routes/api.php`
- Контроллер: `space_memory-php8/app/Http/Controllers/Api/Salary/SalaryController.php`
- Валидация: `space_memory-php8/app/Http/Requests/Api/Salary/*`
- Frontend-клиент: `memory-adm/src/api/salaryApi.ts`
- Тесты API: `space_memory-php8/tests/Feature/SalaryApiTest.php`

## Общие правила
- Базовый префикс API: `/api/v1`
- Все salary endpoint'ы защищены `jwt.auth`, то есть нужен заголовок `Authorization: Bearer <token>`
- Для всех методов можно передавать `project_id`; если не передан, backend использует `1`
- Статусы расчета зарплаты: `draft`, `confirmed`, `paid`, `disputed`

---

## 1) Получить зарплату преподавателя

**Метод:** `GET /api/v1/salary/teacher/{teacherId}`

**Что делает:**
Возвращает расчет зарплаты преподавателя за выбранный месяц. Backend ищет запись в таблице `gls_salary_calculations` по `teacher_id`, `project_id` и периоду.

**Path-параметры:**
- `teacherId` — ID преподавателя

**Query-параметры:**
- `project_id` — ID проекта, optional, integer, по умолчанию `1`
- `month` — период в формате `YYYY-MM`, optional
- `year` — год, optional, integer
- `period_month` — номер месяца `1..12`, optional, integer

> Обычно frontend использует `month=2026-02&project_id=1`.

### Пример входных данных
```http
GET /api/v1/salary/teacher/1?month=2026-02&project_id=1
Authorization: Bearer <token>
Accept: application/json
```

### Пример успешного ответа `200 OK`
```json
{
  "id": "1",
  "month": "2026-02",
  "trainerName": "Anna Kowalska",
  "status": "draft",
  "confirmedAt": null,
  "projectId": 1,
  "teacherId": 1,
  "subscriptions": {
    "amount": 2847.64,
    "base": 25887.6,
    "rate": 11,
    "childrenCount": 58,
    "groups": [
      {
        "name": "SM-01",
        "day": "Tue 17:00",
        "kids": 16,
        "base": 7840,
        "salary": 862.4,
        "children": []
      }
    ]
  },
  "substitutions": {
    "amount": 150.7,
    "rows": [
      {
        "child": "Kowalczyk Marta",
        "group": "SM-05",
        "forTrainer": "Zofia Nowak",
        "date": "2026-02-07",
        "abon": 490,
        "salary": 53.9
      }
    ]
  },
  "methodical": {
    "amount": 125.6,
    "rate": 31.4,
    "rows": [
      {
        "name": "Methodical meeting",
        "date": "2026-02-05",
        "present": true,
        "hours": 2,
        "total": 62.8
      }
    ]
  },
  "individual": {
    "amount": 280,
    "rate": 40,
    "rows": [
      {
        "child": "Zielinska Weronika",
        "program": "Space Memory",
        "count": 4,
        "total": 160
      }
    ]
  },
  "olympiad": {
    "amount": 160,
    "rate": 40,
    "rows": [
      {
        "name": "Week 1",
        "date": "2026-02-03",
        "link": "zoom.us/rec/AB12",
        "total": 40
      }
    ]
  },
  "admin3pct": {
    "amount": 660.93,
    "base": 25887.6,
    "pct": 85,
    "evaluatedBy": "Quality Dept",
    "evaluatedAt": "2026-03-01",
    "checklist": [
      {
        "duty": "Lesson records sent",
        "status": "done",
        "comment": null
      }
    ]
  },
  "bonuses": {
    "amount": 500,
    "rows": [
      {
        "reason": "Olympiad results",
        "comment": "2 winners",
        "status": "approved",
        "total": 500
      }
    ]
  },
  "trialLessons": {
    "amount": 70,
    "rate": 35,
    "threshold": 51,
    "confirmedByQA": true,
    "confirmedBy": "Quality Dept",
    "confirmedAt": "2026-03-01",
    "rows": [
      {
        "name": "Trial SM",
        "date": "2026-02-08",
        "program": "Space Memory",
        "attended": 6,
        "won": 4,
        "paid": true,
        "salary": 35,
        "children": []
      }
    ]
  },
  "rezygnacje": []
}
```

### Что означают основные блоки ответа
- `subscriptions` — зарплата от абонементов по группам
- `substitutions` — замены занятий за других преподавателей
- `methodical` — методические встречи
- `individual` — индивидуальные занятия
- `olympiad` — олимпиады / спецзанятия
- `admin3pct` — административная часть, завязанная на QA-оценку
- `bonuses` — дополнительные бонусы
- `trialLessons` — пробные уроки и конверсия
- `rezygnacje` — список отказов / выбытий

### Возможные ошибки
**`404 Not Found`** — если расчет не найден
```json
{
  "message": "Salary calculation not found"
}
```

**`422 Unprocessable Entity`** — если передан неверный формат параметров
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "month": [
      "The month does not match the format Y-m."
    ]
  }
}
```

---

## 2) Подтвердить зарплату

**Метод:** `POST /api/v1/salary/{id}/confirm`

**Что делает:**
Переводит расчет зарплаты в статус `confirmed` и записывает дату подтверждения в `confirmed_at`.

**Path-параметры:**
- `id` — ID расчета зарплаты из `gls_salary_calculations`

**Body-параметры:**
- `project_id` — optional, integer, по умолчанию `1`

### Пример входных данных
```json
{
  "project_id": 1
}
```

### Пример HTTP-запроса
```http
POST /api/v1/salary/1/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": 1
}
```

### Пример успешного ответа `200 OK`
```json
{
  "id": 1,
  "status": "confirmed",
  "confirmedAt": "2026-03-10 14:22:31"
}
```

### Возможные ошибки
**`404 Not Found`**
```json
{
  "message": "Salary calculation not found"
}
```

**`422 Unprocessable Entity`** — если `project_id` не integer / меньше 1
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "project_id": [
      "The project id must be at least 1."
    ]
  }
}
```

---

## 3) Оспорить зарплату

**Метод:** `POST /api/v1/salary/{id}/dispute`

**Что делает:**
Создает запись в `gls_salary_disputes` с причиной спора и меняет статус расчета зарплаты на `disputed`.

**Path-параметры:**
- `id` — ID расчета зарплаты

**Body-параметры:**
- `project_id` — optional, integer, по умолчанию `1`
- `teacher_id` — required, integer
- `reason` — required, string, длина от `3` до `2000`

### Пример входных данных
```json
{
  "project_id": 1,
  "teacher_id": 1,
  "reason": "Сумма в блоке substitutions не совпадает с моими расчетами"
}
```

### Пример HTTP-запроса
```http
POST /api/v1/salary/1/dispute
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": 1,
  "teacher_id": 1,
  "reason": "Сумма в блоке substitutions не совпадает с моими расчетами"
}
```

### Пример успешного ответа `201 Created`
```json
{
  "id": 1,
  "salary_calculation_id": 1,
  "status": "disputed"
}
```

> Важно: `id` в этом ответе — это ID созданного спора, а не ID самой зарплаты.

### Что происходит в базе
- В `gls_salary_disputes` создается запись со статусом `open`
- В `gls_salary_calculations` статус расчета меняется на `disputed`

### Возможные ошибки
**`404 Not Found`**
```json
{
  "message": "Salary calculation not found"
}
```

**`422 Unprocessable Entity`** — если не передан `teacher_id` или слишком короткий `reason`
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "teacher_id": [
      "The teacher id field is required."
    ],
    "reason": [
      "The reason must be at least 3 characters."
    ]
  }
}
```

---

## Как это использует frontend `memory-adm`
- `memory-adm/src/api/salaryApi.ts`
  - `getTeacherSalary(teacherId, month, projectId)`
  - `confirmSalary(salaryId, projectId)`
  - `disputeSalary(salaryId, teacherId, reason, projectId)`
- `memory-adm/src/stores/teacherSalary.store.ts`
  - `fetchSalary(month)` — загружает зарплату
  - `confirmSalary()` — подтверждает расчет
  - `disputeSalary(reason)` — отправляет спор

## Коротко по потоку данных
1. Frontend запрашивает `GET /salary/teacher/{teacherId}`
2. Backend берет агрегированный `payload` из `gls_salary_calculations`
3. Frontend показывает детальную раскладку зарплаты по секциям
4. При подтверждении вызывается `POST /salary/{id}/confirm`
5. При споре вызывается `POST /salary/{id}/dispute`

## Реально существующие API на сегодня
В кодовой базе сейчас реализованы только 3 salary endpoint'а:
1. Получение зарплаты преподавателя
2. Подтверждение зарплаты
3. Оспаривание зарплаты

