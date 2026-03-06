# Groups Tab - Краткая шпаргалка

## 📊 Таблица API методов

| # | Метод | Endpoint | Компонент | Параметры |
|---|-------|----------|-----------|-----------|
| **Загрузка** | | | | |
| 1 | `getStudentGroups()` | GET `/api/student/groups` | GroupsTab | `studentId` |
| 2 | `getStudentInfo()` | GET `/api/student/info` | — | `studentId` |
| 3 | `getStudentAttendance()` | GET `/api/student/attendance` | — | `studentId` |
| 4 | `getStudentProgress()` | GET `/api/student/progress` | — | `studentId` |
| 5 | `getStudentNotes()` | GET `/api/student/notes` | — | `studentId` |
| **Операции** | | | | |
| 6 | `setAttendanceMark()` | POST `/api/student/attendance` | AttendanceModal | `studentId, attendanceId, mark, note` |
| 7 | `setTrainerPresence()` | POST `/api/student/trainer-presence` | TrainerPresenceModal | `studentId, groupId, trainerId, presence` |
| 8 | `changeStudentGroup()` | POST `/api/student/change-group` | GroupsTab | `studentId, programId, fromGroup, toGroup, reason` |
| 9 | `updateStudentInfo()` | POST `/api/student/info` | — | `studentId, patch` |
| 10 | `createStudentNote()` | POST `/api/student/notes` | — | `studentId, type, direction, category, status, tags, text` |

---

## 🪟 Модальные окна

| Модаль | ID | Триггер | API | Параметры |
|--------|----|---------|----|-----------|
| **AttendanceModal** | `attendance` | Клик на явку | Локально | `{ enrollmentId, studentId, schoolName, lessonId, lessonNum, date, currentAttendance, history }` |
| **AttendanceStatusModal** | `attendance-status` | ? | `setAttendanceMark()` | `{ studentId, attendanceId, mark }` |
| **TrainerPresenceModal** | `trainer-presence` | ? | `setTrainerPresence()` | `{ group, trainer }` |

---

## 🔌 Основные компоненты

### Структура вкладки Groups:

```
GroupsTab.vue (загрузка & отображение)
├── Для каждой группы:
│   ├── Заголовок группы (иконка + название)
│   ├── Статистика посещений (всего, посещено, пропущено)
│   ├── Таблица занятий
│   │   └── Точки явки (интерактивные)
│   │       └── modal('attendance')
│   └── История групп (timeline)
```

---

## 📝 Параметры для modal.openModal()

### Явка
```typescript
modal.openModal('attendance', {
  enrollmentId: 'Space Memory',         // школа
  studentId: 's_2',                     // ID студента
  schoolName: 'Space Memory',           // Название школы
  lessonId: 'lesson_001',               // ID урока
  lessonNum: 10,                        // Номер урока (сквозный)
  date: '2026-03-06',                   // Дата
  currentAttendance: 'Присутствовал',   // Текущий статус
  history: [                            // История изменений
    { author: 'John Doe', date: '2026-03-06', action: 'Отмечено: Присутствовал' }
  ]
})
```

### Статус явки
```typescript
modal.openModal('attendance-status', {
  studentId: 's_2',
  attendanceId: 'att_001',
  currentMark: 'Присутствовал'
})
```

### Присутствие тренера
```typescript
modal.openModal('trainer-presence', {
  group: {
    id: 'grp_001',
    school: 'Space Memory',
    group: 'G1',
    programTitle: 'Space Memory',
    trainers: [...]
  },
  trainer: {
    id: 'tr_001',
    name: 'John Doe',
    presence: 'present'
  }
})
```

---

## 💾 Типы данных для payload

### Явка
```typescript
{
  studentId: string;           // "s_2"
  attendanceId: string;        // "att_001"
  mark: string;                // "Присутствовал" | "Отсутствовал" | "Болел" | "Опоздал"
  note?: string;               // Дополнительная информация
}
```

### Присутствие тренера
```typescript
{
  studentId: string;           // "s_2"
  groupId: string;             // "grp_001"
  trainerId: string;           // "tr_001"
  presence: string;            // "present" | "absent" | "late" | "makeup"
}
```

### Изменение группы
```typescript
{
  studentId: string;           // "s_2"
  programId: string;           // "prog_001"
  fromGroup: string;           // "G1"
  toGroup: string;             // "G2"
  reason?: string;             // "Student request" (опционально)
}
```

### Заметка
```typescript
{
  studentId: string;           // "s_2"
  type: string;                // "observation" | "improvement" | "warning" | "achievement"
  direction: string;           // "positive" | "neutral" | "negative"
  category: string;            // Категория
  status: string;              // Статус
  tags: string[];              // Теги
  text: string;                // Текст заметки
}
```

