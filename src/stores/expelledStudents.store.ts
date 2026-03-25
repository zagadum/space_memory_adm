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

export const useExpelledStudentsStore = defineStore('expelledStudents', {
  state: () => ({
    list: [] as ExpelledStudent[],
    stats: null as ExpelledStats | null,
    isLoading: false,
    error: null as string | null,
    selectedIds: [] as number[],
    currentBackend: 'default' as RecruitmentBackend,
  }),

  actions: {
    resolveApi(backend?: RecruitmentBackend) {
      this.currentBackend = backend ?? this.currentBackend;
      return getExpelledStudentsApi(this.currentBackend);
    },

    async fetchList(backend?: RecruitmentBackend) {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await this.resolveApi(backend).getList();
        const list = normalizeExpelledList(res);
        this.list = list;
        this.stats = normalizeExpelledStats(res, list);
      } catch (err: any) {
        this.list = [];
        this.stats = { ...EMPTY_STATS };
        this.error = err?.response?.data?.message || err?.message || 'Ошибка загрузки';
      } finally {
        this.isLoading = false;
      }
    },

    async updateStudent(id: number, patch: ExpelledUpdatePayload, backend?: RecruitmentBackend) {
      try {
        await this.resolveApi(backend).update(id, patch);
        const s = this.list.find(x => x.id === id);
        if (s) Object.assign(s, patch);
        const { useNotificationStore } = await import('./notification.store');
        useNotificationStore().addToast('💾 Сохранено', 'success');
      } catch (err: any) {
        const { useNotificationStore } = await import('./notification.store');
        useNotificationStore().addToast('Ошибка сохранения', 'error');
      }
    },

    async archiveStudent(id: number, reason: string, backend?: RecruitmentBackend) {
      try {
        await this.resolveApi(backend).archive(id, reason);
        this.list = this.list.filter(x => x.id !== id);
        if (this.stats) this.stats.total = this.list.length;
        this.selectedIds = this.selectedIds.filter(x => x !== id);
        const { useNotificationStore } = await import('./notification.store');
        useNotificationStore().addToast('🗃️ Ученик архивирован', 'success');
      } catch (err: any) {
        const { useNotificationStore } = await import('./notification.store');
        useNotificationStore().addToast('Ошибка архивации', 'error');
      }
    },

    async transferStudent(id: number, groupId: number, backend?: RecruitmentBackend) {
      try {
        await this.resolveApi(backend).transfer(id, groupId);
        const { useNotificationStore } = await import('./notification.store');
        useNotificationStore().addToast('✅ Ученик перенесён в группу', 'success');
      } catch (err: any) {
        const { useNotificationStore } = await import('./notification.store');
        useNotificationStore().addToast('Ошибка переноса', 'error');
      }
    },

    async bulkAssign(ids: number[], manager: string, backend?: RecruitmentBackend) {
      try {
        await this.resolveApi(backend).bulkAssign(ids, manager);
        ids.forEach(id => {
          const s = this.list.find(x => x.id === id);
          if (s) s.manager = manager;
        });
        this.selectedIds = [];
        const { useNotificationStore } = await import('./notification.store');
        useNotificationStore().addToast(`✅ Назначен: ${manager}`, 'success');
      } catch (err: any) {
        const { useNotificationStore } = await import('./notification.store');
        useNotificationStore().addToast('Ошибка назначения', 'error');
      }
    },

    async bulkArchive(ids: number[], reason: string, backend?: RecruitmentBackend) {
      try {
        await this.resolveApi(backend).bulkArchive(ids, reason);
        this.list = this.list.filter(x => !ids.includes(x.id));
        if (this.stats) this.stats.total = this.list.length;
        this.selectedIds = [];
        const { useNotificationStore } = await import('./notification.store');
        useNotificationStore().addToast(`🗃️ Архивировано ${ids.length} учеников`, 'success');
      } catch (err: any) {
        const { useNotificationStore } = await import('./notification.store');
        useNotificationStore().addToast('Ошибка архивации', 'error');
      }
    },

    toggleSelect(id: number) {
      const idx = this.selectedIds.indexOf(id);
      if (idx === -1) this.selectedIds.push(id);
      else this.selectedIds.splice(idx, 1);
    },

    selectAll(ids: number[]) {
      this.selectedIds = [...ids];
    },

    clearSelection() {
      this.selectedIds = [];
    },
  },
});
