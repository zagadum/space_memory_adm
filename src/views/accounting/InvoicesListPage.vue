<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useInvoicesStore } from '../../stores/invoices.store'
import { useProjectsStore } from '../../stores/projects.store'
import { useGlobalSearchStore } from '../../stores/globalSearch.store'
import { useModalStore } from '../../stores/modal.store'
import { invoicesApi } from '../../api/invoices.api'
import UiButton from '../../components/ui/UiButton.vue'
import UiBadge from '../../components/ui/UiBadge.vue'
import UiCard from '../../components/ui/UiCard.vue'
import UiInput from '../../components/ui/UiInput.vue'
import UiDateRangePicker from '../../components/ui/UiDateRangePicker.vue'
import InvoicesStatsHeader from './components/InvoicesStatsHeader.vue'
import InvoiceSidePanel from './components/InvoiceSidePanel.vue'

const { t } = useI18n()
const invoicesStore = useInvoicesStore()
const projectsStore = useProjectsStore()
const searchStore = useGlobalSearchStore()
const modal = useModalStore()
const router = useRouter()
const route = useRoute()

const activeActionId = ref<number | null>(null)
const selectedInvoice = ref<any | null>(null)

// --- Lifecycle ---
onMounted(async () => {
  loadFiltersFromUrl()
  await Promise.all([
    projectsStore.fetchProjects(),
    invoicesStore.fetchInvoices(),
    invoicesStore.fetchStats()
  ])
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

// --- Handlers ---
const handleRefresh = async () => {
  await Promise.all([
    invoicesStore.fetchInvoices(),
    invoicesStore.fetchStats()
  ])
}

const handleRowClick = (invoice: any) => {
  selectedInvoice.value = invoice
  invoicesStore.fetchAuditLogs(invoice.id)
}

const toggleSelectAll = () => {
  if (invoicesStore.selectedIds.length === invoicesStore.invoices.length && invoicesStore.invoices.length > 0) {
    invoicesStore.clearSelection()
  } else {
    invoicesStore.selectAllOnPage()
  }
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'paid': return 'success'
    case 'cancelled': return 'danger'
    case 'draft': return 'warning'
    case 'wystawiona':
    case 'sent': return 'info'
    case 'sending':
    case 'pending': return 'warning'
    case 'error': return 'danger'
    default: return 'neutral'
  }
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: currency || 'PLN' }).format(amount)
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString()
}

// --- Filter Sync ---
const syncFiltersToUrl = () => {
  const query: any = {}
  Object.entries(invoicesStore.filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && key !== 'page' && key !== 'per_page') {
      query[key] = value
    }
  })
  router.replace({ query })
}

const loadFiltersFromUrl = () => {
  const query = route.query
  if (query.project_id) invoicesStore.filters.project_id = Number(query.project_id)
  if (query.type) invoicesStore.filters.type = String(query.type)
  if (query.status) invoicesStore.filters.status = String(query.status)
  if (query.date_from) invoicesStore.filters.date_from = String(query.date_from)
  if (query.date_to) invoicesStore.filters.date_to = String(query.date_to)
  if (query.search) {
    invoicesStore.filters.search = String(query.search)
    searchStore.query = String(query.search)
  }
}

watch(() => invoicesStore.filters, () => {
  syncFiltersToUrl()
  invoicesStore.fetchStats()
}, { deep: true })

// --- Outside Clicks ---
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.actions-wrap')) activeActionId.value = null
}
</script>

