import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTeachers, getTeacher, updateTeacher, changeTeacherPassword, type TeacherListParams, type TeacherListItem, type TeacherDetails } from '../api/teachersApi'

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
      sorting.value.orderDirection = 'asc'
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
    } catch (e: any) {
      error.value = 'Failed to fetch teacher details'
    } finally {
      detailsLoading.value = false
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

  return {
    teachers, selectedTeacherDetails, loading, detailsLoading, error, pagination, filters, sorting,
    totalTeachers, fetchTeachers, applyFilters, setSort, setPage,
    fetchTeacherDetails, updateTeacherDetails, changePassword,
  }
})
