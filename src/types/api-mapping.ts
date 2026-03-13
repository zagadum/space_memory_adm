/**
 * API Data Mapping Types
 * Типы для соответствия данных между API и MockDB
 * 
 * @see API_MAPPING.md для подробной документации
 */

// ============================================================================
// Database Table Types (Backend)
// ============================================================================

/**
 * Таблица student - основная таблица студентов
 */
export interface DbStudent {
  id: number;
  surname: string;              // ⚠️ Фамилия (не имя!)
  lastname: string;             // ⚠️ Имя (не фамилия!)
  patronymic: string | null;
  email: string;
  dob: string | Date | null;    // Date of birth
  phone: string;
  phone_country: string;
  balance: number;
  sum_aboniment: number;
  date_finish: string | Date | null;
  enabled: boolean;
  blocked: boolean;
  deleted: boolean;
  parent1_surname: string | null;
  parent1_lastname: string | null;
  parent1_phone: string | null;
  parent1_phone_country: string | null;
  // ... другие поля
}

/**
 * Таблица student_payment - платежи студента
 */
export interface DbStudentPayment {
  id: number;
  student_id: number;
  date_pay: string | Date;
  date_finish: string | Date | null;
  sum_aboniment: number;
  aboniment_id: number | null;
  type_pay: string | null;      // 'online' | 'offline'
  discount: number;
  comment: string | null;
  enabled: boolean;              // ⚠️ = оплачен ли
  created_at: string | Date;
  updated_at: string | Date;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Основной ответ API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Ответ для студента с платежами
 */
export interface StudentPaymentsApiResponse {
  student: ApiStudentProfile;
  programs: ApiProgram[];
}

/**
 * Профиль студента в API ответе
 */
export interface ApiStudentProfile {
  id: string;
  initials: string;             // Computed: surname[0] + lastname[0]
  name: string;                 // Computed: surname + ' ' + lastname
  firstName: string;            // From DB: lastname (!)
  lastName: string;             // From DB: surname (!)
  email: string;
  birthDate: string;            // ISO 8601: YYYY-MM-DD
  age: number;                  // Computed: now - dob (может быть отрицательным!)
  phone: string;
  country: string;              // From: parent1_phone_country
  city: string;                 // ❌ Not implemented - empty string
  street: string;               // ❌ Not implemented - empty string
  apartment: string;            // ❌ Not implemented - empty string
  postalCode: string;           // ❌ Not implemented - empty string
  parentName: string;           // Computed: parent1_surname + ' ' + parent1_lastname
  parentFirstName: string;      // From: parent1_lastname
  parentLastName: string;       // From: parent1_surname
  parentPhone: string;          // From: parent1_phone
  parentRole: string;           // Constant: "родитель"
  parentPassport: string;       // ❌ Not implemented - empty string
  status: 'active' | 'inactive'; // Computed from: enabled
  statusColor: 'green' | 'gray'; // Computed from: enabled
  photoConsent: boolean;        // ❌ Not implemented - always false
  regComment: string;           // ❌ Not implemented - empty string
  totalBalance: {
    value: string;              // Formatted balance: "0.00"
    label: 'active' | 'debt';   // Computed: balance >= 0
    color: 'green' | 'red';     // Computed: balance >= 0
  };
  nextPay: {
    date: string;               // From: date_finish (YYYY-MM-DD or "")
    approx: string;             // ❌ Not implemented - empty string
  };
  enrollments: any[];           // ❌ Not implemented - empty array
}

/**
 * Программа обучения в API ответе
 */
export interface ApiProgram {
  id: string;                   // Generated: "prog_" + student_id
  name: string;                 // Computed: surname + ' ' + lastname
  sub: string;                  // Constant: "Основная программа"
  tariff: number;               // From: sum_aboniment
  balance: number;              // From: balance
  balanceLabel: 'active' | 'debt'; // Computed: balance >= 0
  barGradient: 'green' | 'red'; // Computed: balance >= 0
  years: Record<string, ApiMonthObj[]>; // Year -> 12 months
  transactions: any[];          // ❌ Not implemented - empty array
  extras: any[];                // ❌ Not implemented - empty array
}

/**
 * Объект месяца в помесячной сетке
 */
export interface ApiMonthObj {
  s: MonthStatus;               // Computed: enabled ? 'paid' : 'pending'
  payStatus?: PayStatus;        // Computed: enabled ? 'paid' : 'pending'
  a: number;                    // From: sum_aboniment
  ksef: KsefStatus;             // Constant: 'ok' for paid, null otherwise
  g1: number;                   // Constant: 4 (lessons count)
  g2: number;                   // Constant: 0 (second group)
  txDate?: string;              // From: date_pay (YYYY-MM-DD)
  // ❌ Not implemented fields:
  disc?: string;                // Discount type
  discAmt?: number;             // Discount amount
  lessons?: number;             // Lessons completed
  totalLessons?: number;        // Total lessons
  bonus?: boolean;              // Bonus month
  bonusDate?: string;           // Bonus date
}

// ============================================================================
// Status Types
// ============================================================================

export type MonthStatus = 
  | 'paid'      // Оплачен
  | 'pending'   // Ожидает оплаты
  | 'overdue'   // Просрочен
  | 'pause'     // Пауза
  | 'summer'    // Летние каникулы
  | 'partial'   // Частично оплачен
  | 'extra-paid' // Доп. оплата
  | 'extra-pending' // Ожидает доп. оплаты
  | 'future';   // Будущий месяц

export type PayStatus = 
  | 'paid'      // Оплачен
  | 'pending'   // Ожидает
  | 'overdue';  // Просрочен

export type KsefStatus = 
  | 'ok'        // Счёт выставлен
  | 'manual'    // Ручной счёт
  | 'pending'   // Ожидает
  | 'error'     // Ошибка
  | 'conflict'  // Конфликт
  | null;       // Нет счёта

// ============================================================================
// Mapping Helper Functions
// ============================================================================

/**
 * Преобразование DbStudent в ApiStudentProfile
 */
export function mapDbStudentToApiProfile(student: DbStudent): ApiStudentProfile {
  const dob = student.dob ? new Date(student.dob) : null;
  const dateFinish = student.date_finish ? new Date(student.date_finish) : null;
  // Use full date diff (not just year) to avoid ±1 year error
  const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000)) : 0;

  return {
    id: String(student.id),
    initials: (student.surname?.[0] || '') + (student.lastname?.[0] || ''),
    name: `${student.surname || ''} ${student.lastname || ''}`.trim(),
    firstName: student.lastname || '',
    lastName: student.surname || '',
    email: student.email || '',
    birthDate: dob ? dob.toISOString().split('T')[0] : '',
    age,
    phone: student.phone || '',
    country: student.parent1_phone_country || 'PL',
    city: '',
    street: '',
    apartment: '',
    postalCode: '',
    parentName: `${student.parent1_surname || ''} ${student.parent1_lastname || ''}`.trim(),
    parentFirstName: student.parent1_lastname || '',
    parentLastName: student.parent1_surname || '',
    parentPhone: student.parent1_phone || '',
    parentRole: 'родитель',
    parentPassport: '',
    status: student.enabled ? 'active' : 'inactive',
    statusColor: student.enabled ? 'green' : 'gray',
    photoConsent: false,
    regComment: '',
    totalBalance: {
      value: student.balance.toFixed(2),
      label: student.balance >= 0 ? 'active' : 'debt',
      color: student.balance >= 0 ? 'green' : 'red',
    },
    nextPay: {
      date: dateFinish ? dateFinish.toISOString().split('T')[0] : '',
      approx: '',
    },
    enrollments: [],
  };
}