<template>
  <div class="invoices-page">
    <!-- Stats Header -->
    <InvoicesStatsHeader />

    <!-- Page Header & Main Toolbar -->
    <div class="header-section">
      <div class="header-info">
        <h1 class="title">{{ t('faktury.documentList') }}</h1>
        <div class="subtitle-row">
          <span class="count-badge">{{ invoicesStore.pagination.total }}</span>
          <span class="subtitle">{{ t('common.total') }}</span>
        </div>
      </div>

      <div class="header-actions">
        <UiButton variant="neutral" @click="handleRefresh" :loading="invoicesStore.isLoading">
          🔄
        </UiButton>
        <UiButton variant="neutral" @click="invoicesStore.exportFilteredExcel">
          📥 {{ t('faktury.exportXlsx') }}
        </UiButton>
        <UiButton variant="neutral" @click="modal.open('BulkGenerateInvoicesModal')">
          ✨ {{ t('faktury.generateInvoices') }}
        </UiButton>
        <UiButton variant="primary" @click="modal.open('invoice-create')">
          ➕ {{ t('faktury.createInvoice') }}
        </UiButton>
      </div>
    </div>

    <!-- Filters Strip -->
    <UiCard class="filters-card">
      <div class="filters-layout">
        <div class="search-box">
          <UiInput 
            v-model="invoicesStore.filters.search" 
            :placeholder="t('faktury.searchPlaceholder')"
            @input="invoicesStore.fetchInvoices"
          >
            <template #prefix>🔍</template>
          </UiInput>
        </div>

        <div class="filter-controls">
          <div class="control-group">
            <select v-model="invoicesStore.filters.project_id" @change="invoicesStore.fetchInvoices" class="custom-select">
              <option :value="undefined">{{ t('faktury.filterByProject') }}</option>
              <option v-for="p in projectsStore.projects" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>

          <div class="control-group">
            <select v-model="invoicesStore.filters.status" @change="invoicesStore.fetchInvoices" class="custom-select">
              <option :value="undefined">{{ t('faktury.filterByStatus') }}</option>
              <option v-for="s in ['draft', 'wystawiona', 'sent', 'paid', 'cancelled', 'error']" :key="s" :value="s">
                {{ t('faktury.statuses.' + s) }}
              </option>
            </select>
          </div>

          <div class="control-group">
            <UiDateRangePicker 
              v-model:startDate="invoicesStore.filters.date_from" 
              v-model:endDate="invoicesStore.filters.date_to"
              @change="invoicesStore.fetchInvoices"
            />
          </div>

          <UiButton 
            v-if="invoicesStore.hasActiveFilters" 
            variant="ghost" 
            size="sm" 
            class="text-rose-500"
            @click="invoicesStore.resetFilters"
          >
            {{ t('faktury.clearFilters') }}
          </UiButton>
        </div>
      </div>
    </UiCard>

    <!-- Table Section -->
    <UiCard class="table-card">
      <div class="table-wrapper" :class="{ 'is-loading': invoicesStore.isLoading }">
        <table class="premium-table">
          <thead>
            <tr>
              <th class="selection-col">
                <input 
                  type="checkbox" 
                  class="custom-checkbox"
                  :checked="invoicesStore.selectedIds.length === invoicesStore.invoices.length && invoicesStore.invoices.length > 0"
                  @change="toggleSelectAll"
                />
              </th>
              <th>{{ t('faktury.number') }}</th>
              <th>{{ t('faktury.buyer') }}</th>
              <th>{{ t('faktury.amount') }}</th>
              <th>{{ t('faktury.status') }}</th>
              <th>{{ t('faktury.date') }}</th>
              <th class="actions-col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="invoicesStore.isLoading && !invoicesStore.invoices.length" v-for="i in 5" :key="i">
              <td colspan="7"><div class="skeleton-row"></div></td>
            </tr>
            <tr 
              v-else 
              v-for="invoice in invoicesStore.invoices" 
              :key="invoice.id" 
              class="clickable-row"
              :class="{ selected: invoicesStore.selectedIds.includes(invoice.id) }"
              @click="handleRowClick(invoice)"
            >
              <td class="selection-col" @click.stop>
                <input 
                  type="checkbox" 
                  class="custom-checkbox"
                  :checked="invoicesStore.selectedIds.includes(invoice.id)"
                  @change="invoicesStore.toggleSelection(invoice.id)"
                />
              </td>
              <td>
                <div class="invoice-number">{{ invoice.number }}</div>
                <div class="invoice-type-sub">
                  <span class="type-tag">{{ invoice.document_type }}</span>
                  <span class="project-tag">{{ invoice.project?.name }}</span>
                </div>
              </td>
              <td>
                <div class="buyer-cell">
                  <span class="buyer-name">{{ invoice.buyer_name }}</span>
                  <span v-if="invoice.buyer_tax_id" class="buyer-nip">NIP: {{ invoice.buyer_tax_id }}</span>
                </div>
              </td>
              <td>
                <div class="amount-cell">
                  <span class="amount-gross">{{ formatCurrency(invoice.amount_gross, invoice.currency) }}</span>
                  <span class="amount-net">{{ t('common.netto') }}: {{ formatCurrency(invoice.amount_net, invoice.currency) }}</span>
                </div>
              </td>
              <td>
                <UiBadge :variant="getStatusVariant(invoice.ksef_status)">
                  {{ t('faktury.statuses.' + invoice.ksef_status) }}
                </UiBadge>
              </td>
              <td>
                <span class="issue-date">{{ formatDate(invoice.issue_date) }}</span>
              </td>
              <td class="actions-col" @click.stop>
                <div class="actions-wrap">
                  <button class="action-trigger" @click.stop="activeActionId = activeActionId === invoice.id ? null : invoice.id">
                    ⋮
                  </button>
                  <div v-if="activeActionId === invoice.id" class="action-dropdown shadow-lg">
                    <button @click="handleRowClick(invoice)" class="dropdown-item">
                      📄 {{ t('faktury.viewDetails') }}
                    </button>
                    <button 
                      v-if="['draft', 'error'].includes(invoice.ksef_status)"
                      @click="invoicesStore.sendToKsef(invoice.id)" 
                      class="dropdown-item text-blue-500"
                    >
                      🚀 {{ t('faktury.sendToKsef') }}
                    </button>
                    <button @click="() => {}" class="dropdown-item">
                      📥 {{ t('faktury.downloadPdf') }}
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="!invoicesStore.isLoading && !invoicesStore.invoices.length">
              <td colspan="7" class="empty-state">
                <div class="empty-icon">📁</div>
                <p>{{ t('common.noData') }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="pagination-footer" v-if="invoicesStore.pagination.total > 0">
        <div class="page-info">
          {{ (invoicesStore.pagination.currentPage - 1) * invoicesStore.pagination.perPage + 1 }}-{{ Math.min(invoicesStore.pagination.currentPage * invoicesStore.pagination.perPage, invoicesStore.pagination.total) }} 
          <span class="dim">/ {{ invoicesStore.pagination.total }}</span>
        </div>
        <div class="page-controls">
          <UiButton 
            variant="ghost" 
            size="sm" 
            :disabled="invoicesStore.pagination.currentPage <= 1"
            @click="invoicesStore.setPage(invoicesStore.pagination.currentPage - 1)"
          >
            ←
          </UiButton>
          <span class="current-page">{{ invoicesStore.pagination.currentPage }} / {{ invoicesStore.pagination.lastPage }}</span>
          <UiButton 
            variant="ghost" 
            size="sm" 
            :disabled="invoicesStore.pagination.currentPage >= invoicesStore.pagination.lastPage"
            @click="invoicesStore.setPage(invoicesStore.pagination.currentPage + 1)"
          >
            →
          </UiButton>
        </div>
      </div>
    </UiCard>

    <!-- Bulk Toolbar -->
    <Transition name="slide-up">
      <div v-if="invoicesStore.selectedIds.length > 0" class="bulk-toolbar-fixed">
        <div class="bulk-content">
          <div class="bulk-info">
            <span class="selection-indicator">{{ invoicesStore.selectedIds.length }}</span>
            <span class="selection-label">{{ t('common.selected') }}</span>
          </div>
          <div class="divider" />
          <div class="bulk-actions-row">
            <UiButton variant="primary" size="sm" @click="invoicesStore.bulkSendToKsef">
              🚀 {{ t('faktury.sendToKsef') }}
            </UiButton>
            <UiButton variant="neutral" size="sm" @click="invoicesStore.bulkSendEmails">
              📧 Email
            </UiButton>
            <UiButton variant="neutral" size="sm" @click="invoicesStore.bulkDownloadPDFs">
              📦 ZIP
            </UiButton>
            <UiButton variant="ghost" size="sm" @click="invoicesStore.clearSelection">
              ✕ {{ t('common.cancel') }}
            </UiButton>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Details Sidebar -->
    <InvoiceSidePanel 
      :invoice="selectedInvoice" 
      :audit-logs="invoicesStore.auditLogs"
      @close="selectedInvoice = null"
      @refresh="handleRefresh"
      @convert="invoicesStore.convertProforma"
      @send-to-ksef="invoicesStore.sendToKsef"
    />
  </div>
</template>

<style scoped>
.invoices-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title { font-size: 24px; font-weight: 800; color: var(--app-text-main); margin: 0; }
.subtitle-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.count-badge { font-size: 11px; font-weight: 700; background: var(--app-card-hi); color: var(--app-primary); padding: 2px 8px; border-radius: 6px; }
.subtitle { font-size: 13px; color: var(--app-text-dim); }

.header-actions { display: flex; gap: 10px; }

/* Filters */
.filters-card { padding: 16px; border: 1px solid var(--app-border); background: var(--app-card); }
.filters-layout { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.search-box { flex: 1; max-width: 320px; }
.filter-controls { display: flex; align-items: center; gap: 12px; }

.custom-select {
  background: var(--app-card-hi);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--app-text-main);
  outline: none;
  min-width: 160px;
  transition: border-color 0.2s;
}
.custom-select:focus { border-color: var(--app-primary); }

/* Table Section */
.table-card { border: 1px solid var(--app-border); padding: 0; overflow: hidden; background: var(--app-card); }
.table-wrapper { position: relative; }

.premium-table { width: 100%; border-collapse: collapse; text-align: left; }
.premium-table th { background: var(--app-card-hi); padding: 14px 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--app-text-dim); letter-spacing: 0.05em; }
.premium-table td { padding: 16px 20px; border-top: 1px solid var(--app-border); }

