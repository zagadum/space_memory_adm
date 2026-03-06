import { defineStore } from 'pinia'

export interface DashboardStats {
    totalStudents: number
    activeGroups: number
    pendingInvoices: number
    newLeads: number
}

export interface ActivityEvent {
    id: string
    type: 'payment' | 'student' | 'group' | 'lead'
    title: string
    description: string
    timestamp: string
    status?: 'success' | 'warning' | 'info' | 'error'
}

export interface QuickAction {
    id: string
    label: string
    icon: string
    path: string
    color: string
}

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        stats: {
            totalStudents: 42,
            activeGroups: 12,
            pendingInvoices: 7,
            newLeads: 8
        } as DashboardStats,

        recentActivity: [
            {
                id: '1',
                type: 'payment',
                title: 'Anna Kowalska opłaciła fakturę',
                description: 'Faktura FA/2026/03/001 na kwotę 350 PLN',
                timestamp: '10 minut temu',
                status: 'success'
            },
            {
                id: '2',
                type: 'student',
                title: 'Nowy uczeń w grupie Space Memory',
                description: 'Marek Nowak został przypisany do grupy SM-12',
                timestamp: '1 godzina temu',
                status: 'info'
            },
            {
                id: '3',
                type: 'lead',
                title: 'Nowy lead: Janusz Biznes',
                description: 'Zapytanie o kurs programowania dla dzieci',
                timestamp: '2 godziny temu',
                status: 'warning'
            },
            {
                id: '4',
                type: 'payment',
                title: 'Nieudało się pobrać płatności',
                description: 'Uczeń: Zofia Błąd, powód: brak środków',
                timestamp: '3 godziny temu',
                status: 'error'
            },
            {
                id: '5',
                type: 'group',
                title: 'Uruchomiono nową grupę',
                description: 'Grupą INDIGO-04 rozpoczęła zajęcia',
                timestamp: '5 godzin temu',
                status: 'success'
            }
        ] as ActivityEvent[],

        quickActions: [
            { id: '1', label: 'Wystaw fakturę', icon: '📝', path: '/finance/invoices/new', color: 'blue' },
            { id: '2', label: 'Dodaj ucznia', icon: '👤', path: '/students/new', color: 'green' },
            { id: '3', label: 'Nowa grupa', icon: '🎓', path: '/groups/new', color: 'purple' },
            { id: '4', label: 'Raport sprzedaży', icon: '📊', path: '/finance/reports', color: 'amber' }
        ] as QuickAction[]
    }),

    actions: {
        // Future actions can be added here
    }
})
