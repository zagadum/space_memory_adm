<template>
  <div class="content">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ t('finance.overpaymentsList') }}</h1>
        <p class="page-subtitle">{{ t('finance.overpaymentsSubtitle') }}</p>
      </div>
      <div class="header-actions">
        <div class="filter-wrapper">
          <select class="custom-select" v-model="debtorsStore.filters.project_id" @change="debtorsStore.fetchOverpayments">
            <option :value="undefined">{{ t('common.allProjects') }}</option>
            <option v-for="project in projectsStore.projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="stats-grid" v-if="debtorsStore.overpaymentStats">
      <UiCard glass class="stat-card platinum">
        <div class="stat-icon-wrapper blue">
          <span class="emoji-icon">👥</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('finance.totalOverpaidStudents') }}</span>
          <div class="stat-value-row">
            <span class="stat-value highlight">{{ debtorsStore.overpaymentStats.total_overpaid_count }}</span>
          </div>
          <span class="stat-sub">{{ t('common.total') }}</span>
        </div>
      </UiCard>
      
      <UiCard glass class="stat-card">
        <div class="stat-icon-wrapper success">
          <span class="emoji-icon">💰</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('finance.totalOverpaymentSum') }}</span>
          <div class="stat-value-row">
            <span class="stat-value text-success">{{ formatCurrency(debtorsStore.overpaymentStats.total_overpayment_sum) }}</span>
          </div>
          <span class="stat-sub">POS Balance</span>
        </div>
      </UiCard>

      <UiCard glass class="stat-card">
        <div class="stat-icon-wrapper amber">
          <span class="emoji-icon">💳</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('finance.totalCreditAmount') }}</span>
          <div class="stat-value-row">
            <span class="stat-value highlight-amber">{{ formatCurrency(debtorsStore.overpaymentStats.total_credit_amount) }}</span>
          </div>
          <span class="stat-sub">{{ t('finance.totalCredit') }}</span>
        </div>
      </UiCard>
    </div>

    <!-- Table Section -->
    <UiCard class="table-card">
      <UiTable
        :items="debtorsStore.overpayments"
        :loading="debtorsStore.isLoading"
      >
        <template #head>
          <tr>
            <th>{{ t('faktury.buyer') }}</th>
            <th>{{ t('faktury.project') }}</th>
            <th>{{ t('common.balance') }}</th>
            <th>{{ t('finance.balanceOverpayment') }}</th>
            <th>{{ t('finance.totalCredit') }}</th>
            <th class="actions-col"></th>
          </tr>
        </template>

        <template #row="{ item }">
          <tr class="clickable-row" @click="handleRowClick(item)">
            <td>
              <div class="buyer-cell">
                <span class="buyer-name">{{ item.full_name }}</span>
                <span class="buyer-nip">{{ item.email }}</span>
              </div>
            </td>
            <td>
              <UiBadge variant="default">
                {{ item.project?.name || '—' }}
              </UiBadge>
            </td>
            <td>
              <span class="amount-val text-success">{{ formatCurrency(item.balance) }}</span>
            </td>
            <td>
              <span class="amount-val dim">{{ formatCurrency(item.balance_overpayment) }}</span>
            </td>
            <td>
              <span class="amount-val featured">{{ formatCurrency(item.total_credit) }}</span>
            </td>
            <td class="actions-col">
              <UiButton variant="ghost" size="sm">
                🔍 {{ t('faktury.viewDetails') }}
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
import { useRouter } from 'vue-router';
import UiButton from '../../components/ui/UiButton.vue';
import UiBadge from '../../components/ui/UiBadge.vue';
import UiCard from '../../components/ui/UiCard.vue';
import UiTable from '../../components/ui/UiTable.vue';

const { t } = useI18n();
const debtorsStore = useDebtorsStore();
const projectsStore = useProjectsStore();
const router = useRouter();

onMounted(async () => {
  await debtorsStore.fetchOverpayments();
});

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(amount);
}

function handleRowClick(item: any) {
  router.push(`/payments/${item.id}`);
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--app-text-main);
  margin: 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--app-text-dim);
  margin-top: 4px;
}

.custom-select {
  background: var(--app-card-hi);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text-main);
  cursor: pointer;
  min-width: 200px;
  transition: all 0.2s ease;
}

.custom-select:hover {
  border-color: var(--app-primary);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.emoji-icon { font-size: 28px; }

.stat-icon-wrapper.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.stat-icon-wrapper.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.stat-icon-wrapper.amber { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

.stat-info { display: flex; flex-direction: column; }
.stat-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--app-text-dim); margin-bottom: 4px; letter-spacing: 0.5px; }
.stat-value-row { display: flex; align-items: baseline; gap: 8px; }
.stat-value { font-size: 24px; font-weight: 800; color: var(--app-text-main); font-family: 'Outfit', sans-serif; }
.stat-value.highlight { color: var(--app-primary); }
.stat-value.highlight-amber { color: #f59e0b; }
.text-success { color: #10b981; }
.stat-sub { font-size: 12px; color: var(--app-text-dim); margin-top: 2px; }

/* Table Section */
.table-card { padding: 0 !important; }

.clickable-row { cursor: pointer; transition: background 0.2s; }
.clickable-row:hover { background: rgba(var(--app-primary-rgb), 0.03); }

.buyer-cell { display: flex; flex-direction: column; gap: 2px; }
.buyer-name { font-weight: 700; color: var(--app-text-main); font-size: 14px; }
.buyer-nip { font-size: 12px; color: var(--app-text-dim); font-family: 'Space Mono', monospace; }

.amount-val { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 14px; }
.amount-val.featured { font-size: 16px; color: #10b981; }
.amount-val.dim { font-weight: 500; opacity: 0.7; }

.actions-col { text-align: right; width: 140px; }
</style>
