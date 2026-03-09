# 📱 Payments Tab - Полный сборник API и диалоговых окон

> **Маршрут:** `/students/s_{studentId}/payments`
> **Дата:** 2026-03-06
> **Статус:** ✅ Актуально

---

## 📑 Документация

Этот сборник включает полную документацию для вкладки "Оплаты" (Payments Tab) в приложении управления студентами.

### Файлы документации:

| Файл | Описание | Рекомендуется для |
|------|---------|-------------------|
| **API_PAYMENTS_GUIDE.md** | 📘 Полный справочник с примерами | Разработчики, архитекторы |
| **PAYMENTS_QUICK_REFERENCE.md** | ⚡ Краткая шпаргалка и таблицы | Быстрый поиск и справки |
| **PAYMENTS_API_REFERENCE.ts** | 🔧 TypeScript типы и константы | Разработка и автодополнение |

---

## 🎯 Быстрый старт

### 1. **Если вы новичок в проекте**
   → Начните с **PAYMENTS_QUICK_REFERENCE.md** (5 минут)

### 2. **Если добавляете новую операцию**
   → Смотрите раздел "Quick Start для новой операции" в **PAYMENTS_QUICK_REFERENCE.md**

### 3. **Если разбираетесь в архитектуре**
   → Читайте **API_PAYMENTS_GUIDE.md** полностью

### 4. **Если ищете конкретный метод**
   → Используйте TypeScript файл **PAYMENTS_API_REFERENCE.ts** в IDE

---

## 🔑 Основные концепции

### Структура вкладки
```
PaymentsTab
├── PaymentBalance (общая информация)
└── PaymentPrograms (список программ)
    ├── PaymentMonthDetail (детали месяца)
    ├── PaymentActions (кнопки действий)
    └── PaymentTransactions (история)
```

### 14 API методов
- 3 для загрузки данных (GET)
- 11 для операций (POST)

### 12 модальных окон
- Пауза, Скидка, Тариф, Дополнительные, Разблокировка
- Разделение группы, Архив, Возобновление
- Возврат денег, Редактирование счета, Коррекция

---

## 📊 Таблица операций

| Операция | API | Modal | Компонент | Статус |
|----------|-----|-------|-----------|--------|
| 🌙 Пауза | `setPause()` | PauseModal | PaymentActions | ✅ |
| 🏷️ Скидка | `setDiscount()` | DiscountModal | PaymentActions / Detail | ✅ |
| 💱 Тариф | `changeTariff()` | TariffModal | PaymentActions | ✅ |
| ➕ Дополнительно | `addExtra()` | ExtraModal | PaymentActions / Grid | ✅ |
| 🔓 Разблокировка | `unlock()` | UnlockModal | PaymentActions | ✅ |
| 🔄 Разделение | `split()` | GroupSplitModal | PaymentActions / Detail | ✅ |
| 📦 Архив | `archive()` | ArchiveModal | PaymentActions | ✅ |
| ▶️ Возобновление | `resume()` | ResumeModal | PaymentActions / Detail | ✅ |
| ↩️ Возврат денег | `submitRefund()` | RefundModal | Detail | ✅ |
| 📄 Редактирование | `editInvoice()` | EditInvoiceModal | Detail | ✅ |
| ✏️ Коррекция | `submitCorrection()` | KorektaModal | Detail | ✅ |
| 📊 Транзакции | `getTransactions()` | — | Transactions | ✅ |

---

## 🧩 Компоненты и их API использование

### PaymentTab.vue
```typescript
// Загрузка при монтировании
paymentsApi.getStudentPayments(studentId)
```

### PaymentBalance.vue
```typescript
// Отображение статистики
payments.student?.totalBalance
payments.student?.nextPay
```

### PaymentPrograms.vue
```typescript
// Перечисление программ и месяцев
payments.programs
payments.monthsForProgram(programId)
```

### PaymentMonthDetail.vue
```typescript
// Детали месяца
paymentsApi.getTransactions(programId)
paymentsApi.getKsefInvoices(programId)

// Модали:
modal.open('discount', { ... })
modal.open('refund', { ... })
modal.open('edit-invoice', { ... })
modal.open('korekta', { ... })
```