.clickable-row { cursor: pointer; transition: background 0.15s; }
.clickable-row:hover { background: rgba(79, 110, 247, 0.03); }
.clickable-row.selected { background: rgba(79, 110, 247, 0.06); }

.selection-col { width: 44px; text-align: center; }
.custom-checkbox { width: 16px; height: 16px; accent-color: var(--app-primary); cursor: pointer; }

.invoice-number { font-family: 'Space Mono', monospace; font-weight: 700; font-size: 14px; color: var(--app-text-main); }
.invoice-type-sub { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
.type-tag { font-size: 10px; font-weight: 800; color: var(--app-primary); background: rgba(79, 110, 247, 0.1); padding: 1px 4px; border-radius: 4px; }
.project-tag { font-size: 11px; color: var(--app-text-dim); }

.buyer-cell { display: flex; flex-direction: column; }
.buyer-name { font-weight: 600; font-size: 14px; color: var(--app-text-main); }
.buyer-nip { font-size: 11px; color: var(--app-text-dim); font-family: 'Space Mono', monospace; }

.amount-cell { display: flex; flex-direction: column; }
.amount-gross { font-family: 'Outfit', sans-serif; font-weight: 700; color: var(--app-text-main); }
.amount-net { font-size: 11px; color: var(--app-text-dim); }

.issue-date { font-family: 'Space Mono', monospace; font-size: 13px; color: var(--app-text-dim); }

.actions-col { width: 60px; text-align: center; }
.action-trigger { padding: 6px; border-radius: 8px; color: var(--app-text-dim); transition: all 0.2s; font-size: 20px; line-height: 1; }
.action-trigger:hover { background: var(--app-card-hi); color: var(--app-text-main); }

.actions-wrap { position: relative; display: flex; justify-content: center; }
.action-dropdown {
  position: absolute; right: 0; top: 100%; margin-top: 8px;
  background: var(--app-card); border: 1px solid var(--app-border);
  border-radius: 12px; width: 180px; z-index: 100;
  padding: 6px; display: flex; flex-direction: column;
}
.dropdown-item {
  padding: 10px 12px; font-size: 13px; border-radius: 8px; color: var(--app-text-dim);
  display: flex; align-items: center; gap: 10px; transition: all 0.15s;
}
.dropdown-item:hover { background: var(--app-card-hi); color: var(--app-text-main); }

.pagination-footer { padding: 16px 24px; border-top: 1px solid var(--app-border); display: flex; justify-content: space-between; align-items: center; }
.page-info { font-size: 13px; color: var(--app-text-main); font-weight: 600; }
.dim { color: var(--app-text-dim); font-weight: 400; }
.page-controls { display: flex; align-items: center; gap: 16px; }
.current-page { font-size: 13px; font-weight: 600; color: var(--app-primary); }

.skeleton-row { height: 60px; background: linear-gradient(90deg, var(--app-card-hi) 25%, var(--app-border) 50%, var(--app-card-hi) 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 8px; }
@keyframes skeleton-loading { from { background-position: 200% 0; } to { background-position: -200% 0; } }

.empty-state { text-align: center; padding: 64px !important; color: var(--app-text-dim); }
.empty-icon { font-size: 40px; margin-bottom: 12px; }

/* Bulk Toolbar */
.bulk-toolbar-fixed {
  position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
  background: var(--app-bg); border: 1px solid var(--app-border);
  border-radius: 20px; padding: 12px 24px; z-index: 500;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}
.bulk-content { display: flex; align-items: center; gap: 20px; }
.bulk-info { display: flex; align-items: center; gap: 8px; }
.selection-indicator { background: var(--app-primary); color: white; border-radius: 6px; padding: 2px 8px; font-weight: 700; font-size: 13px; }
.selection-label { font-size: 14px; font-weight: 600; color: var(--app-text-dim); }
.divider { width: 1px; height: 24px; background: var(--app-border); }
.bulk-actions-row { display: flex; gap: 10px; }

/* Transitions */
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translate(-50%, 40px); }
</style>
