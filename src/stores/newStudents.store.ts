import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { recruitmentApi, type RecruitmentNewStudent, type RecruitmentPagination } from '../api/recruitmentApi'

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

const rawUseMock = String((import.meta as any).env?.VITE_USE_MOCK ?? 'false').toLowerCase()
const USE_MOCK_BY_DEFAULT = rawUseMock !== 'false'

export const useNewStudentsStore = defineStore('newStudents', () => {
  const students = ref<NewStudent[]>([])
  const details = ref<Record<number, StudentDetails>>(USE_MOCK_BY_DEFAULT ? { ...MOCK_DETAILS } : {})
  const history = ref<Record<number, HistoryEvent[]>>({ ...MOCK_HISTORY })

  const currentStudent = ref<any | null>(null)
  const currentHistory = ref<HistoryEvent[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isListLoading = ref(false)
  const listError = ref<string | null>(null)
  const pagination = ref<RecruitmentPagination>({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
    from: 0,
    to: 0,
  })

  const currentStudentDetails = computed((): StudentDetails | null => {
    const s = currentStudent.value
    if (!s) return null
    return {
      email:           s.email        ?? '',
      password:        s.password      ?? '',
      firstName:       s.name          ?? '',
      lastName:        s.surname       ?? '',
      birthDate:       s.dob           ?? '',
      country:         s.country       ?? '',
      city:            s.city          ?? '',
      street:          s.address       ?? '',
      apt:             s.apartment     ? String(s.apartment) : '',
      postCode:        s.zip           ?? '',
      parentFirst:     s.parent_name   ?? '',
      parentLast:      s.parent_surname ?? '',
      parentPhone:     s.parent_phone  ? String(s.parent_phone) : '',
      parentPassport:  s.parent_passport ? String(s.parent_passport) : '',
      photoConsent:    Boolean(s.photo_consent),
      comment:         s.reg_comment   ?? '',
      currentPrice:    '0.00',
      currentPriceDesc: 'Не выбран',
    }
  })

  // Stats
  const totalCount = computed(() => pagination.value.total)
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

  function toIsoDate(value: unknown): string | null {
    if (!value) return null
    const text = String(value)
    const match = text.match(/^(\d{4}-\d{2}-\d{2})/)
    if (match) return match[1]
    const date = new Date(text)
    if (Number.isNaN(date.getTime())) return null
    return date.toISOString().slice(0, 10)
  }

  function diffDaysFrom(dateText: string | null): number {
    if (!dateText) return 0
    const date = new Date(dateText)
    if (Number.isNaN(date.getTime())) return 0
    return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000))
  }

  function normalizeStudent(s: RecruitmentNewStudent): NewStudent {
    const row = s as RecruitmentNewStudent & Record<string, any>
    const createdDate = toIsoDate(row.createdDate ?? row.created_at ?? row.createdAt ?? row.date_create)
    const startDate = toIsoDate(row.startDate ?? row.start_date ?? row.startAt)
    const dob = row.dob ?? row.birth_date ?? row.birthDate ?? null
    const payment = Number(row.payment ?? row.amount ?? row.price ?? 0) || 0
    const rawGroup = row.group as unknown
    const rawManager = row.manager as unknown
    const groupObj = rawGroup && typeof rawGroup === 'object' ? (rawGroup as Record<string, any>) : null
    const managerObj = rawManager && typeof rawManager === 'object' ? (rawManager as Record<string, any>) : null
    const groupNameFromObj = groupObj ? groupObj['name'] : null
    const groupColorFromObj = groupObj ? groupObj['color'] : null
    const managerNameFromObj = managerObj ? managerObj['name'] : null
    const groupName = typeof row.group === 'string'
      ? row.group
      : (row.group_name ?? row.groupName ?? groupNameFromObj ?? null)
    const groupColor = row.groupColor ?? row.group_color ?? groupColorFromObj ?? null
    const manager = typeof row.manager === 'string'
      ? row.manager
      : (row.manager_name ?? row.managerName ?? managerNameFromObj ?? null)
    const contract = row.contract === 'signed' || row.contract === 'pending'
      ? row.contract
      : (row.contract_signed || row.is_signed || row.signed_at ? 'signed' : 'pending')

    return {
      id: Number(row.id),
      name: [row.name ?? row.first_name ?? row.firstName, row.surname ?? row.last_name ?? row.lastName].filter(Boolean).join(' ').trim() || `#${row.id}`,
      age: dob
        ? Math.max(0, Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000))
        : Number(row.age ?? 0),
      contract,
      payment,
      paymentStr: row.paymentStr ?? row.payment_str ?? `${payment} zł`,
      group: groupName,
      groupColor,
      startDate,
      createdDate: createdDate ?? new Date().toISOString().slice(0, 10),
      waitDays: Number(row.waitDays ?? row.wait_days ?? diffDaysFrom(createdDate)) || 0,
      manager,
    }
  }

  async function fetchStudentsFromApi(page = pagination.value.currentPage) {
    isListLoading.value = true
    listError.value = null
    try {
      const response = await recruitmentApi.getNewStudents({
        page,
        perPage: pagination.value.perPage,
      })
      students.value = response.items.map(normalizeStudent)
      pagination.value = response.pagination
    } catch (err: any) {
      students.value = []
      pagination.value = {
        ...pagination.value,
        currentPage: page,
        total: 0,
        from: 0,
        to: 0,
      }
      listError.value = err?.response?.data?.message || err?.message || 'Ошибка загрузки списка'
    } finally {
      isListLoading.value = false
    }
  }

  async function fetchStudentById(id: number | string) {
    isLoading.value = true
    error.value = null
    try {
      const result = await recruitmentApi.getStudentById(id)
      currentStudent.value = result.data
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Ошибка загрузки'
    } finally {
      isLoading.value = false
    }
  }

  function eventColor(event: string): string {
    if (!event) return 'var(--blue)'
    if (event.includes('создан'))    return 'var(--blue)'
    if (event.includes('изменен'))   return 'var(--amber)'
    if (event.includes('архивир'))   return 'var(--red, #ef4444)'
    if (event.includes('группу'))    return 'var(--purple)'
    if (event.includes('оплат'))     return 'var(--green)'
    return 'var(--blue)'
  }

  async function fetchStudentHistory(id: number | string) {
    try {
      const result = await recruitmentApi.getStudentHistory(id)
      const rows = result?.data ?? []
      currentHistory.value = rows.map((h: any) => ({
        event:  h.event   ?? 'Событие',
        date:   h.created_at
          ? new Date(h.created_at).toLocaleDateString('ru-RU')
          : '—',
        detail: [h.detail, h.changed_by ? `(${h.changed_by})` : '']
          .filter(Boolean).join(' '),
        color:  eventColor(h.event),
      }))
    } catch {
      currentHistory.value = []
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
    pagination.value = {
      ...pagination.value,
      total: pagination.value.total + 1,
      from: 1,
      to: Math.min(pagination.value.total + 1, Math.max(students.value.length, pagination.value.perPage || students.value.length)),
    }
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
    pagination.value = {
      ...pagination.value,
      total: Math.max(0, pagination.value.total - 1),
      to: Math.max(0, Math.min(pagination.value.total - 1, students.value.length ? pagination.value.from + students.value.length - 1 : 0)),
    }
    recruitmentApi.archiveNewStudent(studentId).catch(() => {
      // no rollback to keep fast UI interactions
    })
  }

  async function saveDetails(studentId: number, data: Partial<StudentDetails>) {
    // 1. Map camelCase to snake_case for backend
    const payload: any = {}
    if (data.firstName !== undefined) payload.name = data.firstName
    if (data.lastName !== undefined)  payload.surname = data.lastName
    if (data.email !== undefined)     payload.email = data.email
    if (data.birthDate !== undefined) payload.dob = data.birthDate
    if (data.country !== undefined)   payload.country = data.country
    if (data.city !== undefined)      payload.city = data.city
    if (data.street !== undefined)    payload.address = data.street
    if (data.apt !== undefined)       payload.apartment = data.apt
    if (data.postCode !== undefined)  payload.zip = data.postCode
    if (data.parentFirst !== undefined) payload.parent_name = data.parentFirst
    if (data.parentLast !== undefined)  payload.parent_surname = data.parentLast
    if (data.parentPhone !== undefined) payload.parent_phone = data.parentPhone
    if (data.parentPassport !== undefined) payload.parent_passport = data.parentPassport
    if (data.photoConsent !== undefined) payload.photo_consent = data.photoConsent ? 1 : 0
    if (data.comment !== undefined)      payload.reg_comment = data.comment

    try {
      // 2. Call API
      await recruitmentApi.updateStudent(studentId, payload)

      // 3. Update local state
      details.value[studentId] = {
        ...(details.value[studentId] ?? currentStudentDetails.value ?? {} as StudentDetails),
        ...data,
      }
      
      // Update name in the list
      const s = students.value.find(x => x.id === studentId)
      const d = details.value[studentId]
      if (s && (d.firstName || d.lastName)) {
        s.name = [d.firstName, d.lastName].filter(Boolean).join(' ')
      }
    } catch (err) {
      console.error('Failed to save student details:', err)
      throw err
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
    uniqueGroups, uniqueManagers, currentStudent, currentStudentDetails, currentHistory, isLoading, error,
    isListLoading, listError, pagination,
    fetchStudentsFromApi, fetchStudentById, fetchStudentHistory,
    addStudent, assignGroup, archiveStudent, saveDetails, setPrice,
    getDetails, getHistory,
  }
})
