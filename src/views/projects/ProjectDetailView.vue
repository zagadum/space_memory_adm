<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProjectsStore } from '../../stores/projects.store'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const projectsStore = useProjectsStore()

const activeTab = ref('invoices')
const tabs = [
  { id: 'invoices', label: 'projectDetail.tabs.invoices' },
  { id: 'students', label: 'projectDetail.tabs.students' },
  { id: 'settings', label: 'projectDetail.tabs.settings' }
]

const project = computed(() => projectsStore.currentProject)
const isLoading = computed(() => projectsStore.isLoading)
const error = computed(() => projectsStore.error)

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await projectsStore.fetchProject(id)
  }
})

const goBack = () => {
  router.push('/projects')
}
</script>

<template>
  <div class="project-detail-page">
    <!-- Кнопка назад -->
    <div class="back-nav">
      <button class="back-btn" @click="goBack">
        <span class="icon">←</span> {{ t('projectDetail.back') }}
      </button>
    </div>

    <!-- Загрузка -->
    <div v-if="isLoading" class="loading-state">
      <div class="skeleton-header"></div>
      <div class="skeleton-stats">
        <div class="skeleton-card" v-for="n in 2" :key="n"></div>
      </div>
      <div class="skeleton-content"></div>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="error-state glass">
      <div class="error-icon">⚠️</div>
      <h2>{{ t('projectDetail.errorTitle') }}</h2>
      <p>{{ t('projectDetail.notFound') }}</p>
      <button class="retry-btn" @click="projectsStore.fetchProject(route.params.id as string)">
        {{ t('common.retry') }}
      </button>
    </div>

    <!-- Основной контент -->
    <div v-else-if="project" class="project-content">
      <!-- Шапка проекта -->
      <header class="project-header glass">
        <div class="project-info">
          <div class="project-icon-wrapper" :style="{ background: `var(--${project.color}-glow)` }">
            <span class="project-icon">{{ project.icon }}</span>
          </div>
          <div class="project-title-block">
            <h1>{{ project.name }}</h1>
            <div class="project-meta">
              <span class="project-code">{{ project.code }}</span>
              <span class="status-badge" :class="project.status">
                {{ t('projectDetail.statusActive') }}
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- Блок статистики -->
      <div class="stats-grid">
        <div class="stat-card glass">
          <div class="stat-icon enrolled">👥</div>
          <div class="stat-value">{{ project.stats.studentsCount }}</div>
          <div class="stat-label">{{ t('projectDetail.stats.enrolledStudents') }}</div>
        </div>
        <div class="stat-card glass">
          <div class="stat-icon invoices">📄</div>
          <div class="stat-value">{{ project.stats.invoicesCount }}</div>
          <div class="stat-label">{{ t('projectDetail.stats.invoicesIssued') }}</div>
        </div>
      </div>

      <!-- Табы -->
      <div class="tabs-container">
        <div class="tabs-nav glass">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ t(tab.label) }}
          </button>
        </div>

        <div class="tab-content glass">
          <!-- Пока заглушка под контент вкладок -->
          <div class="placeholder-content">
            <div class="placeholder-icon">🛠️</div>
            <p>{{ t(tabs.find(t => t.id === activeTab)?.label || '') }} section is under development</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-detail-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.back-nav {
  margin-bottom: 24px;
}

.back-btn {
  background: transparent;
  border: none;
  color: var(--dim);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.back-btn:hover {
  color: var(--white);
  transform: translateX(-4px);
}

/* Glassmorphism Common Styles */
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
}

/* Header Styles */
.project-header {
  padding: 32px;
  margin-bottom: 24px;
}

.project-info {
  display: flex;
  align-items: center;
  gap: 24px;
}

.project-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.project-title-block h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: var(--white);
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.project-code {
  color: var(--dim);
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.1em;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.05);
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 12px;
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  color: var(--white);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  color: var(--dim);
  font-size: 14px;
}

/* Tabs */
.tabs-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tabs-nav {
  display: flex;
  gap: 4px;
  padding: 6px;
  width: fit-content;
}

.tab-btn {
  padding: 10px 24px;
  border-radius: 14px;
  border: none;
  background: transparent;
  color: var(--dim);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--white);
}

.tab-btn.active {
  background: rgba(79, 110, 247, 0.2);
  color: var(--blue);
  box-shadow: 0 4px 12px rgba(79, 110, 247, 0.1);
}

.tab-content {
  padding: 40px;
  min-height: 400px;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--dim);
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* Skeleton Loading */
.skeleton-header {
  height: 140px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  margin-bottom: 24px;
  overflow: hidden;
  position: relative;
}

.skeleton-header::after {
  content: '';
  position: absolute;
  top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
  animation: loading 1.5s infinite;
}

@keyframes loading {
  to { left: 100%; }
}

.skeleton-card {
  height: 140px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.skeleton-content {
  height: 400px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

/* Error State */
.error-state {
  padding: 60px;
  text-align: center;
  max-width: 500px;
  margin: 100px auto;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.retry-btn {
  margin-top: 24px;
  padding: 12px 32px;
  background: var(--blue);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 110, 247, 0.3);
}
</style>
