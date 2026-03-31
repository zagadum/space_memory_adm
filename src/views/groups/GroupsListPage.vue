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
          <option :value="1">Anna Kowalska</option>
          <option :value="2">Ewa Lewandowska</option>
          <option :value="3">Tomasz Wiśniewski</option>
          <option :value="4">Maria Nowak</option>
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
            <th @click="sortBy('type')" style="cursor:pointer; user-select:none; width: 100px;">
              {{ t('groupsList.table.type') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'type' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'type' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('studentsCount')" style="cursor:pointer; user-select:none; width: 80px;">
              {{ t('groupsList.table.studentsCount') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'studentsCount' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'studentsCount' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('teacherName')" style="cursor:pointer; user-select:none; width: 160px;">
              {{ t('groupsList.table.teacher') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'teacherName' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'teacherName' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('lastCommentDate')" style="cursor:pointer; user-select:none; width: 120px;">
              {{ t('groupsList.table.lastCommentDate') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'lastCommentDate' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'lastCommentDate' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th style="width: 200px;">{{ t('groupsList.table.lastComment') }}</th>
            <th @click="sortBy('durationDays')" style="cursor:pointer; user-select:none; width: 100px;">
              {{ t('groupsList.table.duration') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'durationDays' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'durationDays' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('startDate')" style="cursor:pointer; user-select:none; width: 120px;">
              {{ t('groupsList.table.startDate') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'startDate' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'startDate' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
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
              <span class="type-badge" :class="group.type">
                {{ t(`groupsList.types.${group.type}`) }}
              </span>
            </td>
            <td>
              <div class="timer-cell">
                <span class="timer-days">{{ group.studentsCount }}</span>
              </div>
            </td>
            <td>
              <span class="person-name">{{ group.teacherName }}</span>
            </td>
            <td>
              <span class="date-mono">{{ formatDate(group.lastCommentDate) }}</span>
            </td>
            <td>
              <div class="comment-text">{{ group.lastComment || t('groupsList.noComment') }}</div>
            </td>
            <td>
              <div class="timer-cell">
                <span class="timer-days" :class="getDurationClass(group.durationDays)">{{ group.durationDays }}</span>
                <span class="timer-label">{{ t('groupsList.duration', { n: '' }).replace(/\d+/, '').trim() }}</span>
              </div>
            </td>
            <td>
              <span class="date-mono">{{ formatDate(group.startDate) }}</span>
            </td>
          </tr>
          <tr v-if="groups.length === 0">
            <td colspan="8" style="text-align: center; padding: 40px; color: var(--app-text-dim);">
              {{ t('groupsList.noGroups') }}
            </td>
          </tr>
        </tbody>

        <!-- Loading Skeletons -->
        <tbody v-else>
          <tr v-for="i in 10" :key="i" class="skeleton-row">
            <td colspan="8"><div class="skeleton-line"></div></td>
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
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGroupsListStore } from '../../stores/groupsList.store'
import { useGlobalSearchStore } from '../../stores/globalSearch.store'

const router = useRouter()
const { t } = useI18n()
const listStore = useGroupsListStore()
const searchStore = useGlobalSearchStore()

const selectedTeacherId = ref(0)
const groups = computed(() => listStore.groups)

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
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

function getDurationClass(days: number): string {
  if (days > 300) return 'high-duration'
  if (days < 60) return 'low-duration'
  return ''
}

onMounted(() => {
  listStore.fetchGroups()
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
.timer-days.high-duration { color: var(--green); }
.timer-days.low-duration { color: var(--amber); }
.timer-label { font-size: 10px; color: #8892b0; text-transform: uppercase; }

.sort-icon { margin-left: 4px; }

/* Type badges */
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}
.type-badge.group { background: rgba(79,110,247,0.1); color: var(--blue); border: 1px solid rgba(79,110,247,0.2); }
.type-badge.individual { background: rgba(139,92,246,0.1); color: var(--purple); border: 1px solid rgba(139,92,246,0.2); }
.type-badge.mini { background: rgba(16,185,129,0.1); color: var(--green); border: 1px solid rgba(16,185,129,0.2); }

/* Comment truncate */
.comment-text {
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--app-text-dim);
}
</style>
