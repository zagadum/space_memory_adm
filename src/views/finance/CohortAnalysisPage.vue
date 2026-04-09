<template>
  <div class="cohort-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ $t('cohorts.title') }}</h1>
        <p class="page-subtitle">{{ $t('cohorts.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <div class="filters">
          <select v-model="selectedYear" class="form-select">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
          <UiButton variant="primary" @click="fetchData" :loading="isLoading">
            {{ $t('common.refresh') }}
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">AVG RETENTION (M1)</div>
        <div class="stat-value">{{ avgRetention }}%</div>
        <div class="stat-trend plus">+2.4% vs prev year</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">TOTAL STUDENTS</div>
        <div class="stat-value">{{ totalStudents }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">TOP COHORT</div>
        <div class="stat-value text-green">{{ topCohort }}</div>
      </div>
    </div>

    <!-- Heatmap Table -->
    <div class="heatmap-container scard">
      <div class="scard-hdr">
        <div class="scard-title">
          <div class="scard-ico">📊</div>
          <div>{{ $t('cohorts.heatmapTitle') }}</div>
        </div>
      </div>
      
      <div class="table-responsive">
        <table class="heatmap-table">
          <thead>
            <tr>
              <th class="sticky-col">Cohort (Month)</th>
              <th>Size</th>
              <th v-for="i in 6" :key="i">Month {{ i-1 }}</th>
              <th class="avg-col">Retention</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cohortData" :key="item.cohort">
              <td class="sticky-col font-bold">{{ formatMonth(item.cohort) }}</td>
              <td class="size-col">{{ item.total_students }}</td>
              <td 
                v-for="cell in item.heatmap" 
                :key="cell.month_index"
                :style="getCellStyle(cell.percentage)"
                class="heatmap-cell"
              >
                <div class="cell-val">{{ cell.percentage }}%</div>
                <div class="cell-sub">{{ cell.paid_count }} paid</div>
              </td>
              <td class="avg-col font-mono text-dim">{{ calculateCohortAvg(item) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { cohortsApi, type CohortItem } from '../../api/cohorts.api'
import UiButton from '../../components/ui/UiButton.vue'

const { t } = useI18n()

const selectedYear = ref(new Date().getFullYear())
const years = [2024, 2025, 2026]
const isLoading = ref(false)
const cohortData = ref<CohortItem[]>([])

const totalStudents = computed(() => {
  return cohortData.value.reduce((acc, curr) => acc + curr.total_students, 0)
})

const avgRetention = computed(() => {
  if (cohortData.value.length === 0) return 0
  const m1Values = cohortData.value
    .map(c => c.heatmap.find(h => h.month_index === 1)?.percentage || 0)
    .filter(v => v > 0)
  
  if (m1Values.length === 0) return 0
  return Math.round(m1Values.reduce((a, b) => a + b, 0) / m1Values.length)
})

const topCohort = computed(() => {
  if (cohortData.value.length === 0) return '-'
  const sorted = [...cohortData.value].sort((a, b) => {
    const aVal = a.heatmap.find(h => h.month_index === 1)?.percentage || 0
    const bVal = b.heatmap.find(h => h.month_index === 1)?.percentage || 0
    return bVal - aVal
  })
  return formatMonth(sorted[0].cohort)
})

async function fetchData() {
  isLoading.value = true
  try {
    const res = await cohortsApi.getStats({ year: selectedYear.value })
    cohortData.value = res.data
  } catch (err) {
    console.error('Failed to fetch cohort stats', err)
  } finally {
    isLoading.value = false
  }
}

function formatMonth(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })
}

function getCellStyle(percentage: number) {
  if (percentage === 0) return { background: 'var(--app-surface)', color: 'var(--app-text-dim)' }
  
  // Adaptive green scale
  const alpha = Math.max(0.05, percentage / 100)
  return {
    background: `rgba(16, 185, 129, ${alpha})`,
    color: percentage > 60 ? '#fff' : 'var(--app-text-main)',
    fontWeight: percentage > 70 ? '700' : '400'
  }
}

function calculateCohortAvg(item: CohortItem) {
  const values = item.heatmap.map(h => h.percentage).filter(v => v > 0)
  if (values.length === 0) return 0
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.cohort-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--app-text-main);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--app-text-dim);
}

.filters {
  display: flex;
  gap: 12px;
}

.form-select {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  color: var(--app-text-main);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 16px;
  padding: 20px;
}

.stat-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--app-text-dim);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 900;
  color: var(--app-text-main);
}

.stat-trend {
  font-size: 12px;
  margin-top: 4px;
}

.plus { color: var(--green); }

/* Heatmap Table */
.heatmap-container {
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.heatmap-table {
  width: 100%;
  border-collapse: collapse;
}

.heatmap-table th {
  padding: 16px;
  font-size: 12px;
  font-weight: 800;
  color: var(--app-text-dim);
  text-transform: uppercase;
  background: rgba(var(--app-text-main-rgb), 0.02);
  border-bottom: 1px solid var(--app-border);
  text-align: left;
}

.heatmap-table td {
  padding: 16px;
  border-bottom: 1px solid var(--app-border);
  font-size: 13px;
}

.sticky-col {
  position: sticky;
  left: 0;
  background: var(--app-surface);
  z-index: 2;
  border-right: 1px solid var(--app-border);
}

.size-col {
  font-weight: 600;
  color: var(--app-text-dim);
  text-align: center;
}

.heatmap-cell {
  text-align: center;
  transition: transform 0.2s;
  min-width: 100px;
}

.heatmap-cell:hover {
  transform: scale(1.05);
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.cell-val {
  font-size: 14px;
  font-weight: 700;
}

.cell-sub {
  font-size: 10px;
  opacity: 0.8;
}

.avg-col {
  background: rgba(var(--app-text-main-rgb), 0.01);
  text-align: center;
  font-weight: 700;
}

.text-dim { color: var(--app-text-dim); }
.text-green { color: var(--green); }
.font-bold { font-weight: 700; }
.font-mono { font-family: 'Space Mono', monospace; }

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
