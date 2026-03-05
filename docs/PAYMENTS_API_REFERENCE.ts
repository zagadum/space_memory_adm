/**
 * PAYMENTS TAB API REFERENCE
 * Полный справочник по API и диалоговым окнам для вкладки "Оплаты"
 * 
 * Маршрут: /students/s_{studentId}/payments
 */

import type { Transaction, KsefInvoice, Program, StudentProfile } from "@/api/mockDb";

/**
 * ОСНОВНЫЕ API МЕТОДЫ
 */

// 1. Загрузка платежей студента
export interface StudentPaymentsResponse {
  student: StudentProfile;
  programs: Program[];
}
// GET api/payments/student/{studentId}

// 2. Получение транзакций
export interface TransactionsResponse {
  items: Transaction[];
}
// GET api/payments/transactions?programId={programId}

// 3. Получение KSeF счетов
export interface KsefInvoicesResponse {
  items: KsefInvoice[];
}
// GET api/payments/ksef-invoices?programId={programId}

/**
 * ОПЕРАЦИИ С ПЛАТЕЖАМИ
 */

// 4. Возврат денег (Refund)
export interface RefundPayload {
  fvnum: string;
  amount?: number;
  reason?: string;
  type?: string;
  description?: string;
  method?: string;
  iban?: string;
}
export interface RefundResponse {
  id: string;
  status: string;
  createdAt: string;
}
// POST api/payments/refund

// 5. Редактирование счета (Invoice)
export interface EditInvoicePayload {
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
}
export interface EditInvoiceResponse {
  ok: boolean;
  fvnum: string;
}
// POST api/payments/invoice

// 6. Коррекция (Correction/Korekta)
export interface CorrectionPayload {
  programId: string;
  monthIndex?: number;
  year?: string;
  amount: number;
  note?: string;
  corrDate?: string;
}
export interface CorrectionResponse {
  ok: boolean;
  correctionId: string;
}
// POST api/payments/correction

/**
 * УПРАВЛЕНИЕ ПРОГРАММАМИ
 */

// 7. Изменение тарифа (Tariff)
export interface ChangeTariffPayload {
  programId: string;
  value: number;
  fromMonthIndex: number;
}
export interface ChangeTariffResponse {
  ok: boolean;
  programId: string;
  value: number;
}
// POST api/payments/tariff

// 8. Пауза (Pause)
export interface SetPausePayload {
  programId: string;
  from: string;        // YYYY-MM-DD
  to: string;          // YYYY-MM-DD
  reason?: string;     // trips | exams | family | other | complaint
  comment?: string;
}
export interface SetPauseResponse {
  ok: boolean;
}
// POST api/payments/pause

// 9. Скидка (Discount)
export interface SetDiscountPayload {
  programId: string;
  kind: string;        // family | referral | loyalty | complaint | promo
  value: number;       // в зл или %
  fromMonthIndex: number;
}
export interface SetDiscountResponse {
  ok: boolean;
}
// POST api/payments/discount

// 10. Дополнительные занятия (Extra)
export interface AddExtraPayload {
  programId: string;
  date: string;        // YYYY-MM-DD
  title: string;
  amount: number;
}
export interface AddExtraResponse {
  ok: boolean;
  extraId: string;
}
// POST api/payments/extra

// 11. Разблокирование (Unlock)
export interface UnlockPayload {
  programId: string;
}
export interface UnlockResponse {
  ok: boolean;
}
// POST api/payments/unlock

// 12. Разделение группы (Group Split)
export interface SplitPayload {
  programId: string;
  fromGroup: string;
  toGroup: string;
  effectiveDate: string;  // YYYY-MM-DD
}
export interface SplitResponse {
  ok: boolean;
}
// POST api/payments/split

// 13. Архивирование (Archive)
export interface ArchivePayload {
  programId: string;
  reason?: string;
  endDate?: string;     // YYYY-MM-DD
  comment?: string;
}
export interface ArchiveResponse {
  ok: boolean;
}
// POST api/payments/archive

// 14. Возобновление (Resume)
export interface ResumePayload {
  programId: string;
}
export interface ResumeResponse {
  ok: boolean;
}
// POST api/payments/resume

/**
 * ТИПЫ ДИАЛОГОВЫХ ОКОН
 */

export interface PaymentModalPayloads {
  pause: { programId: string };
  discount: { programId: string; monthIndex?: number; year?: string };
  tariff: { programId: string; monthIndex?: number; year?: string };
  extra: { programId: string };
  unlock: { programId: string };
  'group-split': { programId: string; monthIndex?: number; year?: string };
  archive: { programId: string };
  resume: { programId: string };
  refund: { fvnum: string };
  'edit-invoice': { programId: string; fvnum: string; monthIndex?: number; year?: string };
  korekta: { programId: string; monthIndex?: number; year?: string };
}

/**
 * ДИАЛОГОВЫЕ ОКНА (MODALS)
 * 
 * Все модальные окна используют useModalStore():
 * 
 * import { useModalStore } from "@/stores/modal.store";
 * const modal = useModalStore();
 * 
 * modal.open(modalId, payload);
 * modal.close();
 */

