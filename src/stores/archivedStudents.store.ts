import { defineStore } from 'pinia';
import { ref } from 'vue';
import { archivedStudentsApi, type ArchivedStudent, type ArchivedStats } from '../api/archivedStudents.api';

export const useArchivedStudentsStore = defineStore('archivedStudents', () => {
  const students = ref<ArchivedStudent[]>([]);
  const stats = ref<ArchivedStats>({
    total: 0,
    month: 0,
    none: 0,
    return: 0,
  });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchStudents = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await archivedStudentsApi.getList();
      students.value = response.data;
      stats.value = response.meta;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch archived students';
    } finally {
      isLoading.value = false;
    }
  };

  const returnToNew = async (id: number, comment?: string) => {
    try {
      await archivedStudentsApi.returnToNew(id, comment);
      students.value = students.value.filter((s: ArchivedStudent) => s.id !== id);
      stats.value.total--;
    } catch (err: any) {
      error.value = err.message || 'Failed to return student to new students list';
      throw err;
    }
  };

  const transferToGroup = async (id: number, groupId: number) => {
    try {
      await archivedStudentsApi.transfer(id, groupId);
      students.value = students.value.filter((s: ArchivedStudent) => s.id !== id);
      stats.value.total--;
    } catch (err: any) {
      error.value = err.message || 'Failed to transfer student to group';
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
