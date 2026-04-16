// ─────────────────────────────────────────────────────────────
// Type aliases
// ─────────────────────────────────────────────────────────────
export type PayStatus = "paid" | "pending" | "overdue";
export type MonthStatus =
  | "paid"
  | "pending"
  | "overdue"
  | "pause"
  | "summer"
  | "partial"
  | "extra-paid"
  | "extra-pending"
  | "future";

export type KsefStatus = "ok" | "manual" | "pending" | "error" | "conflict" | null;

// ─────────────────────────────────────────────────────────────
// MonthObj — главная единица помесячной сетки
// ─────────────────────────────────────────────────────────────
export interface MonthObj {
  s: MonthStatus;               // статус месяца
  payStatus?: PayStatus | null; // статус оплаты
  a: number;                    // сумма (zł)
  ksef: KsefStatus;             // статус KSeF
  g1: number;                   // кол-во занятий группа 1
  g2: number;                   // кол-во занятий группа 2
  split?: boolean;              // разделение групп
  groupSplit?: GroupSplitDetail[];  // детализация разделения
  disc?: string;                // тип скидки (family, referral, loyalty, complaint, promo)
  discAmt?: number;             // размер скидки (zł)
  txDate?: string;              // дата транзакции
  bonus?: boolean;              // бонусный месяц
  bonusDate?: string;           // дата бонуса
  teacher?: string;             // преподаватель
  pauseUntil?: string;          // пауза до
  pauseFrom?: string;           // пауза с
  returnDate?: string;          // дата возврата
  lessons?: number;             // занятий проведено
  totalLessons?: number;        // занятий всего
}

// Обратная совместимость — алиас
export type MonthItem = MonthObj;

// ─────────────────────────────────────────────────────────────
// Program
// ─────────────────────────────────────────────────────────────
export interface ExtraPurchase {
  id: string;
  icon: string;
  title: string;
  price: number;
  date: string | null;
  txId: string | null;
  ksef: 'ok' | 'pending' | 'none';
  status: 'paid' | 'pending';
}

export interface GroupSplitDetail {
  group: string;
  teacher: string;
  lessons: number;
  amount?: number;
  dates?: string[];
  reason?: string;
}

export interface KsefInvoice {
  fvnum: string;
  title: string;
  status: string;
  statusClass: string;
}

