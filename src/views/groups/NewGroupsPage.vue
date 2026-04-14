<template>
  <div class="content">
    <!-- TOOLBAR -->
    <div class="ng-toolbar">
      <div class="toolbar-left">
        <div class="section-title">
          {{ t('newGroups.listTitle') }}
          <span class="section-count">{{ t('newGroups.groupsCount', { n: filteredGroups.length }) }}</span>
        </div>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">{{ t('newGroups.createBtn') }}</button>
    </div>

    <!-- TABLE -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th @click="sort('name')">{{ t('newGroups.table.name') }} <span class="sort-icon">{{ sortIcon('name') }}</span></th>
            <th @click="sort('type')">{{ t('newGroups.table.typeAge') }} <span class="sort-icon">{{ sortIcon('type') }}</span></th>
            <th @click="sort('createdDate')">{{ t('newGroups.table.createdDate') }} <span class="sort-icon">{{ sortIcon('createdDate') }}</span></th>
            <th @click="sort('startDate')">{{ t('newGroups.table.startDate') }} <span class="sort-icon">{{ sortIcon('startDate') }}</span></th>
            <th @click="sort('studentsCount')">{{ t('newGroups.table.count') }} <span class="sort-icon">{{ sortIcon('studentsCount') }}</span></th>
            <th @click="sort('paid')">{{ t('newGroups.table.paidContract') }} <span class="sort-icon">{{ sortIcon('paid') }}</span></th>
            <th @click="sort('manager')">{{ t('newGroups.table.responsible') }} <span class="sort-icon">{{ sortIcon('manager') }}</span></th>
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
              <td><div class="skel skel-w50"></div></td>
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
                <div class="type-age-cell">
                  <span :class="['type-badge', (g.type_group ?? g.type) === 'individual' ? 'type-individual' : 'type-group']">
                    {{ (g.type_group ?? g.type) === 'individual' ? t('newGroups.typeIndividual') : t('newGroups.typeGroup') }}
                  </span>
                  <div v-if="ageMap[g.age ?? '']" class="age-info">
                    <span class="age-icon">{{ ageMap[g.age!].icon }}</span>
                    <span class="age-val">
                      {{ ageMap[g.age!].label }}
                      <span class="age-adj">{{ t('newGroups.create.ageAdjectives.' + ageMap[g.age!].key) }}</span>
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <div class="date-cell">
                  <span class="date-mono">{{ fmtDate(g.createdDate) }}</span>
                  <span class="date-timer age-old">{{ t('newGroups.daysPassed', { n: daysDiff(g.createdDate) }) }}</span>
                </div>
              </td>
              <td>
                <div class="date-cell">
                  <span class="date-mono">{{ fmtDate(g.startDate) }}</span>
                  <span v-if="g.startDate" :class="['date-timer', daysDiff(g.startDate) < 0 ? 'time-left' : 'time-passed']">
                    {{ daysDiff(g.startDate) < 0 
                      ? t('newGroups.daysLeft', { n: Math.abs(daysDiff(g.startDate)) }) 
                      : t('newGroups.daysPassed', { n: daysDiff(g.startDate) }) 
                    }}
                  </span>
                  <span v-else class="date-timer empty">—</span>
                </div>
              </td>
              <td>
                <div class="slots-cell">
                  <span class="slots-val">{{ g.studentsCount }}</span>
                  <span class="slots-label">{{ t('newGroups.persons') }}</span>
                </div>
              </td>
              <td>
                <div class="payment-ratio">
                  <span class="ratio-text" :style="{ color: ratioColor(g) }">{{ g.paid }}</span>
                  <div class="ratio-bar"><div class="ratio-fill" :style="{ width: pct(g) + '%', background: ratioColor(g) }"></div></div>
                  
                  <!-- Бейдж статуса -->
                  <div :class="['readiness-badge', readinessCls(g)]">
                    {{ readinessLabel(g) }}
                  </div>
                </div>
              </td>
              <td>
                <div v-if="g.manager" class="person-cell">
                  <div class="person-dot" :style="{ background: g.manager.color }">{{ g.manager.initials }}</div>
                  <span class="person-name">{{ g.manager.name }}</span>
                </div>
                <span v-else class="empty-cell">{{ t('newGroups.notAssigned') }}</span>
              </td>
              <td>
                <div v-if="g.studentsCount > 0" class="start-action-cell">
                  <button :class="['btn-start', { 'btn-start-ready': isReadyToStart(g) }]" @click.stop="openStartModal(g)">
                    {{ t('newGroups.startBtn') }}
                  </button>
                  <div v-if="g.studentsCount > g.paid" class="unpaid-reminder">
                    {{ t('newGroups.status.unpaidToRemove', { n: g.studentsCount - g.paid }) }}
                  </div>
                  <div v-else-if="g.studentsCount > 0 && g.studentsCount === g.paid" class="all-paid-hint">
                    {{ t('newGroups.status.allPaid') }}
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="sortedGroups.length === 0">
              <td colspan="10" style="text-align:center;padding:40px;color:var(--dim)">{{ t('newGroups.noGroups') }}</td>
            </tr>
          </template>
        </tbody>
      </table>
      <div class="table-footer">
        <span style="color:var(--dim);font-size:12.5px">{{ t('newGroups.shownOf', { shown: filteredGroups.length, total: groups.length }) }}</span>
      </div>
    </div>

    <!-- MODALS -->
    <CreateGroupModal
      v-if="showCreateModal"
      :teachers="teachers"
      :all-students="masterStudents"
      :backend="recruitmentBackend"
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

    <GroupPickerPanel
      v-model="transferPickerOpen"
      :student-name="transferPickerStudentName"
      :backend="recruitmentBackend"
      @pick="onTransferGroupPicked"
    />

    <!-- GROUP PANEL -->
    <GroupDetailPanel
      v-if="panelGroup"
      :group="panelGroup"
      :students="panelStudents"
      :master-students="masterStudents"
      :teachers="teachers"
      :loading-students="loadingStudents"
      @close="closePanel"
      @start="openStartModal(panelGroup!)"
      @delete="onDeleteGroup"
      @students-added="onStudentsAdded"
      @student-removed="onStudentRemoved"
      @student-archived="onStudentArchived"
      @student-transferred="onStudentTransferred"
      @student-email="onStudentEmail"
      @teacher-assigned="onTeacherAssigned"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGlobalSearchStore } from '../../stores/globalSearch.store'
