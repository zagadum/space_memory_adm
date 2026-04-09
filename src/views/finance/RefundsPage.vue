<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRefundsStore } from '@/stores/refunds.store'
import { useProjectsStore } from '@/stores/projects.store'
import UiCard from '@/components/ui/UiCard.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiInput from '@/components/ui/UiInput.vue'
import { 
  ArrowPathIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  BuildingLibraryIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
const store = useRefundsStore()
const projectsStore = useProjectsStore()

onMounted(() => {
  store.fetchRefunds()
  store.fetchStats()
})

const handleRefresh = () => {
  store.fetchRefunds()
  store.fetchStats()
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'processing': return 'info'
    case 'manual_pending': return 'neutral'
    case 'completed': return 'success'
    case 'rejected': return 'danger'
    default: return 'neutral'
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString()
}
</script>

<template>
  <div class="refunds-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ t('finance.refundsTitle') }}</h1>
        <p class="page-subtitle">{{ t('finance.refundSubtitle') }}</p>
      </div>
      <div class="header-actions">
        <UiButton variant="neutral" @click="handleRefresh" :loading="store.isLoading">
          <template #icon><ArrowPathIcon class="w-4 h-4" /></template>
          {{ t('common.refresh') }}
        </UiButton>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <UiCard class="stat-card platinum">
        <div class="stat-icon-wrapper warning">
          <ClockIcon class="w-6 h-6" />
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('finance.pendingRefundsCount') }}</span>
          <span class="stat-value">{{ store.stats.pending_count }}</span>
        </div>
      </UiCard>

      <UiCard class="stat-card glass">
        <div class="stat-icon-wrapper info">
          <BanknotesIcon class="w-6 h-6" />
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('finance.totalRefundAmount') }}</span>
          <span class="stat-value highlight">{{ store.stats.pending_amount }} <span class="currency">PLN</span></span>
        </div>
      </UiCard>

      <UiCard class="stat-card glass">
        <div class="stat-icon-wrapper success">
          <CheckCircleIcon class="w-6 h-6" />
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('finance.completedRefunds') }}</span>
          <span class="stat-value">{{ store.stats.completed_month }}</span>
        </div>
      </UiCard>

      <UiCard class="stat-card glass">
        <div class="stat-icon-wrapper danger">
          <XCircleIcon class="w-6 h-6" />
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('finance.rejectedRefunds') }}</span>
          <span class="stat-value">{{ store.stats.rejected_month }}</span>
        </div>
      </UiCard>
    </div>

    <!-- Filters & Table -->
    <UiCard class="content-card">
      <div class="toolbar">
        <div class="search-box">
          <UiInput
            v-model="store.filters.search"
            :placeholder="t('search.refunds')"
            @input="store.setFilter({ search: $event.target.value })"
          >
            <template #prefix><MagnifyingGlassIcon class="w-4 h-4 text-gray-400" /></template>
          </UiInput>
        </div>
        <div class="filters">
          <select 
            class="project-select" 
            v-model="store.filters.project_id"
            @change="store.setFilter({ project_id: store.filters.project_id })"
          >
            <option :value="null">{{ t('common.allProjects') }}</option>
            <option v-for="p in projectsStore.projects" :key="p.id" :value="p.id">
              {{ p.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="table-wrapper" :class="{ 'is-loading': store.isLoading }">
        <table class="premium-table">
          <thead>
            <tr>
              <th>{{ t('studentList.table.name') }}</th>
              <th>{{ t('finance.refundType') }}</th>
              <th>{{ t('payments.table.amount') }}</th>
              <th>{{ t('payments.table.status') }}</th>
              <th>{{ t('finance.iban') }}</th>
              <th>{{ t('common.createdAt') }}</th>
              <th class="actions"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.isLoading && !store.refunds.length" v-for="i in 5" :key="i">
              <td colspan="7"><div class="skeleton-row"></div></td>
            </tr>
            <tr v-else v-for="refund in store.refunds" :key="refund.id">
              <td>
                <div class="student-info">
                  <span class="student-name">{{ refund.student?.full_name || 'Student ID: ' + refund.student_id }}</span>
                </div>
              </td>
              <td>
                <UiBadge variant="neutral">{{ t('finance.' + refund.type) }}</UiBadge>
              </td>
              <td>
                <span class="refund-amount">{{ refund.amount }} {{ refund.currency }}</span>
              </td>
              <td>
                <UiBadge :variant="getStatusVariant(refund.status)">
                  {{ t('payments.status.' + refund.status) }}
                </UiBadge>
              </td>
              <td>
                <div class="bank-details" v-if="refund.iban">
                  <span class="iban">{{ refund.iban }}</span>
                  <span class="bank-name">{{ refund.bank_name }}</span>
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td>{{ formatDate(refund.created_at) }}</td>
              <td class="actions">
                <UiButton size="sm" variant="neutral" @click="() => {}">
                  {{ t('common.view') }}
                </UiButton>
              </td>
            </tr>
            <tr v-if="!store.isLoading && !store.refunds.length">
              <td colspan="7" class="empty-state">
                {{ t('common.noData') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiCard>
  </div>
</template>

<style scoped>
.refunds-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--border-color);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-wrapper.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.stat-icon-wrapper.info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.stat-icon-wrapper.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.stat-icon-wrapper.danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  font-weight: 600;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value.highlight {
  color: var(--primary-color, #3b82f6);
}

.currency {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-left: 4px;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.search-box {
  flex: 1;
  max-width: 320px;
}

.project-select {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  min-width: 180px;
}

/* Table Style */
.table-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.premium-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.premium-table th {
  background: var(--bg-secondary);
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
}

.premium-table td {
  padding: 16px;
  border-top: 1px solid var(--border-color);
  font-size: 14px;
}

.student-name {
  font-weight: 600;
  color: var(--text-primary);
}

.refund-amount {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
}

.bank-details {
  display: flex;
  flex-direction: column;
}

.iban {
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  color: var(--text-primary);
}

.bank-name {
  font-size: 11px;
  color: var(--text-secondary);
}

.actions {
  text-align: right;
}

.skeleton-row {
  height: 48px;
  background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--border-color) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

.empty-state {
  text-align: center;
  padding: 48px !important;
  color: var(--text-secondary);
}
</style>
