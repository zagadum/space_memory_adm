import { defineStore } from 'pinia';
import { ref } from 'vue';
import { invoicesApi, Contractor } from '@/api/invoices.api';

export const useContractorsStore = defineStore('contractors', () => {
  const contractors = ref<Contractor[]>([]);
  const total = ref(0);
  const currentPage = ref(1);
  const lastPage = ref(1);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchContractors = async (params: any = {}) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await invoicesApi.getContractors(params);
      contractors.value = response.data;
      total.value = response.meta.total;
      currentPage.value = response.meta.current_page;
      lastPage.value = response.meta.last_page;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch contractors';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  const createContractor = async (data: Partial<Contractor>) => {
    isLoading.value = true;
    try {
      const newContractor = await invoicesApi.createContractor(data);
      contractors.value.unshift(newContractor);
      total.value++;
      return newContractor;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create contractor';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateContractor = async (id: number, data: Partial<Contractor>) => {
    isLoading.value = true;
    try {
      const updated = await invoicesApi.updateContractor(id, data);
      const index = contractors.value.findIndex(c => c.id === id);
      if (index !== -1) {
        contractors.value[index] = updated;
      }
      return updated;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update contractor';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteContractor = async (id: number) => {
    isLoading.value = true;
    try {
      await invoicesApi.deleteContractor(id);
      contractors.value = contractors.value.filter(c => c.id !== id);
      total.value--;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete contractor';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const searchContractors = async (query: string) => {
    if (!query) return [];
    try {
      const response = await invoicesApi.getContractors({ search: query, per_page: 10 });
      return response.data;
    } catch (err) {
      console.error('Search failed', err);
      return [];
    }
  };

  return {
    contractors,
    total,
    currentPage,
    lastPage,
    isLoading,
    error,
    fetchContractors,
    createContractor,
    updateContractor,
    deleteContractor,
    searchContractors,
  };
});