import { useNewGroupsStore } from '../../stores/newGroups.store'
import { getNewGroupStudents, getMasterStudents, getTeachers, startGroup as apiStartGroup, deleteNewGroup, addStudentsToGroup, removeStudentFromGroup, archiveStudentFromGroup, emailStudentFromGroup, editGroup } from '../../api/newGroupsApi'
import type { NewGroup, NewGroupStudent, MasterStudent, NewGroupTeacher } from '../../api/newGroupsApi'
import type { RecruitmentBackend } from '../../api/http'
import { getRecruitmentApi } from '../../api/recruitmentApi'
import CreateGroupModal from './components/CreateGroupModal.vue'
import StartGroupModal from './components/StartGroupModal.vue'
import GroupDetailPanel from './components/GroupDetailPanel.vue'
import GroupPickerPanel from '../recruitment/components/GroupPickerPanel.vue'
import { useNotificationStore } from '../../stores/notification.store'
import { parseApiError } from '../../api/errorHelper'
import { ageMap, fmtDate, daysDiff } from '../../utils/newGroupsUtils'

// ── Data ──
const { t } = useI18n()
const route = useRoute()
const notify = useNotificationStore()
const searchStore = useGlobalSearchStore()
const newGroupsStore = useNewGroupsStore()
const recruitmentBackend = computed<RecruitmentBackend>(() => route.meta.recruitmentBackend === 'indigo' ? 'indigo' : 'default')
const isLoading = ref(false)
const groups = computed(() => newGroupsStore.groups)
const masterStudents = ref<MasterStudent[]>([])
const teachers = ref<NewGroupTeacher[]>([])
const panelGroup = ref<NewGroup | null>(null)
const panelStudents = ref<NewGroupStudent[]>([])
const loadingStudents = ref(false)

// ── Modals ──
const showCreateModal = ref(false)
const startGroup = ref<NewGroup | null>(null)
const transferPickerOpen = ref(false)
const transferStudent = ref<{ groupId: number; studentId: number; name: string } | null>(null)

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

const transferPickerStudentName = computed(() => {
  return transferStudent.value ? `${t('newStudents.groupPicker.for')}: ${transferStudent.value.name}` : ''
})

// ── Status Helpers ──

function isIndividual(g: NewGroup) {
  return (g.type_group ?? g.type) === 'individual'
}

// Группа готова к запуску: инд. — минимум 1 оплата, группа — от 5 до 10
function isReadyToStart(g: NewGroup) {
  if (isIndividual(g)) return g.paid >= 1
  return g.paid >= 5 && g.paid <= 10
}

// Progress % для полосы (база — порог минимума: 1 для инд., 5 для группы)
function pct(g: NewGroup) {
  if (isIndividual(g)) return g.paid >= 1 ? 100 : 0
  if (g.paid >= 5) return 100
  return Math.round(g.paid / 5 * 100)
}

// Цвет текста для оплат
function ratioColor(g: NewGroup) {
  if (isIndividual(g)) return g.paid >= 1 ? 'var(--green)' : 'var(--red)'
  if (g.paid < 5)   return 'var(--red)'
  if (g.paid <= 10) return 'var(--green)'
  return 'var(--blue)'
}

