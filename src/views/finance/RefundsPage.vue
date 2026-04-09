<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRefundsStore } from '../../stores/refunds.store'
import { useProjectsStore } from '../../stores/projects.store'
import { useNotificationStore } from '../../stores/notification.store'
import UiCard from '../../components/ui/UiCard.vue'
import UiButton from '../../components/ui/UiButton.vue'
import UiBadge from '../../components/ui/UiBadge.vue'
import UiInput from '../../components/ui/UiInput.vue'
import UiTable from '../../components/ui/UiTable.vue'

const { t } = useI18n()
const store = useRefundsStore()
const projectsStore = useProjectsStore()
const notifications = useNotificationStore()

// --- Reject panel state ---
const rejectTarget = ref<{ id: number; studentName: string; amount: number; currency: string; reason: string } | null>(null)
const actionLoading = ref<number | null>(null)

onMounted(() => {
  store.fetchRefunds()
  store.fetchStats()
})

const handleRefresh = () => {
  store.fetchRefunds()
  store.fetchStats()
}

// --- Search with debounce ---
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const handleSearch = (value: string) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    store.setFilter({ search: value })
  }, 400)
}

// --- Approve ---
async function handleApprove(item: any) {
  if (!confirm(t('finance.confirmApprove'))) return
  actionLoading.value = item.id
  const ok = await store.approveRefund(item.id)
  actionLoading.value = null
  if (ok) notifications.addToast(t('finance.refundApproved'), 'success')
  else notifications.addToast(t('common.error'), 'error')
}

// --- Reject ---
function openReject(item: any) {
  rejectTarget.value = {
    id: item.id,
    studentName: item.student?.full_name || `ID: ${item.student_id}`,
    amount: item.amount,
    currency: item.currency,
    reason: '',
  }
}

async function submitReject() {
  if (!rejectTarget.value || rejectTarget.value.reason.trim().length < 5) return
  actionLoading.value = rejectTarget.value.id
  const ok = await store.rejectRefund(rejectTarget.value.id, rejectTarget.value.reason.trim())
  actionLoading.value = null
  rejectTarget.value = null
  if (ok) notifications.addToast(t('finance.refundRejected'), 'success')
  else notifications.addToast(t('common.error'), 'error')
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'processing': return 'info'
    case 'manual_pending': return 'default'
    case 'completed': return 'success'
    case 'rejected': return 'danger'
    default: return 'default'
  }
}

const canAction = (status: string) => status === 'pending' || status === 'processing' || status === 'manual_pending'

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
        <UiButton variant="primary" @click="handleRefresh" :loading="store.isLoading">
          🔄 {{ t('common.refresh') }}
        </UiButton>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <UiCard glass class="stat-card platinum">
        <div class="stat-icon-wrapper warning">
          <span class="emoji-icon">⏳</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('finance.pendingRefundsCount') }}</span>
          <div class="stat-value-row">
            <span class="stat-value highlight-warning">{{ store.stats.pending_count }}</span>
          </div>
          <span class="stat-sub">{{ t('common.pending') }}</span>
        </div>
      </UiCard>

      <UiCard glass class="stat-card">
        <div class="stat-icon-wrapper info">
          <span class="emoji-icon">💰</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('finance.totalRefundAmount') }}</span>
          <div class="stat-value-row">
            <span class="stat-value highlight">{{ store.stats.pending_amount }} <span class="currency">PLN</span></span>
          </div>
          <span class="stat-sub">{{ t('finance.sumRequested') }}</span>
        </div>
      </UiCard>

      <UiCard glass class="stat-card">
        <div class="stat-icon-wrapper success">
          <span class="emoji-icon">✅</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('finance.completedRefunds') }}</span>
          <div class="stat-value-row">
            <span class="stat-value text-success">{{ store.stats.completed_month }}</span>
          </div>
          <span class="stat-sub">{{ t('common.thisMonth') }}</span>
        </div>
      </UiCard>

      <UiCard glass class="stat-card">
        <div class="stat-icon-wrapper danger">
          <span class="emoji-icon">❌</span>
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ t('finance.rejectedRefunds') }}</span>
          <div class="stat-value-row">
            <span class="stat-value text-danger">{{ store.stats.rejected_month }}</span>
          </div>
          <span class="stat-sub">{{ t('common.thisMonth') }}</span>
        </div>
      </UiCard>
    </div>

    <!-- Filters & Table -->
    <UiCard class="table-card">
      <div class="toolbar">
        <div class="search-box">
          <UiInput
            v-model="store.filters.search"
            :placeholder="t('search.refunds')"
            @input="handleSearch(($event.target as HTMLInputElement).value)"
          >
            <template #prefix>🔍</template>
          </UiInput>
        </div>
        <div class="filters">
          <select 
            class="custom-select" 
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

      <UiTable
        :items="store.refunds"
        :loading="store.isLoading"
      >
        <template #head>
          <tr>
            <th>{{ t('studentList.table.name') }}</th>
            <th>{{ t('finance.refundType') }}</th>
            <th>{{ t('payments.table.amount') }}</th>
            <th>{{ t('payments.table.status') }}</th>
            <th>{{ t('finance.iban') }}</th>
            <th>{{ t('common.createdAt') }}</th>
            <th class="actions-col"></th>
          </tr>
        </template>

        <template #row="{ item }">
          <tr class="table-row">
            <td>
              <div class="student-cell">
                <span class="student-name">{{ item.student?.full_name || `${$t('finance.studentId')}: ${item.student_id}` }}</span>
              </div>
            </td>
            <td>
              <UiBadge variant="default">{{ t('finance.' + item.type) }}</UiBadge>
            </td>
            <td>
              <span class="refund-amount">{{ item.amount }} {{ item.currency }}</span>
            </td>
            <td>
              <UiBadge :variant="getStatusVariant(item.status)">
                {{ t('payments.status.' + item.status) }}
              </UiBadge>
            </td>
            <td>
              <div class="bank-details" v-if="item.iban">
                <span class="iban">{{ item.iban }}</span>
                <span class="bank-name">{{ item.bank_name }}</span>
              </div>
              <span v-else class="dim">—</span>
            </td>
            <td>
              <span class="date-mono">{{ formatDate(item.created_at) }}</span>
            </td>
            <td class="actions-col">
              <template v-if="canAction(item.status)">
                <UiButton
                  size="sm"
                  variant="success"
                  :loading="actionLoading === item.id"
                  @click="handleApprove(item)"
                >
                  ✅ {{ t('common.approve') }}
                </UiButton>
                <UiButton
                  size="sm"
                  variant="danger"
                  :disabled="actionLoading === item.id"
                  @click="openReject(item)"
                >
                  ❌ {{ t('common.reject') }}
                </UiButton>
              </template>
              <UiBadge v-else-if="item.status === 'completed'" variant="success">
                {{ t('common.done') }}
              </UiBadge>
              <span v-else class="dim">—</span>
            </td>
          </tr>
        </template>
      </UiTable>
    </UiCard>
    <!-- Reject Panel (slide-up) -->
    <Transition name="slide-up">
      <div v-if="rejectTarget" class="reject-panel">
        <div class="reject-panel-info">
          <span class="reject-panel-label">{{ $t('finance.rejectingRefund') }}:</span>
          <strong class="reject-panel-name">{{ rejectTarget.studentName }}</strong>
          <span class="reject-panel-amount">{{ rejectTarget.amount }} {{ rejectTarget.currency }}</span>
        </div>
        <textarea
          v-model="rejectTarget.reason"
          class="reject-reason-input"
          :placeholder="$t('finance.rejectReasonPlaceholder')"
          rows="2"
        />
        <div class="reject-panel-actions">
          <UiButton variant="ghost" size="sm" @click="rejectTarget = null">
            {{ t('common.cancel') }}
          </UiButton>
          <UiButton
            variant="danger"
            size="sm"
            :loading="actionLoading === rejectTarget.id"
            :disabled="rejectTarget.reason.trim().length < 5"
            @click="submitReject"
          >
            ❌ {{ $t('finance.confirmReject') }}
          </UiButton>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.refunds-page {
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
}

