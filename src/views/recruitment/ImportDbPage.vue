<template>
  <div class="import-db-page">
    <div class="idb-content">
      <!-- PAGE ACTIONS ROW -->
      <div class="idb-actions-row">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input v-model="searchQ" :placeholder="t('importDb.searchPlaceholder')" @input="applyFilters" />
        </div>
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
              <th>{{ t('importDb.table.contractOldNew') }}</th>
              <th>{{ t('importDb.table.balanceOverpayment') }}</th>
              <th>{{ t('importDb.table.discount') }}</th>
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
              <td>{{ item.contract_old_new }}</td>
              <td class="text-right">{{ formatAmount(item.balance_overpayment) }}</td>
              <td class="text-right">{{ formatAmount(item.discount) }}</td>
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
                  v-if="editingRowId !== item.id"
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
                  v-else
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
                  v-if="editingRowId === item.id"
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

const { t } = useI18n();
const route = useRoute();
const store = useImportDbStore();
const notificationStore = useNotificationStore();

const searchQ = ref('');
const deleteConfirmId = ref<number | string | null>(null);
const resendConfirmId = ref<number | string | null>(null);
const editingRowId = ref<number | string | null>(null);
const editForm = ref({
  parent_email: '',
  nickname: '',
});

const backend = computed(() => {
  const meta = route.meta as any;
  return (meta?.recruitmentBackend ?? 'default') as RecruitmentBackend;
});

const filteredItems = computed(() => {
  const query = searchQ.value.toLowerCase();
  if (!query) return store.items;

  return store.items.filter(item =>
    item.surname.toLowerCase().includes(query) ||
    item.first_name.toLowerCase().includes(query) ||
    item.parent_email.toLowerCase().includes(query) ||
    item.phone.includes(query)
  );
});

function formatAmount(value: number | string): string {
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return num.toFixed(2);
}

function applyFilters() {
  // Filter is applied via computed property
}

async function loadData() {
  await store.fetchImportDbList(1, backend.value);
}

async function resendInvitation(id: number | string) {
  try {
    await store.resendInvitation(id);
    notificationStore.addToast(t('importDb.actions.resendSuccess'), 'success');
  } catch (error: any) {
    notificationStore.addToast(error?.message || t('common.error'), 'error');
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

function startEdit(item: { id: number | string; parent_email: string; nickname?: string }) {
  editingRowId.value = item.id;
  editForm.value = {
    parent_email: item.parent_email ?? '',
    nickname: item.nickname ?? '',
  };
}

function cancelEdit() {
  editingRowId.value = null;
  editForm.value = { parent_email: '', nickname: '' };
}

async function saveEdit(id: number | string) {
  try {
    await store.updateImportDbItem(id, {
      parent_email: editForm.value.parent_email.trim(),
      nickname: editForm.value.nickname.trim(),
    });
    notificationStore.addToast(t('importDb.actions.updateSuccess'), 'success');
    cancelEdit();
  } catch (error: any) {
    notificationStore.addToast(error?.message || t('common.error'), 'error');
  }
}

async function confirmDelete() {
  if (!deleteConfirmId.value) return;

  const id = deleteConfirmId.value;
  deleteConfirmId.value = null;

  try {
    await store.deleteImportDbItem(id);
    notificationStore.addToast(t('importDb.actions.deleteSuccess'), 'success');
  } catch (error: any) {
    notificationStore.addToast(error?.message || t('common.error'), 'error');
  }
}

function onExport() {
  const headers = [
    'Фамилия', 'Имя', 'Email родителя', 'Телефон', 'Никнейм',
    'Сумма подписки', 'Тип контракта', 'Переплата', 'Скидка', 'Отправлено', 'Завершено'
  ];

  const rows = filteredItems.value.map(item => [
    item.surname,
    item.first_name,
    item.parent_email,
    item.phone,
    item.nickname || '',
    item.subscription_amount,
    item.contract_old_new,
    item.balance_overpayment,
    item.discount,
    item.is_send ? 'Да' : 'Нет',
    item.is_done ? 'Да' : 'Нет'
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `import-db-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
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
  background: linear-gradient(to bottom right, #f8f9fa, #ffffff);
  padding: 20px;
}

.idb-content {
  max-width: 1400px;
  margin: 0 auto;
}

.idb-actions-row {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px 12px;
}

.search-icon {
  font-size: 18px;
  margin-right: 8px;
  color: #666;
}

.search-box input {
  border: none;
  outline: none;
  font-size: 14px;
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
  background: white;
  color: #333;
  border: 1px solid #e0e0e0;
}

.btn-ghost:hover:not(:disabled) {
  background: #f5f5f5;
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
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e0e0e0;
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
  opacity: 0.2;
}

.stat-card.blue { color: #5b6ef5; }
.stat-card.green { color: #48bb78; }
.stat-card.cyan { color: #38b2ac; }
.stat-card.amber { color: #ed8936; }

.stat-label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.stat-sub {
  font-size: 13px;
  color: #999;
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
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
}

.toolbar-left {
  flex: 1;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-count {
  color: #999;
  font-size: 14px;
  margin-left: 8px;
}

.toolbar-right {
  text-align: right;
}

.pagination-info {
  font-size: 12px;
  color: #999;
}

.table-container {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead {
  background: #f9f9f9;
  border-bottom: 2px solid #e0e0e0;
}

.data-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  color: #555;
}

.data-table tbody tr:hover {
  background: #f9f9f9;
}

.text-right {
  text-align: right;
}

.cell-input {
  width: 100%;
  min-width: 150px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 13px;
}

.actions-cell {
  display: flex;
  gap: 8px;
  white-space: nowrap;
}

.action-icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
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
  background: #e5e7eb;
}

.action-icon-btn--neutral:hover:not(:disabled) {
  background: #d1d5db;
}

.action-icon-btn--success {
  background: #48bb78;
}

.action-icon-btn--success:hover:not(:disabled) {
  background: #38a169;
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
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

/* MODAL STYLES */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
}

.modal-body {
  padding: 20px;
  color: #555;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}
</style>

