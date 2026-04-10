<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useInvoicesStore } from '../../stores/invoices.store'
import { useProjectsStore } from '../../stores/projects.store'
import { useGlobalSearchStore } from '../../stores/globalSearch.store'
import { useModalStore } from '../../stores/modal.store'
import { useInvoicePermissions } from '../../composables/useInvoicePermissions'
import UiButton from '../../components/ui/UiButton.vue'
import UiBadge from '../../components/ui/UiBadge.vue'
import UiCard from '../../components/ui/UiCard.vue'
import UiInput from '../../components/ui/UiInput.vue'
import UiDateRangePicker from '../../components/ui/UiDateRangePicker.vue'
import InvoicesStatsHeader from './components/InvoicesStatsHeader.vue'
import InvoiceSidePanel from './components/InvoiceSidePanel.vue'
import { UiDropdown } from '../../components/ui'

const { t } = useI18n()
const invoicesStore = useInvoicesStore()
const projectsStore = useProjectsStore()
const searchStore = useGlobalSearchStore()
const modal = useModalStore()
const router = useRouter()
const route = useRoute()
const { can } = useInvoicePermissions()

const activeTab = ref<'b2c' | 'b2b'>( (route.query.tab as any) || 'b2c' )
const selectedInvoice = ref<any | null>(null)

// Permission check: Trainer/Teacher cannot access this module
if (!can.viewModule.value) {
  router.push('/')
}

// --- Lifecycle ---
onMounted(async () => {
  loadFiltersFromUrl()
  await Promise.all([
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

const switchTab = (tab: 'b2c' | 'b2b') => {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab } })
  // In a real scenario, we might trigger a fetch with a specific type filter here
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
    default: return 'default'
  }
}

const formatCurrency = (amount: number | string | null | undefined, currency?: string) => {
  const val = typeof amount === 'string' ? parseFloat(amount) : amount
  if (val === undefined || val === null || isNaN(val)) return '—'
  return new Intl.NumberFormat('pl-PL', { 
    style: 'currency', 
    currency: currency || 'PLN',
    minimumFractionDigits: 2
  }).format(val)
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('pl-PL')
  } catch (e) {
    return '—'
  }
}

// --- Filter Sync ---
const syncFiltersToUrl = () => {
  const query: any = { tab: activeTab.value }
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
  // Moved to UiDropdown
}
</script>

