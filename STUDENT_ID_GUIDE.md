# 📌 Где передается `studentId` в приложении?

## Текущее состояние

В приложении `studentId` **жестко закодирован** как `"s_1"`:

```typescript
// src/tabs/PaymentsTab.vue - строка ~293
onMounted(() => {
  if (!payments.student) payments.loadStudent("s_1");  // ← Здесь!
});
```

Это одно из мест, где нужно изменить логику для получения реального `studentId`.

---

## 🎯 3 способа передачи `studentId`

### 1️⃣ **Через URL параметры (Route Params)** - ⭐ Рекомендуется

**Как это работает:**
- URL: `/payments/:studentId`
- Параметр передается в route
- Доступен через `route.params.studentId`

**Пример:**
```typescript
// router.ts
{
  path: "/",
  component: AppLayout,
  children: [
    { path: "payments/:studentId", name: "payments", component: PaymentsTab },
    { path: "groups/:studentId", name: "groups", component: GroupsTab },
    // ...
  ],
}

// PaymentsTab.vue
import { useRoute } from "vue-router";

export default {
  setup() {
    const route = useRoute();
    const studentId = route.params.studentId as string;  // ← Отсюда!
  }
}
```

**Плюсы:**
- ✅ URL содержит контекст (bookmarkable)
- ✅ Можно переходить между разными студентами
- ✅ Хранится в истории браузера

---

### 2️⃣ **Через Query параметры**

**Как это работает:**
- URL: `/payments?student=s_1`
- Параметр передается как query
- Доступен через `route.query.student`

**Пример:**
```typescript
import { useRoute } from "vue-router";

const route = useRoute();
const studentId = route.query.student as string;  // ← Отсюда!
```

**Плюсы:**
- ✅ Гибкий способ передачи доп. параметров
- ✅ Можно менять без изменения route

---

### 3️⃣ **Через глобальное состояние (Pinia Store)** - ⭐ Альтернатива

**Как это работает:**
- Создаем store для текущего студента
- Сохраняем `studentId` в состояние
- Доступен из любого компонента

**Пример:**
```typescript
// stores/student.store.ts
import { defineStore } from "pinia";

export const useStudentStore = defineStore("student", {
  state: () => ({
    currentStudentId: "s_1",
  }),
  actions: {
    setCurrentStudent(id: string) {
      this.currentStudentId = id;
    }
  }
});

// PaymentsTab.vue
import { useStudentStore } from "../stores/student.store";

const studentStore = useStudentStore();
const studentId = studentStore.currentStudentId;  // ← Отсюда!
```

**Плюсы:**
- ✅ Централизованное управление
- ✅ Доступен из любого компонента
- ✅ Можно сохранять в localStorage

---

## 🎓 Текущая реализация (что нужно изменить)

### Где используется studentId:

1. **PaymentsTab.vue** (строка ~293)
   ```typescript
   payments.loadStudent("s_1");  // ← Жестко закодировано
   ```

2. **Нужно также проверить в других табах:**
   - GroupsTab.vue
   - InfoTab.vue
   - AttendanceTab.vue
   - ProgressTab.vue
   - NotesTab.vue

### Как это выглядит в stores:

```typescript
// src/stores/payments.store.ts
export const usePaymentsStore = defineStore("payments", {
  actions: {
    async loadStudent(studentId: string) {  // ← Принимает studentId
      this.loading = true;
      try {
        const res = await paymentsApi.getStudentPayments(studentId);
        this.student = res.student;
        this.programs = res.programs;
      } catch (e: any) {
        this.error = e?.response?.data?.message || "Failed to load";
      } finally {
        this.loading = false;
      }
    }
  }
});
```

---

## 📊 Рекомендуемая архитектура

```
SignIn Page (Login)
    ↓
получаем token + user info
    ↓
сохраняем в auth.store
    ↓
перенаправляем на /payments/{studentId}  ← Передаем ID
    ↓
AppLayout загружает данные студента
    ↓
Все табы используют studentId из route.params
```

---

## 🛠️ Варианты решения

### Вариант A: Жестко закодировать (текущий - для тестирования)
```typescript
payments.loadStudent("s_1");
```
✅ Быстро для разработки
❌ Не работает для разных студентов

---

### Вариант B: Из URL (рекомендуется для production)
```typescript
// router.ts - обновить routes
{
  path: "payments/:studentId",
  name: "payments",
  component: PaymentsTab
}

// PaymentsTab.vue
onMounted(() => {
  const studentId = route.params.studentId;
  payments.loadStudent(studentId);
});
```

---

### Вариант C: Из Pinia Store (если нужен в нескольких местах)
```typescript
// stores/student.store.ts - новый store
const studentStore = defineStore("student", {
  state: () => ({ currentId: "s_1" })
});

// В компоненте
const studentId = useStudentStore().currentId;
```

---

## 🎯 Где именно нужно менять код:

### 1. **router.ts**
```typescript
// Было:
{ path: "payments", name: "payments", component: PaymentsTab }

// Нужно:
{ path: "payments/:studentId", name: "payments", component: PaymentsTab }
```

### 2. **Все табы** (PaymentsTab, GroupsTab, InfoTab и т.д.)
```typescript
// Было:
onMounted(() => {
  if (!payments.student) payments.loadStudent("s_1");
});

// Нужно:
onMounted(() => {
  const studentId = route.params.studentId;
  if (!payments.student) payments.loadStudent(studentId);
});
```

### 3. **AppLayout.vue** (если использует studentId)
Нужно проверить и обновить аналогично

---

## 📝 Примеры навигации

**Перейти на профиль студента:**
```typescript
import { useRouter } from "vue-router";

const router = useRouter();
router.push({ name: "payments", params: { studentId: "s_123" } });
```

**Из другого места:**
```typescript
// Если есть список студентов
students.forEach(student => {
  router.push({ 
    name: "payments", 
    params: { studentId: student.id } 
  });
});
```

---

## ⚠️ Важные замечания

1. **Аутентификация** - убедитесь что пользователь авторизован перед доступом
2. **Авторизация** - проверяйте что пользователь может доступить этого студента
3. **Query параметры** - если нужна доп. фильтрация (например год, месяц)

---

## 🔄 Полный flow авторизации

```
1. Пользователь входит в систему
   GET /api/auth/sign-in
   ↓
2. Получаем user info (если нужен default студент)
   GET /api/auth/me
   ↓
3. Перенаправляем на профиль студента
   router.push({ name: "payments", params: { studentId: "s_1" } })
   ↓
4. URL становится: /payments/s_1
   ↓
5. Компоненты читают studentId из route.params.studentId
   ↓
6. Загружаем данные студента через API
   await paymentsApi.getStudentPayments("s_1")
```

---

## 📋 Чек-лист для реализации

- [ ] Обновить router.ts добавить `:studentId` параметр
- [ ] Обновить PaymentsTab.vue - читать studentId из route
- [ ] Обновить GroupsTab.vue - читать studentId из route
- [ ] Обновить InfoTab.vue - читать studentId из route
- [ ] Обновить AttendanceTab.vue - читать studentId из route
- [ ] Обновить ProgressTab.vue - читать studentId из route
- [ ] Обновить NotesTab.vue - читать studentId из route
- [ ] Обновить AppLayout.vue если нужно
- [ ] Тестировать навигацию между разными студентами
- [ ] Обновить логику при входе (вставить правильный studentId)

---

**Версия:** 1.0  
**Последнее обновление:** 03.03.2026

