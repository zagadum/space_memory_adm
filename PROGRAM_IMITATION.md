# 🎨 Имитация программ обучения в API

## Версия 1.4 - 2026-03-07

---

## ✨ Что нового

API `/api/v1/payments/student/{id}` теперь возвращает **реалистичные программы обучения**, как в mockDB!

### До (v1.3):
```json
{
  "name": "33 333",
  "sub": "Основная программа",
  "barGradient": "green"
}
```

### После (v1.4):
```json
{
  "name": "📚 Основная программа",
  "sub": "Группа1 · Пн 13:00 · Опять Тест · 1000 грн/мес · без скидки",
  "barGradient": "linear-gradient(180deg, #10b981, #059669)"
}
```

---

## 🎯 Типы программ

API автоматически определяет тип программы по названию группы:

### 1. 🌌 Space Memory
**Программа развития памяти**

- **Ключевые слова:** `memory`, `память`
- **Градиент:** `linear-gradient(180deg, #3b82f6, #8b5cf6)` (синий → фиолетовый)
- **Пример группы:** "Space Memory Junior", "Тренировка памяти"

### 2. ⚡ Speedy Mind
**Ментальная арифметика**

- **Ключевые слова:** `speedy`, `арифметика`, `абак`, `indigo`
- **Градиент:** `linear-gradient(180deg, #8b5cf6, #ec4899)` (фиолетовый → розовый)
- **Пример группы:** "Speedy Mind Indigo", "Ментальная арифметика"

### 3. 📖 Speed Reading
**Скорочтение**

- **Ключевые слова:** `reading`, `читання`
- **Градиент:** `linear-gradient(180deg, #f59e0b, #ef4444)` (оранжевый → красный)
- **Пример группы:** "Speed Reading Advanced", "Швидке читання"

### 4. ♟️ Logic & Chess
**Логика и шахматы**

- **Ключевые слова:** `logic`, `chess`, `шахмат`
- **Градиент:** `linear-gradient(180deg, #6366f1, #8b5cf6)` (индиго → фиолетовый)
- **Пример группы:** "Logic Games", "Шахматы для детей"

### 5. 📚 Основная программа
**По умолчанию (если не подходит под другие категории)**

- **Градиент:** `linear-gradient(180deg, #10b981, #059669)` (зеленый)
- **Пример группы:** "Группа1", "ИС-41", любое другое название

---

## 📝 Формирование подзаголовка

Формат: **`Группа · День Время · Учитель · Тариф · Скидка`**

### Компоненты:

| Компонент | Источник данных | Пример |
|-----------|----------------|--------|
| **Группа** | `teacher_groups.name` | "Группа1" |
| **День недели** | `teacher_groups.workday1-7` | "Пн" |
| **Время** | `teacher_groups.start_time` | "13:00" |
| **Учитель** | `teacher.surname + teacher.first_name` | "Опять Тест" |
| **Тариф** | `student.sum_aboniment + валюта` | "1000 грн/мес" |
| **Скидка** | `student.discount` или "без скидки" | "−10% семья" |

### Определение валюты:

- `student.parent1_phone_country === 'UA'` → **грн/мес**
- Иначе → **zł/мес**

### Определение дня недели:

Берется первый активный день из `teacher_groups.workday1-7`:
- `workday1 = true` → **Пн**
- `workday2 = true` → **Вт**
- `workday3 = true` → **Ср**
- `workday4 = true` → **Чт**
- `workday5 = true` → **Пт**
- `workday6 = true` → **Сб**
- `workday7 = true` → **Вс**

---

## 🔧 Реализация

### Backend (PHP/Laravel)

**Файл:** `app/Http/Controllers/Api/Payments/PaymentController.php`

#### Новые методы:

1. **`detectProgramType(?string $groupName): array`**
   - Определяет тип программы по названию группы
   - Возвращает: name, icon, gradient

2. **`buildProgramSubtitle($group, $teacher, $student): string`**
   - Формирует подробный подзаголовок
   - Использует данные из связанных таблиц

