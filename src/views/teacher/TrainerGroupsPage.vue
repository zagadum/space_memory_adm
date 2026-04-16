<template>
  <div class="trainer-groups">
    <!-- Шапка -->
    <div class="page-header">
      <div class="header-left">
        <div class="page-icon">👥</div>
        <div class="header-text">
          <h1 class="page-title">{{ t('trainerGroups.title') }}</h1>
          <p class="page-sub">{{ t('trainerGroups.subtitle') }}</p>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat-chip">
          <span class="stat-num">{{ groups.length }}</span>
          <span class="stat-label">{{ t('trainerGroups.total') }}</span>
        </div>
        <div class="stat-chip">
          <span class="stat-num">{{ totalStudents }}</span>
          <span class="stat-label">{{ t('trainerGroups.students') }}</span>
        </div>
      </div>
    </div>

    <!-- Фильтр по типу -->
    <div class="filter-bar">
      <button
        v-for="tab in typeTabs"
        :key="tab.value"
        class="tab-btn"
        :class="{ active: typeFilter === tab.value }"
        @click="typeFilter = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="state-box">
      <div v-for="i in 4" :key="i" class="skeleton-card"></div>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="state-box error-state">
      <div class="state-icon">⚠️</div>
      <p class="state-text">{{ t('common.error') }}</p>
      <button class="btn-retry" @click="loadGroups">{{ t('common.retry') }}</button>
    </div>

    <!-- Пусто -->
    <div v-else-if="filteredGroups.length === 0" class="state-box empty-state">
      <div class="state-icon">📭</div>
      <p class="state-text">{{ t('trainerGroups.empty') }}</p>
    </div>

    <!-- Список групп -->
    <div v-else class="groups-list">
      <div
        v-for="group in filteredGroups"
        :key="group.id"
        class="group-row"
      >
        <!-- Иконка типа -->
        <div class="type-badge" :class="group.type">
          {{ typeEmoji(group.type) }}
        </div>

        <!-- Основная информация -->
        <div class="group-main">
          <div class="group-name">{{ group.name }}</div>
          <div class="group-meta">
            <span class="meta-item">👨‍🏫 {{ group.teacherName }}</span>
            <span class="meta-item">📅 {{ group.startDate }}</span>
            <span class="meta-item" v-if="group.durationDays">
              ⏱ {{ group.durationDays }} {{ t('trainerGroups.days') }}
            </span>
          </div>
          <!-- Последний комментарий -->
          <div v-if="group.lastComment" class="last-comment">
            💬 {{ group.lastComment }}
            <span class="comment-date">{{ group.lastCommentDate }}</span>
          </div>
        </div>

        <!-- Студенты -->
        <div class="students-count">
          <span class="count-num">{{ group.students_count }}</span>
          <span class="count-label">{{ t('trainerGroups.pupils') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTeacherFilter } from '../../composables/useTeacherFilter'
import { useGlobalSearchStore } from '../../stores/globalSearch.store'
import { http } from '../../api/http'

const { t } = useI18n()
const { isTeacher, teacherId } = useTeacherFilter()
const searchStore = useGlobalSearchStore()

interface Group {
  id: number
  name: string
  type: 'group' | 'mini' | 'individual'
  students_count: number
  teacherName: string
  lastCommentDate: string | null
  lastComment: string | null
  durationDays: number
  startDate: string
}

const groups = ref<Group[]>([])
const typeFilter = ref<string>('all')
const loading = ref(false)
const error = ref(false)

const typeTabs = computed(() => [
  { value: 'all',        label: t('trainerGroups.typeAll') },
  { value: 'group',     label: t('trainerGroups.typeGroup') },
  { value: 'mini',      label: t('trainerGroups.typeMini') },
  { value: 'individual',label: t('trainerGroups.typeIndividual') },
])

const filteredGroups = computed(() => {
  let list = groups.value
  
  // Filter by type
  if (typeFilter.value !== 'all') {
    list = list.filter(g => g.type === typeFilter.value)
  }
  
  // Search
  const q = searchStore.queryLower
  if (q) {
    list = list.filter(g => 
      g.name.toLowerCase().includes(q) ||
      g.teacherName.toLowerCase().includes(q) ||
      (g.lastComment || '').toLowerCase().includes(q)
    )
  }
  
  return list
})

const totalStudents = computed(() =>
  groups.value.reduce((sum, g) => sum + (g.students_count || 0), 0)
)

function typeEmoji(type: string) {
  switch (type) {
    case 'group': return '👥'
    case 'mini': return '👫'
    case 'individual': return '👤'
    default: return '📚'
  }
}

async function loadGroups() {
  loading.value = true
  error.value = false
  try {
    const params: Record<string, any> = {}
    // Учитель видит только свои группы
    if (isTeacher.value && teacherId.value) {
      params.teacher_id = teacherId.value
    }
    const res = await http.get('groups', { params })
    groups.value = (res.data?.data || res.data || []) as Group[]
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadGroups()
})
</script>

<style scoped>
.trainer-groups {
  padding: 24px 28px;
}

/* ── Шапка ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-icon {
  font-size: 36px;
  line-height: 1;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--app-text-main);
  margin: 0 0 4px;
}

.page-sub {
  font-size: 13px;
  color: var(--app-text-dim);
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 12px;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  gap: 2px;
  min-width: 80px;
}

.stat-num {
  font-size: 22px;
  font-weight: 800;
  color: var(--blue);
  font-family: 'Space Mono', monospace;
}

.stat-label {
  font-size: 10px;
  color: var(--app-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Фильтр ── */
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text-dim);
  font-family: inherit;
  transition: all 0.15s;
}

