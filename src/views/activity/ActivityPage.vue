<template>
  <div class="ap-page">
    <!-- Header -->
    <div class="ap-header">
      <div class="ap-header-left">
        <h1 class="ap-title">{{ $t('activity.pageTitle') }}</h1>
        <p class="ap-subtitle">{{ $t('activity.pageSubtitle') }}</p>
      </div>
      <div class="ap-header-right">
        <button class="ap-refresh-btn" :disabled="store.isLoading" @click="loadData">
          <span :class="{ 'spin': store.isLoading }">↻</span>
          {{ $t('common.refresh') }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="ap-filters">
      <!-- Search -->
      <div class="ap-filter-search">
        <span class="ap-filter-icon">🔍</span>
        <input
          v-model="filters.search"
          class="ap-filter-input"
          type="text"
          :placeholder="$t('activity.searchPlaceholder')"
          @input="onFilterChange"
        />
        <button v-if="filters.search" class="ap-clear-btn" @click="clearSearch">✕</button>
      </div>

      <!-- Entity type -->
      <select v-model="filters.entity_type" class="ap-filter-select" @change="onFilterChange">
        <option value="">{{ $t('activity.filterAll') }}</option>
        <option value="student">👤 {{ $t('activity.filterStudents') }}</option>
        <option value="group">🎓 {{ $t('activity.filterGroups') }}</option>
        <option value="payment">💰 {{ $t('activity.filterPayments') }}</option>
        <option value="lead">📋 {{ $t('activity.filterLeads') }}</option>
        <option value="teacher">👨‍🏫 {{ $t('activity.filterTeachers') }}</option>
      </select>

      <!-- Date from -->
      <input
        v-model="filters.date_from"
        type="date"
        class="ap-filter-select"
        :placeholder="$t('activity.dateFrom')"
        @change="onFilterChange"
      />

      <!-- Date to -->
      <input
        v-model="filters.date_to"
        type="date"
        class="ap-filter-select"
        :placeholder="$t('activity.dateTo')"
        @change="onFilterChange"
      />

      <!-- Reset -->
      <button v-if="hasActiveFilters" class="ap-reset-btn" @click="resetFilters">
        {{ $t('common.reset') }}
      </button>
    </div>

    <!-- Stats bar -->
    <div class="ap-stats-bar">
      <span class="ap-stats-total">
        {{ $t('activity.totalRecords', { n: store.total }) }}
      </span>
      <div class="ap-stats-legend">
        <span class="ap-legend-item success">
          <span class="ap-legend-dot"></span>{{ $t('activity.legendSuccess') }}
        </span>
        <span class="ap-legend-item warning">
          <span class="ap-legend-dot"></span>{{ $t('activity.legendWarning') }}
        </span>
        <span class="ap-legend-item info">
          <span class="ap-legend-dot"></span>{{ $t('activity.legendInfo') }}
        </span>
        <span class="ap-legend-item error">
          <span class="ap-legend-dot"></span>{{ $t('activity.legendError') }}
        </span>
      </div>
    </div>

    <!-- Activity Table -->
    <div class="ap-card">
      <div v-if="store.isLoading" class="ap-loading-rows">
        <div class="ap-loading-row" v-for="n in 8" :key="n"></div>
      </div>

      <div v-else-if="!store.logs.length" class="ap-empty">
        <div class="ap-empty-icon">📋</div>
        <div class="ap-empty-title">{{ $t('activity.emptyTitle') }}</div>
        <div class="ap-empty-hint">{{ $t('activity.emptyHint') }}</div>
      </div>

      <table v-else class="ap-table">
        <thead>
          <tr>
            <th>{{ $t('activity.colDateTime') }}</th>
            <th>{{ $t('activity.colAction') }}</th>
            <th>{{ $t('activity.colEntity') }}</th>
            <th>{{ $t('activity.colActor') }}</th>
            <th>{{ $t('activity.colStatus') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="log in store.logs"
            :key="log.id"
            class="ap-row"
            :class="`ap-row--${log.status}`"
          >
            <!-- Date & Time -->
            <td class="ap-cell-date">
              <div class="ap-date">{{ formatDate(log.created_at) }}</div>
              <div class="ap-time">{{ formatTime(log.created_at) }}</div>
            </td>

            <!-- Action -->
            <td class="ap-cell-action">
              <div class="ap-action-wrap">
                <span class="ap-action-icon">{{ getActivityMeta(log.action_type).icon }}</span>
                <span class="ap-action-desc">{{ log.description }}</span>
              </div>
            </td>

            <!-- Entity -->
            <td class="ap-cell-entity">
              <span v-if="log.entity_name" class="ap-entity-badge" :class="`ap-entity--${log.entity_type}`">
                {{ entityIcon(log.entity_type) }} {{ log.entity_name }}
              </span>
              <span v-else class="ap-entity-empty">—</span>
            </td>

            <!-- Actor -->
            <td class="ap-cell-actor">
              <div class="ap-actor">
                <div class="ap-actor-avatar">{{ actorInitials(log.actor_name) }}</div>
                <span class="ap-actor-name">{{ log.actor_name }}</span>
              </div>
            </td>

            <!-- Status -->
            <td class="ap-cell-status">
              <span class="ap-status-badge" :class="`ap-status--${log.status}`">
                {{ statusLabel(log.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="store.lastPage > 1" class="ap-pagination">
        <button
          class="ap-pag-btn"
          :disabled="store.currentPage <= 1"
          @click="goToPage(store.currentPage - 1)"
        >‹</button>
        <span class="ap-pag-info">
          {{ store.currentPage }} / {{ store.lastPage }}
        </span>
        <button
          class="ap-pag-btn"
          :disabled="store.currentPage >= store.lastPage"
          @click="goToPage(store.currentPage + 1)"
        >›</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActivityStore, getActivityMeta, formatDateTime } from '../../stores/activity.store'
import type { ActivityEntityType, ActivityStatus } from '../../stores/activity.store'

const { t } = useI18n()
const store = useActivityStore()

const filters = ref({
  search: '',
  entity_type: '' as ActivityEntityType | '',
  date_from: '',
  date_to: '',
})

const hasActiveFilters = computed(() =>
  !!(filters.value.search || filters.value.entity_type || filters.value.date_from || filters.value.date_to)
)

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onFilterChange() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadData(), 350)
}

function clearSearch() {
  filters.value.search = ''
  loadData()
}

function resetFilters() {
  filters.value = { search: '', entity_type: '', date_from: '', date_to: '' }
  loadData()
}

async function loadData() {
  await store.fetchList({
    page: 1,
    per_page: 25,
    search: filters.value.search,
    entity_type: filters.value.entity_type,
    date_from: filters.value.date_from,
    date_to: filters.value.date_to,
  })
}

async function goToPage(page: number) {
  await store.fetchList({ page })
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function entityIcon(type: ActivityEntityType): string {
  const icons: Record<ActivityEntityType, string> = {
    student: '👤', group: '🎓', payment: '💰', lead: '📋', teacher: '👨‍🏫', settings: '⚙️',
  }
  return icons[type] ?? '📌'
}

function actorInitials(name: string): string {
  if (!name || name === 'Система') return '⚙'
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

function statusLabel(status: ActivityStatus): string {
  const labels: Record<ActivityStatus, string> = {
    success: t('activity.statusSuccess'),
    info: t('activity.statusInfo'),
    warning: t('activity.statusWarning'),
    error: t('activity.statusError'),
  }
  return labels[status] ?? status
}

onMounted(() => loadData())
</script>

<style scoped>
.ap-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.ap-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}
.ap-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--app-text-main);
  margin: 0 0 4px;
}
.ap-subtitle {
  font-size: 13px;
  color: var(--app-text-dim);
  margin: 0;
}
.ap-refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text-main);
  cursor: pointer;
  transition: all 0.2s;
}
.ap-refresh-btn:hover { background: var(--app-surface-hi); }
.ap-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.spin { display: inline-block; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Filters */
.ap-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}
.ap-filter-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  padding: 0 12px;
  flex: 1;
  min-width: 200px;
  max-width: 360px;
}
.ap-filter-icon { font-size: 14px; opacity: 0.5; }
.ap-filter-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 9px 0;
  font-size: 13px;
  color: var(--app-text-main);
  outline: none;
}
.ap-filter-input::placeholder { color: var(--app-text-dim); }
.ap-clear-btn {
  background: none;
  border: none;
  color: var(--app-text-dim);
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
}
.ap-filter-select {
  padding: 9px 12px;
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  font-size: 13px;
  color: var(--app-text-main);
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}
.ap-filter-select:focus { border-color: var(--app-border-hi); }
.ap-reset-btn {
  padding: 9px 16px;
  background: transparent;
  border: 1px solid var(--app-border);
  border-radius: 10px;
  font-size: 12px;
  color: var(--app-text-dim);
  cursor: pointer;
  transition: all 0.2s;
}
.ap-reset-btn:hover { border-color: #ef4444; color: #ef4444; }

/* Stats bar */
.ap-stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}
.ap-stats-total {
  font-size: 12px;
  font-weight: 700;
  color: var(--app-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.ap-stats-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.ap-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--app-text-dim);
  font-weight: 600;
}
.ap-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.ap-legend-item.success .ap-legend-dot { background: #10b981; }
.ap-legend-item.warning .ap-legend-dot { background: #f59e0b; }
.ap-legend-item.info .ap-legend-dot { background: #4f6ef7; }
.ap-legend-item.error .ap-legend-dot { background: #ef4444; }

/* Card */
.ap-card {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 16px;
  overflow: hidden;
}

/* Loading rows */
.ap-loading-rows { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.ap-loading-row {
  height: 44px;
  border-radius: 8px;
  background: linear-gradient(90deg, var(--app-surface) 25%, var(--app-border) 50%, var(--app-surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Empty */
.ap-empty {
  text-align: center;
  padding: 60px 20px;
}
.ap-empty-icon { font-size: 40px; opacity: 0.3; margin-bottom: 12px; }
.ap-empty-title { font-size: 15px; font-weight: 700; color: var(--app-text-main); margin-bottom: 6px; }
.ap-empty-hint { font-size: 13px; color: var(--app-text-dim); }

/* Table */
.ap-table {
  width: 100%;
  border-collapse: collapse;
}
.ap-table thead tr {
  background: var(--app-surface);
  border-bottom: 1px solid var(--app-border);
}
.ap-table th {
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 700;
  color: var(--app-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;
  white-space: nowrap;
}
.ap-row {
  border-bottom: 1px solid var(--app-border-faint);
  transition: background 0.15s;
}
.ap-row:last-child { border-bottom: none; }
.ap-row:hover { background: var(--app-surface); }
.ap-row--error { border-left: 3px solid #ef4444; }
.ap-row--warning { border-left: 3px solid #f59e0b; }
.ap-row--success { border-left: 3px solid #10b981; }
.ap-row--info { border-left: 3px solid #4f6ef7; }

.ap-table td {
  padding: 12px 16px;
  vertical-align: middle;
}

/* Cell: date */
.ap-cell-date { min-width: 90px; }
.ap-date { font-size: 12px; font-weight: 700; color: var(--app-text-main); }
.ap-time { font-size: 11px; color: var(--app-text-dim); }

/* Cell: action */
.ap-cell-action { min-width: 240px; }
.ap-action-wrap { display: flex; align-items: flex-start; gap: 8px; }
.ap-action-icon { font-size: 16px; flex-shrink: 0; line-height: 1.4; }
.ap-action-desc { font-size: 13px; color: var(--app-text-main); font-weight: 500; line-height: 1.4; }

/* Cell: entity */
.ap-cell-entity { min-width: 140px; }
.ap-entity-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  white-space: nowrap;
}
.ap-entity--student { background: rgba(16,185,129,0.1); color: #10b981; }
.ap-entity--group   { background: rgba(139,92,246,0.1); color: #8b5cf6; }
.ap-entity--payment { background: rgba(245,158,11,0.1); color: #f59e0b; }
.ap-entity--lead    { background: rgba(79,110,247,0.1); color: #4f6ef7; }
.ap-entity--teacher { background: rgba(20,184,166,0.1); color: #14b8a6; }
.ap-entity--settings{ background: var(--app-surface); color: var(--app-text-dim); }
.ap-entity-empty { color: var(--app-text-dim); font-size: 13px; }

/* Cell: actor */
.ap-cell-actor { min-width: 140px; }
.ap-actor { display: flex; align-items: center; gap: 8px; }
.ap-actor-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: var(--app-text-main);
  flex-shrink: 0;
}
.ap-actor-name { font-size: 12px; color: var(--app-text-main); font-weight: 500; }

/* Cell: status */
.ap-cell-status { min-width: 100px; }
.ap-status-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ap-status--success { background: rgba(16,185,129,0.12); color: #10b981; }
.ap-status--info    { background: rgba(79,110,247,0.12);  color: #4f6ef7; }
.ap-status--warning { background: rgba(245,158,11,0.12);  color: #f59e0b; }
.ap-status--error   { background: rgba(239,68,68,0.12);   color: #ef4444; }

/* Pagination */
.ap-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid var(--app-border-faint);
}
.ap-pag-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text-main);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.ap-pag-btn:hover:not(:disabled) { background: var(--app-surface-hi); }
.ap-pag-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.ap-pag-info { font-size: 13px; font-weight: 600; color: var(--app-text-dim); }

/* Responsive */
@media (max-width: 900px) {
  .ap-table { font-size: 12px; }
  .ap-cell-entity, .ap-cell-status { display: none; }
}
@media (max-width: 640px) {
  .ap-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .ap-filters { flex-direction: column; }
  .ap-filter-search { max-width: 100%; }
}
</style>
