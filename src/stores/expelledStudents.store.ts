import { defineStore } from 'pinia';
import { expelledStudentsApi } from '../api/expelledStudentsApi';
import type { ExpelledStudent, ExpelledStats, ExpelledUpdatePayload } from '../api/expelledStudentsApi';

export const useExpelledStudentsStore = defineStore('expelledStudents', {
  state: () => ({
    list: [] as ExpelledStudent[],
    stats: null as ExpelledStats | null,
    isLoading: false,
    error: null as string | null,
    selectedIds: [] as number[],
  }),

  actions: {
    async fetchList() {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await expelledStudentsApi.getList();
        this.list = res.data;
        this.stats = res.meta;
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Ошибка загрузки';
      } finally {
        this.isLoading = false;
      }
    },

    async updateStudent(id: number, patch: ExpelledUpdatePayload) {
      try {
        await expelledStudentsApi.update(id, patch);
        const s = this.list.find(x => x.id === id);
        if (s) Object.assign(s, patch);
        const { useNotificationStore } = await import('./notification.store');
        useNotificationStore().addToast('💾 Сохранено', 'success');
      } catch (err: any) {
        const { useNotificationStore } = await import('./notification.store');
        useNotificationStore().addToast('Ошибка сохранения', 'error');
      }
    },

    async archiveStudent(id: number, reason: string) {
      try {
        await expelledStudentsApi.archive(id, reason);
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

    async transferStudent(id: number, groupId: number) {
      try {
        await expelledStudentsApi.transfer(id, groupId);
        const { useNotificationStore } = await import('./notification.store');
        useNotificationStore().addToast('✅ Ученик перенесён в группу', 'success');
      } catch (err: any) {
        const { useNotificationStore } = await import('./notification.store');
        useNotificationStore().addToast('Ошибка переноса', 'error');
      }
    },

    async bulkAssign(ids: number[], manager: string) {
      try {
        await expelledStudentsApi.bulkAssign(ids, manager);
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

    async bulkArchive(ids: number[], reason: string) {
      try {
        await expelledStudentsApi.bulkArchive(ids, reason);
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