export const PAYMENTS_MODALS = {
  PAUSE: 'pause',              // 🌙 Установить паузу
  DISCOUNT: 'discount',        // 🏷️ Применить скидку
  TARIFF: 'tariff',            // 💱 Изменить тариф
  EXTRA: 'extra',              // ➕ Добавить дополнительное занятие
  UNLOCK: 'unlock',            // 🔓 Разблокировать
  GROUP_SPLIT: 'groupSplit',   // 🔄 Разделить группу
  ARCHIVE: 'archive',          // 📦 Архивировать
  RESUME: 'resume',            // ▶ Возобновить
  REFUND: 'refund',            // Возврат денег
  REFUND_OK: 'refund-ok',      // Подтверждение возврата
  EDIT_INVOICE: 'edit-invoice',// Редактировать счет
  KOREKTA: 'korekta',          // Коррекция
} as const;

/**
 * КОМПОНЕНТЫ, ИСПОЛЬЗУЮЩИЕ ПЛАТЕЖНЫЕ API
 */

export const PAYMENTS_COMPONENTS = {
  // Основной компонент вкладки
  PaymentTab: 'src/views/students/components/profile-tabs/PaymentsTab.vue',
  
  // Подкомпоненты
  PaymentBalance: 'src/views/students/components/profile-tabs/payments/PaymentBalance.vue',
  PaymentPrograms: 'src/views/students/components/profile-tabs/payments/PaymentPrograms.vue',
  PaymentMonthDetail: 'src/views/students/components/profile-tabs/payments/PaymentMonthDetail.vue',
  PaymentActions: 'src/views/students/components/profile-tabs/payments/PaymentActions.vue',
  PaymentTransactions: 'src/views/students/components/profile-tabs/payments/PaymentTransactions.vue',
} as const;

/**
 * МОДАЛЬНЫЕ ОКНА
 */

export const PAYMENTS_MODAL_COMPONENTS = {
  PauseModal: 'src/modals/templates/PauseModal.vue',
  DiscountModal: 'src/modals/templates/DiscountModal.vue',
  TariffModal: 'src/modals/templates/TariffModal.vue',
  ExtraModal: 'src/modals/templates/ExtraModal.vue',
  UnlockModal: 'src/modals/templates/UnlockModal.vue',
  GroupSplitModal: 'src/modals/templates/GroupSplitModal.vue',
  ArchiveModal: 'src/modals/templates/ArchiveModal.vue',
  ResumeModal: 'src/modals/templates/ResumeModal.vue',
  RefundModal: 'src/modals/templates/RefundModal.vue',
  RefundOkModal: 'src/modals/templates/RefundOkModal.vue',
  EditInvoiceModal: 'src/modals/templates/EditInvoiceModal.vue',
  KorektaModal: 'src/modals/templates/KorektaModal.vue',
} as const;

/**
 * ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
 */

export const PAYMENTS_API_EXAMPLES = {
  /**
   * Пример 1: Установка паузы
   */
  setPauseExample: `
    import { paymentsApi } from '@/api/paymentsApi';
    import { useModalStore } from '@/stores/modal.store';
    import { usePaymentsStore } from '@/stores/payments.store';

    const modal = useModalStore();
    const payments = usePaymentsStore();

    // Открыть модальное окно паузы
    modal.open('pause', { programId: 'prog-001' });

    // После заполнения формы (в PauseModal.vue):
    await paymentsApi.setPause({
      programId: 'prog-001',
      from: '2026-03-10',
      to: '2026-05-10',
      reason: 'trips',
      comment: 'Spring vacation'
    });

    // Перезагрузить данные
    await payments.loadStudent();
  `,

  /**
   * Пример 2: Применение скидки
   */
  setDiscountExample: `
    modal.open('discount', {
      programId: 'prog-001',
      monthIndex: 2,  // Март (0-based)
      year: 2026
    });

    await paymentsApi.setDiscount({
      programId: 'prog-001',
      kind: 'family',
      value: 50,
      fromMonthIndex: 2
    });

    await payments.loadStudent();
  `,

  /**
   * Пример 3: Добавление дополнительного занятия
   */
  addExtraExample: `
    modal.open('extra', { programId: 'prog-001' });

    await paymentsApi.addExtra({
      programId: 'prog-001',
      date: '2026-03-15',
      title: 'Extra Math Lesson',
      amount: 80
    });

    await payments.loadStudent();
  `,

  /**
   * Пример 4: Изменение тарифа
   */
  changeTariffExample: `
    modal.open('tariff', {
      programId: 'prog-001',
      monthIndex: 0,
      year: 2026
    });

    await paymentsApi.changeTariff({
      programId: 'prog-001',
      value: 500,
      fromMonthIndex: 0
    });

    await payments.loadStudent();
  `,

  /**
   * Пример 5: Возврат денег
   */
  submitRefundExample: `
    modal.open('refund', { fvnum: 'FV/2026/001' });

    await paymentsApi.submitRefund({
      fvnum: 'FV/2026/001',
      amount: 200,
      reason: 'Student request',
      method: 'bank_transfer',
      iban: 'PL12345...'
    });

    modal.openModal('refund-ok');
  `,
} as const;

