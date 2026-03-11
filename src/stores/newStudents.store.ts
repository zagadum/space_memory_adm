import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { recruitmentApi, type RecruitmentNewStudent } from '../api/recruitmentApi'

export interface NewStudent {
  id: number
  name: string
  age: number
  contract: 'signed' | 'pending'
  payment: number
  paymentStr: string
  group: string | null
  groupColor: string | null
  startDate: string | null
  createdDate: string
  waitDays: number
  manager: string | null
}

export interface StudentDetails {
  email: string
  password: string
  firstName: string
  lastName: string
  birthDate: string
  country: string
  city: string
  street: string
  apt: string
  postCode: string
  parentFirst: string
  parentLast: string
  parentPhone: string
  parentPassport: string
  photoConsent: boolean
  comment: string
  currentPrice: string
  currentPriceDesc: string
}

export interface HistoryEvent {
  event: string
  date: string
  detail: string
  color: string
}

export interface Group {
  name: string
  color: string
  age: '5-7' | '8-10' | '11-14'
  teacher: string
  day: string
  time: string
  slots: number
  taken: number
}

export const MANAGER_COLORS: Record<string, string> = {
  'Светлана': 'linear-gradient(135deg,#f59e0b,#ef4444)',
  'Александр': 'linear-gradient(135deg,#4f6ef7,#8b5cf6)',
  'Мария': 'linear-gradient(135deg,#06b6d4,#10b981)',
  'Артём': 'linear-gradient(135deg,#8b5cf6,#ec4899)',
}

export const ALL_GROUPS: Group[] = [
  { name: 'Пн 16 ЕЛа Младшая',  color: '#4f6ef7', age: '5-7',   teacher: 'Елена Лисова',       day: 'Пн', time: '16:00', slots: 10, taken: 6  },
  { name: 'Пн 18 ЕЛа Старшая',  color: '#ef4444', age: '11-14', teacher: 'Елена Лисова',       day: 'Пн', time: '18:00', slots: 10, taken: 9  },
  { name: 'Вт 15 АНа Младшая',  color: '#10b981', age: '5-7',   teacher: 'Анна Новицкая',      day: 'Вт', time: '15:00', slots: 8,  taken: 3  },
  { name: 'Вт 17 КЛе Младшая',  color: '#4f6ef7', age: '5-7',   teacher: 'Карина Лещенко',     day: 'Вт', time: '17:00', slots: 8,  taken: 5  },
  { name: 'Вт 19 МВо Средняя',  color: '#f59e0b', age: '8-10',  teacher: 'Марина Войцик',      day: 'Вт', time: '19:00', slots: 10, taken: 7  },
  { name: 'Ср 10 АНа Средняя',  color: '#f59e0b', age: '8-10',  teacher: 'Анна Новицкая',      day: 'Ср', time: '10:00', slots: 10, taken: 10 },
  { name: 'Ср 15 ПИе Младшая',  color: '#8b5cf6', age: '5-7',   teacher: 'Пётр Иевлев',        day: 'Ср', time: '15:00', slots: 8,  taken: 3  },
  { name: 'Ср 17 МВо Средняя',  color: '#f59e0b', age: '8-10',  teacher: 'Марина Войцик',      day: 'Ср', time: '17:00', slots: 10, taken: 7  },
  { name: 'Чт 16 СКо Младшая',  color: '#06b6d4', age: '5-7',   teacher: 'Светлана Ковальска', day: 'Чт', time: '16:00', slots: 8,  taken: 2  },
  { name: 'Чт 18 ПЗе Средняя',  color: '#f59e0b', age: '8-10',  teacher: 'Пётр Зелинский',     day: 'Чт', time: '18:00', slots: 12, taken: 8  },
  { name: 'Чт 19 АВи Старшая',  color: '#ef4444', age: '11-14', teacher: 'Адам Вишневский',    day: 'Чт', time: '19:00', slots: 10, taken: 5  },
  { name: 'Пт 14 АВи Старшая',  color: '#ef4444', age: '11-14', teacher: 'Адам Вишневский',    day: 'Пт', time: '14:00', slots: 8,  taken: 0  },
  { name: 'Пт 17 СКо Средняя',  color: '#f59e0b', age: '8-10',  teacher: 'Светлана Ковальска', day: 'Пт', time: '17:00', slots: 10, taken: 4  },
  { name: 'Пт 19 АНа Старшая',  color: '#06b6d4', age: '11-14', teacher: 'Анна Новицкая',      day: 'Пт', time: '19:00', slots: 10, taken: 7  },
  { name: 'Сб 10 МВо Младшая',  color: '#10b981', age: '5-7',   teacher: 'Марина Войцик',      day: 'Сб', time: '10:00', slots: 10, taken: 10 },
  { name: 'Сб 12 ЕЛа Средняя',  color: '#f59e0b', age: '8-10',  teacher: 'Елена Лисова',       day: 'Сб', time: '12:00', slots: 10, taken: 6  },
  { name: 'Сб 14 ПЗе Старшая',  color: '#ef4444', age: '11-14', teacher: 'Пётр Зелинский',     day: 'Сб', time: '14:00', slots: 12, taken: 3  },
]

