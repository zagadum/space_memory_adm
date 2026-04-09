import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { invoicesApi, type Debtor } from '../api/invoices.api';

export const useDebtorsStore = defineStore('debtors', () => {
  const debtors = ref<Debtor[]>([]);
  const overpayments = ref<any[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const stats = ref<any>(null);

  const pagination = reactive({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 25,
  });

  const filters = reactive({
    project_id: undefined as number | undefined,
    search: '',
  });

  async function fetchDebtors() {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await invoicesApi.getDebtors({
        ...filters,
        page: pagination.currentPage,
        per_page: pagination.perPage,
      });
      debtors.value = response.data;
      pagination.currentPage = response.meta.current_page;
      pagination.lastPage = response.meta.last_page;
      pagination.total = response.meta.total;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch debtors';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchStats() {
    try {
      stats.value = await invoicesApi.getDebtorsStats(filters);
    } catch (e) {
      console.error('Failed to fetch debtor stats', e);
    }
  }

  async function fetchOverpayments() {
    isLoading.value = true;
    try {
      const response = await invoicesApi.getOverpayments({
        ...filters,
        page: pagination.currentPage,
      });
      overpayments.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch overpayments';
    } finally {
      isLoading.value = false;
    }
  }

  function setPage(page: number) {
    pagination.currentPage = page;
    fetchDebtors();
  }

  return {
    debtors,
    overpayments,
    isLoading,
    error,
    stats,
    pagination,
    filters,
    fetchDebtors,
    fetchStats,
    fetchOverpayments,
    setPage,
  };
});
