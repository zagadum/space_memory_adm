import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { i18n } from '../app/i18n'
import {
  getRecruitmentApi,
  type RecruitmentNewStudent,
  type RecruitmentPagination,
  type RecruitmentStudentPayments,
} from '../api/recruitmentApi'
import type { RecruitmentBackend } from '../api/http'
import { parseApiError } from '../api/errorHelper'
import { APP_ENV } from '../config/env'

export interface StudentDocumentItem {
  id: number | string
  name: string
  signed: boolean
  template?: string | null
}

export interface NewStudent {
  id: number;
  groupId?: string | number | null;
  externalId?: string | number | null;
  groupExternalId?: string | number | null;
  teacherExternalId?: string | number | null;
  name: string;
  firstName?: string;
  lastName?: string;
  patronymic?: string | null;
  age: number;
  contract: 'signed' | 'pending';
  contractOldNew?: 'contract_399' | 'contract_489' | 'contract_600' | 'contract_689' | string | null;
  documents: StudentDocumentItem[];
  payment: number;
  paymentStr: string;
  group: string | null;
  groupColor: string | null;
  startDate: string | null;
  subscriptionEndDate?: string | null;
  createdDate: string;
  waitDays: number;
  manager: string | null;
  phone: string | null;
  email: string | null;
  parentEmail?: string | null;
  parent1FirstName?: string | null;
  parent1Surname?: string | null;
  parent1Phone?: string | null;
  discount?: string | number | null;
  discountName?: string | null;
  discountMode?: string | null;
  discount2Children?: boolean | number | null;
  secondChildExternalId?: string | number | null;
  balance_overpayment?: string | number | null;
  referralDiscountNote?: string | null;
  isPaid: boolean;
  displayPayment: string;
}

export interface StudentDetails extends Partial<NewStudent> {
  password?: string
  nickname?: string
  birthDate?: string
  country?: string
  voivodeship?: string
  city?: string
  street?: string
  apt?: string
  postCode?: string
  parentFirst?: string
  parentLast?: string
  parentPhone?: string
  parentPassport?: string
  hobbies?: string
  comment?: string
  photoConsent?: boolean // legacy/internal
  marketingConsent?: boolean
  digitalContentConsent?: boolean
  dataProcessingConsent?: boolean
  socialMediaConsent?: boolean
  internalQualityConsent?: boolean
  currentPrice?: string
  currentPriceDesc?: string
}

export interface HistoryEvent {
  event: string
  date: string
  detail: string
  color: string
}

export interface StudentTransactionItem {
  id: number | string
  date: string
  amount: number
  currency: string
  status: string
}

