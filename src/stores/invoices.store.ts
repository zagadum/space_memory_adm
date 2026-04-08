import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { invoicesApi, type Invoice, type InvoiceFilters } from '../api/invoices.api';
import { useI18n } from 'vue-i18n';
// Assuming a toast utility exists based on gls-main.md: ToastContainer
// I'll skip toast for now or use a generic alert since I don't see the exact toast store name yet.

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref<Invoice[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const pagination = reactive({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 25,
  });

  const filters = reactive<InvoiceFilters>({
    project_id: undefined,
    type: undefined,
    status: undefined,
    date_from: undefined,
    date_to: undefined,
    search: '',
    per_page: 25,
    page: 1,
  });

  async function fetchInvoices() {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await invoicesApi.getList({
        ...filters,
        page: pagination.currentPage,
      });
      invoices.value = response.data;
      pagination.currentPage = response.meta.current_page;
      pagination.lastPage = response.meta.last_page;
      pagination.total = response.meta.total;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch invoices';
    } finally {
      isLoading.value = false;
    }
  }

  function setPage(page: number) {
    pagination.currentPage = page;
    fetchInvoices();
  }

  function resetFilters() {
    Object.assign(filters, {
      project_id: undefined,
      type: undefined,
      status: undefined,
      date_from: undefined,
      date_to: undefined,
      search: '',
      per_page: 25,
      page: 1,
    });
    pagination.currentPage = 1;
    fetchInvoices();
  }

  async function createInvoice(data: any) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await invoicesApi.create(data);
      await fetchInvoices();
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to create invoice';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    invoices,
    isLoading,
    error,
    pagination,
    filters,
    fetchInvoices,
    setPage,
    resetFilters,
    createInvoice,
  };
});
