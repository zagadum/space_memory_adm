import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getRecentActivity,
  getActivityList,
  getStudentActivity,
  getGroupActivity,
} from '../api/activity.api'

// ─── Типы ────────────────────────────────────────────────────────────────────

export type ActivityActionType =
  | 'student.created'
  | 'student.updated'
  | 'student.archived'
  | 'student.expelled'
  | 'student.contract_signed'
  | 'student.added_to_group'
  | 'student.removed_from_group'
  | 'student.transferred'
  | 'group.created'
  | 'group.updated'
  | 'group.started'
  | 'group.archived'
  | 'group.teacher_assigned'
  | 'payment.created'
  | 'payment.paid'
  | 'payment.refunded'
  | 'payment.overdue'
  | 'lead.created'
  | 'lead.status_changed'
  | 'lead.converted'
  | 'teacher.created'
  | 'teacher.updated'
  | 'settings.updated'

export type ActivityEntityType = 'student' | 'group' | 'payment' | 'lead' | 'teacher' | 'settings'

export type ActivityStatus = 'success' | 'warning' | 'info' | 'error'

export interface ActivityLog {
  id: string
  action_type: ActivityActionType
  entity_type: ActivityEntityType
  entity_id: string | number | null
  entity_name: string
  actor_id: string | number
  actor_name: string
  description: string
  payload: Record<string, any> | null
  status: ActivityStatus
  created_at: string
}

export interface ActivityListParams {
  page?: number
  per_page?: number
  entity_type?: ActivityEntityType | ''
  action_type?: string
  actor_id?: string | number | ''
  date_from?: string
  date_to?: string
  search?: string
}

export interface ActivityListResponse {
  data: ActivityLog[]
  total: number
  current_page: number
  last_page: number
  per_page: number
}

// ─── Моковые данные ───────────────────────────────────────────────────────────