export interface StudentPayments {
  studentId: number
  currentPrice: string
  currentPriceDesc: string
  documentList: StudentDocumentItem[]
  transactionList: StudentTransactionItem[]
  discount?: string
  balance_overpayment?: string
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
  1: { phone: '+48 601 111 222', email: 'artem.volkov@gmail.com', password: 'Qwerty123!', nickname: 'Arty', firstName: 'Артем',  lastName: 'Волков',  birthDate: '2012-05-14', country: 'Польша', voivodeship: 'Mazowieckie', city: 'Варшава', street: 'ул. Маршалковска 10', apt: 'кв. 3', postCode: '00-001', parentFirst: 'Сергей', parentLast: 'Волков',  parentPhone: '+48 601 111 222', parentPassport: 'ABC 123456', hobbies: 'Robotyka, LEGO', photoConsent: true,  marketingConsent: true, digitalContentConsent: true, dataProcessingConsent: true, socialMediaConsent: true, internalQualityConsent: true, comment: 'Ребёнок увлекается роботами. Прошу уделить внимание развитию лидерских качеств.', currentPrice: '489.00', currentPriceDesc: 'Group lessons' },
  2: { phone: '+48 602 333 444', email: 'kirill.morozov@mail.ru',  password: 'Pass9876!', nickname: 'Kiri', firstName: 'Кирилл', lastName: 'Морозов', birthDate: '2015-09-22', country: 'Польша', voivodeship: 'Mazowieckie', city: 'Варшава', street: 'ул. Новый Свят 5',   apt: '',       postCode: '00-400', parentFirst: 'Анна',   parentLast: 'Морозова', parentPhone: '+48 602 333 444', parentPassport: 'DEF 654321', hobbies: '', photoConsent: false, marketingConsent: false, digitalContentConsent: false, dataProcessingConsent: true, socialMediaConsent: false, internalQualityConsent: true, comment: '',                                                                                 currentPrice: '0.00',   currentPriceDesc: 'Не выбран'   },
  3: { email: 'daniil.glebov@wp.pl',     password: 'Secure789@', nickname: 'Dan', firstName: 'Даниил', lastName: 'Глебов',  birthDate: '2010-11-03', country: 'Польша', voivodeship: 'Małopolskie', city: 'Краков',  street: 'ул. Флорианска 20',  apt: 'кв. 7', postCode: '30-001', parentFirst: 'Ирина',  parentLast: 'Глебова',  parentPhone: '+48 603 555 666', parentPassport: 'GHI 987654', hobbies: 'Kosmos, książki', photoConsent: true,  marketingConsent: true, digitalContentConsent: true, dataProcessingConsent: true, socialMediaConsent: true, internalQualityConsent: true, comment: 'Ребёнок любит космос и читать книги.',                                             currentPrice: '440.10', currentPriceDesc: 'Family 2nd child −10%' },
  4: { email: 'nikita.ivanov@gmail.com', password: 'Ivan2024#', nickname: '', firstName: 'Никита', lastName: 'Иванов',  birthDate: '2017-03-19', country: 'Польша', voivodeship: 'Mazowieckie', city: 'Варшава', street: 'ул. Пулавска 88',    apt: 'кв.12', postCode: '02-603', parentFirst: 'Дмитрий',parentLast: 'Иванов',   parentPhone: '+48 604 777 888', parentPassport: 'JKL 112233', hobbies: '', photoConsent: true,  marketingConsent: false, digitalContentConsent: false, dataProcessingConsent: true, socialMediaConsent: false, internalQualityConsent: true, comment: 'Застенчивый ребёнок, привыкает медленно.',                                         currentPrice: '0.00',   currentPriceDesc: 'Не выбран'   },
  5: { email: 'polina.sinak@gmail.com',  password: 'Pol2024!', nickname: 'Poli', firstName: 'Полина', lastName: 'Синяк',   birthDate: '2014-07-08', country: 'Польша', voivodeship: 'Mazowieckie', city: 'Варшава', street: 'ул. Садова 12',      apt: 'кв. 2', postCode: '00-500', parentFirst: 'Олег',   parentLast: 'Синяк',    parentPhone: '+48 605 888 999', parentPassport: 'MNO 345678', hobbies: '', photoConsent: true,  marketingConsent: false, digitalContentConsent: false, dataProcessingConsent: true, socialMediaConsent: false, internalQualityConsent: true, comment: '',                                                                                 currentPrice: '0.00',   currentPriceDesc: 'Не выбран'   },
  6: { email: 'anya.belova@wp.pl',       password: 'Bel2024#', nickname: 'Anya', firstName: 'Аня',    lastName: 'Белова',  birthDate: '2016-02-14', country: 'Польша', voivodeship: 'Mazowieckie', city: 'Варшава', street: 'ул. Крулевска 5',    apt: '',       postCode: '00-200', parentFirst: 'Наташа', parentLast: 'Белова',    parentPhone: '+48 606 111 222', parentPassport: 'PQR 456789', hobbies: 'Rysowanie', photoConsent: false, marketingConsent: true, digitalContentConsent: false, dataProcessingConsent: true, socialMediaConsent: false, internalQualityConsent: true, comment: 'Девочка активная, любит рисовать.',                                                 currentPrice: '464.50', currentPriceDesc: 'Recommendation −5%'  },
  7: { email: 'sasha.popov@gmail.com',   password: 'Pop2024!', nickname: 'Sash', firstName: 'Саша',   lastName: 'Попов',   birthDate: '2013-11-25', country: 'Польша', voivodeship: 'Mazowieckie', city: 'Варшава', street: 'ул. Злота 22',       apt: 'кв. 4', postCode: '00-300', parentFirst: 'Виктор', parentLast: 'Попов',     parentPhone: '+48 607 222 333', parentPassport: 'STU 567890', hobbies: '', photoConsent: true,  marketingConsent: false, digitalContentConsent: false, dataProcessingConsent: true, socialMediaConsent: false, internalQualityConsent: true, comment: '',                                                                                 currentPrice: '0.00',   currentPriceDesc: 'Не выбран'   },
  8: { email: 'eva.koval@gmail.com',     password: 'Eva2024#', nickname: 'Evi', firstName: 'Ева',    lastName: 'Коваль',  birthDate: '2018-06-30', country: 'Польша', voivodeship: 'Mazowieckie', city: 'Варшава', street: 'ул. Мокотовска 8',   apt: '',       postCode: '00-600', parentFirst: 'Юлия',   parentLast: 'Коваль',    parentPhone: '+48 608 333 444', parentPassport: 'VWX 678901', hobbies: '', photoConsent: true,  marketingConsent: false, digitalContentConsent: false, dataProcessingConsent: true, socialMediaConsent: false, internalQualityConsent: true, comment: 'Самый маленький ребёнок в наборе — нужна мягкая адаптация.',                       currentPrice: '0.00',   currentPriceDesc: 'Не выбран'   },
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

const USE_MOCK_BY_DEFAULT = APP_ENV.useMock

export const useNewStudentsStore = defineStore('newStudents', () => {
  const currentBackend = ref<RecruitmentBackend>('default')
  const students = ref<NewStudent[]>([])
  const details = ref<Record<number, StudentDetails>>(USE_MOCK_BY_DEFAULT ? { ...MOCK_DETAILS } : {})
  const history = ref<Record<number, HistoryEvent[]>>({ ...MOCK_HISTORY })

  const currentStudent = ref<any | null>(null)
  const currentHistory = ref<HistoryEvent[]>([])
  const currentStudentPayments = ref<StudentPayments | null>(null)
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

  const filters = ref({
    search: '',
    manager: 'all',
    group: 'all',
    onlyMine: false,
    noManager: false,
    signed: false,
    debtors: false,
  })

  const currentStudentDetails = computed((): StudentDetails | null => {
    const s = currentStudent.value
    if (!s) return null
    return {
      id:              s.id,
      externalId:      s.external_id   ?? s.externalId ?? null,
      email:           s.email         ?? s.parent_email ?? '',
      password:        s.password      ?? '',
      nickname:        s.nickname      ?? s.nick_name ?? '',
      firstName:       s.name          ?? s.first_name ?? '',
      lastName:        s.surname       ?? s.last_name ?? '',
      patronymic:      s.patronymic    ?? null,
      birthDate:       s.dob           ?? s.birth_date ?? '',
      country:         s.country       ?? '',
      voivodeship:     s.voivodeship   ?? '',
      city:            s.city          ?? '',
      street:          s.address       ?? '',
      apt:             s.apartment     ? String(s.apartment) : '',
      postCode:        s.zip           ?? '',
      parentFirst:     s.parent_name   ?? s.parent1_first_name ?? '',
      parentLast:      s.parent_surname ?? s.parent1_surname ?? '',
      parentPhone:     s.parent_phone  ? String(s.parent_phone) : (s.parent1_phone ? String(s.parent1_phone) : ''),
      parentPassport:  s.parent_passport ? String(s.parent_passport) : '',
      hobbies:         s.hobbies       ?? '',
      comment:         s.reg_comment   ?? '',
      photoConsent:    Boolean(s.photo_consent),
      marketingConsent: Boolean(s.marketing_consent_accepted),
      digitalContentConsent: Boolean(s.digital_content_consent),
      dataProcessingConsent: Boolean(s.data_processing_accepted),
      socialMediaConsent: Boolean(s.social_media_consent),
      internalQualityConsent: Boolean(s.internal_quality_consent),
      currentPrice:    s.subscription_amount ? String(s.subscription_amount) : '0.00',
      currentPriceDesc: s.discount_name ?? 'Не выбран',
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

  function calculateAge(birthDate: string): number {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  function normalizeStudent(s: RecruitmentNewStudent): NewStudent {
    const row = s as RecruitmentNewStudent & Record<string, any>
    const createdDate = toIsoDate(row.createdDate ?? row.created_at ?? row.createdAt ?? row.date_create)
    const startDate = toIsoDate(row.startDate ?? row.start_date ?? row.startAt)
    const subscriptionEndDate = toIsoDate(row.subscription_end_date ?? row.subscriptionEndDate ?? null)
    const dob = row.dob ?? row.birth_date ?? row.birthDate ?? null
    const payment = Number(row.payment ?? row.amount ?? row.price ?? row.subscription_amount ?? 0) || 0
    const rawGroup = row.group as unknown
    const rawManager = row.manager as unknown
    const groupObj = rawGroup && typeof rawGroup === 'object' ? (rawGroup as Record<string, any>) : null
    const managerObj = rawManager && typeof rawManager === 'object' ? (rawManager as Record<string, any>) : null
    const groupNameFromObj = groupObj ? groupObj['name'] : null
    const groupIdFromObj = groupObj ? groupObj['id'] : null
    const groupColorFromObj = groupObj ? groupObj['color'] : null
    const managerNameFromObj = managerObj ? managerObj['name'] : null
    const groupName = typeof row.group === 'string'
      ? row.group
      : (row.group_name ?? row.groupName ?? groupNameFromObj ?? null)
    const groupColor = row.groupColor ?? row.group_color ?? groupColorFromObj ?? null
    const manager = typeof row.manager === 'string'
      ? row.manager
      : (row.manager_name ?? row.managerName ?? managerNameFromObj ?? null)
    
    // Support multi-documents
    const docs: StudentDocumentItem[] = row.documents || row.document_list || []
    if (docs.length === 0) {
      const isSigned = row.contract === 'signed' || row.contract_signed || row.is_signed || row.signed_at
      docs.push({ id: 'doc1', name: 'Umowa edukacyjna', signed: !!isSigned })
      docs.push({ id: 'doc2', name: 'Zgoda RODO', signed: !!isSigned })
    }
    const allSigned = docs.length > 0 && docs.every(d => d.signed)

    return {
      id: Number(row.id),
      groupId: row.group_id ?? row.groupId ?? groupIdFromObj ?? null,
      externalId: row.external_id ?? row.externalId ?? null,
      groupExternalId: row.group_external_id ?? row.groupExternalId ?? null,
      teacherExternalId: row.teacher_external_id ?? row.teacherExternalId ?? null,
      name: [row.name ?? row.first_name ?? row.firstName, row.surname ?? row.last_name ?? row.lastName].filter(Boolean).join(' ').trim() || `#${row.id}`,
      firstName: row.first_name ?? row.firstName ?? (row.name?.split(' ')[0]) ?? '',
      lastName: row.surname ?? row.last_name ?? row.lastName ?? (row.name?.split(' ').slice(1).join(' ')) ?? '',
      patronymic: row.patronymic ?? null,
      age: dob ? calculateAge(dob) : Number(row.age ?? 0),
      contract: allSigned ? 'signed' : 'pending',
      contractOldNew: row.contract_old_new ?? row.contractOldNew ?? null,
      documents: docs,
      payment,
      paymentStr: row.paymentStr ?? row.payment_str ?? `${payment} zł`,
      isPaid: String(row.paymentStr ?? row.payment_str ?? '').toLowerCase().includes('оплачено'),
      displayPayment: String(row.paymentStr ?? row.payment_str ?? `${payment} zł`)
        .replace(/·?\s*оплачено/gi, '')
        .trim(),
      group: groupName,
      groupColor,
      startDate,
      subscriptionEndDate,
      createdDate: createdDate ?? new Date().toISOString().slice(0, 10),
      waitDays: Number(row.waitDays ?? row.wait_days ?? diffDaysFrom(createdDate)) || 0,
      manager,
      phone: String(row.phone ?? row.parent_phone ?? row.parentPhone ?? ''),
      email: String(row.email ?? row.parent_email ?? row.parentEmail ?? ''),
      parentEmail: row.parent_email ?? row.parentEmail ?? row.parent_email ?? null,
      parent1FirstName: row.parent1_first_name ?? row.parent1FirstName ?? null,
      parent1Surname: row.parent1_surname ?? row.parent1Surname ?? null,
      parent1Phone: row.parent1_phone ?? row.parent1Phone ?? null,
      discount: row.discount ?? null,
      discountName: row.discount_name ?? row.discountName ?? null,
      discountMode: row.discount_mode ?? row.discountMode ?? null,
      discount2Children: row.discount_2_children ?? null,
      secondChildExternalId: row.second_child_external_id ?? null,
      balance_overpayment: row.balance_overpayment ?? null,
      referralDiscountNote: row.referral_discount_note ?? null,
    }
  }

  function resolveApi(backend?: RecruitmentBackend) {
    currentBackend.value = backend ?? currentBackend.value
    return getRecruitmentApi(currentBackend.value)
  }

  async function fetchStudentsFromApi(page = pagination.value.currentPage, backend?: RecruitmentBackend) {
    isListLoading.value = true
    listError.value = null
    try {
      const response = await resolveApi(backend).getNewStudents({
        page,
        perPage: pagination.value.perPage,
        search: filters.value.search,
        manager: filters.value.manager !== 'all' ? filters.value.manager : undefined,
        group: filters.value.group !== 'all' ? filters.value.group : undefined,
        only_mine: filters.value.onlyMine ? 1 : undefined,
        no_manager: filters.value.noManager ? 1 : undefined,
        signed: filters.value.signed ? 1 : undefined,
        debtors: filters.value.debtors ? 1 : undefined,
      })
      students.value = response.items.map(normalizeStudent)
      pagination.value = response.pagination
    } catch (err: unknown) {
      students.value = []
      pagination.value = {
        ...pagination.value,
        currentPage: page,
        total: 0,
        from: 0,
        to: 0,
      }
      listError.value = parseApiError(err, 'Ошибка загрузки списка')
    } finally {
      isListLoading.value = false
    }
  }

  async function applyFilters() {
    pagination.value.currentPage = 1
    await fetchStudentsFromApi(1)
  }

  async function fetchStudentById(id: number | string, backend?: RecruitmentBackend) {
    isLoading.value = true
    error.value = null
    currentStudent.value = null
    try {
      const result = await resolveApi(backend).getStudentById(id)
      currentStudent.value = result.data
      // Fix race condition: if payments were already loaded, merge discount/overpayment now
      const studentId = Number(id)
      if (currentStudentPayments.value?.studentId === studentId) {
        const raw = result.data
        const disc = raw?.discount != null ? String(raw.discount) : undefined
        const ovp  = raw?.balance_overpayment != null ? String(raw.balance_overpayment) : undefined
        if (disc !== undefined || ovp !== undefined) {
          currentStudentPayments.value = {
            ...currentStudentPayments.value,
            ...(disc !== undefined ? { discount: disc } : {}),
            ...(ovp  !== undefined ? { balance_overpayment: ovp } : {}),
          }
        }
      }
    } catch (err: unknown) {
      error.value = parseApiError(err, 'Ошибка загрузки')
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

  async function fetchStudentHistory(id: number | string, backend?: RecruitmentBackend) {
    try {
      const result = await resolveApi(backend).getStudentHistory(id)
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

  function mapStudentPayments(studentId: number, payload: RecruitmentStudentPayments): StudentPayments {
    return {
      studentId,
      currentPrice: payload.currentPrice || '0.00',
      currentPriceDesc: payload.currentPriceDesc || 'Не выбран',
      documentList: Array.isArray(payload.documentList) ? payload.documentList : [],
      transactionList: Array.isArray(payload.transactionList) ? payload.transactionList : [],
      discount: payload.discount,
      balance_overpayment: payload.balance_overpayment,
    }
  }

  async function fetchStudentPayments(id: number | string, backend?: RecruitmentBackend) {
    const studentId = Number(id)
    if (!studentId) {
      currentStudentPayments.value = null
      return
    }

    currentStudentPayments.value = null
    try {
      const result = await resolveApi(backend).getStudentPayments(id)
      const mapped = mapStudentPayments(studentId, result)
      // Merge discount/overpayment from currentStudent raw data if not provided by payments endpoint
      if (currentStudent.value && Number(currentStudent.value.id) === studentId) {
        if (mapped.discount === undefined && currentStudent.value.discount != null) {
          mapped.discount = String(currentStudent.value.discount)
        }
        if (mapped.balance_overpayment === undefined && currentStudent.value.balance_overpayment != null) {
          mapped.balance_overpayment = String(currentStudent.value.balance_overpayment)
        }
      }
      currentStudentPayments.value = mapped
    } catch {
      const raw = currentStudent.value
      currentStudentPayments.value = {
        studentId,
        currentPrice: details.value[studentId]?.currentPrice || '0.00',
        currentPriceDesc: details.value[studentId]?.currentPriceDesc || 'Не выбран',
        documentList: [],
        transactionList: [],
        discount: raw?.discount != null ? String(raw.discount) : undefined,
        balance_overpayment: raw?.balance_overpayment != null ? String(raw.balance_overpayment) : undefined,
      }
    }
  }

  async function inviteNewStudent(data: {
    firstName: string;
    lastName: string;
    email: string;
    studentEmail: string;
    price: string | number;
    phone?: string;
    discount?: string | number;
    contractType?: string;
  }, backend?: RecruitmentBackend) {
    // We do NOT add the user to the local `students` array yet.
    // They will only appear here once they complete registration via the TargetMail link.
    
    await resolveApi(backend).inviteNewStudent({
      first_name: data.firstName,
      surname: data.lastName,
      email: data.email,
      parent_email: data.email,
      nickname: data.studentEmail,
      subscription_amount: data.price,
      phone: data.phone,
      discount: data.discount,
      contract_old_new: data.contractType ?? 'contract_489'
    })
  }

  function assignGroup(studentId: number, groupName: string, color: string) {
    const s = students.value.find(x => x.id === studentId)
    if (s) { s.group = groupName; s.groupColor = color }
    if (history.value[studentId]) {
      history.value[studentId].push({ event: 'Добавлен в группу', date: new Date().toLocaleDateString('ru-RU'), detail: groupName, color: 'var(--purple)' })
    }
  }

  function archiveStudent(studentId: number, backend?: RecruitmentBackend) {
    students.value = students.value.filter(s => s.id !== studentId)
    pagination.value = {
      ...pagination.value,
      total: Math.max(0, pagination.value.total - 1),
      to: Math.max(0, Math.min(pagination.value.total - 1, students.value.length ? pagination.value.from + students.value.length - 1 : 0)),
    }
    resolveApi(backend).archiveNewStudent(studentId).catch(() => {
      // no rollback to keep fast UI interactions
    })
  }

  async function saveDetails(studentId: number, data: Partial<StudentDetails>, backend?: RecruitmentBackend, historyComment?: string) {
    // 1. Map camelCase to snake_case for backend
    const payload: any = {}
    if (historyComment) payload.history_comment = historyComment
    if (data.firstName !== undefined) payload.name = data.firstName
    if (data.lastName !== undefined)  payload.surname = data.lastName
    if (data.email !== undefined)     payload.email = data.email
    if (data.nickname !== undefined)  payload.nickname = data.nickname
    if (data.birthDate !== undefined) payload.dob = data.birthDate
    if (data.country !== undefined)   payload.country = data.country
    if (data.voivodeship !== undefined) payload.voivodeship = data.voivodeship
    if (data.city !== undefined)      payload.city = data.city
    if (data.street !== undefined)    payload.address = data.street
    if (data.apt !== undefined)       payload.apartment = data.apt
    if (data.postCode !== undefined)  payload.zip = data.postCode
    if (data.parentFirst !== undefined) payload.parent_name = data.parentFirst
    if (data.parentLast !== undefined)  payload.parent_surname = data.parentLast
    if (data.parentPhone !== undefined) payload.parent_phone = data.parentPhone
    if (data.parentPassport !== undefined) payload.parent_passport = data.parentPassport
    if (data.hobbies !== undefined)      payload.hobbies = data.hobbies
    if (data.comment !== undefined)      payload.reg_comment = data.comment
    if (data.photoConsent !== undefined) payload.photo_consent = data.photoConsent ? 1 : 0
    if (data.marketingConsent !== undefined) payload.marketing_consent_accepted = data.marketingConsent ? 1 : 0
    if (data.digitalContentConsent !== undefined) payload.digital_content_consent = data.digitalContentConsent ? 1 : 0
    if (data.dataProcessingConsent !== undefined) payload.data_processing_accepted = data.dataProcessingConsent ? 1 : 0
    if (data.socialMediaConsent !== undefined) payload.social_media_consent = data.socialMediaConsent ? 1 : 0
    if (data.internalQualityConsent !== undefined) payload.internal_quality_consent = data.internalQualityConsent ? 1 : 0

    try {
      // 2. Call API
      await resolveApi(backend).updateStudent(studentId, payload)

      // 3. Update local state
      details.value[studentId] = {
        ...(details.value[studentId] ?? currentStudentDetails.value ?? {} as StudentDetails),
        ...data,
      }

      if (currentStudent.value && Number(currentStudent.value.id) === Number(studentId)) {
        Object.assign(currentStudent.value, payload)
      }
      
      // Update name in the list
      const s = students.value.find(x => x.id === studentId)
      const d = details.value[studentId]
      if (s && (d.firstName || d.lastName)) {
        s.name = [d.firstName, d.lastName].filter(Boolean).join(' ')
      }

      if (historyComment) {
        if (!history.value[studentId]) history.value[studentId] = []
        history.value[studentId].push({
          event: i18n.global.t('newStudents.panel.historyConsentChanged'),
          date: new Date().toLocaleDateString('ru-RU'),
          detail: historyComment,
          color: 'var(--amber)'
        })
        if (currentStudent.value && Number(currentStudent.value.id) === Number(studentId)) {
          currentHistory.value = [...history.value[studentId]]
        }
      }
    } catch (err) {
      console.error('Failed to save student details:', err)
      throw err
    }
  }

  async function updateStudentPaymentAdjustments(
    studentId: number,
    payload: { discount?: string; balance_overpayment?: string },
    backend?: RecruitmentBackend
  ) {
    await resolveApi(backend).updateStudent(studentId, payload)
    if (currentStudent.value && Number(currentStudent.value.id) === studentId) {
      if (payload.discount !== undefined) currentStudent.value.discount = payload.discount
      if (payload.balance_overpayment !== undefined) currentStudent.value.balance_overpayment = payload.balance_overpayment
    }
    if (currentStudentPayments.value?.studentId === studentId) {
      if (payload.discount !== undefined) currentStudentPayments.value.discount = payload.discount
      if (payload.balance_overpayment !== undefined) currentStudentPayments.value.balance_overpayment = payload.balance_overpayment
    }
  }

  async function changeStudentPassword(studentId: number, password: string, backend?: RecruitmentBackend) {
    await resolveApi(backend).changePassword(studentId, password)
    if (details.value[studentId]) {
      details.value[studentId].password = ''
    }
  }

  function setPrice(studentId: number, amount: string, desc: string) {
    const s = students.value.find(x => x.id === studentId)
    if (s) { s.paymentStr = `${amount} zł`; s.payment = parseFloat(amount) }
    if (details.value[studentId]) {
      details.value[studentId].currentPrice = amount
      details.value[studentId].currentPriceDesc = desc
    }
    if (currentStudentPayments.value?.studentId === studentId) {
      currentStudentPayments.value.currentPrice = amount
      currentStudentPayments.value.currentPriceDesc = desc
    }
    if (history.value[studentId]) {
      history.value[studentId].push({ event: 'Цена изменена', date: new Date().toLocaleDateString('ru-RU'), detail: `${amount} zł — ${desc}`, color: 'var(--amber)' })
    }
  }

  async function downloadDocument(id: number | string, type: 'signed' | 'template', filename: string, backend?: RecruitmentBackend) {
    try {
      const blob = await resolveApi(backend).downloadDocument(id, type)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename || `document-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download document:', err)
      throw err
    }
  }

  async function deleteDocument(id: number | string, studentId: number, backend?: RecruitmentBackend) {
    try {
      await resolveApi(backend).deleteDocument(id)
      
      // Update local currentStudentPayments
      if (currentStudentPayments.value?.studentId === studentId) {
        currentStudentPayments.value.documentList = currentStudentPayments.value.documentList.filter(d => d.id !== id)
      }

      // Update local students list (documents count/status)
      const s = students.value.find(x => x.id === studentId)
      if (s) {
        s.documents = s.documents.filter(d => d.id !== id)
        const allSigned = s.documents.length > 0 && s.documents.every(d => d.signed)
        s.contract = allSigned ? 'signed' : 'pending'
      }
    } catch (err) {
      console.error('Failed to delete document:', err)
      throw err
    }
  }

  async function deleteAllDocuments(studentId: number, backend?: RecruitmentBackend) {
    try {
      await resolveApi(backend).deleteAllDocuments(studentId)
      
      // Update local currentStudentPayments
      if (currentStudentPayments.value?.studentId === studentId) {
        currentStudentPayments.value.documentList = []
      }

      // Update local students list
      const s = students.value.find(x => x.id === studentId)
      if (s) {
        s.documents = []
        s.contract = 'pending'
      }
    } catch (err) {
      console.error('Failed to delete all documents:', err)
      throw err
    }
  }

  function getDetails(studentId: number): StudentDetails | null {
    return details.value[studentId] || null
  }

  function getHistory(studentId: number): HistoryEvent[] {
    return history.value[studentId] || [{ event: 'Ученик создан', date: '—', detail: '', color: 'var(--blue)' }]
  }

  // Always-fresh computed values pulled directly from currentStudent raw data
  const currentStudentDiscount = computed<string>(() => {
    if (currentStudent.value?.discount != null) return String(currentStudent.value.discount)
    if (currentStudentPayments.value?.discount != null) return String(currentStudentPayments.value.discount)
    return ''
  })

  const currentStudentOverpayment = computed<string>(() => {
    if (currentStudent.value?.balance_overpayment != null) return String(currentStudent.value.balance_overpayment)
    if (currentStudentPayments.value?.balance_overpayment != null) return String(currentStudentPayments.value.balance_overpayment)
    return ''
  })

  return {
    students, totalCount, signedCount, noManagerCount, avgWaitDays,
    uniqueGroups, uniqueManagers, currentStudent, currentStudentDetails, currentHistory, currentStudentPayments,
    currentStudentDiscount, currentStudentOverpayment,
    isLoading, error,
    isListLoading, listError, pagination,
    fetchStudentsFromApi, fetchStudentById, fetchStudentHistory, fetchStudentPayments,
    inviteNewStudent, assignGroup, archiveStudent, saveDetails, setPrice, updateStudentPaymentAdjustments, changeStudentPassword,
    downloadDocument, deleteDocument, deleteAllDocuments,
    getDetails, getHistory, filters, applyFilters,
  }
})
