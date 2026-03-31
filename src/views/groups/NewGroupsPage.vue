<template>
  <div class="content">
    <!-- TOOLBAR -->
    <div class="ng-toolbar">
      <div class="toolbar-left">
        <div class="section-title">
          Список групп
          <span class="section-count">{{ filteredGroups.length }} групп</span>
        </div>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">✦ Создать новую группу</button>
    </div>

    <!-- TABLE -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th @click="sort('name')">Название группы <span class="sort-icon">{{ sortIcon('name') }}</span></th>
            <th @click="sort('type')">Тип <span class="sort-icon">{{ sortIcon('type') }}</span></th>
            <th @click="sort('createdDate')">Дата создания <span class="sort-icon">{{ sortIcon('createdDate') }}</span></th>
            <th @click="sort('startDate')">Дата старта <span class="sort-icon">{{ sortIcon('startDate') }}</span></th>
            <th @click="sort('totalSlots')">Кол-во <span class="sort-icon">{{ sortIcon('totalSlots') }}</span></th>
            <th @click="sort('paid')">Оплатили / договор <span class="sort-icon">{{ sortIcon('paid') }}</span></th>
            <th @click="sort('days')">Ожидание <span class="sort-icon">{{ sortIcon('days') }}</span></th>
            <th @click="sort('manager')">Ответственный <span class="sort-icon">{{ sortIcon('manager') }}</span></th>
            <th @click="sort('age')">Возраст <span class="sort-icon">{{ sortIcon('age') }}</span></th>
            <th style="width:110px"></th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading skeleton -->
          <template v-if="isLoading">
            <tr v-for="i in 5" :key="'sk-' + i" class="table-row">
              <td><div class="skel skel-w60"></div></td>
              <td><div class="skel skel-w40"></div></td>
              <td><div class="skel skel-w40"></div></td>
              <td><div class="skel skel-w40"></div></td>
              <td><div class="skel skel-w20"></div></td>
              <td><div class="skel skel-w40"></div></td>
              <td><div class="skel skel-w20"></div></td>
              <td><div class="skel skel-w50"></div></td>
              <td><div class="skel skel-w20"></div></td>
              <td><div class="skel skel-w30"></div></td>
            </tr>
          </template>

          <!-- Данные -->
          <template v-else>
            <tr v-for="g in sortedGroups" :key="g.id" class="table-row">
              <td>
                <div class="group-name-cell" @click="openPanel(g.id)" style="cursor:pointer">
                  <div class="group-name-link">{{ g.name }}</div>
                  <div class="group-schedule">{{ g.day }}, {{ g.time }}{{ g.teacher ? ' · ' + g.teacher.name : '' }}</div>
                </div>
              </td>
              <td>
                <span :class="['type-badge', g.type === 'individual' ? 'type-individual' : 'type-group']">
                  {{ g.type === 'individual' ? '👤 Инд.' : '👥 Групп.' }}
                </span>
              </td>
              <td><span class="date-mono">{{ fmtDate(g.createdDate) }}</span></td>
              <td><span class="date-mono">{{ fmtDate(g.startDate) }}</span></td>
              <td><span class="slots-val">{{ g.totalSlots }}</span><span class="slots-label"> чел.</span></td>
              <td>
                <div class="payment-ratio">
                  <span class="ratio-text" :style="{ color: ratioColor(g) }">{{ g.paid }}/{{ g.totalSlots }}</span>
                  <div class="ratio-bar"><div class="ratio-fill" :style="{ width: pct(g) + '%' }"></div></div>
                </div>
              </td>
              <td>
                <div class="timer-cell">
                  <span :class="['timer-days', timerCls(daysDiff(g.createdDate))]">{{ daysDiff(g.createdDate) }}</span>
                  <span class="timer-label">дней</span>
                </div>
              </td>
              <td>
                <div v-if="g.manager" class="person-cell">
                  <div class="person-dot" :style="{ background: g.manager.color }">{{ g.manager.initials }}</div>
                  <span class="person-name">{{ g.manager.name }}</span>
                </div>
                <span v-else class="empty-cell">— не назначен</span>
              </td>
              <td>
                <span v-if="ageMap[g.age ?? '']" :class="['age-badge', ageMap[g.age!].cls]">
                  {{ ageMap[g.age!].icon }} {{ ageMap[g.age!].label }}
                </span>
                <span v-else class="empty-cell">—</span>
              </td>
              <td>
                <button class="btn-start" @click.stop="openStartModal(g)">🚀 Старт</button>
              </td>
            </tr>
            <tr v-if="sortedGroups.length === 0">
              <td colspan="10" style="text-align:center;padding:40px;color:var(--dim)">Группы не найдены</td>
            </tr>
          </template>
        </tbody>
      </table>
      <div class="table-footer">
        <span style="color:var(--dim);font-size:12.5px">Показано {{ filteredGroups.length }} из {{ groups.length }} групп</span>
      </div>
    </div>

    <!-- MODALS -->
    <CreateGroupModal
      v-if="showCreateModal"
      :teachers="teachers"
      :all-students="masterStudents"
      @close="showCreateModal = false"
      @created="onGroupCreated"
    />

    <StartGroupModal
      v-if="startGroup"
      :group="startGroup"
      :all-students="masterStudents"
      :panel-students="panelStudents"
      @close="startGroup = null"
      @confirmed="onGroupStarted"
    />

    <!-- GROUP PANEL -->
    <GroupDetailPanel
      v-if="panelGroup"
      :group="panelGroup"
      :students="panelStudents"
      :master-students="masterStudents"
      :loading-students="loadingStudents"
      @close="closePanel"
      @start="openStartModal(panelGroup!)"
      @delete="onDeleteGroup"
      @students-added="onStudentsAdded"
      @student-removed="onStudentRemoved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGlobalSearchStore } from '../../stores/globalSearch.store'
