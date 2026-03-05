# API для вкладки "Группы" (Groups Tab)

## 📋 Обзор

Полный справочник по всем API методам и диалоговым окнам для работы с группами студента на странице `/students/s_{studentId}/groups`.

---

## 🔌 API Методы

### 1. **Получение групп студента**
```typescript
getStudentGroups(studentId: string): Promise<{ items: any[] }>
```
- **Endpoint:** `GET /api/student/groups?studentId={studentId}`
- **Описание:** Загружает все группы обучения студента с деталями
- **Параметры:**
  - `studentId` - ID студента (например: "s_2")
- **Возвращает:**
  ```typescript
  {
    items: [
      {
        school: string;              // Название школы (Space Memory | Speedy Mind Indigo)
        group: string;               // Код группы
        teacher: string;             // Имя тренера
        lessons: Lesson[];           // Список занятий
        enrollments: Enrollment[];   // История групп
      }
    ]
  }
  ```
- **Использование:** Вызывается при загрузке таба GroupsTab.vue
- **Store:** `studentTabs.store.ts` → `loadGroups(studentId)`

---

### 2. **Изменение группы студента**
```typescript
changeStudentGroup(payload: {
  studentId: string;
  programId: string;
  fromGroup: string;
  toGroup: string;
  reason?: string;
}): Promise<{ ok: true }>
```
- **Endpoint:** `POST /api/student/change-group`
- **Описание:** Переводит студента в другую группу
- **Параметры:**
  - `studentId` - ID студента
  - `programId` - ID программы обучения
  - `fromGroup` - текущая группа
  - `toGroup` - новая группа
  - `reason` - причина перевода (опционально)
- **Возвращает:** `{ ok: true }`
- **Использование:** Для изменения группы студента
- **Modal:** Может быть использовано при разделении группы (GroupSplitModal из платежей)

---

### 3. **Установка присутствия тренера**
```typescript
setTrainerPresence(payload: {
  studentId: string;
  groupId: string;
  trainerId: string;
  presence: string;
}): Promise<{ ok: true }>
```
- **Endpoint:** `POST /api/student/trainer-presence`
- **Описание:** Отмечает присутствие тренера на занятии
- **Параметры:**
  - `studentId` - ID студента
  - `groupId` - ID группы
  - `trainerId` - ID тренера
  - `presence` - статус (present | absent | late | makeup)
- **Возвращает:** `{ ok: true }`
- **Использование:** Из TrainerPresenceModal.vue
- **Modal:** TrainerPresenceModal.vue

---

## 👥 Информация о студенте

### 4. **Получение информации студента**
```typescript
getStudentInfo(studentId: string): Promise<{ info: any }>
```
- **Endpoint:** `GET /api/student/info?studentId={studentId}`
- **Описание:** Загружает основную информацию о студенте
- **Параметры:**
  - `studentId` - ID студента
- **Возвращает:** Информация профиля студента

---

### 5. **Обновление информации студента**
```typescript
updateStudentInfo(payload: {
  studentId: string;
  patch: any;
}): Promise<{ ok: true; info: any }>
```
- **Endpoint:** `POST /api/student/info`
- **Описание:** Обновляет информацию о студенте
- **Параметры:**
  - `studentId` - ID студента
  - `patch` - объект с полями для изменения
- **Возвращает:** Обновленная информация

---

## 📊 Посещаемость

### 6. **Получение посещаемости студента**
```typescript
getStudentAttendance(studentId: string): Promise<{ attendance: any }>
```
- **Endpoint:** `GET /api/student/attendance?studentId={studentId}`
- **Описание:** Загружает данные о посещаемости
- **Параметры:**
  - `studentId` - ID студента
- **Возвращает:** Данные о посещении занятий

---

### 7. **Установка отметки о посещении**
```typescript
setAttendanceMark(payload: {
  studentId: string;
  attendanceId: string;
  mark: string;
  note?: string;
}): Promise<{ ok: true }>
```
- **Endpoint:** `POST /api/student/attendance`
- **Описание:** Отмечает посещение/отсутствие на занятии
- **Параметры:**
  - `studentId` - ID студента
  - `attendanceId` - ID записи о посещении
  - `mark` - статус (Присутствовал | Отсутствовал)
  - `note` - заметка (опционально)
- **Возвращает:** `{ ok: true }`
- **Использование:** Из GroupsTab.vue при клике на точку явки
- **Modal:** AttendanceModal.vue или AttendanceStatusModal.vue

---

## 📈 Прогресс

