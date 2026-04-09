<template>
  <div class="content">
    <!-- Stats Header -->
    <div class="stats-grid" v-if="debtorsStore.stats">
      <UiCard glass class="stat-card platinum">
        <div class="stat-icon-wrapper blue">
          <span class="emoji-icon">👥</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('finance.totalDebtors') }}</span>
          <div class="stat-value-row">
            <span class="stat-value highlight">{{ debtorsStore.stats.total_debtors_count || 0 }}</span>
          </div>
          <span class="stat-sub">{{ t('common.total') }}</span>
        </div>
      </UiCard>

      <UiCard glass class="stat-card">
        <div class="stat-icon-wrapper rose">
          <span class="emoji-icon">💰</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('finance.totalDebtSum') }}</span>
          <div class="stat-value-row">
            <span class="stat-value text-rose-500">{{ formatCurrency(debtorsStore.stats.total_debt_amount || 0) }}</span>
          </div>
          <span class="stat-sub">{{ t('finance.allProjects') || 'All Projects' }}</span>
        </div>
      </UiCard>

      <UiCard glass class="stat-card">
        <div class="stat-icon-wrapper amber">
          <span class="emoji-icon">📄</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('finance.invoiceDebt') }}</span>
          <div class="stat-value-row">
            <span class="stat-value">{{ formatCurrency(debtorsStore.stats.invoice_debt || 0) }}</span>
          </div>
          <span class="stat-sub">VAT {{ t('faktury.type.invoice') }}</span>
        </div>
      </UiCard>

      <UiCard glass class="stat-card">
        <div class="stat-icon-wrapper cyan">
          <span class="emoji-icon">📝</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('finance.proformaDebt') }}</span>
          <div class="stat-value-row">
            <span class="stat-value">{{ formatCurrency(debtorsStore.stats.proforma_debt || 0) }}</span>
          </div>
          <span class="stat-sub">{{ t('faktury.type.proforma') }}</span>
        </div>
      </UiCard>
    </div>

    <!-- Toolbar -->
    <div class="header-section">
      <div class="header-info">
        <h1 class="title">{{ t('finance.debtorsList') }}</h1>
        <div class="subtitle-row">
          <span class="count-badge">{{ debtorsStore.debtors.length }}</span>
          <span class="subtitle">{{ t('common.total') }}</span>
        </div>
      </div>

      <div class="header-actions">
        <!-- Project Filter -->
        <select class="custom-select" v-model="debtorsStore.filters.project_id" @change="debtorsStore.fetchDebtors">
          <option :value="undefined">{{ t('faktury.filterByProject') }}</option>
          <option v-for="project in projectsStore.projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>

        <UiButton 
          v-if="debtorsStore.debtors.length > 0"
          variant="primary" 
          @click="handleSendBulkReminders"
          :loading="debtorsStore.isLoading"
        >
          📧 {{ t('common.remindAll') || 'Remind All' }}
        </UiButton>

        <div class="search-box">
          <UiInput 
            v-model="debtorsStore.filters.search" 
            :placeholder="t('common.search')"
            @input="handleSearch"
          >
            <template #prefix>🔍</template>
          </UiInput>
        </div>
      </div>
    </div>

    <!-- ... table container ... -->
    <!-- Table Section -->
    <UiCard class="table-card">
      <UiTable
        :items="debtorsStore.debtors"
        :loading="debtorsStore.isLoading"
        :total="debtorsStore.pagination.total"
        :page="debtorsStore.pagination.currentPage"
        :per-page="debtorsStore.pagination.perPage"
        @page-change="debtorsStore.setPage"
      >
        <template #head>
          <tr>
            <th>{{ t('faktury.buyer') }}</th>
            <th>{{ t('common.balance') }}</th>
            <th>{{ t('finance.invoiceDebt') }}</th>
            <th>{{ t('finance.proformaDebt') }}</th>
            <th>{{ t('finance.totalDebt') }}</th>
            <th>{{ t('finance.overdueCount') }}</th>
            <th>{{ t('finance.lastInvoice') }}</th>
            <th class="actions-col"></th>
          </tr>
        </template>

        <template #row="{ item }">
          <tr class="clickable-row">
            <td>
              <div class="buyer-cell">
                <span class="buyer-name">{{ item.full_name }}</span>
                <span class="buyer-nip">{{ item.email }}</span>
              </div>
            </td>
            <td>
              <span class="amount-val" :class="{ 'text-danger': item.balance < 0 }">
                {{ formatCurrency(item.balance) }}
              </span>
            </td>
            <td>
              <span class="amount-val dim">{{ formatCurrency(item.invoice_debt) }}</span>
            </td>
            <td>
              <span class="amount-val dim">{{ formatCurrency(item.proforma_debt || 0) }}</span>
            </td>
            <td>
              <span class="amount-val featured">{{ formatCurrency(item.total_debt) }}</span>
            </td>
            <td>
              <UiBadge v-if="item.overdue_invoices_count > 0" variant="danger">
                {{ item.overdue_invoices_count }}
              </UiBadge>
              <span v-else class="dim">—</span>
            </td>
            <td>
              <span class="date-mono">{{ formatDate(item.last_invoice_date) }}</span>
            </td>
            <td class="actions-col">
              <UiButton variant="ghost" size="sm" @click="handleSendReminder(item)">
                📧 {{ t('common.remind') }}
              </UiButton>
            </td>
          </tr>
        </template>
      </UiTable>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDebtorsStore } from '../../stores/debtors.store';
