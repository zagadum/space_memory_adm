<template>
  <div class="content">
    <!-- STATS -->
    <div class="ng-stats-grid">
      <div class="ng-stat-card blue">
        <div class="ng-stat-label">Всего групп</div>
        <div class="ng-stat-value">{{ groups.length }}</div>
        <div class="ng-stat-sub">ожидают старта</div>
        <div class="ng-stat-icon">👥</div>
      </div>
      <div class="ng-stat-card green">
        <div class="ng-stat-label">Готовы к старту</div>
        <div class="ng-stat-value">{{ readyCount }}</div>
        <div class="ng-stat-sub"><span class="up">↑ укомплектованы</span></div>
        <div class="ng-stat-icon">✅</div>
      </div>
      <div class="ng-stat-card amber">
        <div class="ng-stat-label">Среднее ожидание</div>
        <div class="ng-stat-value">{{ avgDays }}</div>
        <div class="ng-stat-sub">дней с момента создания</div>
        <div class="ng-stat-icon">⏱</div>
      </div>
      <div class="ng-stat-card cyan">
        <div class="ng-stat-label">Учеников записано</div>
        <div class="ng-stat-value">{{ totalStudents }}</div>
        <div class="ng-stat-sub">по всем новым группам</div>
        <div class="ng-stat-icon">🎓</div>
      </div>
    </div>

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
import { ref, computed, onMounted } from 'vue'
import { getNewGroups, getNewGroupStudents, getMasterStudents, getTeachers, createNewGroup, startGroup as apiStartGroup, deleteNewGroup, addStudentsToGroup, removeStudentFromGroup } from '../../api/newGroupsApi'
import type { NewGroup, NewGroupStudent, MasterStudent, NewGroupTeacher } from '../../api/newGroupsApi'
import CreateGroupModal from './components/CreateGroupModal.vue'
import StartGroupModal from './components/StartGroupModal.vue'
import GroupDetailPanel from './components/GroupDetailPanel.vue'

// ── Data ──
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
const readyCount = computed(() => groups.value.filter(g => g.paid === g.totalSlots).length)
const totalStudents = computed(() => groups.value.reduce((a, g) => a + g.totalSlots, 0))
const avgDays = computed(() => {
  if (!groups.value.length) return 0
  return Math.round(groups.value.reduce((a, g) => a + daysDiff(g.createdDate), 0) / groups.value.length)
})

const filteredGroups = computed(() => groups.value)

const sortedGroups = computed(() => {
  if (!sortCol.value) return filteredGroups.value
  return [...filteredGroups.value].sort((a, b) => {
    const va = getSortVal(a, sortCol.value)
    const vb = getSortVal(b, sortCol.value)
    return va < vb ? -sortDir.value : va > vb ? sortDir.value : 0
  })
})

// ── Helpers ──
const ageMap: Record<string, { label: string; cls: string; icon: string }> = {
  junior: { label: '5–7',   cls: 'age-junior', icon: '🟢' },
  middle: { label: '8–10',  cls: 'age-middle', icon: '🟡' },
  senior: { label: '11–14', cls: 'age-senior', icon: '🔴' },
  adult:  { label: '15+',   cls: 'age-adult',  icon: '🟣' },
}

function daysDiff(s: string) {
  const d = new Date(s), n = new Date()
  n.setHours(0,0,0,0); d.setHours(0,0,0,0)
  return Math.floor((n.getTime() - d.getTime()) / 86400000)
}

function fmtDate(s: string) {
  if (!s) return '—'
  const [y, m, d] = s.split('-')
  return `${d}.${m}.${y}`
}

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

function openStartModal(g: NewGroup) {
  startGroup.value = g
}

async function openPanel(id: number) {
  const g = groups.value.find(x => x.id === id)
  if (!g) return
  panelGroup.value = g
  panelStudents.value = []
  loadingStudents.value = true
  try {
    const res = await getNewGroupStudents(id)
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
  const res = await createNewGroup(payload)
  groups.value.unshift(res.group)
  showCreateModal.value = false
}

async function onGroupStarted(id: number) {
  await apiStartGroup(id)
  groups.value = groups.value.filter(g => g.id !== id)
  startGroup.value = null
  if (panelGroup.value?.id === id) closePanel()
}

async function onDeleteGroup(id: number) {
  await deleteNewGroup(id)
  groups.value = groups.value.filter(g => g.id !== id)
  closePanel()
}

async function onStudentsAdded(payload: { groupId: number; studentIds: number[] }) {
  await addStudentsToGroup(payload)
  const res = await getNewGroupStudents(payload.groupId)
  panelStudents.value = res.items
}

async function onStudentRemoved(payload: { groupId: number; studentName: string }) {
  await removeStudentFromGroup(payload)
  panelStudents.value = panelStudents.value.filter(s => s.name !== payload.studentName)
}

// ── Init ──
onMounted(async () => {
  const [gRes, sRes, tRes] = await Promise.all([
    getNewGroups(),
    getMasterStudents(),
    getTeachers(),
  ])
  groups.value = gRes.items
  masterStudents.value = sRes.items
  teachers.value = tRes.items
})
</script>

<style scoped>
/* ── STATS ── */
.ng-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.ng-stat-card {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 14px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  cursor: default;
}

.ng-stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  border-radius: 14px 14px 0 0;
}

.ng-stat-card.blue::before   { background: linear-gradient(90deg, #4f6ef7, #8b5cf6); }
.ng-stat-card.green::before  { background: linear-gradient(90deg, #10b981, #06b6d2); }
.ng-stat-card.amber::before  { background: linear-gradient(90deg, #f59e0b, #f97316); }
.ng-stat-card.cyan::before   { background: linear-gradient(90deg, #06b6d2, #4f6ef7); }

.ng-stat-card:hover {
  border-color: var(--app-border-hi);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.ng-stat-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--app-text-dim);
  margin-bottom: 10px;
}

.ng-stat-value {
  font-size: 26px;
  font-weight: 700;
  font-family: 'Space Mono', monospace;
  color: var(--app-text-main);
  line-height: 1;
  margin-bottom: 6px;
}

.ng-stat-sub { font-size: 11.5px; color: var(--app-text-dim); }
.ng-stat-sub .up { color: #10b981; }
.ng-stat-icon { position: absolute; top: 16px; right: 16px; font-size: 22px; opacity: 0.4; }

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
</style>
