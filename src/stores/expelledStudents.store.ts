import { defineStore } from 'pinia';
import { getExpelledStudentsApi } from '../api/expelledStudentsApi';
import type { ExpelledStudent, ExpelledStats, ExpelledUpdatePayload } from '../api/expelledStudentsApi';
import type { RecruitmentBackend } from '../api/http';

const EMPTY_STATS: ExpelledStats = {
  total: 0,
  hot: 0,
  none: 0,
  unpaid: 0,
};

function normalizeExpelledList(payload: unknown): ExpelledStudent[] {
  if (Array.isArray(payload)) return payload as ExpelledStudent[];

  const source = payload as Record<string, unknown> | null | undefined;
  const candidates = [
    source?.data,
    source?.items,
    (source?.data as Record<string, unknown> | null | undefined)?.data,
    (source?.data as Record<string, unknown> | null | undefined)?.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as ExpelledStudent[];
  }

  return [];
}

function normalizeExpelledStats(payload: unknown, list: ExpelledStudent[]): ExpelledStats {
  const source = payload as Record<string, unknown> | null | undefined;
  const meta = source?.meta as Record<string, unknown> | undefined;
  const dataNode = source?.data as Record<string, unknown> | undefined;
  const statsNode = source?.stats as Record<string, unknown> | undefined;
  const nestedMeta = dataNode?.meta as Record<string, unknown> | undefined;

  const candidate = meta ?? statsNode ?? nestedMeta;
  if (candidate) {
    return {
      total: Number(candidate.total ?? list.length) || 0,
      hot: Number(candidate.hot ?? 0) || 0,
      none: Number(candidate.none ?? 0) || 0,
      unpaid: Number(candidate.unpaid ?? 0) || 0,
    };
  }

  return {
    ...EMPTY_STATS,
    total: list.length,
  };
}

import { ref } from 'vue';
import { useNotificationStore } from './notification.store';
import { parseApiError } from '../api/errorHelper';

export const useExpelledStudentsStore = defineStore('expelledStudents', () => {
  // ── State ──
  const list = ref<ExpelledStudent[]>([]);
  const stats = ref<ExpelledStats | null>(null);
  const selectedIds = ref<number[]>([]);
  const currentBackend = ref<RecruitmentBackend>('default');
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    perPage: 20,
    total: 0,
  });

  const filters = ref({
    search: '',
    manager: 'all',
    group: 'all',
    contact: 'all',
    onlyMine: false,
  });

  // ── Actions ──
  function resolveApi(backend?: RecruitmentBackend) {
    currentBackend.value = backend ?? currentBackend.value;
    return getExpelledStudentsApi(currentBackend.value);
  }

  async function applyFilters() {
    pagination.value.currentPage = 1;
    await fetchList(1);
  }

  async function fetchList(page = pagination.value.currentPage, search?: string, backend?: RecruitmentBackend) {
    isLoading.value = true;
    error.value = null;
    try {
      const activeSearch = search !== undefined ? search : filters.value.search;
      const res = await resolveApi(backend).getList({ 
        page, 
        search: activeSearch,
        // @ts-ignore
        manager: filters.value.manager !== 'all' ? filters.value.manager : undefined,
        group: filters.value.group !== 'all' ? filters.value.group : undefined,
        contact: filters.value.contact !== 'all' ? filters.value.contact : undefined,
      });
      const normalizedList = normalizeExpelledList(res);
      list.value = normalizedList;
      stats.value = normalizeExpelledStats(res, normalizedList);
      
      const meta = (res as any).meta;
      if (meta && meta.current_page) {
        pagination.value = {
          currentPage: meta.current_page,
          lastPage: meta.last_page,
          perPage: meta.per_page,
          total: meta.total,
        };
      } else {
        pagination.value.total = list.value.length;
      }
    } catch (err: unknown) {
      list.value = [];
      stats.value = { ...EMPTY_STATS };
      error.value = parseApiError(err, 'Ошибка загрузки');
    } finally {
      isLoading.value = false;
    }
  }

  async function updateStudent(id: number, patch: ExpelledUpdatePayload, backend?: RecruitmentBackend) {
    try {
      await resolveApi(backend).update(id, patch);
      const s = list.value.find(x => x.id === id);
      if (s) Object.assign(s, patch);
      useNotificationStore().addToast('💾 Сохранено', 'success');
    } catch (err: unknown) {
      useNotificationStore().addToast(parseApiError(err, 'Ошибка сохранения'), 'error');
    }
  }

  async function archiveStudent(id: number, reason: string, backend?: RecruitmentBackend) {
    try {
      await resolveApi(backend).archive(id, reason);
      list.value = list.value.filter(x => x.id !== id);
      if (stats.value) stats.value.total = list.value.length;
      selectedIds.value = selectedIds.value.filter(x => x !== id);
      useNotificationStore().addToast('🗃️ Ученик архивирован', 'success');
    } catch (err: unknown) {
      useNotificationStore().addToast(parseApiError(err, 'Ошибка архивации'), 'error');
    }
  }

  async function transferStudent(id: number, groupId: number, backend?: RecruitmentBackend) {
    try {
      await resolveApi(backend).transfer(id, groupId);
      useNotificationStore().addToast('✅ Ученик перенесён в группу', 'success');
    } catch (err: unknown) {
      useNotificationStore().addToast(parseApiError(err, 'Ошибка переноса'), 'error');
    }
  }

  async function bulkAssign(ids: number[], manager: string, backend?: RecruitmentBackend) {
    try {
      await resolveApi(backend).bulkAssign(ids, manager);
      ids.forEach(id => {
        const s = list.value.find(x => x.id === id);
        if (s) s.manager = manager;
      });
      selectedIds.value = [];
      useNotificationStore().addToast(`✅ Назначен: ${manager}`, 'success');
    } catch (err: unknown) {
      useNotificationStore().addToast(parseApiError(err, 'Ошибка назначения'), 'error');
    }
  }

  async function bulkArchive(ids: number[], reason: string, backend?: RecruitmentBackend) {
    try {
      await resolveApi(backend).bulkArchive(ids, reason);
      list.value = list.value.filter(x => !ids.includes(x.id));
      if (stats.value) stats.value.total = list.value.length;
      selectedIds.value = [];
      useNotificationStore().addToast(`🗃️ Архивировано ${ids.length} учеников`, 'success');
    } catch (err: unknown) {
      useNotificationStore().addToast(parseApiError(err, 'Ошибка архивации'), 'error');
    }
  }

  function toggleSelect(id: number) {
    const idx = selectedIds.value.indexOf(id);
    if (idx === -1) selectedIds.value.push(id);
    else selectedIds.value.splice(idx, 1);
  }

  function selectAll(ids: number[]) {
    selectedIds.value = [...ids];
  }

  function clearSelection() {
    selectedIds.value = [];
  }

  return {
    list,
    stats,
    isLoading,
    error,
    selectedIds,
    currentBackend,
    resolveApi,
    fetchList,
    updateStudent,
    archiveStudent,
    transferStudent,
    bulkAssign,
    bulkArchive,
    toggleSelect,
    selectAll,
    clearSelection,
    filters,
    applyFilters,
    pagination,
  };
});