### 8. **Получение прогресса студента**
```typescript
getStudentProgress(studentId: string): Promise<{ progress: any }>
```
- **Endpoint:** `GET /api/student/progress?studentId={studentId}`
- **Описание:** Загружает данные о прогрессе студента
- **Параметры:**
  - `studentId` - ID студента
- **Возвращает:** Данные о прогрессе обучения

---

## 📝 Заметки

### 9. **Получение заметок студента**
```typescript
getStudentNotes(studentId: string): Promise<{ items: any[] }>
```
- **Endpoint:** `GET /api/student/notes?studentId={studentId}`
- **Описание:** Загружает заметки о студенте
- **Параметры:**
  - `studentId` - ID студента
- **Возвращает:** Список заметок

---

### 10. **Создание заметки**
```typescript
createStudentNote(payload: {
  studentId: string;
  type: string;
  direction: string;
  category: string;
  status: string;
  tags: string[];
  text: string;
}): Promise<{ ok: true; note: any }>
```
- **Endpoint:** `POST /api/student/notes`
- **Описание:** Создает новую заметку о студенте
- **Параметры:**
  - `studentId` - ID студента
  - `type` - тип заметки
  - `direction` - направление (positive | neutral | negative)
  - `category` - категория
  - `status` - статус
  - `tags` - теги
  - `text` - текст заметки
- **Возвращает:** Созданная заметка

---

## 🪟 Диалоговые окна (Modals)

| Модаль | ID | Триггер | API Method | Параметры |
|--------|----|---------|----|-----------|
| **AttendanceModal** | `attendance` | GroupsTab (клик на точку явки) | Местное обновление | `{ enrollmentId, studentId, schoolName, lessonId, lessonNum, date, currentAttendance, history }` |
| **AttendanceStatusModal** | `attendance-status` | ? | `setAttendanceMark()` | `{ studentId, attendanceId, mark, note }` |
| **TrainerPresenceModal** | `trainer-presence` | GroupsTab (групповое окно) | `setTrainerPresence()` | `{ group, trainer }` |

---

## 📦 Store: studentTabs.store.ts

Основные методы для работы с группами:

```typescript
// Загрузка групп студента
await tabs.loadGroups(studentId)

// Загрузка посещаемости
await tabs.loadAttendance(studentId)

// Загрузка прогресса
await tabs.loadProgress(studentId)

// Загрузка заметок
await tabs.loadNotes(studentId)

// Получение текущего студента
tabs.student

// Получение текущей вкладки
tabs.activeTab
```

---

## 🎯 Типы данных

### Enrollment (Группа студента)
```typescript
{
  school: string;              // Space Memory | Speedy Mind Indigo
  group: string;               // G1, G2, etc
  teacher: string;             // Имя тренера
  lessons: Lesson[];           // Список всех занятий
}
```

### Lesson (Занятие)
```typescript
{
  id: string;
  date: string;                // YYYY-MM-DD
  theme: string;               // Тема занятия
  element: string;             // Элемент (для Indigo: 1, 10; для Space: Слова, Локации)
  teacher: string;             // Тренер
  attendance: string;          // Присутствовал | Отсутствовал | Будет
  status: string;              // Оплачено | Ожидает | Отработка
}
```

### GroupData
```typescript
{
  id: string;
  school: string;
  group: string;
  programTitle: string;
  trainers: Trainer[];
}
```

### Trainer
```typescript
{
  id: string;
  name: string;
  presence: string;            // present | absent | late | makeup
}
```

---

## 🔄 Поток данных

```
GroupsTab.vue (загрузка)
    ↓
tabs.loadGroups(studentId)
    ↓
studentApi.getStudentGroups(studentId)
    ↓
API: GET /api/student/groups?studentId={studentId}
    ↓
Заполнение store данными
    ↓
Рендер таблицы занятий для каждой группы
    ├─ Статистика посещений
    ├─ Таблица занятий
    ├─ История групп
    └─ Точки явки (клик → AttendanceModal)
```

### Типичная операция: Отметить явку

```
1. Клик на точку явки в таблице
   ↓
2. openAttendanceModal(enrollment, lesson, lessonNum)
   ↓
3. modal.openModal('attendance', { ... params ... })
   ↓
4. AttendanceModal.vue отображается
   ↓
5. Пользователь выбирает "Присутствовал" или "Отсутствовал"
   ↓
6. Клик "Сохранить"
   ↓
7. Локальное обновление lesson.attendance
   ↓
8. modal.closeModal()
   ↓
9. UI обновляется с новым статусом
```