import { getNewGroups, getNewGroupStudents, getMasterStudents, getTeachers, createNewGroup, startGroup as apiStartGroup, deleteNewGroup, addStudentsToGroup, removeStudentFromGroup } from '../../api/newGroupsApi'
import type { NewGroup, NewGroupStudent, MasterStudent, NewGroupTeacher } from '../../api/newGroupsApi'
import type { RecruitmentBackend } from '../../api/http'
import CreateGroupModal from './components/CreateGroupModal.vue'
import StartGroupModal from './components/StartGroupModal.vue'
import GroupDetailPanel from './components/GroupDetailPanel.vue'
import { useNotificationStore } from '../../stores/notification.store'
import { parseApiError } from '../../api/errorHelper'
import { ageMap, fmtDate, daysDiff } from '../../utils/newGroupsUtils'

// ── Data ──
const { t } = useI18n()
const route = useRoute()
const notify = useNotificationStore()
const searchStore = useGlobalSearchStore()
const recruitmentBackend = computed<RecruitmentBackend>(() => route.meta.recruitmentBackend === 'indigo' ? 'indigo' : 'default')
const isLoading = ref(false)
const groups = ref<NewGroup[]>([])
const masterStudents = ref<MasterStudent[]>([])
const teachers = ref<NewGroupTeacher[]>([])
const panelGroup = ref<NewGroup | null>(null)
const panelStudents = ref<NewGroupStudent[]>([])
const loadingStudents = ref(false)

// ── Modals ──
const showCreateModal = ref(false)
const startGroup = ref<NewGroup | null>(null)

// ── Sort ──
const sortCol = ref<string>('')
const sortDir = ref<1 | -1>(1)

// ── Computed ──
const filteredGroups = computed(() => {
  const q = searchStore.queryLower
  if (!q) return groups.value
  
  return groups.value.filter(g => {
    const searchString = [
      g.name,
      g.day,
      g.time,
      g.teacher?.name,
      g.manager?.name
    ].filter(Boolean).join(' ').toLowerCase()
    
    return searchString.includes(q)
  })
})

const sortedGroups = computed(() => {
  if (!sortCol.value) return filteredGroups.value
  return [...filteredGroups.value].sort((a, b) => {
    const va = getSortVal(a, sortCol.value)
    const vb = getSortVal(b, sortCol.value)
    return va < vb ? -sortDir.value : va > vb ? sortDir.value : 0
  })
})

// ── Helpers ──

function pct(g: NewGroup) {
  return Math.round(g.paid / g.totalSlots * 100)
}

function ratioColor(g: NewGroup) {
  const p = pct(g)
  return p === 100 ? 'var(--green)' : p >= 50 ? 'var(--amber)' : 'var(--red)'
}

function timerCls(days: number) {
  return days <= 7 ? 'low' : days <= 21 ? 'mid' : 'high'
}

