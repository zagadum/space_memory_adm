<template>
  <div class="content">
    <!-- Toolbar -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <div class="section-title">
          {{ t('faktury.documentList') }}
          <span class="section-count">{{ t('common.count', { n: invoicesStore.pagination.total }) }}</span>
        </div>
      </div>
      <div class="toolbar-right">
        <!-- Project Filter -->
        <select class="dropdown-filter-btn" v-model="invoicesStore.filters.project_id" @change="invoicesStore.fetchInvoices">
          <option :value="undefined">{{ t('faktury.filterByProject') }}</option>
          <option v-for="project in projectsStore.projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>

        <!-- Type Filter -->
        <select class="dropdown-filter-btn" v-model="invoicesStore.filters.type" @change="invoicesStore.fetchInvoices">
          <option :value="undefined">{{ t('faktury.filterByType') }}</option>
          <option value="FA">FA (Faktura)</option>
          <option value="FK">FK (Korekta)</option>
          <option value="PF">PF (Proforma)</option>
        </select>

        <!-- Status Filter -->
        <select class="dropdown-filter-btn" v-model="invoicesStore.filters.status" @change="invoicesStore.fetchInvoices">
          <option :value="undefined">{{ t('faktury.filterByStatus') }}</option>
          <option value="draft">{{ t('faktury.statuses.draft') }}</option>
          <option value="wystawiona">{{ t('faktury.statuses.wystawiona') }}</option>
          <option value="sent">{{ t('faktury.statuses.sent') }}</option>
          <option value="paid">{{ t('faktury.statuses.paid') }}</option>
          <option value="cancelled">{{ t('faktury.statuses.cancelled') }}</option>
        </select>

        <UiButton variant="ghost" size="sm" @click="handleExport">
          📥 {{ t('faktury.exportXlsx') || 'Export XLSX' }}
        </UiButton>
        <UiButton variant="primary" size="sm" @click="handleCreateInvoice">
          + {{ t('faktury.createInvoice') }}
        </UiButton>
      </div>
    </div>

    <!-- Table Container -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>{{ t('faktury.number') }}</th>
            <th>{{ t('faktury.buyer') }}</th>
            <th>{{ t('faktury.project') }}</th>
            <th>{{ t('faktury.type') }}</th>
            <th>{{ t('faktury.date') }}</th>
            <th>{{ t('faktury.amount') }}</th>
            <th>{{ t('faktury.status') }}</th>
            <th class="actions-header">···</th>
          </tr>
        </thead>

        <!-- Skeletons -->
        <tbody v-if="invoicesStore.isLoading">
          <tr v-for="i in 5" :key="i" class="skeleton-row">
            <td colspan="8"><div class="skeleton-line"></div></td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr v-for="invoice in invoicesStore.invoices" :key="invoice.id" class="table-row">
            <td>
              <div class="invoice-number">{{ invoice.number }}</div>
            </td>
            <td>
              <div class="buyer-info">
                <span class="buyer-name">{{ invoice.buyer_name }}</span>
                <span v-if="invoice.buyer_tax_id" class="buyer-nip">NIP: {{ invoice.buyer_tax_id }}</span>
              </div>
            </td>
            <td>
              <UiBadge variant="default" size="sm">
                {{ invoice.project?.name || '—' }}
              </UiBadge>
            </td>
            <td>
              <span class="doc-type">{{ invoice.document_type }}</span>
            </td>
            <td>
              <span class="date-mono">{{ formatDate(invoice.issue_date) }}</span>
            </td>
            <td>
              <div class="amount-cell">
                <span class="amount-gross">{{ formatCurrency(invoice.amount_gross, invoice.currency) }}</span>
                <span class="amount-net">{{ t('common.netto') }}: {{ formatCurrency(invoice.amount_net, invoice.currency) }}</span>
              </div>
            </td>
            <td>
              <UiBadge :variant="getStatusVariant(invoice.ksef_status)">
                {{ t(`faktury.statuses.${invoice.ksef_status}`) }}
              </UiBadge>
            </td>
            <td>
              <div class="actions-wrap">
                <button class="actions-btn" @click.stop="toggleActions(invoice.id)">⋮</button>
                <div class="actions-dropdown" :class="{ open: activeActionId === invoice.id }">
                  <div class="action-item" @click="downloadPdf(invoice)">
                    📄 {{ t('faktury.downloadPdf') }}
                  </div>
                  <div class="action-item" @click="viewDetails(invoice)">
                    🔍 {{ t('faktury.viewDetails') }}
                  </div>
                </div>
              </div>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="invoicesStore.invoices.length === 0">
            <td colspan="8" class="empty-cell">
              {{ t('common.noData') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-footer" v-if="invoicesStore.pagination.total > 0">
      <div class="pagination-info">
        {{ (invoicesStore.pagination.currentPage - 1) * invoicesStore.pagination.perPage + 1 }}-{{ Math.min(invoicesStore.pagination.currentPage * invoicesStore.pagination.perPage, invoicesStore.pagination.total) }} / {{ invoicesStore.pagination.total }}
      </div>
      <div class="pagination-controls">
        <button class="dropdown-filter-btn" :disabled="invoicesStore.pagination.currentPage <= 1" @click="invoicesStore.setPage(invoicesStore.pagination.currentPage - 1)">←</button>
        <span class="section-count">{{ invoicesStore.pagination.currentPage }} / {{ invoicesStore.pagination.lastPage }}</span>
        <button class="dropdown-filter-btn" :disabled="invoicesStore.pagination.currentPage >= invoicesStore.pagination.lastPage" @click="invoicesStore.setPage(invoicesStore.pagination.currentPage + 1)">→</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useInvoicesStore } from '../../stores/invoices.store';
import { useProjectsStore } from '../../stores/projects.store';
import { useGlobalSearchStore } from '../../stores/globalSearch.store';
import { useModalStore } from '../../stores/modal.store';
import { useInvoicePermissions } from '../../composables/useInvoicePermissions';
import UiButton from '../../components/ui/UiButton.vue';
import UiBadge from '../../components/ui/UiBadge.vue';
import { invoicesApi } from '../../api/invoices.api';

const { t } = useI18n();
const invoicesStore = useInvoicesStore();
const projectsStore = useProjectsStore();
const searchStore = useGlobalSearchStore();
const modal = useModalStore();
const { can, canEdit } = useInvoicePermissions();

const activeActionId = ref<number | null>(null);

function toggleActions(id: number) {
  activeActionId.value = activeActionId.value === id ? null : id;
}

function formatDate(date: string) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString();
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: currency || 'PLN' }).format(amount);
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'paid': return 'success';
    case 'cancelled': return 'danger';
    case 'draft': return 'warning';
    case 'wystawiona':
    case 'sent': return 'info';
    default: return 'default';
  }
}

