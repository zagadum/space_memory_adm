import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getGroups, type GroupListParams, type GroupListItem } from '../api/groupsApi'

export const useGroupsListStore = defineStore('groupsList', () => {
  // State
  const groups = ref<GroupListItem[]>([])
  const loading = ref(false)
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
      groups.value = result.data || []
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
    pagination,
    filters,
    sorting,
    totalGroups,
    fetchGroups,
    applyFilters,
    setSort,
    setPage,
  }
})
