# Payments Tab - Архитектура и диаграммы

## 🏗️ Архитектура системы платежей

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PAYMENTS TAB ROUTE                           │
│                   /students/s_{studentId}/payments                   │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      PaymentsTab.vue (VIEW)                         │
│  - Загружает данные через payments.loadStudent()                   │
│  - Показывает ошибки и loading состояние                           │
│  - Рендерит PaymentBalance и PaymentPrograms                       │
└─────────────────────────────────────────────────────────────────────┘
           ↙                                          ↘
    ┌──────────────────────┐                  ┌──────────────────────┐
    │ PaymentBalance.vue   │                  │ PaymentPrograms.vue  │
    ├──────────────────────┤                  ├──────────────────────┤
    │ • Общий баланс       │                  │ • Accordion программ │
    │ • Следующий платеж   │                  │ • Сетка/таблица      │
    │ • Активные программы │                  │ • Мес. детали        │
    │ • Легенда статусов   │                  │ • Действия & История │
    └──────────────────────┘                  └──────────────────────┘
                                                      ↓
                        ┌─────────────────────────────┼─────────────────────────────┐
                        ↓                             ↓                             ↓
              ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
              │PaymentMonthDetail.vue│    │ PaymentActions.vue   │    │PaymentTransactions   │
              ├──────────────────────┤    ├──────────────────────┤    ├──────────────────────┤
              │ • Сумма месяца       │    │ • Пауза              │    │ • История платежей   │
              │ • Скидки             │    │ • Скидка             │    │ • Статусы транзакций │
              │ • Дополнительные     │    │ • Тариф              │    │                      │
              │ • KSeF статус        │    │ • Дополнительно      │    │                      │
              │ • Транзакции         │    │ • Разблокировка      │    │                      │
              │ • Действия           │    │ • Разделение         │    │                      │
              │                      │    │ • Архив              │    │                      │
              │                      │    │ • Возобновление      │    │                      │
              └──────────────────────┘    └──────────────────────┘    └──────────────────────┘
                    ↓                            ↓                            ↓
              ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐
              │ МОДАЛЬНЫЕ ОКНА   │    │ МОДАЛЬНЫЕ ОКНА   │    │ API ЗАПРОСЫ          │
              ├──────────────────┤    ├──────────────────┤    ├──────────────────────┤
              │ • Коррекция      │    │ • Пауза          │    │ getTransactions()    │
              │ • Возврат        │    │ • Скидка         │    │ getKsefInvoices()    │
              │ • Редактирование │    │ • Тариф          │    │                      │
              │   счета          │    │ • Дополнительно  │    │                      │
              │                  │    │ • Разблокировка  │    │                      │
              │                  │    │ • Разделение     │    │                      │
              │                  │    │ • Архив          │    │                      │
              │                  │    │ • Возобновление  │    │                      │
              └──────────────────┘    └──────────────────┘    └──────────────────────┘
```

---

## 📡 Поток данных (Data Flow)

### Инициализация

```
1. Пользователь переходит на /students/s_{studentId}/payments
                            ↓
2. PaymentsTab.vue монтируется
                            ↓
3. usePaymentsStore() инициализируется
                            ↓
4. payments.loadStudent() вызывается
                            ↓
5. paymentsApi.getStudentPayments(studentId)
                            ↓
6. HTTP GET /api/payments/student/{studentId}
                            ↓
7. Ответ заполняет Pinia store
                            ↓
8. Components re-render с новыми данными
```

### Типичная операция (пример: установка паузы)

```
PaymentActions.vue
    ↓
Пользователь кликает кнопку "🌙 Пауза"
    ↓
modal.open('pause', { programId: 'prog-001' })
    ↓
PauseModal.vue отображается
    ↓
Пользователь заполняет форму:
  - Дата начала (from)
  - Дата окончания (to)
  - Причина (reason)
  - Комментарий (comment)
    ↓
Пользователь кликает "Применить"
    ↓
Валидация формы
    ↓
await paymentsApi.setPause({
  programId: 'prog-001',
  from: '2026-03-10',
  to: '2026-05-10',
  reason: 'trips',
  comment: 'Spring vacation'
})
    ↓
HTTP POST /api/payments/pause
    ↓
