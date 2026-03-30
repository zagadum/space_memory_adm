<template>
  <div class="trainer-students">
    <!-- Заголовок -->
    <div class="page-header">
      <div class="header-left">
        <div class="page-icon">👨‍🏫</div>
        <div class="header-text">
          <h1 class="page-title">{{ t('trainerStudents.title') }}</h1>
          <p class="page-sub">{{ t('trainerStudents.subtitle') }}</p>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat-chip">
          <span class="stat-num">{{ filteredStudents.length }}</span>
          <span class="stat-label">{{ t('trainerStudents.total') }}</span>
        </div>
      </div>
    </div>

    <!-- Поиск -->
    <div class="search-bar">
      <input
        v-model="search"
        class="search-input"
        :placeholder="t('common.searchHint')"
        @input="onSearch"
      />
      <span class="search-icon">🔍</span>
    </div>

    <!-- Состояния загрузки/ошибки/пусто -->
    <div v-if="loading" class="state-box">
      <div v-for="i in 5" :key="i" class="skeleton-card"></div>
    </div>

    <div v-else-if="error" class="state-box error-state">
      <div class="state-icon">⚠️</div>
      <p class="state-text">{{ t('common.error') }}</p>
      <button class="btn-retry" @click="loadStudents">{{ t('common.retry') }}</button>
    </div>

    <div v-else-if="filteredStudents.length === 0" class="state-box empty-state">
      <div class="state-icon">📭</div>
      <p class="state-text">{{ t('trainerStudents.empty') }}</p>
    </div>

    <!-- Список учеников -->
    <div v-else class="students-grid">
      <div
        v-for="student in filteredStudents"
        :key="student.id"
        class="student-card"
        @click="openStudent(student.id)"
      >
        <!-- Аватар + имя -->
        <div class="card-header">
          <div class="avatar" :style="{ background: student.avatarColor || 'var(--blue)' }">
            {{ student.staffInitials || student.name?.substring(0,2) }}
          </div>
          <div class="card-info">
            <div class="student-name">{{ student.name }}</div>
            <div class="student-phone">{{ student.phone || '—' }}</div>
          </div>
          <div class="contact-days" :class="{ hot: (student.daysSinceContact || 0) > 7 }">
            {{ student.daysSinceContact || 0 }} дн.
          </div>
        </div>

        <!-- Группы (без финансов — учитель не видит платёжные данные) -->
        <div class="enrollments">
          <div
            v-for="(en, i) in student.enrollments"
            :key="i"
            class="enrollment-item"
          >
            <span class="group-dot"></span>
            <span class="group-name">{{ en.group }}</span>
            <span class="school-badge">{{ en.school }}</span>
          </div>
        </div>

        <!-- Нижняя строка: последний контакт -->
        <div class="card-footer">
          <span class="contact-label">{{ t('trainerStudents.lastContact') }}:</span>
          <span class="contact-date">{{ student.lastContact || '—' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth.store'
import { useTeacherFilter } from '../../composables/useTeacherFilter'
import { getStudents } from '../../api/studentApi'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { isTeacher, teacherId } = useTeacherFilter()

interface StudentItem {
  id: number | string
  name: string
  phone?: string
  avatarColor?: string
  staffInitials?: string
  daysSinceContact?: number
  lastContact?: string
  enrollments?: { school: string; group: string; teacher: string }[]
}

const students = ref<StudentItem[]>([])
const search = ref('')
const loading = ref(false)
const error = ref(false)

const filteredStudents = computed(() => {
  if (!search.value.trim()) return students.value
  const q = search.value.toLowerCase()
  return students.value.filter(s =>
    s.name.toLowerCase().includes(q) ||
    (s.phone || '').includes(q)
  )
})

async function loadStudents() {
  loading.value = true
  error.value = false
  try {
    const params: Record<string, any> = {}
    // Учитель всегда видит только своих студентов
    if (isTeacher.value && teacherId.value) {
      params.teacher_id = teacherId.value
    }
    const res = await getStudents(params)
    students.value = (res.data || []).map((s: any) => ({
      id: s.id,
      name: s.full_name || s.name || `${s.firstName} ${s.lastName}`.trim(),
      phone: s.phone,
      avatarColor: s.avatarColor || 'var(--blue)',
      staffInitials: s.initials || s.staffInitials,
      daysSinceContact: s.daysSinceContact || s.days_since_last_contact,
      lastContact: s.lastContact || s.last_contact_at,
      enrollments: s.enrollments || s.groups?.map((g: any) => ({
        school: g.school_name || 'Space Memory',
        group: g.name || '—',
        teacher: g.teacher_name || '—',
      })) || [],
    }))
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function openStudent(id: number | string) {
  router.push({ name: 'student-payments', params: { id: id.toString() } })
}

function onSearch() {
  // Поиск — локальный, фильтруется через computed
}

onMounted(() => {
  loadStudents()
})
</script>

<style scoped>
.trainer-students {
  padding: 24px 28px;
}

/* ── Шапка ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
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

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  gap: 2px;
}

.stat-num {
  font-size: 24px;
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

/* ── Поиск ── */
.search-bar {
  position: relative;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 44px 12px 16px;
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  color: var(--app-text-main);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.1);
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.45;
  pointer-events: none;
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
  height: 110px;
  background: linear-gradient(90deg, var(--app-surface) 25%, rgba(255,255,255,0.05) 50%, var(--app-surface) 75%);
  background-size: 200%;
  border-radius: 14px;
  animation: skeleton 1.5s infinite;
  margin-bottom: 12px;
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

/* ── Сетка карточек ── */
.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.student-card {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 14px;
  padding: 18px;
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
}

.student-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border-color: var(--app-border-hi);
}

/* ── Шапка карточки ── */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.student-name {
  font-weight: 600;
  color: var(--blue);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-phone {
  font-size: 12px;
  color: var(--app-text-dim);
  font-family: 'Space Mono', monospace;
  margin-top: 2px;
}

.contact-days {
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--app-text-dim);
  white-space: nowrap;
}

.contact-days.hot {
  color: #ef4444;
}

/* ── Группы ── */
.enrollments {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.enrollment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
}

.group-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--blue);
  flex-shrink: 0;
}

.group-name {
  color: var(--app-text-main);
  font-weight: 500;
}

.school-badge {
  font-size: 10px;
  padding: 2px 7px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 6px;
  color: var(--app-text-dim);
  white-space: nowrap;
}

/* ── Подвал карточки ── */
.card-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid var(--app-border);
  font-size: 12px;
}

.contact-label {
  color: var(--app-text-dim);
}

.contact-date {
  color: var(--app-text-main);
  font-family: 'Space Mono', monospace;
  font-size: 11.5px;
}
</style>