<template>
  <div class="invoices-page">
    <!-- Stats Header -->
    <InvoicesStatsHeader />

    <!-- Page Header -->
    <div class="phdr">
      <div class="header-info">
        <h1 class="ptitle">{{ t('faktury.pageTitle') || 'Faktury' }} <span>GLS</span></h1>
        <p class="psub">
          {{ activeTab === 'b2c' ? t('faktury.descriptionB2C') : t('faktury.descriptionB2B') }}
        </p>
      </div>

      <div class="header-actions">
        <UiButton variant="neutral" @click="handleRefresh" :loading="invoicesStore.isLoading">
          🔄 {{ t('common.refresh') }}
        </UiButton>
        <UiButton v-if="can.manageSettings.value" variant="neutral" @click="modal.open('invoice-settings')">
          ⚙️ {{ t('common.settings') }}
        </UiButton>
      </div>
    </div>

    <!-- Segments Controls -->
    <div class="seg-wrap">
      <div class="seg">
        <div 
          class="sg" 
          :class="{ act: activeTab === 'b2c' }" 
          @click="switchTab('b2c')"
        >
          👥 {{ t('faktury.segments.b2c') }} <span class="count-pill">({{ invoicesStore.pagination.total }})</span>
        </div>
        <div 
          class="sg" 
          :class="{ act: activeTab === 'b2b' }" 
          @click="switchTab('b2b')"
        >
          🏢 {{ t('faktury.segments.b2b') }} <span class="badge-b2b">{{ t('faktury.b2bCompanies') }}</span>
        </div>
      </div>
      
      <div class="tab-actions">
        <template v-if="activeTab === 'b2c'">
          <UiButton variant="neutral" size="sm" @click="modal.open('invoice-proforma')">
            📄 {{ t('faktury.proforma') }}
          </UiButton>
          <UiButton variant="primary" @click="modal.open('invoice-create-b2c')">
            ➕ {{ t('faktury.createInvoice') }}
          </UiButton>
        </template>
        <template v-else>
          <UiButton variant="neutral" size="sm" @click="invoicesStore.exportFilteredExcel">
            ⬇️ {{ t('faktury.exportPdf') }}
          </UiButton>
          <UiButton variant="primary" class="btn-amber" @click="modal.open('invoice-create-b2b')">
            ➕ {{ t('faktury.createInvoice') }} B2B
          </UiButton>
        </template>
      </div>
    </div>

    <!-- Filters Area -->
    <div class="filter-bar">
      <div class="sb">
        <span class="si">🔍</span>
        <input 
          v-model="invoicesStore.filters.search" 
          type="text" 
          :placeholder="t('faktury.searchPlaceholder')"
          @input="invoicesStore.fetchInvoices"
        >
      </div>
      
      <select v-model="invoicesStore.filters.project_id" @change="invoicesStore.fetchInvoices" class="fsel">
        <option :value="undefined">{{ t('faktury.filterByProject') }}</option>
        <option v-for="p in projectsStore.projects" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>

      <select v-model="invoicesStore.filters.status" @change="invoicesStore.fetchInvoices" class="fsel">
        <option :value="undefined">{{ t('faktury.filterByStatus') }}</option>
        <option v-for="s in ['draft', 'wystawiona', 'sent', 'paid', 'cancelled', 'error']" :key="s" :value="s">
          {{ t('faktury.statuses.' + s) }}
        </option>
      </select>

      <div class="dr">
        <input type="date" v-model="invoicesStore.filters.date_from" @change="invoicesStore.fetchInvoices">
        <span class="dr-sep">—</span>
        <input type="date" v-model="invoicesStore.filters.date_to" @change="invoicesStore.fetchInvoices">
      </div>
    </div>

    <!-- Premium Export Panel -->
    <div class="export-panel">
      <div class="export-title">
        <span>📤</span> {{ t('faktury.exportPanel.title') }}
        <span class="exp-count">— {{ t('faktury.exportPanel.range') }}: <b>{{ invoicesStore.selectedIds.length }}</b> {{ t('faktury.exportPanel.selected') }} / <b>{{ invoicesStore.invoices.length }}</b> {{ t('faktury.exportPanel.onPage') }}</span>
      </div>
      <div class="exp-row">
        <button class="exp-btn exp-xlsx" @click="invoicesStore.exportFilteredExcel">
          📊 {{ t('faktury.exportXlsx') }} <span class="exp-hint">{{ t('faktury.exportPanel.xlsxHint') }}</span>
        </button>
        <button class="exp-btn exp-pdf" @click="invoicesStore.bulkDownloadPDFs">
          📁 {{ t('faktury.exportPanel.pdfPackage') }} <span class="exp-hint">{{ t('faktury.exportPanel.pdfHint') }}</span>
        </button>
        <div class="exp-sep"></div>
        <button class="exp-btn exp-comarch" @click="invoicesStore.exportFilteredExcel">
          🏭 {{ t('faktury.exportPanel.comarchHint') }} <span class="exp-hint">Import Optima</span>
        </button>
        <button class="exp-btn exp-jpk" @click="invoicesStore.exportFilteredExcel">
          🏛 {{ t('faktury.exportPanel.jpkHint') }} <span class="exp-hint">XML · US</span>
        </button>
      </div>
    </div>

    <!-- Invoices Table -->
    <div class="inv-card">
      <div class="table-container" :class="{ loading: invoicesStore.isLoading }">
        <table class="inv-table">
          <thead>
            <tr>
              <th class="cb-th">
                <input 
                  type="checkbox" 
                  class="hd-cb"
                  :checked="invoicesStore.selectedIds.length === invoicesStore.invoices.length && invoicesStore.invoices.length > 0"
                  @change="toggleSelectAll"
                />
              </th>
              <th>{{ t('faktury.number') }}</th>
              <th>{{ t('faktury.type') }}</th>
              <th>{{ t('faktury.date') }}</th>
              <th>{{ t('faktury.buyer') }}</th>
              <th>{{ t('faktury.project') }}</th>
              <th>{{ t('faktury.amount') }}</th>
              <th>{{ t('faktury.status') }}</th>
              <th style="width: 40px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="invoicesStore.isLoading && !invoicesStore.invoices.length" v-for="i in 5" :key="i">
              <td colspan="9"><div class="skeleton-row"></div></td>
            </tr>
            <tr 
              v-else 
              v-for="invoice in invoicesStore.invoices" 
              :key="invoice.id" 
              class="inv-row"
              :class="{ 'row-sel': invoicesStore.selectedIds.includes(invoice.id) }"
              @click="handleRowClick(invoice)"
            >
              <td class="cb-td" @click.stop>
                <input 
                  type="checkbox" 
                  class="row-cb"
                  :checked="invoicesStore.selectedIds.includes(invoice.id)"
                  @change="invoicesStore.toggleSelection(invoice.id)"
                />
              </td>
              <td>
                <div class="inv-num" :class="(invoice.document_type || 'fa').toLowerCase()">{{ invoice.number }}</div>
              </td>
              <td>
                <span class="badge-type" :class="'b-' + (invoice.document_type || 'fa').toLowerCase()">
                  {{ invoice.document_type }}
                </span>
              </td>
              <td class="mono-text">{{ formatDate(invoice.issue_date) }}</td>
              <td>
                <div class="cli-name">{{ invoice.buyer_name }}</div>
                <div class="cli-id" v-if="invoice.buyer_tax_id">NIP: {{ invoice.buyer_tax_id }}</div>
              </td>
              <td>
                <span class="proj-tag" :class="'pt-' + (invoice.project?.code?.toLowerCase() || 'default')">{{ invoice.project?.name }}</span>
              </td>
              <td>
                <div class="amt" :class="{ neg: invoice.amount_gross < 0 }">
                  {{ formatCurrency(invoice.amount_gross, invoice.currency) }}
                </div>
              </td>
              <td>
                <UiBadge :variant="getStatusVariant(invoice.ksef_status)">
                  {{ t('faktury.statuses.' + invoice.ksef_status) }}
                </UiBadge>
                <div v-if="(invoice.ksef_status as any) === 'paid'" class="paid-stamp">
                  ✅ {{ t('faktury.paid') }}
                </div>
              </td>
              <td class="actions-wrap" @click.stop>
                <UiDropdown align="right">
                  <template #trigger>
                    <button class="dd-btn">⋯</button>
                  </template>
                  <template #default="{ close }">
                    <div class="dditem" @click="handleRowClick(invoice); close()">👁 {{ t('faktury.viewDetails') }}</div>
                    <div class="dditem" @click="modal.open('invoice-email', invoice); close()">✉ {{ t('faktury.sendEmail') }}</div>
                    <div class="dditem dditem-am" v-if="can.createInvoice.value" @click="modal.open('invoice-correct-b2c', invoice); close()">FK {{ t('faktury.correct') }}</div>
                    <div class="separator"></div>
                    <div class="dditem" @click="modal.open('invoice-edit', invoice); close()">✏ {{ t('common.edit') }}</div>
                    <div class="dditem dditem-red" v-if="can.deleteInvoice.value" @click="modal.open('invoice-delete', invoice); close()">🗑 {{ t('common.delete') }}</div>
                  </template>
                </UiDropdown>
              </td>
            </tr>
            <tr v-if="!invoicesStore.isLoading && !invoicesStore.invoices.length">
              <td colspan="9" class="empty-state">
                <div class="na-ico">📁</div>
                <div class="na-title">{{ t('faktury.empty.title') || t('common.noData') }}</div>
                <p v-if="t('faktury.empty.sub')" class="na-sub">{{ t('faktury.empty.sub') }}</p>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pag">
          <div class="pag-info">
             {{ (invoicesStore.pagination.currentPage - 1) * invoicesStore.pagination.perPage + 1 }}-{{ Math.min(invoicesStore.pagination.currentPage * invoicesStore.pagination.perPage, invoicesStore.pagination.total) }} 
             / {{ invoicesStore.pagination.total }}
          </div>
          <div class="pag-btns">
            <button class="pb" :disabled="invoicesStore.pagination.currentPage <= 1" @click="invoicesStore.setPage(invoicesStore.pagination.currentPage - 1)">‹</button>
            <button 
              v-for="page in Math.min(invoicesStore.pagination.lastPage, 5)" 
              :key="page" 
              class="pb" 
              :class="{ act: page === invoicesStore.pagination.currentPage }"
              @click="invoicesStore.setPage(page)"
            >{{ page }}</button>
            <button class="pb" :disabled="invoicesStore.pagination.currentPage >= invoicesStore.pagination.lastPage" @click="invoicesStore.setPage(invoicesStore.pagination.currentPage + 1)">›</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Selection Toolbar (Bottom) -->
    <Transition name="slide-up">
      <div v-if="invoicesStore.selectedIds.length > 0" class="sel-bar show">
        <span class="sel-bar-n">✔ {{ t('common.selected') }}: <span>{{ invoicesStore.selectedIds.length }}</span></span>
        <div class="sel-bar-acts">
           <button class="exp-btn exp-xlsx" style="background: white" @click="invoicesStore.exportFilteredExcel">📊 XLSX</button>
           <button class="exp-btn exp-pdf" style="background: white" @click="invoicesStore.bulkDownloadPDFs">📁 PDF</button>
           <button class="btn btn-primary btn-sm" @click="modal.open('invoice-email')">✉ Email</button>
           <button class="btn btn-ghost btn-sm" @click="invoicesStore.clearSelection">✕ {{ t('common.cancel') }}</button>
        </div>
      </div>
    </Transition>

    <!-- Details Sidebar -->
    <InvoiceSidePanel 
      :invoice="selectedInvoice" 
      :audit-logs="invoicesStore.auditLogs"
      @close="selectedInvoice = null"
      @refresh="handleRefresh"
    />
  </div>
