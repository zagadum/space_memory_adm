# API Интеграция GLS ↔ Indigo

**Base URL:** `https://api.gls.example.com/integration/v1`

**Формат ответа (стандарт):**
```json
{
  "success": true,
  "data": {}
}
```

---

## Сценарий полного жизненного цикла

```
[1] Создать учителя  →  POST /integration/v1/teachers/create
[2] Создать группу   →  POST /integration/v1/groups/create
[3] Наступила дата старта
[4] Ученик посетил урок  →  POST /integration/v1/students/attendance
[5] Подождать 5 минут (execute_after)
[6] Создать ученика  →  POST /integration/v1/students/create
--- ежемесячно ---
[7] Проверка оплаты  →  POST /integration/v1/billing/checks
[8] Блокировка       →  PATCH /integration/v1/students/block
[9] Разблокировка    →  PATCH /integration/v1/students/unblock
--- при смене группы ---
[10] Перевод         →  POST /integration/v1/students/transfers
```

---

## 1. Создать учителя

**Когда вызывать:** при создании учителя в GLS до создания группы.

```
POST /integration/v1/teachers/create
```

### Запрос
```json
{
  "teacher_id": "tch_1001",
  "surname": "Kowalski",
  "first_name": "Jan",
  "email": "jan.kowalski@example.com",
  "phone": "+48500100200",
  "status": "active"
}
```

| Поле         | Тип    | Обязательное | Описание                             |
|--------------|--------|:------------:|--------------------------------------|
| `teacher_id` | string | ✅           | Внутренний ID учителя в GLS          |
| `surname`    | string | ✅           | Фамилия учителя                      |
| `first_name` | string | ✅           | Имя учителя                          |
| `email`      | string | ✅           | Email учителя                        |
| `phone`      | string | ✅           | Телефон с кодом страны (+48...)      |
| `status`     | string | ✅           | Статус интеграции, обычно `active`   |

### Ответ `200 OK`
```json
{
  "success": true,
  "data": {
    "teacher_id": "tch_1001",
    "ext_teacher_id": "ind_t_98765",
    "status": "created"
  }
}
```

| Поле              | Описание                            |
|-------------------|-------------------------------------|
| `teacher_id`      | Внутренний ID учителя в GLS (echo)  |
| `ext_teacher_id`  | ID учителя в системе Indigo         |
| `status`          | `created`                           |

> ⚠️ **Сохранить `ext_teacher_id`** — потребуется при создании группы.

---

## 2. Создать группу

**Когда вызывать:** после создания учителя, при создании новой группы в GLS.

```
POST /integration/v1/groups/create
```

### Запрос
```json
{
  "group_id": "grp_2001",
  "group_name": "Mental Math Junior Mon/Wed 18:00",
  "format": "online",
  "address": "online",
  "start_date": "2026-05-04",
  "start_time": "18:00",
  "weekdays": ["mon", "wed"],
  "teacher_id": "tch_1001",
  "age_group": "junior"
}
```

| Поле           | Тип            | Обязательное | Описание                                        |
|----------------|----------------|:------------:|-------------------------------------------------|
| `group_id`     | string         | ✅           | Внутренний ID группы в GLS                      |
| `group_name`   | string         | ✅           | Название группы (1 в 1 как в админке)           |
| `format`       | string (enum)  | ✅           | `online` или `offline`                          |
| `address`      | string         | ✅           | `"online"` либо физический адрес                |
| `start_date`   | string (date)  | ✅           | Первый день занятий `YYYY-MM-DD`                |
| `start_time`   | string (time)  | ✅           | Время старта `HH:mm`                            |
| `weekdays`     | array[string]  | ✅           | Дни недели: `mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun` |
| `teacher_id`   | string         | ✅           | Внутренний ID учителя в GLS                     |
| `age_group`    | string         | ✅           | Техническое поле, можно передавать всегда       |

### Ответ `200 OK`
```json
{
  "success": true,
  "data": {
    "group_id": "grp_2001",
    "ext_group_id": "ind_g_54321",
    "ext_teacher_id": "ind_t_98765",
    "status": "created"
  }
}
```

| Поле              | Описание                          |
|-------------------|-----------------------------------|
| `group_id`        | Внутренний ID группы в GLS (echo) |
| `ext_group_id`    | ID группы в системе Indigo        |
| `ext_teacher_id`  | ID учителя в системе Indigo       |
| `status`          | `created`                         |

