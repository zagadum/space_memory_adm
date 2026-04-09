<template>
  <div class="content">
    <!-- Stats Header -->
    <div class="stats-grid" v-if="debtorsStore.stats">
      <div class="stat-card">
        <div class="stat-label">{{ t('finance.totalDebtors') || 'Total Debtors' }}</div>
        <div class="stat-value">{{ debtorsStore.stats.total_debtors_count }}</div>
      </div>
      <div class="stat-card debt">
        <div class="stat-label">{{ t('finance.totalDebtSum') || 'Total Debt Sum' }}</div>
        <div class="stat-value">{{ formatCurrency(debtorsStore.stats.total_debt_amount) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">{{ t('finance.invoiceDebt') || 'Invoice Debt' }}</div>
        <div class="stat-value">{{ formatCurrency(debtorsStore.stats.invoice_debt) }}</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <div class="section-title">
          {{ t('finance.debtorsList') || 'Debtors List' }}
          <span class="section-count">{{ debtorsStore.pagination.total }}</span>
        </div>
      </div>
      <div class="toolbar-right">
        <!-- Project Filter -->
        <select class="dropdown-filter-btn" v-model="debtorsStore.filters.project_id" @change="debtorsStore.fetchDebtors">
          <option :value="undefined">{{ t('faktury.filterByProject') }}</option>
          <option v-for="project in projectsStore.projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>

        <UiInput 
          v-model="debtorsStore.filters.search" 
          :placeholder="t('common.search')"
          size="sm"
          class="search-input"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- Table Container -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>{{ t('faktury.buyer') }}</th>
            <th>{{ t('faktury.project') }}</th>
            <th>{{ t('common.balance') || 'Balance' }}</th>
            <th>{{ t('finance.invoiceDebt') || 'Invoice Debt' }}</th>
            <th>{{ t('finance.totalDebt') || 'Total Debt' }}</th>
            <th>{{ t('finance.overdueCount') || 'Overdue' }}</th>
            <th>{{ t('finance.lastInvoice') || 'Last Invoice' }}</th>
            <th class="actions-header">···</th>
          </tr>
        </thead>

        <!-- Skeletons -->
        <tbody v-if="debtorsStore.isLoading">
          <tr v-for="i in 5" :key="i" class="skeleton-row">
            <td colspan="8"><div class="skeleton-line"></div></td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else>
          <tr v-for="debtor in debtorsStore.debtors" :key="debtor.id" class="table-row">
            <td>
              <div class="buyer-info">
                <span class="buyer-name">{{ debtor.full_name }}</span>
                <span class="buyer-nip">{{ debtor.email }}</span>
              </div>
            </td>
            <td>
              <UiBadge variant="default" size="sm">
                {{ debtor.project?.name || '—' }}
              </UiBadge>
            </td>
            <td>
              <span :class="{ 'text-danger': debtor.balance < 0 }">
                {{ formatCurrency(debtor.balance) }}
              </span>
            </td>
            <td>{{ formatCurrency(debtor.invoice_debt) }}</td>
            <td>
              <div class="total-debt-cell">
                <span class="debt-amount">{{ formatCurrency(debtor.total_debt) }}</span>
              </div>
            </td>
            <td>
              <UiBadge v-if="debtor.overdue_invoices_count > 0" variant="danger" size="sm">
                {{ debtor.overdue_invoices_count }}
              </UiBadge>
              <span v-else>—</span>
            </td>
            <td>
              <span class="date-mono">{{ formatDate(debtor.last_invoice_date) }}</span>
            </td>
            <td>
              <div class="actions-wrap">
                <UiButton variant="ghost" size="sm" @click="handleSendReminder(debtor)">
                  📧 {{ t('common.remind') || 'Remind' }}
                </UiButton>
              </div>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="debtorsStore.debtors.length === 0">
            <td colspan="8" class="empty-cell">{{ t('common.noData') }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-footer" v-if="debtorsStore.pagination.total > 0">
      <div class="pagination-info">
        {{ (debtorsStore.pagination.currentPage - 1) * debtorsStore.pagination.perPage + 1 }}-{{ Math.min(debtorsStore.pagination.currentPage * debtorsStore.pagination.perPage, debtorsStore.pagination.total) }} / {{ debtorsStore.pagination.total }}
      </div>
      <div class="pagination-controls">
        <button class="dropdown-filter-btn" :disabled="debtorsStore.pagination.currentPage <= 1" @click="debtorsStore.setPage(debtorsStore.pagination.currentPage - 1)">←</button>
        <span class="section-count">{{ debtorsStore.pagination.currentPage }} / {{ debtorsStore.pagination.lastPage }}</span>
        <button class="dropdown-filter-btn" :disabled="debtorsStore.pagination.currentPage >= debtorsStore.pagination.lastPage" @click="debtorsStore.setPage(debtorsStore.pagination.currentPage + 1)">→</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDebtorsStore } from '../../stores/debtors.store';
import { useProjectsStore } from '../../stores/projects.store';
import { useModalStore } from '../../stores/modal.store';
import UiButton from '../../components/ui/UiButton.vue';
import UiBadge from '../../components/ui/UiBadge.vue';
import UiInput from '../../components/ui/UiInput.vue';

const { t } = useI18n();
const debtorsStore = useDebtorsStore();
const projectsStore = useProjectsStore();
const modal = useModalStore();

onMounted(async () => {
  await projectsStore.fetchProjects();
  await debtorsStore.fetchDebtors();
  await debtorsStore.fetchStats();
});

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString();
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(amount);
}

let searchTimeout: any = null;
function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    debtorsStore.fetchDebtors();
  }, 400);
}

function handleSendReminder(debtor: any) {
  modal.open('invoice-email', { 
    invoice: { 
      id: debtor.id, // Proxy for student logic or specific invoice logic
      student: debtor 
    } 
  });
}
</script>

<style scoped>
.content { padding: 24px 28px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  padding: 20px;
  border-radius: 16px;
  box-shadow: var(--app-shadow-sm);
}

.stat-card.debt { border-left: 4px solid var(--red); }

.stat-label { font-size: 13px; color: var(--app-text-dim); margin-bottom: 8px; }
.stat-value { font-size: 24px; font-weight: 700; color: var(--app-text-main); }

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

.search-input { width: 200px; }

.dropdown-filter-btn {
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  border: 1px solid var(--app-border);
  background: var(--app-card);
  color: var(--app-text-main);
  cursor: pointer;
  outline: none;
}

.table-container {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--app-shadow);
}

table { width: 100%; border-collapse: collapse; text-align: left; }

th {
  padding: 14px 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--app-text-dim);
  background: var(--app-surface);
  border-bottom: 1px solid var(--app-border);
}

td { padding: 16px 20px; border-bottom: 1px solid var(--app-border); vertical-align: middle; }

.table-row:hover { background: var(--status-info-bg); }

.buyer-info { display: flex; flex-direction: column; }
.buyer-name { font-weight: 600; color: var(--app-text-main); }
.buyer-nip { font-size: 11px; color: var(--app-text-dim); }

.text-danger { color: var(--red); font-weight: 600; }
.debt-amount { font-weight: 700; color: var(--red); }

.date-mono { font-family: 'Space Mono', monospace; font-size: 13px; }

.actions-wrap { display: flex; justify-content: center; }

.empty-cell { padding: 40px; text-align: center; color: var(--app-text-dim); }

.pagination-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}

.pagination-info { font-size: 13px; color: var(--app-text-dim); }
.pagination-controls { display: flex; align-items: center; gap: 12px; }

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
