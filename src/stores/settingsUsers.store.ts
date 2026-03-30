import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth.store';
import { getUsers, createUser as apiCreateUser, updateUser as apiUpdateUser, deleteUser as apiDeleteUser } from '../api/settingsApi';
import { parseApiError } from '../api/errorHelper';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'online' | 'offline';
    isActive: boolean;        // false = account deactivated, no login allowed
    projects: string[];       // e.g. ["space", "indigo"]
    initials: string;
    colorClass: string;
}

export interface ModulePermissions {
    module: string;
    section?: boolean;
    roles: Record<string, string>; // e.g. { "S-Admin": "✅", "Admin": "✅" }
}

export const useSettingsUsersStore = defineStore('settingsUsers', () => {
    const authStore = useAuthStore();
    const users = ref<User[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const fetchUsers = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const result = await getUsers();
            users.value = result.items ?? [];
        } catch (err: unknown) {
            error.value = parseApiError(err, 'Ошибка загрузки пользователей');
            console.error('Ошибка загрузки пользователей:', err);
        } finally {
            isLoading.value = false;
        }
    };

    const roles = ref<string[]>([
        "Super-Admin", "Admin", "Kierownik działu rekrutacji", "Dział rekrutacji учащихся",
        "Kierownik Działu Jakości Space", "Dział Jakości Space", "Kierownik Działu Jakości INDIGO",
        "Dział Jakości INDIGO", "Trener Space Memory", "Trener INDIGO", "Główna Księgowa",
        "Pracownik działu finansów i administracji", "Pracownik sekretariatu", "HR"
    ]);

    const permissionsMatrix = ref<ModulePermissions[]>([
        { module: 'Dashboard', section: true, roles: {} },
        { module: 'Dashboard ogólny', roles: { 'S-Admin': '✅', 'Admin': '✅', 'Kier.Rekr': '✅', 'Trener': '👁 własne', 'Fin/Adm': '✅', 'Sekr.': '✅' } },
        { module: 'Uczniowie', section: true, roles: {} },
        { module: 'Lista uczniów', roles: { 'S-Admin': '✅', 'Admin': '✅', 'Kier.Rekr': '✅', 'Trener': '👁 własne', 'Fin/Adm': '👁', 'Sekr.': '✅' } },
        { module: 'Dodaj / edytuj', roles: { 'S-Admin': '✅', 'Admin': '✅', 'Kier.Rekr': '✅', 'Trener': '—', 'Fin/Adm': '—', 'Sekr.': '✅' } },
        { module: 'Finanse', section: true, roles: {} },
        { module: 'Faktury', roles: { 'S-Admin': '✅', 'Admin': '✅', 'Kier.Rekr': '—', 'Trener': '—', 'Fin/Adm': '✅', 'Sekr.': '—' } },
        { module: 'Wypłaty', roles: { 'S-Admin': '✅', 'Admin': '✅', 'Kier.Rekr': '—', 'Trener': '👁 własne', 'Fin/Adm': '✅', 'Sekr.': '—' } },
        { module: 'Ustawienia', section: true, roles: {} },
        { module: 'Firmy / Sprzedawcy', roles: { 'S-Admin': '✅', 'Admin': '✅', 'Kier.Rekr': '—', 'Trener': '—', 'Fin/Adm': '✅', 'Sekr.': '—' } },
        { module: 'Użytkownicy', roles: { 'S-Admin': '✅', 'Admin': '—', 'Kier.Rekr': '—', 'Trener': '—', 'Fin/Adm': '—', 'Sekr.': '—' } }
    ]);

    const createUser = async (payload: import('../api/settingsApi').CreateUserPayload) => {
        try {
            const newUser = await apiCreateUser(payload);
            users.value.push(newUser);
            return newUser;
        } catch (err) {
            error.value = parseApiError(err, 'Ошибка создания пользователя');
            throw err;
        }
    };

    const updateUser = async (id: string, updatedData: Partial<User>) => {
        try {
            const updatedUser = await apiUpdateUser(id, updatedData);
            const index = users.value.findIndex(u => u.id === id);
            if (index !== -1) {
                users.value[index] = { ...users.value[index], ...updatedUser };

                // Sync with global auth store if current user updated
                if (id === authStore.user?.id) {
                    authStore.updateProfile(updatedData);
                }
            }
        } catch (err) {
            console.error('Failed to update user', err);
            throw err;
        }
    };

    const deleteUser = async (id: string) => {
        try {
            await apiDeleteUser(id);
            users.value = users.value.filter(u => u.id !== id);
        } catch (err) {
            console.error('Failed to delete user', err);
            throw err;
        }
    };

    return {
        users,
        isLoading,
        error,
        roles,
        permissionsMatrix,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser
    };
});
