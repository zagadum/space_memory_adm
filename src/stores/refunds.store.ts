import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { refundsApi, type RefundRequest, type RefundsStats } from '../api/refunds.api'

export const useRefundsStore = defineStore('refunds', () => {
  const refunds = ref<RefundRequest[]>([])
  const stats = ref<RefundsStats>({
    pending_count: 0,
    pending_amount: 0,
    processing_count: 0,
    completed_month: 0,
    rejected_month: 0
  })
  
  const isLoading = ref(false)
  const isStatsLoading = ref(false)
  const error = ref<string | null>(null)
  
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0
  })

  const filters = ref({
    search: '',
    project_id: null as number | null,
    status: '' as string,
    type: '' as string,
    limit: 50
  })

  async function fetchRefunds() {
    isLoading.value = true
    error.value = null
    try {
      const resp = await refundsApi.getRefunds({
        page: pagination.value.currentPage,
        ...filters.value
      })
      refunds.value = resp.data.data
      pagination.value.lastPage = resp.data.last_page
      pagination.value.total = resp.data.total
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch refunds'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchStats() {
    isStatsLoading.value = true
    try {
      const resp = await refundsApi.getStats({
        project_id: filters.value.project_id
      })
      stats.value = resp.data
    } catch (err) {
      console.error('Failed to fetch refund stats', err)
    } finally {
      isStatsLoading.value = false
    }
  }

  async function approveRefund(id: number, title?: string, manual = false) {
    try {
      await refundsApi.approve(id, { refund_title: title, manual })
      await Promise.all([fetchRefunds(), fetchStats()])
      return true
    } catch (err) {
      return false
    }
  }

  async function rejectRefund(id: number, reason: string) {
    try {
      await refundsApi.reject(id, reason)
      await Promise.all([fetchRefunds(), fetchStats()])
      return true
    } catch (err) {
      return false
    }
  }

  function setPage(page: number) {
    pagination.value.currentPage = page
    fetchRefunds()
  }

  function setFilter(newFilters: Partial<typeof filters.value>) {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.currentPage = 1
    fetchRefunds()
    fetchStats()
  }

  return {
    refunds,
    stats,
    isLoading,
    isStatsLoading,
    error,
    pagination,
    filters,
    fetchRefunds,
    fetchStats,
    approveRefund,
    rejectRefund,
    setPage,
    setFilter
  }
})
