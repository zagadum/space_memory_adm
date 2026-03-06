# Payments Tab - Краткая шпаргалка

## 📊 Таблица API методов

| # | Метод | Endpoint | Modal | Компонент | Параметры |
|---|-------|----------|-------|-----------|-----------|
| **Загрузка** | | | | | |
| 1 | `getStudentPayments(id)` | GET `/api/payments/student/{id}` | — | PaymentTab | `studentId` |
| 2 | `getTransactions(id)` | GET `/api/payments/transactions` | — | PaymentTransactions | `programId` |
| 3 | `getKsefInvoices(id)` | GET `/api/payments/ksef-invoices` | — | PaymentMonthDetail | `programId` |
| **Операции** | | | | | |
| 4 | `submitRefund()` | POST `/api/payments/refund` | RefundModal | PaymentMonthDetail | `fvnum, amount, reason, method, iban` |
| 5 | `editInvoice()` | POST `/api/payments/invoice` | EditInvoiceModal | PaymentMonthDetail | `programId, fvnum, issueDate, payDate, amount` |
| 6 | `submitCorrection()` | POST `/api/payments/correction` | KorektaModal | PaymentMonthDetail | `programId, amount, note, corrDate` |
| **Программы** | | | | | |
| 7 | `changeTariff()` | POST `/api/payments/tariff` | TariffModal | PaymentActions | `programId, value, fromMonthIndex` |
| 8 | `setPause()` | POST `/api/payments/pause` | PauseModal | PaymentActions | `programId, from, to, reason, comment` |
| 9 | `setDiscount()` | POST `/api/payments/discount` | DiscountModal | PaymentActions / PaymentMonthDetail | `programId, kind, value, fromMonthIndex` |
| 10 | `addExtra()` | POST `/api/payments/extra` | ExtraModal | PaymentActions / Grid | `programId, date, title, amount` |
| 11 | `unlock()` | POST `/api/payments/unlock` | UnlockModal | PaymentActions | `programId` |
| 12 | `split()` | POST `/api/payments/split` | GroupSplitModal | PaymentActions / PaymentMonthDetail | `programId, fromGroup, toGroup, effectiveDate` |
| 13 | `archive()` | POST `/api/payments/archive` | ArchiveModal | PaymentActions | `programId, reason, endDate, comment` |
| 14 | `resume()` | POST `/api/payments/resume` | ResumeModal | PaymentActions / PaymentMonthDetail | `programId` |

---

## 🪟 Модальные окна

### Список всех 12 модальных окон для PaymentTab:

```typescript
// IDs для modal.open()
const PAYMENT_MODALS = {
  'pause',           // 🌙 Пауза на обучение
  'discount',        // 🏷️ Применить скидку
  'tariff',          // 💱 Изменить тариф
  'extra',           // ➕ Добавить дополнительное занятие
  'unlock',          // 🔓 Разблокировать
  'groupSplit',      // 🔄 Разделить группу
  'archive',         // 📦 Архивировать
  'resume',          // ▶️ Возобновить
  'refund',          // ↩️ Возврат денег
  'refund-ok',       // ✓ Подтверждение возврата
  'edit-invoice',    // 📄 Редактировать счет
  'korekta',         // ✏️ Коррекция
};
```

---

## 🔌 Основные компоненты

### Структура вкладки Payments:

```
PaymentsTab.vue (загрузка & ошибки)
├── PaymentBalance.vue (баланс & информация)
└── PaymentPrograms.vue (список программ)
    ├── PaymentMonthDetail.vue (детали месяца)
    │   ├── modal('discount')
    │   ├── modal('refund')
    │   ├── modal('edit-invoice')
    │   ├── modal('korekta')
    │   ├── modal('groupSplit')
    │   └── modal('resume')
    ├── PaymentActions.vue (кнопки действий)
    │   ├── modal('pause')
    │   ├── modal('discount')
    │   ├── modal('tariff')
    │   ├── modal('extra')
    │   ├── modal('unlock')
    │   ├── modal('groupSplit')
    │   ├── modal('archive')
    │   └── modal('resume')
    └── PaymentTransactions.vue (история платежей)
```

---

## 🎯 Quick Start для новой операции

### Шаг 1: Добавить API метод
```typescript
// src/api/paymentsApi.ts
async myNewOperation(payload: MyPayload): Promise<MyResponse> {
  const { data } = await http.post("api/payments/my-endpoint", payload);
  return data;
}
```

### Шаг 2: Создать модальное окно
```vue
<!-- src/modals/templates/MyOperationModal.vue -->
<template>
  <BaseModal @close="close">
    <!-- форма -->
  </BaseModal>
</template>
<script setup lang="ts">
import { paymentsApi } from "@/api/paymentsApi";
import { useModalStore } from "@/stores/modal.store";
import { usePaymentsStore } from "@/stores/payments.store";

const modal = useModalStore();
const payments = usePaymentsStore();

async function save() {
  await paymentsApi.myNewOperation(payload);
  await payments.loadStudent();
  modal.close();
}
</script>
```