> ⚠️ **Сохранить `ext_group_id`** — потребуется при создании ученика.

---

## 3. Provision-запрос (первое посещение урока)

**Когда вызывать:** ученик посетил урок, статус посещаемости изменился на `present`.

```
POST /integration/v1/students/attendance
```

### Запрос
```json
{
  "student_id": "stu_3001",
  "group_id": "grp_2001",
  "attendance_id": "att_7001",
  "status": "present",
  "lesson_date": "2026-05-04",
  "observed_at": "2026-05-04T18:20:00Z"
}
```

| Поле            | Тип                | Обязательное | Описание                              |
|-----------------|--------------------|:------------:|---------------------------------------|
| `student_id`    | string             |      ✅       | Внутренний ID ученика в GLS           |
| `group_id`      | string             |      ✅       | Внутренний ID группы в GLS            |
| `attendance_id` | string             |      ✅       | ID записи посещаемости                |
| `status`        | string (enum)      |      ✅       | Должен быть `present`                 |
| `lesson_date`    | string (date)     |      ✅       | Дата урока `YYYY-MM-DD`               |
| `observed_at`    | string (ISO8601)  |      ✅       | Момент фиксации статуса               |

### Ответ `200 OK`
```json
{
  "success": true,
  "data": {
    "ext_attendance_id": "spr_8001",
    "student_id": "stu_3001",
    "status": "scheduled",
    "execute_after": "2026-05-04T18:25:00Z"
  }
}
```

| Поле                   | Описание                                                    |
|------------------------|-------------------------------------------------------------|
| `ext_attendance_id`    | ID provision-запроса в Indigo                               |
| `student_id`           | Внутренний ID ученика (echo)                                |
| `status`               | `scheduled` — запрос запланирован                           |
| `execute_after`        | Не раньше этого времени вызывать `/integration/v1/students` |

> ⏱️ **Подождать до `execute_after` (~5 минут), затем вызывать `/integration/v1/students`.**

---

## 4. Создать ученика

**Когда вызывать:** через 5 минут после `students/attendance` (по `execute_after`).

```
POST /integration/v1/students
```

### Запрос
```json
{
  "student_id": "stu_3001",
  "group_id": "grp_2001",
  "email": "misha.nick",
  "phone": "+48555111222",
  "first_name": "Mikhail",
  "last_name": "Ivanov",
  "dob": "2016-01-14",
  "child_password": "ParentPass2026",
  "parent": {
    "first_name": "Olga",
    "last_name": "Ivanova",
    "password": "hiddenParentTechPassword_4582"
  },
  "language": "pl",
  "pricing": {
    "first_month_price": 199.25,
    "second_month_price": 288.00,
    "currency": "PLN"
  },
  "comment": ""
}
```

| Поле                      | Тип            | Обязательное | Описание                                                              |
|---------------------------|----------------|:------------:|-----------------------------------------------------------------------|
| `student_id`              | string         | ✅           | Внутренний ID ученика в GLS                                           |
| `group_id`                | string         | ✅           | Внутренний ID группы в GLS                                            |
| `email`                   | string         | ✅           | Никнейм ребёнка в Indigo (без домена)                                 |
| `phone`                   | string         | ✅           | Телефон с кодом страны (+48...)                                       |
| `first_name`               | string         | ✅           | Имя ребёнка                                                           |
| `last_name`                | string         | ✅           | Фамилия ребёнка                                                       |
| `dob`                     | string (date)  | ✅           | Дата рождения `YYYY-MM-DD`                                            |
| `child_password`           | string         | ✅           | Желательно использовать пароль родителя из GLS                        |
| `parent.first_name`        | string         | ✅           | Имя родителя                                                          |
| `parent.last_name`         | string         | ✅           | Фамилия родителя                                                      |
| `parent.password`         | string         | ✅           | Технический пароль родителя (не используется напрямую)                |
| `language`                | string         | ✅           | Всегда `pl`                                                           |
| `pricing.first_month_price` | number         | ✅           | Рассчитывается по дате старта (пропорционально)                       |
| `pricing.second_month_price`| number         | ✅           | Всегда `350.00`                                                        |
| `pricing.currency`        | string         | ✅           | `PLN`                                                                 |
| `comment`                 | string         | ❌           | Свободный комментарий                                                 |

