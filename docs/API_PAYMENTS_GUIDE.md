# API для вкладки "Оплаты" (Payments Tab)

## 📋 Обзор

Полный справочник по всем API методам и диалоговым окнам для работы с платежами студента на странице `/students/s_{studentId}/payments`.

---

## 🔌 API Методы

### 1. **Загрузка платежей студента**
```typescript
paymentsApi.getStudentPayments(studentId: string): Promise<StudentPaymentsResponse>
```
- **Endpoint:** `GET api/payments/student/{studentId}`
- **Описание:** Загружает балансы, программы обучения и информацию о платежах
- **Возвращает:** 
  ```typescript
  {
    student: StudentProfile,
    programs: Program[]
  }
  ```
- **Использование:** Вызывается при загрузке таба PaymentsTab.vue
- **Store:** `payments.store.ts` → `loadStudent()`

---

### 2. **Получение транзакций**
```typescript
paymentsApi.getTransactions(programId: string): Promise<Transaction[]>
```
- **Endpoint:** `GET api/payments/transactions?programId={programId}`
- **Описание:** Получает историю транзакций для конкретной программы
- **Параметры:**
  - `programId` - ID программы обучения
- **Использование:** `PaymentTransactions.vue` - отображение истории платежей
- **Store:** `payments.store.ts`

---

### 3. **Получение KSeF счетов**
```typescript
paymentsApi.getKsefInvoices(programId: string): Promise<KsefInvoice[]>
```
- **Endpoint:** `GET api/payments/ksef-invoices?programId={programId}`
- **Описание:** Получает информацию о счетах в системе KSeF
- **Параметры:**
  - `programId` - ID программы
- **Использование:** `PaymentMonthDetail.vue` - отображение KSeF статуса

---

## 💰 Операции с платежами

### 4. **Возврат денег (Refund)**
```typescript
paymentsApi.submitRefund(payload: {
  fvnum: string;
  amount?: number;
  reason?: string;
  type?: string;
  description?: string;
  method?: string;
  iban?: string;
}): Promise<{ id: string; status: string; createdAt: string }>
```
- **Endpoint:** `POST api/payments/refund`
- **Модальное окно:** `RefundModal.vue` / `RefundOkModal.vue`
- **Открывается:** Из `PaymentMonthDetail.vue` - кнопка "Возврат"
- **Описание:** Создает запрос на возврат денежных средств
- **Возвращает:** ID возврата, статус, дату создания

---