/**
 * Преобразование массива DbStudentPayment в структуру years
 */
export function mapPaymentsToYears(payments: DbStudentPayment[]): Record<string, ApiMonthObj[]> {
  const years: Record<string, ApiMonthObj[]> = {};

  for (const payment of payments) {
    const datePay = new Date(payment.date_pay);
    const year = datePay.getFullYear().toString();
    const monthIndex = datePay.getMonth(); // 0-11

    if (!years[year]) {
      years[year] = Array.from({ length: 12 }, () => ({
        s: 'future',
        a: 0,
        ksef: null,
        g1: 0,
        g2: 0,
      }));
    }

    years[year][monthIndex] = {
      s: payment.enabled ? 'paid' : 'pending',
      payStatus: payment.enabled ? 'paid' : 'pending',
      a: payment.sum_aboniment,
      ksef: 'ok',
      g1: 4,
      g2: 0,
      txDate: datePay.toISOString().split('T')[0],
    };
  }

  return years;
}

/**
 * Создание ApiProgram из DbStudent и DbStudentPayment[]
 */
export function mapDbStudentToApiProgram(
  student: DbStudent,
  payments: DbStudentPayment[]
): ApiProgram {
  return {
    id: `prog_${student.id}`,
    name: `${student.surname || ''} ${student.lastname || ''}`.trim(),
    sub: 'Основная программа',
    tariff: student.sum_aboniment,
    balance: student.balance,
    balanceLabel: student.balance >= 0 ? 'active' : 'debt',
    barGradient: student.balance >= 0 ? 'green' : 'red',
    years: mapPaymentsToYears(payments),
    transactions: [],
    extras: [],
  };
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Проверка валидности возраста
 */
export function isValidAge(age: number): boolean {
  return age >= 0 && age <= 100;
}

/**
 * Проверка валидности даты рождения
 */
export function isValidBirthDate(birthDate: string): boolean {
  const date = new Date(birthDate);
  const now = new Date();
  return date < now && date > new Date('1920-01-01');
}

/**
 * Исправление отрицательного возраста
 */
export function fixNegativeAge(age: number): number {
  return Math.max(0, age);
}

