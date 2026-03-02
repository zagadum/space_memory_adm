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

export interface MonthItem {
  status: MonthStatus;
  payStatus?: PayStatus;
  amount: number; // zł
  ksef: KsefStatus;
  g1: number;
  g2: number;
  txDate?: string;
  disc?: "family" | "referral" | "loyalty" | "complaint" | "promo";
  discAmt?: number;
  pauseUntil?: string;
  pauseFrom?: string;
  returnDate?: string;
  teacher?: string;
  split?: boolean;
  bonus?: boolean;
  bonusDate?: string;
  groupSplit?: any[];
}

export interface Program {
  id: "space" | "indigo" | "extras";
  name: string;
  sub: string;
  tariff: number;
  balance: number;
  balanceLabel: string;
  barGradient: string;
  years: Record<string, MonthItem[]>;
  transactions: any[];
  extras?: any[];
}

export interface StudentProfile {
  id: string;
  initials: string;
  name: string;
  age: string;
  parent: string;
  phone: string;
  statusLabel: string;
  statusColor: string;
  totalBalance: { value: string; label: string; color: string };
  nextPay: { date: string; approx: string };
}

export const mockDb: { me: any; student: StudentProfile; programs: Program[] } = {
  me: { id: "u_1", email: "admin@demo.local", name: "Demo Admin" },
  student: {
    id: "s_1",
    initials: "АК",
    name: "Anna Kowalska",
    age: "11 лет",
    parent: "Ewa Kowalska (мама)",
    phone: "+48 601 234 567",
    statusLabel: "● Активна",
    statusColor: "var(--green)",
    totalBalance: { value: "+220 zł", label: "переплата", color: "var(--green)" },
    nextPay: { date: "01.03.2026", approx: "~837 зл · с учётом скидок" },
  },
  programs: [
    {
      id: "space",
      name: "🌌 Space Memory",
      sub: "Гр. A · Пн 16:00 · Anna Kowalska · 490 зл/мес · 👦 1-й ребёнок · без скидки",
      tariff: 490,
      balance: 120,
      balanceLabel: "переплата",
      barGradient: "linear-gradient(180deg,var(--blue),var(--purple))",
      years: {
        "2025": [
          { status: "paid", payStatus: "paid", amount: 441, ksef: "conflict", g1: 4, g2: 0, disc: "referral", discAmt: 99, txDate: "01.01.2025" },
          { status: "paid", payStatus: "paid", amount: 441, ksef: "manual", g1: 4, g2: 0, txDate: "01.02.2025" },
          { status: "paid", payStatus: "paid", amount: 441, ksef: "ok", g1: 4, g2: 0, bonus: true, bonusDate: "30.03.2025", txDate: "01.03.2025" },
          { status: "paid", payStatus: "paid", amount: 396, ksef: "ok", g1: 2, g2: 2, split: true, disc: "family", discAmt: 44, txDate: "01.04.2025" },
          { status: "partial", payStatus: "paid", amount: 122, ksef: "ok", g1: 1, g2: 0, pauseFrom: "10.05", returnDate: "15.06", txDate: "01.05.2025" },
          { status: "pause", amount: 0, ksef: null, g1: 0, g2: 0, pauseUntil: "15.06" },
          { status: "paid", payStatus: "paid", amount: 441, ksef: "ok", g1: 4, g2: 0, txDate: "01.07.2025" },
          { status: "paid", payStatus: "paid", amount: 441, ksef: "ok", g1: 4, g2: 0, txDate: "01.08.2025" },
          { status: "extra-paid", payStatus: "paid", amount: 110, ksef: "ok", g1: 1, g2: 0, teacher: "Отдел Качества", txDate: "15.09.2025" },
          { status: "overdue", payStatus: "overdue", amount: 441, ksef: "pending", g1: 4, g2: 0 },
          { status: "pending", payStatus: "pending", amount: 441, ksef: "pending", g1: 4, g2: 0 },
          { status: "pending", payStatus: "pending", amount: 441, ksef: null, g1: 4, g2: 0 },
        ],
        "2026": [
          { status: "paid", payStatus: "paid", amount: 441, ksef: "conflict", g1: 4, g2: 0, txDate: "01.01.2026" },
          { status: "paid", payStatus: "paid", amount: 441, ksef: "ok", g1: 4, g2: 0, txDate: "08.02.2026" },
          { status: "pending", payStatus: "pending", amount: 441, ksef: null, g1: 4, g2: 0 },
          { status: "extra-pending", payStatus: "pending", amount: 110, ksef: null, g1: 1, g2: 0, teacher: "Anna K." },
          { status: "pause", amount: 0, ksef: null, g1: 0, g2: 0, pauseUntil: "10.05" },
          { status: "partial", payStatus: "pending", amount: 122, ksef: null, g1: 1, g2: 0, pauseFrom: "01.05", returnDate: "10.05" },
          { status: "summer", amount: 0, ksef: null, g1: 0, g2: 0 },
          { status: "summer", amount: 0, ksef: null, g1: 0, g2: 0 },
          { status: "future", amount: 441, ksef: null, g1: 4, g2: 0 },
          { status: "future", amount: 441, ksef: null, g1: 4, g2: 0 },
          { status: "future", amount: 441, ksef: null, g1: 4, g2: 0 },
          { status: "future", amount: 441, ksef: null, g1: 4, g2: 0 },
        ],
      },
      transactions: [
        { date: "08.02.2026", title: "Абонемент февраль 2026 ✓", sub: "Space Memory · Imoje · #TXN-2026-0847", amount: "+441 зл", paid: true, ksef: "ok", fvnum: "FV/2026/02/091", type: "month" },
        { date: "01.01.2026", title: "Абонемент январь 2026 ✓", sub: "Space Memory · Imoje · #TXN-2026-0201", amount: "+441 зл", paid: true, ksef: "ok", fvnum: "FV/2026/01/045", type: "month" },
        { date: "01.12.2025", title: "Абонемент декабрь 2025 ✓", sub: "Space Memory · Imoje · #TXN-2025-2341", amount: "+441 зл", paid: true, ksef: "ok", fvnum: "FV/2025/12/089", type: "month" },
        { date: "15.01.2026", title: "➕ Доп. занятие · январь 2026", sub: "Учитель: Отдел Качества · #TXN-2026-0312", amount: "+110 зл", paid: true, ksef: "ok", fvnum: "FV/2026/01/312", type: "extra" },
        { date: "—", title: "➕ Доп. занятие · март 2026", sub: "Учитель: Anna K. · ожидает оплаты", amount: "110 зл", paid: false, ksef: "pending", fvnum: null, type: "extra" },
      ],
    },
    {
      id: "indigo",
      name: "⚡ Speedy Mind INDIGO",
      sub: "Гр. C · Пт 15:00 · Ewa Lewandowska · 420 зл/мес · 👧 2-й ребёнок · −10% семья",
      tariff: 420,
      balance: 0,
      balanceLabel: "баланс",
      barGradient: "linear-gradient(180deg,var(--purple),var(--pink))",
      years: {
        "2025": [
          { status: "paid", payStatus: "paid", amount: 420, ksef: "ok", g1: 4, g2: 0, txDate: "01.01.2025" },
          { status: "paid", payStatus: "paid", amount: 420, ksef: "ok", g1: 4, g2: 0, txDate: "01.02.2025" },
          { status: "paid", payStatus: "paid", amount: 420, ksef: "ok", g1: 4, g2: 0, txDate: "01.03.2025" },
          { status: "paid", payStatus: "paid", amount: 420, ksef: "ok", g1: 4, g2: 0, txDate: "01.04.2025" },
          { status: "paid", payStatus: "paid", amount: 420, ksef: "ok", g1: 4, g2: 0, txDate: "01.05.2025" },
          { status: "summer", amount: 0, ksef: null, g1: 0, g2: 0 },
          { status: "summer", amount: 0, ksef: null, g1: 0, g2: 0 },
          { status: "paid", payStatus: "paid", amount: 420, ksef: "ok", g1: 4, g2: 0, txDate: "01.08.2025" },
          { status: "paid", payStatus: "paid", amount: 420, ksef: "ok", g1: 4, g2: 0, txDate: "01.09.2025" },
          { status: "paid", payStatus: "paid", amount: 420, ksef: "ok", g1: 4, g2: 0, txDate: "01.10.2025" },
          { status: "pending", payStatus: "pending", amount: 420, ksef: "pending", g1: 4, g2: 0 },
          { status: "pending", payStatus: "pending", amount: 420, ksef: null, g1: 4, g2: 0 },
        ],
        "2026": [
          { status: "paid", payStatus: "paid", amount: 420, ksef: "ok", g1: 4, g2: 0, txDate: "01.01.2026" },
          { status: "paid", payStatus: "paid", amount: 420, ksef: "ok", g1: 4, g2: 0, txDate: "08.02.2026" },
          { status: "pending", payStatus: "pending", amount: 420, ksef: null, g1: 4, g2: 0 },
          { status: "future", amount: 420, ksef: null, g1: 4, g2: 0 },
          { status: "summer", amount: 0, ksef: null, g1: 0, g2: 0 },
          { status: "summer", amount: 0, ksef: null, g1: 0, g2: 0 },
          { status: "future", amount: 420, ksef: null, g1: 4, g2: 0 },
          { status: "future", amount: 420, ksef: null, g1: 4, g2: 0 },
          { status: "future", amount: 420, ksef: null, g1: 4, g2: 0 },
          { status: "future", amount: 420, ksef: null, g1: 4, g2: 0 },
          { status: "future", amount: 420, ksef: null, g1: 4, g2: 0 },
          { status: "future", amount: 420, ksef: null, g1: 4, g2: 0 },
        ],
      },
      transactions: [
        { date: "08.02.2026", title: "Абонемент февраль 2026 ✓", sub: "INDIGO · Imoje · #TXN-2026-0848", amount: "+420 зл", paid: true, ksef: "ok", fvnum: "FV/2026/02/092", type: "month" },
        { date: "01.01.2026", title: "Абонемент январь 2026 ✓", sub: "INDIGO · Imoje · #TXN-2026-0202", amount: "+420 зл", paid: true, ksef: "ok", fvnum: "FV/2026/01/046", type: "month" },
      ],
    },
    {
      id: "extras",
      name: "📚 Доп. материалы и программы",
      sub: "Разовые услуги и товары · 3 позиции",
      tariff: 0,
      balance: 450,
      balanceLabel: "оплачено",
      barGradient: "linear-gradient(180deg,var(--amber),var(--orange))",
      years: { "2026": [] },
      transactions: [],
      extras: [
        { icon: "🏆", title: "Олимпиада онлайн 2026", meta: "150 зл · 15.01.2026 · #TXN-2026-0312 · ✓ KSeF", amount: "150 зл", paid: true, fvnum: "FV/2026/01/312" },
        { icon: "🧮", title: "Счёты детские", meta: "180 зл · 10.02.2026 · #TXN-2026-0445 · ✓ KSeF", amount: "180 зл", paid: true, fvnum: "FV/2026/02/445" },
        { icon: "👩‍💼", title: "1-месячный курс для родителей", meta: "120 зл · ожидает оплаты · 🕐 KSeF после оплаты", amount: "120 зл", paid: false, fvnum: null },
      ],
    },
  ],
};