const MOCK_STUDENTS: NewStudent[] = [
  { id: 1, name: 'Артем Волков',    age: 12, contract: 'signed',  payment: 489, paymentStr: '489 zł', group: 'Вт 17 КЛе Младшая', groupColor: '#4f6ef7', startDate: '2024-02-20', createdDate: '2024-02-15', waitDays: 16, manager: 'Светлана'  },
  { id: 2, name: 'Кирилл Морозов', age: 9,  contract: 'pending', payment: 0,   paymentStr: '0 zł',   group: 'Ср 15 ПИе Младшая', groupColor: '#8b5cf6', startDate: '2024-03-05', createdDate: '2024-03-01', waitDays: 2,  manager: 'Александр' },
  { id: 3, name: 'Даниил Глебов',  age: 14, contract: 'signed',  payment: 440, paymentStr: '440 zł', group: 'Пт 19 АНа Старшая', groupColor: '#06b6d4', startDate: '2024-02-22', createdDate: '2024-02-17', waitDays: 1,  manager: 'Артём'     },
  { id: 4, name: 'Никита Иванов',  age: 7,  contract: 'pending', payment: 0,   paymentStr: '0 zł',   group: null,                 groupColor: null,      startDate: null,         createdDate: '2024-02-10', waitDays: 7,  manager: null         },
  { id: 5, name: 'Полина Синяк',   age: 10, contract: 'pending', payment: 0,   paymentStr: '0 zł',   group: null,                 groupColor: null,      startDate: null,         createdDate: '2024-03-03', waitDays: 3,  manager: 'Мария'     },
  { id: 6, name: 'Аня Белова',     age: 8,  contract: 'signed',  payment: 464, paymentStr: '464 zł', group: 'Сб 12 ЕЛа Средняя', groupColor: '#f59e0b', startDate: '2024-03-07', createdDate: '2024-03-01', waitDays: 5,  manager: 'Мария'     },
  { id: 7, name: 'Саша Попов',     age: 11, contract: 'pending', payment: 0,   paymentStr: '0 zł',   group: null,                 groupColor: null,      startDate: null,         createdDate: '2024-02-28', waitDays: 14, manager: null         },
  { id: 8, name: 'Ева Коваль',     age: 6,  contract: 'pending', payment: 0,   paymentStr: '0 zł',   group: 'Чт 16 СКо Младшая', groupColor: '#06b6d4', startDate: '2024-03-10', createdDate: '2024-03-05', waitDays: 4,  manager: 'Александр' },
]

