import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getNewGroups, type NewGroup } from '../api/newGroupsApi'
import type { RecruitmentBackend } from '../api/http'

export const useNewGroupsStore = defineStore('newGroups', () => {
  const groups = ref<NewGroup[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  const totalCount = computed(() => groups.value.length)

  async function fetchGroups(backend: RecruitmentBackend = 'default') {
    isLoading.value = true
    error.value = null
    try {
      const res = await getNewGroups(backend)
      groups.value = res.items || []
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch new groups'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  function setGroups(newGroups: NewGroup[]) {
    groups.value = newGroups
  }

  return {
    groups,
    isLoading,
    error,
    totalCount,
    fetchGroups,
    setGroups
  }
})
