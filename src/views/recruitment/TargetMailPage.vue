<template>
  <div class="tm-page">
    <div class="tm-content">
      <div class="tm-actions-row">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input v-model="searchQ" :placeholder="t('targetMail.searchPlaceholder')" />
        </div>
        <div class="tm-actions-right">
          <select v-model="exportFormat" class="format-select" :disabled="store.isLoading || !filteredItems.length">
            <option value="xlsx">XLSX</option>
            <option value="xls">XLS</option>
          </select>
          <div class="filter-chips">
            <span class="filter-label">{{ t('targetMail.filters.label') }}</span>
            <button
              v-for="status in filterOptions"
              :key="status"
              type="button"
              class="chip"
              :class="{ active: selectedStatuses.includes(status) }"
              @click="toggleStatus(status)"
            >
              {{ t(`targetMail.filters.statuses.${status}`) }}
            </button>
          </div>
          <button
            type="button"
            class="btn btn-primary export-btn"
            :disabled="store.isLoading || !filteredItems.length"
            @click="exportToExcel"
          >
            📥 {{ t('targetMail.exportExcel') }}
          </button>
        </div>
      </div>

      <div class="table-container">
        <div v-if="store.isLoading" class="list-state loading">
          <div class="list-state-icon">⏳</div>
          <div class="list-state-title">{{ t('targetMail.loading') }}</div>
        </div>

        <div v-else-if="store.error" class="list-state error">
          <div class="list-state-icon">⚠️</div>
          <div class="list-state-title">{{ t('targetMail.errorTitle') }}</div>
          <div class="list-state-text">{{ store.error }}</div>
          <button class="btn btn-ghost" @click="reload">🔄 {{ t('common.retry') }}</button>
        </div>

        <div v-else-if="!filteredItems.length" class="list-state empty">
          <div class="list-state-icon">📭</div>
          <div class="list-state-title">{{ t('targetMail.emptyTitle') }}</div>
          <div class="list-state-text">
            {{ store.items.length ? t('targetMail.emptyFiltered') : t('targetMail.emptyText') }}
          </div>
        </div>

        <table v-else>
          <thead>
            <tr>
              <th>{{ t('targetMail.table.surname') }}</th>
              <th>{{ t('targetMail.table.name') }}</th>
              <th>{{ t('targetMail.table.parentEmail') }}</th>
              <th>{{ t('targetMail.table.status') }}</th>
              <th>{{ t('targetMail.table.errorMessage') }}</th>
              <th>{{ t('targetMail.table.linkClickedAt') }}</th>
              <th>{{ t('targetMail.table.convertedAt') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredItems" :key="row.id">
              <td>{{ row.surname || '—' }}</td>
              <td>{{ row.name || '—' }}</td>
              <td>
                <a v-if="row.parent_email" class="email-link" :href="`mailto:${row.parent_email}`">{{ row.parent_email }}</a>
                <span v-else class="empty-cell">—</span>
              </td>
              <td>
                <span class="status-badge" :class="statusClass(row.status)">
                  {{ row.status || '—' }}
                </span>
              </td>
              <td class="error-cell">
                <span :class="{ 'empty-cell': !row.error_message }">{{ row.error_message || '—' }}</span>
              </td>
              <td><span class="date-mono">{{ formatDateTime(row.link_clicked_at) }}</span></td>
              <td><span class="date-mono">{{ formatDateTime(row.converted_at) }}</span></td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredItems.length" class="table-footer">
          <span class="table-info">{{ t('targetMail.showing', { shown: filteredItems.length, total: store.items.length }) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import type { RecruitmentBackend } from '../../api/http';
import { useTargetMailStore } from '../../stores/targetMail.store';

const route = useRoute();
const store = useTargetMailStore();
const searchQ = ref('');
const exportFormat = ref<'xlsx' | 'xls'>('xlsx');
const selectedStatuses = ref<TargetMailFilterStatus[]>([]);
const { t, locale } = useI18n();
const emptyCellValue = '—';

type TargetMailFilterStatus = 'clicked' | 'converted' | 'sent';

const filterOptions: TargetMailFilterStatus[] = ['clicked', 'converted', 'sent'];

const recruitmentBackend = computed<RecruitmentBackend>(() => route.meta.recruitmentBackend === 'indigo' ? 'indigo' : 'default');

const localeMap: Record<string, string> = {
  ru: 'ru-RU',
  uk: 'uk-UA',
  pl: 'pl-PL',
  en: 'en-GB',
};

function normalizeStatus(status: string): string {
  return String(status || '').trim().toLowerCase();
}

function getFilterStatus(status: string): TargetMailFilterStatus | null {
  const normalized = normalizeStatus(status);

  if (normalized.includes('convert')) return 'converted';
  if (normalized.includes('click') || normalized.includes('open')) return 'clicked';
  if (normalized.includes('sent')) return 'sent';

  return null;
}

const filteredItems = computed(() => {
  const query = searchQ.value.trim().toLowerCase();
  return store.items.filter((row) => {
    const matchesQuery = !query || [
      row.surname,
      row.name,
      row.parent_email,
      row.status,
      row.error_message ?? '',
      row.link_clicked_at ?? '',
      row.converted_at ?? '',
    ].some((value) => String(value).toLowerCase().includes(query));

    const normalizedStatus = getFilterStatus(row.status);
    const matchesStatus = !selectedStatuses.value.length || (normalizedStatus !== null && selectedStatuses.value.includes(normalizedStatus));

    return matchesQuery && matchesStatus;
  });
});

function toggleStatus(status: TargetMailFilterStatus) {
  if (selectedStatuses.value.includes(status)) {
    selectedStatuses.value = selectedStatuses.value.filter((item) => item !== status);
    return;
  }

  selectedStatuses.value = [...selectedStatuses.value, status];
}

function formatDateTime(value: string | null) {
  if (!value) return emptyCellValue;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(localeMap[locale.value] || 'ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function statusClass(status: string) {
  const normalized = normalizeStatus(status);

  if (normalized.includes('convert')) return 'status-success';
  if (normalized.includes('click') || normalized.includes('open')) return 'status-info';
  if (normalized.includes('error') || normalized.includes('fail')) return 'status-danger';
  return 'status-default';
}

function reload() {
  store.fetchTargetMail(recruitmentBackend.value);
}

async function exportToExcel() {
  if (!filteredItems.value.length) return;

  const { exportTableToExcel } = await import('../../utils/excelExport');
  const dateStr = new Date().toISOString().split('T')[0];
  const backendLabel = recruitmentBackend.value === 'indigo' ? 'indigo' : 'default';

  exportTableToExcel({
    fileName: `${t('targetMail.export.fileNamePrefix')}_${backendLabel}_${dateStr}`,
    sheetName: t('targetMail.export.sheetName'),
    format: exportFormat.value,
    rows: [
      [
        t('targetMail.table.surname'),
        t('targetMail.table.name'),
        t('targetMail.table.parentEmail'),
        t('targetMail.table.status'),
        t('targetMail.table.errorMessage'),
        t('targetMail.table.linkClickedAt'),
        t('targetMail.table.convertedAt'),
      ],
      ...filteredItems.value.map((row) => [
        row.surname || emptyCellValue,
        row.name || emptyCellValue,
        row.parent_email || emptyCellValue,
        row.status || emptyCellValue,
        row.error_message || emptyCellValue,
        formatDateTime(row.link_clicked_at),
        formatDateTime(row.converted_at),
      ]),
    ],
    columnWidths: [
      { wch: 20 },
      { wch: 20 },
      { wch: 32 },
      { wch: 18 },
      { wch: 40 },
      { wch: 22 },
      { wch: 22 },
    ],
  });
}

watch(recruitmentBackend, () => {
  searchQ.value = '';
  selectedStatuses.value = [];
  store.fetchTargetMail(recruitmentBackend.value);
}, { immediate: true });
</script>

<style scoped>
.tm-page { display: flex; flex-direction: column; min-height: 0; flex: 1; }
.tm-content { padding: 24px 28px; flex: 1; overflow-y: auto; }
.tm-content::-webkit-scrollbar { width: 4px; }
.tm-content::-webkit-scrollbar-thumb { background: rgba(79,110,247,0.2); border-radius: 2px; }

.tm-actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tm-actions-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.format-select {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  color: var(--app-text-main);
  font-size: 12px;
  font-weight: 600;
  padding: 8px 10px;
  min-width: 78px;
}

.filter-chips {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--app-text-dim);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid var(--app-border);
  background: var(--app-card);
  color: var(--app-text-dim);
}

.chip:hover {
  border-color: var(--app-border-hi);
  color: var(--app-text-main);
}

.chip.active {
  background: rgba(79,110,247,0.15);
  border-color: rgba(79,110,247,0.5);
  color: var(--app-text-main);
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
.search-box:focus-within { border-color: var(--app-border-hi); box-shadow: 0 0 12px rgba(79,110,247,0.1); }
.search-icon { color: var(--app-text-dim); font-size: 14px; }
.search-box input {
  background: none;
  border: none;
  outline: none;
  color: var(--app-text-main);
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  width: 240px;
}

.export-btn {
  white-space: nowrap;
}

.table-container {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 14px;
  overflow: hidden;
  overflow-x: auto;
}

table { width: 100%; border-collapse: collapse; min-width: 1100px; }
thead tr { background: var(--app-surface); border-bottom: 1px solid var(--app-border); }
th {
  padding: 11px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--app-text-dim);
  white-space: nowrap;
}
tbody tr { border-bottom: 1px solid rgba(100,120,255,0.07); transition: all 0.15s; }
tbody tr:last-child { border-bottom: none; }
tbody tr:hover { background: rgba(79,110,247,0.04); }
td {
  padding: 12px 14px;
  font-size: 13.5px;
  vertical-align: middle;
  color: var(--app-text-main);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.status-badge.status-default { background: rgba(148,163,184,0.12); color: var(--app-text-dim); border: 1px solid rgba(148,163,184,0.22); }
.status-badge.status-info { background: rgba(79,110,247,0.12); color: #4f6ef7; border: 1px solid rgba(79,110,247,0.24); }
.status-badge.status-success { background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.24); }
.status-badge.status-danger { background: rgba(239,68,68,0.12); color: #ef4444; border: 1px solid rgba(239,68,68,0.24); }

.email-link {
  color: #4f6ef7;
  text-decoration: none;
  word-break: break-word;
}
.email-link:hover { text-decoration: underline; }
.error-cell {
  max-width: 320px;
  white-space: normal;
  line-height: 1.4;
}
.empty-cell { color: var(--app-text-dim); font-style: italic; }
.date-mono { font-family: 'Space Mono', monospace; font-size: 12px; }

.table-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid var(--app-border);
}
.table-info { color: var(--app-text-dim); font-size: 12.5px; }

.list-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 240px;
  padding: 32px 20px;
  text-align: center;
}
.list-state-icon { font-size: 32px; opacity: 0.9; }
.list-state-title { font-size: 18px; font-weight: 700; color: var(--app-text-main); }
.list-state-text { max-width: 560px; font-size: 13px; color: var(--app-text-dim); line-height: 1.5; }
.list-state.error .list-state-title { color: #ef4444; }
.list-state.loading .list-state-title { color: #4f6ef7; }
</style>

