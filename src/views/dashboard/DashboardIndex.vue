<template>
  <div class="dashboard-page">
    <!-- Header Section -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1 class="welcome-text">{{ $t('common.welcome', { name: authStore.user?.name || 'User' }) }}</h1>
        <p class="date-text">{{ currentDate }}</p>
      </div>
      <div class="header-right">
        <button class="btn btn-primary btn-icon" @click="navigate('/students/new')">
          <span>＋</span> {{ $t('dashboard.header.newStudent') }}
        </button>
      </div>
    </header>

    <!-- Stats Grid -->
    <section class="stats-grid" :class="{ 'stats-loading': store.isLoadingStats }">
      <div class="stat-card blue">
        <div class="stat-icon">👩‍🚀</div>
        <div class="stat-info">
          <div class="stat-value">{{ store.stats.totalStudents }}</div>
          <div class="stat-label">{{ $t('dashboard.stats.totalStudents') }}</div>
        </div>
        <div class="stat-trend">{{ $t('dashboard.stats.studentsTrend', { n: store.stats.studentsWeeklyTrend }) }}</div>
      </div>
      
      <div class="stat-card green">
        <div class="stat-icon">🎓</div>
        <div class="stat-info">
          <div class="stat-value">{{ store.stats.activeGroups }}</div>
          <div class="stat-label">{{ $t('dashboard.stats.activeGroups') }}</div>
        </div>
        <div class="stat-trend">{{ $t('dashboard.stats.groupsTrend', { n: store.stats.groupsFillRate }) }}</div>
      </div>
      
      <div class="stat-card amber">
        <div class="stat-icon">💫</div>
        <div class="stat-info">
          <div class="stat-value">{{ store.stats.pendingInvoices }}</div>
          <div class="stat-label">{{ $t('dashboard.stats.pendingInvoices') }}</div>
        </div>
        <div class="stat-trend warning">
          <span v-if="store.stats.overdueInvoices > 0">🔴 {{ store.stats.overdueInvoices }} {{ $t('finance.overdueCount') }}</span>
          <span v-else>{{ $t('dashboard.stats.invoicesTrend') }}</span>
        </div>
      </div>
      
      <div class="stat-card purple">
        <div class="stat-icon">🚀</div>
        <div class="stat-info">
          <div class="stat-value">{{ store.stats.newLeads }}</div>
          <div class="stat-label">{{ $t('dashboard.stats.newLeads') }}</div>
        </div>
        <div class="stat-trend info">
          <span v-if="store.stats.criticalLeads > 0">🔴 {{ store.stats.criticalLeads }} {{ $t('dashboard.stats.leadsTrend') }}</span>
          <span v-else>{{ store.stats.newLeads }} {{ $t('dashboard.stats.leadsTrend') }}</span>
        </div>
      </div>

      <div class="stat-card teal">
        <div class="stat-icon">🆕</div>
        <div class="stat-info">
          <div class="stat-value">{{ store.stats.newStudents }}</div>
          <div class="stat-label">{{ $t('dashboard.stats.newStudents') }}</div>
        </div>
        <div class="stat-trend info">
          <span v-if="store.stats.studentsWithoutGroup > 0">⏳ {{ store.stats.studentsWithoutGroup }} {{ $t('dashboard.stats.newStudentsTrend') }}</span>
          <span v-else>{{ $t('dashboard.stats.newStudentsTrend') }}</span>
        </div>
      </div>
    </section>

    <!-- Main Content Area -->
    <div class="dashboard-content">
      <!-- Left Column: Recent Activity -->
      <main class="content-main">
        <div class="scard">
          <div class="scard-hdr">
            <h2 class="scard-title">{{ $t('dashboard.activity.title') }}</h2>
            <button class="btn btn-ghost btn-xs" @click="router.push('/activity')">
              {{ $t('dashboard.activity.viewAll') }} →
            </button>
          </div>
          <div class="scard-body no-padding">
            <div v-if="store.isLoadingActivity" class="activity-list">
              <div v-for="n in 4" :key="n" class="activity-item activity-skeleton"></div>
            </div>
            <div v-else-if="!store.recentActivity.length" class="activity-empty">
              <span>📋</span> {{ $t('activity.historyEmpty') }}
            </div>
            <div v-else class="activity-list">
              <div v-for="event in store.recentActivity" :key="event.id" class="activity-item">
                <div class="activity-icon-dot" :style="{ background: getActivityMeta(event.action_type).color }">
                  {{ getActivityMeta(event.action_type).icon }}
                </div>
                <div class="activity-content">
                  <div class="activity-header">
                    <span class="activity-title">{{ event.description }}</span>
                    <span class="activity-time">{{ formatRelativeTime(event.created_at) }}</span>
                  </div>
                  <p class="activity-desc">{{ event.actor_name }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Right Column: Quick Actions -->
      <aside class="content-aside">
        <div class="scard">
          <div class="scard-hdr">
            <h2 class="scard-title">{{ $t('dashboard.quickActions.title') }}</h2>
          </div>
          <div class="scard-body">
            <div class="quick-actions">
              <button 
                v-for="action in store.quickActions" 
                :key="action.id"
                class="quick-action-btn"
                @click="navigate(action.path)"
              >
                <span class="action-icon" :class="action.color">{{ action.icon }}</span>
                <span class="action-label">{{ $t(action.label) }}</span>
                <span class="action-arrow">›</span>
              </button>
            </div>
          </div>
        </div>

        <div class="scard mini-card mt-20">
          <div class="scard-body">
            <div class="system-status">
              <div class="status-dot online"></div>
              <span>{{ $t('dashboard.status.online') }} · {{ $t('dashboard.status.version') }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useAuthStore } from '../../stores/auth.store'
import { getActivityMeta, formatRelativeTime } from '../../stores/activity.store'

const { locale } = useI18n()
const store = useDashboardStore()
const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  store.fetchStats()
  store.fetchRecentActivity(5)
})