const MOCK_DETAILS: Record<number, StudentDetails> = {
  1: { email: 'artem.volkov@gmail.com', password: 'Qwerty123!', firstName: 'Артем',  lastName: 'Волков',  birthDate: '2012-05-14', country: 'Польша', city: 'Варшава', street: 'ул. Маршалковска 10', apt: 'кв. 3', postCode: '00-001', parentFirst: 'Сергей', parentLast: 'Волков',  parentPhone: '+48 601 111 222', parentPassport: 'ABC 123456', photoConsent: true,  comment: 'Ребёнок увлекается роботами. Прошу уделить внимание развитию лидерских качеств.', currentPrice: '489.00', currentPriceDesc: 'Group lessons' },
  2: { email: 'kirill.morozov@mail.ru',  password: 'Pass9876!',  firstName: 'Кирилл', lastName: 'Морозов', birthDate: '2015-09-22', country: 'Польша', city: 'Варшава', street: 'ул. Новый Свят 5',   apt: '',       postCode: '00-400', parentFirst: 'Анна',   parentLast: 'Морозова', parentPhone: '+48 602 333 444', parentPassport: 'DEF 654321', photoConsent: false, comment: '',                                                                                 currentPrice: '0.00',   currentPriceDesc: 'Не выбран'   },
  3: { email: 'daniil.glebov@wp.pl',     password: 'Secure789@', firstName: 'Даниил', lastName: 'Глебов',  birthDate: '2010-11-03', country: 'Польша', city: 'Краков',  street: 'ул. Флорианска 20',  apt: 'кв. 7', postCode: '30-001', parentFirst: 'Ирина',  parentLast: 'Глебова',  parentPhone: '+48 603 555 666', parentPassport: 'GHI 987654', photoConsent: true,  comment: 'Ребёнок любит космос и читать книги.',                                             currentPrice: '440.10', currentPriceDesc: 'Family 2nd child −10%' },
  4: { email: 'nikita.ivanov@gmail.com', password: 'Ivan2024#',  firstName: 'Никита', lastName: 'Иванов',  birthDate: '2017-03-19', country: 'Польша', city: 'Варшава', street: 'ул. Пулавска 88',    apt: 'кв.12', postCode: '02-603', parentFirst: 'Дмитрий',parentLast: 'Иванов',   parentPhone: '+48 604 777 888', parentPassport: 'JKL 112233', photoConsent: true,  comment: 'Застенчивый ребёнок, привыкает медленно.',                                         currentPrice: '0.00',   currentPriceDesc: 'Не выбран'   },
  5: { email: 'polina.sinak@gmail.com',  password: 'Pol2024!',   firstName: 'Полина', lastName: 'Синяк',   birthDate: '2014-07-08', country: 'Польша', city: 'Варшава', street: 'ул. Садова 12',      apt: 'кв. 2', postCode: '00-500', parentFirst: 'Олег',   parentLast: 'Синяк',    parentPhone: '+48 605 888 999', parentPassport: 'MNO 345678', photoConsent: true,  comment: '',                                                                                 currentPrice: '0.00',   currentPriceDesc: 'Не выбран'   },
  6: { email: 'anya.belova@wp.pl',       password: 'Bel2024#',   firstName: 'Аня',    lastName: 'Белова',  birthDate: '2016-02-14', country: 'Польша', city: 'Варшава', street: 'ул. Крулевска 5',    apt: '',       postCode: '00-200', parentFirst: 'Наташа', parentLast: 'Белова',    parentPhone: '+48 606 111 222', parentPassport: 'PQR 456789', photoConsent: false, comment: 'Девочка активная, любит рисовать.',                                                 currentPrice: '464.50', currentPriceDesc: 'Recommendation −5%'  },
  7: { email: 'sasha.popov@gmail.com',   password: 'Pop2024!',   firstName: 'Саша',   lastName: 'Попов',   birthDate: '2013-11-25', country: 'Польша', city: 'Варшава', street: 'ул. Злота 22',       apt: 'кв. 4', postCode: '00-300', parentFirst: 'Виктор', parentLast: 'Попов',     parentPhone: '+48 607 222 333', parentPassport: 'STU 567890', photoConsent: true,  comment: '',                                                                                 currentPrice: '0.00',   currentPriceDesc: 'Не выбран'   },
  8: { email: 'eva.koval@gmail.com',     password: 'Eva2024#',   firstName: 'Ева',    lastName: 'Коваль',  birthDate: '2018-06-30', country: 'Польша', city: 'Варшава', street: 'ул. Мокотовска 8',   apt: '',       postCode: '00-600', parentFirst: 'Юлия',   parentLast: 'Коваль',    parentPhone: '+48 608 333 444', parentPassport: 'VWX 678901', photoConsent: true,  comment: 'Самый маленький ребёнок в наборе — нужна мягкая адаптация.',                       currentPrice: '0.00',   currentPriceDesc: 'Не выбран'   },
}

