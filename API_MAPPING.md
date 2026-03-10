# 🗺️ Файл соответствий данных API ↔ MockDB

## Дата создания: 2026-03-07

---

## 📊 Структура ответа API

### Реальный API Response
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "student": { StudentProfile },
    "programs": [ Program[] ]
  }
}
```

### MockDB Structure
```typescript
{
  profile: StudentProfile,
  programs: Program[]
}
```

---

## 👤 StudentProfile - Профиль студента

| MockDB Field | API Field | Тип | Источник БД | Примечания |
|--------------|-----------|-----|-------------|------------|
| `id` | `id` | string | `student.id` | ✅ Совпадает |
| `initials` | `initials` | string | Вычисляется | `surname[0] + lastname[0]` |
| `name` | `name` | string | Вычисляется | `surname + ' ' + lastname` |
| `firstName` | `firstName` | string | `student.lastname` | ⚠️ В БД это `lastname` |
| `lastName` | `lastName` | string | `student.surname` | ⚠️ В БД это `surname` |
| `email` | `email` | string | `student.email` | ✅ Совпадает |
| `birthDate` | `birthDate` | string (YYYY-MM-DD) | `student.dob` | Формат: ISO 8601 |
| `age` | `age` | number | Вычисляется | `now().diffInYears(dob)` |
| `phone` | `phone` | string | `student.phone` | ✅ Совпадает |
| `country` | `country` | string | `student.parent1_phone_country` | Код страны (UA/PL) |
| `city` | `city` | string | ❌ Отсутствует | Пустая строка |
| `street` | `street` | string | ❌ Отсутствует | Пустая строка |
| `apartment` | `apartment` | string | ❌ Отсутствует | Пустая строка |
| `postalCode` | `postalCode` | string | ❌ Отсутствует | Пустая строка |
| `parentName` | `parentName` | string | Вычисляется | `parent1_surname + ' ' + parent1_lastname` |
| `parentFirstName` | `parentFirstName` | string | `student.parent1_lastname` | ⚠️ В БД это `lastname` |
| `parentLastName` | `parentLastName` | string | `student.parent1_surname` | ⚠️ В БД это `surname` |
| `parentPhone` | `parentPhone` | string | `student.parent1_phone` | ✅ Совпадает |
| `parentRole` | `parentRole` | string | Константа | Всегда "родитель" |
| `parentPassport` | `parentPassport` | string | ❌ Отсутствует | Пустая строка |
| `status` | `status` | string | Вычисляется | `enabled ? 'active' : 'inactive'` |
| `statusColor` | `statusColor` | string | Вычисляется | `enabled ? 'green' : 'gray'` |
| `photoConsent` | `photoConsent` | boolean | ❌ Отсутствует | Всегда `false` |
| `regComment` | `regComment` | string | ❌ Отсутствует | Пустая строка |
| `totalBalance` | `totalBalance` | object | Вычисляется | См. ниже ⬇️ |
| `nextPay` | `nextPay` | object | Вычисляется | См. ниже ⬇️ |
| `enrollments` | `enrollments` | array | ❌ Отсутствует | Пустой массив |

### totalBalance Object

| MockDB | API | Источник БД | Формат |
|--------|-----|-------------|---------|
| `value` | `value` | `student.balance` | "0.00" (string) |
| `label` | `label` | Вычисляется | `balance >= 0 ? 'active' : 'debt'` |
| `color` | `color` | Вычисляется | `balance >= 0 ? 'green' : 'red'` |

### nextPay Object

| MockDB | API | Источник БД | Формат |
|--------|-----|-------------|---------|
| `date` | `date` | `student.date_finish` | "YYYY-MM-DD" или "" |
| `approx` | `approx` | ❌ Отсутствует | Пустая строка |

---

## 📚 Program - Программа обучения

| MockDB Field | API Field | Тип | Источник БД | Примечания |
|--------------|-----------|-----|-------------|------------|
| `id` | `id` | string | Генерируется | `"prog_" + student_id` |
| `name` | `name` | string | Вычисляется | Иконка + название программы (Space Memory, Speedy Mind) |
| `sub` | `sub` | string | Вычисляется | Группа · Расписание · Учитель · Тариф · Скидка |
| `tariff` | `tariff` | number | `student.sum_aboniment` | Стоимость абонемента |
| `balance` | `balance` | number | `student.balance` | Баланс студента |
| `balanceLabel` | `balanceLabel` | string | Вычисляется | `balance >= 0 ? 'active' : 'debt'` |
| `barGradient` | `barGradient` | string | Вычисляется | CSS gradient по типу программы |
| `years` | `years` | object | Вычисляется | См. ниже ⬇️ |
| `transactions` | `transactions` | array | ❌ Отсутствует | Пустой массив |
| `extras` | `extras` | array | ❌ Отсутствует | Пустой массив |

### ✨ NEW: Определение типа программы

API теперь автоматически определяет тип программы по названию группы:

| Ключевые слова в названии группы | Программа | Иконка | Градиент |
|----------------------------------|-----------|--------|----------|
| `memory`, `память` | Space Memory | 🌌 | linear-gradient(180deg, #3b82f6, #8b5cf6) |
| `speedy`, `арифметика`, `абак`, `indigo` | Speedy Mind | ⚡ | linear-gradient(180deg, #8b5cf6, #ec4899) |
| `reading`, `читання` | Speed Reading | 📖 | linear-gradient(180deg, #f59e0b, #ef4444) |
| `logic`, `chess`, `шахмат` | Logic & Chess | ♟️ | linear-gradient(180deg, #6366f1, #8b5cf6) |
| По умолчанию | Основная программа | 📚 | linear-gradient(180deg, #10b981, #059669) |

### ✨ NEW: Формирование подзаголовка (sub)

Формат: `Группа · День Время · Учитель · Тариф · Скидка`

**Пример:** `Группа1 · Пн 13:00 · Опять Тест · 1000 грн/мес · без скидки`

**Источники данных:**
- Группа: `teacher_groups.name`
- День недели: Из `teacher_groups.workday1-7` (первый активный день)
- Время: `teacher_groups.start_time`
- Учитель: `teacher.surname + teacher.first_name`
- Тариф: `student.sum_aboniment` + валюта по стране
- Скидка: `student.discount` или "без скидки"

### years Structure - Помесячная сетка

```typescript
{
  "2021": MonthObj[12], // Массив из 12 месяцев
  "2022": MonthObj[12],
  ...
}
```

### MonthObj - Объект месяца

| MockDB Field | API Field | Тип | Источник БД | Примечания |
|--------------|-----------|-----|-------------|------------|
| `s` | `s` | MonthStatus | Вычисляется | `enabled ? 'paid' : 'pending'` или 'future' |
| `payStatus` | `payStatus` | PayStatus | Вычисляется | `enabled ? 'paid' : 'pending'` |
| `a` | `a` | number | `student_payment.sum_aboniment` | Сумма платежа |
| `ksef` | `ksef` | KsefStatus | Константа | 'ok' для оплаченных, null для остальных |
| `g1` | `g1` | number | Константа | 4 (количество занятий) |
| `g2` | `g2` | number | Константа | 0 (вторая группа) |
| `txDate` | `txDate` | string | `student_payment.date_pay` | Дата платежа "YYYY-MM-DD" |
| `disc` | `disc` | string | ❌ Отсутствует | Тип скидки (не реализовано) |
| `discAmt` | `discAmt` | number | ❌ Отсутствует | Размер скидки (не реализовано) |
| `lessons` | `lessons` | number | ❌ Отсутствует | Проведено занятий (не реализовано) |
| `totalLessons` | `totalLessons` | number | ❌ Отсутствует | Всего занятий (не реализовано) |
| `bonus` | `bonus` | boolean | ❌ Отсутствует | Бонусный месяц (не реализовано) |
| `bonusDate` | `bonusDate` | string | ❌ Отсутствует | Дата бонуса (не реализовано) |

---

## 🔄 Алгоритм формирования years

### Логика backend (PaymentController.php):

```php
$years = [];
foreach ($payments as $payment) {
    $year = $payment->date_pay->format('Y');
    $month = (int) $payment->date_pay->format('n') - 1; // 0-11 для JS
    
    if (!isset($years[$year])) {
        $years[$year] = array_fill(0, 12, [
            's' => 'future',
            'a' => 0,
            'ksef' => null,
            'g1' => 0,
            'g2' => 0,
        ]);
    }
    
    $years[$year][$month] = [
        's' => $payment->enabled ? 'paid' : 'pending',
        'payStatus' => $payment->enabled ? 'paid' : 'pending',
        'a' => (float) $payment->sum_aboniment,
        'ksef' => 'ok',
        'g1' => 4,
        'g2' => 0,
        'txDate' => $payment->date_pay->format('Y-m-d'),
    ];
}
```

---

## 📝 Таблицы базы данных

### Основная таблица: `student`

| Поле БД | Тип | API Field | Описание |
|---------|-----|-----------|----------|
| `id` | integer | `student.id` | ID студента |
| `surname` | string | `student.lastName` | Фамилия (на самом деле!) |
| `lastname` | string | `student.firstName` | Имя (путаница в БД!) |
| `patronymic` | string | ❌ | Отчество (не используется) |
| `email` | string | `student.email` | Email |
| `dob` | date | `student.birthDate` | Дата рождения |
| `phone` | string | `student.phone` | Телефон студента |
| `phone_country` | string | ❌ | Код страны телефона |
| `balance` | decimal | `student.totalBalance.value`, `program.balance` | Баланс |
| `sum_aboniment` | integer | `program.tariff` | Стоимость абонемента |
| `date_finish` | date | `student.nextPay.date` | Дата окончания абонемента |
| `enabled` | boolean | → `student.status` | Активен ли студент |
| `blocked` | boolean | → `student.status` | Заблокирован ли |
| `deleted` | boolean | → `student.status` | Удален ли |
| `parent1_surname` | string | `student.parentLastName` | Фамилия родителя |
| `parent1_lastname` | string | `student.parentFirstName` | Имя родителя |
| `parent1_phone` | string | `student.parentPhone` | Телефон родителя |
| `parent1_phone_country` | string | `student.country` | Код страны |

### Дополнительная таблица: `student_payment`

| Поле БД | Тип | API Field | Описание |
|---------|-----|-----------|----------|
| `id` | integer | ❌ | ID платежа |
| `student_id` | integer | ↔ `student.id` | FK на студента |
| `date_pay` | date | `month.txDate` | Дата платежа |
| `date_finish` | date | ❌ | Дата окончания |
| `sum_aboniment` | integer | `month.a` | Сумма платежа |
| `aboniment_id` | integer | ❌ | FK на тариф |
| `type_pay` | string | ❌ | Тип оплаты (online/offline) |
| `discount` | integer | ❌ → `month.discAmt` | Размер скидки (не используется) |
| `comment` | string | ❌ | Комментарий |
| `enabled` | boolean | → `month.s`, `month.payStatus` | Оплачен ли |

---

## ⚠️ Проблемы и несоответствия

### 1. Путаница с именами полей
- В БД `surname` = фамилия, `lastname` = имя
- В API `lastName` = фамилия, `firstName` = имя
- **Решение:** В коде делается правильное сопоставление

### 2. Отрицательный возраст
```json
"age": -6.231670365820586
```
- **Причина:** Дата рождения в будущем (`2019-12-13`, а текущая дата `2026-03-07`)
- **Решение:** Добавить валидацию на backend

### 3. Отсутствующие поля
Следующие поля из MockDB не реализованы в API:
- ✅ `city`, `street`, `apartment`, `postalCode` - адрес
- ✅ `parentPassport` - паспорт родителя
- ✅ `photoConsent` - согласие на фото
- ✅ `regComment` - комментарий при регистрации
- ✅ `enrollments` - зачисления в группы
- ✅ `transactions` - список транзакций
- ✅ `extras` - дополнительные товары/услуги
- ✅ `disc`, `discAmt` - скидки по месяцам
- ✅ `lessons`, `totalLessons` - количество занятий
- ✅ `bonus`, `bonusDate` - бонусные месяцы

### 4. Упрощенная структура программ
- В MockDB может быть несколько программ (Space Memory, Speedy Mind Indigo, Extras)
- В API пока только одна программа на студента
- **Решение:** Требуется расширение базы данных

---

## 🔮 Рекомендации для улучшения

### Backend (PHP/Laravel):

1. **Исправить отрицательный возраст:**
```php
$age = $dob ? max(0, now()->diffInYears($dob)) : 0;
```

2. **Добавить недостающие поля в БД:**
- Таблица `student`: `city`, `street`, `apartment`, `postal_code`, `photo_consent`, `reg_comment`
- Таблица `student_enrollment`: для связи студент-группа-учитель

3. **Реализовать транзакции:**
- Брать из таблицы `student_payment`
- Форматировать для UI

4. **Добавить систему скидок:**
- Таблица `student_discount` с полями: `student_id`, `discount_type`, `discount_value`, `date_from`, `date_to`

5. **Множественные программы:**
- Связать студента с несколькими группами через `student_enrollment`
- Формировать отдельную программу для каждой группы

### Frontend (TypeScript/Vue):

1. **Валидация данных:**
```typescript
interface StudentProfile {
  age: number; // Всегда >= 0
  birthDate: string; // Валидация ISO 8601
}
```

2. **Обработка пустых полей:**
```typescript
const hasAddress = student.city || student.street || student.postalCode;
```

3. **Типы для статусов:**
```typescript
type StudentStatus = 'active' | 'inactive' | 'blocked' | 'deleted';
type MonthStatus = 'paid' | 'pending' | 'overdue' | 'future' | 'pause' | 'summer';
```

---

## 📊 Статистика соответствий

| Категория | Реализовано | Отсутствует | Всего |
|-----------|-------------|-------------|-------|
| **StudentProfile** | 16 полей | 9 полей | 25 |
| **Program** | 8 полей | 2 поля | 10 |
| **MonthObj** | 7 полей | 7 полей | 14 |

**Общий процент реализации:** ~63% (31 из 49 полей)

---

## 🔗 Связанные файлы

- Backend: `app/Http/Controllers/Api/Payments/PaymentController.php`
- Frontend: `src/api/mockDb.ts`
- Types: `src/api/mockDb.ts` (interfaces)
- Store: `src/stores/payments.store.ts`

---

## 📅 История изменений

| Дата | Версия | Изменения |
|------|--------|-----------|
| 2026-03-07 | 1.0 | Первая версия mapping файла |
| 2026-03-07 | 1.1 | Исправлены пути API с `/api/payments` на `/api/v1/payments` |
| 2026-03-07 | 1.2 | Добавлена обработка дат (Carbon) |
| 2026-03-07 | 1.3 | Создан файл соответствий |
| 2026-03-07 | 1.4 | ✨ Добавлена имитация программ как в mockDB |

### Версия 1.4 - Детали

**Добавлено:**
- Автоопределение типа программы по названию группы
- 5 типов программ с иконками и градиентами:
  - 🌌 Space Memory (память)
  - ⚡ Speedy Mind (ментальная арифметика)
  - 📖 Speed Reading (скорочтение)
  - ♟️ Logic & Chess (логика и шахматы)
  - 📚 Основная программа (по умолчанию)
- Подробный подзаголовок программы:
  - Название группы из `teacher_groups`
  - Расписание (день недели + время)
  - Имя учителя из `teacher`
  - Тариф с валютой
  - Информация о скидке

**Новые методы в PaymentController:**
- `detectProgramType()` - определяет тип программы
- `buildProgramSubtitle()` - формирует подзаголовок
- `getWeekDayFromGroup()` - получает день недели из расписания

**Используемые связи:**
- `Student::group()` → `TeacherGroup`
- `Student::teacher()` → `Teacher`

---

**Автор:** GitHub Copilot  
**Последнее обновление:** 2026-03-07