### Ответ `200 OK`
```json
{
  "success": true,
  "data": {
    "student_id": "stu_3001",
    "ext_student_id": "ind_s_112233",
    "ext_group_id": "ind_g_54321",
    "status": "created"
  }
}
```

| Поле              | Описание                           |
|-------------------|------------------------------------|
| `student_id`      | Внутренний ID ученика (echo)       |
| `ext_student_id`  | ID ученика в системе Indigo        |
| `ext_group_id`    | ID группы в системе Indigo         |
| `status`          | `created`                          |

> ⚠️ **Сохранить `ext_student_id`** — используется для всех последующих операций.

---

## 5. Проверка оплаты (ежемесячно)

**Когда вызывать:** в день биллинга (обычно 3-е число месяца).

```
POST /integration/v1/billing/checks
```

### Запрос
```json
{
  "billing_date": "2026-06-03",
  "student_ids": [
    "3001",
    "3002",
    "3003"
  ]
}
```

| Поле           | Тип           | Обязательное | Описание                                |
|----------------|---------------|:------------:|-----------------------------------------|
| `billing_date`  | string (date) | ✅           | Дата биллинга `YYYY-MM-DD`              |
| `student_ids`  | array[string] | ✅           | Список ID учеников для проверки         |

### Ответ `200 OK`
```json
{
  "success": true,
  "data": {
    "billing_date": "2026-06-03",
    "processed": 120,
    "paid": 93,
    "unpaid": 27,
    "scheduled_actions": {
      "to_block": 27,
      "to_unblock": 0
    }
  }
}
```

| Поле                          | Описание                               |
|-------------------------------|----------------------------------------|
| `billing_date`                 | Дата биллинга                          |
| `processed`                   | Всего обработано учеников              |
| `paid`                        | Количество оплативших                  |
| `unpaid`                      | Количество не оплативших               |
| `scheduled_actions.to_block`    | Запланировано к блокировке             |
| `scheduled_actions.to_unblock`  | Запланировано к разблокировке          |

> ➡️ После проверки — вызывать `/integration/v1/students/block` для каждого неоплатившего.

---

## 6. Блокировка ученика

**Когда вызывать:** после биллинг-проверки, если ученик не оплатил.

```
PATCH /integration/v1/students/block
```

### Запрос
```json
{
  "student_id": "1",
  "status": "blocked",
  "reason": "payment_missing",
  "effective_at": "2026-06-03T00:05:00Z"
}
```

| Поле          | Тип           | Обязательное | Описание                                         |
|---------------|---------------|:------------:|--------------------------------------------------|
| `student_id`  | string        | ✅           | Внутренний ID ученика в GLS                      |
| `status`      | string (enum) | ✅           | Всегда `blocked`                                 |
| `reason`      | string (enum) | ✅           | `payment_missing`                                |
| `effective_at` | string (ISO8601) | ✅        | Дата и время вступления в силу                   |

### Ответ `200 OK`
```json
{
  "success": true,
  "data": {
    "student_id": "stu_3001",
    "ext_student_id": "ind_s_112233",
    "status": "blocked",
    "updated_at": "2026-06-03T00:05:02Z"
  }
}
```

---

## 7. Разблокировка ученика

**Когда вызывать:** при получении оплаты от ранее заблокированного ученика.

```
PATCH /integration/v1/students/unblock
```

### Запрос
```json
{
  "student_id": "1",
  "status": "active",
  "reason": "payment_received",
  "effective_at": "2026-06-03T00:05:00Z"
}
```

| Поле          | Тип           | Обязательное | Описание                              |
|---------------|---------------|:------------:|---------------------------------------|
| `student_id`  | string        | ✅           | Внутренний ID ученика в GLS           |
| `status`      | string (enum) | ✅           | Всегда `active`                       |
| `reason`      | string (enum) | ✅           | `payment_received`                    |
| `effective_at` | string (ISO8601) | ✅        | Дата и время вступления в силу        |

### Ответ `200 OK`
```json
{
  "success": true,
  "data": {
    "student_id": "stu_3001",
    "ext_student_id": "ind_s_112233",
    "status": "active",
    "updated_at": "2026-06-03T00:05:02Z"
  }
}
```

---

## 8. Перевод ученика в другую группу

**Когда вызывать:** при смене группы ученика в GLS — необходима синхронизация с Indigo.