const MOCK_HISTORY: Record<number, HistoryEvent[]> = {
  1: [
    { event: 'Ученик создан',      date: '15.02.2024', detail: 'Зарегистрирован через форму на сайте', color: 'var(--blue)'   },
    { event: 'Договор подписан',   date: '16.02.2024', detail: 'Электронная подпись получена',         color: 'var(--green)'  },
    { event: 'Добавлен в группу',  date: '18.02.2024', detail: 'Вт 17 КЛе Младшая',                   color: 'var(--purple)' },
    { event: 'Оплатил занятия',    date: '20.02.2024', detail: '489 zł — Group lessons',               color: 'var(--green)'  },
  ],
  2: [
    { event: 'Ученик создан',     date: '01.03.2024', detail: 'Зарегистрирован менеджером Александр', color: 'var(--blue)'   },
    { event: 'Добавлен в группу', date: '03.03.2024', detail: 'Ср 15 ПИе Младшая',                   color: 'var(--purple)' },
  ],
  3: [
    { event: 'Ученик создан',     date: '17.02.2024', detail: 'Зарегистрирован через форму на сайте', color: 'var(--blue)'   },
    { event: 'Договор подписан',  date: '18.02.2024', detail: 'Электронная подпись получена',         color: 'var(--green)'  },
    { event: 'Добавлен в группу', date: '20.02.2024', detail: 'Пт 19 АНа Старшая',                   color: 'var(--purple)' },
    { event: 'Оплатил занятия',   date: '22.02.2024', detail: '440 zł — Group lessons',               color: 'var(--green)'  },
  ],
  4: [
    { event: 'Ученик создан',  date: '10.02.2024', detail: 'Зарегистрирован менеджером Артём',    color: 'var(--blue)'  },
    { event: 'Ожидает группу', date: '10.02.2024', detail: 'Без группы — ожидает распределения', color: 'var(--amber)' },
  ],
}