function handleCreateInvoice() {
  modal.open('invoice-create');
}

function handleExport() {
  const url = invoicesApi.getExportUrl(invoicesStore.filters);
  window.open(url, '_blank');
}

function downloadPdf(invoice: any) {
  const url = invoicesApi.getPdfUrl(invoice.id);
  window.open(url, '_blank');
  activeActionId.value = null;
}

function viewDetails(invoice: any) {
  modal.open('invoice-preview', invoice);
  activeActionId.value = null;
}

// Search debounce
let searchDebounce: any = null;
watch(() => searchStore.query, (val) => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    invoicesStore.filters.search = val.trim();
    invoicesStore.fetchInvoices();
  }, 400);
});

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.actions-wrap')) {
    activeActionId.value = null;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
  invoicesStore.fetchInvoices();
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.content { padding: 24px 28px; }

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.toolbar-left { display: flex; align-items: center; gap: 12px; }

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--app-text-main);
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-count {
  font-size: 11px;
  font-family: 'Space Mono', monospace;
  background: var(--status-info-bg);
  color: var(--blue);
  border: 1px solid var(--app-border);
  padding: 2px 8px;
  border-radius: 8px;
}

.toolbar-right { display: flex; gap: 10px; align-items: center; }

.dropdown-filter-btn {
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  border: 1px solid var(--app-border);
  background: var(--app-card);
  color: var(--app-text-main);
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
}

.dropdown-filter-btn:hover { border-color: var(--blue); }

.table-container {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--app-shadow);
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th {
  padding: 14px 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--app-text-dim);
  background: var(--app-surface);
  border-bottom: 1px solid var(--app-border);
}

td {
  padding: 16px 20px;
  border-bottom: 1px solid var(--app-border);
  vertical-align: middle;
}

.table-row:hover { background: var(--status-info-bg); }

.invoice-number {
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  color: var(--blue);
}

.buyer-info { display: flex; flex-direction: column; }
.buyer-name { font-weight: 600; color: var(--app-text-main); }
.buyer-nip { font-size: 11px; color: var(--app-text-dim); font-family: 'Space Mono', monospace; }

.date-mono { font-family: 'Space Mono', monospace; font-size: 13px; }

.amount-cell { display: flex; flex-direction: column; }
.amount-gross { font-weight: 700; color: var(--app-text-main); }
.amount-net { font-size: 11px; color: var(--app-text-dim); }

.actions-header { width: 60px; text-align: center; }

.actions-wrap { position: relative; display: flex; justify-content: center; }
.actions-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.actions-btn:hover { border-color: var(--blue); color: var(--blue); }

.actions-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 6px;
  min-width: 160px;
  z-index: 100;
  box-shadow: var(--app-shadow-lg);
  display: none;
}

.actions-dropdown.open { display: block; }

.action-item {
  padding: 10px 14px;
  font-size: 13px;
  color: var(--app-text-dim);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.action-item:hover { background: var(--status-info-bg); color: var(--app-text-main); }

.empty-cell { padding: 40px; text-align: center; color: var(--app-text-dim); }

.pagination-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}

.pagination-info { font-size: 13px; color: var(--app-text-dim); }
.pagination-controls { display: flex; align-items: center; gap: 12px; }

.skeleton-row td { padding: 24px 20px; }
.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, var(--app-border) 25%, var(--app-surface) 50%, var(--app-border) 75%);
  background-size: 200% 100%;
  animation: skeleton 1.5s infinite;
  border-radius: 6px;
}

@keyframes skeleton {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