export interface ProgramTransaction {
  date: string;
  title: string;
  sub: string;
  amount: string;
  paid: boolean;
  ksef: string | null;
  fvnum: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface Transaction {
  id: string;
  date: string;
  title: string;
  sub?: string;
  amount: number;
  amountFmt?: string;
  status: "paid" | "pending";
  type: "month" | "extra";
  ksef?: "ok" | "pending" | "conflict" | "error" | null;
  fvnum?: string | null;
  documentId?: number | string | null;
}

export interface Program {
  id: string;
  name: string;
  sub: string;
  tariff: number;
  balance: number;
  balanceLabel: string;
  barGradient: string;
  years: Record<string, MonthObj[]>;
  transactions: ProgramTransaction[];
  extras?: ExtraPurchase[];
}

// ─────────────────────────────────────────────────────────────
// Student & Enrollment
// ─────────────────────────────────────────────────────────────
export interface StudentProfile {
  id: string;
  initials: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  country: string;
  city: string;
  street: string;
  apartment: string;
  postalCode: string;
  age: number;
  parentName: string;
  parentFirstName: string;
  parentLastName: string;
  parentPhone: string;
  parentRole: string;
  parentPassport: string;
  phone: string;
  status: string;
  statusColor: string;
  photoConsent: boolean;
  regComment: string;
  totalBalance: { value: string; label: string; color: string };
  nextPay: { date: string; approx: string };
  enrollments: Enrollment[];
}

export interface Enrollment {
  school: string;
  group: string;
  teacher: string;
  lessons: Array<{
    id: string;
    date: string;
    block: string;
    theme: string;
    element: string;
    teacher: string;
    attendance: string;
    status: string;
  }>;
}

// ─────────────────────────────────────────────────────────────
// Teachers DB
// ─────────────────────────────────────────────────────────────
export const TEACHERS_DB = [
  { id: 't1', name: 'Клара Левит', group: 'Вт 17 Младшая', schedule: 'Вт 17:00', dow: 2 },
  { id: 't2', name: 'Пиотр Ивановски', group: 'Ср 15 Младшая', schedule: 'Ср 15:00', dow: 3 },
  { id: 't3', name: 'Анна Новак', group: 'Пт 19 Старшая', schedule: 'Пт 19:00', dow: 5 },
  { id: 't4', name: 'Мария Ковальска', group: 'Чт 16 Средняя', schedule: 'Чт 16:00', dow: 4 },
  { id: 't5', name: 'Ханна Боян', group: 'Ср 15 Младшая', schedule: 'Ср 15:00', dow: 3 }
];

// ─────────────────────────────────────────────────────────────
// Mock DB
// ─────────────────────────────────────────────────────────────
export const mockDb: { me: AdminUser; students: Record<string, { profile: StudentProfile; programs: Program[] }> } = {
  me: { id: "u_1", email: "admin@demo.local", name: "Demo Admin" },
  students: {
    s_1: {
      profile: {
        id: "s_1",
        initials: "ИИ",
        name: "Иван Иванов",
        firstName: "Иван",
        lastName: "Иванов",
        email: "ivan.ivanov@gmail.com",
        birthDate: "2012-05-15",
        country: "Польша",
        city: "Варшава",
        street: "Aleje Jerozolimskie 100",
        apartment: "12",
        postalCode: "00-001",
        age: 12,
        parentName: "Марина Иванова",
        parentFirstName: "Марина",
        parentLastName: "Иванова",
        parentPhone: "+48 777 000 222",
        parentRole: "мама",
        parentPassport: "AB 1234567",
        phone: "+48 777 000 111",
        status: "Активна",
        statusColor: "var(--green)",
        photoConsent: true,
        regComment: "Хочет заниматься по выходным",
        totalBalance: { value: "+220 zł", label: "переплата", color: "var(--green)" },
        nextPay: { date: "01.03.2026", approx: "~837 зл · с учётом скидок" },
        enrollments: [
          {
            school: 'Space Memory',
            group: 'Вт 17 Младшая',
            teacher: 'Клара Левит',
            lessons: [
              { id: 'm1', date: '10.03.2026', block: 'Память', theme: 'Ассоциации', element: 'Слова', teacher: 'Клара Левит', attendance: 'Присутствовал', status: 'Оплачено' },
              { id: 'm2', date: '17.03.2026', block: 'Техники', theme: 'Дворец памяти', element: 'Локации', teacher: 'Клара Левит', attendance: 'Присутствовал', status: 'Оплачено' }
            ]
          },
          {
            school: 'Speedy Mind Indigo',
            group: 'Ср 15 Младшая',
            teacher: 'Ханна Боян',
            lessons: [
              { id: 'l1', date: '12.03.2026', block: 'Сложение', theme: 'Просто друзья', element: '1', teacher: 'Ханна Боян', attendance: 'Присутствовал', status: 'Оплачено' },
              { id: 'l2', date: '14.03.2026', block: 'Сложение', theme: 'Маленькие друзья', element: '10', teacher: 'Ханна Боян', attendance: 'Присутствовал', status: 'Оплачено' },
              { id: 'l3', date: '19.03.2026', block: 'Вычитание', theme: 'Большие друзья', element: '100', teacher: 'Ханна Боян', attendance: 'Отсутствовал', status: 'Отработка' },
              { id: 'l4', date: '21.03.2026', block: 'Умножение', theme: 'Семья', element: '1000', teacher: 'Ханна Боян', attendance: 'Будет', status: 'Ожидает' },
              { id: 'l5', date: '26.03.2026', block: 'Ментально', theme: 'Анзан', element: '1-100', teacher: 'Ханна Боян', attendance: 'Будет', status: 'Ожидает' }
            ]
          }
        ]
      },
      programs: [
        {
          id: "space",
          name: "🌌 Space Memory",
          sub: "Вт 17 Младшая · Вт 17:00 · Клара Левит · 490 зл/мес · 👦 1-й ребёнок · без скидки",
          tariff: 490,
          balance: 120,
          balanceLabel: "переплата",
          barGradient: "linear-gradient(180deg,var(--blue),var(--purple))",
          years: {
            "2025": [
              { s: "paid", payStatus: "paid", a: 490, ksef: "ok", g1: 4, g2: 0, txDate: "03.01.2025", lessons: 4, totalLessons: 4 },
              { s: "paid", payStatus: "paid", a: 490, ksef: "ok", g1: 4, g2: 0, txDate: "02.02.2025", lessons: 4, totalLessons: 4 },
              { s: "paid", payStatus: "paid", a: 490, ksef: "ok", g1: 4, g2: 0, txDate: "01.03.2025", lessons: 4, totalLessons: 4 },
              { s: "paid", payStatus: "paid", a: 490, ksef: "ok", g1: 4, g2: 0, txDate: "01.04.2025", lessons: 4, totalLessons: 4 },
              { s: "paid", payStatus: "paid", a: 490, ksef: "ok", g1: 4, g2: 0, txDate: "05.05.2025", lessons: 4, totalLessons: 4 },
              { s: "paid", payStatus: "paid", a: 441, ksef: "ok", g1: 4, g2: 0, txDate: "02.06.2025", disc: "family", discAmt: 49, lessons: 4, totalLessons: 4 },
              { s: "summer", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "summer", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "paid", payStatus: "paid", a: 441, ksef: "ok", g1: 4, g2: 0, txDate: "01.09.2025", disc: "family", discAmt: 49, lessons: 4, totalLessons: 4 },
              { s: "paid", payStatus: "paid", a: 441, ksef: "ok", g1: 4, g2: 0, txDate: "01.10.2025", disc: "family", discAmt: 49, lessons: 4, totalLessons: 4 },
              { s: "paid", payStatus: "paid", a: 441, ksef: "ok", g1: 4, g2: 0, txDate: "03.11.2025", disc: "family", discAmt: 49, lessons: 4, totalLessons: 4 },
              { s: "paid", payStatus: "paid", a: 441, ksef: "ok", g1: 4, g2: 0, txDate: "01.12.2025", disc: "family", discAmt: 49, lessons: 4, totalLessons: 4 },
            ],
            "2026": [
              { s: "paid", payStatus: "paid", a: 441, ksef: "ok", g1: 4, g2: 0, txDate: "05.01.2026", disc: "family", discAmt: 49, lessons: 4, totalLessons: 4 },
              { s: "paid", payStatus: "paid", a: 441, ksef: "ok", g1: 4, g2: 0, txDate: "08.02.2026", disc: "family", discAmt: 49, lessons: 4, totalLessons: 4 },
              { s: "pending", payStatus: "pending", a: 441, ksef: null, g1: 4, g2: 0, lessons: 2, totalLessons: 5, bonus: true, bonusDate: "31.03.2026" },
              { s: "future", a: 441, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 441, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 441, ksef: null, g1: 0, g2: 0 },
              { s: "summer", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "summer", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 441, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 441, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 441, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 441, ksef: null, g1: 0, g2: 0 },
            ],
          },
          transactions: [
            { date: "08.02.2026", title: "Абонемент февраль 2026 ✓", sub: "Space Memory · Imoje", amount: "+441 зл", paid: true, ksef: "ok", fvnum: "FV/2026/02/091" },
            { date: "05.01.2026", title: "Абонемент январь 2026 ✓", sub: "Space Memory · Imoje", amount: "+441 зл", paid: true, ksef: "ok", fvnum: "FV/2026/01/045" },
          ],
        },
        {
          id: "indigo",
          name: "⚡ Speedy Mind Indigo",
          sub: "Ср 15 Младшая · Ср 15:00 · Ханна Боян · 450 зл/мес · 👧 2-й ребёнок · −10% семья",
          tariff: 450,
          balance: 100,
          balanceLabel: "переплата",
          barGradient: "linear-gradient(180deg,var(--purple),var(--pink))",
          years: {
            "2025": [
              { s: "future", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "summer", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "summer", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "paid", payStatus: "paid", a: 405, ksef: "ok", g1: 4, g2: 0, txDate: "01.09.2025", disc: "family", discAmt: 45, lessons: 4, totalLessons: 4 },
              { s: "paid", payStatus: "paid", a: 405, ksef: "ok", g1: 4, g2: 0, txDate: "02.10.2025", disc: "family", discAmt: 45, lessons: 4, totalLessons: 4 },
              { s: "paid", payStatus: "paid", a: 405, ksef: "ok", g1: 4, g2: 0, txDate: "03.11.2025", disc: "family", discAmt: 45, lessons: 4, totalLessons: 4 },
              { s: "paid", payStatus: "paid", a: 405, ksef: "ok", g1: 4, g2: 0, txDate: "01.12.2025", disc: "family", discAmt: 45, lessons: 4, totalLessons: 4 },
            ],
            "2026": [
              { s: "paid", payStatus: "paid", a: 405, ksef: "ok", g1: 4, g2: 0, txDate: "05.01.2026", disc: "family", discAmt: 45, lessons: 4, totalLessons: 4 },
              { s: "paid", payStatus: "paid", a: 405, ksef: "ok", g1: 4, g2: 0, txDate: "06.02.2026", disc: "family", discAmt: 45, lessons: 4, totalLessons: 4 },
              { s: "overdue", payStatus: "overdue", a: 405, ksef: "error", g1: 4, g2: 0, lessons: 3, totalLessons: 4 },
              { s: "future", a: 405, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 405, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 405, ksef: null, g1: 0, g2: 0 },
              { s: "summer", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "summer", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 405, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 405, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 405, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 405, ksef: null, g1: 0, g2: 0 },
            ],
          },
          transactions: [
            { date: "06.02.2026", title: "Абонемент февраль 2026 ✓", sub: "Indigo · Imoje", amount: "+405 зл", paid: true, ksef: "ok", fvnum: "FV/2026/02/092" },
            { date: "05.01.2026", title: "Абонемент январь 2026 ✓", sub: "Indigo · Imoje", amount: "+405 зл", paid: true, ksef: "ok", fvnum: "FV/2026/01/055" },
          ],
        },
        {
          id: "extras" as const,
          name: "📚 Доп. материалы и программы",
          sub: "Разовые услуги и товары",
          tariff: 0,
          balance: 450,
          balanceLabel: "оплачено",
          barGradient: "linear-gradient(180deg,var(--amber),var(--orange))",
          years: {},
          transactions: [],
          extras: [
            { id: "ext_1", icon: "🏆", title: "Олимпиада онлайн 2026", price: 150, date: "15.01.2026", txId: "#TXN-2026-0312", ksef: "ok", status: "paid" },
            { id: "ext_2", icon: "🧮", title: "Счёты детские", price: 180, date: "10.02.2026", txId: "#TXN-2026-0445", ksef: "ok", status: "paid" },
            { id: "ext_3", icon: "👩‍💼", title: "1-месячный курс для родителей", price: 120, date: null, txId: null, ksef: "pending", status: "pending" },
          ],
        },
      ],
    },
    s_2: {
      profile: {
        id: "s_2",
        initials: "МС",
        name: "Мария Смирнова",
        firstName: "Мария",
        lastName: "Смирнова",
        email: "mariya.sm@gmail.com",
        birthDate: "2014-08-20",
        country: "Польша",
        city: "Варшава",
        street: "Marszałkowska 10",
        apartment: "5",
        postalCode: "00-202",
        age: 10,
        parentName: "Елена Смирнова",
        parentFirstName: "Елена",
        parentLastName: "Смирнова",
        parentPhone: "+48 987 654 321",
        parentRole: "мама",
        parentPassport: "CD 7654321",
        phone: "+48 987 654 321",
        status: "Активна",
        statusColor: "var(--green)",
        photoConsent: true,
        regComment: "Очень талантливая девочка",
        totalBalance: { value: "+150 zł", label: "переплата", color: "var(--green)" },
        nextPay: { date: "05.03.2026", approx: "~420 зл" },
        enrollments: [
          { school: 'Speedy Mind Indigo', group: 'Ср 15 Младшая', teacher: 'Пиотр Ивановски', lessons: [] }
        ]
      },
      programs: [
        {
          id: "indigo",
          name: "⚡ Speedy Mind Indigo",
          sub: "Ср 15 Младшая · Ср 15:00 · Пиотр Ивановски · 450 зл/мес · 👦 1-й ребёнок · без скидки",
          tariff: 450,
          balance: 150,
          balanceLabel: "переплата",
          barGradient: "linear-gradient(180deg,var(--purple),var(--pink))",
          years: {
            "2026": [
              { s: "paid", payStatus: "paid", a: 450, ksef: "ok", g1: 4, g2: 0, txDate: "10.01.2026", lessons: 4, totalLessons: 4 },
              { s: "pending", payStatus: "pending", a: 450, ksef: null, g1: 4, g2: 0, lessons: 2, totalLessons: 4 },
              { s: "future", a: 450, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 450, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 450, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 450, ksef: null, g1: 0, g2: 0 },
              { s: "summer", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "summer", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 450, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 450, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 450, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 450, ksef: null, g1: 0, g2: 0 },
            ],
          },
          transactions: [],
        },
      ],
    },
    s_3: {
      profile: {
        id: "s_3",
        initials: "КК",
        name: "Кирилл Козлов",
        firstName: "Кирилл",
        lastName: "Козлов",
        email: "kirill.kozlov@mail.ru",
        birthDate: "2013-03-10",
        country: "Польша",
        city: "Варшава",
        street: "Nowy Świat 40",
        apartment: "7",
        postalCode: "00-303",
        age: 11,
        parentName: "Олег Козлов",
        parentFirstName: "Олег",
        parentLastName: "Козлов",
        parentPhone: "+48 111 222 333",
        parentRole: "папа",
        parentPassport: "EF 9876543",
        phone: "+48 111 222 333",
        status: "Должник",
        statusColor: "var(--red)",
        photoConsent: false,
        regComment: "Нужно напоминать об оплате",
        totalBalance: { value: "-490 zł", label: "задолженность", color: "var(--red)" },
        nextPay: { date: "10.02.2026", approx: "СРОЧНО: 490 зл" },
        enrollments: [
          { school: 'Space Memory', group: 'Пт 19 Старшая', teacher: 'Анна Новак', lessons: [] }
        ]
      },
      programs: [
        {
          id: "space",
          name: "🌌 Space Memory",
          sub: "Пт 19 Старшая · Пт 19:00 · Анна Новак · 490 зл/мес · 👦 1-й ребёнок · без скидки",
          tariff: 490,
          balance: -490,
          balanceLabel: "задолженность",
          barGradient: "linear-gradient(180deg,var(--blue),var(--purple))",
          years: {
            "2026": [
              { s: "overdue", payStatus: "overdue", a: 490, ksef: "error", g1: 0, g2: 0 },
              { s: "future", a: 490, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 490, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 490, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 490, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 490, ksef: null, g1: 0, g2: 0 },
              { s: "summer", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "summer", a: 0, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 490, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 490, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 490, ksef: null, g1: 0, g2: 0 },
              { s: "future", a: 490, ksef: null, g1: 0, g2: 0 },
            ],
          },
          transactions: [],
        },
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────────
// NEW FINANCE MOCK DATA
// ─────────────────────────────────────────────────────────────

export const MOCK_INVOICES = [
  {
    id: 1,
    student_id: 1,
    project_id: 1,
    number: 'FA/SM/2026/03/001',
    document_type: 'FA',
    issue_date: '2026-03-01',
    sale_date: '2026-03-01',
    due_date: '2026-03-15',
    amount_net: 406.50,
    vat_value: 0,
    amount_gross: 406.50,
    vat_rate: 'zw',
    currency: 'PLN',
    buyer_name: 'Иван Иванов',
    buyer_address: 'Aleje Jerozolimskie 100, 00-001 Warszawa',
    ksef_status: 'sent',
    project: { id: 1, name: 'Space Memory', code: 'SM' }
  },
  {
    id: 2,
    student_id: 2,
    project_id: 2,
    number: 'FA/IND/2026/03/002',
    document_type: 'FA',
    issue_date: '2026-03-02',
    sale_date: '2026-03-02',
    due_date: '2026-03-16',
    amount_net: 450.00,
    vat_value: 0,
    amount_gross: 450.00,
    vat_rate: 'zw',
    currency: 'PLN',
    buyer_name: 'Мария Петрова',
    buyer_address: 'Marszałkowska 10, 00-202 Warszawa',
    ksef_status: 'paid',
    payment_date: '2026-03-05',
    project: { id: 2, name: 'Speedy Mind Indigo', code: 'IND' }
  },
  {
    id: 3,
    student_id: 3,
    project_id: 1,
    number: 'FA/SM/2026/03/003',
    document_type: 'PROFORMA',
    issue_date: '2026-03-10',
    sale_date: '2026-03-10',
    due_date: '2026-03-24',
    amount_net: 490.00,
    vat_value: 0,
    amount_gross: 490.00,
    vat_rate: 'zw',
    currency: 'PLN',
    buyer_name: 'Кирилл Козлов',
    buyer_address: 'Nowy Świat 40, 00-303 Warszawa',
    ksef_status: 'draft',
    project: { id: 1, name: 'Space Memory', code: 'SM' }
  },
  {
    id: 4,
    student_id: 4,
    project_id: 1,
    number: 'FK/SM/2026/03/001',
    document_type: 'FK',
    issue_date: '2026-03-12',
    sale_date: '2026-03-12',
    due_date: '2026-03-12',
    amount_net: -50.00,
    vat_value: 0,
    amount_gross: -50.00,
    vat_rate: 'zw',
    currency: 'PLN',
    buyer_name: 'Елена Смирнова',
    buyer_address: 'ul. Testowa 1, Warszawa',
    ksef_status: 'sent',
    project: { id: 1, name: 'Space Memory', code: 'SM' }
  },
  {
    id: 5,
    student_id: 5,
    project_id: 2,
    number: 'FV/B2B/2026/03/001',
    document_type: 'FA',
    issue_date: '2026-03-15',
    sale_date: '2026-03-15',
    due_date: '2026-03-29',
    amount_net: 1000.00,
    vat_value: 230.00,
    amount_gross: 1230.00,
    vat_rate: '23%',
    currency: 'PLN',
    buyer_name: 'Tech Solutions Sp. z o.o.',
    buyer_tax_id: 'PL1234567890',
    buyer_address: 'ul. Business 10, 00-002 Warszawa',
    ksef_status: 'error',
    project: { id: 2, name: 'Speedy Mind Indigo', code: 'IND' }
  },
  {
    id: 6,
    student_id: 1,
    project_id: 1,
    number: 'FA/SM/2026/01/045',
    document_type: 'FA',
    issue_date: '2026-01-05',
    sale_date: '2026-01-05',
    due_date: '2026-01-19',
    amount_net: 441.00,
    vat_value: 0,
    amount_gross: 441.00,
    vat_rate: 'zw',
    currency: 'PLN',
    buyer_name: 'Иван Иванов',
    buyer_address: 'Aleje Jerozolimskie 100, 00-001 Warszawa',
    ksef_status: 'paid',
    payment_date: '2026-01-10',
    project: { id: 1, name: 'Space Memory', code: 'SM' }
  },
  {
    id: 7,
    student_id: 6,
    project_id: 1,
    number: 'FA/SM/2026/03/010',
    document_type: 'FA',
    issue_date: '2026-03-20',
    sale_date: '2026-03-20',
    due_date: '2026-04-03',
    amount_net: 490.00,
    vat_value: 0,
    amount_gross: 490.00,
    vat_rate: 'zw',
    currency: 'PLN',
    buyer_name: 'Anna Nowak',
    buyer_address: 'ul. Testowa 5, Warszawa',
    ksef_status: 'draft',
    project: { id: 1, name: 'Space Memory', code: 'SM' }
  },
  {
    id: 8,
    student_id: 7,
    project_id: 2,
    number: 'FA/IND/2026/03/011',
    document_type: 'FA',
    issue_date: '2026-03-21',
    sale_date: '2026-03-21',
    due_date: '2026-04-04',
    amount_net: 450.00,
    vat_value: 0,
    amount_gross: 450.00,
    vat_rate: 'zw',
    currency: 'PLN',
    buyer_name: 'Piotr Wiśniewski',
    buyer_address: 'ul. Polna 12, Kraków',
    ksef_status: 'sent',
    project: { id: 2, name: 'Speedy Mind Indigo', code: 'IND' }
  }
];

export const MOCK_REFUNDS = [
  { 
    id: 1, 
    student_id: 1, 
    project_id: 1, 
    amount: 150.00, 
    currency: 'PLN', 
    type: 'resignation', 
    reason: 'Переплата', 
    status: 'pending', 
    created_at: '2026-03-20',
    iban: 'PL 12 3456 7890 1234 5678 9012 3456',
    bank_name: 'PKO BP',
    student: { first_name: 'Иван', last_name: 'Иванов', full_name: 'Иван Иванов' } 
  },
  { 
    id: 2, 
    student_id: 2, 
    project_id: 2, 
    amount: 300.00, 
    currency: 'PLN', 
    type: 'manualTransfer', 
    reason: 'Отказ от обучения', 
    status: 'completed', 
    created_at: '2026-03-18', 
    iban: 'PL 98 7654 3210 9876 5432 1098 7654',
    bank_name: 'mBank',
    student: { first_name: 'Мария', last_name: 'Петрова', full_name: 'Мария Петрова' } 
  },
  { 
    id: 3, 
    student_id: 3, 
    project_id: 1, 
    amount: 490.00, 
    currency: 'PLN', 
    type: 'resignation', 
    reason: 'Болезнь ученика', 
    status: 'processing', 
    created_at: '2026-03-22', 
    iban: 'PL 00 1111 2222 3333 4444 5555 6666',
    bank_name: 'ING',
    student: { first_name: 'Кирилл', last_name: 'Козлов', full_name: 'Кирилл Козлов' } 
  },
  { 
    id: 4, 
    student_id: 6, 
    project_id: 2, 
    amount: 100.00, 
    currency: 'PLN', 
    type: 'complaint', 
    reason: 'Ошибка в расчетах', 
    status: 'rejected', 
    created_at: '2026-03-15', 
    iban: 'PL 55 4444 3333 2222 1111 0000 9999',
    bank_name: 'Santander',
    student: { first_name: 'Анна', last_name: 'Новак', full_name: 'Анна Новак' } 
  }
];

export const MOCK_DEBTORS = [
  {
    id: 1,
    full_name: 'Кирилл Козлов',
    email: 'kirill.kozlov@mail.ru',
    phone: '+48 111 222 333',
    project: { name: 'Space Memory' },
    group: { group: 'Пт 19 Старшая' },
    balance: -490,
    invoice_debt: 490,
    proforma_debt: 0,
    total_debt: 490,
    overdue_invoices_count: 1,
    last_invoice_date: '2026-02-01'
  },
  {
    id: 2,
    full_name: 'Анна Новак (родитель)',
    email: 'anna.nowak@test.pl',
    phone: '+48 600 500 400',
    project: { name: 'Indigo' },
    group: { group: 'Вт 16 Средняя' },
    balance: -150,
    invoice_debt: 150,
    proforma_debt: 450,
    total_debt: 600,
    overdue_invoices_count: 2,
    last_invoice_date: '2026-03-01'
  }
];

export const MOCK_KONTRAHENCI = [
  {
    id: 1,
    name: 'Tech Solutions Sp. z o.o.',
    tax_id: '1234567890',
    email: 'contact@techsolutions.pl',
    phone: '+48 123 456 789',
    city: 'Warszawa',
    zip_code: '00-002',
    country: 'Polska',
    is_active: true
  },
  {
    id: 2,
    name: 'EduGroup SA',
    tax_id: '9876543210',
    email: 'billing@edugroup.pl',
    phone: '+48 987 654 321',
    city: 'Kraków',
    zip_code: '30-001',
    country: 'Polska',
    is_active: true
  }
];

// ─────────────────────────────────────────────────────────────
// Mock transactions / KSeF invoices
// ─────────────────────────────────────────────────────────────
export const mockTransactions: Record<string, Transaction[]> = {
  space: [
    { id: "tx_001", date: "08.02.2026", title: "Абонемент февраль 2026", sub: "Space Memory · Imoje · FV/2026/02/091", amount: 441, amountFmt: "+441 zł", status: "paid", type: "month", ksef: "ok", fvnum: "FV/2026/02/091", documentId: 101 },
    { id: "tx_002", date: "05.01.2026", title: "Абонемент январь 2026", sub: "Space Memory · Imoje · FV/2026/01/045", amount: 441, amountFmt: "+441 zł", status: "paid", type: "month", ksef: "ok", fvnum: "FV/2026/01/045", documentId: 102 },
    { id: "tx_003", date: "28.03.2026", title: "Счет март 2026", sub: "Space Memory · ожидает оплату", amount: 441, amountFmt: "441 zł", status: "pending", type: "month", ksef: "pending", fvnum: "FV/2026/03/009", documentId: 103 },
    { id: "tx_004", date: "20.02.2026", title: "Доп. занятие — мнемотехника", sub: "Space Memory · разовое", amount: 80, amountFmt: "+80 zł", status: "paid", type: "extra", ksef: null, fvnum: null },
  ],
  indigo: [
    { id: "tx_101", date: "06.02.2026", title: "Абонемент февраль 2026", sub: "Indigo · Imoje · FV/2026/02/092", amount: 405, amountFmt: "+405 zł", status: "paid", type: "month", ksef: "ok", fvnum: "FV/2026/02/092", documentId: 201 },
    { id: "tx_102", date: "05.01.2026", title: "Абонемент январь 2026", sub: "Indigo · Imoje · FV/2026/01/055", amount: 405, amountFmt: "+405 zł", status: "paid", type: "month", ksef: "ok", fvnum: "FV/2026/01/055", documentId: 202 },
    { id: "tx_103", date: "01.03.2026", title: "Счет март 2026", sub: "Indigo · просрочка", amount: 405, amountFmt: "405 zł", status: "pending", type: "month", ksef: "error", fvnum: "FV/2026/03/110", documentId: 203 },
  ],
  extras: [
    { id: "tx_201", date: "10.03.2026", title: "Доп. материалы", sub: "Extras · разовое", amount: 30, amountFmt: "+30 zł", status: "paid", type: "extra", ksef: null, fvnum: null }
  ]
};


export const mockKsefInvoices: Record<string, KsefInvoice[]> = {
  space: [
    { fvnum: "FV/2026/02/091", title: "Абонемент февраль 2026", status: "OK", statusClass: "ksef-ok" },
    { fvnum: "FV/2026/01/045", title: "Абонемент январь 2026", status: "OK", statusClass: "ksef-ok" },
    { fvnum: "FV/2025/12/089", title: "Абонемент декабрь 2025", status: "OK", statusClass: "ksef-ok" }
  ],
  indigo: [
    { fvnum: "FV/2026/02/092", title: "Абонемент февраль 2026", status: "OK", statusClass: "ksef-ok" }
  ],
  extras: [
    { fvnum: "FV/2026/02/445", title: "Счёты детские", status: "OK", statusClass: "ksef-ok" },
    { fvnum: "—", title: "1-месячный курс для родителей", status: "PENDING", statusClass: "ksef-pending" }
  ]
};

// ─────────────────────────────────────────────────────────────
// Student tabs (Groups / Info / Attendance / Progress / Notes)
// ─────────────────────────────────────────────────────────────

export type AttendanceMark = "present" | "absent" | "late" | "makeup" | "empty";

export const mockGroups = [
  {
    id: "g_sm_a",
    programId: "space",
    programTitle: "Space Memory",
    programIcon: "🧠",
    status: "active",
    subtitle: "Занятие #24 личных · Группа A · Пн 16:00",
    group: {
      code: "A",
      schedule: "Пн 16:00–17:00",
      trainer: "Анна К.",
      place: "Маршалковска 10, зал 2",
      capacity: "8 / 12 мест",
      stats: { total: 24, present: 21, absent: 2, rate: "87%" },
      trainers: [
        { id: "t_anna", name: "Анна К.", role: "Основной", presence: "present" as AttendanceMark },
        { id: "t_zofia", name: "Зофия К.", role: "Замена", presence: "makeup" as AttendanceMark },
      ],
    },
  },
  {
    id: "g_ind_c",
    programId: "indigo",
    programTitle: "Speedy Mind INDIGO",
    programIcon: "⚡",
    status: "active",
    subtitle: "Группа C · Пт 15:00",
    group: {
      code: "C",
      schedule: "Пт 15:00–16:00",
      trainer: "Ewa L.",
      place: "Маршалковска 10, зал 1",
      capacity: "10 / 12 мест",
      stats: { total: 18, present: 16, absent: 1, rate: "89%" },
      trainers: [
        { id: "t_ewa", name: "Ewa L.", role: "Основной", presence: "present" as AttendanceMark },
      ],
    },
  },
];

export const mockInfo = {
  child: {
    fullName: "Анна Ковальска",
    birthDate: "15.04.2014",
    age: "11",
    school: "SP nr 14 im. Staszica, Warszawa",
    className: "5A",
  },
  parent: {
    fullName: "Ewa Kowalska",
    phone: "+48 601 234 567",
    email: "ewa.kowalska@gmail.com",
  },
  billing: {
    address: "ul. Nowy Świat 45/12, 00-042 Warszawa",
    nip: "123-456-78-90",
    clientType: "person",
  },
  rodo: [
    { id: "r1", title: "Обработка персональных данных (RODO)", date: "12.01.2025", status: "signed" },
    { id: "r2", title: "Согласие на маркетинговые коммуникации", date: "12.01.2025", status: "signed" },
    { id: "r3", title: "Согласие на фото/видео съёмку", date: "12.01.2025", status: "signed" },
    { id: "r4", title: "Публикация результатов в социальных сетях", date: "—", status: "missing" },
  ],
  source: {
    channel: "Рекомендация",
    note: "Пришли от подруги (клиент INDIGO) — скидка по рефералу.",
  },
};

export const mockAttendance = {
  summary: { total: 24, present: 21, absent: 2, makeup: 1, rate: 87.5 },
  items: [
    { id: "a24", num: 24, date: "24.02.2026", topic: "Скорость ×5", trainer: "Анна К.", mark: "empty" as AttendanceMark, note: "" },
    { id: "a23", num: 23, date: "17.02.2026", topic: "Зачёт блок 3", trainer: "Анна К.", mark: "present" as AttendanceMark, note: "" },
    { id: "a22", num: 22, date: "10.02.2026", topic: "80 карт", trainer: "Зофия К. ⚡", mark: "present" as AttendanceMark, note: "замена тренера" },
    { id: "a21", num: 21, date: "03.02.2026", topic: "Ассоциации", trainer: "Анна К.", mark: "absent" as AttendanceMark, note: "болезнь" },
  ],
};

export const mockProgress = {
  kpi: [
    { id: "p1", title: "Скорость запоминания", value: "×5", hint: "февраль 2026" },
    { id: "p2", title: "Точность", value: "92%", hint: "последние 4 занятия" },
    { id: "p3", title: "Домашние", value: "7/8", hint: "за месяц" },
  ],
  achievements: [
    { id: "ach1", title: "80 карт за занятие", date: "10.02.2026" },
    { id: "ach2", title: "Блок 3 — зачёт", date: "17.02.2026" },
  ],
};

export const mockNotes = [
  {
    id: "n1",
    type: "call",
    status: "open",
    category: "complaint",
    who: "Magda Wiśniewska (менеджер)",
    when: "19.02.2026 · 14:32",
    title: "Входящий звонок",
    text:
      "Мама позвонила по поводу февральского занятия — недовольна заменой тренера. Попросила не допускать замен без предупреждения.",
    tags: ["замена тренера", "жалоба", "качество занятий"],
  },
  {
    id: "n2",
    type: "email",
    status: "done",
    category: "payment",
    who: "Tomasz Adamski (администратор)",
    when: "05.02.2026 · 10:15",
    title: "Исходящий email",
    text:
      "Отправлено напоминание об оплате за февраль. Оплата поступила 08.02 — вопрос закрыт.",
    tags: ["оплата", "напоминание"],
  },
];