Ответ успешен: { ok: true }
    ↓
await payments.loadStudent()
    ↓
Store обновляется
    ↓
modal.close()
    ↓
UI обновляется со свежими данными
```

---

## 🎯 Компонентная иерархия

```
PaymentsTab.vue (страница)
│
├── 🔷 PaymentBalance.vue
│   ├── Баланс карточки
│   ├── Легенда статусов
│   └── Общая информация
│
└── 🔷 PaymentPrograms.vue (container)
    │
    ├── 📦 Программа #1 (accordion)
    │   ├── PaymentMonthDetail.vue
    │   │   ├── Месячная сетка/таблица
    │   │   ├── Кнопки: Скидка, Коррекция, Возврат, Редактирование
    │   │   ├── Modal: DiscountModal, RefundModal, KorektaModal, etc.
    │   │   └── Транзакции для месяца
    │   │
    │   ├── PaymentActions.vue
    │   │   ├── Кнопка: 🌙 Пауза → PauseModal
    │   │   ├── Кнопка: 🏷️ Скидка → DiscountModal
    │   │   ├── Кнопка: 💱 Тариф → TariffModal
    │   │   ├── Кнопка: ➕ Дополнительно → ExtraModal
    │   │   ├── Кнопка: 🔓 Разблокировка → UnlockModal
    │   │   ├── Кнопка: 🔄 Разделение → GroupSplitModal
    │   │   ├── Кнопка: 📦 Архив → ArchiveModal
    │   │   └── Кнопка: ▶ Возобновление → ResumeModal
    │   │
    │   └── PaymentTransactions.vue
    │       ├── Таблица транзакций
    │       └── История платежей
    │
    ├── 📦 Программа #2
    │   └── (структура как выше)
    │
    └── 📦 Дополнительные занятия (Extras)
        └── Особая программа для доп. услуг
```

---

## 🔄 State Management (Pinia Stores)

### payments.store.ts

```typescript
┌──────────────────────────────────────────────────────────┐
│           usePaymentsStore (Pinia)                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  State:                                                  │
│  ├── student: StudentProfile                            │
│  ├── programs: Program[]                                │
│  ├── loading: boolean                                   │
│  ├── error: string | null                               │
│  ├── activeYear: Record<string, number>                 │
│  ├── activeMonth: Record<string, number>                │
│  └── activeView: Record<string, 'grid' | 'table'>       │
│                                                          │
│  Getters:                                               │
│  └── yearsForProgram(programId): number[]               │
│                                                          │
│  Actions:                                               │
│  ├── loadStudent(): Promise<void>                       │
│  ├── setYear(programId, year): void                     │
│  ├── setMonth(programId, index): void                   │
│  ├── setView(programId, view): void                     │
│  ├── monthsForProgram(programId): MonthObj[]            │
│  ├── currentMonth(programId): MonthObj                  │
│  └── yearsForProgram(programId): number[]               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### modal.store.ts

```typescript
┌──────────────────────────────────────────────────────────┐
│           useModalStore (Pinia)                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  State:                                                  │
│  ├── activeModal: ModalId | null                        │
│  └── modalData: any                                     │
│                                                          │
│  Getters:                                               │
│  ├── openId: ModalId | null                             │
│  └── payload: any                                       │
│                                                          │
│  Actions:                                               │
│  ├── open(id, payload): void                            │
│  ├── openModal(id, payload): void                       │
│  └── close(): void                                      │
│                                                          │
│  Types (ModalId):                                       │
│  ├── 'pause'                                            │
│  ├── 'discount'                                         │
│  ├── 'tariff'                                           │
│  ├── 'extra'                                            │
│  ├── 'unlock'                                           │
│  ├── 'groupSplit'                                       │
│  ├── 'archive'                                          │
│  ├── 'resume'                                           │
│  ├── 'refund'                                           │
│  ├── 'refund-ok'                                        │
│  ├── 'edit-invoice'                                     │
│  └── 'korekta'                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🌐 API слой

```
┌────────────────────────────────────────────────────────┐
│              paymentsApi (фасад)                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  GET методы:                                          │
│  ├── getStudentPayments(id)                           │
│  ├── getTransactions(id)                              │
│  └── getKsefInvoices(id)                              │
│                                                        │
│  POST методы (операции):                              │
│  ├── submitRefund(payload)                            │
│  ├── editInvoice(payload)                             │
│  ├── submitCorrection(payload)                        │
│  ├── changeTariff(payload)                            │
│  ├── setPause(payload)                                │
│  ├── setDiscount(payload)                             │
│  ├── addExtra(payload)                                │
│  ├── unlock(payload)                                  │
│  ├── archive(payload)                                 │
│  ├── split(payload)                                   │
│  └── resume(payload)                                  │
│                                                        │
│  HTTP Client:                                         │
│  └── http (axios instance)                            │
│      ├── Mock Adapter (VITE_USE_MOCK=true)            │
│      └── Real API (VITE_USE_MOCK=false)               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📋 Модальная система