### 5. **Редактирование счета (Invoice)**
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
}): Promise<{ ok: boolean; fvnum: string }>
```
- **Endpoint:** `POST api/payments/invoice`
- **Модальное окно:** `EditInvoiceModal.vue`
- **Открывается:** Из `PaymentMonthDetail.vue` - кнопка "Счет"
- **Описание:** Редактирует детали счета за обучение

---

### 6. **Коррекция (Correction/Korekta)**
```typescript
paymentsApi.submitCorrection(payload: {
  programId: string;
  monthIndex?: number;
  year?: string;
  amount: number;
  note?: string;
  corrDate?: string;
}): Promise<{ ok: boolean; correctionId: string }>
```
- **Endpoint:** `POST api/payments/correction`
- **Модальное окно:** `KorektaModal.vue`
- **Открывается:** Из `PaymentMonthDetail.vue` - кнопка "Коррекция"
- **Описание:** Создает корректирующие документы

---

## ⚙️ Управление программами

### 7. **Изменение тарифа (Tariff)**
```typescript
paymentsApi.changeTariff(payload: {
  programId: string;
  value: number;
  fromMonthIndex: number;
}): Promise<{ ok: boolean; programId: string; value: number }>
```
- **Endpoint:** `POST api/payments/tariff`
- **Модальное окно:** `TariffModal.vue`
- **Открывается:** Из `PaymentActions.vue` - кнопка "💱 Тариф"
- **Описание:** Изменяет стоимость обучения с указанного месяца
- **Параметры:**
  - `value` - новая стоимость тарифа в зл
  - `fromMonthIndex` - месяц, с которого применяется изменение (0-11)

---

### 8. **Пауза (Pause)**
```typescript
paymentsApi.setPause(payload: {
  programId: string;
  from: string;
  to: string;
  reason?: string;
  comment?: string;
}): Promise<{ ok: boolean }>
```
- **Endpoint:** `POST api/payments/pause`
- **Модальное окно:** `PauseModal.vue`
- **Открывается:** Из `PaymentActions.vue` - кнопка "🌙 Пауза"
- **Описание:** Устанавливает паузу на обучение (период без платежей)
- **Параметры:**
  - `from` - дата начала паузы (YYYY-MM-DD)
  - `to` - дата окончания паузы (YYYY-MM-DD)
  - `reason` - причина паузы (trips, exams, family, other, complaint)

---

### 9. **Скидка (Discount)**
```typescript
paymentsApi.setDiscount(payload: {
  programId: string;
  kind: string;
  value: number;
  fromMonthIndex: number;
}): Promise<{ ok: boolean }>
```
- **Endpoint:** `POST api/payments/discount`
- **Модальное окно:** `DiscountModal.vue`
- **Открывается:** Из `PaymentActions.vue` - кнопка "🏷️ Знижка" ИЛИ из `PaymentMonthDetail.vue`
- **Описание:** Применяет одноразовую скидку на месяц
- **Параметры:**
  - `kind` - тип скидки (family, referral, loyalty, complaint, promo)
  - `value` - размер скидки (в зл или %)
  - `fromMonthIndex` - месяц применения (0-11)

---

### 10. **Дополнительные занятия (Extra)**
```typescript
paymentsApi.addExtra(payload: {
  programId: string;
  date: string;
  title: string;
  amount: number;
}): Promise<{ ok: boolean; extraId: string }>
```
- **Endpoint:** `POST api/payments/extra`
- **Модальное окно:** `ExtraModal.vue`
- **Открывается:** 
  - Из `PaymentActions.vue` - кнопка "➕ Додаткові"
  - Из сетки месяцев - кнопка "+"
- **Описание:** Добавляет дополнительное занятие с отдельной оплатой
- **Параметры:**
  - `date` - дата занятия
  - `title` - название дополнительного занятия
  - `amount` - стоимость дополнительного занятия

---

### 11. **Разблокирование (Unlock)**
```typescript
paymentsApi.unlock(payload: {
  programId: string;
}): Promise<{ ok: boolean }>
```
- **Endpoint:** `POST api/payments/unlock`
- **Модальное окно:** `UnlockModal.vue`
- **Открывается:** Из `PaymentActions.vue` - кнопка "🔓 Разблокировать"
- **Описание:** Разблокирует заблокированную программу обучения

---

### 12. **Разделение группы (Group Split)**
```typescript
paymentsApi.split(payload: {
  programId: string;
  fromGroup: string;
  toGroup: string;
  effectiveDate: string;
}): Promise<{ ok: boolean }>
```
- **Endpoint:** `POST api/payments/split`
- **Модальное окно:** `GroupSplitModal.vue`
- **Открывается:** 
  - Из `PaymentActions.vue` - кнопка "🔄 Разделить"
  - Из `PaymentMonthDetail.vue` - "🔄 Изменить группу"
- **Описание:** Переводит студента в другую группу с эффективной датой
- **Параметры:**
  - `fromGroup` - текущая группа
  - `toGroup` - новая группа
  - `effectiveDate` - дата вступления в силу (YYYY-MM-DD)

---

### 13. **Архивирование (Archive)**
```typescript
paymentsApi.archive(payload: {
  programId: string;
  reason?: string;
  endDate?: string;
  comment?: string;
}): Promise<{ ok: boolean }>
```
- **Endpoint:** `POST api/payments/archive`
- **Модальное окно:** `ArchiveModal.vue`
- **Открывается:** Из `PaymentActions.vue` - кнопка "📦 Архив"
- **Описание:** Архивирует программу обучения

---

### 14. **Возобновление (Resume)**
```typescript
paymentsApi.resume(payload: {
  programId: string;
}): Promise<{ ok: boolean }>
```
- **Endpoint:** `POST api/payments/resume`
- **Модальное окно:** `ResumeModal.vue`
- **Открывается:** 
  - Из `PaymentActions.vue` - кнопка "▶ Возобновить"
  - Из `PaymentMonthDetail.vue` (когда статус = pause)
- **Описание:** Возобновляет архивированную программу обучения

---

## 🪟 Диалоговые окна (Modals)

| Модально | ID | Триггер | API Method | Параметры |
|----------|----|---------|----|-----------|
| **PauseModal** | `pause` | PaymentActions | `setPause()` | `{ programId }` |
| **DiscountModal** | `discount` | PaymentActions / PaymentMonthDetail | `setDiscount()` | `{ programId, monthIndex, year }` |
| **TariffModal** | `tariff` | PaymentActions | `changeTariff()` | `{ programId, monthIndex, year }` |
| **ExtraModal** | `extra` | PaymentActions / Grid | `addExtra()` | `{ programId }` |
| **UnlockModal** | `unlock` | PaymentActions | `unlock()` | `{ programId }` |
| **GroupSplitModal** | `groupSplit` | PaymentActions / PaymentMonthDetail | `split()` | `{ programId, monthIndex, year }` |
| **ArchiveModal** | `archive` | PaymentActions | `archive()` | `{ programId }` |
| **ResumeModal** | `resume` | PaymentActions / PaymentMonthDetail | `resume()` | `{ programId }` |
| **RefundModal** | `refund` | PaymentMonthDetail | `submitRefund()` | `{ fvnum }` |
| **RefundOkModal** | `refund-ok` | RefundModal | - | - |
| **EditInvoiceModal** | `edit-invoice` | PaymentMonthDetail | `editInvoice()` | `{ programId, fvnum, monthIndex, year }` |
| **KorektaModal** | `korekta` | PaymentMonthDetail | `submitCorrection()` | `{ programId, monthIndex, year }` |

---

## 📦 Store: payments.store.ts

Основные методы для работы с платежами:

```typescript
// Загрузка всех данных студента
await payments.loadStudent()

// Установка активного года (для фильтрации)
payments.setYear(programId, year)