3. **`getWeekDayFromGroup($group): ?string`**
   - Извлекает день недели из расписания группы
   - Проверяет поля workday1-7

#### Используемые связи:

```php
$group = TeacherGroup::find($student->group_id);
$teacher = Teacher::find($student->teacher_id);
```

#### Алгоритм:

```php
// 1. Загрузить группу и учителя
$group = TeacherGroup::find($student->group_id);
$teacher = Teacher::find($student->teacher_id);

// 2. Определить тип программы
$programInfo = $this->detectProgramType($group ? $group->name : '');

// 3. Сформировать подзаголовок
$programSub = $this->buildProgramSubtitle($group, $teacher, $student);

// 4. Вернуть программу
return [
    'name' => $programInfo['icon'] . ' ' . $programInfo['name'],
    'sub' => $programSub,
    'barGradient' => $programInfo['gradient'],
    // ...
];
```

---

## 📊 Связанные таблицы

### `teacher_groups`
```sql
id, name, start_time, workday1-7, teacher_id
```

### `teacher`
```sql
id, surname, first_name
```

### `student`
```sql
id, group_id, teacher_id, sum_aboniment, discount, parent1_phone_country
```

---

## 🧪 Примеры

### Пример 1: Space Memory

**Группа:** "Space Memory Junior"

```json
{
  "id": "prog_123",
  "name": "🌌 Space Memory",
  "sub": "Space Memory Junior · Вт 17:00 · Клара Левит · 490 zł/мес · −10% семья",
  "barGradient": "linear-gradient(180deg, #3b82f6, #8b5cf6)"
}
```

### Пример 2: Speedy Mind

**Группа:** "Ментальная арифметика"

```json
{
  "id": "prog_456",
  "name": "⚡ Speedy Mind",
  "sub": "Ментальная арифметика · Ср 15:00 · Ханна Боян · 450 zł/мес · без скидки",
  "barGradient": "linear-gradient(180deg, #8b5cf6, #ec4899)"
}
```

### Пример 3: По умолчанию

**Группа:** "Группа1"

```json
{
  "id": "prog_40",
  "name": "📚 Основная программа",
  "sub": "Группа1 · Пн 13:00 · Опять Тест · 1000 грн/мес · без скидки",
  "barGradient": "linear-gradient(180deg, #10b981, #059669)"
}
```

---

## ✅ Преимущества

1. **Визуально привлекательно** - иконки и градиенты
2. **Информативно** - полная информация о программе
3. **Гибко** - автоматическое определение типа
4. **Расширяемо** - легко добавить новые типы программ
5. **Совместимо** - работает с mockDB структурой

---

## 🚀 Как использовать

### В frontend (Vue.js):

```typescript
import { paymentsApi } from './api/paymentsApi';

const { student, programs } = await paymentsApi.getStudentPayments('40');

// programs[0].name = "📚 Основная программа"
// programs[0].sub = "Группа1 · Пн 13:00 · ..."
// programs[0].barGradient = "linear-gradient(...)"
```

### Отображение в UI:

```vue
<div 
  class="program-card" 
  :style="{ background: program.barGradient }"
>
  <h3>{{ program.name }}</h3>
  <p class="subtitle">{{ program.sub }}</p>
  <div class="tariff">{{ program.tariff }} zł/мес</div>
</div>
```

---

## 🔮 Планы на будущее

- [ ] Добавить больше типов программ (робототехника, программирование, и т.д.)
- [ ] Реализовать множественные программы для одного студента
- [ ] Добавить иконки из базы данных
- [ ] Кастомизация градиентов через админ-панель
- [ ] Локализация названий программ

---

## 📚 Документация

- **API Mapping:** `API_MAPPING.md`
- **Примеры:** `api-mapping-examples.json`
- **Типы:** `src/types/api-mapping.ts`

---

**Версия:** 1.4  
**Дата:** 2026-03-07  
**Автор:** GitHub Copilot