```
POST /integration/v1/students/transfers
```

### Запрос
```json
{
  "old_group_id": "grp_2001",
  "new_group_id": "grp_2002",
  "effective_date": "2026-06-10",
  "reason": "schedule_change"
}
```

| Поле             | Тип           | Обязательное | Описание                                              |
|------------------|---------------|:------------:|-------------------------------------------------------|
| `old_group_id`   | string        | ✅           | Внутренний ID текущей группы в GLS                    |
| `new_group_id`   | string        | ✅           | Внутренний ID новой группы в GLS                      |
| `effective_date`  | string (date) | ✅           | Дата вступления перевода в силу `YYYY-MM-DD`          |
| `reason`         | string (enum) | ✅           | Причина: `schedule_change`, и др.                     |

### Ответ `200 OK`
```json
{
  "success": true,
  "data": {
    "transfer_id": "trf_9001",
    "student_id": "stu_3001",
    "old_group_id": "grp_2001",
    "new_group_id": "grp_2002",
    "status": "scheduled",
    "effective_date": "2026-06-10"
  }
}
```

| Поле             | Описание                              |
|------------------|---------------------------------------|
| `transfer_id`    | ID перевода в системе Indigo          |
| `student_id`     | Внутренний ID ученика                 |
| `old_group_id`   | Старая группа (echo)                  |
| `new_group_id`   | Новая группа (echo)                   |
| `status`         | `scheduled` — перевод запланирован    |
| `effective_date`  | Дата перевода (echo)                  |

---

## JSON Schema примеры (request / response)

1) POST /integration/v1/teachers

Request schema:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["teacher_id","surname","first_name","email","phone","status"],
  "properties": {
    "teacher_id": {"type":"string"},
    "surname": {"type":"string"},
    "first_name": {"type":"string"},
    "email": {"type":"string","format":"email"},
    "phone": {"type":"string"},
    "status": {"type":"string","enum":["active","inactive"]}
  },
  "additionalProperties": false
}
```

Response schema:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success","data"],
  "properties": {
    "success": {"type":"boolean"},
    "data": {
      "type":"object",
      "required":["teacher_id","ext_teacher_id","status"],
      "properties":{
        "teacher_id": {"type":"string"},
        "ext_teacher_id": {"type":"string"},
        "status": {"type":"string"}
      }
    }
  }
}
```

---

2) POST /integration/v1/groups

