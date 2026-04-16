---
trigger: glob
globs: app/**/*.php,src/types/**/*.ts,src/api/**/*.ts
---

# GLS — Структура базы данных
**Activation: PHP-файлы, TypeScript types и API**

> Используй этот файл при написании Laravel migrations, Eloquent моделей, API Resources
> и TypeScript интерфейсов. Все таблицы имеют префикс `gls_`.

---

## Основные принципы

- Все финансовые операции относятся к проекту (`project_id`)
- **Начисление и платёж — разные сущности** (не путать!)
- Один платёж может закрывать несколько начислений
- Дополнительные занятия создают отдельные начисления
- Финансовые документы создаются на основе платежей

---

## gls_projects — проекты

| id | code | name |
|----|------|------|
| 1 | `space_memory` | Space Memory |
| 2 | `indigo` | Indigo |

**Поля:** `id`, `code`, `name`, `is_active`, `created_at`, `updated_at`

---

## gls_payment_charges — начисления ученикам

> Это ЧТО должен заплатить ученик. Не реальный платёж.

**Поля:**
- `id`
- `project_id` — проект
- `student_id` — ученик
- `group_id` — группа
- `charge_type` — тип начисления
- `period_year` / `period_month` — период
- `base_amount` — базовая цена
- `discount_amount` — скидка
- `final_amount` — итог к оплате
- `status` — статус

**Статусы:** `draft`, `pending`, `paid`, `partially_paid`, `overdue`, `cancelled`, `paused`, `overpayment`, `closed`, `refunded`

**Типы начислений (`charge_type`):**
`monthly_start`, `monthly_alignment`, `monthly_standard`, `platform`,
`extra_lesson`, `bonus_class`, `material`, `manual_adjustment`, `refund_adjustment`

---

## gls_payment_transactions — реальные платежи

> Это ФАКТ оплаты. Связывается с начислениями через `gls_payment_allocations`.

**Поля:**
- `id`
- `student_id`
- `project_id`
- `provider` — способ оплаты: `imoje` | `cash` | `bank_transfer` | `manual`
- `direction` — `in` (приход) | `out` (возврат)
- `amount`
- `currency`
- `status`

---

## gls_payment_allocations — распределение платежей

> Связующая таблица: какая транзакция закрывает какое начисление и на сколько.

**Поля:** `id`, `transaction_id`, `charge_id`, `amount`

---

## gls_lesson_additional — дополнительные занятия

**Поля:**
- `id`
- `student_group_task_id` — задание ученику в группе
- `student_id`, `project_id`, `group_id`, `teacher_id`
- `lesson_date`
- `additional_type` — тип (консультация, замена пропущенного и т.д.)
- `base_amount`, `discount_amount`, `final_amount`
- `status` — запланировано / проведено / отменено
- `comment`

---

## gls_invoice_documents — счета и документы (KSeF)

**Поля:**
- `id`, `student_id`, `project_id`
- `transaction_id` — nullable, если документ по платежу
- `charge_id` — nullable, если документ по начислению
- `document_type`
- `number` — номер документа
- `issue_date`
- `service_date_from`, `service_date_to`
- `title`
- `amount_net`, `amount_gross`, `currency`
- `ksef_status` — статус в польской системе e-фактур (KSeF)
- `ksef_reference`
- `pdf_path`
- `meta` — JSON с дополнительными данными

---

## gls_salary_calculations — расчёт зарплаты преподавателя

**Поля:**
- `id`, `project_id`, `teacher_id`
- `period_year`, `period_month`
- `base_subscriptions` — базовое кол-во подписок
- `pct_subscriptions` — процент от подписок
- `substitutions_amount` — замены занятий
- `methodical_amount` — методическая работа
- `individual_amount` — индивидуальные занятия
- `olympiad_amount` — олимпиады
- `admin_duty_amount` — административные обязанности (3%, зависит от QA)
- `bonuses_amount` — бонусы
- `trial_lessons_amount` — пробные уроки
- `retention_bonus_amount` — бонус за удержание учеников
- `total` — итоговая сумма к выплате
- `status` — `draft` | `confirmed` | `paid` | `disputed`
- `confirmed_at` — дата подтверждения
- `paid_at` — дата выплаты
- `payload` — JSON с детализацией по каждому компоненту зарплаты

> `payload` — основной источник данных для отображения в UI.
> Frontend API: `GET /v1/salary/teacher/{teacherId}?month=YYYY-MM&project_id=1`

---

## Связи между таблицами

```
gls_payment_transactions (1) ──→ (N) gls_payment_allocations
gls_payment_charges     (1) ──→ (N) gls_payment_allocations
                               (один платёж — несколько начислений)

gls_payment_transactions (1) ──→ (1?) gls_invoice_documents
gls_salary_calculations  (1) ──→ (N)  gls_salary_disputes
```
