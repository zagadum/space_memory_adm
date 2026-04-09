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
      const response = await invoicesApi.getDebtors(filters.project_id);
      debtors.value = response.debtors;
      stats.value = response.summary;
      // Note: Backend debtors currently returns array without pagination wrapper for simpler view, 
      // but if we add pagination later we'll update this.
      pagination.total = response.debtors.length;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch debtors';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchStats() {
    // Already unified in fetchDebtors for this specific implementation
    if (!stats.value) await fetchDebtors();
  }

  async function sendReminders(params: { student_ids?: number[], project_id?: number }) {
    isLoading.value = true;
    try {
      return await invoicesApi.sendReminders(params);
    } catch (err: any) {
      error.value = err.message || 'Failed to send reminders';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchOverpayments() {
    isLoading.value = true;
    try {
      // Assuming existing finance/overpayments endpoint exists on backend
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
    sendReminders,
    setPage,
  };
});