### Шаг 3: Регистрировать модаль
```typescript
// src/stores/modal.store.ts
export type ModalId = "my-operation" | ... // добавить сюда

// src/modals/ModalHost.vue
<MyOperationModal v-else-if="openId === 'my-operation'" />
import MyOperationModal from "./templates/MyOperationModal.vue";
```

### Шаг 4: Добавить кнопку
```vue
<!-- src/views/students/components/profile-tabs/payments/PaymentActions.vue -->
<button @click="modal.open('my-operation', { programId })">
  🎯 {{ t("payments.btn.myOperation") }}
</button>
```

### Шаг 5: Добавить локализацию
```json
// locales/en.json
{
  "payments": {
    "btn": {
      "myOperation": "My Operation"
    }
  }
}
```

---

## 📝 Параметры для modal.open()

```typescript
// Пауза
modal.open('pause', { programId })

// Скидка
modal.open('discount', { programId, monthIndex, year })

// Тариф
modal.open('tariff', { programId, monthIndex, year })

// Доп. занятие
modal.open('extra', { programId })

// Разблокировка
modal.open('unlock', { programId })

// Разделение группы
modal.open('groupSplit', { programId, monthIndex, year })

// Архив
modal.open('archive', { programId })

// Возобновление
modal.open('resume', { programId })

// Возврат денег
modal.open('refund', { fvnum })

// Редактирование счета
modal.open('edit-invoice', { programId, fvnum, monthIndex, year })

// Коррекция
modal.open('korekta', { programId, monthIndex, year })
```

---

## 🔄 Типичный поток операции

```
1. Пользователь кликает на кнопку в PaymentActions.vue
   ↓
2. Вызывается: modal.open('operationId', { programId, ... })
   ↓
3. Модальное окно отображается с предзаполненными данными
   ↓
4. Пользователь заполняет форму и кликает "Применить"
   ↓
5. Валидация формы (если нужна)
   ↓
6. Вызов: await paymentsApi.operationMethod(payload)
   ↓
7. API запрос: POST /api/payments/endpoint
   ↓
8. Обработка ошибки или успешный ответ
   ↓
9. Перезагрузка: await payments.loadStudent()
   ↓
10. Закрытие модали: modal.close()
   ↓
11. UI обновляется со свежими данными
```

---

## 💾 Типы данных для payload

```typescript
// Пауза
{ 
  programId: string;
  from: string;        // YYYY-MM-DD
  to: string;          // YYYY-MM-DD
  reason?: string;     // trips | exams | family | other | complaint
  comment?: string;
}

// Скидка
{
  programId: string;
  kind: string;        // family | referral | loyalty | complaint | promo
  value: number;
  fromMonthIndex: number;  // 0-11
}

// Тариф
{
  programId: string;
  value: number;       // новая стоимость тарифа
  fromMonthIndex: number;  // месяц, с которого применяется
}

// Доп. занятие
{
  programId: string;
  date: string;        // YYYY-MM-DD
  title: string;
  amount: number;
}

// Разделение группы
{
  programId: string;
  fromGroup: string;
  toGroup: string;
  effectiveDate: string;  // YYYY-MM-DD
}

// Архив
{
  programId: string;
  reason?: string;
  endDate?: string;
  comment?: string;
}

// Возврат
{
  fvnum: string;
  amount?: number;
  reason?: string;
  type?: string;
  description?: string;
  method?: string;
  iban?: string;
}
```

---

## 🐛 Типичные ошибки и решения

| Ошибка | Причина | Решение |
|--------|---------|---------|
| Modal не открывается | ID не зарегистрирован в modal.store.ts | Добавить в ModalId type и ModalHost.vue |
| API возвращает 404 | Неправильный endpoint | Проверить паттерн endpoint в paymentsApi.ts |
| Данные не обновляются | Забыт await payments.loadStudent() | Добавить после успешного API вызова |
| Ошибка типизации | Неправильный Payload interface | Экспортировать интерфейс и использовать в модали |
| Кнопка не видна | Компонент не импортирован | Добавить import в родительский компонент |

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

## 📚 Файлы для изучения

1. **API интеграция**
   - `src/api/paymentsApi.ts` - все методы
   - `src/api/http.ts` - HTTP клиент
   - `src/api/mockDb.ts` - типы данных

2. **Хранилище**
   - `src/stores/payments.store.ts` - состояние платежей
   - `src/stores/modal.store.ts` - состояние модалей

3. **Компоненты**
   - `src/views/students/components/profile-tabs/PaymentsTab.vue`
   - `src/views/students/components/profile-tabs/payments/*.vue`

4. **Модали**
   - `src/modals/ModalHost.vue` - маршрутизатор
   - `src/modals/templates/*.vue` - все модальные окна

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

# Сборка для production
npm run build

# Проверка типов TypeScript
npm run type-check

# Просмотр ошибок TypeScript
cat ts_errors.log
```

---

## 📞 Контакты и ссылки

- **Документация API:** `API_PAYMENTS_GUIDE.md`
- **TypeScript References:** `PAYMENTS_API_REFERENCE.ts`
- **Маршрут:** `/students/s_{studentId}/payments`
- **Mock Adapter:** `src/api/mockAdapter.ts`


