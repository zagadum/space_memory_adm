# 📚 Groups Tab - Полный сборник API и диалоговых окон

**Маршрут:** `/students/s_{studentId}/groups`  
**Дата:** 2026-03-06  
**Статус:** ✅ Готово  

---

## 📋 Обзор

Полный справочник по всем API методам и диалоговым окнам для работы с группами студента.

---

## 📁 Документация

| Файл | Описание | Размер |
|------|---------|--------|
| **API_GROUPS_GUIDE.md** | 📘 Полная справка | 400+ строк |
| **GROUPS_QUICK_REFERENCE.md** | ⚡ Шпаргалка | 300+ строк |
| **GROUPS_API_REFERENCE.ts** | 🔧 TypeScript типы | 400+ строк |

---

## 🔌 API Методы (10 шт.)

### GET методы (5)
```
1. getStudentGroups()        - Получить группы студента
2. getStudentInfo()          - Информация студента
3. getStudentAttendance()    - Посещаемость
4. getStudentProgress()      - Прогресс обучения
5. getStudentNotes()         - Заметки о студенте
```

### POST методы (5)
```
6. setAttendanceMark()       - Отметить явку
7. setTrainerPresence()      - Отметить тренера
8. changeStudentGroup()      - Переводить в другую группу
9. updateStudentInfo()       - Обновить информацию
10. createStudentNote()      - Создать заметку
```

---

## 🪟 Модальные окна (3 шт.)

| Modal | ID | Назначение |
|-------|----|-----------| 
| AttendanceModal | `attendance` | Отметить явку |
| AttendanceStatusModal | `attendance-status` | Статус явки |
| TrainerPresenceModal | `trainer-presence` | Присутствие тренера |

---

## 🎯 С чего начать?

### Быстрая справка (5 мин)
→ **GROUPS_QUICK_REFERENCE.md**

### Полная документация (30 мин)
→ **API_GROUPS_GUIDE.md**

### TypeScript типы (IDE)
→ **GROUPS_API_REFERENCE.ts**

---

## 📊 Таблица операций

| # | Операция | API | Modal | Компонент |
|---|----------|-----|-------|-----------|
| 1 | 🟢 Загрузить группы | `getStudentGroups()` | — | GroupsTab |
| 2 | ✓ Отметить явку | Локально | AttendanceModal | GroupsTab |
| 3 | 👤 Отметить тренера | `setTrainerPresence()` | TrainerPresenceModal | GroupsTab |
| 4 | 🔄 Переводить группу | `changeStudentGroup()` | — | PaymentTab |
| 5 | 📝 Создать заметку | `createStudentNote()` | — | — |

---

## 💾 Типы данных

### StudentGroup
```typescript
{
  school: string;              // Space Memory | Speedy Mind Indigo
  group: string;               // G1, G2, etc
  teacher: string;             // Имя тренера
  lessons: Lesson[];           // Список занятий
  enrollments: Enrollment[];   // История групп
}
```

### Lesson
```typescript
{
  id: string;
  date: string;                // YYYY-MM-DD
  theme: string;               // Тема занятия
  element: string;             // Элемент
  teacher: string;
  attendance: string;          // Присутствовал | Отсутствовал | Будет
  status: string;              // Оплачено | Ожидает | Отработка
}
```

---

## 🏗️ Архитектура

```
/students/s_{studentId}/groups
          ↓
    GroupsTab.vue
          ↓
  useStudentTabsStore()
          ↓
  getStudentGroups(studentId)
          ↓
  Рендер групп с таблицами занятий
          ├─ Статистика (всего, посещено, пропущено)
          ├─ Таблица уроков
          ├─ Точки явки (интерактивные)
          └─ История групп (timeline)
```

### Типичная операция: Отметить явку

```
Клик на точку явки
          ↓
openAttendanceModal()
          ↓
modal.openModal('attendance', params)
          ↓
AttendanceModal.vue
          ↓
Выбор "Присутствовал" или "Отсутствовал"
          ↓
Клик "Сохранить"
          ↓
lesson.attendance = новый статус (локально)
          ↓
modal.closeModal()
          ↓
UI обновляется
```

---

## 🔍 Быстрый поиск