Request schema:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type":"object",
  "required":["group_id","group_name","format","address","start_date","start_time","weekdays","teacher_id","age_group"],
  "properties":{
    "group_id":{"type":"string"},
    "group_name":{"type":"string"},
    "format":{"type":"string","enum":["online","offline"]},
    "address":{"type":"string"},
    "start_date":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}$"},
    "start_time":{"type":"string","pattern":"^\\d{2}:\\d{2}$"},
    "weekdays":{"type":"array","items":{"type":"string","enum":["mon","tue","wed","thu","fri","sat","sun"]}},
    "teacher_id":{"type":"string"},
    "age_group":{"type":"string"}
  },
  "additionalProperties": false
}
```

Response schema: (same shape pattern as teacher response, with group fields)
```json
{
  "$schema":"http://json-schema.org/draft-07/schema#",
  "type":"object",
  "required":["success","data"],
  "properties":{
    "success": {"type":"boolean"},
    "data":{
      "type":"object",
      "required":["group_id","ext_group_id","ext_teacher_id","status"],
      "properties":{
        "group_id":{"type":"string"},
        "ext_group_id":{"type":"string"},
        "ext_teacher_id":{"type":"string"},
        "status":{"type":"string"}
      }
    }
  }
}
```

---

3) POST /integration/v1/students/attendance

Request schema:
```json
{
  "$schema":"http://json-schema.org/draft-07/schema#",
  "type":"object",
  "required":["student_id","group_id","attendance_id","status","lesson_date","observed_at"],
  "properties":{
    "student_id":{"type":"string"},
    "group_id":{"type":"string"},
    "attendance_id":{"type":"string"},
    "status":{"type":"string","enum":["present"]},
    "lesson_date":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}$"},
    "observed_at":{"type":"string","format":"date-time"}
  },
  "additionalProperties": false
}
```

Response schema:
```json
{
  "$schema":"http://json-schema.org/draft-07/schema#",
  "type":"object",
  "required":["success","data"],
  "properties":{
    "success":{"type":"boolean"},
    "data":{
      "type":"object",
      "required":["ext_attendance_id","student_id","status","execute_after"],
      "properties":{
        "ext_attendance_id":{"type":"string"},
        "student_id":{"type":"string"},
        "status":{"type":"string"},
        "execute_after":{"type":"string","format":"date-time"}
      }
    }
  }
}
```

---

4) POST /integration/v1/students

Request schema:
```json
{
  "$schema":"http://json-schema.org/draft-07/schema#",
  "type":"object",
  "required":["student_id","group_id","email","phone","first_name","last_name","dob","child_password","parent","language","pricing"],
  "properties":{
    "student_id":{"type":"string"},
    "group_id":{"type":"string"},
    "email":{"type":"string"},
    "phone":{"type":"string"},
    "first_name":{"type":"string"},
    "last_name":{"type":"string"},
    "dob":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}$"},
    "child_password":{"type":"string"},
    "parent":{
      "type":"object",
      "required":["first_name","last_name","password"],
      "properties":{
        "first_name":{"type":"string"},
        "last_name":{"type":"string"},
        "password":{"type":"string"}
      }
    },
    "language":{"type":"string","minLength":2},
    "pricing":{
      "type":"object",
      "required":["first_month_price","second_month_price","currency"],
      "properties":{
        "first_month_price":{"type":"number"},
        "second_month_price":{"type":"number"},
        "currency":{"type":"string"}
      }
    },
    "comment":{"type":"string"}
  },
  "additionalProperties": false
}
```

Response schema:
```json
{
  "$schema":"http://json-schema.org/draft-07/schema#",
  "type":"object",
  "required":["success","data"],
  "properties":{
    "success":{"type":"boolean"},
    "data":{
      "type":"object",
      "required":["student_id","ext_student_id","ext_group_id","status"],
      "properties":{
        "student_id":{"type":"string"},
        "ext_student_id":{"type":"string"},
        "ext_group_id":{"type":"string"},
        "status":{"type":"string"}
      }
    }
  }
}
```

---

5) POST /integration/v1/billing/checks

Request schema:
```json
{
  "$schema":"http://json-schema.org/draft-07/schema#",
  "type":"object",
  "required":["billing_date","student_ids"],
  "properties":{
    "billing_date":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}$"},
    "student_ids":{"type":"array","items":{"type":"string"}}
  },
  "additionalProperties": false
}
```

Response schema:
```json
{
  "$schema":"http://json-schema.org/draft-07/schema#",
  "type":"object",
  "required":["success","data"],
  "properties":{
    "success":{"type":"boolean"},
    "data":{
      "type":"object",
      "required":["billing_date","processed","paid","unpaid","scheduled_actions"],
      "properties":{
        "billing_date":{"type":"string"},
        "processed":{"type":"integer"},
        "paid":{"type":"integer"},
        "unpaid":{"type":"integer"},
        "scheduled_actions":{
          "type":"object",
          "properties":{
            "to_block":{"type":"integer"},
            "to_unblock":{"type":"integer"}
          }
        }
      }
    }
  }
}
```

---

6) PATCH /integration/v1/students/block

Request schema:
```json
{
  "$schema":"http://json-schema.org/draft-07/schema#",
  "type":"object",
  "required":["student_id","status","reason","effective_at"],
  "properties":{
    "student_id":{"type":"string"},
    "status":{"type":"string","enum":["blocked"]},
    "reason":{"type":"string"},
    "effective_at":{"type":"string","format":"date-time"}
  },
  "additionalProperties": false
}
```

Response schema:
```json
{
  "$schema":"http://json-schema.org/draft-07/schema#",
  "type":"object",
  "required":["success","data"],
  "properties":{
    "success":{"type":"boolean"},
    "data":{
      "type":"object",
      "required":["student_id","ext_student_id","status","updated_at"],
      "properties":{
        "student_id":{"type":"string"},
        "ext_student_id":{"type":"string"},
        "status":{"type":"string"},
        "updated_at":{"type":"string","format":"date-time"}
      }
    }
  }
}
```

---

7) PATCH /integration/v1/students/unblock

Request schema (similar to block but status `active`):
```json
{
  "$schema":"http://json-schema.org/draft-07/schema#",
  "type":"object",
  "required":["student_id","status","reason","effective_at"],
  "properties":{
    "student_id":{"type":"string"},
    "status":{"type":"string","enum":["active"]},
    "reason":{"type":"string"},
    "effective_at":{"type":"string","format":"date-time"}
  },
  "additionalProperties": false
}
```

Response schema: same as block response, `status` will be `active`.

---

8) POST /integration/v1/students/transfers

Request schema:
```json
{
  "$schema":"http://json-schema.org/draft-07/schema#",
  "type":"object",
  "required":["old_group_id","new_group_id","effective_date","reason"],
  "properties":{
    "old_group_id":{"type":"string"},
    "new_group_id":{"type":"string"},
    "effective_date":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}$"},
    "reason":{"type":"string"}
  },
  "additionalProperties": false
}
```

Response schema:
```json
{
  "$schema":"http://json-schema.org/draft-07/schema#",
  "type":"object",
  "required":["success","data"],
  "properties":{
    "success":{"type":"boolean"},
    "data":{
      "type":"object",
      "required":["transfer_id","student_id","old_group_id","new_group_id","status","effective_date"],
      "properties":{
        "transfer_id":{"type":"string"},
        "student_id":{"type":"string"},
        "old_group_id":{"type":"string"},
        "new_group_id":{"type":"string"},
        "status":{"type":"string"},
        "effective_date":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}$"}
      }
    }
  }
}
```

---

## Сводная таблица эндпоинтов

| #  | Метод   | Endpoint                              | Описание                          | Когда вызывать                                   |
|----|---------|---------------------------------------|-----------------------------------|--------------------------------------------------|
| 1  | `POST`  | `/integration/v1/teachers/create`     | Создать учителя                   | При создании учителя в GLS                       |
| 2  | `POST`  | `/integration/v1/groups/create`       | Создать группу                    | При создании группы в GLS                        |
| 3  | `POST`  | `/integration/v1/students/attendance` | Зафиксировать посещение           | При первом `present` ученика                     |
| 4  | `POST`  | `/integration/v1/students/create`     | Создать ученика                   | Через 5 мин после provision-request              |
| 5  | `POST`  | `/integration/v1/billing/checks`      | Проверить оплату                  | Ежемесячно в день биллинга                       |
| 6  | `PATCH` | `/integration/v1/students/block`      | Заблокировать ученика             | После биллинга при отсутствии оплаты             |
| 7  | `PATCH` | `/integration/v1/students/unblock`    | Разблокировать ученика            | При получении оплаты                             |
| 8  | `POST`  | `/integration/v1/students/transfers`  | Перевести ученика                 | При смене группы в GLS                           |

---

## ID-маппинг: GLS ↔ Indigo

| Сущность | ID в GLS        | ID в Indigo         | Где получить              |
|----------|-----------------|---------------------|---------------------------|
| Учитель  | `teacher_id`    | `ext_teacher_id`    | Ответ `POST /integration/v1/teachers`    |
| Группа   | `group_id`      | `ext_group_id`      | Ответ `POST /integration/v1/groups`      |
| Ученик   | `student_id`    | `ext_student_id`    | Ответ `POST /integration/v1/students` |
| Посещение| `attendance_id` | `ext_attendance_id` | Ответ `POST /integration/v1/students/attendance` |
| Перевод  | —               | `transfer_id`       | Ответ `POST /integration/v1/students/transfers` |

> 💡 Все `ext_*` ID должны сохраняться в базе GLS как связующие ключи для последующих запросов.

---

## Расчёт `first_month_price`

`first_month_price` рассчитывается пропорционально количеству оставшихся дней в первом месяце от даты первого урока:

```
first_month_price = (second_month_price / days_in_month) × remaining_days
```

Пример: урок начался 4 мая, в мае 31 день, осталось 28 дней:
```
first_month_price = (350.00 / 31) × 28 ≈ 316.13 PLN
```

---

## Коды ошибок

| HTTP код | Описание                                             |
|----------|------------------------------------------------------|
| `200`    | Успешный ответ                                       |
| `400`    | Неверный запрос (невалидные поля, отсутствующий ID)  |
| `401`    | Не авторизован                                        |
| `404`    | Сущность не найдена                                  |
| `409`    | Конфликт (ученик/группа уже существует)              |
| `422`    | Ошибка валидации данных                              |
| `500`    | Внутренняя ошибка сервера Indigo                     |

 