function getSortVal(g: NewGroup, col: string): string | number {
  switch (col) {
    case 'name':        return g.name.toLowerCase()
    case 'type':        return g.type
    case 'startDate':   return g.startDate || ''
    case 'createdDate': return g.createdDate
    case 'totalSlots':  return g.totalSlots
    case 'paid':        return g.paid
    case 'days':        return daysDiff(g.createdDate)
    case 'manager':     return g.manager ? g.manager.name.toLowerCase() : 'яя'
    case 'age':         return g.age || 'z'
    default:            return ''
  }
}

function sort(col: string) {
  if (sortCol.value === col) sortDir.value = sortDir.value === 1 ? -1 : 1
  else { sortCol.value = col; sortDir.value = 1 }
}

function sortIcon(col: string) {
  if (sortCol.value !== col) return '↕'
  return sortDir.value === 1 ? '↑' : '↓'
}

// ── Actions ──
function openCreateModal() {
  showCreateModal.value = true
}

async function openStartModal(g: NewGroup) {
  startGroup.value = g
  // Загружаем студентов если панель не была открыта для этой группы
  const alreadyLoaded = panelGroup.value?.id === g.id && panelStudents.value.length > 0
  if (!alreadyLoaded) {
    loadingStudents.value = true
    try {
      const res = await getNewGroupStudents(g.id, recruitmentBackend.value)
      panelStudents.value = res.items
    } catch {
      // Не критично — модал всё равно откроется, просто списки будут пустые
    } finally {
      loadingStudents.value = false
    }
  }
}

async function openPanel(id: number) {
  const g = groups.value.find(x => x.id === id)
  if (!g) return
  panelGroup.value = g
  panelStudents.value = []
  loadingStudents.value = true
  try {
    const res = await getNewGroupStudents(id, recruitmentBackend.value)
    panelStudents.value = res.items
  } finally {
    loadingStudents.value = false
  }
}

function closePanel() {
  panelGroup.value = null
  panelStudents.value = []
}

async function onGroupCreated(payload: Parameters<typeof createNewGroup>[0]) {
  try {
    const res = await createNewGroup(payload, recruitmentBackend.value)
    groups.value.unshift(res.group)
    showCreateModal.value = false
    notify.addToast('Группа создана ✅', 'success')
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, 'Ошибка создания группы'), 'error')
  }
}

async function onGroupStarted(id: number) {
  try {
    await apiStartGroup(id, recruitmentBackend.value)
    groups.value = groups.value.filter(g => g.id !== id)
    startGroup.value = null
    if (panelGroup.value?.id === id) closePanel()
    notify.addToast('Группа запущена 🚀', 'success')
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, 'Ошибка запуска группы'), 'error')
  }
}

async function onDeleteGroup(id: number) {
  try {
    await deleteNewGroup(id, recruitmentBackend.value)
    groups.value = groups.value.filter(g => g.id !== id)
    closePanel()
    notify.addToast('Группа удалена', 'warning')
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, 'Ошибка удаления группы'), 'error')
  }
}

async function onStudentsAdded(payload: { groupId: number; studentIds: number[] }) {
  try {
    await addStudentsToGroup(payload, recruitmentBackend.value)
    const res = await getNewGroupStudents(payload.groupId, recruitmentBackend.value)
    panelStudents.value = res.items
    notify.addToast('Ученики добавлены ✅', 'success')
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, 'Ошибка добавления учеников'), 'error')
  }
}

async function onStudentRemoved(payload: { groupId: number; studentId: number }) {
  try {
    await removeStudentFromGroup(payload, recruitmentBackend.value)
    panelStudents.value = panelStudents.value.filter(s => Number(s.id) !== payload.studentId)
    notify.addToast('Ученик убран из группы', 'warning')
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, 'Ошибка удаления ученика'), 'error')
  }
}

// ── Init ──
watch(recruitmentBackend, async () => {
  showCreateModal.value = false
  startGroup.value = null
  closePanel()
  isLoading.value = true
  try {
    const [gRes, sRes, tRes] = await Promise.all([
      getNewGroups(recruitmentBackend.value),
      getMasterStudents(recruitmentBackend.value),
      getTeachers(recruitmentBackend.value),
    ])
    groups.value = gRes.items
    masterStudents.value = sRes.items
    teachers.value = tRes.items
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, 'Ошибка загрузки данных'), 'error')
  } finally {
    isLoading.value = false
  }
}, { immediate: true })
</script>