### ModalHost.vue (маршрутизатор)

```
ModalHost.vue
│
├── v-if="openId === 'pause'"        → PauseModal.vue
├── v-else-if="openId === 'discount'" → DiscountModal.vue
├── v-else-if="openId === 'tariff'"   → TariffModal.vue
├── v-else-if="openId === 'extra'"    → ExtraModal.vue
├── v-else-if="openId === 'unlock'"   → UnlockModal.vue
├── v-else-if="openId === 'groupSplit'" → GroupSplitModal.vue
├── v-else-if="openId === 'archive'"  → ArchiveModal.vue
├── v-else-if="openId === 'resume'"   → ResumeModal.vue
├── v-else-if="openId === 'refund'"   → RefundModal.vue
├── v-else-if="openId === 'refund-ok'" → RefundOkModal.vue
├── v-else-if="openId === 'edit-invoice'" → EditInvoiceModal.vue
└── v-else-if="openId === 'korekta'"  → KorektaModal.vue
```

### Типовая структура Modal компонента

```
ModalName.vue
│
├── Получить payload из modal.store
│   └── const { payload } = storeToRefs(modal)
│
├── Получить доступ к stores
│   ├── const modal = useModalStore()
│   ├── const payments = usePaymentsStore()
│   └── const { t } = useI18n()
│
├── Инициализировать reactive состояние
│   ├── ref: loading, errorMessage
│   └── computed: производные значения
│
├── Рендер формы
│   └── <template>
│       └── Input fields + Submit button
│
└── Обработчик submit
    └── async function save()
        1. Валидация
        2. await paymentsApi.operationMethod(payload)
        3. await payments.loadStudent()
        4. modal.close()
```

---

## 🔌 API вызовы - Паттерны

### Pattern 1: Простая операция

```typescript
async function handleOperation() {
  try {
    saving.value = true;
    errorMessage.value = '';
    
    // 1. API вызов
    const result = await paymentsApi.operationMethod({
      programId: props.programId,
      // ... другие параметры
    });
    
    // 2. Проверка результата
    if (!result.ok) {
      throw new Error('Operation failed');
    }
    
    // 3. Перезагрузка данных
    await payments.loadStudent();
    
    // 4. Закрытие модали
    modal.close();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Error occurred';
  } finally {
    saving.value = false;
  }
}
```

### Pattern 2: Операция с цепочкой

```typescript
async function handleComplexOperation() {
  try {
    // 1. Первый вызов
    const firstResult = await paymentsApi.firstMethod({...});
    
    // 2. Второй вызов (зависит от первого)
    const secondResult = await paymentsApi.secondMethod({
      id: firstResult.id,
      ...
    });
    
    // 3. Перезагрузка
    await payments.loadStudent();
    
    // 4. Закрытие (может быть цепочка модалей)
    modal.openModal('success');
    // или
    modal.close();
  } catch (error) {
    handleError(error);
  }
}
```

---

## 🗂️ Типы данных - Иерархия

