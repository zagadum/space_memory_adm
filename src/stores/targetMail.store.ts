import { defineStore } from 'pinia';
import { getRecruitmentApi, type RecruitmentTargetMail } from '../api/recruitmentApi';
import type { RecruitmentBackend } from '../api/http';

export const useTargetMailStore = defineStore('targetMail', {
  state: () => ({
    items: [] as RecruitmentTargetMail[],
    isLoading: false,
    error: null as string | null,
    currentBackend: 'default' as RecruitmentBackend,
  }),

  actions: {
    resolveApi(backend?: RecruitmentBackend) {
      this.currentBackend = backend ?? this.currentBackend;
      return getRecruitmentApi(this.currentBackend);
    },

    async fetchTargetMail(backend?: RecruitmentBackend) {
      this.isLoading = true;
      this.error = null;

      try {
        this.items = await this.resolveApi(backend).getTargetMail();
      } catch (err: any) {
        this.items = [];
        this.error = err?.response?.data?.message || err?.message || 'Ошибка загрузки TargetMail';
      } finally {
        this.isLoading = false;
      }
    },
  },
});