<style scoped>
/* ── TOOLBAR ── */
.ng-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
}

.toolbar-left { display: flex; align-items: center; gap: 12px; }

.section-title {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-count {
  font-size: 11px;
  font-family: 'Space Mono', monospace;
  background: var(--status-info-bg);
  color: #4f6ef7;
  border: 1px solid rgba(79,110,247,0.3);
  padding: 2px 8px;
  border-radius: 8px;
}

/* ── TABLE ── */
.table-container {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 14px;
  overflow: hidden;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1300px;
}

thead tr {
  background: var(--app-surface);
  border-bottom: 1px solid var(--app-border);
}

th {
  padding: 11px 13px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--app-text-dim);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: color 0.15s;
}

th:hover { color: var(--app-text-main); background: var(--app-surface-hi); }

.sort-icon { display: inline-block; margin-left: 4px; font-size: 10px; opacity: 0.5; }

tbody tr {
  border-bottom: 1px solid var(--app-border-faint);
  transition: all 0.15s;
}

tbody tr:last-child { border-bottom: none; }
tbody tr:hover { background: var(--app-surface-hi); }

td { padding: 12px 13px; font-size: 13.5px; vertical-align: middle; }

.group-name-cell { display: flex; flex-direction: column; }

.group-name-link {
  font-weight: 600;
  font-size: 13.5px;
  color: #4f6ef7;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-style: dotted;
}

.group-schedule { font-size: 11px; color: var(--app-text-dim); margin-top: 2px; }

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.type-individual { background: var(--status-info-bg); color: #8b5cf6; border: 1px solid rgba(139,92,246,0.3); }
.type-group      { background: var(--status-info-bg);  color: #4f6ef7;   border: 1px solid rgba(79,110,247,0.3); }

.age-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.age-junior { background: var(--status-success-bg); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
.age-middle { background: var(--status-warning-bg);  color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
.age-senior { background: var(--status-danger-bg);   color: #ef4444;   border: 1px solid rgba(239,68,68,0.3); }
.age-adult  { background: var(--status-info-bg);  color: #8b5cf6; border: 1px solid rgba(139,92,246,0.3); }

.date-mono { font-family: 'Space Mono', monospace; font-size: 12.5px; color: var(--app-text-main); }

.slots-val   { font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; }
.slots-label { color: var(--app-text-dim); font-size: 11px; }

.payment-ratio { display: inline-flex; align-items: center; gap: 6px; }
.ratio-text    { font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; }
.ratio-bar     { width: 42px; height: 4px; background: var(--app-border-faint); border-radius: 2px; overflow: hidden; }
.ratio-fill    { height: 100%; background: linear-gradient(90deg, #10b981, #06b6d2); border-radius: 2px; }

.timer-cell  { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; }
.timer-days  { font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700; }
.timer-label { font-size: 10px; color: var(--app-text-dim); text-transform: uppercase; letter-spacing: 0.06em; }
.timer-days.low  { color: #10b981; }
.timer-days.mid  { color: #f59e0b; }
.timer-days.high { color: #ef4444; }

.person-cell { display: flex; align-items: center; gap: 8px; }
.person-dot  {
  width: 27px; height: 27px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700;
  border: 1.5px solid rgba(255,255,255,0.1);
  flex-shrink: 0;
}
.person-name { font-size: 13px; font-weight: 500; }
.empty-cell  { color: rgba(136,146,176,0.35); font-size: 12px; font-style: italic; }

.btn-start {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(16,185,129,0.35);
  background: var(--status-success-bg);
  color: #10b981;
  white-space: nowrap;
}

.btn-start:hover {
  background: rgba(16,185,129,0.35);
  box-shadow: 0 0 12px rgba(16,185,129,0.25);
  transform: translateY(-1px);
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid var(--app-border);
}

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.2s; border: none; }
.btn-primary { background: linear-gradient(135deg, #4f6ef7, #8b5cf6); color: white; box-shadow: 0 0 16px rgba(79,110,247,0.3); }
.btn-primary:hover { box-shadow: 0 0 24px rgba(79,110,247,0.5); transform: translateY(-1px); }

/* Skeleton */
.skel {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--app-border) 25%, var(--app-surface-hi) 50%, var(--app-border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.skel-w20 { width: 20%; }
.skel-w30 { width: 30%; }
.skel-w40 { width: 40%; }
.skel-w50 { width: 50%; }
.skel-w60 { width: 60%; }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
