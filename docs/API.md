# 📚 API Документация - Memory ADM

**Версия:** 1.0  
**Последнее обновление:** 03.03.2026  
**Язык:** TypeScript + Axios  

---

## 📋 Оглавление

1. [Authentication (Аутентификация)](#authentication)
2. [Payments (Платежи)](#payments)
3. [Student Groups (Группы студентов)](#student-groups)
4. [Student Info (Информация о студенте)](#student-info)
5. [Student Attendance (Посещаемость)](#student-attendance)
6. [Student Progress (Прогресс)](#student-progress)
7. [Student Notes (Заметки)](#student-notes)
8. [Data Types (Типы данных)](#data-types)

---

## Authentication

### POST `/api/auth/sign-in`
Вход в систему (получение токена)

**Входные данные:**
```typescript
{
  email: string;      // Email пользователя
  password: string;   // Пароль
}
```

**Пример запроса:**
```typescript
await authApi.signIn({
  email: "admin@demo.local",
  password: "password123"
});
```

**Выходные данные:**
```typescript
{
  token: string;                // JWT токен для авторизации
  user: {
    id: string;                 // ID пользователя
    email: string;              // Email
    name: string;               // Имя
  }
}
```

**Пример ответа:**
```json
{
  "token": "mock.jwt.token",
  "user": {
    "id": "u_1",
    "email": "admin@demo.local",
    "name": "Demo Admin"
  }
}
```

**Статус коды:**
- `200 OK` - успешная авторизация
- `400 Bad Request` - отсутствуют email или password
- `401 Unauthorized` - неправильные учетные данные

---

### GET `/api/auth/me`
Получить информацию текущего пользователя

**Входные данные:**
- Требуется Authorization header: `Bearer {token}`

**Пример запроса:**
```typescript
await authApi.me();
```

**Выходные данные:**
```typescript
{
  id: string;         // ID пользователя
  email: string;      // Email
  name: string;       // Имя
}
```

**Пример ответа:**
```json
{
  "id": "u_1",
  "email": "admin@demo.local",
  "name": "Demo Admin"
}
```

**Статус коды:**
- `200 OK` - успешно
- `401 Unauthorized` - отсутствует или невалидный токен

---

## Payments

### GET `/api/payments/student/{studentId}`
Получить информацию платежей студента

**Параметры URL:**
- `studentId` (string) - ID студента (обязателен)

**Пример запроса:**
```typescript
await paymentsApi.getStudentPayments("s_1");
```

**Выходные данные:**
```typescript
{
  student: {
    id: string;                               // ID студента
    initials: string;                         // Инициалы (напр. "АК")
    name: string;                             // Имя
    age: string;                              // Возраст
    parent: string;                           // Родитель
    phone: string;                            // Телефон
    statusLabel: string;                      // Статус (напр. "● Активна")
    statusColor: string;                      // CSS цвет статуса
    totalBalance: {
      value: string;                          // Значение баланса (напр. "+220 zł")
      label: string;                          // Описание (напр. "переплата")
      color: string;                          // CSS цвет
    };
    nextPay: {
      date: string;                           // Дата следующего платежа
      approx: string;                         // Приблизительная сумма
    };
  };
  programs: Program[];                        // Массив программ обучения
}
```

**Пример ответа:**
```json
{
  "student": {
    "id": "s_1",
    "initials": "АК",
    "name": "Anna Kowalska",
    "age": "11 лет",
    "parent": "Ewa Kowalska (мама)",
    "phone": "+48 601 234 567",
    "statusLabel": "● Активна",
    "statusColor": "var(--green)",
    "totalBalance": {
      "value": "+220 zł",
      "label": "переплата",
      "color": "var(--green)"
    },
    "nextPay": {
      "date": "01.03.2026",
      "approx": "~837 зл · с учётом скидок"
    }
  },
  "programs": [
    {
      "id": "space",
      "name": "🌌 Space Memory",
      "sub": "Гр. A · Пн 16:00 · Anna Kowalska · 490 зл/мес · 👦 1-й ребёнок · без скидки",
      "tariff": 490,
      "balance": 120,
      "balanceLabel": "переплата",
      "barGradient": "linear-gradient(180deg,var(--blue),var(--purple))"
    }
  ]
}
```

**Статус коды:**
- `200 OK` - успешно
- `404 Not Found` - студент не найден

---

### GET `/api/payments/transactions`
Получить список транзакций программы

**Query параметры:**
- `programId` (string) - ID программы (обязателен)

**Пример запроса:**
```typescript
await paymentsApi.getTransactions("space");
```

**Выходные данные:**
```typescript
{
  items: Transaction[]
}

// Где Transaction:
{
  id: string;                 // ID транзакции
  date: string;               // Дата (напр. "08.02.2026")
  title: string;              // Название
  sub?: string;               // Подзаголовок
  amount: string;             // Сумма (отформатирована)
  paid: boolean;              // Оплачено ли
  ksef?: string | null;       // KSeF статус
  fvnum?: string | null;      // Номер фактуры
  type?: "month" | "extra";   // Тип транзакции
}
```

**Пример ответа:**
```json
{
  "items": [
    {
      "id": "tx_001",
      "date": "08.02.2026",
      "title": "Абонемент февраль 2026 ✓",
      "sub": "Space Memory · Imoje · #TXN-2026-0847",
      "amount": "+441 зл",
      "paid": true,
      "ksef": "ok",
      "fvnum": "FV/2026/02/091",
      "type": "month"
    }
  ]
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствует programId

---

### GET `/api/payments/ksef-invoices`
Получить список KSeF счетов

**Query параметры:**
- `programId` (string) - ID программы (обязателен)

**Пример запроса:**
```typescript
await paymentsApi.getKsefInvoices("space");
```

**Выходные данные:**
```typescript
{
  items: {
    fvnum: string;              // Номер фактуры
    title: string;              // Название
    status: "OK" | "MANUAL" | "PENDING" | "ERROR" | "CONFLICT";
    statusClass: string;        // CSS класс для стилизации
  }[]
}
```

**Пример ответа:**
```json
{
  "items": [
    {
      "fvnum": "FV/2026/02/091",
      "title": "Абонемент февраль 2026",
      "status": "OK",
      "statusClass": "ksef-ok"
    }
  ]
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствует programId

---

### POST `/api/payments/refund`
Подать запрос на возврат

**Входные данные:**
```typescript
{
  fvnum: string;          // Номер фактуры (обязателен)
  amount?: number;        // Сумма возврата (опционально)
  reason?: string;        // Причина возврата (опционально)
}
```

**Пример запроса:**
```typescript
await paymentsApi.submitRefund({
  fvnum: "FV/2026/02/091",
  amount: 100,
  reason: "Переплата"
});
```

**Выходные данные:**
```typescript
{
  id: string;             // ID возврата
  status: string;         // Статус ("submitted", "processing", "completed")
  createdAt: string;      // Дата создания
}
```

**Пример ответа:**
```json
{
  "id": "refund_a1b2c3d4e5f6g7h8",
  "status": "submitted",
  "createdAt": "2026-03-03T10:30:00Z"
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствует fvnum

---

### POST `/api/payments/invoice`
Отредактировать фактуру

**Входные данные:**
```typescript
{
  programId: string;      // ID программы (обязателен)
  monthIndex?: number;    // Индекс месяца (0-11)
  year?: string;          // Год
  fvnum: string;          // Номер фактуры (обязателен)
  ksef?: string;          // KSeF статус
  issueDate?: string;     // Дата выставления
  payDate?: string;       // Дата оплаты
}
```

**Пример запроса:**
```typescript
await paymentsApi.editInvoice({
  programId: "space",
  fvnum: "FV/2026/02/091",
  ksef: "ok",
  issueDate: "01.02.2026",
  payDate: "08.02.2026"
});
```

**Выходные данные:**
```typescript
{
  ok: boolean;            // Успешно ли
  fvnum: string;          // Номер фактуры
}
```

**Пример ответа:**
```json
{
  "ok": true,
  "fvnum": "FV/2026/02/091"
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствуют обязательные поля

---

### POST `/api/payments/correction`
Создать коррекцию платежа

**Входные данные:**
```typescript
{
  programId: string;      // ID программы (обязателен)
  monthIndex?: number;    // Индекс месяца
  year?: string;          // Год
  amount: number;         // Сумма коррекции (обязателена)
  note?: string;          // Примечание
  corrDate?: string;      // Дата коррекции
}
```

**Пример запроса:**
```typescript
await paymentsApi.submitCorrection({
  programId: "space",
  monthIndex: 1,
  year: "2026",
  amount: 50,
  note: "Скидка за лояльность",
  corrDate: "15.02.2026"
});
```

**Выходные данные:**
```typescript
{
  ok: boolean;            // Успешно ли
  correctionId: string;   // ID коррекции
}
```

**Пример ответа:**
```json
{
  "ok": true,
  "correctionId": "corr_x1y2z3a4b5c6d7e8"
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствуют обязательные поля

---

### POST `/api/payments/tariff`
Изменить тариф программы

**Входные данные:**
```typescript
{
  programId: string;      // ID программы (обязателен)
  value: number;          // Новый тариф в zł (обязателен)
  fromMonthIndex: number; // С какого месяца применить
}
```

**Пример запроса:**
```typescript
await paymentsApi.changeTariff({
  programId: "space",
  value: 520,
  fromMonthIndex: 2  // Март
});
```

**Выходные данные:**
```typescript
{
  ok: boolean;            // Успешно ли
  programId: string;      // ID программы
  value: number;          // Новый тариф
}
```

**Пример ответа:**
```json
{
  "ok": true,
  "programId": "space",
  "value": 520
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствуют обязательные поля

---

### POST `/api/payments/pause`
Поставить программу на паузу

**Входные данные:**
```typescript
{
  programId: string;      // ID программы (обязателен)
  from: string;           // Дата начала паузы (обязательна)
  to: string;             // Дата конца паузы (обязательна)
  reason?: string;        // Причина паузы
}
```

**Пример запроса:**
```typescript
await paymentsApi.setPause({
  programId: "space",
  from: "10.05.2026",
  to: "15.06.2026",
  reason: "Летние каникулы"
});
```

**Выходные данные:**
```typescript
{
  ok: boolean;            // Успешно ли
}
```

**Пример ответа:**
```json
{
  "ok": true
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствуют обязательные поля

---

### POST `/api/payments/discount`
Установить скидку

**Входные данные:**
```typescript
{
  programId: string;      // ID программы (обязателен)
  kind: string;           // Тип скидки: "family" | "referral" | "loyalty" | "complaint" | "promo"
  value: number;          // Процент скидки или сумма (обязателена)
  fromMonthIndex: number; // С какого месяца применить
}
```

**Пример запроса:**
```typescript
await paymentsApi.setDiscount({
  programId: "space",
  kind: "family",
  value: 10,              // 10% скидка
  fromMonthIndex: 3       // Апрель
});
```

**Выходные данные:**
```typescript
{
  ok: boolean;            // Успешно ли
}
```

**Пример ответа:**
```json
{
  "ok": true
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствуют обязательные поля

---

### POST `/api/payments/extra`
Добавить дополнительное занятие/услугу

**Входные данные:**
```typescript
{
  programId: string;      // ID программы (обязателен)
  date: string;           // Дата (обязательна)
  title: string;          // Название (обязательно)
  amount: number;         // Сумма (обязательна)
}
```

**Пример запроса:**
```typescript
await paymentsApi.addExtra({
  programId: "space",
  date: "15.03.2026",
  title: "Дополнительное занятие",
  amount: 110
});
```

**Выходные данные:**
```typescript
{
  ok: boolean;            // Успешно ли
  extraId: string;        // ID доп. услуги
}
```

**Пример ответа:**
```json
{
  "ok": true,
  "extraId": "extra_m1n2o3p4q5r6s7t8"
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствуют обязательные поля

---

### POST `/api/payments/unlock`
Разблокировать программу

**Входные данные:**
```typescript
{
  programId: string;      // ID программы (обязателен)
}
```

**Пример запроса:**
```typescript
await paymentsApi.unlock({
  programId: "space"
});
```

**Выходные данные:**
```typescript
{
  ok: boolean;            // Успешно ли
}
```

**Пример ответа:**
```json
{
  "ok": true
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствует programId

---

### POST `/api/payments/archive`
Архивировать программу

**Входные данные:**
```typescript
{
  programId: string;      // ID программы (обязателен)
  reason: string;         // Причина архивирования (обязательна)
}
```

**Пример запроса:**
```typescript
await paymentsApi.archive({
  programId: "space",
  reason: "Ученик закончил курс"
});
```

**Выходные данные:**
```typescript
{
  ok: boolean;            // Успешно ли
}
```

**Пример ответа:**
```json
{
  "ok": true
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствуют обязательные поля

---

### POST `/api/payments/split`
Разделить программу (изменить группу)

**Входные данные:**
```typescript
{
  programId: string;      // ID программы (обязателен)
  fromGroup: string;      // Текущая группа (обязательна)
  toGroup: string;        // Новая группа (обязательна)
  effectiveDate: string;  // Дата вступления в силу (обязательна)
}
```

**Пример запроса:**
```typescript
await paymentsApi.split({
  programId: "space",
  fromGroup: "A",
  toGroup: "B",
  effectiveDate: "01.04.2026"
});
```

**Выходные данные:**
```typescript
{
  ok: boolean;            // Успешно ли
}
```

**Пример ответа:**
```json
{
  "ok": true
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствуют обязательные поля

---

### POST `/api/payments/resume`
Возобновить программу после паузы

**Входные данные:**
```typescript
{
  programId: string;      // ID программы (обязателен)
}
```

**Пример запроса:**
```typescript
await paymentsApi.resume({
  programId: "space"
});
```

**Выходные данные:**
```typescript
{
  ok: boolean;            // Успешно ли
}
```

**Пример ответа:**
```json
{
  "ok": true
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствует programId

---

## Student Groups

### GET `/api/student/groups`
Получить группы студента

**Query параметры:**
- `studentId` (string) - ID студента (обязателен)

**Пример запроса:**
```typescript
await getStudentGroups("s_1");
```

**Выходные данные:**
```typescript
{
  items: {
    id: string;                             // ID группы
    programId: string;                      // ID программы
    programTitle: string;                   // Название программы
    programIcon?: string;                   // Иконка программы
    status: "active" | "archived" | "paused"; // Статус
    subtitle: string;                       // Подзаголовок
    group: {
      code: string;                         // Код группы (напр. "A", "B")
      schedule: string;                     // Расписание (напр. "Пн 16:00–17:00")
      trainer: string;                      // Основной тренер
      place: string;                        // Место проведения
      capacity: string;                     // Вместимость (напр. "8 / 12 мест")
      stats: {
        total: number;                      // Всего занятий
        present: number;                    // Присутствовал
        absent: number;                     // Отсутствовал
        rate: string;                       // Процент присутствия
      };
      trainers: {
        id: string;                         // ID тренера
        name: string;                       // Имя тренера
        role: string;                       // Роль ("Основной", "Замена")
        presence: AttendanceMark;           // Статус присутствия
      }[];
    };
  }[]
}
```

**Пример ответа:**
```json
{
  "items": [
    {
      "id": "g_sm_a",
      "programId": "space",
      "programTitle": "Space Memory",
      "programIcon": "🧠",
      "status": "active",
      "subtitle": "Занятие #24 личных · Группа A · Пн 16:00",
      "group": {
        "code": "A",
        "schedule": "Пн 16:00–17:00",
        "trainer": "Анна К.",
        "place": "Маршалковска 10, зал 2",
        "capacity": "8 / 12 мест",
        "stats": {
          "total": 24,
          "present": 21,
          "absent": 2,
          "rate": "87%"
        },
        "trainers": [
          {
            "id": "t_anna",
            "name": "Анна К.",
            "role": "Основной",
            "presence": "present"
          }
        ]
      }
    }
  ]
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствует studentId

---

### POST `/api/student/change-group`
Изменить группу студента

**Входные данные:**
```typescript
{
  studentId: string;      // ID студента (обязателен)
  programId: string;      // ID программы (обязателен)
  fromGroup: string;      // Текущая группа (обязательна)
  toGroup: string;        // Новая группа (обязательна)
  reason?: string;        // Причина переноса (опционально)
}
```

**Пример запроса:**
```typescript
await changeStudentGroup({
  studentId: "s_1",
  programId: "space",
  fromGroup: "A",
  toGroup: "B",
  reason: "Конфликт расписания"
});
```

**Выходные данные:**
```typescript
{
  ok: true;               // Всегда true при успехе
}
```

**Пример ответа:**
```json
{
  "ok": true
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствуют обязательные поля

---

### POST `/api/student/trainer-presence`
Отметить присутствие тренера

**Входные данные:**
```typescript
{
  studentId: string;      // ID студента (обязателен)
  groupId: string;        // ID группы (обязателен)
  trainerId: string;      // ID тренера (обязателен)
  presence: AttendanceMark; // Статус присутствия (обязателен)
                            // "present" | "absent" | "late" | "makeup" | "empty"
}
```

**Пример запроса:**
```typescript
await setTrainerPresence({
  studentId: "s_1",
  groupId: "g_sm_a",
  trainerId: "t_anna",
  presence: "present"
});
```

**Выходные данные:**
```typescript
{
  ok: true;               // Всегда true при успехе
}
```

**Пример ответа:**
```json
{
  "ok": true
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствуют обязательные поля

---

## Student Info

### GET `/api/student/info`
Получить информацию о студенте

**Query параметры:**
- `studentId` (string) - ID студента (обязателен)

**Пример запроса:**
```typescript
await getStudentInfo("s_1");
```

**Выходные данные:**
```typescript
{
  info: {
    child: {
      fullName: string;                   // ФИ ребенка
      birthDate: string;                  // Дата рождения (DD.MM.YYYY)
      age: string;                        // Возраст
      school: string;                     // Школа
      className: string;                  // Класс
    };
    parent: {
      fullName: string;                   // ФИ родителя
      phone: string;                      // Телефон
      email: string;                      // Email
    };
    billing: {
      address: string;                    // Адрес
      nip: string;                        // NIP (налоговый номер)
      clientType: "person" | "company";   // Тип клиента
    };
    rodo: {
      id: string;                         // ID документа
      title: string;                      // Название
      date: string;                       // Дата подписания
      status: "signed" | "missing";       // Статус
    }[];
    source: {
      channel: string;                    // Канал привлечения
      note: string;                       // Примечание
    };
  };
}
```

**Пример ответа:**
```json
{
  "info": {
    "child": {
      "fullName": "Анна Ковальска",
      "birthDate": "15.04.2014",
      "age": "11",
      "school": "SP nr 14 im. Staszica, Warszawa",
      "className": "5A"
    },
    "parent": {
      "fullName": "Ewa Kowalska",
      "phone": "+48 601 234 567",
      "email": "ewa.kowalska@gmail.com"
    },
    "billing": {
      "address": "ul. Nowy Świat 45/12, 00-042 Warszawa",
      "nip": "123-456-78-90",
      "clientType": "person"
    },
    "rodo": [
      {
        "id": "r1",
        "title": "Обработка персональных данных (RODO)",
        "date": "12.01.2025",
        "status": "signed"
      }
    ],
    "source": {
      "channel": "Рекомендация",
      "note": "Пришли от подруги (клиент INDIGO) — скидка по рефералу."
    }
  }
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствует studentId

---

### POST `/api/student/info`
Обновить информацию о студенте

**Входные данные:**
```typescript
{
  studentId: string;      // ID студента (обязателен)
  patch: {                // Объект с полями для обновления
    [key: string]: any;   // Поля из структуры info
  };
}
```

**Пример запроса:**
```typescript
await updateStudentInfo({
  studentId: "s_1",
  patch: {
    child: {
      age: "12",
      className: "6A"
    },
    parent: {
      phone: "+48 601 234 568"
    }
  }
});
```

**Выходные данные:**
```typescript
{
  ok: true;               // Всегда true при успехе
  info: { /* объект info */ };  // Обновленная информация
}
```

**Пример ответа:**
```json
{
  "ok": true,
  "info": {
    "child": {
      "fullName": "Анна Ковальска",
      "age": "12",
      "className": "6A"
    }
  }
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствуют studentId или patch

---

## Student Attendance

### GET `/api/student/attendance`
Получить информацию о посещаемости

**Query параметры:**
- `studentId` (string) - ID студента (обязателен)

**Пример запроса:**
```typescript
await getStudentAttendance("s_1");
```

**Выходные данные:**
```typescript
{
  attendance: {
    summary: {
      total: number;                      // Всего занятий
      present: number;                    // Присутствовал
      absent: number;                     // Отсутствовал
      makeup?: number;                    // Компенсирующие занятия
      rate: number;                       // Процент посещения (0-100)
    };
    items: {
      id: string;                         // ID посещения
      num: number;                        // Номер занятия
      date: string;                       // Дата (DD.MM.YYYY)
      topic: string;                      // Тема занятия
      trainer: string;                    // Тренер
      mark: AttendanceMark;                // Статус присутствия
      note: string;                       // Примечание
    }[];
  };
}
```

**Пример ответа:**
```json
{
  "attendance": {
    "summary": {
      "total": 24,
      "present": 21,
      "absent": 2,
      "makeup": 1,
      "rate": 87.5
    },
    "items": [
      {
        "id": "a24",
        "num": 24,
        "date": "24.02.2026",
        "topic": "Скорость ×5",
        "trainer": "Анна К.",
        "mark": "empty",
        "note": ""
      },
      {
        "id": "a23",
        "num": 23,
        "date": "17.02.2026",
        "topic": "Зачёт блок 3",
        "trainer": "Анна К.",
        "mark": "present",
        "note": ""
      }
    ]
  }
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствует studentId

---

### POST `/api/student/attendance`
Отметить посещаемость (установить отметку)

**Входные данные:**
```typescript
{
  studentId: string;      // ID студента (обязателен)
  attendanceId: string;   // ID посещения (обязателен)
  mark: AttendanceMark;   // Статус присутствия (обязателен)
                          // "present" | "absent" | "late" | "makeup" | "empty"
  note?: string;          // Примечание (опционально)
}
```

**Пример запроса:**
```typescript
await setAttendanceMark({
  studentId: "s_1",
  attendanceId: "a24",
  mark: "present",
  note: "Вернулся из отпуска"
});
```

**Выходные данные:**
```typescript
{
  ok: true;               // Всегда true при успехе
}
```

**Пример ответа:**
```json
{
  "ok": true
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствуют обязательные поля

---

## Student Progress

### GET `/api/student/progress`
Получить информацию о прогрессе

**Query параметры:**
- `studentId` (string) - ID студента (обязателен)

**Пример запроса:**
```typescript
await getStudentProgress("s_1");
```

**Выходные данные:**
```typescript
{
  progress: {
    kpi: {
      id: string;                         // ID KPI
      title: string;                      // Название показателя
      value: string;                      // Значение
      hint: string;                       // Подсказка/период
    }[];
    achievements: {
      id: string;                         // ID достижения
      title: string;                      // Название достижения
      date: string;                       // Дата (DD.MM.YYYY)
    }[];
  };
}
```

**Пример ответа:**
```json
{
  "progress": {
    "kpi": [
      {
        "id": "p1",
        "title": "Скорость запоминания",
        "value": "×5",
        "hint": "февраль 2026"
      },
      {
        "id": "p2",
        "title": "Точность",
        "value": "92%",
        "hint": "последние 4 занятия"
      }
    ],
    "achievements": [
      {
        "id": "ach1",
        "title": "80 карт за занятие",
        "date": "10.02.2026"
      },
      {
        "id": "ach2",
        "title": "Блок 3 — зачёт",
        "date": "17.02.2026"
      }
    ]
  }
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствует studentId

---

## Student Notes

### GET `/api/student/notes`
Получить заметки о студенте

**Query параметры:**
- `studentId` (string) - ID студента (обязателен)

**Пример запроса:**
```typescript
await getStudentNotes("s_1");
```

**Выходные данные:**
```typescript
{
  items: {
    id: string;                           // ID заметки
    type: "call" | "email" | "note";      // Тип заметки
    status: "open" | "done" | "closed";   // Статус
    category: string;                     // Категория (complaint, payment, progress и т.д.)
    who: string;                          // Кто создал
    when: string;                         // Когда создана (DD.MM.YYYY · HH:MM)
    title: string;                        // Заголовок
    text: string;                         // Текст заметки
    tags: string[];                       // Теги
  }[];
}
```

**Пример ответа:**
```json
{
  "items": [
    {
      "id": "n1",
      "type": "call",
      "status": "open",
      "category": "complaint",
      "who": "Magda Wiśniewska (менеджер)",
      "when": "19.02.2026 · 14:32",
      "title": "Входящий звонок",
      "text": "Мама позвонила по поводу февральского занятия — недовольна заменой тренера.",
      "tags": ["замена тренера", "жалоба", "качество занятий"]
    }
  ]
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствует studentId

---

### POST `/api/student/notes`
Создать новую заметку

**Входные данные:**
```typescript
{
  studentId: string;      // ID студента (обязателен)
  type?: string;          // Тип ("call" | "email" | "note")
  direction?: string;     // Направление ("Входящий" | "Исходящий")
  category?: string;      // Категория
  status?: string;        // Статус ("open" | "done" | "closed")
  tags?: string[];        // Теги
  text: string;           // Текст заметки (обязателен)
}
```

**Пример запроса:**
```typescript
await createStudentNote({
  studentId: "s_1",
  type: "call",
  direction: "Входящий",
  category: "payment",
  status: "open",
  tags: ["срочно", "оплата"],
  text: "Родитель позвонил с вопросом про следующий месяц"
});
```

**Выходные данные:**
```typescript
{
  ok: true;               // Всегда true при успехе
  note: {                 // Созданная заметка
    id: string;
    type: string;
    status: string;
    category: string;
    who: string;
    when: string;
    title: string;
    text: string;
    tags: string[];
  };
}
```

**Пример ответа:**
```json
{
  "ok": true,
  "note": {
    "id": "n_a1b2c3d4e5f6g7h8",
    "type": "call",
    "status": "open",
    "category": "payment",
    "who": "Demo Admin",
    "when": "03.03.2026 · 10:30",
    "title": "Входящий",
    "text": "Родитель позвонил с вопросом про следующий месяц",
    "tags": ["срочно", "оплата"]
  }
}
```

**Статус коды:**
- `200 OK` - успешно
- `400 Bad Request` - отсутствуют studentId или text

---

## Data Types

### AttendanceMark
```typescript
type AttendanceMark = "present" | "absent" | "late" | "makeup" | "empty";
```

- `present` - Присутствовал на занятии
- `absent` - Отсутствовал без причины
- `late` - Опоздал на занятие
- `makeup` - Компенсирующее занятие
- `empty` - Еще не отмечено

---

### MonthStatus
```typescript
type MonthStatus =
  | "paid"              // Оплачено
  | "pending"           // Ожидает оплаты
  | "overdue"           // Просрочено
  | "pause"             // На паузе
  | "summer"            // Летний перерыв
  | "partial"           // Частичная оплата
  | "extra-paid"        // Доп. услуга оплачена
  | "extra-pending"     // Доп. услуга в ожидании
  | "future";           // Будущий платеж
```

---

### KsefStatus
```typescript
type KsefStatus = "ok" | "manual" | "pending" | "error" | "conflict" | null;
```

- `ok` - Успешно отправлено в KSeF
- `manual` - Ручная фактура (не в KSeF)
- `pending` - В процессе отправки
- `error` - Ошибка при отправке
- `conflict` - Конфликт данных
- `null` - Не требуется KSeF

---

### Program
```typescript
interface Program {
  id: "space" | "indigo" | "extras";    // ID программы
  name: string;                          // Название с эмодзи
  sub: string;                           // Описание (группа, время, тренер и т.д.)
  tariff: number;                        // Месячный тариф в zł
  balance: number;                       // Текущий баланс
  balanceLabel: string;                  // Описание баланса
  barGradient: string;                   // CSS gradient для визуализации
  years: Record<string, MonthItem[]>;    // Месячные данные по годам
  transactions: Transaction[];           // Транзакции
  extras?: any[];                        // Доп. услуги
}
```

---

### Student Profile
```typescript
interface StudentProfile {
  id: string;                            // ID студента
  initials: string;                      // Инициалы для аватара
  name: string;                          // ФИ студента
  age: string;                           // Возраст
  parent: string;                        // ФИ и роль родителя
  phone: string;                         // Контактный телефон
  statusLabel: string;                   // Статус
  statusColor: string;                   // CSS цвет статуса
  totalBalance: {
    value: string;                       // Сумма
    label: string;                       // Описание
    color: string;                       // CSS цвет
  };
  nextPay: {
    date: string;                        // Дата следующего платежа
    approx: string;                      // Приблизительная сумма
  };
}
```

---

## 🔐 Authentication

Все запросы (кроме `/api/auth/sign-in`) требуют заголовка:
```
Authorization: Bearer {token}
```

Токен получается при входе через `/api/auth/sign-in`.

---

## ⚙️ HTTP Headers

Все запросы отправляются с заголовками:
```
Content-Type: application/json
Authorization: Bearer {token}  (если требуется авторизация)
```

---

## 🚨 Error Handling

### Возможные коды ошибок:

| Код | Описание |
|-----|---------|
| 200 | OK - успешный запрос |
| 400 | Bad Request - неправильные параметры |
| 401 | Unauthorized - отсутствует или невалидный токен |
| 404 | Not Found - ресурс не найден |
| 500 | Internal Server Error - ошибка сервера |

### Формат ошибки:
```json
{
  "message": "Описание ошибки"
}
```

---

## 📝 Примеры использования

### Полный цикл работы:

```typescript
// 1. Вход в систему
const { token, user } = await authApi.signIn({
  email: "admin@demo.local",
  password: "password123"
});

// 2. Получить данные платежей студента
const paymentData = await paymentsApi.getStudentPayments("s_1");
console.log(paymentData.student.name); // "Anna Kowalska"

// 3. Получить информацию о студенте
const studentInfo = await getStudentInfo("s_1");
console.log(studentInfo.info.child.birthDate);

// 4. Получить посещаемость
const attendance = await getStudentAttendance("s_1");
console.log(attendance.attendance.summary.rate);

// 5. Обновить информацию
await updateStudentInfo({
  studentId: "s_1",
  patch: {
    parent: {
      phone: "+48 601 234 999"
    }
  }
});

// 6. Создать заметку
await createStudentNote({
  studentId: "s_1",
  type: "call",
  text: "Родитель интересовался расписанием",
  tags: ["расписание", "входящий"]
});
```

---

**Последнее обновление:** 03.03.2026  
**Статус:** ✅ Готово к использованию