---

## 🐛 Типичные ошибки и решения

| Ошибка | Причина | Решение |
|--------|---------|---------|
| Modal не открывается | ID не совпадает | Проверить ID в modal.store.ts и ModalHost.vue |
| Данные не загружаются | getStudentGroups не вызвана | Убедиться что loadGroups вызывается в useEffect |
| Явка не сохраняется | Нет API вызова | AttendanceModal работает локально, обновляет только UI |
| Тренер не отмечается | API ошибка | Проверить setTrainerPresence payload |

---

## 🎯 Quick Start для новой операции

### Шаг 1: Добавить API метод
```typescript
// src/api/studentApi.ts
export async function myNewOperation(payload: MyPayload) {
  const res = await http.post("/api/student/my-op", payload);
  return res.data as { ok: boolean };
}
```

### Шаг 2: Создать Modal (если нужно)
```vue
<!-- src/modals/templates/MyOperationModal.vue -->
<template>
  <BaseModal @close="close">
    <!-- форма -->
  </BaseModal>
</template>
<script setup lang="ts">
import { myNewOperation } from "@/api/studentApi";
import { useStudentTabsStore } from "@/stores/studentTabs.store";

const tabs = useStudentTabsStore();
async function save() {
  await myNewOperation(payload);
  await tabs.loadGroups(studentId);
  modal.close();
}
</script>
```

### Шаг 3: Регистрировать модаль
```typescript
// src/stores/modal.store.ts
export type ModalId = "my-operation" | ...;

// src/modals/ModalHost.vue
<MyOperationModal v-else-if="openId === 'my-operation'" />
```

### Шаг 4: Добавить кнопку/триггер
```vue
<!-- src/views/students/components/profile-tabs/GroupsTab.vue -->
<button @click="modal.openModal('my-operation', { studentId })">
  🎯 {{ t("groups.btn.myOperation") }}
</button>
```

### Шаг 5: Добавить локализацию
```json
// locales/en.json
{
  "groups": {
    "btn": {
      "myOperation": "My Operation"
    }
  }
}
```

---

## 📚 Файлы для изучения

1. **API интеграция**
   - `src/api/studentApi.ts` - все методы
   - `src/api/http.ts` - HTTP клиент
   - `src/api/mockDb.ts` - типы данных

2. **Хранилище**
   - `src/stores/studentTabs.store.ts` - состояние групп
   - `src/stores/modal.store.ts` - состояние модалей

3. **Компоненты**
   - `src/views/students/components/profile-tabs/GroupsTab.vue`

4. **Модали**
   - `src/modals/ModalHost.vue` - маршрутизатор
   - `src/modals/templates/AttendanceModal.vue`
   - `src/modals/templates/AttendanceStatusModal.vue`
   - `src/modals/templates/TrainerPresenceModal.vue`

5. **Конфигурация**
   - `src/locales/*.json` - локализация
   - `.env.local` - переменные окружения

---

## 🚀 Полезные команды

```bash
# Запуск с Mock API
npm run dev

# Запуск с реальным API
VITE_USE_MOCK=false npm run dev

# Проверка типов TypeScript
npm run type-check

# Сборка для production
npm run build
```

---

## 📞 Контакты и ссылки

- **Документация API:** `API_GROUPS_GUIDE.md`
- **TypeScript References:** `GROUPS_API_REFERENCE.ts`
- **Маршрут:** `/students/s_{studentId}/groups`
- **Mock Adapter:** `src/api/mockAdapter.ts`

---

## 🧪 Режимы тестирования

```bash
# Mock API (заглушка с имитацией ответов)
VITE_USE_MOCK=true
VITE_API_BASE_URL=http://localhost:3000

# Реальный API
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://your-api-server.com
```

В `.env.local`:
```dotenv
VITE_USE_MOCK=true
VITE_API_BASE_URL=http://localhost:3000
```

---

## 📊 Статусы и константы

### Явка
- `Присутствовал` - зеленый ✓
- `Отсутствовал` - красный ✕
- `Будет` - серый –
- `Болел` - оранжевый 🤒
- `Опоздал` - желтый ⏱

### Платежи
- `Оплачено` - зеленый
- `Ожидает` - синий
- `Отработка` - голубой

### Присутствие тренера
- `present` - присутствовал
- `absent` - отсутствовал
- `late` - опоздал
- `makeup` - отработка

### Школы
- `Space Memory` - мозг 🧠
- `Speedy Mind Indigo` - молния ⚡