```
StudentProfile
├── totalBalance: BalanceInfo
│   ├── value: string
│   ├── label: string
│   └── color: string
├── nextPay: PaymentInfo
│   ├── date: string
│   └── approx: string
└── enrollments: Enrollment[]
    ├── id: string
    ├── school: string
    ├── group: string
    ├── teacher: string
    └── ...

Program
├── id: string
├── name: string
├── tariff: number
├── balance: number
├── balanceLabel: string
├── barGradient: string
└── months: MonthObj[]

MonthObj
├── s: string (status)
├── a?: number (amount)
├── g1?: number (group1 lessons)
├── g2?: number (group2 lessons)
├── disc?: string (discount)
├── txDate?: string (transaction date)
├── ksef?: string (ksef status)
├── bonus?: boolean
└── split?: boolean

Transaction
├── id: string
├── date: string
├── amount: number
├── type: string
├── status: string
└── description: string

KsefInvoice
├── id: string
├── number: string
├── status: string
├── amount: number
├── date: string
└── ...
```

---

## 🔌 Типичные Payload структуры

### setPause Payload
```typescript
{
  programId: string;      // Required
  from: string;           // Required, YYYY-MM-DD
  to: string;             // Required, YYYY-MM-DD
  reason?: string;        // Optional: trips | exams | family | other | complaint
  comment?: string;       // Optional
}
```

### setDiscount Payload
```typescript
{
  programId: string;      // Required
  kind: string;           // Required: family | referral | loyalty | complaint | promo
  value: number;          // Required, в зл или %
  fromMonthIndex: number; // Required, 0-11
}
```

### changeTariff Payload
```typescript
{
  programId: string;      // Required
  value: number;          // Required, новая стоимость
  fromMonthIndex: number; // Required, месяц применения
}
```

---

## 📞 Связи между компонентами

```
PaymentTab.vue
    │ (uses)
    ├──→ payments.store
    │    └──→ paymentsApi.getStudentPayments()
    │        └──→ http.get()
    │
    ├──→ PaymentBalance.vue
    │    └──→ (читает) payments.student
    │
    └──→ PaymentPrograms.vue
         ├──→ (читает) payments.programs
         ├──→ (меняет) payments.activeYear/Month
         │
         ├──→ PaymentMonthDetail.vue
         │    ├──→ (читает) payments.currentMonth()
         │    ├──→ paymentsApi.getTransactions()
         │    ├──→ paymentsApi.getKsefInvoices()
         │    └──→ modal.open('discount', ...)
         │         └──→ DiscountModal.vue
         │            └──→ paymentsApi.setDiscount()
         │
         ├──→ PaymentActions.vue
         │    ├──→ modal.open('pause', ...)
         │    ├──→ modal.open('discount', ...)
         │    ├──→ modal.open('tariff', ...)
         │    ├──→ modal.open('extra', ...)
         │    ├──→ modal.open('unlock', ...)
         │    ├──→ modal.open('groupSplit', ...)
         │    ├──→ modal.open('archive', ...)
         │    └──→ modal.open('resume', ...)
         │
         └──→ PaymentTransactions.vue
              ├──→ paymentsApi.getTransactions()
              └──→ (показывает) transaction history
```

---

## 🚀 Запуск операции - Full Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. USER INTERACTION                                                   │
├──────────────────────────────────────────────────────────────────────┤
│ Пользователь кликает кнопку в PaymentActions/PaymentMonthDetail      │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 2. MODAL INITIALIZATION                                              │
├──────────────────────────────────────────────────────────────────────┤
│ modal.open('operationId', payload)                                   │
│ Modal компонент получает данные из modal.store.payload               │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 3. FORM FILLING                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ Пользователь заполняет форму и кликает "Применить"                  │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 4. VALIDATION                                                        │
├──────────────────────────────────────────────────────────────────────┤
│ Проверка полей формы на валидность                                  │
│ Показ ошибок если есть                                              │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 5. API REQUEST                                                       │
├──────────────────────────────────────────────────────────────────────┤
│ await paymentsApi.operationMethod(formData)                          │
│ HTTP POST /api/payments/endpoint                                     │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 6. RESPONSE HANDLING                                                 │
├──────────────────────────────────────────────────────────────────────┤
│ Успех: await payments.loadStudent()                                 │
│ Ошибка: показать сообщение об ошибке                                │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 7. MODAL CLOSE & UI UPDATE                                          │
├──────────────────────────────────────────────────────────────────────┤
│ modal.close()                                                        │
│ Store данные обновляются → компоненты перерисовываются              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Styling & UI System

