import { defineStore } from 'pinia'
import { getPerformanceMetrics } from '../api/performanceMetricsApi'

export interface PageViewStat {
    page: string
    label: string
    views: number
    uniqueUsers: number
    avgDuration: number  // seconds
    trend: number        // % change vs previous period
}

export interface ResponseTimeStat {
    section: string
    label: string
    avgMs: number
    p95Ms: number
    status: 'good' | 'warning' | 'critical'
}

export interface HourlyActivity {
    hour: number
    sessions: number
}

export interface ErrorEntry {
    id: string
    code: number
    path: string
    message: string
    count: number
    lastSeen: string
}

export interface PerformanceMetrics {
    totalPageViews: number
    uniqueSessions: number
    avgLoadTimeMs: number
    errorRate: number          // percentage 0–100
    pageStats: PageViewStat[]
    responseTimeStats: ResponseTimeStat[]
    hourlyActivity: HourlyActivity[]
    recentErrors: ErrorEntry[]
}

const MOCK_METRICS: PerformanceMetrics = {
    totalPageViews: 3_847,
    uniqueSessions: 214,
    avgLoadTimeMs: 312,
    errorRate: 1.4,
    pageStats: [
        { page: '/students', label: 'performanceMetrics.pages.students', views: 1_241, uniqueUsers: 88, avgDuration: 184, trend: 12 },
        { page: '/', label: 'performanceMetrics.pages.dashboard', views: 987, uniqueUsers: 104, avgDuration: 67, trend: 5 },
        { page: '/recruitment/leads', label: 'performanceMetrics.pages.leads', views: 642, uniqueUsers: 47, avgDuration: 253, trend: -3 },
        { page: '/projects', label: 'performanceMetrics.pages.projects', views: 478, uniqueUsers: 61, avgDuration: 140, trend: 21 },
        { page: '/finance/settings', label: 'performanceMetrics.pages.settings', views: 312, uniqueUsers: 29, avgDuration: 209, trend: -8 },
        { page: '/recruitment/new-groups', label: 'performanceMetrics.pages.newGroups', views: 187, uniqueUsers: 22, avgDuration: 175, trend: 34 },
    ],
    responseTimeStats: [
        { section: 'dashboard', label: 'performanceMetrics.sections.dashboard', avgMs: 198, p95Ms: 340, status: 'good' },
        { section: 'students', label: 'performanceMetrics.sections.students', avgMs: 287, p95Ms: 520, status: 'good' },
        { section: 'leads', label: 'performanceMetrics.sections.leads', avgMs: 415, p95Ms: 780, status: 'warning' },
        { section: 'projects', label: 'performanceMetrics.sections.projects', avgMs: 356, p95Ms: 640, status: 'good' },
        { section: 'finance', label: 'performanceMetrics.sections.finance', avgMs: 512, p95Ms: 1_120, status: 'warning' },
        { section: 'auth', label: 'performanceMetrics.sections.auth', avgMs: 623, p95Ms: 1_450, status: 'critical' },
    ],
    hourlyActivity: [
        { hour: 0, sessions: 2 }, { hour: 1, sessions: 1 }, { hour: 2, sessions: 0 },
        { hour: 3, sessions: 0 }, { hour: 4, sessions: 1 }, { hour: 5, sessions: 3 },
        { hour: 6, sessions: 8 }, { hour: 7, sessions: 14 }, { hour: 8, sessions: 27 },
        { hour: 9, sessions: 38 }, { hour: 10, sessions: 45 }, { hour: 11, sessions: 42 },
        { hour: 12, sessions: 31 }, { hour: 13, sessions: 29 }, { hour: 14, sessions: 44 },
        { hour: 15, sessions: 52 }, { hour: 16, sessions: 49 }, { hour: 17, sessions: 38 },
        { hour: 18, sessions: 22 }, { hour: 19, sessions: 15 }, { hour: 20, sessions: 11 },
        { hour: 21, sessions: 8 }, { hour: 22, sessions: 5 }, { hour: 23, sessions: 3 },
    ],
    recentErrors: [
        { id: 'e1', code: 404, path: '/api/student/undefined', message: 'Student not found', count: 23, lastSeen: '2 min ago' },
        { id: 'e2', code: 500, path: '/api/dashboard/stats', message: 'Internal server error', count: 7, lastSeen: '18 min ago' },
        { id: 'e3', code: 401, path: '/api/finance/settings', message: 'Unauthorized', count: 4, lastSeen: '1 hour ago' },
        { id: 'e4', code: 422, path: '/api/recruitment/leads', message: 'Validation failed', count: 2, lastSeen: '3 hours ago' },
    ],
}

export const usePerformanceMetricsStore = defineStore('performanceMetrics', {
    state: () => ({
        isLoading: false,
        selectedPeriod: '7d' as '24h' | '7d' | '30d',
        metrics: null as PerformanceMetrics | null,
    }),

    getters: {
        maxHourlyActivity(state): number {
            if (!state.metrics) return 1
            return Math.max(...state.metrics.hourlyActivity.map(h => h.sessions), 1)
        },
    },

    actions: {
        async fetchMetrics() {
            this.isLoading = true
            try {
                const data = await getPerformanceMetrics(this.selectedPeriod)
                this.metrics = data
            } catch {
                // Backend not ready — use mock data
                this.metrics = MOCK_METRICS
            } finally {
                this.isLoading = false
            }
        },

        setPeriod(period: '24h' | '7d' | '30d') {
            this.selectedPeriod = period
            this.fetchMetrics()
        },
    },
})