const MOCK_ACTIVITY: ActivityLog[] = [
  {
    id: '1',
    action_type: 'student.added_to_group',
    entity_type: 'student',
    entity_id: 12,
    entity_name: 'Маша Иванова',
    actor_id: 1,
    actor_name: 'Александр Петров',
    description: 'Ученик добавлен в группу SM-12 (Вт 17:00)',
    payload: { group_name: 'SM-12', group_id: 5 },
    status: 'success',
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    action_type: 'payment.paid',
    entity_type: 'payment',
    entity_id: 890,
    entity_name: 'Инвойс #FA/2026/04/045',
    actor_id: 2,
    actor_name: 'Наталья Сидорова',
    description: 'Платёж 489 zł от ученика Маша Иванова',
    payload: { amount: 489, currency: 'PLN' },
    status: 'success',
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    action_type: 'student.removed_from_group',
    entity_type: 'student',
    entity_id: 7,
    entity_name: 'Кирилл Белов',
    actor_id: 1,
    actor_name: 'Александр Петров',
    description: 'Ученик удалён из группы INDIGO-03',
    payload: { group_name: 'INDIGO-03', group_id: 3, reason: 'Перевод в другую группу' },
    status: 'warning',
    created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    action_type: 'student.transferred',
    entity_type: 'student',
    entity_id: 7,
    entity_name: 'Кирилл Белов',
    actor_id: 1,
    actor_name: 'Александр Петров',
    description: 'Ученик переведён из INDIGO-03 → SM-08',
    payload: { from_group: 'INDIGO-03', to_group: 'SM-08', from_group_id: 3, to_group_id: 8 },
    status: 'info',
    created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    action_type: 'group.created',
    entity_type: 'group',
    entity_id: 18,
    entity_name: 'SM-15 (Чт 18:00)',
    actor_id: 1,
    actor_name: 'Александр Петров',
    description: 'Создана новая группа SM-15 на четверг 18:00',
    payload: { day: 'Четверг', time: '18:00', type: 'group' },
    status: 'success',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    action_type: 'student.contract_signed',
    entity_type: 'student',
    entity_id: 15,
    entity_name: 'Анна Козлова',
    actor_id: 3,
    actor_name: 'Мария Новак',
    description: 'Договор подписан электронной подписью',
    payload: { contract_id: 'DOC-2026-441' },
    status: 'success',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    action_type: 'payment.overdue',
    entity_type: 'payment',
    entity_id: 876,
    entity_name: 'Инвойс #FA/2026/03/087',
    actor_id: 0,
    actor_name: 'Система',
    description: 'Просрочен платёж ученика Виктор Грищенко',
    payload: { amount: 440, days_overdue: 5, student_id: 9 },
    status: 'error',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    action_type: 'lead.converted',
    entity_type: 'lead',
    entity_id: 44,
    entity_name: 'Дмитрий Орлов',
    actor_id: 3,
    actor_name: 'Мария Новак',
    description: 'Лид конвертирован в нового ученика',
    payload: { new_student_id: 20 },
    status: 'success',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '9',
    action_type: 'group.teacher_assigned',
    entity_type: 'group',
    entity_id: 5,
    entity_name: 'SM-12',
    actor_id: 1,
    actor_name: 'Александр Петров',
    description: 'Назначен преподаватель Оксана Мельник',
    payload: { teacher_name: 'Оксана Мельник', teacher_id: 4 },
    status: 'info',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10',
    action_type: 'student.created',
    entity_type: 'student',
    entity_id: 21,
    entity_name: 'Дмитрий Орлов',
    actor_id: 3,
    actor_name: 'Мария Новак',
    description: 'Зарегистрирован новый ученик',
    payload: { source: 'website_form' },
    status: 'success',
    created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '11',
    action_type: 'student.expelled',
    entity_type: 'student',
    entity_id: 6,
    entity_name: 'Полина Синяк',
    actor_id: 2,
    actor_name: 'Наталья Сидорова',
    description: 'Ученик выписан: завершение курса',
    payload: { reason: 'Завершение курса' },
    status: 'warning',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '12',
    action_type: 'group.started',
    entity_type: 'group',
    entity_id: 14,
    entity_name: 'INDIGO-05',
    actor_id: 1,
    actor_name: 'Александр Петров',
    description: 'Группа INDIGO-05 запущена (7 учеников)',
    payload: { students_count: 7 },
    status: 'success',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Моки для конкретных групп
const MOCK_GROUP_ACTIVITY: Record<number | string, ActivityLog[]> = {
  default: [
    {
      id: 'g1',
      action_type: 'group.created',
      entity_type: 'group',
      entity_id: null,
      entity_name: '',
      actor_id: 1,
      actor_name: 'Александр Петров',
      description: 'Группа создана',
      payload: null,
      status: 'success',
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'g2',
      action_type: 'student.added_to_group',
      entity_type: 'student',
      entity_id: 12,
      entity_name: 'Маша Иванова',
      actor_id: 1,
      actor_name: 'Александр Петров',
      description: 'Добавлен ученик: Маша Иванова',
      payload: null,
      status: 'success',
      created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'g3',
      action_type: 'student.added_to_group',
      entity_type: 'student',
      entity_id: 8,
      entity_name: 'Ева Коваль',
      actor_id: 3,
      actor_name: 'Мария Новак',
      description: 'Добавлен ученик: Ева Коваль',
      payload: null,
      status: 'success',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'g4',
      action_type: 'group.teacher_assigned',
      entity_type: 'group',
      entity_id: null,
      entity_name: '',
      actor_id: 1,
      actor_name: 'Александр Петров',
      description: 'Назначен преподаватель: Оксана Мельник',
      payload: { teacher_name: 'Оксана Мельник', teacher_id: 4 },
      status: 'info',
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'g5',
      action_type: 'student.removed_from_group',
      entity_type: 'student',
      entity_id: 5,
      entity_name: 'Полина Синяк',
      actor_id: 1,
      actor_name: 'Александр Петров',
      description: 'Удалён ученик: Полина Синяк (выписана)',
      payload: { reason: 'Выписана' },
      status: 'warning',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'g6',
      action_type: 'student.transferred',
      entity_type: 'student',
      entity_id: 7,
      entity_name: 'Кирилл Белов',
      actor_id: 1,
      actor_name: 'Александр Петров',
      description: 'Ученик Кирилл Белов переведён из этой группы в SM-08',
      payload: { to_group: 'SM-08', to_group_id: 8 },
      status: 'info',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'g7',
      action_type: 'group.started',
      entity_type: 'group',
      entity_id: null,
      entity_name: '',
      actor_id: 1,
      actor_name: 'Александр Петров',
      description: 'Группа запущена — 6 активных учеников',
      payload: { students_count: 6 },
      status: 'success',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Иконка и цвет по типу действия */
export function getActivityMeta(actionType: ActivityActionType): { icon: string; color: string } {
  const map: Record<string, { icon: string; color: string }> = {
    'student.created':          { icon: '🌟', color: 'var(--green)' },
    'student.updated':          { icon: '✏️', color: 'var(--blue)' },
    'student.archived':         { icon: '📁', color: 'var(--dim)' },
    'student.expelled':         { icon: '📤', color: 'var(--amber)' },
    'student.contract_signed':  { icon: '📝', color: 'var(--green)' },
    'student.added_to_group':   { icon: '➕', color: 'var(--green)' },
    'student.removed_from_group': { icon: '➖', color: 'var(--amber)' },
    'student.transferred':      { icon: '🔄', color: 'var(--blue)' },
    'group.created':            { icon: '🎓', color: 'var(--blue)' },
    'group.updated':            { icon: '✏️', color: 'var(--blue)' },
    'group.started':            { icon: '🚀', color: 'var(--green)' },
    'group.archived':           { icon: '🗃️', color: 'var(--dim)' },
    'group.teacher_assigned':   { icon: '👨‍🏫', color: 'var(--purple)' },
    'payment.created':          { icon: '💫', color: 'var(--blue)' },
    'payment.paid':             { icon: '✅', color: 'var(--green)' },
    'payment.refunded':         { icon: '↩️', color: 'var(--amber)' },
    'payment.overdue':          { icon: '🔴', color: 'var(--red)' },
    'lead.created':             { icon: '📋', color: 'var(--blue)' },
    'lead.status_changed':      { icon: '🔄', color: 'var(--purple)' },
    'lead.converted':           { icon: '⭐', color: 'var(--green)' },
    'teacher.created':          { icon: '👨‍🏫', color: 'var(--green)' },
    'teacher.updated':          { icon: '✏️', color: 'var(--blue)' },
    'settings.updated':         { icon: '⚙️', color: 'var(--dim)' },
  }
  return map[actionType] ?? { icon: '📌', color: 'var(--dim)' }
}

/** Форматирование относительного времени */
export function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'только что'
  if (minutes < 60) return `${minutes} мин. назад`
  if (hours < 24) return `${hours} ч. назад`
  if (days === 1) return 'вчера'
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(isoDate))
}

/** Полное форматирование даты + время */
export function formatDateTime(isoDate: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(isoDate))
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useActivityStore = defineStore('activity', () => {
  // Недавние события (для дашборда)
  const recentLogs = ref<ActivityLog[]>([])
  const isLoadingRecent = ref(false)

  // Полный журнал (для страницы /activity)
  const logs = ref<ActivityLog[]>([])
  const isLoading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const perPage = ref(25)

  // Фильтры
  const filters = ref<ActivityListParams>({
    page: 1,
    per_page: 25,
    entity_type: '',
    action_type: '',
    actor_id: '',
    date_from: '',
    date_to: '',
    search: '',
  })

  // История группы
  const groupHistory = ref<ActivityLog[]>([])
  const isLoadingGroup = ref(false)

  // История ученика
  const studentHistory = ref<ActivityLog[]>([])
  const isLoadingStudent = ref(false)

  async function fetchRecent(limit = 5) {
    isLoadingRecent.value = true
    try {
      recentLogs.value = await getRecentActivity(limit)
    } catch {
      // Бэкенд ещё не готов — используем моки
      recentLogs.value = MOCK_ACTIVITY.slice(0, limit)
    } finally {
      isLoadingRecent.value = false
    }
  }

  async function fetchList(params?: ActivityListParams) {
    isLoading.value = true
    if (params) filters.value = { ...filters.value, ...params }
    try {
      const res = await getActivityList(filters.value)
      logs.value = res.data
      total.value = res.total
      currentPage.value = res.current_page
      lastPage.value = res.last_page
    } catch {
      // Фильтрация по мокам
      let filtered = [...MOCK_ACTIVITY]
      if (filters.value.entity_type) {
        filtered = filtered.filter(l => l.entity_type === filters.value.entity_type)
      }
      if (filters.value.search) {
        const q = filters.value.search.toLowerCase()
        filtered = filtered.filter(l =>
          l.description.toLowerCase().includes(q) ||
          l.entity_name.toLowerCase().includes(q) ||
          l.actor_name.toLowerCase().includes(q)
        )
      }
      logs.value = filtered
      total.value = filtered.length
      currentPage.value = 1
      lastPage.value = 1
    } finally {
      isLoading.value = false
    }
  }

  async function fetchGroupHistory(groupId: number | string) {
    isLoadingGroup.value = true
    try {
      groupHistory.value = await getGroupActivity(groupId)
    } catch {
      groupHistory.value = MOCK_GROUP_ACTIVITY.default
    } finally {
      isLoadingGroup.value = false
    }
  }

  async function fetchStudentHistory(studentId: number | string) {
    isLoadingStudent.value = true
    try {
      studentHistory.value = await getStudentActivity(studentId)
    } catch {
      studentHistory.value = MOCK_ACTIVITY.filter(l => l.entity_id === Number(studentId)).slice(0, 8)
        .concat(MOCK_ACTIVITY.slice(0, 4))
    } finally {
      isLoadingStudent.value = false
    }
  }

  function resetFilters() {
    filters.value = {
      page: 1,
      per_page: 25,
      entity_type: '',
      action_type: '',
      actor_id: '',
      date_from: '',
      date_to: '',
      search: '',
    }
  }

  return {
    recentLogs, isLoadingRecent,
    logs, isLoading, total, currentPage, lastPage, perPage, filters,
    groupHistory, isLoadingGroup,
    studentHistory, isLoadingStudent,
    fetchRecent,
    fetchList,
    fetchGroupHistory,
    fetchStudentHistory,
    resetFilters,
  }
})