### PaymentActions.vue
```typescript
// Кнопки действий
modal.open('pause', { programId })
modal.open('discount', { programId, monthIndex, year })
modal.open('tariff', { programId, monthIndex, year })
modal.open('extra', { programId })
modal.open('unlock', { programId })
modal.open('groupSplit', { programId })
modal.open('archive', { programId })
modal.open('resume', { programId })
```

### PaymentTransactions.vue
```typescript
// История платежей
paymentsApi.getTransactions(programId)
```

---

## 🔌 API Endpoints

### GET методы
```
GET /api/payments/student/{studentId}
GET /api/payments/transactions?programId={programId}
GET /api/payments/ksef-invoices?programId={programId}
```

### POST методы
```
POST /api/payments/pause
POST /api/payments/discount
POST /api/payments/tariff
POST /api/payments/extra
POST /api/payments/unlock
POST /api/payments/split
POST /api/payments/archive
POST /api/payments/resume
POST /api/payments/refund
POST /api/payments/invoice
POST /api/payments/correction
```

---

## 🛠️ Как добавить новую операцию

### Минимальный набор шагов:

1. **API метод** → `src/api/paymentsApi.ts`
   ```typescript
   async myOperation(payload: MyPayload): Promise<MyResponse> {
     const { data } = await http.post("api/payments/my-op", payload);
     return data;
   }
   ```

2. **Модальное окно** → `src/modals/templates/MyOperationModal.vue`
   ```vue
   <template>
     <BaseModal @close="close">
       <!-- форма -->
     </BaseModal>
   </template>
   ```

3. **Регистрация** → `src/stores/modal.store.ts` + `src/modals/ModalHost.vue`

4. **Кнопка-триггер** → `src/views/students/components/profile-tabs/payments/PaymentActions.vue`

5. **Локализация** → `src/locales/*.json`

---

## 📦 Типы данных

### Основные интерфейсы

```typescript
// Ответ загрузки платежей
StudentPaymentsResponse {
  student: StudentProfile;
  programs: Program[];
}

// Программа обучения
Program {
  id: string;
  name: string;
  tariff: number;
  balance: number;
  months: MonthObj[];
}

// Месяц
MonthObj {
  s: string;              // статус (paid, pending, overdue, pause)
  a?: number;             // сумма
  g1?: number;            // уроки группа 1
  g2?: number;            // уроки группа 2
  disc?: string;          // скидка
  txDate?: string;        // дата транзакции
  ksef?: string;          // статус KSeF
}

// Транзакция
Transaction {
  id: string;
  date: string;
  amount: number;
  type: string;
  status: string;
}
```

---

## 🎨 Store (Pinia)

### payments.store.ts

```typescript
// Основные свойства
payments.student           // Данные студента
payments.programs          // Список программ
payments.loading          // Статус загрузки
payments.error            // Сообщение об ошибке

// Методы для работы с состоянием
payments.loadStudent()                          // Загрузить данные
payments.setYear(programId, year)               // Установить год
payments.setMonth(programId, monthIndex)        // Установить месяц
payments.setView(programId, 'grid' | 'table')   // Переключить вид
payments.monthsForProgram(programId)            // Месяцы программы
payments.currentMonth(programId)                // Текущий месяц
payments.yearsForProgram(programId)             // Годы программы
```

### modal.store.ts

```typescript
// Основные свойства
modal.activeModal    // ID открытого модального окна
modal.modalData      // Данные для модала

// Методы
modal.open(id, payload)      // Открыть модаль
modal.openModal(id, payload) // Альтернативный метод
modal.close()                // Закрыть модаль
```

---

## 🌍 Локализация

### Ключи для платежей

```json
{
  "payments": {
    "overall": "Общий баланс",
    "nextPay": "Следующая оплата",
    "activePrograms": "Активные программы",
    "btn": {
      "pause": "Пауза",
      "discount": "Скидка",
      "tariff": "Тариф",
      "extra": "Дополнительно",
      "unlock": "Разблокировать",
      "split": "Разделить",
      "archive": "Архив",
      "resume": "Возобновить"
    },
    "status": {
      "paid": "Оплачено",
      "pending": "Ожидает",
      "overdue": "Просрочено"
    }
  }
}
```