// Установка активного месяца
payments.setMonth(programId, monthIndex)

// Переключение вида (grid / table)
payments.setView(programId, viewType)

// Получение месяцев программы
payments.monthsForProgram(programId)

// Получение текущего месяца
payments.currentMonth(programId)

// Получение лет программы
payments.yearsForProgram(programId)
```

---

## 🎯 Типы данных

### StudentPaymentsResponse
```typescript
{
  student: StudentProfile;
  programs: Program[];
}
```

### StudentProfile
```typescript
{
  totalBalance: { value: string; label: string; color: string };
  nextPay: { date: string; approx: string };
  enrollments: Enrollment[];
}
```

### Program
```typescript
{
  id: string;
  name: string;
  tariff: number;
  balance: number;
  balanceLabel: string;
  barGradient: string;
  months: MonthObj[];
}
```

### MonthObj
```typescript
{
  s: string;           // status
  a?: number;          // amount
  g1?: number;         // group1 lessons
  g2?: number;         // group2 lessons
  disc?: string;       // discount
  txDate?: string;     // transaction date
  ksef?: string;       // ksef status
  bonus?: boolean;
  split?: boolean;
}
```

### Transaction
```typescript
{
  id: string;
  date: string;
  amount: number;
  type: string;
  status: string;
  description: string;
}
```

---

## 🚀 Примеры использования

### Пример 1: Установка паузы
```typescript
import { paymentsApi } from "@/api/paymentsApi";
import { useModalStore } from "@/stores/modal.store";

const modal = useModalStore();

// Пользователь кликает на кнопку "Пауза"
modal.open('pause', { programId: 'prog-001' });

// В PauseModal.vue после заполнения формы:
await paymentsApi.setPause({
  programId: 'prog-001',
  from: '2026-03-10',
  to: '2026-05-10',
  reason: 'trips',
  comment: 'Spring vacation'
});

// Перезагрузить данные
await payments.loadStudent();
```

### Пример 2: Применение скидки
```typescript
// Открыть модальное окно
modal.open('discount', {
  programId: 'prog-001',
  monthIndex: 2,     // Март (0-based)
  year: 2026
});

// Отправить скидку
await paymentsApi.setDiscount({
  programId: 'prog-001',
  kind: 'family',     // family | referral | loyalty | complaint | promo
  value: 50,          // 50 зл или 50%
  fromMonthIndex: 2   // Применить с марта
});
```

### Пример 3: Добавление дополнительного занятия
```typescript
// Открыть модальное окно (из сетки месяцев или действий)
modal.open('extra', { programId: 'prog-001' });

// Отправить данные
await paymentsApi.addExtra({
  programId: 'prog-001',
  date: '2026-03-15',
  title: 'Extra Math Lesson',
  amount: 80
});
```

---

## 🔄 Поток данных

```
PaymentTab.vue (загрузка)
    ↓
payments.loadStudent()
    ↓
paymentsApi.getStudentPayments()
    ↓
API: GET /api/payments/student/{studentId}
    ↓
Заполнение store данными
    ↓
PaymentBalance.vue (общие балансы)
PaymentPrograms.vue (список программ)
    ├─ PaymentMonthDetail.vue (детали месяца)
    ├─ PaymentActions.vue (действия)
    └─ PaymentTransactions.vue (история)
```

Каждое действие (Пауза, Скидка, Тариф и т.д.):
```
1. Клик на кнопку действия
   ↓
2. modal.open(modalId, params)
   ↓
3. Пользователь заполняет форму в модальном окне
   ↓
4. paymentsApi.methodName(payload)
   ↓
5. API: POST /api/payments/{endpoint}
   ↓
6. payments.loadStudent() (перезагрузка)
   ↓
7. Обновление UI
```

---

## 📝 Локализация

Все тексты кнопок, заголовков и сообщений находятся в:
- `src/locales/en.json`
- `src/locales/ru.json`
- `src/locales/uk.json`
- `src/locales/pl.json`

Ключи для платежей:
```json
{
  "payments": {
    "balance": "Balance",
    "overall": "Overall Balance",
    "nextPay": "Next Payment",
    "activePrograms": "Active Programs",
    "btn": {
      "pause": "Pause",
      "discount": "Discount",
      "tariff": "Tariff",
      "extra": "Extra",
      "unlock": "Unlock",
      "split": "Split",
      "archive": "Archive",
      "resume": "Resume"
    }
  }
}
```

---

## ✅ Контрольный список для разработчика

При добавлении нового платежного действия:

- [ ] Добавить метод в `paymentsApi.ts`
- [ ] Создать модальное окно в `src/modals/templates/`
- [ ] Добавить ID модали в `modal.store.ts`
- [ ] Добавить импорт и условие в `ModalHost.vue`
- [ ] Добавить кнопку/триггер в компонент (PaymentActions, PaymentMonthDetail и т.д.)
- [ ] Добавить локализованный текст в `locales/*.json`
- [ ] Добавить обработку ошибок и валидацию
- [ ] Добавить `await payments.loadStudent()` после успешного API вызова
- [ ] Тестировать с Mock API и реальным API


