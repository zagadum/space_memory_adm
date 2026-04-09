<template>
  <div class="content">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('finance.overpaymentsList') || 'Overpayments' }}</h1>
        <p class="page-subtitle">{{ t('finance.overpaymentsSubtitle') || 'Students with positive balance and store credit' }}</p>
      </div>
      <div class="header-right">
        <div class="filter-group">
          <label class="filter-label">{{ t('faktury.filterByProject') }}</label>
          <select class="dropdown-filter-btn" v-model="debtorsStore.filters.project_id" @change="debtorsStore.fetchOverpayments">
            <option :value="undefined">{{ t('common.allProjects') || 'All Projects' }}</option>
            <option v-for="project in projectsStore.projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid" v-if="debtorsStore.overpaymentStats">
      <div class="stat-card">
        <div class="stat-icon persons">👥</div>
        <div class="stat-info">
          <div class="stat-label">{{ t('finance.totalOverpaidStudents') || 'Overpaid Students' }}</div>
          <div class="stat-value">{{ debtorsStore.overpaymentStats.total_overpaid_count }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon money">💰</div>
        <div class="stat-info">
          <div class="stat-label">{{ t('finance.totalOverpaymentSum') || 'Total Overpayment' }}</div>
          <div class="stat-value money-text">{{ formatCurrency(debtorsStore.overpaymentStats.total_overpayment_sum) }}</div>
        </div>
      </div>

      <div class="stat-card featured">
        <div class="stat-icon credit">💳</div>
        <div class="stat-info">
          <div class="stat-label">{{ t('finance.totalCreditAmount') || 'Total Store Credit' }}</div>
          <div class="stat-value featured-text">{{ formatCurrency(debtorsStore.overpaymentStats.total_credit_amount) }}</div>
        </div>
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
            <th>{{ t('finance.balanceOverpayment') || 'Credit Account' }}</th>
            <th>{{ t('finance.totalCredit') || 'Total Credit' }}</th>
            <th class="actions-header">{{ t('common.actions') || 'Actions' }}</th>
          </tr>
        </thead>

        <tbody v-if="debtorsStore.isLoading">
          <tr v-for="i in 5" :key="i" class="skeleton-row">
            <td colspan="6"><div class="skeleton-line"></div></td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr v-for="item in debtorsStore.overpayments" :key="item.id" class="table-row">
            <td>
              <div class="buyer-info">
                <span class="buyer-name">{{ item.full_name }}</span>
                <span class="buyer-nip">{{ item.email }}</span>
              </div>
            </td>
            <td>
              <UiBadge variant="default" size="sm">
                {{ item.project?.name || '—' }}
              </UiBadge>
            </td>
            <td>
              <span class="amount-val text-success">{{ formatCurrency(item.balance) }}</span>
            </td>
            <td>
              <span class="amount-val">{{ formatCurrency(item.balance_overpayment) }}</span>
            </td>
            <td>
              <span class="total-credit-val">{{ formatCurrency(item.total_credit) }}</span>
            </td>
            <td class="td-actions">
              <UiButton variant="ghost" size="sm" @click="handleRowClick(item)">
                🔍 {{ t('faktury.viewDetails') }}
              </UiButton>
            </td>
          </tr>

          <tr v-if="debtorsStore.overpayments.length === 0">
            <td colspan="6" class="empty-cell">
              <div class="empty-state">
                <div class="empty-icon">📭</div>
                <div class="empty-text">{{ t('common.noData') }}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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

const { t } = useI18n();
const debtorsStore = useDebtorsStore();
const projectsStore = useProjectsStore();
const router = useRouter();

onMounted(async () => {
  await projectsStore.fetchProjects();
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
.content { padding: 24px 32px; max-width: 1400px; margin: 0 auto; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--app-text-main);
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--app-text-dim);
  margin: 0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--app-text-dim);
}

.dropdown-filter-btn {
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid var(--app-border);
  background: var(--app-card);
  color: var(--app-text-main);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 180px;
}

.dropdown-filter-btn:hover {
  border-color: var(--blue);
  box-shadow: 0 4px 12px rgba(var(--blue-rgb), 0.1);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: var(--app-shadow);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card.featured {
  background: linear-gradient(135deg, var(--blue) 0%, #3b82f6 100%);
  border: none;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: var(--app-surface);
}

.featured .stat-icon {
  background: rgba(255, 255, 255, 0.2);
}

.stat-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--app-text-dim);
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.featured .stat-label {
  color: rgba(255, 255, 255, 0.8);
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--app-text-main);
}

.featured .stat-value {
  color: #fff;
}

.money-text { color: var(--green); }
.featured-text { color: #fff; }

/* Table */
.table-container {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--app-shadow);
}

table { width: 100%; border-collapse: collapse; text-align: left; }

th {
  padding: 16px 24px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--app-text-dim);
  background: rgba(var(--app-text-main-rgb), 0.02);
  border-bottom: 1px solid var(--app-border);
}

td { padding: 18px 24px; border-bottom: 1px solid var(--app-border); vertical-align: middle; }

.table-row:hover { background: rgba(var(--blue-rgb), 0.03); }

.buyer-info { display: flex; flex-direction: column; gap: 2px; }
.buyer-name { font-weight: 700; color: var(--app-text-main); font-size: 14px; }
.buyer-nip { font-size: 12px; color: var(--app-text-dim); font-family: 'Space Mono', monospace; }

.amount-val { font-family: 'Space Mono', monospace; font-weight: 600; font-size: 14px; }
.text-success { color: var(--green); }
.total-credit-val { font-weight: 800; color: var(--green); font-family: 'Space Mono', monospace; font-size: 15px; }

.td-actions { text-align: right; }

.empty-cell { padding: 80px 24px; text-align: center; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.empty-icon { font-size: 48px; opacity: 0.5; }
.empty-text { font-size: 16px; font-weight: 600; color: var(--app-text-dim); }

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, var(--app-border) 25%, var(--app-surface) 50%, var(--app-border) 75%);
  background-size: 200% 100%;
  animation: skeleton 1.5s infinite;
  border-radius: 8px;
}

@keyframes skeleton {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; gap: 20px; }
}
</style>
