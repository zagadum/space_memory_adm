import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { useAppStore } from '../stores/app.store';

const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    timeout: 10000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token & Start Loading
httpClient.interceptors.request.use(
    (config) => {
        // Dynamically get authStore to avoid circular dependencies
        const authStore = useAuthStore();
        const appStore = useAppStore();

        appStore.startRequest();

        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`;
        }
        return config;
    },
    (error) => {
        const appStore = useAppStore();
        appStore.endRequest();
        return Promise.reject(error);
    }
);

// Response Interceptor: Global Error Handling & End Loading
httpClient.interceptors.response.use(
    (response) => {
        const appStore = useAppStore();
        appStore.endRequest();
        return response;
    },
    (error) => {
        const authStore = useAuthStore();
        const appStore = useAppStore();

        appStore.endRequest();

        // Handle timeout errors
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            error.message = 'Большая нагрузка на сервер. Пожалуйста, повторите попытку через несколько секунд.';
            console.error('⏱️ [TIMEOUT ERROR]', {
                url: error.config?.url,
                method: error.config?.method,
                timeout: error.config?.timeout,
                timestamp: new Date().toISOString(),
            });
        }

        if (error.response?.status === 401) {
            // Automatic logout on 401 Unauthorized
            authStore.logout();
            // Optional: window.location.href = '/login'; or router push
        }

        return Promise.reject(error);
    }
);

export default httpClient;