// Статус готовности (текст)
function readinessLabel(g: NewGroup) {
  if (isIndividual(g)) return g.paid >= 1 ? t('newGroups.status.ready') : t('newGroups.status.recruiting')
  if (g.paid < 5)   return t('newGroups.status.recruiting')
  if (g.paid <= 10) return t('newGroups.status.ready')
  return t('newGroups.status.overfilled')
}

// Цвет бейджа статуса
function readinessCls(g: NewGroup) {
  if (isIndividual(g)) return g.paid >= 1 ? 'status-ready' : 'status-recruiting'
  if (g.paid < 5)   return 'status-recruiting'
  if (g.paid <= 10) return 'status-ready'
  return 'status-overfilled'
}

function updateGroupCounters(groupId: number, studentList: NewGroupStudent[]) {
  const group = groups.value.find(x => x.id === groupId)
  if (!group) return

  const count = studentList.length
  const paid = studentList.filter(s => s.isPaid === true).length

  group.studentsCount = count
  group.paid = paid
  
  // Если вместимость не задана, ставим её равной текущему количеству (для новых групп)
  if (group.totalSlots <= 0) {
    group.totalSlots = count
  }

  // Также обновляем данные в открытой панели, если это та же группа
  if (panelGroup.value?.id === groupId) {
    panelGroup.value.studentsCount = count
    panelGroup.value.paid = paid
    if (panelGroup.value.totalSlots <= 0) {
      panelGroup.value.totalSlots = count
    }
  }
}

function getSortVal(g: NewGroup, col: string): string | number {
  switch (col) {
    case 'name':        return g.name.toLowerCase()
    case 'type':        return (g.type_group || g.type) + (g.age || '')
    case 'startDate':   return g.startDate || ''
    case 'createdDate': return g.createdDate
    case 'studentsCount': return g.studentsCount
    case 'paid':        return g.paid
    case 'manager':     return g.manager ? g.manager.name.toLowerCase() : 'яя'
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
    updateGroupCounters(id, res.items)
  } finally {
    loadingStudents.value = false
  }
}

function closePanel() {
  panelGroup.value = null
  panelStudents.value = []
}

function onGroupCreated(group: NewGroup) {
  newGroupsStore.setGroups([group, ...newGroupsStore.groups])
  showCreateModal.value = false
  notify.addToast(t('newGroups.toasts.created'), 'success')
}

async function onGroupStarted(id: number) {
  try {
    await apiStartGroup(id, recruitmentBackend.value)
    newGroupsStore.setGroups(newGroupsStore.groups.filter(g => g.id !== id))
    startGroup.value = null
    if (panelGroup.value?.id === id) closePanel()
    notify.addToast(t('newGroups.toasts.started'), 'success')
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, t('newGroups.toasts.startError')), 'error')
  }
}

async function onDeleteGroup(id: number) {
  try {
    await deleteNewGroup(id, recruitmentBackend.value)
    newGroupsStore.setGroups(newGroupsStore.groups.filter(g => g.id !== id))
    closePanel()
    notify.addToast(t('newGroups.toasts.deleted'), 'warning')
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, t('newGroups.toasts.deleteError')), 'error')
  }
}

async function onStudentsAdded(payload: { groupId: number; studentIds: number[] }) {
  try {
    await addStudentsToGroup(payload, recruitmentBackend.value)
    const res = await getNewGroupStudents(payload.groupId, recruitmentBackend.value)
    panelStudents.value = res.items
    updateGroupCounters(payload.groupId, res.items)
    notify.addToast(t('newGroups.toasts.studentsAdded'), 'success')
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, t('newGroups.toasts.studentsAddError')), 'error')
  }
}

async function onStudentRemoved(payload: { groupId: number; studentId: number }) {
  try {
    await removeStudentFromGroup(payload, recruitmentBackend.value)
    panelStudents.value = panelStudents.value.filter(s => Number(s.id) !== payload.studentId)
    updateGroupCounters(payload.groupId, panelStudents.value)
    notify.addToast(t('newGroups.toasts.studentRemoved'), 'warning')
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, t('newGroups.toasts.studentRemoveError')), 'error')
  }
}

async function onStudentArchived(payload: { groupId: number; studentId: number; name: string }) {
  try {
    await archiveStudentFromGroup({ groupId: payload.groupId, studentId: payload.studentId }, recruitmentBackend.value)
    panelStudents.value = panelStudents.value.filter(s => Number(s.id) !== payload.studentId)
    updateGroupCounters(payload.groupId, panelStudents.value)
    notify.addToast(t('newGroups.toasts.archivedToast', { name: payload.name }), 'warning')
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, t('common.error')), 'error')
  }
}

function onStudentTransferred(payload: { groupId: number; studentId: number; name: string }) {
  transferStudent.value = payload
  transferPickerOpen.value = true
}

