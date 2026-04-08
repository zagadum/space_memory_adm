import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { invoicesApi, type Invoice, type InvoiceFilters } from '../api/invoices.api';
import { useI18n } from 'vue-i18n';
// Assuming a toast utility exists based on gls-main.md: ToastContainer
// I'll skip toast for now or use a generic alert since I don't see the exact toast store name yet.

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref<Invoice[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const selectedIds = ref<number[]>([]);
  const auditLogs = ref<any[]>([]);
  const stats = ref<any>(null);
  
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
    min_amount: undefined,
    max_amount: undefined,
    search: '',
    per_page: 25,
    page: 1,
  });

  const hasActiveFilters = computed(() => {
    return !!(filters.project_id || filters.type || filters.status || filters.date_from || filters.date_to || filters.min_amount || filters.max_amount || filters.search);
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
      min_amount: undefined,
      max_amount: undefined,
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

  async function lookupNip(nip: string) {
    return await invoicesApi.lookupNip(nip);
  }

  async function sendToKsef(id: number) {
    try {
      await invoicesApi.sendToKsef(id);
      await fetchInvoices(); // Refresh list to see status change
    } catch (err: any) {
      error.value = err.message || 'KSeF transmission failed';
      throw err;
    }
  }

  async function fetchKsefStatus(id: number) {
    try {
      const data = await invoicesApi.getKsefStatus(id);
      const idx = invoices.value.findIndex(i => i.id === id);
      if (idx !== -1) {
        invoices.value[idx].ksef_status = data.status as any;
        invoices.value[idx].ksef_reference = data.reference;
      }
    } catch (e: any) {
      console.error('Failed to fetch KSeF status');
    }
  }

  // --- SELECTION & BULK ---
  function toggleSelection(id: number) {
    const idx = selectedIds.value.indexOf(id);
    if (idx === -1) selectedIds.value.push(id);
    else selectedIds.value.splice(idx, 1);
  }

  function selectAllOnPage() {
    selectedIds.value = invoices.value.map(i => i.id);
  }

  function clearSelection() {
    selectedIds.value = [];
  }

  async function bulkSendToKsef() {
    if (selectedIds.value.length === 0) return;
    try {
      await invoicesApi.sendBulkToKsef(selectedIds.value);
      await fetchInvoices();
      clearSelection();
    } catch (e: any) {
      error.value = e.message;
    }
  }

  async function bulkSendEmails() {
    if (selectedIds.value.length === 0) return;
    isLoading.value = true;
    try {
      await invoicesApi.bulkSendEmails(selectedIds.value);
      clearSelection();
      return true;
    } catch (e: any) {
      error.value = 'Failed to send bulk emails';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function bulkMarkAsPaid(ids: number[], paymentDate: string) {
    isLoading.value = true;
    try {
      await invoicesApi.bulkPay(ids, paymentDate);
      await fetchInvoices();
      clearSelection();
    } catch (e: any) {
      error.value = 'Failed to mark invoices as paid';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function bulkDownloadPDFs() {
    if (selectedIds.value.length === 0) return;
    isLoading.value = true;
    try {
      await invoicesApi.bulkDownloadPDFs(selectedIds.value);
    } catch (err) {
      error.value = 'Failed to download PDFs';
    } finally {
      isLoading.value = false;
    }
  }

  async function exportFilteredExcel() {
    try {
      await invoicesApi.exportExcel({
        ...filters,
        ids: selectedIds.value.length > 0 ? selectedIds.value : undefined
      });
    } catch (e: any) {
      error.value = e.message;
    }
  }

  async function issueCorrection(id: number, data: { reason: string; amount_gross: number }) {
    isLoading.value = true;
    try {
      const correction = await invoicesApi.createCorrection(id, data);
      await fetchInvoices();
      return correction;
    } catch (err: any) {
      error.value = 'Failed to create correction';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function sendInvoiceEmail(id: number, content?: { subject?: string; body?: string }) {
    isLoading.value = true;
    try {
      await invoicesApi.sendEmail(id, content);
      return true;
    } catch (err: any) {
      error.value = 'Failed to send email';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function convertProforma(id: number) {
    isLoading.value = true;
    try {
      const updated = await invoicesApi.convert(id);
      const index = invoices.value.findIndex(i => i.id === id);
      if (index !== -1) {
        invoices.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value = 'Failed to convert proforma';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAuditLogs(id: number) {
    try {
      auditLogs.value = await invoicesApi.getAuditLogs(id);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    }
  }

  async function fetchStats() {
    try {
      stats.value = await invoicesApi.getStats(filters);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }

  return {
    invoices,
    isLoading,
    error,
    pagination,
    filters,
    selectedIds,
    auditLogs,
    stats,
    hasActiveFilters,
    fetchInvoices,
    setPage,
    resetFilters,
    createInvoice,
    lookupNip,
    sendToKsef,
    fetchKsefStatus,
    toggleSelection,
    selectAllOnPage,
    clearSelection,
    bulkSendToKsef,
    bulkSendEmails,
    bulkDownloadPDFs,
    bulkMarkAsPaid,
    exportFilteredExcel,
    convertProforma,
    issueCorrection,
    sendInvoiceEmail,
    fetchAuditLogs,
    fetchStats
  };
});
