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
  lessons?: number;
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

export const TEACHERS_DB = [
  { id: 't1', name: 'Клара Левит', group: 'Вт 17 Младшая', schedule: 'Вт 17:00', dow: 2 },
  { id: 't2', name: 'Пиотр Ивановски', group: 'Ср 15 Младшая', schedule: 'Ср 15:00', dow: 3 },
  { id: 't3', name: 'Анна Новак', group: 'Пт 19 Старшая', schedule: 'Пт 19:00', dow: 5 },
  { id: 't4', name: 'Мария Ковальска', group: 'Чт 16 Средняя', schedule: 'Чт 16:00', dow: 4 },
  { id: 't5', name: 'Ханна Боян', group: 'Ср 15 Младшая', schedule: 'Ср 15:00', dow: 3 }
];

export const mockDb: { me: any; students: Record<string, { profile: StudentProfile; programs: Program[] }> } = {
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
            "2026": [
              { status: "paid", payStatus: "paid", amount: 441, ksef: "ok", g1: 4, g2: 0, txDate: "01.01.2026" },
              { status: "paid", payStatus: "paid", amount: 441, ksef: "ok", g1: 4, g2: 0, txDate: "08.02.2026" },
              { status: "pending", payStatus: "pending", amount: 441, ksef: null, g1: 4, g2: 0 },
            ],
          },
          transactions: [
            { date: "08.02.2026", title: "Абонемент февраль 2026 ✓", sub: "Space Memory · Imoje", amount: "+441 зл", paid: true, ksef: "ok", fvnum: "FV/2026/02/091" },
          ],
        },
        {
          id: "indigo",
          name: "⚡ Speedy Mind Indigo",
          sub: "Ср 15 Младшая · Ср 15:00 · Ханна Боян · 450 зл/мес · 👦 1-й ребёнок · без скидки",
          tariff: 450,
          balance: 100,
          balanceLabel: "переплата",
          barGradient: "linear-gradient(180deg,var(--purple),var(--pink))",
          years: {
            "2026": [
              { status: "paid", payStatus: "paid", amount: 405, ksef: "ok", g1: 4, g2: 0, txDate: "01.01.2026" },
              { status: "pending", payStatus: "pending", amount: 405, ksef: null, g1: 4, g2: 0 },
            ],
          },
          transactions: [
            { date: "15.01.2026", title: "Абонемент январь 2026 ✓", sub: "Indigo · Imoje", amount: "+405 зл", paid: true, ksef: "ok", fvnum: "FV/2026/01/055" },
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
              { status: "paid", payStatus: "paid", amount: 450, ksef: "ok", g1: 4, g2: 0, txDate: "10.01.2026" },
              { status: "pending", payStatus: "pending", amount: 450, ksef: null, g1: 4, g2: 0 },
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
              { status: "overdue", payStatus: "overdue", amount: 490, ksef: "error", g1: 0, g2: 0 },
            ],
          },
          transactions: [],
        },
      ],
    },
  },
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