Файлы локализации:
- `src/locales/en.json` - Английский
- `src/locales/ru.json` - Русский
- `src/locales/uk.json` - Украинский
- `src/locales/pl.json` - Польский

---

## ⚙️ Конфигурация

### .env.local

```dotenv
# Использовать Mock API (для разработки)
VITE_USE_MOCK=true

# URL API сервера
VITE_API_BASE_URL=http://localhost:3000
```

---

## 🧪 Тестирование

### Режимы работы

```bash
# С Mock API (по умолчанию)
npm run dev

# С реальным API
VITE_USE_MOCK=false npm run dev

# Сборка для production
npm run build
```

---

## 📝 Файловая структура

```
src/
├── api/
│   ├── paymentsApi.ts          ← Все API методы для платежей
│   ├── http.ts                  ← HTTP клиент
│   ├── mockDb.ts                ← Типы данных
│   └── mockAdapter.ts           ← Mock реализация
├── stores/
│   ├── payments.store.ts        ← Pinia store для платежей
│   └── modal.store.ts           ← Pinia store для модалей
├── views/students/components/
│   └── profile-tabs/
│       ├── PaymentsTab.vue      ← Главный компонент вкладки
│       └── payments/
│           ├── PaymentBalance.vue
│           ├── PaymentPrograms.vue
│           ├── PaymentMonthDetail.vue
│           ├── PaymentActions.vue
│           ├── PaymentTransactions.vue
│           └── (др. компоненты)
├── modals/
│   ├── ModalHost.vue            ← Маршрутизатор модалей
│   └── templates/
│       ├── PauseModal.vue
│       ├── DiscountModal.vue
│       ├── TariffModal.vue
│       ├── ExtraModal.vue
│       ├── UnlockModal.vue
│       ├── GroupSplitModal.vue
│       ├── ArchiveModal.vue
│       ├── ResumeModal.vue
│       ├── RefundModal.vue
│       ├── RefundOkModal.vue
│       ├── EditInvoiceModal.vue
│       └── KorektaModal.vue
└── locales/
    ├── en.json
    ├── ru.json
    ├── uk.json
    └── pl.json
```

---

## 🚨 Типичные ошибки

| Проблема | Решение |
|----------|---------|
| Modal не открывается | Проверить ModalId в modal.store.ts и ModalHost.vue |
| API возвращает 404 | Уточнить endpoint в paymentsApi.ts |
| Данные не обновляются | Добавить `await payments.loadStudent()` |
| Type Error | Использовать типы из paymentsApi.ts |
| Кнопка невидима | Проверить импорт компонента в родительском |

---

## 🔗 Связанные документы

- **Router:** `src/app/router.ts`
- **Config:** `vite.config.ts`
- **Main:** `src/app/main.ts`
- **README:** `README.md`

---

## 📞 Дополнительная информация

### Маршрут
```
/students/s_{studentId}/payments
```

### Пример URL
```
/students/s_2/payments
```

### Компоненты по функциям

| Функция | Компонент |
|---------|-----------|
| Отображение остатков | PaymentBalance.vue |
| Список программ | PaymentPrograms.vue |
| Детали месяца | PaymentMonthDetail.vue |
| Кнопки действий | PaymentActions.vue |
| История платежей | PaymentTransactions.vue |

---

## ✅ Контрольный список для разработчика

Перед коммитом:
- [ ] Все API методы имеют типы
- [ ] Все модали зарегистрированы в modal.store.ts
- [ ] Все модали импортированы в ModalHost.vue
- [ ] Все ключи локализации добавлены
- [ ] Все компоненты правильно импортированы
- [ ] Нет ошибок TypeScript (`npm run type-check`)
- [ ] Тестировано с Mock API
- [ ] Тестировано с реальным API

---

## 📚 Рекомендуемый порядок изучения

1. **PAYMENTS_QUICK_REFERENCE.md** - общее понимание (10 минут)
2. **Существующий модал** - например PauseModal.vue (20 минут)
3. **API методы** - paymentsApi.ts (10 минут)
4. **Store** - payments.store.ts и modal.store.ts (15 минут)
5. **API_PAYMENTS_GUIDE.md** - полная документация (30 минут)

---

**Дата создания:** 2026-03-06
**Версия:** 1.0
**Статус:** ✅ Актуально