</template>

<style scoped>
.invoices-page {
  padding: 0 24px 80px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Outfit', sans-serif;
}

/* Page Header */
.phdr { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 28px 0 16px; }
.ptitle { font-size: 24px; font-weight: 900; letter-spacing: -0.4px; color: var(--app-text-main); }
.ptitle span { background: linear-gradient(90deg, #4f6ef7, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.psub { font-size: 11px; color: var(--app-text-dim); margin-top: 3px; line-height: 1.6; max-width: 600px; }

.header-actions { display: flex; gap: 8px; }

/* Segments */
.seg-wrap { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
.seg { display: flex; gap: 4px; background: var(--app-card-hi); border: 1px solid var(--app-border); border-radius: 11px; padding: 4px; width: fit-content; }
.sg { padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; color: var(--app-text-dim); cursor: pointer; transition: all 0.15s; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
.sg.act { background: var(--app-card); color: var(--app-primary); border: 1px solid rgba(79, 110, 247, 0.28); box-shadow: 0 1px 4px rgba(79, 110, 247, 0.1); }
.count-pill { font-size: 10px; opacity: 0.65; }
.badge-b2b { background: rgba(245, 158, 11, 0.2); color: #d97706; padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: 800; }

.tab-actions { display: flex; gap: 8px; align-items: center; }
.btn-amber { background: linear-gradient(135deg, #f59e0b, #f97316); color: #fff; border: none; }

/* Filter Bar */
.filter-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.sb { flex: 1; min-width: 220px; position: relative; }
.sb input { width: 100%; padding: 8px 12px 8px 34px; background: var(--app-card); border: 1px solid var(--app-border); border-radius: 9px; font-size: 13px; color: var(--app-text-main); font-family: 'Outfit', sans-serif; outline: none; }
.si { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; color: var(--app-text-dim); }
.fsel { padding: 7px 24px 7px 10px; background: var(--app-card); border: 1px solid var(--app-border); border-radius: 9px; font-size: 13px; color: var(--app-text-main); font-family: 'Outfit', sans-serif; outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath fill='%2364748b' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; min-width: 140px; }
.dr { display: flex; align-items: center; gap: 5px; }
.dr input { width: 120px; padding: 7px 9px; background: var(--app-card); border: 1px solid var(--app-border); border-radius: 9px; font-size: 12px; font-family: 'Space Mono', monospace; }
.dr-sep { font-size: 12px; color: var(--app-text-dim); }

/* Export Panel */
.export-panel { background: var(--app-card-hi); border: 1.5px solid var(--app-border); border-radius: 14px; padding: 14px 16px; margin-bottom: 14px; }
.export-title { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--app-text-dim); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
.export-title b { color: var(--app-primary); font-family: 'Space Mono', monospace; }
.exp-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.exp-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; border: 1px solid var(--app-border); font-family: 'Outfit', sans-serif; transition: all 0.18s; white-space: nowrap; background: var(--app-card); color: var(--app-text-main); }
.exp-hint { font-size: 10px; opacity: 0.5; margin-left: 2px; font-weight: 400; }
.exp-xlsx { border-color: #10b98133; color: #059669; }
.exp-xlsx:hover { background: #10b98111; border-color: #10b981; }
.exp-pdf { border-color: #ef444433; color: #dc2626; }
.exp-pdf:hover { background: #ef444411; border-color: #ef4444; }
.exp-sep { width: 1px; height: 24px; background: var(--app-border); margin: 0 4px; }

/* Table Section */
.inv-card { background: var(--app-card); border: 1px solid var(--app-border); border-radius: 14px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
.table-container { position: relative; }
.inv-table { width: 100%; border-collapse: collapse; }
.inv-table thead { background: var(--app-card-hi); }
.inv-table th { padding: 12px 16px; font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--app-text-dim); text-align: left; border-bottom: 1px solid var(--app-border); }
.inv-table td { padding: 14px 16px; border-bottom: 1px solid var(--app-border); font-size: 13px; vertical-align: middle; transition: background 0.1s; }
.inv-row { cursor: pointer; }
.inv-row:hover td { background: var(--app-bg); }
.row-sel td { background: rgba(79, 110, 247, 0.05) !important; }

.cb-th, .cb-td { width: 40px; text-align: center; }
.hd-cb, .row-cb { width: 16px; height: 16px; accent-color: var(--app-primary); cursor: pointer; }

.inv-num { font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; color: var(--app-primary); }
.inv-num.fk { color: #d97706; }
.inv-num.cancelled { color: var(--app-text-dim); text-decoration: line-through; }

.cli-name { font-weight: 700; color: var(--app-text-main); }
.cli-id { font-size: 11px; color: var(--app-text-dim); margin-top: 1px; }

.badge-type { font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 5px; }
.b-fa { background: #4f6ef71a; color: #4f6ef7; }
.b-fk { background: #f59e0b1a; color: #d97706; }
.b-pro { background: #8b5cf61a; color: #7c3aed; }

.proj-tag { font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: var(--app-card-hi); color: var(--app-text-dim); border: 1px solid var(--app-border); }
.pt-space { color: #4f6ef7; border-color: #4f6ef744; }

.amt { font-family: 'Space Mono', monospace; font-weight: 700; font-size: 14px; }
.amt.neg { color: #dc2626; }

.paid-stamp { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; color: #059669; margin-top: 4px; font-family: 'Space Mono', monospace; }

.actions-wrap { display: flex; justify-content: center; position: relative; }
.dd-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--app-border); background: var(--app-bg); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; color: var(--app-text-dim); transition: all 0.15s; }
.dd-btn:hover { background: var(--app-card-hi); color: var(--app-primary); border-color: var(--app-primary); }

.dditem { padding: 10px 14px; font-size: 13px; font-weight: 500; color: var(--app-text-main); cursor: pointer; border-radius: 8px; display: flex; align-items: center; gap: 10px; transition: all 0.1s; }
.dditem:hover { background: var(--app-card-hi); }
.dditem-am { color: #d97706; }
.dditem-red { color: #dc2626; }
.separator { height: 1px; background: var(--app-border); margin: 6px 0; }

/* Pagination */
.pag { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-top: 1px solid var(--app-border); }
.pag-info { font-size: 12px; color: var(--app-text-dim); font-weight: 600; }
.pag-btns { display: flex; gap: 6px; }
.pb { min-width: 32px; height: 32px; padding: 0 8px; border-radius: 8px; border: 1px solid var(--app-border); background: var(--app-bg); font-size: 12px; font-weight: 700; color: var(--app-text-dim); cursor: pointer; transition: all 0.15s; font-family: 'Space Mono', monospace; }
.pb.act { background: var(--app-primary); color: white; border-color: var(--app-primary); }
.pb:hover:not(.act):not(:disabled) { border-color: var(--app-primary); color: var(--app-primary); }
.pb:disabled { opacity: 0.4; cursor: default; }

/* Selection Bar */
.sel-bar { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #eff6ff; border: 1.5px solid #4f6ef755; border-radius: 12px; padding: 12px 24px; display: none; align-items: center; gap: 24px; z-index: 1000; box-shadow: 0 12px 40px rgba(79, 110, 247, 0.2); }
.sel-bar.show { display: flex; }
.sel-bar-n { font-size: 14px; font-weight: 800; color: #1e40af; }
.sel-bar-acts { display: flex; gap: 8px; }

/* Transitions */
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translate(-50%, 40px); }

/* Skeleton */
.skeleton-row { height: 64px; background: linear-gradient(90deg, var(--app-bg) 25%, var(--app-card-hi) 50%, var(--app-bg) 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 8px; margin: 4px; }
@keyframes skeleton-loading { from { background-position: 200% 0; } to { background-position: -200% 0; } }

.empty-state { padding: 80px !important; text-align: center; }
.na-ico { font-size: 48px; margin-bottom: 12px; }
.na-title { font-size: 20px; font-weight: 800; color: var(--app-text-main); margin-bottom: 8px; }

.mono-text { font-family: 'Space Mono', monospace; font-size: 12px; }
</style>
