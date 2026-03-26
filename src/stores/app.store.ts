import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAppStore = defineStore('app', () => {
    const activeRequests = ref(0);
    const isSidebarOpen = ref(false);

    const isGlobalLoading = computed(() => activeRequests.value > 0);

    const startRequest = () => {
        activeRequests.value++;
    };

    const endRequest = () => {
        activeRequests.value = Math.max(0, activeRequests.value - 1);
    };

    const toggleSidebar = (val?: boolean) => {
        if (typeof val === 'boolean') {
            isSidebarOpen.value = val;
        } else {
            isSidebarOpen.value = !isSidebarOpen.value;
        }
    };

    return {
        activeRequests,
        isGlobalLoading,
        isSidebarOpen,
        startRequest,
        endRequest,
        toggleSidebar,
    };
});
