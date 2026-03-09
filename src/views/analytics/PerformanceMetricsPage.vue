<template>
  <div class="metrics-page">
    <!-- Header -->
    <div class="page-hdr">
      <div>
        <div class="page-title">{{ $t('performanceMetrics.title') }}</div>
        <div class="page-sub">{{ $t('performanceMetrics.subtitle') }}</div>
      </div>
      <div class="hdr-actions">
        <div class="period-tabs">
          <button
            v-for="p in periods"
            :key="p.value"
            class="period-btn"
            :class="{ active: store.selectedPeriod === p.value }"
            @click="store.setPeriod(p.value as '24h' | '7d' | '30d')"
          >
            {{ $t(p.label) }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="store.isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>{{ $t('common.loading') }}</span>
    </div>

    <template v-else-if="store.metrics">
      <!-- KPI Cards -->
      <section class="kpi-grid">
        <div class="kpi-card blue">
          <div class="kpi-icon">📈</div>
          <div class="kpi-body">
            <div class="kpi-value">{{ formatNumber(store.metrics.totalPageViews) }}</div>
            <div class="kpi-label">{{ $t('performanceMetrics.kpi.pageViews') }}</div>
          </div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-icon">👥</div>
          <div class="kpi-body">
            <div class="kpi-value">{{ formatNumber(store.metrics.uniqueSessions) }}</div>
            <div class="kpi-label">{{ $t('performanceMetrics.kpi.uniqueSessions') }}</div>
          </div>
        </div>
        <div class="kpi-card amber">
          <div class="kpi-icon">⚡</div>
          <div class="kpi-body">
            <div class="kpi-value">{{ store.metrics.avgLoadTimeMs }}<span class="kpi-unit">ms</span></div>
            <div class="kpi-label">{{ $t('performanceMetrics.kpi.avgLoadTime') }}</div>
          </div>
        </div>
        <div class="kpi-card" :class="store.metrics.errorRate > 2 ? 'red' : 'purple'">
          <div class="kpi-icon">🛡️</div>
          <div class="kpi-body">
            <div class="kpi-value">{{ store.metrics.errorRate.toFixed(1) }}<span class="kpi-unit">%</span></div>
            <div class="kpi-label">{{ $t('performanceMetrics.kpi.errorRate') }}</div>
          </div>
        </div>
      </section>

      <!-- Main content grid -->
      <div class="metrics-grid">
        <!-- Left column -->
        <div class="col-left">
          <!-- Top Pages -->
          <div class="mcard">
            <div class="mcard-hdr">
              <span class="mcard-title">{{ $t('performanceMetrics.topPages.title') }}</span>
              <span class="mcard-sub">{{ $t('performanceMetrics.topPages.subtitle') }}</span>
            </div>
            <div class="mcard-body no-pad">
              <div class="page-row header-row">
                <span class="pr-page">{{ $t('performanceMetrics.topPages.colPage') }}</span>
                <span class="pr-views">{{ $t('performanceMetrics.topPages.colViews') }}</span>
                <span class="pr-users">{{ $t('performanceMetrics.topPages.colUsers') }}</span>
                <span class="pr-dur">{{ $t('performanceMetrics.topPages.colDuration') }}</span>
                <span class="pr-trend">{{ $t('performanceMetrics.topPages.colTrend') }}</span>
              </div>
              <div
                v-for="(stat, idx) in store.metrics.pageStats"
                :key="stat.page"
                class="page-row"
              >
                <span class="pr-page">
                  <span class="pr-rank">{{ idx + 1 }}</span>
                  <span class="pr-path">{{ stat.page }}</span>
                </span>
                <span class="pr-views">{{ formatNumber(stat.views) }}</span>
                <span class="pr-users">{{ formatNumber(stat.uniqueUsers) }}</span>
                <span class="pr-dur">{{ stat.avgDuration }}s</span>
                <span class="pr-trend" :class="stat.trend >= 0 ? 'trend-up' : 'trend-down'">
                  {{ stat.trend >= 0 ? '▲' : '▼' }} {{ Math.abs(stat.trend) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Hourly Activity Chart -->
          <div class="mcard mt-20">
            <div class="mcard-hdr">
              <span class="mcard-title">{{ $t('performanceMetrics.activity.title') }}</span>
              <span class="mcard-sub">{{ $t('performanceMetrics.activity.subtitle') }}</span>
            </div>
            <div class="mcard-body">
              <div class="bar-chart">
                <div
                  v-for="slot in store.metrics.hourlyActivity"
                  :key="slot.hour"
                  class="bar-col"
                  :title="`${slot.hour}:00 — ${slot.sessions} sessions`"
                >
                  <div
                    class="bar-fill"
                    :style="{ height: barHeight(slot.sessions) + '%' }"
                    :class="barColorClass(slot.sessions)"
                  ></div>
                  <div class="bar-label" v-if="slot.hour % 4 === 0">{{ slot.hour }}h</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div class="col-right">
          <!-- Response Times -->
          <div class="mcard">
            <div class="mcard-hdr">
              <span class="mcard-title">{{ $t('performanceMetrics.responseTime.title') }}</span>
              <span class="mcard-sub">{{ $t('performanceMetrics.responseTime.subtitle') }}</span>
            </div>
            <div class="mcard-body">
              <div
                v-for="rt in store.metrics.responseTimeStats"
                :key="rt.section"
                class="rt-row"
              >
                <div class="rt-head">
                  <span class="rt-label">{{ $t(rt.label) }}</span>
                  <span class="rt-badge" :class="rt.status">{{ $t(`performanceMetrics.status.${rt.status}`) }}</span>
                </div>
                <div class="rt-bar-wrap">
                  <div
                    class="rt-bar"
                    :class="rt.status"
                    :style="{ width: rtBarWidth(rt.avgMs) + '%' }"
                  ></div>
                </div>
                <div class="rt-vals">
                  <span>{{ $t('performanceMetrics.responseTime.avg') }}: <b>{{ rt.avgMs }}ms</b></span>
                  <span>p95: <b>{{ rt.p95Ms }}ms</b></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Errors -->
          <div class="mcard mt-20">
            <div class="mcard-hdr">
              <span class="mcard-title">{{ $t('performanceMetrics.errors.title') }}</span>
              <span class="mcard-sub">{{ $t('performanceMetrics.errors.subtitle') }}</span>
            </div>
            <div class="mcard-body no-pad">
              <div
                v-for="err in store.metrics.recentErrors"
                :key="err.id"
                class="err-row"
              >
                <div class="err-code" :class="errCodeClass(err.code)">{{ err.code }}</div>
                <div class="err-info">
                  <div class="err-path">{{ err.path }}</div>
                  <div class="err-msg">{{ err.message }}</div>
                </div>
                <div class="err-meta">
                  <div class="err-count">×{{ err.count }}</div>
                  <div class="err-time">{{ err.lastSeen }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePerformanceMetricsStore } from '../../stores/performanceMetrics.store'
const store = usePerformanceMetricsStore()

const periods = [
  { value: '24h', label: 'performanceMetrics.period.24h' },
  { value: '7d',  label: 'performanceMetrics.period.7d' },
  { value: '30d', label: 'performanceMetrics.period.30d' },
]

onMounted(() => {
  store.fetchMetrics()
})

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function barHeight(sessions: number): number {
  const max = store.maxHourlyActivity
  return max > 0 ? Math.round((sessions / max) * 100) : 0
}

function barColorClass(sessions: number): string {
  const max = store.maxHourlyActivity
  const pct = max > 0 ? sessions / max : 0
  if (pct >= 0.75) return 'bar-high'
  if (pct >= 0.35) return 'bar-mid'
  return 'bar-low'
}

const MAX_RT_MS = 1_600

function rtBarWidth(avgMs: number): number {
  return Math.min(Math.round((avgMs / MAX_RT_MS) * 100), 100)
}

function errCodeClass(code: number): string {
  if (code >= 500) return 'code-500'
  if (code === 401 || code === 403) return 'code-401'
  if (code === 404) return 'code-404'
  return 'code-other'
}
</script>

<style scoped>
.metrics-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-hdr {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}
.page-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--white, #fff);
}
.page-sub {
  font-size: 13px;
  color: var(--dim, #8892b0);
  margin-top: 3px;
}

/* Period tabs */
.period-tabs {
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(100,120,255,0.15);
  border-radius: 10px;
  padding: 3px;
}
.period-btn {
  padding: 6px 14px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: var(--dim, #8892b0);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.period-btn:hover {
  color: #e8eeff;
  background: rgba(79,110,247,0.1);
}
.period-btn.active {
  background: rgba(79,110,247,0.25);
  color: #e8eeff;
  border: 1px solid rgba(79,110,247,0.35);
}

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 48px;
  justify-content: center;
  color: var(--dim, #8892b0);
}
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(79,110,247,0.2);
  border-top-color: #4f6ef7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.kpi-card {
  background: var(--card, rgba(12,12,36,0.98));
  border: 1px solid rgba(100,120,255,0.12);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s;
}
.kpi-card:hover { transform: translateY(-3px); }
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 3px;
}
.kpi-card.blue::before   { background: linear-gradient(90deg, #4f6ef7, transparent); }
.kpi-card.green::before  { background: linear-gradient(90deg, #10b981, transparent); }
.kpi-card.amber::before  { background: linear-gradient(90deg, #f59e0b, transparent); }
.kpi-card.purple::before { background: linear-gradient(90deg, #8b5cf6, transparent); }
.kpi-card.red::before    { background: linear-gradient(90deg, #ef4444, transparent); }
.kpi-icon { font-size: 24px; }
.kpi-value {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}
.kpi-unit { font-size: 14px; font-weight: 500; color: var(--dim, #8892b0); margin-left: 2px; }
.kpi-label { font-size: 12px; color: var(--dim, #8892b0); margin-top: 4px; }

/* Main grid */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
}
.col-left, .col-right { display: flex; flex-direction: column; }
.mt-20 { margin-top: 20px; }

/* Card */
.mcard {
  background: var(--card, rgba(12,12,36,0.98));
  border: 1px solid rgba(100,120,255,0.12);
  border-radius: 14px;
  overflow: hidden;
  flex: 1;
}
.mcard-hdr {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(100,120,255,0.08);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.mcard-title { font-size: 14px; font-weight: 700; color: #fff; }
.mcard-sub { font-size: 11px; color: var(--dim, #8892b0); }
.mcard-body { padding: 16px 20px; }
.mcard-body.no-pad { padding: 0; }

/* Top pages table */
.page-row {
  display: grid;
  grid-template-columns: 2fr 80px 80px 60px 70px;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid rgba(100,120,255,0.06);
  font-size: 12.5px;
  transition: background 0.15s;
}
.page-row:hover { background: rgba(255,255,255,0.02); }
.page-row:last-child { border-bottom: none; }
.header-row {
  background: rgba(255,255,255,0.02);
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--dim, #8892b0);
}
.header-row:hover { background: rgba(255,255,255,0.02); }
.pr-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: rgba(79,110,247,0.15);
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  color: #4f6ef7;
  margin-right: 8px;
  flex-shrink: 0;
}
.pr-page { display: flex; align-items: center; overflow: hidden; }
.pr-path { font-family: 'Space Mono', monospace; font-size: 11.5px; color: #c8d0f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pr-views, .pr-users { color: #e8eeff; font-weight: 600; }
.pr-dur { color: var(--dim, #8892b0); }
.trend-up   { color: #10b981; font-weight: 700; }
.trend-down { color: #ef4444; font-weight: 700; }

/* Bar chart */
.bar-chart {
  display: flex;
  align-items: flex-end;
  height: 100px;
  gap: 3px;
}
.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  position: relative;
  cursor: default;
}
.bar-fill {
  width: 100%;
  border-radius: 3px 3px 0 0;
  min-height: 2px;
  transition: height 0.4s ease;
}
.bar-high { background: #4f6ef7; box-shadow: 0 0 8px rgba(79,110,247,0.4); }
.bar-mid  { background: rgba(79,110,247,0.5); }
.bar-low  { background: rgba(79,110,247,0.2); }
.bar-label {
  position: absolute;
  bottom: -18px;
  font-size: 9px;
  color: var(--dim, #8892b0);
}

/* Response times */
.rt-row { margin-bottom: 16px; }
.rt-row:last-child { margin-bottom: 0; }
.rt-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.rt-label { font-size: 12.5px; font-weight: 600; color: #c8d0f0; }
.rt-badge {
  font-size: 9.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.rt-badge.good     { background: rgba(16,185,129,0.15); color: #10b981; }
.rt-badge.warning  { background: rgba(245,158,11,0.15); color: #f59e0b; }
.rt-badge.critical { background: rgba(239,68,68,0.15);  color: #ef4444; }
.rt-bar-wrap { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-bottom: 5px; }
.rt-bar { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
.rt-bar.good     { background: #10b981; }
.rt-bar.warning  { background: #f59e0b; }
.rt-bar.critical { background: #ef4444; }
.rt-vals { display: flex; justify-content: space-between; font-size: 11px; color: var(--dim, #8892b0); }
.rt-vals b { color: #e8eeff; }

/* Errors */
.err-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(100,120,255,0.06);
  transition: background 0.15s;
}
.err-row:hover { background: rgba(255,255,255,0.02); }
.err-row:last-child { border-bottom: none; }
.err-code {
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}
.code-500 { background: rgba(239,68,68,0.15);  color: #ef4444; }
.code-401 { background: rgba(245,158,11,0.15); color: #f59e0b; }
.code-404 { background: rgba(79,110,247,0.15); color: #4f6ef7; }
.code-other { background: rgba(139,92,246,0.15); color: #8b5cf6; }
.err-info { flex: 1; min-width: 0; }
.err-path { font-family: 'Space Mono', monospace; font-size: 11px; color: #c8d0f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.err-msg  { font-size: 11px; color: var(--dim, #8892b0); margin-top: 2px; }
.err-meta { text-align: right; flex-shrink: 0; }
.err-count { font-size: 12px; font-weight: 700; color: #ef4444; }
.err-time  { font-size: 10px; color: var(--dim, #8892b0); }

/* Responsive */
@media (max-width: 1100px) {
  .metrics-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .page-hdr { flex-direction: column; align-items: flex-start; }
  .kpi-grid { grid-template-columns: 1fr 1fr; }
  .page-row { grid-template-columns: 2fr 70px 50px; }
  .pr-dur, .pr-trend { display: none; }
}
</style>
