import { defineStore } from 'pinia'
import { getDashboardStats } from '../api/dashboardApi'
import { useActivityStore } from './activity.store'
import type { ActivityLog } from './activity.store'

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

export type { ActivityLog as ActivityEvent }

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

        quickActions: [
            { id: '1', label: 'dashboard.quickActions.issueInvoice', icon: '📝', path: '/finance/invoices/new', color: 'blue' },
            { id: '2', label: 'dashboard.quickActions.addStudent', icon: '👤', path: '/students/new', color: 'green' },
            { id: '3', label: 'dashboard.quickActions.newGroup', icon: '🎓', path: '/groups/new', color: 'purple' },
            { id: '4', label: 'dashboard.quickActions.salesReport', icon: '📊', path: '/finance/reports', color: 'amber' }
        ] as QuickAction[]
    }),

    getters: {
        recentActivity(): ActivityLog[] {
            const activityStore = useActivityStore()
            return activityStore.recentLogs
        },
        isLoadingActivity(): boolean {
            const activityStore = useActivityStore()
            return activityStore.isLoadingRecent
        }
    },

    actions: {
        async fetchStats() {
            this.isLoadingStats = true
            try {
                const data = await getDashboardStats()
                this.stats = data
            } catch (err) {
                console.warn('Dashboard stats endpoint not ready or failed. Using defaults.', err)
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
        },

        async fetchRecentActivity(limit = 5) {
            const activityStore = useActivityStore()
            await activityStore.fetchRecent(limit)
        }
    }
})
