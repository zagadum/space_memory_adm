import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getGroups, type GroupListParams, type GroupListItem } from '../api/groupsApi'

export interface SelectOption {
  id: number
  name: string
}

export interface GroupsListRow {
  id: number
  name: string
  type: string | null
  studentsCount: number
  teacherId: number | null
  teacherName: string
  startDate: string | null
  startTime: string | null
  lastCommentDate: string | null
  lastComment: string | null
  durationDays: number | null
  age: string | null
  workdays: number[]
}

function calculateDurationDays(startDate: string | null): number | null {
  if (!startDate) return null
  const start = new Date(startDate)
  if (Number.isNaN(start.getTime())) return null

  const now = new Date()
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const oneDay = 24 * 60 * 60 * 1000

  return Math.max(0, Math.floor((nowMidnight - startMidnight) / oneDay))
}

function normalizeGroup(item: GroupListItem): GroupsListRow {
  const withComments = item as GroupListItem & {
    lastComment?: string | null
    last_comment?: string | null
    lastCommentDate?: string | null
    last_comment_date?: string | null
  }

  const teacherName = item.teacher?.name
    || item.teacherName
    || [item.teacher?.lastName, item.teacher?.firstName].filter(Boolean).join(' ')
    || '—'

  const workdays = [1, 2, 3, 4, 5, 6, 7].filter((day) => {
    const key = `workday${day}` as keyof GroupListItem
    return Boolean(item[key])
  })

  const dayFromNameMap: Record<string, number> = {
    'пн': 1,
    'вт': 2,
    'ср': 3,
    'чт': 4,
    'пт': 5,
    'сб': 6,
    'нд': 7,
    'вс': 7,
  }
  const fallbackDay = Object.entries(dayFromNameMap).find(([token]) => item.name?.toLowerCase().includes(token))?.[1]
  const normalizedWorkdays = workdays.length ? workdays : (fallbackDay ? [fallbackDay] : [])

  const timeFromName = item.name?.match(/(\d{1,2}:\d{2})/)?.[1] ?? null
  const normalizedStartDate = item.startDate ?? item.start_day ?? null

  return {
    id: Number(item.id),
    name: item.name || '—',
    type: item.type ?? null,
    studentsCount: Number(item.studentsCount ?? item.students_count ?? 0),
    teacherId: Number(item.teacherId ?? item.teacher_id ?? item.teacher?.id ?? 0) || null,
    teacherName,
    startDate: normalizedStartDate,
    startTime: item.startTime ?? item.start_time ?? timeFromName,
    lastCommentDate: withComments.lastCommentDate ?? withComments.last_comment_date ?? null,
    lastComment: withComments.lastComment ?? withComments.last_comment ?? null,
    durationDays: calculateDurationDays(normalizedStartDate),
    age: item.age ?? null,
    workdays: normalizedWorkdays,
  }
}

export const useGroupsListStore = defineStore('groupsList', () => {
  // State
  const groups = ref<GroupsListRow[]>([])
  const loading = ref(false)
  const error = ref('')
  const teachersFilterOptions = ref<SelectOption[]>([])

  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    perPage: 20,
    total: 0,
    from: 0,
    to: 0,
  })

  const filters = ref({
    search: '',
    type: null as string | null,
    teacherId: null as number | null,
  })

  const sorting = ref({
    orderBy: 'name',
    orderDirection: 'asc' as 'asc' | 'desc',
  })

  // Getters
  const totalGroups = computed(() => pagination.value.total || groups.value.length)

  // Actions
  async function fetchGroups(page?: number) {
    loading.value = true
    error.value = ''
    try {
      const params: GroupListParams = {
        page: page ?? pagination.value.currentPage,
        per_page: pagination.value.perPage,
        search: filters.value.search || undefined,
        type: filters.value.type,
        teacher_id: filters.value.teacherId,
        orderBy: sorting.value.orderBy,
        orderDirection: sorting.value.orderDirection,
      }

      const result = await getGroups(params)
      groups.value = (result.data || []).map(normalizeGroup)
      pagination.value = {
        currentPage: result.meta.current_page,
        lastPage: result.meta.last_page,
        perPage: result.meta.per_page,
        total: result.meta.total,
        from: result.meta.from ?? 0,
        to: result.meta.to ?? 0,
      }
    } catch (e: any) {
      error.value = 'Failed to fetch groups'
    } finally {
      loading.value = false
    }
  }

  async function applyFilters() {
    pagination.value.currentPage = 1
    await fetchGroups(1)
  }

  async function fetchTeacherFilterOptions() {
    try {
      const groupsApi = await import('../api/groupsApi')
      const res = await (groupsApi as any).getGroupsTeacherFilter({
        search: filters.value.search || undefined,
      })
      teachersFilterOptions.value = res.items || []
    } catch (e) {
      console.error('Failed to load groups teacher filter options', e)
    }
  }

  function setSort(orderBy: string) {
    if (sorting.value.orderBy === orderBy) {
      sorting.value.orderDirection = sorting.value.orderDirection === 'asc' ? 'desc' : 'asc'
    } else {
      sorting.value.orderBy = orderBy
      sorting.value.orderDirection = 'asc'
    }
    applyFilters()
  }

  async function setPage(page: number) {
    if (page < 1 || page > pagination.value.lastPage || page === pagination.value.currentPage) return
    await fetchGroups(page)
  }

  return {
    groups,
    loading,
    error,
    teachersFilterOptions,
    pagination,
    filters,
    sorting,
    totalGroups,
    fetchGroups,
    fetchTeacherFilterOptions,
    applyFilters,
    setSort,
    setPage,
  }
})
