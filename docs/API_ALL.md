# 📚 API_ALL.md - Полная сводная документация

**Проект:** Memory ADM  
**Версия:** 1.0  
**Дата:** 2026-03-06  
**Язык:** TypeScript + Vue 3 + Axios  

---

## 📋 Содержание

1. [🎯 Введение](#-введение)
2. [🔐 Authentication API](#-authentication-api)
3. [💰 Payments API](#-payments-api)
4. [👥 Groups API](#-groups-api)
5. [📊 Student Info API](#-student-info-api)
6. [📅 Attendance API](#-attendance-api)
7. [📈 Progress API](#-progress-api)
8. [📝 Notes API](#-notes-api)
9. [🚀 New Groups (Recruitment) API](#-new-groups-recruitment-api)
10. [🪟 Модальные окна (16 шт.)](#-модальные-окна)
11. [🗂️ Архитектура и структура](#-архитектура-и-структура)
12. [⚙️ Конфигурация API](#-конфигурация-api)
13. [📖 Дополнительная документация](#-дополнительная-документация)

---

## 🎯 Введение

Это **полная сводная документация** всех API endpoints, методов и модальных окон проекта Memory ADM.

### Основные модули:
- **Authentication** (вход/выход, получение данных пользователя)
- **Payments** (платежи, тарифы, счета, возвраты, архивирование)
- **Groups** (группы студента, перевод между группами, тренеры)
- **Student Info** (личная информация студента)
- **Attendance** (посещаемость занятий)
- **Progress** (прогресс обучения)
- **Notes** (заметки о студенте)
- **New Groups** (создание новых групп, набор студентов)

### Статистика:
- **8 API модулей**
- **43+ API метода**
- **16 модальных окон**
- **6 основных страниц**
- **7 табов профиля студента**

---

## 🔐 Authentication API

### Файл: `src/api/authApi.ts`

### 1. POST `/api/auth/sign-in`
**Вход в систему (получение токена)**

**Входные данные:**
```typescript
{
  email: string;      // Email пользователя
  password: string;   // Пароль
}
```

**Выходные данные:**
```typescript
{
  token: string;      // JWT токен для авторизации
  user: {
    id: string;       // ID пользователя
    email: string;    // Email
    name: string;     // Имя
    role: string;     // Роль (admin, manager, teacher)
    initials: string; // Инициалы
  }
}
```

**Пример:**
```typescript
await authApi.signIn({
  email: "admin@example.com",
  password: "secret123"
});
```

**Статус коды:**
- `200 OK` - успешная авторизация
- `400 Bad Request` - отсутствуют email или password
- `401 Unauthorized` - неправильные учетные данные

---

### 2. GET `/api/auth/me`
**Получить информацию текущего пользователя**

**Требования:**
- Authorization header: `Bearer {token}`

**Выходные данные:**
```typescript
{
  id: string;
  email: string;
  name: string;
  role: string;
  initials: string;
}
```

**Пример:**
```typescript
const user = await authApi.me();
```

---

## 💰 Payments API

### Файл: `src/api/paymentsApi.ts`

**Маршрут:** `/students/:id/payments`  
**Компонент:** `PaymentsTab.vue`  
**Store:** `payments.store.ts`

### Загрузка данных (3 метода)

#### 1. GET `/api/payments/student/{studentId}`
**Загрузка платежей студента**

```typescript
paymentsApi.getStudentPayments(studentId: string)
```

**Возвращает:**
```typescript
{
  student: {
    id: string;
    name: string;
    email: string;
    phone: string;
    // ... другие поля профиля
  };
  programs: Program[];  // Массив программ обучения с балансами
}
```

**Используется в:** `PaymentsTab.vue`, `payments.store.ts`

---

#### 2. GET `/api/payments/transactions`
**Получение транзакций**

```typescript
paymentsApi.getTransactions(programId: string)
```

**Параметры:**
- `programId` - ID программы обучения

**Возвращает:**
```typescript
Transaction[] = [
  {
    id: string;
    date: string;
    type: "payment" | "refund" | "correction";
    amount: number;
    description: string;
  }
]
```

**Используется в:** `PaymentTransactions.vue`

---

#### 3. GET `/api/payments/ksef-invoices`
**Получение KSeF счетов**

```typescript
paymentsApi.getKsefInvoices(programId: string)
```

**Параметры:**
- `programId` - ID программы

**Возвращает:**
```typescript
KsefInvoice[] = [
  {
    id: string;
    fvnum: string;
    ksefNumber: string;
    status: "ok" | "pending" | "error";
    issueDate: string;
  }
]
```

**Используется в:** `PaymentMonthDetail.vue`

---

### Операции с платежами (11 методов)

#### 4. POST `/api/payments/refund`
**Возврат денег**

```typescript
paymentsApi.submitRefund(payload: {
  fvnum: string;           // Номер счета
  amount?: number;         // Сумма возврата
  reason?: string;         // Причина
  type?: string;           // Тип возврата
  description?: string;    // Описание
  method?: string;         // Метод возврата (transfer | cash)
  iban?: string;           // IBAN для перевода
})
```

**Модальное окно:** `RefundModal.vue` → `RefundOkModal.vue`  
**Кнопка в:** `PaymentMonthDetail.vue`

---

#### 5. POST `/api/payments/invoice`
**Редактирование счета**

```typescript
paymentsApi.editInvoice(payload: {
  programId: string;
  monthIndex?: number;
  year?: string;
  fvnum: string;
  ksef?: string;
  issueDate?: string;
  payDate?: string;
  amount?: number;
  serviceName?: string;
  buyerName?: string;
  buyerAddress?: string;
  buyerNip?: string;
})
```

**Модальное окно:** `EditInvoiceModal.vue`  
**Кнопка в:** `PaymentMonthDetail.vue`

---

#### 6. POST `/api/payments/correction`
**Коррекция баланса**

```typescript
paymentsApi.submitCorrection(payload: {
  programId: string;
  monthIndex?: number;
  year?: string;
  amount: number;
  note?: string;
  corrDate?: string;
})
```

**Модальное окно:** `KorektaModal.vue`  
**Кнопка в:** `PaymentMonthDetail.vue`

---

#### 7. POST `/api/payments/tariff`
**Изменение тарифа**

```typescript
paymentsApi.changeTariff(payload: {
  programId: string;
  value: number;
  fromMonthIndex: number;
})
```

**Модальное окно:** `TariffModal.vue`  
**Кнопка в:** `PaymentActions.vue`

---

#### 8. POST `/api/payments/pause`
**Установка паузы**

```typescript
paymentsApi.setPause(payload: {
  programId: string;
  from: string;          // Дата начала (YYYY-MM-DD)
  to: string;            // Дата окончания
  reason?: string;       // Причина
  comment?: string;      // Комментарий
})
```

**Модальное окно:** `PauseModal.vue`  
**Кнопка в:** `PaymentActions.vue`

---

#### 9. POST `/api/payments/discount`
**Применение скидки**

```typescript
paymentsApi.setDiscount(payload: {
  programId: string;
  kind: string;          // Тип скидки (percent | fixed)
  value: number;         // Размер скидки
  fromMonthIndex: number;
})
```

**Модальное окно:** `DiscountModal.vue`  
**Кнопка в:** `PaymentActions.vue`, `PaymentMonthDetail.vue`

---

#### 10. POST `/api/payments/extra`
**Добавление дополнительного занятия**

```typescript
paymentsApi.addExtra(payload: {
  programId: string;
  date: string;          // Дата (YYYY-MM-DD)
  title: string;         // Название
  amount: number;        // Сумма
})
```

**Модальное окно:** `ExtraModal.vue`  
**Кнопка в:** `PaymentActions.vue`

---

#### 11. POST `/api/payments/unlock`
**Разблокировка программы**

```typescript
paymentsApi.unlock(payload: {
  programId: string;
})
```

**Модальное окно:** `UnlockModal.vue`  
**Кнопка в:** `PaymentActions.vue`

---

#### 12. POST `/api/payments/archive`
**Архивирование программы**

```typescript
paymentsApi.archive(payload: {
  programId: string;
  reason?: string;
  endDate?: string;
  comment?: string;
})
```

**Модальное окно:** `ArchiveModal.vue`  
**Кнопка в:** `PaymentActions.vue`

---

#### 13. POST `/api/payments/split`
**Разделение группы**

```typescript
paymentsApi.split(payload: {
  programId: string;
  fromGroup: string;
  toGroup: string;
  effectiveDate: string;
})
```

**Модальное окно:** `GroupSplitModal.vue`  
**Кнопка в:** `PaymentActions.vue`, `PaymentMonthDetail.vue`

---

#### 14. POST `/api/payments/resume`
**Возобновление программы**

```typescript
paymentsApi.resume(payload: {
  programId: string;
})
```

**Модальное окно:** `ResumeModal.vue`  
**Кнопка в:** `PaymentActions.vue`, `PaymentMonthDetail.vue`

---

### Сводная таблица Payments API

| # | Метод | Endpoint | Modal | Компонент |
|---|-------|----------|-------|-----------|
| 1 | `getStudentPayments` | GET `/api/payments/student/{id}` | — | PaymentsTab |
| 2 | `getTransactions` | GET `/api/payments/transactions` | — | PaymentTransactions |
| 3 | `getKsefInvoices` | GET `/api/payments/ksef-invoices` | — | PaymentMonthDetail |
| 4 | `submitRefund` | POST `/api/payments/refund` | RefundModal | PaymentMonthDetail |
| 5 | `editInvoice` | POST `/api/payments/invoice` | EditInvoiceModal | PaymentMonthDetail |
| 6 | `submitCorrection` | POST `/api/payments/correction` | KorektaModal | PaymentMonthDetail |
| 7 | `changeTariff` | POST `/api/payments/tariff` | TariffModal | PaymentActions |
| 8 | `setPause` | POST `/api/payments/pause` | PauseModal | PaymentActions |
| 9 | `setDiscount` | POST `/api/payments/discount` | DiscountModal | PaymentActions |
| 10 | `addExtra` | POST `/api/payments/extra` | ExtraModal | PaymentActions |
| 11 | `unlock` | POST `/api/payments/unlock` | UnlockModal | PaymentActions |
| 12 | `archive` | POST `/api/payments/archive` | ArchiveModal | PaymentActions |
| 13 | `split` | POST `/api/payments/split` | GroupSplitModal | PaymentActions |
| 14 | `resume` | POST `/api/payments/resume` | ResumeModal | PaymentActions |

---

## 👥 Groups API

### Файл: `src/api/studentApi.ts`

**Маршрут:** `/students/:id/groups`  
**Компонент:** `GroupsTab.vue`  
**Store:** `studentTabs.store.ts`

### 1. GET `/api/student/groups`
**Получение групп студента**

```typescript
getStudentGroups(studentId: string)
```

**Параметры:**
- `studentId` - ID студента (например: "s_2")

**Возвращает:**
```typescript
{
  items: [
    {
      id: string;
      school: string;              // Название школы
      group: string;               // Код группы
      teacher: string;             // Имя тренера
      lessons: Lesson[];           // Список занятий
      enrollments: Enrollment[];   // История групп
    }
  ]
}
```

**Используется в:** `GroupsTab.vue`

---

### 2. POST `/api/student/change-group`
**Изменение группы студента**

```typescript
changeStudentGroup(payload: {
  studentId: string;
  programId: string;
  fromGroup: string;
  toGroup: string;
  reason?: string;
})
```

**Описание:** Переводит студента в другую группу

**Используется в:** Может быть связано с `GroupSplitModal.vue`

---

### 3. POST `/api/student/trainer-presence`
**Установка присутствия тренера**

```typescript
setTrainerPresence(payload: {
  studentId: string;
  groupId: string;
  trainerId: string;
  presence: "present" | "absent" | "late" | "makeup";
})
```

**Модальное окно:** `TrainerPresenceModal.vue`  
**Используется в:** `GroupsTab.vue`

---

## 📊 Student Info API

### Файл: `src/api/studentApi.ts`

**Маршрут:** `/students/:id/info`  
**Компонент:** `InfoTab.vue`  
**Store:** `studentTabs.store.ts`

### 1. GET `/api/student/info`
**Получение информации студента**

```typescript
getStudentInfo(studentId: string)
```

**Возвращает:**
```typescript
{
  info: {
    name: string;
    email: string;
    phone: string;
    birthDate?: string;
    address?: string;
    parents?: {
      mother?: string;
      father?: string;
    };
    // ... другие поля
  }
}
```

---

### 2. POST `/api/student/info`
**Обновление информации студента**

```typescript
updateStudentInfo(payload: {
  studentId: string;
  patch: Partial<StudentInfo>;
})
```

**Модальное окно:** `EditInfoModal.vue`  
**Описание:** Частичное обновление полей информации

---

## 📅 Attendance API

### Файл: `src/api/studentApi.ts`

**Маршрут:** `/students/:id/attendance`  
**Компонент:** `AttendanceTab.vue`  
**Store:** `studentTabs.store.ts`

### 1. GET `/api/student/attendance`
**Получение данных о посещаемости**

```typescript
getStudentAttendance(studentId: string)
```

**Возвращает:**
```typescript
{
  attendance: {
    items: [
      {
        id: string;
        date: string;
        group: string;
        mark: "present" | "absent" | "late" | "sick" | "excused";
        note?: string;
        changedBy?: string;
        changedAt?: string;
      }
    ]
  }
}
```

---

### 2. POST `/api/student/attendance`
**Установка отметки посещаемости**

```typescript
setAttendanceMark(payload: {
  studentId: string;
  attendanceId: string;
  mark: "present" | "absent" | "late" | "sick" | "excused";
  note?: string;
})
```

**Модальное окно:** `AttendanceModal.vue`, `AttendanceStatusModal.vue`  
**Описание:** Отметить явку студента на занятии

---

## 📈 Progress API

### Файл: `src/api/studentApi.ts`

**Маршрут:** `/students/:id/progress`  
**Компонент:** `ProgressTab.vue`  
**Store:** `studentTabs.store.ts`

### 1. GET `/api/student/progress`
**Получение прогресса обучения**

```typescript
getStudentProgress(studentId: string)
```

**Возвращает:**
```typescript
{
  progress: {
    skills: [
      {
        name: string;
        level: number;
        maxLevel: number;
      }
    ];
    achievements: string[];
    // ... другие показатели
  }
}
```

---

## 📝 Notes API

### Файл: `src/api/studentApi.ts`

**Маршрут:** `/students/:id/notes`  
**Компонент:** `NotesTab.vue`  
**Store:** `studentTabs.store.ts`

### 1. GET `/api/student/notes`
**Получение заметок о студенте**

```typescript
getStudentNotes(studentId: string)
```

**Возвращает:**
```typescript
{
  items: [
    {
      id: string;
      type: "note" | "task" | "event";
      status: "open" | "closed";
      category: string;
      who: string;        // Автор
      when: string;       // Дата и время
      title?: string;
      text: string;
      tags: string[];
    }
  ]
}
```

---

### 2. POST `/api/student/notes`
**Создание заметки**

```typescript
createStudentNote(payload: {
  studentId: string;
  type: "note" | "task" | "event";
  direction?: string;
  category: string;
  status: string;
  tags: string[];
  text: string;
})
```

**Описание:** Добавить новую заметку о студенте

---

## 🚀 New Groups (Recruitment) API

### Файл: `src/api/newGroupsApi.ts`

**Маршрут:** `/recruitment/new-groups`  
**Компонент:** `NewGroupsPage.vue`

### 1. GET `/api/new-groups`
**Получение списка новых групп**

```typescript
getNewGroups()
```

**Возвращает:**
```typescript
{
  items: NewGroup[];
}
```

---

### 2. GET `/api/new-groups/students`
**Получение студентов группы**

```typescript
getNewGroupStudents(groupId: number)
```

**Параметры:**
- `groupId` - ID группы

---

### 3. GET `/api/new-groups/master-students`
**Получение мастер-списка студентов**

```typescript
getMasterStudents()
```

**Описание:** Все доступные студенты для добавления в группы

---

### 4. GET `/api/new-groups/teachers`
**Получение списка тренеров**

```typescript
getTeachers()
```

---

### 5. POST `/api/new-groups/create`
**Создание новой группы**

```typescript
createNewGroup(payload: {
  name: string;
  type: "group" | "individual";
  day: string;
  time: string;
  startDate: string;
  age: string | null;
  teacherId: number | null;
  studentIds: number[];
})
```

**Модальное окно:** `CreateGroupModal.vue`

---

### 6. POST `/api/new-groups/start`
**Запуск группы**

```typescript
startGroup(groupId: number)
```

**Модальное окно:** `StartGroupModal.vue`  
**Описание:** Перевести группу из статуса "новая" в "активная"

---

### 7. POST `/api/new-groups/delete`
**Удаление новой группы**

```typescript
deleteNewGroup(groupId: number)
```

---

### 8. POST `/api/new-groups/add-students`
**Добавление студентов в группу**

```typescript
addStudentsToGroup(payload: {
  groupId: number;
  studentIds: number[];
})
```

---

### 9. POST `/api/new-groups/remove-student`
**Удаление студента из группы**

```typescript
removeStudentFromGroup(payload: {
  groupId: number;
  studentName: string;
})
```

---

## 🪟 Модальные окна

### Файлы: `src/modals/templates/*.vue`

Всего: **16 модальных окон**

### Payments (12 окон)

| # | ID | Компонент | Описание | API метод |
|---|----|-----------| ---------|-----------|
| 1 | `pause` | `PauseModal.vue` | Пауза на обучение | `setPause()` |
| 2 | `discount` | `DiscountModal.vue` | Применить скидку | `setDiscount()` |
| 3 | `tariff` | `TariffModal.vue` | Изменить тариф | `changeTariff()` |
| 4 | `extra` | `ExtraModal.vue` | Добавить доп. занятие | `addExtra()` |
| 5 | `unlock` | `UnlockModal.vue` | Разблокировать | `unlock()` |
| 6 | `groupSplit` | `GroupSplitModal.vue` | Разделить группу | `split()` |
| 7 | `archive` | `ArchiveModal.vue` | Архивировать | `archive()` |
| 8 | `resume` | `ResumeModal.vue` | Возобновить | `resume()` |
| 9 | `refund` | `RefundModal.vue` | Возврат денег (шаг 1) | — |
| 10 | `refund-ok` | `RefundOkModal.vue` | Возврат денег (шаг 2) | `submitRefund()` |
| 11 | `edit-invoice` | `EditInvoiceModal.vue` | Редактировать счет | `editInvoice()` |
| 12 | `korekta` | `KorektaModal.vue` | Коррекция баланса | `submitCorrection()` |

### Groups (2 окна)

| # | ID | Компонент | Описание | API метод |
|---|----|-----------| ---------|-----------|
| 13 | `attendance` | `AttendanceModal.vue` | Отметка посещаемости | `setAttendanceMark()` |
| 14 | `attendance-status` | `AttendanceStatusModal.vue` | Статус посещаемости | — |

### Student Info (1 окно)

| # | ID | Компонент | Описание | API метод |
|---|----|-----------| ---------|-----------|
| 15 | `edit-info` | `EditInfoModal.vue` | Редактировать инфо | `updateStudentInfo()` |

### Trainer (1 окно)

| # | ID | Компонент | Описание | API метод |
|---|----|-----------| ---------|-----------|
| 16 | `trainer-presence` | `TrainerPresenceModal.vue` | Отметка тренера | `setTrainerPresence()` |

---

### Открытие модального окна

```typescript
import { useModalStore } from "@/stores/modal.store";

const modal = useModalStore();

// Пример 1: Простое открытие
modal.open("pause");

// Пример 2: С параметрами
modal.open("discount", {
  programId: "prog_123",
  currentValue: 100
});

// Пример 3: Закрытие
modal.close();
```

---

## 🗂️ Архитектура и структура

### Структура проекта

```
src/
├── api/                          # API модули
│   ├── authApi.ts               # Аутентификация
│   ├── paymentsApi.ts           # Платежи
│   ├── studentApi.ts            # Студенты (группы, инфо, посещаемость)
│   ├── newGroupsApi.ts          # Новые группы (recruitment)
│   ├── http.ts                  # Axios client с маршрутизацией mock/real
│   ├── httpClient.ts            # Альтернативный клиент
│   ├── mockAdapter.ts           # Mock API router
│   ├── mockDb.ts                # Mock данные (студенты, платежи)
│   └── mockNewGroupsDb.ts       # Mock данные (новые группы)
│
├── stores/                       # Pinia stores
│   ├── auth.store.ts            # Аутентификация
│   ├── payments.store.ts        # Платежи
│   ├── studentTabs.store.ts     # Табы профиля студента
│   ├── modal.store.ts           # Модальные окна
│   └── ...
│
├── views/                        # Страницы
│   ├── auth/                    # Страницы авторизации
│   ├── dashboard/               # Дашборд
│   ├── students/                # Страницы студентов
│   │   ├── StudentListPage.vue
│   │   ├── StudentProfilePage.vue
│   │   └── components/profile-tabs/
│   │       ├── PaymentsTab.vue
│   │       ├── GroupsTab.vue
│   │       ├── InfoTab.vue
│   │       ├── AttendanceTab.vue
│   │       ├── ProgressTab.vue
│   │       └── NotesTab.vue
│   ├── groups/                  # Новые группы
│   │   └── NewGroupsPage.vue
│   └── finance/                 # Финансы и настройки
│       └── settings/
│
└── modals/                       # Модальные окна
    ├── BaseModal.vue            # Базовый компонент
    ├── ModalHost.vue            # Роутер модалей
    └── templates/               # 16 шаблонов модалей
        ├── PauseModal.vue
        ├── DiscountModal.vue
        ├── TariffModal.vue
        └── ...
```

---

### Потоки данных (Data Flow)

#### Payments Tab
```
1. User → PaymentsTab.vue
2. onMounted → payments.loadStudent()
3. payments.store → paymentsApi.getStudentPayments()
4. http.ts → mock/real routing
5. Response → payments.store.state
6. Reactive UI update
```

#### Modal Operation
```
1. User clicks button → modal.open("pause", data)
2. ModalHost.vue → renders PauseModal.vue
3. User fills form → submit()
4. PauseModal → paymentsApi.setPause()
5. Success → payments.loadStudent()
6. modal.close()
7. UI refresh
```

---

## ⚙️ Конфигурация API

### Смешанный режим Mock/Real API

**Файл:** `src/api/http.ts`

#### Переменные окружения (.env)

```bash
# Глобальный режим (по умолчанию mock или real)
VITE_USE_MOCK=true

# Базовый URL для реальных запросов
VITE_API_BASE_URL=https://memory.firm.kiev.ua

# Префиксы для mock-only запросов (разделенные запятой)
VITE_MOCK_ONLY=api/student/groups,api/payments/refund

# Префиксы для real-only запросов (имеет приоритет)
VITE_REAL_ONLY=api/auth
```

#### Примеры конфигурации

**Вариант 1: Всё mock (разработка)**
```bash
VITE_USE_MOCK=true
```

**Вариант 2: Всё real (продакшен)**
```bash
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://memory.firm.kiev.ua/api
```

**Вариант 3: Смешанный режим (auth real, остальное mock)**
```bash
VITE_USE_MOCK=true
VITE_API_BASE_URL=https://memory.firm.kiev.ua
VITE_REAL_ONLY=api/auth
```

**Вариант 4: Почти всё real, кроме payments**
```bash
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://memory.firm.kiev.ua
VITE_MOCK_ONLY=api/payments
```

---

### Маршрутизация по префиксам

Логика в `src/api/http.ts`:

1. Если URL в `VITE_REAL_ONLY` → **real API**
2. Если URL в `VITE_MOCK_ONLY` → **mock API**
3. Иначе → используется `VITE_USE_MOCK` (по умолчанию)

**Примечание:** Префиксы указываются **без ведущего слеша** и разделяются **запятой**.

---

### HTTP клиенты

В проекте 2 HTTP клиента:

1. **`http`** (`src/api/http.ts`)
   - Используется в `authApi`, `paymentsApi`, `studentApi`, `newGroupsApi`
   - Поддерживает mock/real routing
   - Добавляет Authorization header автоматически

2. **`httpClient`** (`src/api/httpClient.ts`)
   - Альтернативный клиент
   - Используется в некоторых stores
   - Имеет interceptors для loading state и 401 handling

---

## 📖 Дополнительная документация

### По модулям

| Модуль | Файлы документации |
|--------|-------------------|
| **Payments** | `API_PAYMENTS_GUIDE.md` (520+ строк)<br>`PAYMENTS_QUICK_REFERENCE.md` (365+ строк)<br>`PAYMENTS_ARCHITECTURE.md`<br>`PAYMENTS_INDEX.md`<br>`PAYMENTS_API_REFERENCE.ts` |
| **Groups** | `API_GROUPS_GUIDE.md` (513+ строк)<br>`GROUPS_QUICK_REFERENCE.md` (300+ строк)<br>`GROUPS_INDEX.md`<br>`GROUPS_API_REFERENCE.ts` |
| **General** | `API.md` (1587+ строк)<br>`API_CONFIGURATION.md`<br>`DOCUMENTATION_MAP.md` |

---

### Рекомендации по изучению

#### Новичок в проекте (2 часа)
1. Прочитать: `API_ALL.md` (этот файл) — 30 мин
2. Прочитать: `PAYMENTS_INDEX.md` — 15 мин
3. Прочитать: `GROUPS_INDEX.md` — 15 мин
4. Посмотреть: `PAYMENTS_ARCHITECTURE.md` — 20 мин
5. Изучить: Один компонент (`PaymentsTab.vue`) — 40 мин

#### Разработчик (быстрая справка)
- Использовать: `PAYMENTS_QUICK_REFERENCE.md`
- Использовать: `GROUPS_QUICK_REFERENCE.md`
- Копировать типы: `PAYMENTS_API_REFERENCE.ts`, `GROUPS_API_REFERENCE.ts`

#### Архитектор (глубокое погружение)
1. Прочитать: `API_PAYMENTS_GUIDE.md` — 60 мин
2. Прочитать: `API_GROUPS_GUIDE.md` — 60 мин
3. Изучить: `PAYMENTS_ARCHITECTURE.md` — 30 мин
4. Изучить: Исходный код всех API модулей — 2 часа

---

## 📊 Итоговая статистика

### API

| Модуль | Файл | Методов |
|--------|------|---------|
| Auth | `authApi.ts` | 2 |
| Payments | `paymentsApi.ts` | 14 |
| Student Groups | `studentApi.ts` | 3 |
| Student Info | `studentApi.ts` | 2 |
| Attendance | `studentApi.ts` | 2 |
| Progress | `studentApi.ts` | 1 |
| Notes | `studentApi.ts` | 2 |
| New Groups | `newGroupsApi.ts` | 9 |
| **Итого** | | **35** |

### Модальные окна

| Категория | Окон |
|-----------|------|
| Payments | 12 |
| Groups | 2 |
| Student Info | 1 |
| Trainer | 1 |
| **Итого** | **16** |

### Компоненты и страницы

| Тип | Количество |
|-----|------------|
| Основные страницы | 6 |
| Табы профиля студента | 6 |
| API модули | 4 |
| Stores | 8+ |
| Модальные окна | 16 |

---

## 🚀 Quick Start

### Добавление нового API метода

1. **Определить endpoint**
   ```typescript
   // src/api/paymentsApi.ts
   async myNewMethod(payload: MyPayload) {
     const { data } = await http.post("api/payments/my-endpoint", payload);
     return data;
   }
   ```

2. **Создать модальное окно (опционально)**
   ```vue
   <!-- src/modals/templates/MyModal.vue -->
   <template>
     <BaseModal @close="modal.close()">
       <!-- form -->
     </BaseModal>
   </template>
   ```

3. **Зарегистрировать модаль**
   ```typescript
   // src/stores/modal.store.ts
   export type ModalId = "my-modal" | ...
   
   // src/modals/ModalHost.vue
   <MyModal v-else-if="openId === 'my-modal'" />
   ```

4. **Добавить кнопку**
   ```vue
   <button @click="modal.open('my-modal', { data })">
     {{ t("payments.btn.myAction") }}
   </button>
   ```

5. **Добавить локализацию**
   ```json
   // locales/en.json, ru.json, pl.json, uk.json
   {
     "payments": {
       "btn": {
         "myAction": "My Action"
       }
     }
   }
   ```

---

## ✅ Контрольный список

### Перед началом работы
- [ ] Прочитал `API_ALL.md`
- [ ] Знаю где находятся API модули
- [ ] Знаю где находятся модальные окна
- [ ] Понимаю структуру проекта
- [ ] Настроил `.env` (mock/real режим)

### При добавлении нового функционала
- [ ] Определил endpoint и метод API
- [ ] Создал/обновил API функцию
- [ ] Создал модальное окно (если нужно)
- [ ] Зарегистрировал модаль в `ModalHost.vue`
- [ ] Добавил кнопку/триггер
- [ ] Добавил локализацию (4 языка: ru, en, pl, uk)
- [ ] Обновил store (если нужно)
- [ ] Протестировал в mock режиме
- [ ] Протестировал с real API

### Code Review
- [ ] Все типы TypeScript корректны
- [ ] Локализация добавлена для всех языков
- [ ] Обработаны ошибки
- [ ] Добавлены loading states
- [ ] UI обновляется после операции

---

## 🎯 Быстрые ответы

### Где найти...?

**...все API методы для Payments?**  
→ `API_PAYMENTS_GUIDE.md` или раздел [Payments API](#-payments-api)

**...все API методы для Groups?**  
→ `API_GROUPS_GUIDE.md` или раздел [Groups API](#-groups-api)

**...примеры кода?**  
→ `PAYMENTS_QUICK_REFERENCE.md`, `GROUPS_QUICK_REFERENCE.md`

**...TypeScript типы?**  
→ `PAYMENTS_API_REFERENCE.ts`, `GROUPS_API_REFERENCE.ts`

**...архитектурные диаграммы?**  
→ `PAYMENTS_ARCHITECTURE.md`

**...конфигурацию mock/real API?**  
→ Раздел [Конфигурация API](#-конфигурация-api)

**...список модальных окон?**  
→ Раздел [Модальные окна](#-модальные-окна)

---

## 🔗 Связанные файлы

```
docs/
├── API_ALL.md                        ← ВЫ ЗДЕСЬ (сводка всех API)
├── API.md                            ← Детальная документация (1587 строк)
├── API_CONFIGURATION.md              ← Конфигурация API
├── API_PAYMENTS_GUIDE.md             ← Payments подробно (520 строк)
├── API_GROUPS_GUIDE.md               ← Groups подробно (513 строк)
├── PAYMENTS_QUICK_REFERENCE.md       ← Payments шпаргалка
├── GROUPS_QUICK_REFERENCE.md         ← Groups шпаргалка
├── PAYMENTS_ARCHITECTURE.md          ← Диаграммы Payments
├── PAYMENTS_INDEX.md                 ← Индекс Payments
├── GROUPS_INDEX.md                   ← Индекс Groups
├── PAYMENTS_API_REFERENCE.ts         ← TypeScript типы Payments
├── GROUPS_API_REFERENCE.ts           ← TypeScript типы Groups
├── DOCUMENTATION_MAP.md              ← Карта документации
└── READY_TO_USE.md                   ← Финальное резюме
```

---

## 📞 Контакты и поддержка

**Проект:** Memory ADM  
**Репозиторий:** `D:\www2\memory-adm`  
**Дата:** 2026-03-06  
**Версия:** 1.0  

---

**✅ Документация готова к использованию!**

**Начните с разделов:**
1. [Authentication API](#-authentication-api) — если работаете с авторизацией
2. [Payments API](#-payments-api) — если работаете с платежами
3. [Groups API](#-groups-api) — если работаете с группами
4. [Модальные окна](#-модальные-окна) — для работы с диалогами
5. [Конфигурация API](#-конфигурация-api) — для настройки mock/real режима

---

*Эта документация является единой точкой входа для всех API в проекте Memory ADM.*