export const mockTransactions: Record<string, any[]> = {
  space: [
    { id: "tx_001", date: "01.03.2026", title: "Оплата абонемента", sub: "Space Memory · March", amount: "+441 zł", paid: true, ksef: "KSeF OK", fvnum: "FV/2026/03/001" },
    { id: "tx_002", date: "15.03.2026", title: "Доплата", sub: "Коррекция по тарифу", amount: "+49 zł", paid: true, ksef: null, fvnum: null },
    { id: "tx_003", date: "28.03.2026", title: "Счет выставлен", sub: "ожидает оплату", amount: "-441 zł", paid: false, ksef: "KSeF pending", fvnum: "FV/2026/03/009" }
  ],
  indigo: [
    { id: "tx_101", date: "01.03.2026", title: "Оплата абонемента", sub: "INDIGO · March", amount: "+390 zł", paid: true, ksef: "KSeF OK", fvnum: "FV/2026/03/101" },
    { id: "tx_102", date: "05.03.2026", title: "Refund", sub: "Возврат по переплате", amount: "-50 zł", paid: true, ksef: null, fvnum: "FV/2026/03/101" }
  ],
  extras: [
    { id: "tx_201", date: "10.03.2026", title: "Доп. материалы", sub: "Extras", amount: "+30 zł", paid: true, ksef: null, fvnum: null }
  ]
};


export const mockKsefInvoices: Record<string, any[]> = {
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
