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

  function resolveApi(backend?: RecruitmentBackend) {
    currentBackend.value = backend ?? currentBackend.value;
    return getArchivedStudentsApi(currentBackend.value);
  }

  const fetchStudents = async (backend?: RecruitmentBackend) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await resolveApi(backend).getList();
      students.value = response.data;
      stats.value = response.meta;
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
  };
});