async function onTransferGroupPicked(groupId: number, groupName: string, _teacherId: number | null) {
  const payload = transferStudent.value
  if (!payload) return

  transferPickerOpen.value = false
  transferStudent.value = null

  try {
    const api = getRecruitmentApi(recruitmentBackend.value)
    await api.setStudentGroup(payload.studentId, groupId)
    panelStudents.value = panelStudents.value.filter(s => Number(s.id) !== payload.studentId)
    updateGroupCounters(payload.groupId, panelStudents.value)
    notify.addToast(`✅ ${payload.name} -> ${groupName}`, 'success')
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, t('common.error')), 'error')
  }
}

async function onStudentEmail(payload: { groupId: number; studentId: number; name: string }) {
  try {
    await emailStudentFromGroup({ groupId: payload.groupId, studentId: payload.studentId }, recruitmentBackend.value)
    notify.addToast(t('newGroups.toasts.emailToast', { name: payload.name }), 'success')
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, t('common.error')), 'error')
  }
}

async function onTeacherAssigned(payload: { groupId: number; teacherId: number | null }) {
  try {
    const res = await editGroup({ 
      group_id: payload.groupId, 
      teacher_id: payload.teacherId 
    }, recruitmentBackend.value)
    
    // Update local state
    const index = groups.value.findIndex(g => g.id === payload.groupId)
    if (index !== -1) {
      groups.value[index] = { ...groups.value[index], teacher: res.data.teacher }
      if (panelGroup.value?.id === payload.groupId) {
        panelGroup.value = { ...panelGroup.value, teacher: res.data.teacher }
      }
    }
    
    notify.addToast(t('common.success'), 'success')
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, t('common.error')), 'error')
  }
}

// ── Init ──
watch(recruitmentBackend, async () => {
  showCreateModal.value = false
  startGroup.value = null
  closePanel()
  isLoading.value = true
  try {
    const [_, sRes, tRes] = await Promise.all([
      newGroupsStore.fetchGroups(recruitmentBackend.value),
      getMasterStudents(recruitmentBackend.value),
      getTeachers(recruitmentBackend.value),
    ])
    masterStudents.value = sRes.items
    teachers.value = tRes.items
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, t('newGroups.toasts.loadError')), 'error')
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

.type-age-cell { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.age-info { display: flex; align-items: center; gap: 4px; }
.age-icon { font-size: 10px; }
.age-val { font-size: 11px; color: var(--app-text-dim); font-weight: 500; }

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

.age-adult  { background: var(--status-info-bg);  color: #8b5cf6; border: 1px solid rgba(139,92,246,0.3); }

.date-cell { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
.date-mono { font-family: 'Space Mono', monospace; font-size: 13px; color: var(--app-text-main); font-weight: 500; }
.date-timer { font-size: 10px; font-weight: 600; white-space: nowrap; }
.date-timer.age-old { color: var(--app-text-dim); }
.date-timer.time-left { color: #10b981; }
.date-timer.time-passed { color: #8b5cf6; }
.date-timer.empty { color: rgba(136,146,176,0.25); }

.slots-cell { display: flex; flex-direction: column; align-items: flex-start; }
.slots-val   { font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700; color: var(--app-text-main); }
.age-val { font-size: 13px; font-weight: 600; color: var(--white); }
.age-adj { font-size: 11px; color: var(--dim); margin-left: 4px; font-weight: 400; text-transform: lowercase; }
.slots-label { color: var(--app-text-dim); font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }

.payment-ratio { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.ratio-text    { font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700; }
.ratio-bar     { width: 100%; max-width: 100px; height: 4px; background: var(--app-border-faint); border-radius: 2px; overflow: hidden; }
.ratio-fill    { height: 100%; transition: width 0.3s ease, background 0.3s ease; }

.readiness-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
}
.status-recruiting { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
.status-ready      { 
  background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.3);
  box-shadow: 0 0 10px rgba(16,185,129,0.15);
  animation: pulse-ready 2s infinite;
}
.status-overfilled { background: rgba(79,110,247,0.1);  color: #4f6ef7;   border: 1px solid rgba(79,110,247,0.2); }

@keyframes pulse-ready {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.02); opacity: 0.9; }
  100% { transform: scale(1); opacity: 1; }
}

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

.start-action-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.unpaid-reminder { font-size: 10px; color: var(--amber); white-space: nowrap; font-weight: 500; }
.all-paid-hint   { font-size: 10px; color: var(--green); white-space: nowrap; font-weight: 500; }

.btn-start {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text-dim);
  white-space: nowrap;
  width: 100%;
}

.btn-start-ready {
  border: 1px solid rgba(16,185,129,0.35);
  background: var(--status-success-bg);
  color: #10b981;
}

.btn-start-ready:hover {
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
