<template>
  <div class="content">
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-label">{{ t('studentList.stats.activeStudents') }}</div>
        <div class="stat-value">{{ listStore.pagination.total }}</div>
        <div class="stat-sub">{{ t('studentList.stats.totalInSystem') }}</div>
        <div class="stat-icon">👩‍🚀</div>
      </div>
      <!-- Paid card removed as per backend request to avoid extra payments API load -->
      <div class="stat-card amber">
        <div class="stat-label">{{ t('studentList.stats.avgTraining') }}</div>
        <div class="stat-value">124</div>
        <div class="stat-sub"><span class="warn">{{ t('studentList.stats.avgDays') }}</span></div>
        <div class="stat-icon">⏱</div>
      </div>
      <div class="stat-card cyan">
        <div class="stat-label">{{ t('studentList.stats.noContact7') }}</div>
        <div class="stat-value">{{ students.filter(s => (s.daysSinceContact ?? 0) >= 7).length }}</div>
        <div class="stat-sub">{{ t('studentList.stats.requireAttention') }}</div>
        <div class="stat-icon">⚠️</div>
      </div>
    </div>

    <div class="table-toolbar">
      <div class="toolbar-left">
        <div class="section-title">
          {{ t('studentList.toolbar.listTitle') }}
          <span class="section-count">{{ t('common.studentsCount', { n: listStore.pagination.total }) }}</span>
        </div>
        <div class="filter-chips">
          <button class="chip" :class="{ active: listStore.filters.withoutContact7Plus }" @click="toggleWithoutContact">
            <span class="chip-dot amber"></span> {{ t('studentList.toolbar.noContact7') }}
          </button>
          <button class="chip" :class="{ active: listStore.filters.onlyMine }" @click="toggleOnlyMine">
            <span class="chip-dot blue"></span> {{ t('studentList.toolbar.onlyMine') }}
          </button>
        </div>
      </div>
      <div class="toolbar-right">
        <div class="search-box">
          <input
            v-model="searchInput"
            class="dropdown-filter-btn"
            style="min-width: 220px;"
            :placeholder="t('common.search')"
            @keyup.enter="applySearch"
          />
          <button class="search-btn" @click="applySearch">🔍</button>
        </div>
        <select class="dropdown-filter-btn" v-model.number="selectedGroupId" @change="applySelectFilters">
          <option :value="0">{{ t('studentList.toolbar.group') }}</option>
          <option v-for="group in listStore.groupsFilterOptions" :key="group.id" :value="group.id">{{ group.name }}</option>
        </select>
        <select class="dropdown-filter-btn" v-model.number="selectedTeacherId" @change="applySelectFilters">
          <option :value="0">{{ t('studentList.toolbar.teacher') }}</option>
          <option v-for="teacher in listStore.teachersFilterOptions" :key="teacher.id" :value="teacher.id">{{ teacher.name }}</option>
        </select>
      </div>
    </div>

    <div class="table-container">
      <table id="studentsTable">
        <thead v-if="!listStore.loading">
          <tr>
            <th @click="sortBy('full_name')" style="cursor:pointer; user-select:none">
              {{ t('studentList.table.name') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'full_name' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'full_name' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('created_at')" style="cursor:pointer; user-select:none">
              {{ t('studentList.table.startDate') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'created_at' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'created_at' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('training_term_days')" style="cursor:pointer; user-select:none">
              {{ t('studentList.table.trainingTerm') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'training_term_days' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'training_term_days' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>{{ t('studentList.table.school') }}</th>
            <th>{{ t('studentList.table.teacher') }}</th>
            <th>{{ t('studentList.table.group') }}</th>
            <th @click="sortBy('last_contact_at')" style="cursor:pointer; user-select:none">
              {{ t('studentList.table.lastContact') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'last_contact_at' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'last_contact_at' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th>{{ t('studentList.table.whoTalked') }}</th>
            <th class="comment-header">{{ t('studentList.table.lastComment') }}</th>
            <th class="actions-header">···</th>
          </tr>
        </thead>
        <tbody v-if="!listStore.loading">
          <tr v-for="student in students" :key="student.id" class="table-row" @click="openStudent(student.id)">
            <td>
              <div class="name-cell">
                <span class="student-name">{{ student.name }}</span>
                <span class="student-meta">{{ student.phone }}</span>
              </div>
            </td>
            <td><span class="date-mono">{{ student.startDate || "—" }}</span></td>
            <td>
              <div class="timer-cell">
                <span class="timer-days" :class="{ 'high-alert': (student.daysSinceContact || 0) > 10 }">
                  {{ student.daysInSystem || 0 }}
                </span>
                <span class="timer-label">дн.</span>
              </div>
            </td>
            <td>
              <div class="enrollment-list">
                <div v-for="(en, idx) in student.enrollments" :key="idx" class="enrollment-item">
                  <span class="school-name">{{ en.school }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="enrollment-list">
                <div v-for="(en, idx) in student.enrollments" :key="idx" class="enrollment-item">
                  <span class="person-name">{{ en.teacher }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="enrollment-list">
                <div v-for="(en, idx) in student.enrollments" :key="idx" class="enrollment-item">
                  <div class="group-cell">
                    <span class="group-dot" :style="{ background: student.groupColor || '#4f6ef7' }"></span>
                    <span class="group-name">{{ en.group }}</span>
                  </div>
                </div>
              </div>
            </td>
            <!-- 6: Последний контакт -->
            <td>
              <div class="last-contact-cell">
                <span class="date-mono">{{ student.lastContact || "—" }}</span>
                <button class="contact-edit-btn" @click.stop="openContactModal(student)">✎</button>
              </div>
            </td>
            <td>
              <div class="person-cell">
                <div class="mini-avatar" :style="{ background: student.avatarColor || '#4f6ef7' }">{{ student.staffInitials }}</div>
                <span class="person-name">{{ student.staff }}</span>
              </div>
            </td>
            <td>
              <div class="comment-cell" :title="student.comment">{{ student.comment || "—" }}</div>
            </td>
            <td>
              <div class="actions-wrap" @click.stop>
                <button class="actions-btn" @click="toggleActions(student.id)">⋮</button>
                <div class="actions-dropdown" :class="{ open: activeActionId === student.id }">
                  <div class="action-item" @click="openStudent(student.id); activeActionId = null">👤 {{ t('studentList.actions.openProfile') }}</div>
                  <div class="action-item" @click="openContactModal(student); activeActionId = null">📞 {{ t('studentList.actions.updateContact') }}</div>
                  <div class="action-item" @click="activeActionId = null">👥 {{ t('studentList.actions.changeManager') }}</div>
                  <div class="action-item" @click="activeActionId = null">✉️ {{ t('studentList.actions.sendEmail') }}</div>
                  <div class="action-divider"></div>
                  <div class="action-item danger" @click="activeActionId = null">📂 {{ t('studentList.actions.toArchive') }}</div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Loading Skeletons -->
        <tbody v-else>
          <tr v-for="i in 10" :key="i" class="skeleton-row">
            <td colspan="10"><div class="skeleton-line"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="table-toolbar" style="margin-top: 12px;">
      <div class="section-count">
        {{ listStore.pagination.from || 0 }}-{{ listStore.pagination.to || students.length }} / {{ listStore.pagination.total }}
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <button class="dropdown-filter-btn" :disabled="listStore.pagination.currentPage <= 1" @click="goPrevPage">←</button>
        <span class="section-count">{{ listStore.pagination.currentPage }} / {{ listStore.pagination.lastPage }}</span>
        <button class="dropdown-filter-btn" :disabled="listStore.pagination.currentPage >= listStore.pagination.lastPage" @click="goNextPage">→</button>
      </div>
    </div>

    <!-- Модальное окно "Контакт" -->
    <div class="modal-backdrop" :class="{ active: isContactModalOpen }" @click.self="closeContactModal">
      <div class="modal">
        <div class="popup-title">{{ t('studentList.modal.editContact', { name: editingStudent?.name }) }}</div>
        <div class="popup-sub">{{ t('studentList.modal.sub') }}</div>

        <div class="popup-label-row">
          <label class="popup-label">{{ t('studentList.modal.dateTime') }}</label>
          <button class="quick-date-btn" @click="setNow">⚡ {{ t('studentList.modal.justNow') }}</button>
        </div>
        <input type="datetime-local" v-model="contactDateTimeForm" class="modal-input">

        <label class="popup-label">{{ t('studentList.modal.comment') }}</label>
        <input type="text" v-model="contactCommentForm" class="popup-input" :placeholder="t('studentList.modal.commentPlaceholder')">

        <div class="popup-actions">
          <button class="btn btn-ghost" @click="closeContactModal">{{ t('common.cancel') }}</button>
          <button class="btn btn-primary" @click="saveContact">{{ t('common.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
// Подключаем наш новый стор
import { useStudentsListStore } from '../../stores/studentsList.store'

const router = useRouter()
const { t } = useI18n()
// Инициализируем стор
const listStore = useStudentsListStore()

function openStudent(id: number | string) {
  router.push({ name: 'student-payments', params: { id: id.toString() } })
}

const searchInput = ref(listStore.filters.search);
const selectedGroupId = ref(0);
const selectedTeacherId = ref(0);
const students = computed(() => listStore.students);

// ── ВЫПАДАЮЩЕЕ МЕНЮ ДЕЙСТВИЙ ──
const activeActionId = ref<number | string | null>(null);

function toggleActions(id: number | string) {
  activeActionId.value = activeActionId.value === id ? null : id;
}

// ── СОРТИРОВКА ──
async function sortBy(col: string) {
  const newDir = listStore.sorting.orderBy === col && listStore.sorting.orderDirection === "asc" ? "desc" : "asc";
  listStore.setSort(col, newDir);
  await listStore.fetchStudents(1);
}

async function applySearch() {
  listStore.filters.search = searchInput.value.trim();
  await listStore.applyFilters();
}

async function applySelectFilters() {
  listStore.filters.groupId = selectedGroupId.value > 0 ? selectedGroupId.value : null;
  listStore.filters.teacherId = selectedTeacherId.value > 0 ? selectedTeacherId.value : null;
  await listStore.applyFilters();
}

async function toggleWithoutContact() {
  listStore.filters.withoutContact7Plus = !listStore.filters.withoutContact7Plus
  await listStore.applyFilters()
}

async function toggleOnlyMine() {
  listStore.filters.onlyMine = !listStore.filters.onlyMine
  await listStore.applyFilters()
}

async function goPrevPage() {
  await listStore.setPage(listStore.pagination.currentPage - 1)
}

async function goNextPage() {
  await listStore.setPage(listStore.pagination.currentPage + 1)
}

// ── МОДАЛЬНОЕ ОКНО "КОНТАКТ" ──
const isContactModalOpen = ref(false)
const editingStudent = ref<any>(null)
const contactDateTimeForm = ref('')
const contactCommentForm = ref('')

function openContactModal(student: any) {
  editingStudent.value = student
  
  // По умолчанию ставим текущие дату и время
  setNow()
  
  contactCommentForm.value = student.comment
  isContactModalOpen.value = true
}

function setNow() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  // Формат YYYY-MM-DDTHH:mm для datetime-local
  contactDateTimeForm.value = new Date(now.getTime() - offset).toISOString().slice(0, 16)
}

function closeContactModal() {
  isContactModalOpen.value = false
  editingStudent.value = null
}

function saveContact() {
  if (editingStudent.value) {
    const student = students.value.find(s => s.id === editingStudent.value.id)
    if (student) {
      // Конвертируем YYYY-MM-DDTHH:mm в DD.MM.YYYY, HH:mm
      if (contactDateTimeForm.value) {
        const [datePart, timePart] = contactDateTimeForm.value.split('T')
        const [y, m, d] = datePart.split('-')
        student.lastContact = `${d}.${m}.${y}, ${timePart}`
      } else {
        student.lastContact = ''
      }
      student.comment = contactCommentForm.value
    }
  }
  closeContactModal()
}

// ── ВЫПАДАЮЩЕЕ МЕНЮ ДЕЙСТВИЙ ──
const activeDropdownId = ref<string | null>(null)

function toggleDropdown(id: string | number) {
  const sId = id.toString()
  activeDropdownId.value = activeDropdownId.value === sId ? null : sId
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.actions-wrap')) {
    activeDropdownId.value = null
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
  listStore.fetchStudents()
  listStore.fetchFilterOptions()
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* ── КОСМИЧЕСКИЕ СТИЛИ (Исправленные) ── */
.content { padding: 24px 28px; }

/* Статистика */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: var(--app-card); border: 1px solid var(--app-border); border-radius: 14px; padding: 20px; position: relative; overflow: hidden; transition: all 0.3s; box-shadow: var(--app-shadow); }
.stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 14px 14px 0 0; }
.stat-card.blue::before { background: linear-gradient(90deg, #4f6ef7, #8b5cf6); }
.stat-card.green::before { background: linear-gradient(90deg, #10b981, #06b6d4); }
.stat-card.amber::before { background: linear-gradient(90deg, #f59e0b, #f97316); }
.stat-card.cyan::before { background: linear-gradient(90deg, #06b6d4, #4f6ef7); }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,0.12); border-color: var(--app-border-hi); }
.stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--app-text-dim); margin-bottom: 10px; }
.stat-value { font-size: 26px; font-weight: 700; font-family: 'Space Mono', monospace; color: var(--app-text-main); margin-bottom: 6px; }
.stat-sub { font-size: 11.5px; color: var(--app-text-dim); }
.stat-sub .up { color: var(--green); }
.stat-sub .warn { color: var(--amber); }
.stat-icon { position: absolute; top: 16px; right: 16px; font-size: 22px; opacity: 0.6; }

/* Тулбар и фильтры */
.table-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.toolbar-left { display: flex; align-items: center; gap: 12px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--app-text-main); display: flex; align-items: center; gap: 8px; }
.section-count { font-size: 11px; font-family: 'Space Mono', monospace; background: var(--status-info-bg); color: var(--blue); border: 1px solid var(--app-border); padding: 2px 8px; border-radius: 8px; }

.filter-chips { display: flex; gap: 6px; }
.chip { display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1px solid var(--app-border); background: var(--app-surface); color: var(--app-text-dim); transition: all 0.15s; }
.chip:hover { border-color: var(--app-border-hi); color: var(--app-text-main); }
.chip.active { border-color: var(--blue); color: var(--blue); background: var(--status-info-bg); }
.chip-dot { width: 6px; height: 6px; border-radius: 50%; }
.chip-dot.amber { background: var(--amber); }
.chip-dot.blue { background: var(--blue); }

.dropdown-filter-btn { padding: 6px 12px; border-radius: 8px; font-size: 12.5px; font-weight: 500; cursor: pointer; border: 1px solid var(--app-border); background: var(--app-surface); color: var(--app-text-main); transition: all 0.15s; outline: none; }
.dropdown-filter-btn:hover { border-color: var(--app-border-hi); }
.dropdown-filter-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── ПАГИНАЦИЯ ── */
.pagination-footer { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(100,120,255,0.1); }
.pagination-info { font-size: 13px; color: #8892b0; }
.pagination-controls { display: flex; align-items: center; gap: 12px; }
.page-numbers { display: flex; gap: 6px; }
.page-num { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid rgba(100,120,255,0.15); background: rgba(255,255,255,0.04); color: #8892b0; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.page-num:hover { border-color: rgba(120,140,255,0.35); color: #e8eeff; }
.page-num.active { background: #4f6ef7; border-color: #4f6ef7; color: white; box-shadow: 0 0 15px rgba(79,110,247,0.3); }

.action-divider { height: 1px; background: rgba(100,120,255,0.1); margin: 4px 0; }

.toolbar-right { display: flex; gap: 8px; align-items: center; }
.search-box { display: flex; position: relative; }
.search-btn { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; opacity: 0.6; transition: opacity 0.15s; }
.search-btn:hover { opacity: 1; }

.skeleton-row td { padding: 20px 14px; }
.skeleton-line { height: 12px; background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 6px; }
@keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── ИДЕАЛЬНАЯ ТАБЛИЦА ── */
.table-container { background: var(--app-card); border: 1px solid var(--app-border); border-radius: 14px; overflow-x: auto; box-shadow: var(--app-shadow); }
table { width: 100%; border-collapse: collapse; text-align: left; min-width: 1200px; /* <- ЭТО СПАСЕТ ОТ СЖАТИЯ */ }
th { padding: 11px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--app-text-dim); background: var(--app-surface); border-bottom: 1px solid var(--app-border); white-space: nowrap; user-select: none; }
td { padding: 12px 14px; font-size: 13.5px; color: var(--app-text-main); border-bottom: 1px solid var(--app-border); vertical-align: middle; white-space: nowrap; }
.table-row:hover { background: var(--status-info-bg); cursor: pointer; }

/* Специфичные колонки */
.comment-header { width: 100%; } /* Комментарий забирает всё свободное место */
.actions-header { width: 50px; text-align: center; }

/* Внутренности ячеек */
.name-cell { display: flex; flex-direction: column; }
.student-name { font-weight: 600; color: var(--blue); text-decoration: none; transition: color 0.15s; }
.student-name:hover { color: var(--blue-hi); text-decoration: underline; }
.student-meta { font-size: 11px; color: var(--app-text-dim); margin-top: 2px; font-family: 'Space Mono', monospace; }

.date-mono { font-family: 'Space Mono', monospace; color: var(--app-text-main); font-size: 12.5px; }

.timer-cell { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; }
.timer-days { font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700; }
.timer-days.high-alert { color: #ef4444; }
.timer-label { font-size: 10px; color: #8892b0; text-transform: uppercase; }

.group-cell { display: flex; align-items: center; gap: 7px; }
.group-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.group-name { font-size: 12.5px; }

.enrollment-list { display: flex; flex-direction: column; gap: 6px; }
.enrollment-item { height: 20px; display: flex; align-items: center; white-space: nowrap; font-size: 13.5px; }
.school-name { color: #8892b0; font-weight: 500; font-size: 12.5px; }

.person-cell { display: flex; align-items: center; gap: 7px; }
.mini-avatar { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: white; }
.person-name { font-size: 12.5px; font-weight: 500; }

.comment-cell { max-width: 250px; overflow: hidden; text-overflow: ellipsis; font-size: 12.5px; color: #8892b0; font-style: italic; white-space: nowrap; }

.actions-wrap { display: flex; justify-content: center; position: relative; }
.actions-btn { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid transparent; color: #8892b0; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; font-size: 16px; }
.actions-btn:hover { background: rgba(79,110,247,0.1); border-color: rgba(120,140,255,0.35); color: #e8eeff; }

.actions-dropdown { position: absolute; top: calc(100% + 5px); right: 0; background: var(--app-card); border: 1px solid var(--app-border); border-radius: 10px; padding: 6px; min-width: 180px; z-index: 300; display: none; box-shadow: var(--app-shadow); backdrop-filter: blur(10px); }
.actions-dropdown.open { display: block; }

.action-item { padding: 8px 12px; font-size: 12.5px; border-radius: 6px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 8px; color: var(--app-text-dim); }
.action-item:hover { background: var(--status-info-bg); color: var(--app-text-main); }
.action-item.danger { color: #ef4444; }
.action-item.danger:hover { background: rgba(239,68,68,0.1); }

/* ── НОВЫЕ СТИЛИ ДЛЯ КОНТАКТА И МОДАЛКИ ── */
.last-contact-cell { display: flex; align-items: center; gap: 6px; }
.contact-edit-btn { width: 22px; height: 22px; border-radius: 5px; background: rgba(79,110,247,0.1); border: 1px solid rgba(79,110,247,0.2); color: #4f6ef7; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; font-size: 11px; }
.contact-edit-btn:hover { background: rgba(79,110,247,0.25); box-shadow: 0 0 8px rgba(79,110,247,0.3); }

.modal-backdrop { position: fixed; inset: 0; background: rgba(4,4,15,0.45); backdrop-filter: blur(8px); z-index: 500; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.25s; }
.modal-backdrop.active { opacity: 1; pointer-events: all; }
.modal { background: var(--app-card); border: 1px solid var(--app-border); border-radius: 16px; padding: 28px; width: 500px; box-shadow: var(--app-shadow-lg); }

.popup-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; color: var(--app-text-main); }
.popup-sub { font-size: 13px; color: var(--app-text-dim); margin-bottom: 24px; }
.popup-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #8892b0; margin-bottom: 8px; display: block; }

.popup-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.quick-date-btn { background: rgba(79,110,247,0.15); border: 1px solid rgba(79,110,247,0.3); color: #4f6ef7; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; cursor: pointer; transition: all 0.15s; text-transform: uppercase; letter-spacing: 0.05em; }
.quick-date-btn:hover { background: rgba(79,110,247,0.25); border-color: #4f6ef7; color: #fff; }

.popup-input, .modal-input { width: 100%; background: var(--app-surface); border: 1px solid var(--app-border); border-radius: 10px; padding: 12px 16px; color: var(--app-text-main); font-family: inherit; font-size: 14px; outline: none; transition: all 0.2s; margin-bottom: 20px; }
.popup-input:focus, .modal-input:focus { border-color: var(--blue); background: var(--app-card); box-shadow: 0 0 12px rgba(79, 110, 247, 0.15); }
/* Стили для иконки календаря в Chrome/Safari */
.modal-input::-webkit-calendar-picker-indicator { filter: invert(0.8) sepia(100%) saturate(1000%) hue-rotate(190deg); cursor: pointer; }

.popup-actions { display: flex; gap: 12px; margin-top: 8px; }
.popup-actions .btn { flex: 1; justify-content: center; padding: 12px; font-weight: 600; }
</style>
