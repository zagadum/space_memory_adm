import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth.store';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'online' | 'offline';
    projects: string[]; // e.g. ["space", "indigo"]
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
    const users = ref<User[]>([
        {
            id: 'u_current',
            name: 'Artem',
            email: 'artem@gls.edu.pl',
            role: 'Dział rekrutacji учащихся',
            status: 'online',
            projects: ['space'],
            initials: 'AR',
            colorClass: 'ua-amber'
        },
        {
            id: 'KN',
            name: 'Karolina Nowak',
            email: 'biuro@gls.edu.pl',
            role: 'Super-Admin',
            status: 'online',
            projects: ['all'],
            initials: 'KN',
            colorClass: 'ua-blue'
        },
        {
            id: 'MK',
            name: 'Marta Kowalczyk',
            email: 'marta@gls.edu.pl',
            role: 'Admin',
            status: 'offline',
            projects: ['space', 'indigo'],
            initials: 'MK',
            colorClass: 'ua-purple'
        },
        {
            id: 'PW',
            name: 'Piotr Wiśniewski',
            email: 'p.wisniewski@gls.edu.pl',
            role: 'Kierownik działu rekrutacji',
            status: 'offline',
            projects: ['space', 'olimp'],
            initials: 'PW',
            colorClass: 'ua-amber'
        },
        {
            id: 'AB',
            name: 'Anna Brzozowska',
            email: 'a.brzozowska@gls.edu.pl',
            role: 'Kierownik Działu Jakości Space',
            status: 'offline',
            projects: ['space'],
            initials: 'AB',
            colorClass: 'ua-green'
        },
        {
            id: 'ZN',
            name: 'Zofia Nowak',
            email: 'z.nowak@gls.edu.pl',
            role: 'Pracownik sekretariatu',
            status: 'offline',
            projects: ['all'],
            initials: 'ZN',
            colorClass: 'ua-cyan'
        }
    ]);

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

    const updateUser = (id: string, updatedData: Partial<User>) => {
        const index = users.value.findIndex(u => u.id === id);
        if (index !== -1) {
            users.value[index] = { ...users.value[index], ...updatedData };

            // Sync with global auth store if current user updated
            if (id === authStore.user?.id) {
                authStore.updateProfile(updatedData);
            }
        }
    };

    return {
        users,
        roles,
        permissionsMatrix,
        updateUser
    };
});
