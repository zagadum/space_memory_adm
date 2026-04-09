<template>
  <div class="content">
    <!-- Toolbar -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <div class="section-title">
          {{ t('finance.overpaymentsList') || 'Overpayments' }}
          <span class="section-count">{{ debtorsStore.overpayments.length }}</span>
        </div>
      </div>
      <div class="toolbar-right">
        <select class="dropdown-filter-btn" v-model="debtorsStore.filters.project_id" @change="debtorsStore.fetchOverpayments">
          <option :value="undefined">{{ t('faktury.filterByProject') }}</option>
          <option v-for="project in projectsStore.projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>
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
            <th>{{ t('finance.overpayment') || 'Overpayment' }}</th>
            <th>{{ t('finance.totalCredit') || 'Total Credit' }}</th>
            <th class="actions-header">···</th>
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
              <span class="text-success">{{ formatCurrency(item.balance) }}</span>
            </td>
            <td>{{ formatCurrency(item.balance_overpayment) }}</td>
            <td>
              <span class="total-credit">{{ formatCurrency(item.total_credit) }}</span>
            </td>
            <td>
              <div class="actions-wrap">
                <UiButton variant="ghost" size="sm" @click="handleRowClick(item)">
                  🔍 {{ t('faktury.viewDetails') }}
                </UiButton>
              </div>
            </td>
          </tr>

          <tr v-if="debtorsStore.overpayments.length === 0">
            <td colspan="6" class="empty-cell">{{ t('common.noData') }}</td>
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

.text-success { color: var(--green); font-weight: 600; }
.total-credit { font-weight: 700; color: var(--green); }

.actions-wrap { display: flex; justify-content: center; }

.empty-cell { padding: 40px; text-align: center; color: var(--app-text-dim); }

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
