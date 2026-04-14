<template>
  <div>
    <!-- Overlay -->
    <div :class="['gp-overlay', 'active']" @click="$emit('close')"></div>

    <!-- Panel -->
    <div class="gp-panel open">

      <!-- HEADER -->
      <div class="gp-header">
        <div class="gp-header-top">
          <div>
            <div class="gp-title">{{ group.name }}</div>
            <div class="gp-subtitle">
              <!-- День (readonly — производное от даты) -->
              <span>{{ group.day }}</span>
              <span class="sep">·</span>

              <!-- Время — кликабельное inline-редактирование -->
              <template v-if="!editingTime">
                <span class="edit-field-link" @click="openEditTime">
                  {{ group.time }}<span class="edit-icon">✎</span>
                </span>
              </template>
              <template v-else>
                <span class="inline-edit-wrap">
                  <select v-model="editTimeH" class="inline-select">
                    <option v-for="h in timeHours" :key="h" :value="h">{{ h }}</option>
                  </select>
                  <span style="opacity:0.5">:</span>
                  <select v-model="editTimeM" class="inline-select">
                    <option v-for="m in timeMinutes" :key="m" :value="m">{{ m }}</option>
                  </select>
                  <span class="inline-save" @click="saveTime">✓</span>
                  <span class="inline-cancel" @click="editingTime = false">✕</span>
                </span>
              </template>

              <!-- Учитель -->
              <template v-if="group.teacher">
                <span class="sep">·</span>
                <span class="teacher-link" @click="teacherPanelOpen = true">
                  {{ group.teacher.name }}
                  <span class="edit-icon">✎</span>
                </span>
              </template>
              <template v-else>
                <span class="sep">·</span>
                <span class="assign-teacher-link" @click="teacherPanelOpen = true">
                  {{ t('newGroups.detail.assignTeacher') }}
                </span>
              </template>

              <!-- Дата старта — кликабельное inline-редактирование -->
              <span class="sep">·</span>
              <template v-if="!editingDate">
                <span class="edit-field-link" @click="openEditDate">
                  {{ t('newGroups.detail.start') }} {{ fmtDate(group.startDate) }}<span class="edit-icon">✎</span>
                </span>
              </template>
              <template v-else>
                <span class="inline-edit-wrap">
                  <input type="date" v-model="editDateVal" class="inline-date-input" />
                  <span class="inline-save" @click="saveDate">✓</span>
                  <span class="inline-cancel" @click="editingDate = false">✕</span>
                </span>
              </template>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <button class="gp-btn-history" @click="historyPanelOpen = true">
              📋 {{ t('activity.groupHistory') }}
            </button>
            <button class="gp-btn-delete" @click="confirmDelete">{{ t('newGroups.detail.deleteGroup') }}</button>
            <div class="gp-close" @click="$emit('close')">✕</div>
          </div>
        </div>
        <div class="gp-chips">
          <span :class="['gp-chip', 'blue']">{{ group.type === 'individual' ? t('newGroups.detail.typeIndividualFull') : t('newGroups.detail.typeGroupFull') }}</span>
          <span v-if="ageInfo" :class="['gp-chip', 'purple']">{{ ageInfo.icon }} {{ ageInfo.label }}</span>
          <span class="gp-chip">{{ t('newGroups.detail.createdOn', { date: fmtDate(group.createdDate) }) }}</span>
          <span :class="['gp-chip', daysDiff(group.createdDate) > 14 ? 'amber' : 'green']">{{ t('newGroups.detail.daysWaiting', { n: daysDiff(group.createdDate) }) }}</span>
          <span v-if="group.manager" class="gp-chip">👤 {{ group.manager.name }}</span>
          <span v-else class="gp-chip amber">{{ t('newGroups.detail.noResponsible') }}</span>
        </div>
      </div>

      <!-- START BAR -->
      <div class="gp-start-bar">
        <div class="gp-start-info">
          <div>
            <div class="gp-ratio-big" :style="{ color: ratioColor, textShadow: '0 0 20px ' + ratioColor + '55' }">
              {{ actualPaid }}/{{ actualTotal }}
            </div>
            <div class="gp-ratio-sub">
              <span :style="{ color: 'var(--green)' }">{{ t('newGroups.detail.willActivate', { n: actualPaid }) }}</span>
              <template v-if="notPaid > 0"> · <span :style="{ color: 'var(--amber)' }">{{ t('newGroups.detail.willWait', { n: notPaid }) }}</span></template>
            </div>
          </div>
          <div class="gp-mini-bars">
            <div class="gp-bar-row">
              <span class="gp-bar-label">{{ t('newGroups.detail.signedContract') }}</span>
              <div class="gp-bar-track"><div class="gp-bar-fill green" :style="{ width: contractPct + '%' }"></div></div>
              <span class="gp-bar-val" style="color:var(--green)">{{ contractCount }}</span>
            </div>
             <div class="gp-bar-row">
               <span class="gp-bar-label">{{ t('newGroups.detail.paid') }}</span>
               <div class="gp-bar-track"><div :class="['gp-bar-fill', pct === 100 ? 'green' : 'amber']" :style="{ width: pct + '%' }"></div></div>
               <span class="gp-bar-val" :style="{ color: pct === 100 ? 'var(--green)' : 'var(--amber)' }">
                 <template v-if="actualPaid === actualTotal && actualTotal > 0">{{ t('newGroups.detail.paidStatus') }}</template>
                 <template v-else>{{ notPaid }}</template>
               </span>
             </div>
          </div>
        </div>
        <button class="gp-start-btn" :disabled="actualTotal === 0" @click="$emit('start')">{{ t('newGroups.detail.startGroup') }}</button>
      </div>

      <!-- BODY -->
      <div class="gp-body">
        <div class="gp-section-label">
          <div style="display:flex;align-items:center;gap:8px">
            <span>{{ t('newGroups.detail.studentList') }}</span>
            <span class="gp-count-pill" v-if="!loadingStudents">{{ students.length }} {{ t('newGroups.persons') }}</span>
          </div>
          <button class="gp-btn-add" @click="addPanelOpen = true">{{ t('newGroups.detail.addStudents') }}</button>
        </div>

        <div v-if="loadingStudents" style="text-align:center;padding:40px;color:var(--dim)">{{ t('newGroups.detail.loading') }}</div>

        <div v-else class="gp-table-wrap">
          <table class="gp-table">
            <thead>
              <tr>
                <th>{{ t('newGroups.detail.thName') }}</th>
                <th>{{ t('newGroups.detail.thEmail') }}</th>
                <th>{{ t('newGroups.detail.thAge') }}</th>
                <th>{{ t('newGroups.detail.thContract') }}</th>
                <th>{{ t('newGroups.detail.thPayment') }}</th>
                <th>{{ t('newGroups.detail.thEnrollDate') }}</th>
                <th>{{ t('newGroups.detail.thWaiting') }}</th>
                <th>{{ t('newGroups.detail.thResponsible') }}</th>
                <th style="width:130px;text-align:center">{{ t('newGroups.detail.thActions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="students.length === 0">
                <td colspan="8">
                  <div class="gp-empty">
                    <div class="gp-empty-icon">👤</div>
                    {{ t('newGroups.detail.noStudents') }}
                  </div>
                </td>
              </tr>
              <tr
                v-for="s in students"
                :key="String(s.id)"
                :class="s.contract !== 'signed' ? 'row-not-ready' : ''"
              >
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="status-dot" :style="{ background: s.contract === 'signed' ? 'var(--green)' : 'var(--amber)', boxShadow: '0 0 4px ' + (s.contract === 'signed' ? 'var(--green)' : 'var(--amber)') }"></div>
                    <div>
                      <div class="student-name">{{ s.name }}</div>
                      <div class="student-info-sub">
                        <span class="sub-id">#{{ s.id }}</span>
                        <span v-if="s.phone" class="sub-phone">{{ s.phone }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="student-email" :title="s.email || ''">{{ s.email || '—' }}</div>
                </td>
                <td>
                  <span class="age-mono">{{ s.age }}</span>
                  <span class="age-label"> {{ pluralizeYears(s.age) }}</span>
                </td>
                <td>
                  <span :class="['contract-badge', s.contract === 'signed' ? 'contract-signed' : 'contract-pending']">
                    {{ s.contract === 'signed' ? t('newGroups.detail.contractSigned') : t('newGroups.detail.contractPending') }}
                  </span>
                </td>
                <td>
                  <span 
                    v-if="s.paymentStr !== '0 zł' || s.isPaid"
                    :class="['payment-mono', s.isPaid ? 'payment-paid' : 'payment-expected']"
                  >
                    {{ s.paymentStr }}
                    <template v-if="s.isPaid"> · {{ t('newStudents.table.paid') }}</template>
                    <template v-else> · {{ t('newStudents.table.pending') }}</template>
                  </span>
                  <span v-else class="payment-mono payment-zero">{{ s.paymentStr }}</span>
                </td>
                <td>
                  <div class="timer-cell">
                    <span :class="['timer-days', timerCls(daysDiff(s.enrollDate || s.createdDate))]">{{ daysDiff(s.enrollDate || s.createdDate) }}</span>
                    <span class="timer-label">{{ t('newGroups.detail.daysShort') }}</span>
                  </div>
                </td>
                <td>
                  <div class="timer-cell">
                    <span :class="['timer-days', timerCls(daysDiff(s.registeredAt || s.createdDate))]">{{ daysDiff(s.registeredAt || s.createdDate) }}</span>
                    <span class="timer-label">{{ t('newGroups.detail.daysShort') }}</span>
                  </div>
                </td>
                <td>
                  <span v-if="s.manager" style="font-size:12.5px;font-weight:500">{{ s.manager }}</span>
                  <span v-else class="empty-cell">—</span>
                </td>
                <td>
                  <div class="row-actions">
                    <div class="ra-btn archive" :data-tip="t('newGroups.detail.tipArchive')" @click="archiveStudent(s.id, s.name)">📦</div>
                    <div class="ra-btn remove"  :data-tip="t('newGroups.detail.tipRemove')" @click="removeStudent(s.id)">✕</div>
                    <div class="ra-btn transfer" :data-tip="t('newGroups.detail.tipTransfer')" @click="transferStudent(s.id, s.name)">🔀</div>
                    <div class="ra-btn email" :data-tip="t('newGroups.detail.tipEmail')" @click="emailStudent(s.id, s.name)">✉</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ADD STUDENTS SUB-PANEL -->
    <div v-if="addPanelOpen" :class="['asp-panel', 'open']">
      <div class="asp-header">
        <div>
          <div class="asp-title">{{ t('newGroups.detail.addStudentsTitle') }}</div>
          <div class="asp-sub">{{ t('newGroups.detail.addStudentsSub') }}</div>
        </div>
        <div class="gp-close" @click="addPanelOpen = false">✕</div>
      </div>
      <div class="asp-search-wrap">
        <div class="asp-search-box">
          <span style="color:var(--dim);font-size:14px">🔍</span>
          <input v-model="aspQuery" type="text" :placeholder="t('newGroups.detail.searchStudent')" style="flex:1;background:none;border:none;outline:none;color:var(--text-main);font-family:'Outfit',sans-serif;font-size:13px" />
        </div>
      </div>
      <div class="asp-list">
        <div
          v-for="s in filteredMaster"
          :key="s.id"
          :class="['asp-item', aspSelected.has(s.id) ? 'selected' : '', alreadyInGroup.has(s.id) ? 'in-group' : '']"
          :style="alreadyInGroup.has(s.id) ? 'opacity:0.5;cursor:default' : ''"
          @click="!alreadyInGroup.has(s.id) && toggleAsp(s.id)"
        >
          <div :class="['asp-checkbox', aspSelected.has(s.id) ? 'checked' : '']"></div>
          <div class="asp-avatar" :style="{ background: s.color }">{{ s.initials }}</div>
          <div class="asp-info">
            <div class="asp-name">{{ s.name }}</div>
            <div class="asp-meta">{{ s.meta }}</div>
          </div>
          <span v-if="alreadyInGroup.has(s.id)" class="asp-status already">{{ t('newGroups.detail.alreadyInGroup') }}</span>
          <span v-else-if="aspSelected.has(s.id)" class="asp-status new">{{ t('newGroups.detail.selected') }}</span>
        </div>
      </div>
      <div class="asp-footer">
        <span :class="['asp-sel-info', aspSelected.size > 0 ? 'has-sel' : '']">
          {{ aspSelected.size > 0 ? (aspSelected.size === 1 ? t('newGroups.detail.selectedCount1', { n: aspSelected.size }) : aspSelected.size < 5 ? t('newGroups.detail.selectedCount2', { n: aspSelected.size }) : t('newGroups.detail.selectedCount5', { n: aspSelected.size })) : t('newGroups.detail.noneSelected') }}
        </span>
        <div style="display:flex;gap:10px">
          <button class="btn btn-ghost" style="font-size:13px;padding:8px 16px" @click="addPanelOpen = false">{{ t('newGroups.detail.cancel') }}</button>
          <button class="btn btn-primary" style="font-size:13px;padding:8px 18px" @click="confirmAdd">{{ t('newGroups.detail.addSelected') }}</button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRM -->
    <div v-if="deleteConfirm" class="dc-overlay" @click.self="deleteConfirm = false">
      <div class="dc-box">
        <div class="dc-icon">🗑️</div>
        <div class="dc-title">{{ t('newGroups.detail.deleteTitle') }}</div>
        <div class="dc-sub">{{ t('newGroups.detail.deleteConfirm') }}<br><strong>{{ group.name }}</strong>?<br>{{ t('newGroups.detail.deleteWarning') }}</div>
        <div class="dc-actions">
          <button class="btn btn-ghost" style="padding:9px 20px" @click="deleteConfirm = false">{{ t('newGroups.detail.cancel') }}</button>
          <button class="btn" style="background:var(--red);color:white;padding:9px 20px;border:none;box-shadow:0 0 16px rgba(239,68,68,0.3)" @click="doDelete">{{ t('newGroups.detail.deleteBtn') }}</button>
        </div>
      </div>
    </div>

    <!-- TOAST REMOVED -->

    <!-- GROUP HISTORY PANEL -->
    <GroupHistoryPanel
      v-if="historyPanelOpen"
      :group-id="group.id"
      :group-name="group.name"
      @close="historyPanelOpen = false"
    />

    <!-- TEACHER SELECTION SUB-PANEL -->
    <div v-if="teacherPanelOpen" :class="['asp-panel', 'open']">
      <div class="asp-header">
        <div>
          <div class="asp-title">{{ t('newGroups.detail.selectTeacherTitle') }}</div>
          <div class="asp-sub">{{ t('newGroups.detail.selectTeacherSub') }}</div>
        </div>
        <div class="gp-close" @click="teacherPanelOpen = false">✕</div>
      </div>
      <div class="asp-search-wrap">
        <div class="asp-search-box">
          <span style="color:var(--dim);font-size:14px">🔍</span>
          <input v-model="teacherQuery" type="text" :placeholder="t('newGroups.detail.searchTeacherPlaceholder')" style="flex:1;background:none;border:none;outline:none;color:var(--text-main);font-family:'Outfit',sans-serif;font-size:13px" />
        </div>
      </div>
      <div class="asp-list">
        <!-- Option to remove teacher -->
        <div 
          v-if="group.teacher" 
          class="asp-item remove-teacher" 
          @click="selectTeacher(null)"
        >
          <div class="asp-avatar" style="background:var(--red);opacity:0.8">✕</div>
          <div class="asp-info">
            <div class="asp-name" style="color:var(--red)">{{ t('newGroups.detail.removeTeacher') }}</div>
          </div>
        </div>

        <div
          v-for="tr in filteredTeachers"
          :key="tr.id"
          :class="['asp-item', group.teacher?.id === tr.id ? 'selected' : '']"
          @click="selectTeacher(tr.id)"
        >
          <div class="asp-avatar" :style="{ background: tr.color }">{{ tr.initials }}</div>
          <div class="asp-info">
            <div class="asp-name">{{ tr.name }}</div>
          </div>
          <span v-if="group.teacher?.id === tr.id" class="asp-status already">{{ t('newGroups.detail.selected') }}</span>
        </div>
      </div>
      <div class="asp-footer">
        <button class="btn btn-ghost" style="width:100%;justify-content:center" @click="teacherPanelOpen = false">{{ t('newGroups.detail.cancel') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { NewGroup, NewGroupStudent, MasterStudent, NewGroupTeacher } from '../../../api/newGroupsApi'
import { editGroup } from '../../../api/newGroupsApi'
import type { RecruitmentBackend } from '../../../api/http'
import { ageMap, fmtDate, daysDiff } from '../../../utils/newGroupsUtils'
import { useNotificationStore } from '../../../stores/notification.store'
import { parseApiError } from '../../../api/errorHelper'
import GroupHistoryPanel from './GroupHistoryPanel.vue'

const { t, locale } = useI18n()

function pluralizeYears(n: number): string {
  if (locale.value !== 'ru' && locale.value !== 'uk') return t('newGroups.detail.years')
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return locale.value === 'ru' ? 'год' : 'рік'
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return locale.value === 'ru' ? 'года' : 'роки'
  return locale.value === 'ru' ? 'лет' : 'років'
}

const notify = useNotificationStore()

const props = defineProps<{
  group: NewGroup
  students: NewGroupStudent[]
  masterStudents: MasterStudent[]
  teachers: NewGroupTeacher[]
  loadingStudents: boolean
  backend?: RecruitmentBackend
}>()

const emit = defineEmits<{
  close: []
  start: []
  delete: [id: number]
  'students-added': [payload: { groupId: number; studentIds: number[] }]
  'student-removed': [payload: { groupId: number; studentId: number }]
  'student-archived': [payload: { groupId: number; studentId: number; name: string }]
  'student-transferred': [payload: { groupId: number; studentId: number; name: string }]
  'student-email': [payload: { groupId: number; studentId: number; name: string }]
  'teacher-assigned': [payload: { groupId: number; teacherId: number | null; name?: string }]
  'group-saved': [payload: { groupId: number; updates: Partial<NewGroup> }]
}>()

// ── Panel state ──
const addPanelOpen = ref(false)
const aspQuery = ref('')
const aspSelected = ref<Set<number>>(new Set())
const deleteConfirm = ref(false)
const historyPanelOpen = ref(false)
const teacherPanelOpen = ref(false)
const teacherQuery = ref('')

// ── Inline edit: time ──
const editingTime = ref(false)
const editTimeH = ref('17')
const editTimeM = ref('00')
const timeHours = Array.from({ length: 15 }, (_, i) => String(i + 7).padStart(2, '0'))
const timeMinutes = ['00', '15', '30', '45']

// ── Inline edit: date ──
const editingDate = ref(false)
const editDateVal = ref('')

// ── Auto-name helpers (same logic as CreateGroupModal) ──
const shortWeekdays: Record<number, string> = {
  0: t('newGroups.create.shortWeekdays.sun'),
  1: t('newGroups.create.shortWeekdays.mon'),
  2: t('newGroups.create.shortWeekdays.tue'),
  3: t('newGroups.create.shortWeekdays.wed'),
  4: t('newGroups.create.shortWeekdays.thu'),
  5: t('newGroups.create.shortWeekdays.fri'),
  6: t('newGroups.create.shortWeekdays.sat'),
}

// Full weekday names for the `day` field sent to API
const fullWeekdays: Record<number, string> = {
  0: t('newGroups.weekdays.sun'),
  1: t('newGroups.weekdays.mon'),
  2: t('newGroups.weekdays.tue'),
  3: t('newGroups.weekdays.wed'),
  4: t('newGroups.weekdays.thu'),
  5: t('newGroups.weekdays.fri'),
  6: t('newGroups.weekdays.sat'),
}

function deriveTeacherShort(fullName: string): string {
  if (!fullName) return ''
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length > 1) {
    return parts[0][0].toUpperCase() + parts[1][0].toUpperCase() + (parts[1][1] || '').toLowerCase()
  }
  return parts[0].slice(0, 3).toUpperCase()
}

function buildAutoName(opts: {
  dateStr?: string
  timeStr?: string
  teacher?: NewGroupTeacher | null
}): string {
  const dateStr = opts.dateStr ?? props.group.startDate
  const timeStr = opts.timeStr ?? props.group.time
  const teacher = opts.teacher !== undefined ? opts.teacher : props.group.teacher

  let res = ''

  if (dateStr) {
    const d = new Date(dateStr + 'T00:00:00Z')
    if (!isNaN(d.getTime())) res += shortWeekdays[d.getUTCDay()] || ''
  }

  const hour = timeStr ? timeStr.split(':')[0] : ''
  if (hour) res += (res ? ' ' : '') + hour

  if (props.group.age) {
    res += (res ? ' ' : '') + t(`newGroups.create.ageAdjectives.${props.group.age}`)
  }

  if (teacher) {
    res += (res ? ' ' : '') + deriveTeacherShort(teacher.name)
  }

  return res
}

// ── Computed ──
const ageInfo = computed(() => ageMap[props.group.age ?? ''] ?? null)

const actualTotal = computed(() => {
  if (props.group.totalSlots > 0) return props.group.totalSlots
  return props.students.length
})
const actualPaid = computed(() =>
  props.students.length > 0
    ? props.students.filter(s => s.isPaid === true).length
    : props.group.paid
)
const pct = computed(() =>
  actualTotal.value > 0 ? Math.round(actualPaid.value / actualTotal.value * 100) : 0
)
const notPaid = computed(() => actualTotal.value - actualPaid.value)
const ratioColor = computed(() => pct.value === 100 ? 'var(--green)' : pct.value >= 50 ? 'var(--amber)' : 'var(--red)')
const contractCount = computed(() => props.students.filter(s => s.contract === 'signed').length)
const contractPct = computed(() =>
  actualTotal.value > 0 ? Math.round(contractCount.value / actualTotal.value * 100) : 0
)
const alreadyInGroup = computed(() => new Set(props.students.map(s => Number(s.id))))
const filteredMaster = computed(() => {
  const q = aspQuery.value.toLowerCase().trim()
  return q ? props.masterStudents.filter(s => s.name.toLowerCase().includes(q)) : props.masterStudents
})
const filteredTeachers = computed(() => {
  const q = teacherQuery.value.toLowerCase().trim()
  return q ? props.teachers.filter(tr => tr.name.toLowerCase().includes(q)) : props.teachers
})

// ── Time edit ──
function openEditTime() {
  const parts = props.group.time.split(':')
  editTimeH.value = parts[0] ?? '17'
  editTimeM.value = parts[1] ?? '00'
  editingTime.value = true
}

async function saveTime() {
  const newTime = `${editTimeH.value}:${editTimeM.value}`
  try {
    const newName = buildAutoName({ timeStr: newTime })
    await editGroup({ group_id: props.group.id, time: newTime, name: newName }, props.backend)
    emit('group-saved', { groupId: props.group.id, updates: { time: newTime, name: newName } })
    editingTime.value = false
    notify.addToast(t('common.success'), 'success')
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, t('common.error')), 'error')
  }
}

// ── Date edit ──
function openEditDate() {
  editDateVal.value = props.group.startDate
  editingDate.value = true
}

async function saveDate() {
  if (!editDateVal.value) { editingDate.value = false; return }
  try {
    const d = new Date(editDateVal.value + 'T00:00:00Z')
    const newDay = !isNaN(d.getTime()) ? (fullWeekdays[d.getUTCDay()] ?? props.group.day) : props.group.day
    const newName = buildAutoName({ dateStr: editDateVal.value })
    await editGroup({ group_id: props.group.id, start_date: editDateVal.value, day: newDay, name: newName }, props.backend)
    emit('group-saved', { groupId: props.group.id, updates: { startDate: editDateVal.value, day: newDay, name: newName } })
    editingDate.value = false
    notify.addToast(t('common.success'), 'success')
  } catch (err: unknown) {
    notify.addToast(parseApiError(err, t('common.error')), 'error')
  }
}

// ── Helpers ──
function timerCls(days: number) {
  return days <= 7 ? 'low' : days <= 21 ? 'mid' : 'high'
}

function toggleAsp(id: number) {
  const s = new Set(aspSelected.value)
  s.has(id) ? s.delete(id) : s.add(id)
  aspSelected.value = s
}

function selectTeacher(teacherId: number | null) {
  const teacher = teacherId ? (props.teachers.find(tr => tr.id === teacherId) ?? null) : null
  const newName = buildAutoName({ teacher })
  emit('teacher-assigned', { groupId: props.group.id, teacherId, name: newName || undefined })
  teacherPanelOpen.value = false
}

async function confirmAdd() {
  if (aspSelected.value.size === 0) {
    notify.addToast(t('newGroups.toasts.selectAtLeastOne'), 'warning')
    return
  }
  emit('students-added', { groupId: props.group.id, studentIds: [...aspSelected.value] })
  addPanelOpen.value = false
  aspSelected.value = new Set()
  aspQuery.value = ''
}

function removeStudent(studentId: number | string) {
  emit('student-removed', { groupId: props.group.id, studentId: Number(studentId) })
}

function archiveStudent(studentId: number | string, name: string) {
  emit('student-archived', { groupId: props.group.id, studentId: Number(studentId), name })
}

function transferStudent(studentId: number | string, name: string) {
  emit('student-transferred', { groupId: props.group.id, studentId: Number(studentId), name })
}

function emailStudent(studentId: number | string, name: string) {
  emit('student-email', { groupId: props.group.id, studentId: Number(studentId), name })
}

function confirmDelete() {
  deleteConfirm.value = true
}

function doDelete() {
  deleteConfirm.value = false
  emit('delete', props.group.id)
}
</script>

<style scoped>
/* OVERLAY */
.gp-overlay {
  position: fixed; inset: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(4px);
  z-index: 300;
}

/* PANEL */
.gp-panel {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: 820px; max-width: 100vw;
  --app-surface-hi: #e2e8f0;
  background: var(--app-bg);
  border-left: 1px solid var(--bh);
  backdrop-filter: blur(30px);
  z-index: 400;
  display: flex; flex-direction: column;
  overflow: hidden;
}

:global(.dark) .gp-panel {
  --app-surface-hi: #151533;
}

.gp-header {
  padding: 22px 28px 18px;
  border-bottom: 1px solid var(--b);
  flex-shrink: 0;
  background: var(--app-surface);
}

.gp-header-top {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 16px;
  margin-bottom: 16px;
}

.gp-title { font-size: 20px; font-weight: 700; }
.gp-subtitle {
  font-size: 12.5px; color: var(--dim);
  margin-top: 4px; display: flex; align-items: center; gap: 8px;
}
.teacher-link {
  color: var(--blue);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.teacher-link:hover { text-decoration: underline; }
.edit-icon { font-size: 10px; opacity: 0.6; }

.assign-teacher-link {
  color: var(--amber);
  cursor: pointer;
  font-weight: 500;
}
.assign-teacher-link:hover { text-decoration: underline; }

.sep { opacity: 0.4; }

/* Inline edit fields */
.edit-field-link {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border-radius: 4px;
  padding: 1px 4px;
  transition: background 0.15s, color 0.15s;
}
.edit-field-link:hover {
  background: rgba(79,110,247,0.12);
  color: var(--blue);
}
.edit-field-link:hover .edit-icon { opacity: 1; }

.inline-edit-wrap {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.inline-date-input {
  background: var(--app-surface);
  border: 1px solid var(--bh);
  border-radius: 6px;
  color: var(--text-main);
  font-family: 'Space Mono', monospace;
  font-size: 11.5px;
  padding: 2px 6px;
  outline: none;
}
.inline-date-input:focus { border-color: var(--blue); }

.inline-select {
  background: var(--app-surface);
  border: 1px solid var(--bh);
  border-radius: 6px;
  color: var(--text-main);
  font-family: 'Space Mono', monospace;
  font-size: 11.5px;
  padding: 2px 4px;
  outline: none;
  cursor: pointer;
}
.inline-select:focus { border-color: var(--blue); }

.inline-save {
  cursor: pointer;
  color: var(--green);
  font-size: 13px;
  padding: 1px 5px;
  border-radius: 4px;
  transition: background 0.15s;
}
.inline-save:hover { background: rgba(16,185,129,0.15); }

.inline-cancel {
  cursor: pointer;
  color: var(--dim);
  font-size: 12px;
  padding: 1px 5px;
  border-radius: 4px;
  transition: background 0.15s;
}
.inline-cancel:hover { background: rgba(239,68,68,0.1); color: var(--red); }

.gp-close {
  width: 32px; height: 32px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; cursor: pointer;
  background: rgba(255,255,255,0.06); border: 1px solid var(--b);
  color: var(--dim); font-size: 15px; transition: all 0.15s;
}
.gp-close:hover { background: rgba(239,68,68,0.15); color: var(--red); border-color: rgba(239,68,68,0.3); }

.gp-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.gp-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 11px; border-radius: 20px;
  font-size: 11.5px; font-weight: 600;
  background: rgba(255,255,255,0.05); border: 1px solid var(--b);
  color: var(--dim);
}
.gp-chip.green  { background: rgba(16,185,129,0.12); color: var(--green);  border-color: rgba(16,185,129,0.3); }
.gp-chip.blue   { background: rgba(79,110,247,0.12);  color: var(--blue);   border-color: rgba(79,110,247,0.3); }
.gp-chip.amber  { background: rgba(245,158,11,0.12);  color: var(--amber);  border-color: rgba(245,158,11,0.3); }
.gp-chip.purple { background: rgba(139,92,246,0.12);  color: var(--purple); border-color: rgba(139,92,246,0.3); }

/* START BAR */
.gp-start-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 14px 28px;
  background: rgba(16,185,129,0.05);
  border-bottom: 1px solid rgba(16,185,129,0.15);
  flex-shrink: 0;
}
.gp-start-info { display: flex; align-items: center; gap: 20px; }
.gp-ratio-big { font-family: 'Space Mono', monospace; font-size: 28px; font-weight: 700; line-height: 1; }
.gp-ratio-sub { font-size: 12px; color: var(--dim); margin-top: 3px; }
.gp-mini-bars { display: flex; flex-direction: column; gap: 5px; min-width: 180px; }
.gp-bar-row { display: flex; align-items: center; gap: 8px; font-size: 11.5px; }
.gp-bar-label { width: 110px; color: var(--dim); }
.gp-bar-track { flex: 1; height: 5px; background: rgba(255,255,255,0.07); border-radius: 3px; overflow: hidden; }
.gp-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
.gp-bar-fill.green { background: linear-gradient(90deg, var(--green), #34d399); }
.gp-bar-fill.amber { background: linear-gradient(90deg, var(--amber), #fcd34d); }
.gp-bar-val { font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; width: 28px; text-align: right; }

.gp-start-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px; border-radius: 10px;
  background: linear-gradient(135deg, var(--green), var(--cyan));
  color: white; font-size: 14px; font-weight: 700;
  border: none; cursor: pointer;
  box-shadow: 0 0 20px rgba(16,185,129,0.3);
  transition: all 0.2s; font-family: 'Outfit', sans-serif;
  flex-shrink: 0;
}
.gp-start-btn:hover { box-shadow: 0 0 32px rgba(16,185,129,0.5); transform: translateY(-1px); }

/* BODY */
.gp-body { flex: 1; overflow-y: auto; padding: 20px 28px; }
.gp-section-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--dim);
  margin-bottom: 12px;
  display: flex; align-items: center; justify-content: space-between;
}
.gp-count-pill {
  font-family: 'Space Mono', monospace;
  color: var(--blue); font-size: 10px;
  background: rgba(79,110,247,0.12);
  border: 1px solid rgba(79,110,247,0.25);
  padding: 2px 7px; border-radius: 8px;
}

.gp-table-wrap { border: 1px solid var(--b); border-radius: 12px; overflow: hidden; overflow-x: auto; }
.gp-table { width: 100%; border-collapse: collapse; min-width: 760px; }
.gp-table thead tr { background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--b); }
.gp-table th { padding: 10px 13px; text-align: left; font-size: 10.5px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--dim); white-space: nowrap; }
.gp-table tbody tr { border-bottom: 1px solid rgba(100,120,255,0.06); transition: background 0.12s; }
.gp-table tbody tr:last-child { border-bottom: none; }
.gp-table tbody tr:hover { background: var(--app-surface-hi); }
.gp-table td { padding: 11px 13px; font-size: 13px; vertical-align: middle; }
.row-not-ready td:first-child { border-left: 2px solid rgba(245,158,11,0.45); }

.gp-empty { text-align: center; padding: 40px 20px; color: var(--dim); font-size: 13.5px; }
.gp-empty-icon { font-size: 32px; margin-bottom: 10px; }

.status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.age-mono { font-family: 'Space Mono', monospace; font-size: 12.5px; font-weight: 700; }

.contract-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.contract-signed  { background: rgba(16,185,129,0.13); color: var(--green); border: 1px solid rgba(16,185,129,0.3); }
.contract-pending { background: rgba(245,158,11,0.12);  color: var(--amber); border: 1px solid rgba(245,158,11,0.3); }

.payment-mono { font-family: 'Space Mono', monospace; font-size: 12.5px; font-weight: 700; color: var(--app-text-main); }
.payment-paid { color: #10b981 !important; }
.payment-expected { color: #f59e0b !important; }
.payment-zero { color: var(--dim); font-style: italic; opacity: 0.6; }

.date-mono { font-family: 'Space Mono', monospace; font-size: 12px; }
.timer-cell { display: flex; flex-direction: column; align-items: flex-start; }
.timer-days { font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; }
.timer-label { font-size: 10px; color: var(--dim); text-transform: uppercase; }
.timer-days.low { color: var(--green); }
.timer-days.mid { color: var(--amber); }
.timer-days.high { color: var(--red); }
.empty-cell { color: rgba(136,146,176,0.35); font-size: 12px; font-style: italic; }

.student-name { font-weight: 600; font-size: 13.5px; color: var(--app-text-main); }
.student-info-sub { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
.sub-id { font-family: 'Space Mono', monospace; font-size: 10px; color: var(--dim); background: rgba(255,255,255,0.05); padding: 1px 4px; border-radius: 4px; }
.sub-phone { font-size: 11px; color: var(--dim); font-weight: 500; }
.student-email { font-size: 12.5px; color: var(--dim); max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.age-label { font-size: 11px; color: var(--dim); }

.row-actions { display: flex; align-items: center; gap: 4px; opacity: 0; transition: opacity 0.15s; }
.gp-table tbody tr:hover .row-actions { opacity: 1; }

.ra-btn {
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  border-radius: 6px; cursor: pointer;
  background: rgba(255,255,255,0.04); border: 1px solid var(--b);
  font-size: 13px; transition: all 0.15s; position: relative;
}
.ra-btn:hover { border-color: var(--bh); }
.ra-btn.archive:hover  { background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.4); }
.ra-btn.remove:hover   { background: rgba(239,68,68,0.15);  border-color: rgba(239,68,68,0.4); }
.ra-btn.transfer:hover { background: rgba(79,110,247,0.15); border-color: rgba(79,110,247,0.4); }
.ra-btn.email:hover    { background: rgba(6,182,212,0.15);  border-color: rgba(6,182,212,0.4); }

.ra-btn[data-tip]:hover::after {
  content: attr(data-tip);
  position: absolute; bottom: calc(100% + 6px); left: 50%;
  transform: translateX(-50%);
  background: var(--app-surface); border: 1px solid var(--bh);
  color: var(--text-main); font-size: 11px; font-weight: 500;
  padding: 4px 9px; border-radius: 6px;
  white-space: nowrap; pointer-events: none;
  font-family: 'Outfit', sans-serif; z-index: 10;
}

/* PANEL ACTION BTNS */
.gp-btn-history {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 13px; border-radius: 8px; font-size: 12.5px; font-weight: 600;
  font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.2s;
  background: rgba(79,110,247,0.08); color: #4f6ef7;
  border: 1px solid rgba(79,110,247,0.25);
}
.gp-btn-history:hover { background: rgba(79,110,247,0.16); border-color: rgba(79,110,247,0.5); }

.gp-btn-delete {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 13px; border-radius: 8px; font-size: 12.5px; font-weight: 600;
  font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.2s;
  background: rgba(239,68,68,0.08); color: var(--red);
  border: 1px solid rgba(239,68,68,0.25);
}
.gp-btn-delete:hover { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.5); box-shadow: 0 0 12px rgba(239,68,68,0.15); }

.gp-btn-add {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: 8px; font-size: 11.5px; font-weight: 600;
  font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.2s;
  background: rgba(79,110,247,0.12); color: var(--blue);
  border: 1px solid rgba(79,110,247,0.3);
}
.gp-btn-add:hover { background: rgba(79,110,247,0.22); border-color: rgba(79,110,247,0.5); box-shadow: 0 0 12px rgba(79,110,247,0.2); }

/* ADD STUDENTS SUB-PANEL */
.asp-panel {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: 420px;
  background: var(--app-bg);
  border-left: 1px solid var(--bh);
  backdrop-filter: blur(30px);
  z-index: 500;
  display: flex; flex-direction: column;
  box-shadow: -12px 0 40px rgba(0,0,0,0.5);
}
.asp-header {
  padding: 22px 22px 16px;
  border-bottom: 1px solid var(--b);
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  flex-shrink: 0; background: var(--app-surface);
}
.asp-title { font-size: 16px; font-weight: 700; margin-bottom: 3px; }
.asp-sub   { font-size: 12px; color: var(--dim); }
.asp-search-wrap {
  padding: 14px 22px 10px; border-bottom: 1px solid var(--b);
  flex-shrink: 0;
}
.asp-search-box {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--b); border-radius: 8px; padding: 7px 12px;
}
.asp-list { flex: 1; overflow-y: auto; padding: 8px 14px; }
.asp-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px; border-radius: 9px;
  cursor: pointer; transition: background 0.14s;
  user-select: none; margin-bottom: 2px;
  border: 1px solid transparent;
}
.asp-item:hover { background: rgba(79,110,247,0.07); }
.asp-item.selected { background: rgba(79,110,247,0.12); border-color: rgba(79,110,247,0.28); }

.asp-checkbox {
  width: 20px; height: 20px; border-radius: 6px;
  border: 1.5px solid var(--bh);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.15s;
  background: rgba(255,255,255,0.03);
}
.asp-checkbox.checked {
  background: linear-gradient(135deg, var(--blue), var(--purple));
  border-color: transparent; box-shadow: 0 0 8px rgba(79,110,247,0.4);
}
.asp-checkbox::after { content: '✓'; font-size: 12px; color: white; display: none; }
.asp-checkbox.checked::after { display: block; }

.asp-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; flex-shrink: 0;
  border: 1.5px solid rgba(255,255,255,0.1);
}
.asp-info { flex: 1; min-width: 0; }
.asp-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.asp-meta { font-size: 11px; color: var(--dim); margin-top: 1px; }
.asp-status { font-size: 10.5px; font-weight: 600; padding: 2px 8px; border-radius: 10px; white-space: nowrap; flex-shrink: 0; }
.asp-status.already { background: rgba(16,185,129,0.1); color: var(--green); border: 1px solid rgba(16,185,129,0.25); }
.asp-status.new     { background: rgba(79,110,247,0.1);  color: var(--blue);  border: 1px solid rgba(79,110,247,0.25); }

.asp-footer {
  padding: 14px 22px; border-top: 1px solid var(--b);
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
  background: var(--app-surface); gap: 12px;
}
.asp-sel-info { font-size: 12.5px; color: var(--dim); flex: 1; font-family: 'Space Mono', monospace; }
.asp-sel-info.has-sel { color: var(--blue); }

/* DELETE CONFIRM */
.dc-overlay {
  position: fixed; inset: 0;
  background: var(--glass-bg); backdrop-filter: blur(8px);
  z-index: 600; display: flex; align-items: center; justify-content: center;
}
.dc-box {
  background: var(--card); border: 1px solid rgba(239,68,68,0.4);
  border-radius: 16px; padding: 30px 32px;
  max-width: 380px; width: calc(100vw - 40px);
  text-align: center;
  box-shadow: 0 0 60px rgba(239,68,68,0.15), 0 24px 60px rgba(0,0,0,0.5);
}
.dc-icon  { font-size: 40px; margin-bottom: 14px; }
.dc-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; color: var(--red); }
.dc-sub   { font-size: 13px; color: var(--dim); margin-bottom: 24px; line-height: 1.5; }
.dc-actions { display: flex; gap: 10px; justify-content: center; }


/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.2s; border: none; }
.btn-primary { background: linear-gradient(135deg, var(--blue), var(--purple)); color: white; box-shadow: 0 0 16px rgba(79,110,247,0.3); }
.btn-primary:hover { box-shadow: 0 0 24px rgba(79,110,247,0.5); transform: translateY(-1px); }
.btn-ghost { background: rgba(255,255,255,0.05); color: var(--dim); border: 1px solid var(--b) !important; }
.btn-ghost:hover { background: rgba(255,255,255,0.08); color: var(--text-main); border-color: var(--bh) !important; }
</style>
