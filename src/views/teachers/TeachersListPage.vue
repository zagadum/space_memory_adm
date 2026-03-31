<template>
  <div class="content">
    <div class="table-toolbar">
      <div class="toolbar-left">
        <div class="section-title">
          {{ t('teachersList.toolbar.listTitle') }}
          <span class="section-count">{{ listStore.pagination.total }}</span>
        </div>
      </div>
      <div class="toolbar-right">
        <select class="dropdown-filter-btn" v-model="selectedCity" @change="applyCityFilter">
          <option value="">{{ t('teachersList.toolbar.allCities') }}</option>
          <option v-for="city in uniqueCities" :key="city" :value="city">{{ city }}</option>
        </select>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead v-if="!listStore.loading">
          <tr>
            <th @click="sortBy('lastName')" style="cursor:pointer; user-select:none">
              {{ t('teachersList.table.name') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'lastName' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'lastName' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th style="width: 140px;">{{ t('teachersList.table.phone') }}</th>
            <th style="width: 200px;">{{ t('teachersList.table.email') }}</th>
            <th @click="sortBy('groupLessonsCount')" style="cursor:pointer; user-select:none; width: 100px; text-align: center;">
              {{ t('teachersList.table.groupLessons') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'groupLessonsCount' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'groupLessonsCount' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('individualLessonsCount')" style="cursor:pointer; user-select:none; width: 100px; text-align: center;">
              {{ t('teachersList.table.individualLessons') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'individualLessonsCount' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'individualLessonsCount' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th @click="sortBy('city')" style="cursor:pointer; user-select:none; width: 120px;">
              {{ t('teachersList.table.city') }} <span class="sort-icon" :style="{ color: listStore.sorting.orderBy === 'city' ? 'var(--blue)' : 'inherit' }">{{ listStore.sorting.orderBy === 'city' ? (listStore.sorting.orderDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th style="width: 250px;">{{ t('teachersList.table.comment') }}</th>
          </tr>
        </thead>
        <tbody v-if="!listStore.loading">
          <tr v-for="teacher in teachers" :key="teacher.id" class="table-row" @click="openTeacher(teacher.id)">
            <td>
              <div class="name-cell">
                <span class="teacher-name">{{ teacher.lastName }} {{ teacher.firstName }}</span>
              </div>
            </td>
            <td>
              <span class="date-mono">{{ teacher.phone }}</span>
            </td>
            <td>
              <a :href="`mailto:${teacher.email}`" class="email-link" @click.stop>{{ teacher.email }}</a>
            </td>
            <td style="text-align: center;">
              <span class="timer-days" :class="{ 'count-zero': teacher.groupLessonsCount === 0 }">{{ teacher.groupLessonsCount }}</span>
            </td>
            <td style="text-align: center;">
              <span class="timer-days" :class="{ 'count-zero': teacher.individualLessonsCount === 0 }">{{ teacher.individualLessonsCount }}</span>
            </td>
            <td>
              <span class="city-text">{{ teacher.city }}</span>
            </td>
            <td>
              <div class="comment-text">{{ teacher.comment || '—' }}</div>
            </td>
          </tr>
          <tr v-if="teachers.length === 0">
            <td colspan="7" style="text-align: center; padding: 40px; color: var(--app-text-dim);">
              {{ t('teachersList.noTeachers') }}
            </td>
          </tr>
        </tbody>

        <!-- Loading Skeletons -->
        <tbody v-else>
          <tr v-for="i in 10" :key="i" class="skeleton-row">
            <td colspan="7"><div class="skeleton-line"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="table-toolbar" style="margin-top: 12px;">
      <div class="section-count">
        {{ listStore.pagination.from || 0 }}-{{ listStore.pagination.to || teachers.length }} / {{ listStore.pagination.total }}
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
import { useTeachersListStore } from '../../stores/teachersList.store'
import { useGlobalSearchStore } from '../../stores/globalSearch.store'

const router = useRouter()
const { t } = useI18n()
const listStore = useTeachersListStore()
const searchStore = useGlobalSearchStore()

const selectedCity = ref('')
const teachers = computed(() => listStore.teachers)

// Дебаунс поиск через global search
let searchDebounce: ReturnType<typeof setTimeout> | null = null
watch(() => searchStore.query, (val) => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(async () => {
    listStore.filters.search = val.trim()
    await listStore.applyFilters()
  }, 400)
})

const uniqueCities = computed(() => {
  const cities = listStore.teachers.map(t => t.city)
  return [...new Set(cities)].sort()
})

function openTeacher(id: number) {
  console.log('Open teacher:', id)
}

async function sortBy(col: string) {
  listStore.setSort(col)
}

async function applyCityFilter() {
  listStore.filters.city = selectedCity.value || null
  await listStore.applyFilters()
}

async function goPrevPage() {
  await listStore.setPage(listStore.pagination.currentPage - 1)
}

async function goNextPage() {
  await listStore.setPage(listStore.pagination.currentPage + 1)
}

onMounted(() => {
  listStore.fetchTeachers()
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
table { width: 100%; border-collapse: collapse; text-align: left; min-width: 1100px; }
th { padding: 11px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--app-text-dim); background: var(--app-surface); border-bottom: 1px solid var(--app-border); white-space: nowrap; user-select: none; }
td { padding: 12px 14px; font-size: 13.5px; color: var(--app-text-main); border-bottom: 1px solid var(--app-border); vertical-align: middle; white-space: nowrap; }
.table-row:hover { background: var(--status-info-bg); cursor: pointer; }

/* Внутренности ячеек */
.name-cell { display: flex; flex-direction: column; }
.teacher-name { font-weight: 600; color: var(--app-text-main); font-size: 13.5px; }

.date-mono { font-family: 'Space Mono', monospace; color: var(--app-text-main); font-size: 12.5px; }

.timer-days { font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700; }

.sort-icon { margin-left: 4px; }

.city-text { font-size: 12.5px; font-weight: 500; }

.comment-text {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--app-text-dim);
}

/* Email link */
.email-link {
  color: var(--blue);
  text-decoration: none;
  font-size: 12px;
  transition: color 0.15s;
  font-family: 'Space Mono', monospace;
}
.email-link:hover {
  color: var(--purple);
  text-decoration: underline;
}

/* Lesson count zero */
.count-zero {
  color: var(--app-text-dim);
  opacity: 0.5;
}
</style>
