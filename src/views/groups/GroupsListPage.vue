<template>
  <div class="content">
    <div class="table-toolbar">
      <div class="toolbar-left">
        <div class="section-title">
          {{ t('groupsList.toolbar.listTitle') }}
          <span class="section-count">{{ listStore.pagination.total }}</span>
        </div>
        <div class="filter-chips">
          <button class="chip" :class="{ active: listStore.filters.type === null }" @click="filterByType(null)">
            {{ t('groupsList.toolbar.allTypes') }}
          </button>
          <button class="chip" :class="{ active: listStore.filters.type === 'group' }" @click="filterByType('group')">
            <span class="chip-dot blue"></span> {{ t('groupsList.toolbar.typeGroup') }}
          </button>
          <button class="chip" :class="{ active: listStore.filters.type === 'individual' }" @click="filterByType('individual')">
            <span class="chip-dot purple"></span> {{ t('groupsList.toolbar.typeIndividual') }}
          </button>
          <button class="chip" :class="{ active: listStore.filters.type === 'mini' }" @click="filterByType('mini')">
            <span class="chip-dot green"></span> {{ t('groupsList.toolbar.typeMini') }}
          </button>
        </div>
      </div>
      <div class="toolbar-right">
        <select class="dropdown-filter-btn" v-model.number="selectedTeacherId" @change="applyTeacherFilter">
          <option :value="0">{{ t('groupsList.toolbar.teacher') }}</option>
          <option v-for="teacher in teacherOptions" :key="teacher.id" :value="teacher.id">{{ teacher.name }}</option>
        </select>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead v-if="!listStore.loading">
          <tr>
            <th @click="sortBy('name')" style="cursor:pointer; user-select:none">
              {{ t('groupsList.table.name') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'name' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'name' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('students_count')" style="cursor:pointer; user-select:none; width: 80px;">
              {{ t('groupsList.table.studentsCount') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'students_count' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'students_count' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('teacher_id')" style="cursor:pointer; user-select:none; width: 160px;">
              {{ t('groupsList.table.teacher') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'teacher_id' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'teacher_id' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('start_day')" style="cursor:pointer; user-select:none; width: 130px;">
              {{ t('groupsList.table.startDate') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'start_day' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'start_day' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('start_time')" style="cursor:pointer; user-select:none; width: 110px;">
              {{ t('groupsList.table.startTime') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'start_time' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'start_time' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th style="width: 180px;">{{ t('groupsList.table.workdays') }}</th>
            <th @click="sortBy('age')" style="cursor:pointer; user-select:none; width: 120px;">
              {{ t('groupsList.table.age') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'age' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'age' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('last_comment_date')" style="cursor:pointer; user-select:none; width: 120px;">
              {{ t('groupsList.table.lastCommentDate') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'last_comment_date' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'last_comment_date' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th style="width: 220px;">{{ t('groupsList.table.lastComment') }}</th>
            <th style="width: 110px;">{{ t('groupsList.table.duration') }}</th>
          </tr>
        </thead>
        <tbody v-if="!listStore.loading">
          <tr v-for="group in groups" :key="group.id" class="table-row" @click="openGroup(group.id)">
            <td>
              <div class="name-cell">
                <span class="group-name-text">{{ group.name }}</span>
              </div>
            </td>
            <td>
              <div class="timer-cell">
                <button class="students-count-link" @click.stop="openStudentsByGroup(group.id)">{{ group.studentsCount }}</button>
              </div>
            </td>
            <td>
              <span class="person-name">{{ group.teacherName }}</span>
            </td>
            <td>
              <span class="date-mono">{{ formatDate(group.startDate) }}</span>
            </td>
            <td>
              <span class="date-mono">{{ formatTime(group.startTime) }}</span>
            </td>
            <td>
              <span class="person-name">{{ formatWorkdays(group.workdays) }}</span>
            </td>
            <td>
              <span class="person-name">{{ group.age || '—' }}</span>
            </td>
            <td>
              <span class="date-mono">{{ formatDate(group.lastCommentDate) }}</span>
            </td>
            <td>
              <div class="comment-text">{{ group.lastComment || t('groupsList.noComment') }}</div>
            </td>
            <td>
              <span class="date-mono">{{ formatDuration(group.startDate) }}</span>
            </td>
          </tr>
          <tr v-if="groups.length === 0">
            <td colspan="10" style="text-align: center; padding: 40px; color: var(--app-text-dim);">
              {{ t('groupsList.noGroups') }}
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
        {{ listStore.pagination.from || 0 }}-{{ listStore.pagination.to || groups.length }} / {{ listStore.pagination.total }}
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <button class="dropdown-filter-btn" :disabled="listStore.pagination.currentPage <= 1" @click="goPrevPage">←</button>
        <span class="section-count">{{ listStore.pagination.currentPage }} / {{ listStore.pagination.lastPage }}</span>
        <button class="dropdown-filter-btn" :disabled="listStore.pagination.currentPage >= listStore.pagination.lastPage" @click="goNextPage">→</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGroupsListStore } from '../../stores/groupsList.store'
import { useGlobalSearchStore } from '../../stores/globalSearch.store'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const listStore = useGroupsListStore()
const searchStore = useGlobalSearchStore()

const selectedTeacherId = ref(0)
const groups = computed(() => listStore.groups)
const teacherOptions = computed(() => {
  const options = [...listStore.teachersFilterOptions]

  if (selectedTeacherId.value > 0 && !options.some(t => t.id === selectedTeacherId.value)) {
    options.unshift({
      id: selectedTeacherId.value,
      name: typeof route.query.teacherName === 'string' && route.query.teacherName.trim()
        ? route.query.teacherName
        : `Teacher #${selectedTeacherId.value}`,
    })
  }

  return options
})

// Дебаунс поиск через global search
let searchDebounce: ReturnType<typeof setTimeout> | null = null
watch(() => searchStore.query, (val) => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(async () => {
    listStore.filters.search = val.trim()
    await listStore.applyFilters()
  }, 400)
})

function openGroup(id: number) {
  // Будущая навигация на детальную страницу группы
  console.log('Open group:', id)
}

function openStudentsByGroup(groupId: number) {
  router.push({
    name: 'students-list',
    query: { groupId: groupId.toString() },
  })
}

function parsePositiveInt(value: unknown): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

async function applyRouteTeacherFilter() {
  const routeTeacherId = parsePositiveInt(route.query.teacherId)
  selectedTeacherId.value = routeTeacherId
  listStore.filters.teacherId = routeTeacherId > 0 ? routeTeacherId : null
  await listStore.applyFilters()
}

async function sortBy(col: string) {
  listStore.setSort(col)
}


async function filterByType(type: string | null) {
  listStore.filters.type = type
  await listStore.applyFilters()
}

async function applyTeacherFilter() {
  listStore.filters.teacherId = selectedTeacherId.value > 0 ? selectedTeacherId.value : null
  await listStore.applyFilters()
}

async function goPrevPage() {
  await listStore.setPage(listStore.pagination.currentPage - 1)
}

async function goNextPage() {
  await listStore.setPage(listStore.pagination.currentPage + 1)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '—'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return '—'
  return String(timeStr).slice(0, 5)
}

function formatWorkdays(workdays: number[]): string {
  if (!workdays.length) return '—'
  const map: Record<number, string> = {
    1: t('groupsList.days.mon'),
    2: t('groupsList.days.tue'),
    3: t('groupsList.days.wed'),
    4: t('groupsList.days.thu'),
    5: t('groupsList.days.fri'),
    6: t('groupsList.days.sat'),
    7: t('groupsList.days.sun'),
  }
  return workdays.map(day => map[day]).join(', ')
}

function formatDuration(startDate: string | null): string {
  if (!startDate) return '—'

  const start = new Date(startDate)
  if (Number.isNaN(start.getTime())) return '—'

  const end = new Date()
  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()
  let days = end.getDate() - start.getDate()

  if (days < 0) {
    months -= 1
    const daysInPrevMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate()
    days += daysInPrevMonth
  }

  if (months < 0) {
    years -= 1
    months += 12
  }

  if (years < 0) return '0д / 0м / 0г'

  return `${days}д / ${months}м / ${years}г`
}

watch(
  () => route.query.teacherId,
  async (nextTeacherId, prevTeacherId) => {
    if (nextTeacherId === prevTeacherId) return
    await applyRouteTeacherFilter()
  }
)

onMounted(async () => {
  await listStore.fetchTeacherFilterOptions()

  if (route.query.teacherId) {
    await applyRouteTeacherFilter()
    return
  }

  await listStore.fetchGroups()
})
</script>

<style scoped>
/* ── КОСМИЧЕСКИЕ СТИЛИ (из StudentListPage) ── */
.content { padding: 24px 28px; }

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
.chip-dot.blue { background: var(--blue); }
.chip-dot.purple { background: var(--purple); }
.chip-dot.green { background: var(--green); }

.dropdown-filter-btn { padding: 6px 12px; border-radius: 8px; font-size: 12.5px; font-weight: 500; cursor: pointer; border: 1px solid var(--app-border); background: var(--app-surface); color: var(--app-text-main); transition: all 0.15s; outline: none; }
.dropdown-filter-btn:hover { border-color: var(--app-border-hi); }
.dropdown-filter-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.toolbar-right { display: flex; gap: 8px; align-items: center; }
.search-box { display: flex; position: relative; }
.search-btn { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; opacity: 0.6; transition: opacity 0.15s; }
.search-btn:hover { opacity: 1; }

.skeleton-row td { padding: 20px 14px; }
.skeleton-line { height: 12px; background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 6px; }
@keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── ТАБЛИЦА ── */
.table-container { background: var(--app-card); border: 1px solid var(--app-border); border-radius: 14px; overflow-x: auto; box-shadow: var(--app-shadow); }
table { width: 100%; border-collapse: collapse; text-align: left; min-width: 1200px; }
th { padding: 11px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--app-text-dim); background: var(--app-surface); border-bottom: 1px solid var(--app-border); white-space: nowrap; user-select: none; }
td { padding: 12px 14px; font-size: 13.5px; color: var(--app-text-main); border-bottom: 1px solid var(--app-border); vertical-align: middle; white-space: nowrap; }
.table-row:hover { background: var(--status-info-bg); cursor: pointer; }

/* Внутренности ячеек */
.name-cell { display: flex; flex-direction: column; }
.group-name-text { font-weight: 600; color: var(--blue); }
.person-name { font-size: 12.5px; font-weight: 500; }

.date-mono { font-family: 'Space Mono', monospace; color: var(--app-text-main); font-size: 12.5px; }

.timer-cell { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; }
.timer-days { font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700; }
.timer-label { font-size: 10px; color: #8892b0; text-transform: uppercase; }

.students-count-link {
  background: transparent;
  border: none;
  padding: 0;
  color: var(--blue);
  font-family: 'Space Mono', monospace;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.students-count-link:hover {
  text-decoration: underline;
}

.sort-icon { margin-left: 4px; }

.comment-text {
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--app-text-dim);
}

</style>