```
┌─────────────────────────────────────────────────────────────────┐
│                    Компоненты UI                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Base Components (из src/components/ui/):                        │
│ ├── UiButton.vue     - кнопки                                  │
│ ├── UiInput.vue      - текстовые поля                          │
│ ├── UiBadge.vue      - бэджи/ярлычки                           │
│ └── ...               - другие базовые компоненты              │
│                                                                 │
│ Modal Base:                                                     │
│ ├── BaseModal.vue    - базовое модальное окно                  │
│ ├── ModalHost.vue    - маршрутизатор модалей                   │
│ └── templates/*.vue  - конкретные модали                       │
│                                                                 │
│ Layout:                                                         │
│ ├── AppLayout.vue    - основной макет                          │
│ ├── AuthLayout.vue   - макет авторизации                       │
│ └── components/      - sidebar, topbar, etc.                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 Файлы и их роли

```
┌─────────────────────────────────────────────────────────────────┐
│ SRC/API                                                         │
├─────────────────────────────────────────────────────────────────┤
│ paymentsApi.ts      - все методы для платежей                  │
│ http.ts             - HTTP клиент (axios)                      │
│ mockDb.ts           - типы и структуры данных                  │
│ mockAdapter.ts      - имитация API для разработки              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SRC/STORES                                                      │
├─────────────────────────────────────────────────────────────────┤
│ payments.store.ts   - состояние платежей (Pinia)               │
│ modal.store.ts      - состояние модалей (Pinia)                │
│ auth.store.ts       - состояние аутентификации                 │
│ studentTabs.store.ts- состояние вкладок студента              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SRC/VIEWS/STUDENTS/COMPONENTS/PROFILE-TABS/PAYMENTS            │
├─────────────────────────────────────────────────────────────────┤
│ PaymentsTab.vue     - главный компонент вкладки                │
│ PaymentBalance.vue  - информационные карточки                  │
│ PaymentPrograms.vue - список программ (accordion)              │
│ PaymentMonthDetail.vue - детали месяца                         │
│ PaymentActions.vue  - кнопки действий                          │
│ PaymentTransactions.vue - история платежей                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SRC/MODALS/TEMPLATES                                            │
├─────────────────────────────────────────────────────────────────┤
│ PauseModal.vue      - модаль паузы                             │
│ DiscountModal.vue   - модаль скидки                            │
│ TariffModal.vue     - модаль тарифа                            │
│ ExtraModal.vue      - модаль доп. занятия                      │
│ UnlockModal.vue     - модаль разблокировки                     │
│ GroupSplitModal.vue - модаль разделения группы                │
│ ArchiveModal.vue    - модаль архивирования                     │
│ ResumeModal.vue     - модаль возобновления                     │
│ RefundModal.vue     - модаль возврата денег                    │
│ RefundOkModal.vue   - модаль подтверждения возврата           │
│ EditInvoiceModal.vue- модаль редактирования счета              │
│ KorektaModal.vue    - модаль коррекции                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SRC/LOCALES                                                     │
├─────────────────────────────────────────────────────────────────┤
│ en.json             - английская локализация                   │
│ ru.json             - русская локализация                      │
│ uk.json             - украинская локализация                   │
│ pl.json             - польская локализация                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Инструкция по добавлению новой операции

```
1. BACK-END PREPARATION (если нужно)
   └─ Убедиться что API endpoint существует

2. FRONT-END DEVELOPMENT
   ├─ Шаг 1: Добавить API метод в paymentsApi.ts
   ├─ Шаг 2: Создать ModalName.vue в modals/templates/
   ├─ Шаг 3: Зарегистрировать модаль:
   │  ├─ Добавить ID в modal.store.ts (ModalId type)
   │  ├─ Импортировать в ModalHost.vue
   │  └─ Добавить v-if условие
   ├─ Шаг 4: Добавить кнопку-триггер
   │  ├─ PaymentActions.vue или
   │  └─ PaymentMonthDetail.vue
   ├─ Шаг 5: Добавить локализацию в locales/*.json
   └─ Шаг 6: Тестировать (Mock и Real API)

3. TESTING
   ├─ Unit тесты (если требуется)
   ├─ Integration тесты
   ├─ Manual тестирование
   └─ Cross-browser тестирование

4. DEPLOYMENT
   ├─ Code review
   ├─ Merge in main branch
   └─ Deploy to production
```


