import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: number;
    type: ToastType;
    message: string;
    duration: number;
}

export const useNotificationStore = defineStore('notification', () => {
    const toasts = ref<Toast[]>([]);
    let nextId = 0;

    const addToast = (message: string, type: ToastType = 'info', duration = 4000) => {
        const id = nextId++;
        const toast: Toast = { id, message, type, duration };
        toasts.value.push(toast);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    };

    const removeToast = (id: number) => {
        const index = toasts.value.findIndex(t => t.id === id);
        if (index !== -1) {
            toasts.value.splice(index, 1);
        }
    };

    return {
        toasts,
        addToast,
        removeToast,
    };
});
