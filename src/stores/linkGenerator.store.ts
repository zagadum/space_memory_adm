import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getLinkGeneratorApi, type LinkGeneratorHistoryItem, type GenerateLinkRequest } from '../api/linkGenerator.api'
import type { RecruitmentBackend } from '../api/http'

export const useLinkGeneratorStore = defineStore('linkGenerator', () => {
  const isLoading = ref(false)
  const history = ref<LinkGeneratorHistoryItem[]>([])
  const error = ref<string | null>(null)
  const currentBackend = ref<RecruitmentBackend>('default')

  function resolveApi(backend?: RecruitmentBackend) {
    const b = backend ?? currentBackend.value
    currentBackend.value = b
    return getLinkGeneratorApi(b)
  }

  async function fetchHistory(backend?: RecruitmentBackend) {
    isLoading.value = true
    error.value = null
    try {
      history.value = await resolveApi(backend).getHistory()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch history'
    } finally {
      isLoading.value = false
    }
  }

  async function generateLink(data: GenerateLinkRequest, backend?: RecruitmentBackend) {
    isLoading.value = true
    error.value = null
    try {
      const api = resolveApi(backend)
      const result = await api.generate(data)
      await fetchHistory(currentBackend.value)
      return result
    } catch (e: any) {
      error.value = e.message || 'Failed to generate link'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteLink(id: number) {
    try {
      await resolveApi().delete(id)
      history.value = history.value.filter(item => item.id !== id)
    } catch (e: any) {
      error.value = e.message || 'Failed to delete link'
    }
  }

  async function clearHistory() {
    try {
      await resolveApi().clear()
      history.value = []
    } catch (e: any) {
      error.value = e.message || 'Failed to clear history'
    }
  }

  return {
    isLoading,
    history,
    error,
    currentBackend,
    fetchHistory,
    generateLink,
    deleteLink,
    clearHistory,
  }
})