export const useNewStudentsStore = defineStore('newStudents', () => {
  const students = ref<NewStudent[]>([...MOCK_STUDENTS])
  const details = ref<Record<number, StudentDetails>>({ ...MOCK_DETAILS })
  const history = ref<Record<number, HistoryEvent[]>>({ ...MOCK_HISTORY })

  // Stats
  const totalCount = computed(() => students.value.length)
  const signedCount = computed(() => students.value.filter(s => s.contract === 'signed').length)
  const noManagerCount = computed(() => students.value.filter(s => !s.manager).length)
  const avgWaitDays = computed(() => {
    if (!students.value.length) return 0
    return Math.round(students.value.reduce((a, s) => a + s.waitDays, 0) / students.value.length)
  })

  // Unique lists for filters
  const uniqueGroups = computed(() => {
    const groups = students.value.filter(s => s.group).map(s => ({ name: s.group!, color: s.groupColor! }))
    return [...new Map(groups.map(g => [g.name, g])).values()]
  })

  const uniqueManagers = computed(() => {
    return [...new Set(students.value.filter(s => s.manager).map(s => s.manager!))]
  })

  function normalizeStudent(s: RecruitmentNewStudent): NewStudent {
    return {
      id: Number(s.id),
      name: s.name,
      age: s.age,
      contract: s.contract,
      payment: s.payment ?? 0,
      paymentStr: s.paymentStr ?? `${s.payment ?? 0} zł`,
      group: s.group ?? null,
      groupColor: s.groupColor ?? null,
      startDate: s.startDate ?? null,
      createdDate: s.createdDate ?? new Date().toISOString().slice(0, 10),
      waitDays: s.waitDays ?? 0,
      manager: s.manager ?? null,
    }
  }

  async function fetchStudentsFromApi() {
    try {
      const list = await recruitmentApi.getNewStudents()
      if (list.length) {
        students.value = list.map(normalizeStudent)
      }
    } catch {
      // keep current local dataset if endpoint is not ready
    }
  }

  function addStudent(data: Omit<NewStudent, 'id' | 'createdDate' | 'waitDays' | 'payment' | 'paymentStr' | 'group' | 'groupColor' | 'contract'>) {
    const today = new Date().toISOString().slice(0, 10)
    const newId = Date.now()
    students.value.unshift({
      id: newId,
      contract: 'pending',
      payment: 0,
      paymentStr: '0 zł',
      group: null,
      groupColor: null,
      createdDate: today,
      waitDays: 0,
      ...data,
    })
    details.value[newId] = {
      email: '', password: '', firstName: data.name.split(' ')[0] || '', lastName: data.name.split(' ')[1] || '',
      birthDate: '', country: 'Польша', city: 'Варшава', street: '', apt: '', postCode: '',
      parentFirst: '', parentLast: '', parentPhone: '', parentPassport: '', photoConsent: false, comment: '',
      currentPrice: '0.00', currentPriceDesc: 'Не выбран',
    }
    history.value[newId] = [
      { event: 'Ученик создан', date: new Date().toLocaleDateString('ru-RU'), detail: `Добавлен менеджером ${data.manager || '—'}`, color: 'var(--blue)' },
    ]

    recruitmentApi.createNewStudent({
      name: data.name,
      age: data.age,
      manager: data.manager,
      startDate: data.startDate,
    }).catch(() => {
      // optimistic insert remains in UI even if backend is unavailable
    })
  }

  function assignGroup(studentId: number, groupName: string, color: string) {
    const s = students.value.find(x => x.id === studentId)
    if (s) { s.group = groupName; s.groupColor = color }
    if (history.value[studentId]) {
      history.value[studentId].push({ event: 'Добавлен в группу', date: new Date().toLocaleDateString('ru-RU'), detail: groupName, color: 'var(--purple)' })
    }
  }

  function archiveStudent(studentId: number) {
    students.value = students.value.filter(s => s.id !== studentId)
    recruitmentApi.archiveNewStudent(studentId).catch(() => {
      // no rollback to keep fast UI interactions
    })
  }

  function saveDetails(studentId: number, data: Partial<StudentDetails>) {
    if (!details.value[studentId]) return
    details.value[studentId] = { ...details.value[studentId], ...data }
    // Update name in the list
    const s = students.value.find(x => x.id === studentId)
    const d = details.value[studentId]
    if (s && (d.firstName || d.lastName)) {
      s.name = [d.firstName, d.lastName].filter(Boolean).join(' ')
    }
  }

  function setPrice(studentId: number, amount: string, desc: string) {
    const s = students.value.find(x => x.id === studentId)
    if (s) { s.paymentStr = `${amount} zł`; s.payment = parseFloat(amount) }
    if (details.value[studentId]) {
      details.value[studentId].currentPrice = amount
      details.value[studentId].currentPriceDesc = desc
    }
    if (history.value[studentId]) {
      history.value[studentId].push({ event: 'Цена изменена', date: new Date().toLocaleDateString('ru-RU'), detail: `${amount} zł — ${desc}`, color: 'var(--amber)' })
    }
  }

  function getDetails(studentId: number): StudentDetails | null {
    return details.value[studentId] || null
  }

  function getHistory(studentId: number): HistoryEvent[] {
    return history.value[studentId] || [{ event: 'Ученик создан', date: '—', detail: '', color: 'var(--blue)' }]
  }

  return {
    students, totalCount, signedCount, noManagerCount, avgWaitDays,
    uniqueGroups, uniqueManagers,
    fetchStudentsFromApi,
    addStudent, assignGroup, archiveStudent, saveDetails, setPrice,
    getDetails, getHistory,
  }
})