import { useProjectsStore } from '../../stores/projects.store';
import { useNotificationStore } from '../../stores/notification.store';
import UiButton from '../../components/ui/UiButton.vue';
import UiBadge from '../../components/ui/UiBadge.vue';
import UiInput from '../../components/ui/UiInput.vue';
import UiCard from '../../components/ui/UiCard.vue';
import UiTable from '../../components/ui/UiTable.vue';

const { t } = useI18n();
const debtorsStore = useDebtorsStore();
const projectsStore = useProjectsStore();
const notifications = useNotificationStore();

onMounted(async () => {
  await debtorsStore.fetchDebtors();
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
    debtorsStore.pagination.currentPage = 1;
    debtorsStore.fetchDebtors();
  }, 400);
}

async function handleSendReminder(debtor: any) {
  try {
    await debtorsStore.sendReminders({ 
      student_ids: [debtor.id],
      project_id: debtorsStore.filters.project_id
    });
    notifications.addToast(t('common.success'), 'success');
  } catch (e) {
    notifications.addToast(t('common.error'), 'error');
  }
}

async function handleSendBulkReminders() {
  if (!confirm(t('common.confirmAction'))) return;

  try {
    await debtorsStore.sendReminders({ 
      project_id: debtorsStore.filters.project_id
    });
    notifications.addToast(t('common.success'), 'success');
  } catch (e) {
    notifications.addToast(t('common.error'), 'error');
  }
}
</script>

<style scoped>
.content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 8px;
}

.stat-card {
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.emoji-icon { font-size: 24px; }

.stat-icon-wrapper.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.stat-icon-wrapper.rose { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
.stat-icon-wrapper.amber { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.stat-icon-wrapper.cyan { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }

.stat-info { display: flex; flex-direction: column; min-width: 0; }
.stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--app-text-dim); margin-bottom: 2px; }
.stat-value-row { display: flex; align-items: baseline; gap: 8px; }
.stat-value { font-size: 18px; font-weight: 700; color: var(--app-text-main); font-family: 'Outfit', sans-serif; }
.stat-value.highlight { color: var(--app-primary); }
.stat-sub { font-size: 11px; color: var(--app-text-dim); margin-top: 1px; }

/* Header Section */
.header-section { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 24px; font-weight: 800; color: var(--app-text-main); margin: 0; }
.subtitle-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.count-badge { font-size: 11px; font-weight: 700; background: var(--app-card-hi); color: var(--app-primary); padding: 2px 8px; border-radius: 6px; }
.subtitle { font-size: 13px; color: var(--app-text-dim); }

.header-actions { display: flex; gap: 12px; align-items: center; }

.custom-select {
  background: var(--app-card-hi);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--app-text-main);
  outline: none;
  min-width: 180px;
  transition: border-color 0.2s;
}
.custom-select:focus { border-color: var(--app-primary); }

.search-box { width: 240px; }

/* Table styles override */
.table-card { padding: 0 !important; }

.buyer-cell { display: flex; flex-direction: column; }
.buyer-name { font-weight: 600; font-size: 14px; color: var(--app-text-main); }
.buyer-nip { font-size: 11px; color: var(--app-text-dim); }

.amount-val { font-family: 'Outfit', sans-serif; font-weight: 700; color: var(--app-text-main); font-size: 14px; }
.amount-val.featured { color: var(--app-primary); font-size: 15px; }
.amount-val.dim { font-weight: 500; opacity: 0.7; }
.text-danger { color: #f43f5e; }
.dim { color: var(--app-text-dim); font-size: 11px; }

.date-mono { font-family: 'Space Mono', monospace; font-size: 13px; color: var(--app-text-dim); }

.actions-col { width: 120px; text-align: center; }
</style>
