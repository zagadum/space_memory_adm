import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getImportDbApi, type ImportDbItem, type ImportDbListResponse } from '../api/importDbApi';
import type { RecruitmentBackend } from '../api/http';
export const useImportDbStore = defineStore('importDb', () => {
  const items = ref<ImportDbItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const perPage = ref(10);
  const totalCount = ref(0);
  const lastPage = ref(1);
  const currentBackend = ref<RecruitmentBackend>('default');
  const sentCount = computed(() => items.value.filter(i => i.is_send).length);
  const doneCount = computed(() => items.value.filter(i => i.is_done).length);
  const pendingCount = computed(() => items.value.filter(i => !i.is_done).length);
  async function fetchImportDbList(page: number = 1, backend: RecruitmentBackend = 'default') {
    isLoading.value = true;
    error.value = null;
    currentBackend.value = backend;
    try {
      const api = getImportDbApi(backend);
      const response: ImportDbListResponse = await api.getImportDbList({ page, perPage: perPage.value });
      items.value = response.items;
      currentPage.value = response.pagination.currentPage;
      totalCount.value = response.pagination.total;
      lastPage.value = response.pagination.lastPage;
    } catch (err: any) {
      error.value = err?.message || 'Ошибка загрузки';
    } finally {
      isLoading.value = false;
    }
  }
  async function deleteImportDbItem(id: number | string) {
    isLoading.value = true;
    error.value = null;
    try {
      const api = getImportDbApi(currentBackend.value);
      await api.deleteImportDbItem(id);
      items.value = items.value.filter(i => i.id !== id);
      totalCount.value = Math.max(0, totalCount.value - 1);
    } catch (err: any) {
      error.value = err?.message || 'Ошибка удаления';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  async function resendInvitation(id: number | string) {
    isLoading.value = true;
    error.value = null;
    try {
      const api = getImportDbApi(currentBackend.value);
      const result = await api.resendInvitation(id);
      const idx = items.value.findIndex(i => i.id === id);
      if (idx !== -1) items.value[idx].is_send = true;
      return result;
    } catch (err: any) {
      error.value = err?.message || 'Ошибка отправки';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  async function updateImportDbItem(id: number | string, payload: Partial<ImportDbItem>) {
    isLoading.value = true;
    error.value = null;
    try {
      const api = getImportDbApi(currentBackend.value);
      await api.updateImportDbItem(id, payload);
      const idx = items.value.findIndex(i => i.id === id);
      if (idx !== -1) items.value[idx] = { ...items.value[idx], ...payload };
    } catch (err: any) {
      error.value = err?.message || 'Ошибка обновления';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  function resetState() {
    items.value = [];
    currentPage.value = 1;
    totalCount.value = 0;
    lastPage.value = 1;
    error.value = null;
    isLoading.value = false;
  }
  return { items, isLoading, error, currentPage, perPage, totalCount, lastPage, currentBackend, sentCount, doneCount, pendingCount, fetchImportDbList, deleteImportDbItem, resendInvitation, updateImportDbItem, resetState };
});