### Нужна таблица методов?
→ **GROUPS_QUICK_REFERENCE.md** - раздел "Таблица API методов"

### Нужны примеры кода?
→ **API_GROUPS_GUIDE.md** - раздел "Примеры использования"

### Нужны типы для IDE?
→ **GROUPS_API_REFERENCE.ts**

### Нужна информация о модалях?
→ **GROUPS_QUICK_REFERENCE.md** - таблица "Модальные окна"

### Нужен Quick Start?
→ **GROUPS_QUICK_REFERENCE.md** - раздел "Quick Start для новой операции"

---

## 📝 Файловая структура

```
src/
├── api/
│   └── studentApi.ts           ← Все методы (10 шт.)
├── views/students/components/profile-tabs/
│   └── GroupsTab.vue           ← Главный компонент
├── modals/templates/
│   ├── AttendanceModal.vue
│   ├── AttendanceStatusModal.vue
│   └── TrainerPresenceModal.vue
├── stores/
│   └── studentTabs.store.ts    ← State management
└── locales/
    ├── en.json
    ├── ru.json
    ├── uk.json
    └── pl.json
```

---

## ✅ Контрольный список

Перед разработкой:
- [ ] Прочитал GROUPS_QUICK_REFERENCE.md
- [ ] Знаю где находятся API методы
- [ ] Знаю где находятся модальные окна
- [ ] Понимаю структуру GroupsTab.vue

При добавлении новой операции:
- [ ] Добавил API метод в studentApi.ts
- [ ] Создал Modal компонент (если нужно)
- [ ] Зарегистрировал модаль в modal.store.ts
- [ ] Добавил кнопку-триггер
- [ ] Добавил локализацию
- [ ] Протестировал

---

## 📞 Быстрые ссылки

| Нужно | Файл | Раздел |
|------|------|--------|
| Таблица методов | GROUPS_QUICK_REFERENCE.md | Таблица API методов |
| Примеры | API_GROUPS_GUIDE.md | Примеры использования |
| Типы | GROUPS_API_REFERENCE.ts | Все типы |
| Модали | GROUPS_QUICK_REFERENCE.md | Модальные окна |
| Quick Start | GROUPS_QUICK_REFERENCE.md | Quick Start |

---

## 🎓 Рекомендуемый порядок изучения

### День 1: Основы (1-2 часа)
1. Прочитайте GROUPS_QUICK_REFERENCE.md (20 мин)
2. Посмотрите API_GROUPS_GUIDE.md - примеры (20 мин)
3. Изучите GroupsTab.vue структуру (30 мин)
4. Посмотрите AttendanceModal.vue (20 мин)

### День 2: Углубление (1-2 часа)
1. Прочитайте API_GROUPS_GUIDE.md полностью (60 мин)
2. Изучите studentApi.ts все методы (30 мин)
3. Посмотрите studentTabs.store.ts (30 мин)

### День 3: Практика (2-3 часа)
1. Добавьте новый API метод
2. Создайте новое модальное окно
3. Интегрируйте в GroupsTab.vue

---

## 🌍 Поддерживаемые языки

- 🇬🇧 English (en.json)
- 🇷🇺 Русский (ru.json)
- 🇺🇦 Українська (uk.json)
- 🇵🇱 Polski (pl.json)

---

## 📊 Статистика

| Метрика | Значение |
|---------|----------|
| Файлов документации | 3 |
| Строк в документах | 1100+ |
| API методов | 10 |
| Модальных окон | 3 |
| Компонентов | 1 |
| Примеров кода | 5+ |
| Типов данных | 10+ |

---

## ✨ Особенности этого сборника

✅ **Полнота** - Охватывает все API групп  
✅ **Структурированность** - Логичное расположение  
✅ **Примеры** - 5+ готовых примеров  
✅ **Типизация** - Полная TypeScript поддержка  
✅ **Простота** - Легко найти нужное  

---

## 🚀 Следующие шаги

1. Откройте **GROUPS_QUICK_REFERENCE.md**
2. Выберите подходящий раздел
3. Следуйте инструкциям
4. Обращайтесь к документации по мере необходимости

---

**Документация готова!** 🎉