.tab-btn:hover {
  border-color: var(--app-border-hi);
  color: var(--app-text-main);
}

.tab-btn.active {
  border-color: var(--blue);
  color: var(--blue);
  background: var(--status-info-bg);
}

/* ── Состояния ── */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 16px;
}

.skeleton-card {
  width: 100%;
  height: 80px;
  background: linear-gradient(90deg, var(--app-surface) 25%, rgba(255,255,255,0.05) 50%, var(--app-surface) 75%);
  background-size: 200%;
  border-radius: 14px;
  animation: skeleton 1.5s infinite;
  margin-bottom: 8px;
}

@keyframes skeleton {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.state-icon { font-size: 40px; }
.state-text { font-size: 14px; color: var(--app-text-dim); }

.btn-retry {
  padding: 8px 20px;
  background: var(--blue);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  transition: opacity 0.2s;
}
.btn-retry:hover { opacity: 0.85; }

/* ── Список ── */
.groups-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 14px;
  padding: 16px 20px;
  transition: border-color 0.18s, box-shadow 0.18s;
}

.group-row:hover {
  border-color: var(--app-border-hi);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Иконка типа */
.type-badge {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
}

.type-badge.group { background: rgba(79, 110, 247, 0.1); border-color: rgba(79, 110, 247, 0.25); }
.type-badge.mini { background: rgba(139, 92, 246, 0.1); border-color: rgba(139, 92, 246, 0.25); }
.type-badge.individual { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.25); }

/* Основная инфо */
.group-main {
  flex: 1;
  min-width: 0;
}

.group-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--app-text-main);
  margin-bottom: 6px;
}

.group-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 6px;
}

.meta-item {
  font-size: 12px;
  color: var(--app-text-dim);
  white-space: nowrap;
}

.last-comment {
  font-size: 12px;
  color: var(--app-text-dim);
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-date {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  color: var(--app-text-dim);
  opacity: 0.7;
}

/* Счётчик учеников */
.students-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 56px;
  flex-shrink: 0;
}

.count-num {
  font-size: 20px;
  font-weight: 800;
  color: var(--blue);
  font-family: 'Space Mono', monospace;
  line-height: 1;
}

.count-label {
  font-size: 10px;
  color: var(--app-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 2px;
}
</style>