/**
 * ПОТОК ДАННЫХ
 */

export const PAYMENTS_DATA_FLOW = `
1. ИНИЦИАЛИЗАЦИЯ (PaymentsTab.vue)
   ↓
   payments.store.ts → loadStudent()
   ↓
   paymentsApi.getStudentPayments(studentId)
   ↓
   GET /api/payments/student/{studentId}
   ↓
   Заполнение Pinia store

2. ОТОБРАЖЕНИЕ
   ↓
   PaymentBalance.vue → общие балансы
   PaymentPrograms.vue → список программ с месяцами
   ├── PaymentMonthDetail.vue → детали месяца
   ├── PaymentActions.vue → кнопки действий
   └── PaymentTransactions.vue → история платежей

3. ДЕЙСТВИЕ (example: setPause)
   ↓
   Клик: PaymentActions.vue → modal.open('pause', { programId })
   ↓
   PauseModal.vue отобразится
   ↓
   Пользователь заполняет форму
   ↓
   Клик "Применить"
   ↓
   paymentsApi.setPause(payload)
   ↓
   POST /api/payments/pause
   ↓
   payments.loadStudent() (перезагрузка)
   ↓
   UI обновляется с новыми данными
   ↓
   modal.close()
`;

/**
 * КОНТРОЛЬНЫЙ СПИСОК ДЛЯ РАЗРАБОТЧИКА
 */

export const DEVELOPMENT_CHECKLIST = [
  '[ ] Добавить метод в src/api/paymentsApi.ts',
  '[ ] Создать модальное окно в src/modals/templates/',
  '[ ] Добавить ID модали в stores/modal.store.ts (ModalId type)',
  '[ ] Добавить импорт и v-if условие в ModalHost.vue',
  '[ ] Добавить кнопку-триггер в компонент (PaymentActions, PaymentMonthDetail и т.д.)',
  '[ ] Добавить локализованные тексты в locales/*.json',
  '[ ] Реализовать валидацию формы в модальном окне',
  '[ ] Добавить обработку ошибок (try-catch, errorMessage)',
  '[ ] Добавить await payments.loadStudent() после успешного API вызова',
  '[ ] Добавить modal.close() после успешной операции',
  '[ ] Тестировать с VITE_USE_MOCK=true',
  '[ ] Тестировать с реальным API',
  '[ ] Проверить типизацию TypeScript (no-any)',
  '[ ] Добавить юнит-тесты если требуется',
];

/**
 * ПОЛЕЗНЫЕ ССЫЛКИ И РЕСУРСЫ
 */

export const RESOURCES = {
  // API
  apiFile: 'src/api/paymentsApi.ts',
  mockDbFile: 'src/api/mockDb.ts',
  httpFile: 'src/api/http.ts',

  // Stores
  paymentsStore: 'src/stores/payments.store.ts',
  modalStore: 'src/stores/modal.store.ts',

  // Components
  paymentsTabDir: 'src/views/students/components/profile-tabs/payments/',
  modalsDir: 'src/modals/templates/',

  // Config
  localesDir: 'src/locales/',
  envFile: '.env.local',

  // Documentation
  documentationFile: 'API_PAYMENTS_GUIDE.md',
  routerFile: 'src/app/router.ts',
};

/**
 * СТАТУСЫ МЕСЯЦЕВ
 */

export const MONTH_STATUSES = {
  PAID: 'paid',              // ✓ Оплачено
  PENDING: 'pending',        // ⏳ Ожидает оплаты
  OVERDUE: 'overdue',        // ⚠️ Просрочено
  PAUSE: 'pause',            // 🌙 Пауза
  SUMMER: 'summer',          // ☀️ Летние каникулы
  PARTIAL: 'partial',        // ⚫ Частичная пауза
  EXTRA: 'extra*',           // ⭐ Дополнительное занятие
} as const;

/**
 * ТИПЫ СКИДОК
 */

export const DISCOUNT_TYPES = {
  FAMILY: 'family',          // Семейная
  REFERRAL: 'referral',      // По рекомендации
  LOYALTY: 'loyalty',        // Лояльность
  COMPLAINT: 'complaint',    // Компенсация
  PROMO: 'promo',           // Промо-код
} as const;

/**
 * ПРИЧИНЫ ПАУЗЫ
 */

export const PAUSE_REASONS = {
  TRIPS: 'trips',            // Путешествие / отпуск
  EXAMS: 'exams',            // Экзамены / учеба
  FAMILY: 'family',          // Семейные обстоятельства
  OTHER: 'other',            // Другое
  COMPLAINT: 'complaint',    // Жалоба / Компенсация
} as const;