.page-subtitle {
  font-size: 14px;
  color: var(--app-text-dim);
  margin-top: 4px;
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

.stat-icon-wrapper.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.stat-icon-wrapper.info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.stat-icon-wrapper.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.stat-icon-wrapper.danger { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }

.stat-info { display: flex; flex-direction: column; }
.stat-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--app-text-dim); margin-bottom: 4px; letter-spacing: 0.5px; }
.stat-value-row { display: flex; align-items: baseline; gap: 8px; }
.stat-value { font-size: 24px; font-weight: 800; color: var(--app-text-main); font-family: 'Outfit', sans-serif; }
.stat-value.highlight { color: var(--app-primary); }
.stat-value.highlight-warning { color: #f59e0b; }
.text-success { color: #10b981; }
.text-danger { color: #f43f5e; }
.currency { font-size: 14px; font-weight: 600; color: var(--app-text-dim); margin-left: 4px; }
.stat-sub { font-size: 12px; color: var(--app-text-dim); margin-top: 2px; }

/* Content Card / Table */
.table-card { padding: 0 !important; }

.toolbar {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.search-box { flex: 1; max-width: 320px; }

.custom-select {
  background: var(--app-card-hi);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text-main);
  outline: none;
  min-width: 180px;
  transition: all 0.2s;
}

.custom-select:hover { border-color: var(--app-primary); }

.student-cell { display: flex; flex-direction: column; }
.student-name { font-weight: 700; color: var(--app-text-main); font-size: 14px; }

.refund-amount { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 14px; color: var(--app-text-main); }

.bank-details { display: flex; flex-direction: column; gap: 2px; }
.iban { font-family: 'Space Mono', monospace; font-size: 12px; color: var(--app-text-main); }
.bank-name { font-size: 11px; color: var(--app-text-dim); }

.date-mono { font-family: 'Space Mono', monospace; font-size: 13px; color: var(--app-text-dim); }

.actions-col { text-align: right; width: 180px; }
.actions-col :deep(.ui-button) + :deep(.ui-button) { margin-left: 6px; }

.dim { color: var(--app-text-dim); font-size: 11px; }

/* Reject panel */
.reject-panel {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--app-card);
  border: 1.5px solid rgba(244, 63, 94, 0.35);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  z-index: 1000;
  box-shadow: 0 12px 40px rgba(244, 63, 94, 0.15);
  min-width: 560px;
  max-width: 720px;
  flex-wrap: wrap;
}

.reject-panel-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.reject-panel-label { font-size: 11px; font-weight: 700; color: var(--app-text-dim); text-transform: uppercase; letter-spacing: 0.05em; }
.reject-panel-name { font-size: 13px; font-weight: 800; color: var(--app-text-main); }
.reject-panel-amount { font-size: 13px; font-weight: 700; color: #f43f5e; font-family: 'Space Mono', monospace; }

.reject-reason-input {
  flex: 1;
  min-width: 200px;
  background: var(--app-bg);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--app-text-main);
  font-family: 'Outfit', sans-serif;
  outline: none;
  resize: none;
  transition: border-color 0.15s;
}
.reject-reason-input:focus { border-color: #f43f5e; }

.reject-panel-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }

/* Transition */
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translate(-50%, 32px); }
</style>
