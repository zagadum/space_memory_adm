<template>
  <div class="import-db-page">
    <div class="idb-content">
      <!-- PAGE ACTIONS ROW -->
      <div class="idb-actions-row">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input v-model="searchQ" :placeholder="t('importDb.searchPlaceholder')" @input="applyFilters" />
        </div>
        <div class="search-box">
          <span class="search-icon">👩‍🏫</span>
          <input v-model="teacherSearchQ" :placeholder="t('importDb.teacherSearchPlaceholder')" @input="applyFilters" />
        </div>
        <div class="search-box">
          <span class="search-icon">👥</span>
          <input v-model="groupSearchQ" :placeholder="t('importDb.groupSearchPlaceholder')" @input="applyFilters" />
        </div>
        <select v-model="selectedTeacher" class="teacher-filter" @change="applyFilters">
          <option value="">{{ t('importDb.teacherFilterAll') }}</option>
          <option v-for="teacher in availableTeachers" :key="teacher" :value="teacher">{{ teacher }}</option>
        </select>
        <button class="btn btn-ghost" @click="onExport">⬇ {{ t('common.export') }}</button>
      </div>

      <!-- STATS GRID -->
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-label">{{ t('importDb.stats.total') }}</div>
          <div class="stat-value">{{ store.totalCount }}</div>
          <div class="stat-sub">{{ t('importDb.stats.totalSub') }}</div>
          <div class="stat-icon">📊</div>
        </div>
        <div class="stat-card green">
          <div class="stat-label">{{ t('importDb.stats.sent') }}</div>
          <div class="stat-value">{{ store.sentCount }}</div>
          <div class="stat-sub">{{ t('importDb.stats.sentSub') }}</div>
          <div class="stat-icon">✉️</div>
        </div>
        <div class="stat-card cyan">
          <div class="stat-label">{{ t('importDb.stats.done') }}</div>
          <div class="stat-value">{{ store.doneCount }}</div>
          <div class="stat-sub">{{ t('importDb.stats.doneSub') }}</div>
          <div class="stat-icon">✅</div>
        </div>
        <div class="stat-card amber">
          <div class="stat-label">{{ t('importDb.stats.pending') }}</div>
          <div class="stat-value">{{ store.pendingCount }}</div>
          <div class="stat-sub">{{ t('importDb.stats.pendingSub') }}</div>
          <div class="stat-icon">⏳</div>
        </div>
      </div>

      <!-- TOOLBAR -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <div class="section-title">
            {{ t('importDb.listTitle') }}
            <span class="section-count">{{ filteredItems.length }} {{ t('importDb.itemsWord') }}</span>
          </div>
        </div>
        <div class="toolbar-right">
          <div class="pagination-info">
            {{ t('importDb.showing', { shown: filteredItems.length, total: store.totalCount }) }}
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div v-if="store.isLoading" class="loading-state">
        <span>{{ t('importDb.loading') }}</span>
      </div>
      <div v-else-if="filteredItems.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-title">{{ t('importDb.emptyTitle') }}</div>
        <div class="empty-text">{{ t('importDb.emptyText') }}</div>
      </div>
      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('importDb.table.surname') }}</th>
              <th>{{ t('importDb.table.firstName') }}</th>
              <th>{{ t('importDb.table.parentEmail') }}</th>
              <th>{{ t('importDb.table.phone') }}</th>
              <th>{{ t('importDb.table.nickname') }}</th>
              <th>{{ t('importDb.table.subscriptionAmount') }}</th>
              <th>{{ t('importDb.table.subscriptionEndDate') }}</th>
              <th>{{ t('importDb.table.contractOldNew') }}</th>
              <th>{{ t('importDb.table.balanceOverpayment') }}</th>
              <th>{{ t('importDb.table.discount') }}</th>
              <th>
                <button class="th-sort-btn" type="button" @click="toggleSort('group_external_id')">
                  {{ t('importDb.table.groupExternalId') }}
                  <span class="sort-indicator">{{ getSortIndicator('group_external_id') }}</span>
                </button>
              </th>
              <th>
                <button class="th-sort-btn" type="button" @click="toggleSort('teacher_external_id')">
                  {{ t('importDb.table.teacherExternalId') }}
                  <span class="sort-indicator">{{ getSortIndicator('teacher_external_id') }}</span>
                </button>
              </th>
              <th>
                <button class="th-sort-btn" type="button" @click="toggleSort('paid')">
                  {{ t('importDb.table.paid') }}
                  <span class="sort-indicator">{{ getSortIndicator('paid') }}</span>
                </button>
              </th>
              <th>
                <button class="th-sort-btn" type="button" @click="toggleSort('paid_months')">
                  {{ t('importDb.table.paidMonths') }}
                  <span class="sort-indicator">{{ getSortIndicator('paid_months') }}</span>
                </button>
              </th>
              <th>{{ t('importDb.table.isSend') }}</th>
              <th>{{ t('importDb.table.isDone') }}</th>
              <th>{{ t('importDb.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id">
              <td>{{ item.surname }}</td>
              <td>{{ item.first_name }}</td>
              <td>
                <input
                  v-if="editingRowId === item.id"
                  v-model="editForm.parent_email"
                  class="cell-input"
                  type="email"
                />
                <span v-else>{{ item.parent_email }}</span>
              </td>
              <td>{{ item.phone }}</td>
              <td>
                <input
                  v-if="editingRowId === item.id"
                  v-model="editForm.nickname"
                  class="cell-input"
                  type="text"
                />
                <span v-else>{{ item.nickname || '—' }}</span>
              </td>
              <td class="text-right">{{ formatAmount(item.subscription_amount) }}</td>
              <td>{{ formatDate(item.subscription_end_date) }}</td>
              <td>{{ item.contract_old_new }}</td>
              <td class="text-right">
                <input
                  v-if="editingRowId === item.id"
                  v-model="editForm.balance_overpayment"
                  class="cell-input cell-input--numeric"
                  type="text"
                  inputmode="decimal"
                />
                <span v-else>{{ formatAmount(item.balance_overpayment) }}</span>
              </td>
              <td class="text-right">
                <input
                  v-if="editingRowId === item.id"
                  v-model="editForm.discount"
                  class="cell-input cell-input--numeric"
                  type="text"
                  inputmode="decimal"
                />
               <span v-else>{{ formatAmount(item.discount) }}</span>
               </td>
               <td>{{ item.group_external_id || '—' }}</td>
               <td>{{ item.teacher_external_id || '—' }}</td>
               <td>
                 <span v-if="isTruthy(item.paid ?? item.is_paid)" class="badge badge-success">{{ t('importDb.paidStatus.paid') }}</span>
                <span v-else class="badge badge-warning">{{ t('importDb.paidStatus.unpaid') }}</span>
              </td>
              <td>{{ formatPaidMonths(item.paid_months) }}</td>
              <td>
                <span v-if="item.is_send" class="badge badge-success">{{ t('common.yes') }}</span>
                <span v-else class="badge badge-warning">{{ t('common.no') }}</span>
              </td>
              <td>
                <span v-if="item.is_done" class="badge badge-success">{{ t('common.yes') }}</span>
                <span v-else class="badge badge-warning">{{ t('common.no') }}</span>
              </td>
              <td class="actions-cell">
                <button
                  v-if="canResendImportDbInvitation"
                  class="action-icon-btn action-icon-btn--primary"
                  type="button"
                  :title="t('importDb.actions.resendInvitation')"
                  :aria-label="t('importDb.actions.resendInvitation')"
                  @click="openResendConfirm(item.id)"
                  :disabled="store.isLoading"
                >
                  ✉️
                </button>
                <button
                  v-if="canUpdateImportDb && editingRowId !== item.id"
                  class="action-icon-btn action-icon-btn--neutral"
                  type="button"
                  :title="t('importDb.actions.edit')"
                  :aria-label="t('importDb.actions.edit')"
                  @click="startEdit(item)"
                  :disabled="store.isLoading"
                >
                  ✏️
                </button>
                <button
                  v-if="canUpdateImportDb && editingRowId === item.id"
                  class="action-icon-btn action-icon-btn--success"
                  type="button"
                  :title="t('common.save')"
                  :aria-label="t('common.save')"
                  @click="saveEdit(item.id)"
                  :disabled="store.isLoading"
                >
                  ✅
                </button>
                <button
                  v-if="canUpdateImportDb && editingRowId === item.id"
                  class="action-icon-btn action-icon-btn--neutral"
                  type="button"
                  :title="t('common.cancel')"
                  :aria-label="t('common.cancel')"
                  @click="cancelEdit"
                  :disabled="store.isLoading"
                >
                  ✖️
                </button>
                <button
                  v-if="canDeleteImportDb"
                  class="action-icon-btn action-icon-btn--danger"
                  type="button"
                  :title="t('importDb.actions.delete')"
                  :aria-label="t('importDb.actions.delete')"
                  @click="deleteItem(item.id)"
                  :disabled="store.isLoading"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- CONFIRMATION MODAL -->
    <div v-if="resendConfirmId" class="modal-overlay" @click.self="resendConfirmId = null">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ t('common.confirm') }}</h3>
          <button class="modal-close" @click="resendConfirmId = null">✕</button>
        </div>
        <div class="modal-body">
          <p>{{ t('importDb.actions.resendConfirm') }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="resendConfirmId = null">{{ t('common.no') }}</button>
          <button class="btn btn-primary" @click="confirmResend" :disabled="store.isLoading">
            {{ t('common.yes') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="deleteConfirmId" class="modal-overlay" @click.self="deleteConfirmId = null">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ t('common.confirm') }}</h3>
          <button class="modal-close" @click="deleteConfirmId = null">✕</button>
        </div>
        <div class="modal-body">
          <p>{{ t('importDb.actions.deleteConfirm') }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="deleteConfirmId = null">{{ t('common.cancel') }}</button>
          <button class="btn btn-danger" @click="confirmDelete" :disabled="store.isLoading">
            {{ store.isLoading ? t('common.loading') : t('importDb.actions.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useImportDbStore } from '../../stores/importDb.store';
import { useNotificationStore } from '../../stores/notification.store';
import type { RecruitmentBackend } from '../../api/http';
import { useCanAccess } from '../../composables/useCanAccess';

const { t } = useI18n();
const route = useRoute();
const store = useImportDbStore();
const notificationStore = useNotificationStore();
const { canEdit } = useCanAccess();

const searchQ = ref('');
const teacherSearchQ = ref('');
const groupSearchQ = ref('');
const selectedTeacher = ref('');
const deleteConfirmId = ref<number | string | null>(null);
const resendConfirmId = ref<number | string | null>(null);
const editingRowId = ref<number | string | null>(null);
const editForm = ref({
  parent_email: '',
  nickname: '',
  balance_overpayment: '',
  discount: '',
});

const backend = computed(() => {
  const meta = route.meta as any;
  return (meta?.recruitmentBackend ?? 'default') as RecruitmentBackend;
});

type SortField = 'paid' | 'group_external_id' | 'teacher_external_id' | 'paid_months';
type SortDirection = 'asc' | 'desc';

const sortBy = ref<SortField>('paid');
const sortDir = ref<SortDirection>('desc');

const availableTeachers = computed(() => {
  return [...new Set(
    store.items
      .map(item => String(item.teacher_external_id ?? '').trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));
});

const filteredItems = computed(() => {
  const query = searchQ.value.trim().toLowerCase();
  const teacherQuery = teacherSearchQ.value.trim().toLowerCase();
  const groupQuery = groupSearchQ.value.trim().toLowerCase();
  const teacherFilter = selectedTeacher.value.trim().toLowerCase();

  const filtered = store.items.filter(item => {
    const teacherValue = String(item.teacher_external_id ?? '').toLowerCase();
    const groupValue = String(item.group_external_id ?? '').toLowerCase();

    const matchGlobal = !query ||
      item.surname.toLowerCase().includes(query) ||
      item.first_name.toLowerCase().includes(query) ||
      item.parent_email.toLowerCase().includes(query) ||
      item.phone.includes(query) ||
      teacherValue.includes(query) ||
      groupValue.includes(query);

    const matchTeacherSearch = !teacherQuery || teacherValue.includes(teacherQuery);
    const matchGroupSearch = !groupQuery || groupValue.includes(groupQuery);
    const matchTeacherFilter = !teacherFilter || teacherValue === teacherFilter;

    return matchGlobal && matchTeacherSearch && matchGroupSearch && matchTeacherFilter;
  });

  return [...filtered].sort((a, b) => compareBySort(a, b));
});

const canUpdateImportDb = computed(() => canEdit('import-db-update'));
const canDeleteImportDb = computed(() => canEdit('import-db-delete'));
const canResendImportDbInvitation = computed(() => canEdit('import-db-resend-invitation'));

function formatAmount(value: number | string): string {
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return num.toFixed(2);
}

function isTruthy(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return ['1', 'true', 'yes', 'paid'].includes(value.trim().toLowerCase());
  return false;
}

function compareBySort(a: any, b: any): number {
  const direction = sortDir.value === 'asc' ? 1 : -1;

  if (sortBy.value === 'paid') {
    const left = Number(isTruthy(a.paid ?? a.is_paid));
    const right = Number(isTruthy(b.paid ?? b.is_paid));
    return (left - right) * direction;
  }

  if (sortBy.value === 'paid_months') {
    const left = Number(a.paid_months ?? 0);
    const right = Number(b.paid_months ?? 0);
    return (left - right) * direction;
  }

  const left = String(a[sortBy.value] ?? '').toLowerCase();
  const right = String(b[sortBy.value] ?? '').toLowerCase();
  return left.localeCompare(right) * direction;
}

function toggleSort(field: SortField) {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
    return;
  }
  sortBy.value = field;
  sortDir.value = 'asc';
}

function getSortIndicator(field: SortField): string {
  if (sortBy.value !== field) return '↕';
  return sortDir.value === 'asc' ? '↑' : '↓';
}

function formatDate(value?: string | null): string {
  if (!value) return '—';
  return String(value);
}

function formatPaidMonths(value?: number | null): string {
  const months = Number(value ?? 0);
  if (!Number.isFinite(months) || months <= 0) return '0';
  return `${months} ${t('importDb.paidMonthsSuffix')}`;
}

function applyFilters() {
  // Filter is applied via computed property
}

async function loadData() {
  await store.fetchImportDbList(1, backend.value);
}

async function resendInvitation(id: number | string) {
  if (!canResendImportDbInvitation.value) {
    notificationStore.addToast(t('common.error'), 'warning');
    return;
  }

  try {
    const response = await store.resendInvitation(id) as any;
    const successMessage = String(response?.message ?? t('importDb.actions.resendSuccess'));
    notificationStore.addToast(successMessage, 'success');
  } catch (error: any) {
    const errorMessage = String(error?.response?.data?.message ?? error?.message ?? t('common.error'));
    notificationStore.addToast(errorMessage, 'error');
  }
}

function openResendConfirm(id: number | string) {
  resendConfirmId.value = id;
}

async function confirmResend() {
  if (!resendConfirmId.value) return;

  const id = resendConfirmId.value;
  resendConfirmId.value = null;
  await resendInvitation(id);
}

function deleteItem(id: number | string) {
  deleteConfirmId.value = id;
}

function startEdit(item: {
  id: number | string;
  parent_email: string;
  nickname?: string;
  balance_overpayment: number | string;
  discount: number | string;
}) {
  editingRowId.value = item.id;
  editForm.value = {
    parent_email: item.parent_email ?? '',
    nickname: item.nickname ?? '',
    balance_overpayment: String(item.balance_overpayment ?? ''),
    discount: String(item.discount ?? ''),
  };
}

function cancelEdit() {
  editingRowId.value = null;
  editForm.value = { parent_email: '', nickname: '', balance_overpayment: '', discount: '' };
}

function parseNumericField(rawValue: string, label: string): number {
  const normalized = rawValue.trim().replace(',', '.');
  const num = Number(normalized);
  if (!normalized || Number.isNaN(num)) {
    throw new Error(`Поле "${label}" должно быть числом`);
  }
  return num;
}

async function saveEdit(id: number | string) {
  if (!canUpdateImportDb.value) {
    notificationStore.addToast(t('common.error'), 'warning');
    return;
  }

  try {
    const balanceOverpayment = parseNumericField(editForm.value.balance_overpayment, t('importDb.table.balanceOverpayment'));
    const discount = parseNumericField(editForm.value.discount, t('importDb.table.discount'));

    await store.updateImportDbItem(id, {
      parent_email: editForm.value.parent_email.trim(),
      nickname: editForm.value.nickname.trim(),
      balance_overpayment: balanceOverpayment,
      discount,
    });
    notificationStore.addToast(t('importDb.actions.updateSuccess'), 'success');
    cancelEdit();
  } catch (error: any) {
    notificationStore.addToast(error?.message || t('common.error'), 'error');
  }
}

async function confirmDelete() {
  if (!deleteConfirmId.value) return;

  if (!canDeleteImportDb.value) {
    notificationStore.addToast(t('common.error'), 'warning');
    deleteConfirmId.value = null;
    return;
  }

  const id = deleteConfirmId.value;
  deleteConfirmId.value = null;

  try {
    await store.deleteImportDbItem(id);
    notificationStore.addToast(t('importDb.actions.deleteSuccess'), 'success');
  } catch (error: any) {
    notificationStore.addToast(error?.message || t('common.error'), 'error');
  }
}

async function onExport() {
  if (!filteredItems.value.length) return;

  const { exportTableToExcel } = await import('../../utils/excelExport');
  const dateStr = new Date().toISOString().split('T')[0];

  exportTableToExcel({
    fileName: `import-db-${dateStr}`,
    sheetName: 'Import DB',
    format: 'xlsx',
    rows: [
      [
        t('importDb.table.surname'),
        t('importDb.table.firstName'),
        t('importDb.table.parentEmail'),
        t('importDb.table.phone'),
        t('importDb.table.nickname'),
        t('importDb.table.subscriptionAmount'),
        t('importDb.table.subscriptionEndDate'),
        t('importDb.table.contractOldNew'),
        t('importDb.table.balanceOverpayment'),
        t('importDb.table.discount'),
        t('importDb.table.groupExternalId'),
        t('importDb.table.teacherExternalId'),
        t('importDb.table.paid'),
        t('importDb.table.paidMonths'),
        t('importDb.table.isSend'),
        t('importDb.table.isDone'),
      ],
      ...filteredItems.value.map((item) => [
        item.surname,
        item.first_name,
        item.parent_email,
        item.phone,
        item.nickname || '—',
        Number(item.subscription_amount),
        formatDate(item.subscription_end_date),
        item.contract_old_new,
        Number(item.balance_overpayment),
        Number(item.discount),
        item.group_external_id || '—',
        item.teacher_external_id || '—',
        isTruthy(item.paid ?? item.is_paid) ? t('importDb.paidStatus.paid') : t('importDb.paidStatus.unpaid'),
        Number(item.paid_months ?? 0),
        item.is_send ? t('common.yes') : t('common.no'),
        item.is_done ? t('common.yes') : t('common.no'),
      ]),
    ],
    columnWidths: [
      { wch: 18 },
      { wch: 18 },
      { wch: 28 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 18 },
      { wch: 16 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
    ],
  });
}

watch(() => backend.value, () => {
  loadData();
}, { immediate: false });

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.import-db-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
}

.idb-content {
  padding: 24px 28px;
  flex: 1;
  overflow-y: auto;
}

.idb-content::-webkit-scrollbar {
  width: 4px;
}

.idb-content::-webkit-scrollbar-thumb {
  background: rgba(79, 110, 247, 0.2);
  border-radius: 2px;
}

.idb-actions-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.teacher-filter {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  color: var(--app-text-main);
  font-size: 13px;
  min-width: 220px;
  padding: 8px 12px;
}

.teacher-filter:focus {
  outline: none;
  border-color: var(--app-border-hi);
  box-shadow: 0 0 12px rgba(79, 110, 247, 0.1);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 7px 12px;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: var(--app-border-hi);
  box-shadow: 0 0 12px rgba(79, 110, 247, 0.1);
}

.search-icon {
  color: var(--app-text-dim);
  font-size: 14px;
}

.search-box input {
  background: none;
  border: none;
  outline: none;
  color: var(--app-text-main);
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  width: 240px;
  flex: 1;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: #5b6ef5;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4a5dd4;
}

.btn-ghost {
  background: var(--app-surface);
  color: var(--app-text-main);
  border: 1px solid var(--app-border);
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(79, 110, 247, 0.05);
}

.btn-danger {
  background: #f56565;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #e53e3e;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: var(--app-card);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--app-border);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: currentColor;
}

.stat-card.blue { color: #5b6ef5; }
.stat-card.green { color: #48bb78; }
.stat-card.cyan { color: #38b2ac; }
.stat-card.amber { color: #ed8936; }

.stat-label {
  font-size: 12px;
  color: var(--app-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--app-text-main);
  margin-bottom: 6px;
}

.stat-sub {
  font-size: 13px;
  color: var(--app-text-dim);
}

.stat-icon {
  position: absolute;
  bottom: 10px;
  right: 15px;
  font-size: 36px;
  opacity: 0.15;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.toolbar-left {
  flex: 1;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--app-text-main);
}

.section-count {
  color: var(--app-text-dim);
  font-size: 14px;
  margin-left: 8px;
}

.toolbar-right {
  text-align: right;
}

.pagination-info {
  font-size: 12px;
  color: var(--app-text-dim);
}

.table-container {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 14px;
  overflow-x: auto;
  overflow-y: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 1200px;
}

.data-table thead {
  background: var(--app-surface);
  border-bottom: 1px solid var(--app-border);
}

.data-table th {
  padding: 11px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--app-text-dim);
  white-space: nowrap;
}

.th-sort-btn {
  align-items: center;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  gap: 6px;
  letter-spacing: inherit;
  padding: 0;
  text-transform: inherit;
}

.sort-indicator {
  color: var(--app-text-dim);
  font-size: 11px;
}

.data-table td {
  padding: 11px 12px;
  border-bottom: 1px solid rgba(100, 120, 255, 0.07);
  color: var(--app-text-main);
  font-size: 13px;
}

.data-table tbody tr:hover {
  background: rgba(79, 110, 247, 0.04);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.text-right {
  text-align: right;
}

.cell-input {
  width: 100%;
  min-width: 150px;
  border: 1px solid var(--app-border);
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 13px;
  background: var(--app-surface);
  color: var(--app-text-main);
  font-family: inherit;
}

.cell-input--numeric {
  min-width: 100px;
  text-align: right;
}

.actions-cell {
  display: flex;
  gap: 6px;
  white-space: nowrap;
}

.action-icon-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.action-icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-icon-btn--primary {
  background: #5b6ef5;
}

.action-icon-btn--primary:hover:not(:disabled) {
  background: #4a5dd4;
}

.action-icon-btn--danger {
  background: #f56565;
}

.action-icon-btn--danger:hover:not(:disabled) {
  background: #e53e3e;
}

.action-icon-btn--neutral {
  background: rgba(100, 120, 255, 0.1);
}

.action-icon-btn--neutral:hover:not(:disabled) {
  background: rgba(79, 110, 247, 0.15);
}

.action-icon-btn--success {
  background: rgba(16, 185, 129, 0.2);
}

.action-icon-btn--success:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.35);
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.badge-success {
  background: #c6f6d5;
  color: #22543d;
}

.badge-warning {
  background: #feebc8;
  color: #7c2d12;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  color: var(--app-text-dim);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--app-text-main);
  margin-bottom: 8px;
}

.empty-text {
  font-size: 14px;
  color: var(--app-text-dim);
}

/* MODAL STYLES */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--app-card);
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--app-border);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--app-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--app-text-main);
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--app-text-dim);
  padding: 0;
}

.modal-body {
  padding: 20px;
  color: var(--app-text-main);
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid var(--app-border);
}
</style>