const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString(locale.value === 'ru' ? 'ru-RU' : locale.value === 'pl' ? 'pl-PL' : locale.value === 'uk' ? 'uk-UA' : 'en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

const navigate = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
}
.welcome-text {
  font-size: 28px;
  font-weight: 800;
  color: var(--app-text-main);
  margin: 0;
}
.date-text {
  color: var(--app-text-dim);
  margin: 4px 0 0;
  font-size: 14px;
  text-transform: capitalize;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  transition: opacity 0.3s;
}
.stats-loading {
  opacity: 0.6;
  pointer-events: none;
}
.stat-card {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, border-color 0.2s;
}
.stat-card:hover {
  transform: translateY(-4px);
  border-color: var(--app-border-hi);
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 3px;
}
.stat-card.blue::before { background: linear-gradient(90deg, #4f6ef7, transparent); }
.stat-card.green::before { background: linear-gradient(90deg, #10b981, transparent); }
.stat-card.amber::before { background: linear-gradient(90deg, #f59e0b, transparent); }
.stat-card.purple::before { background: linear-gradient(90deg, #8b5cf6, transparent); }
.stat-card.teal::before { background: linear-gradient(90deg, #14b8a6, transparent); }

.stat-icon {
  font-size: 24px;
  margin-bottom: 16px;
}
.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--app-text-main);
  line-height: 1;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 13px;
  color: var(--app-text-dim);
  font-weight: 500;
}
.stat-trend {
  margin-top: 16px;
  font-size: 11px;
  font-weight: 700;
  color: var(--app-text-dim);
  opacity: 0.8;
}
.stat-trend.warning { color: #f59e0b; }
.stat-trend.info { color: #4f6ef7; }

/* Content Layout */
.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

/* Common Card Styles */
.scard {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 16px;
  overflow: hidden;
}
.scard-hdr {
  padding: 20px;
  border-bottom: 1px solid var(--app-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.scard-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--app-text-main);
  margin: 0;
}
.scard-body {
  padding: 20px;
}
.scard-body.no-padding {
  padding: 0;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
}
.activity-item {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--app-border-faint);
  transition: background 0.2s;
}
.activity-item:hover {
  background: var(--app-surface);
}
.activity-item:last-child {
  border-bottom: none;
}
.activity-icon-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
  opacity: 0.85;
}
.activity-skeleton {
  height: 48px;
  background: linear-gradient(90deg, var(--app-surface) 25%, var(--app-border) 50%, var(--app-surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.activity-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 32px 20px;
  color: var(--app-text-dim);
  font-size: 13px;
  justify-content: center;
}

.activity-content {
  flex: 1;
}
.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}
.activity-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--app-text-main);
}
.activity-time {
  font-size: 11px;
  color: var(--app-text-dim);
}
.activity-desc {
  font-size: 12px;
  color: var(--app-text-dim);
  margin: 0;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--app-surface);
  border: 1px solid var(--app-border-faint);
  border-radius: 12px;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}
.quick-action-btn:hover {
  background: var(--app-surface-hi);
  border-color: var(--app-border);
  transform: translateX(4px);
}
.action-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.action-icon.blue { background: rgba(79,110,247,0.1); color: #4f6ef7; }
.action-icon.green { background: rgba(16,185,129,0.1); color: #10b981; }
.action-icon.purple { background: rgba(139,92,246,0.1); color: #8b5cf6; }
.action-icon.amber { background: rgba(245,158,11,0.1); color: #f59e0b; }

.action-label {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text-main);
}
.action-arrow {
  color: var(--app-text-dim);
  font-size: 18px;
  opacity: 0.5;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  color: var(--app-text-dim);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.status-dot.online {
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

.mt-20 { margin-top: 20px; }

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
