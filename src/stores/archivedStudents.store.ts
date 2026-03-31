import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getArchivedStudentsApi, type ArchivedStudent, type ArchivedStats } from '../api/archivedStudents.api';
import type { RecruitmentBackend } from '../api/http';
import { parseApiError } from '../api/errorHelper';

export const useArchivedStudentsStore = defineStore('archivedStudents', () => {
  const currentBackend = ref<RecruitmentBackend>('default');
  const students = ref<ArchivedStudent[]>([]);
  const stats = ref<ArchivedStats>({
    total: 0,
    month: 0,
    none: 0,
    return: 0,
  });
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
    reason: 'all',
    onlyMine: false,
    noManager: false,
  });

  function resolveApi(backend?: RecruitmentBackend) {
    currentBackend.value = backend ?? currentBackend.value;
    return getArchivedStudentsApi(currentBackend.value);
  }

  const applyFilters = async () => {
    pagination.value.currentPage = 1;
    await fetchStudents(1);
  };

  const fetchStudents = async (page = pagination.value.currentPage, search?: string, backend?: RecruitmentBackend) => {
    isLoading.value = true;
    error.value = null;
    try {
      const activeSearch = search !== undefined ? search : filters.value.search;
      const response = await resolveApi(backend).getList({ 
        page, 
        search: activeSearch,
        projectId: 1, // default
        // Passing these to the API - needs mock support
        // @ts-ignore
        manager: filters.value.manager !== 'all' ? filters.value.manager : undefined,
        reason: filters.value.reason !== 'all' ? filters.value.reason : undefined,
        only_mine: filters.value.onlyMine ? 1 : 0,
        no_manager: filters.value.noManager ? 1 : 0,
      });
      students.value = response.data;
      stats.value = response.meta;
      
      const meta = (response as any).meta;
      if (meta && meta.current_page) {
        pagination.value = {
          currentPage: meta.current_page,
          lastPage: meta.last_page,
          perPage: meta.per_page,
          total: meta.total,
        };
      } else {
        pagination.value.total = students.value.length;
      }
    } catch (err: unknown) {
      error.value = parseApiError(err, 'Failed to fetch archived students');
    } finally {
      isLoading.value = false;
    }
  };

  const returnToNew = async (id: number, comment?: string, backend?: RecruitmentBackend) => {
    try {
      await resolveApi(backend).returnToNew(id, comment);
      students.value = students.value.filter((s: ArchivedStudent) => s.id !== id);
      stats.value.total--;
    } catch (err: unknown) {
      error.value = parseApiError(err, 'Failed to return student to new students list');
      throw err;
    }
  };

  const transferToGroup = async (id: number, groupId: number, backend?: RecruitmentBackend) => {
    try {
      await resolveApi(backend).transfer(id, groupId);
      students.value = students.value.filter((s: ArchivedStudent) => s.id !== id);
      stats.value.total--;
    } catch (err: unknown) {
      error.value = parseApiError(err, 'Failed to transfer student to group');
      throw err;
    }
  };

  return {
    students,
    stats,
    isLoading,
    error,
    fetchStudents,
    returnToNew,
    transferToGroup,
    filters,
    applyFilters,
    pagination,
  };
});
