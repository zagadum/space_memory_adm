import { defineStore } from 'pinia'
import { getDashboardStats } from '../api/dashboardApi'

export interface DashboardStats {
    totalStudents: number
    studentsWeeklyTrend: number
    activeGroups: number
    groupsFillRate: number
    pendingInvoices: number
    unpaidSum: number
    overdueInvoices: number
    newLeads: number
    criticalLeads: number
    newStudents: number
    studentsWithoutGroup: number
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
        isLoadingStats: false,
        stats: {
            totalStudents: 0,
            studentsWeeklyTrend: 0,
            activeGroups: 0,
            groupsFillRate: 0,
            pendingInvoices: 0,
            unpaidSum: 0,
            overdueInvoices: 0,
            newLeads: 0,
            criticalLeads: 0,
            newStudents: 0,
            studentsWithoutGroup: 0
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
            { id: '1', label: 'dashboard.quickActions.issueInvoice', icon: '📝', path: '/finance/invoices/new', color: 'blue' },
            { id: '2', label: 'dashboard.quickActions.addStudent', icon: '👤', path: '/students/new', color: 'green' },
            { id: '3', label: 'dashboard.quickActions.newGroup', icon: '🎓', path: '/groups/new', color: 'purple' },
            { id: '4', label: 'dashboard.quickActions.salesReport', icon: '📊', path: '/finance/reports', color: 'amber' }
        ] as QuickAction[]
    }),

    actions: {
        async fetchStats() {
            this.isLoadingStats = true
            try {
                const data = await getDashboardStats()
                this.stats = data
            } catch (err) {
                console.warn('Dashboard stats endpoint not ready or failed. Using defaults.', err)
                // Keep initial zeros or previous values
                this.stats = {
                    totalStudents: 0,
                    studentsWeeklyTrend: 0,
                    activeGroups: 0,
                    groupsFillRate: 0,
                    pendingInvoices: 0,
                    unpaidSum: 0,
                    overdueInvoices: 0,
                    newLeads: 0,
                    criticalLeads: 0,
                    newStudents: 0,
                    studentsWithoutGroup: 0
                }
            } finally {
                this.isLoadingStats = false
            }
        }
    }
})