---

## 📝 Локализация

Все тексты кнопок, заголовков и сообщений находятся в:
- `src/locales/en.json`
- `src/locales/ru.json`
- `src/locales/uk.json`
- `src/locales/pl.json`

Ключи для групп:
```json
{
  "groups": {
    "group": "Group",
    "lesson": "Lesson",
    "attendance": "Attendance",
    "present": "Present",
    "absent": "Absent",
    "status": "Status"
  },
  "attendance": {
    "present": "Present",
    "absent": "Absent",
    "late": "Late",
    "makeup": "Make-up"
  },
  "modals": {
    "attendance": {
      "title": "Attendance",
      "subtitle": "Mark lesson attendance"
    },
    "trainerPresence": {
      "title": "Trainer Presence",
      "subtitle": "Mark trainer presence",
      "trainer": "Trainer",
      "status": "Status"
    }
  }
}
```

---

## ✅ Контрольный список для разработчика

При добавлении новой функции для вкладки Группы:

- [ ] Добавить метод в `src/api/studentApi.ts`
- [ ] Создать Modal компонент в `src/modals/templates/` (если нужно)
- [ ] Добавить ID модали в `modal.store.ts`
- [ ] Добавить импорт и условие в `ModalHost.vue`
- [ ] Добавить кнопку/триггер в компонент (GroupsTab.vue)
- [ ] Добавить локализованный текст в `locales/*.json`
- [ ] Добавить обработку ошибок и валидацию
- [ ] Добавить `await tabs.loadGroups(studentId)` после успешного API вызова
- [ ] Тестировать с Mock API и реальным API

---

## 🚀 Примеры использования

### Пример 1: Отметить явку студента
```typescript
import { setAttendanceMark } from "@/api/studentApi";
import { useModalStore } from "@/stores/modal.store";

const modal = useModalStore();

// Открыть модаль
modal.openModal('attendance', { 
  studentId: 's_2',
  attendanceId: 'att_123',
  currentAttendance: 'Присутствовал'
});

// После выбора:
await setAttendanceMark({
  studentId: 's_2',
  attendanceId: 'att_123',
  mark: 'Присутствовал',
  note: 'Был внимателен'
});
```

### Пример 2: Отметить присутствие тренера
```typescript
import { setTrainerPresence } from "@/api/studentApi";

await setTrainerPresence({
  studentId: 's_2',
  groupId: 'grp_001',
  trainerId: 'tr_001',
  presence: 'present'
});
```

### Пример 3: Переводить студента в другую группу
```typescript
import { changeStudentGroup } from "@/api/studentApi";

await changeStudentGroup({
  studentId: 's_2',
  programId: 'prog_001',
  fromGroup: 'G1',
  toGroup: 'G2',
  reason: 'Student request'
});
```

---

## 📊 Таблица взаимодействий

| Компонент | API метод | Modal | Назначение |
|-----------|-----------|-------|-----------|
| GroupsTab.vue | getStudentGroups | — | Загрузить группы |
| GroupsTab.vue (явка) | — | AttendanceModal | Отметить явку |
| GroupsTab.vue (тренер) | setTrainerPresence | TrainerPresenceModal | Отметить тренера |
| Payments | changeStudentGroup | GroupSplitModal | Разделить группу |

---

## 🔍 Файловая структура

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

## 🎓 Рекомендуемый порядок изучения

1. **Структура GroupsTab.vue** - понять как рендерятся группы (20 мин)
2. **studentApi.ts** - все доступные методы (15 мин)
3. **AttendanceModal.vue** - как работает модаль явки (15 мин)
4. **studentTabs.store.ts** - состояние и методы (20 мин)
5. **Примеры использования** - готовые код-примеры (10 мин)

---

## 📌 Ключевые моменты

### Важные детали

1. **Явка отмечается локально** в AttendanceModal.vue, без запроса к API
2. **Тренер отмечается через API** с помощью setTrainerPresence()
3. **Группы загружаются при открытии таба** через loadGroups()
4. **История групп** отображается визуально в timeline

### Атрибуты статусов

**Явка:**
- `Присутствовал` (✓ зеленый)
- `Отсутствовал` (✕ красный)
- `Будет` (– серый)

**Статус платежа:**
- `Оплачено` (зеленый)
- `Ожидает` (синий)
- `Отработка` (голубой)

**Присутствие тренера:**
- `present` (✓ зеленый)
- `absent` (✕ красный)
- `late` (⏱ оранжевый)
- `makeup` (🔄 голубой)


