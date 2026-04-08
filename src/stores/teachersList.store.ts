import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTeachers, getTeacher, createTeacher, updateTeacher, changeTeacherPassword, type TeacherListParams, type TeacherListItem, type TeacherDetails } from '../api/teachersApi'

export const useTeachersListStore = defineStore('teachersList', () => {
  const teachers = ref<TeacherListItem[]>([])
  const selectedTeacherDetails = ref<TeacherDetails | null>(null)
  const loading = ref(false)
  const detailsLoading = ref(false)
  const error = ref('')

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
    city: null as string | null,
  })

  const sorting = ref({
    orderBy: 'lastName',
    orderDirection: 'asc' as 'asc' | 'desc',
  })

  // Profile data
  const teacherHistory = ref<any[]>([])
  const teacherGroups = ref<any[]>([])
  const teacherNotes = ref<any[]>([])

  const totalTeachers = computed(() => pagination.value.total || teachers.value.length)

  async function fetchTeachers(page?: number) {
    loading.value = true
    error.value = ''
    try {
      const params: TeacherListParams = {
        page: page ?? pagination.value.currentPage,
        per_page: pagination.value.perPage,
        search: filters.value.search || undefined,
        city: filters.value.city,
        orderBy: sorting.value.orderBy,
        orderDirection: sorting.value.orderDirection,
      }
      const result = await getTeachers(params)
      teachers.value = result.data || []
      pagination.value = {
        currentPage: result.meta.current_page,
        lastPage: result.meta.last_page,
        perPage: result.meta.per_page,
        total: result.meta.total,
        from: result.meta.from ?? 0,
        to: result.meta.to ?? 0,
      }
    } catch (e: any) {
      error.value = 'Failed to fetch teachers'
    } finally {
      loading.value = false
    }
  }

  async function applyFilters() {
    pagination.value.currentPage = 1
    await fetchTeachers(1)
  }

  function setSort(orderBy: string) {
    if (sorting.value.orderBy === orderBy) {
      sorting.value.orderDirection = sorting.value.orderDirection === 'asc' ? 'desc' : 'asc'
    } else {
      sorting.value.orderBy = orderBy
      sorting.value.orderDirection = orderBy === 'groupsCount' || orderBy === 'studentsCount' ? 'desc' : 'asc'
    }
    applyFilters()
  }

  async function setPage(page: number) {
    if (page < 1 || page > pagination.value.lastPage || page === pagination.value.currentPage) return
    await fetchTeachers(page)
  }

  async function fetchTeacherDetails(id: number) {
    detailsLoading.value = true
    error.value = ''
    try {
      selectedTeacherDetails.value = await getTeacher(id)
      // Fetch related data in parallel if needed, or lazy-load later
    } catch (e: any) {
      error.value = 'Failed to fetch teacher details'
    } finally {
      detailsLoading.value = false
    }
  }

  async function fetchTeacherHistory(id: number) {
    try {
      const { getTeacherHistory } = await import('../api/teachersApi')
      teacherHistory.value = await getTeacherHistory(id)
    } catch (e) {
      console.error('Failed to fetch teacher history', e)
    }
  }

  async function fetchTeacherGroups(id: number) {
    try {
      const { getTeacherGroups } = await import('../api/teachersApi')
      teacherGroups.value = await getTeacherGroups(id)
    } catch (e) {
      console.error('Failed to fetch teacher groups', e)
    }
  }

  async function fetchTeacherNotes(id: number) {
    try {
      const { getTeacherNotes } = await import('../api/teachersApi')
      teacherNotes.value = await getTeacherNotes(id)
    } catch (e) {
      console.error('Failed to fetch teacher notes', e)
    }
  }

  async function addNote(id: number, text: string) {
    try {
      const { addTeacherNote } = await import('../api/teachersApi')
      const newNote = await addTeacherNote(id, text)
      teacherNotes.value.unshift(newNote)
    } catch (e) {
      console.error('Failed to add note', e)
      throw e
    }
  }

  async function updateTeacherComment(id: number, comment: string) {
    try {
      await updateTeacherDetails(id, { comment })
    } catch (e) {
      console.error('Failed to update comment', e)
      throw e
    }
  }

  async function updateTeacherDetails(id: number, data: Partial<TeacherDetails>) {
    loading.value = true
    error.value = ''
    try {
      const updated = await updateTeacher(id, data)
      if (selectedTeacherDetails.value?.id === id) {
        selectedTeacherDetails.value = { ...selectedTeacherDetails.value, ...updated }
      }
      // Update in list if exists
      const idx = teachers.value.findIndex(t => t.id === id)
      if (idx !== -1) {
        teachers.value[idx] = { ...teachers.value[idx], ...updated }
      }
    } catch (e: any) {
      error.value = 'Failed to update teacher'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function changePassword(id: number, password: string) {
    loading.value = true
    error.value = ''
    try {
      await changeTeacherPassword(id, password)
    } catch (e: any) {
      error.value = 'Failed to change password'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function addTeacher(payload: any) {
    loading.value = true
    error.value = ''
    try {
      await createTeacher(payload)
      await fetchTeachers(1) // Refresh to page 1
    } catch (e: any) {
      error.value = 'Failed to create teacher'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    teachers, selectedTeacherDetails, loading, detailsLoading, error, pagination, filters, sorting,
    teacherHistory, teacherGroups, teacherNotes,
    totalTeachers, fetchTeachers, applyFilters, setSort, setPage,
    fetchTeacherDetails, updateTeacherDetails, changePassword, addTeacher,
    fetchTeacherHistory, fetchTeacherGroups, fetchTeacherNotes, addNote, updateTeacherComment
  }
})
