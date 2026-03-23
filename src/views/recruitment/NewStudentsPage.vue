<template>
  <div class="ns-page">

    <div class="ns-content">

      <!-- PAGE ACTIONS ROW -->
      <div class="ns-actions-row">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input v-model="searchQ" :placeholder="t('newStudents.searchPlaceholder')" @input="applyFilters" />
        </div>
        <button class="btn btn-ghost" @click="onExport">⬇ {{ t('common.export') }}</button>
        <button class="btn btn-primary" @click="addModalOpen = true">＋ {{ t('newStudents.addStudent') }}</button>
      </div>

      <!-- STATS GRID -->
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-label">{{ t('newStudents.stats.total') }}</div>
          <div class="stat-value">{{ store.totalCount }}</div>
          <div class="stat-sub">{{ t('newStudents.stats.totalSub') }}</div>
          <div class="stat-icon">🎓</div>
        </div>
        <div class="stat-card green">
          <div class="stat-label">{{ t('newStudents.stats.signed') }}</div>
          <div class="stat-value">{{ store.signedCount }}</div>
          <div class="stat-sub"><span class="up">↑ {{ t('newStudents.stats.signedSub') }}</span></div>
          <div class="stat-icon">✅</div>
        </div>
        <div class="stat-card amber">
          <div class="stat-label">{{ t('newStudents.stats.avgWait') }}</div>
          <div class="stat-value">{{ store.avgWaitDays }}</div>
          <div class="stat-sub"><span class="warn">{{ t('newStudents.stats.avgWaitSub') }}</span></div>
          <div class="stat-icon">⏱</div>
        </div>
        <div class="stat-card cyan">
          <div class="stat-label">{{ t('newStudents.stats.noManager') }}</div>
          <div class="stat-value">{{ store.noManagerCount }}</div>
          <div class="stat-sub">{{ t('newStudents.stats.noManagerSub') }}</div>
          <div class="stat-icon">⚠️</div>
        </div>
      </div>

      <!-- TOOLBAR -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <div class="section-title">
            {{ t('newStudents.listTitle') }}
            <span class="section-count">{{ filteredStudents.length }} {{ t('newStudents.studentsWord') }}</span>
          </div>
          <div class="filter-chips">
            <div class="chip" :class="{ active: chips.mine }" @click="toggleChip('mine')">
              <span class="chip-dot blue" />{{ t('newStudents.chipMine') }}
            </div>
            <div class="chip" :class="{ active: chips.noManager }" @click="toggleChip('noManager')">
              <span class="chip-dot grey" />{{ t('newStudents.chipNoManager') }}
            </div>
            <div class="chip" :class="{ active: chips.signed }" @click="toggleChip('signed')">
              <span class="chip-dot green" />{{ t('newStudents.chipSigned') }}
            </div>
          </div>
        </div>
        <div class="toolbar-right">
          <!-- Group filter -->
          <div class="dropdown-filter" ref="dfGroupRef">
            <button class="dropdown-filter-btn" :class="{ 'has-value': groupFilter !== 'all' }" @click="toggleDf('group')">
              {{ groupFilterLabel }} ▾
            </button>
            <div class="dropdown-filter-menu" :class="{ open: openDf === 'group' }">
              <div class="df-item" :class="{ selected: groupFilter === 'all' }" @click="setGroupFilter('all')">{{ t('newStudents.allGroups') }}</div>
              <div v-for="g in store.uniqueGroups" :key="g.name" class="df-item" :class="{ selected: groupFilter === g.name }" @click="setGroupFilter(g.name)">
                <span class="df-dot" :style="{ background: g.color }" />{{ g.name }}
              </div>
              <div class="df-item" :class="{ selected: groupFilter === '__none__' }" @click="setGroupFilter('__none__')">— {{ t('newStudents.noGroup') }}</div>
            </div>
          </div>
          <!-- Manager filter -->
          <div class="dropdown-filter" ref="dfManagerRef">
            <button class="dropdown-filter-btn" :class="{ 'has-value': managerFilter !== 'all' }" @click="toggleDf('manager')">
              {{ managerFilterLabel }} ▾
            </button>
            <div class="dropdown-filter-menu" :class="{ open: openDf === 'manager' }">
              <div class="df-item" :class="{ selected: managerFilter === 'all' }" @click="setManagerFilter('all')">{{ t('newStudents.allManagers') }}</div>
              <div v-for="m in store.uniqueManagers" :key="m" class="df-item" :class="{ selected: managerFilter === m }" @click="setManagerFilter(m)">{{ m }}</div>
              <div class="df-item" :class="{ selected: managerFilter === '__none__' }" @click="setManagerFilter('__none__')">— {{ t('newStudents.noManager') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="table-container">
        <div v-if="store.isListLoading" class="list-state loading">
          <div class="list-state-icon">⏳</div>
          <div class="list-state-title">{{ t('newStudents.loading') }}</div>
        </div>

        <div v-else-if="store.listError" class="list-state error">
          <div class="list-state-icon">⚠️</div>
          <div class="list-state-title">{{ t('newStudents.errorTitle') }}</div>
          <div class="list-state-text">{{ store.listError }}</div>
          <button class="btn btn-ghost" @click="reloadCurrentPage">🔄 {{ t('common.retry') }}</button>
        </div>

        <div v-else-if="!sortedStudents.length" class="list-state empty">
          <div class="list-state-icon">📭</div>
          <div class="list-state-title">{{ t('newStudents.emptyTitle') }}</div>
          <div class="list-state-text">{{ store.totalCount > 0 ? t('newStudents.emptyFiltered') : t('newStudents.emptyText') }}</div>
        </div>

        <table v-else>
          <thead>
            <tr>
              <th @click="setSort('name')">{{ t('newStudents.table.name') }} <span class="sort-icon">{{ sortIcon('name') }}</span></th>
              <th @click="setSort('age')">{{ t('newStudents.table.age') }} <span class="sort-icon">{{ sortIcon('age') }}</span></th>
              <th class="no-sort">{{ t('newStudents.table.contract') }}</th>
              <th @click="setSort('payment')">{{ t('newStudents.table.payment') }} <span class="sort-icon">{{ sortIcon('payment') }}</span></th>
              <th class="no-sort">{{ t('newStudents.table.group') }}</th>
              <th @click="setSort('startDate')">{{ t('newStudents.table.startDate') }} <span class="sort-icon">{{ sortIcon('startDate') }}</span></th>
              <th @click="setSort('createdDate')">{{ t('newStudents.table.createdDate') }} <span class="sort-icon">{{ sortIcon('createdDate') }}</span></th>
              <th @click="setSort('waitDays')">{{ t('newStudents.table.waitDays') }} <span class="sort-icon">{{ sortIcon('waitDays') }}</span></th>
              <th class="no-sort">{{ t('newStudents.table.manager') }}</th>
              <th class="no-sort actions-th">···</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in sortedStudents" :key="s.id">
              <!-- Name -->
              <td>
                <div class="student-name" @click="openPanel(s)">{{ s.name }}</div>
              </td>
              <!-- Age -->
              <td>
                <span class="age-mono">{{ s.age }}</span>
                <span class="age-label"> {{ t('newStudents.table.years') }}</span>
              </td>
              <!-- Contract -->
              <td>
                <span class="contract-badge" :class="s.contract === 'signed' ? 'contract-signed' : 'contract-pending'">
                  {{ s.contract === 'signed' ? `✓ ${t('newStudents.table.signed')}` : `⏳ ${t('newStudents.table.pending')}` }}
                </span>
              </td>
              <!-- Payment -->
              <td>
                <span v-if="s.payment > 0" class="payment-mono">{{ s.paymentStr }}</span>
                <span v-else class="payment-zero">0 zł</span>
              </td>
              <!-- Group -->
              <td>
                <div v-if="s.group" class="group-cell">
                  <div class="group-dot" :style="{ background: s.groupColor! }" />
                  <span class="group-name">{{ s.group }}</span>
                </div>
                <button v-else class="add-group-btn" @click="openGroupPicker(s.id)" :title="t('newStudents.addToGroup')">+</button>
              </td>
              <!-- Start date -->
              <td><span class="date-mono">{{ fmtDate(s.startDate) }}</span></td>
              <!-- Created date -->
              <td><span class="date-mono">{{ fmtDate(s.createdDate) }}</span></td>
              <!-- Wait days -->
              <td>
                <div class="timer-cell">
                  <span class="timer-days" :class="timerCls(s.waitDays)">{{ s.waitDays }}</span>
                  <span class="timer-label">{{ t('newStudents.table.days') }}</span>
                </div>
              </td>
              <!-- Manager -->
              <td>
                <div v-if="s.manager" class="person-cell">
                  <div class="manager-avatar" :style="{ background: managerColor(s.manager) }">{{ s.manager.slice(0,2) }}</div>
                  <span class="person-name">{{ s.manager }}</span>
                </div>
                <span v-else class="empty-cell">— {{ t('newStudents.table.notAssigned') }}</span>
              </td>
              <!-- Actions -->
              <td class="actions-td">
                <div class="actions-wrap">
                  <div class="actions-btn" @click.stop="toggleActions(s.id)">⋯</div>
                  <div class="actions-dropdown" :class="{ open: openActions === s.id }">
                    <div class="action-item" @click="openPanel(s)"><span class="ai">👤</span>{{ t('newStudents.actions.open') }}</div>
                    <div class="action-item" @click="onEmail(s.id)"><span class="ai">✉️</span>{{ t('newStudents.actions.email') }}</div>
                    <div class="action-item danger" @click="onArchive(s.id)"><span class="ai">📦</span>{{ t('newStudents.actions.archive') }}</div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer">
          <span class="table-info">{{ t('newStudents.showing', { shown: sortedStudents.length, total: store.totalCount }) }}</span>
          <div v-if="store.pagination.lastPage > 1" class="pagination-wrap">
            <span class="pagination-summary">{{ t('newStudents.pageOf', { page: store.pagination.currentPage, total: store.pagination.lastPage }) }}</span>
            <div class="pagination-controls">
              <button class="page-btn nav" :disabled="store.pagination.currentPage <= 1 || store.isListLoading" @click="goToPage(store.pagination.currentPage - 1)">‹</button>
              <template v-for="(page, index) in visiblePages" :key="`${page}-${index}`">
                <span v-if="page === '…'" class="page-ellipsis">{{ page }}</span>
                <button
                  v-else
                  class="page-btn"
                  :class="{ active: page === store.pagination.currentPage }"
                  :disabled="store.isListLoading"
                  @click="goToPage(Number(page))"
                >
                  {{ page }}
                </button>
              </template>
              <button class="page-btn nav" :disabled="store.pagination.currentPage >= store.pagination.lastPage || store.isListLoading" @click="goToPage(store.pagination.currentPage + 1)">›</button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ADD STUDENT MODAL -->
    <Teleport to="body">
      <Transition name="modal">
        <div class="modal-backdrop" v-if="addModalOpen" @click.self="addModalOpen = false">
          <div class="modal">
            <div class="modal-close-btn" @click="addModalOpen = false">✕</div>
            <div class="modal-title">✦ {{ t('newStudents.modal.title') }}</div>
            <div class="modal-sub">{{ t('newStudents.modal.subtitle') }}</div>
            <div class="modal-grid">
              <div class="modal-field">
                <div class="modal-label">{{ t('newStudents.modal.firstName') }}</div>
                <input class="modal-input" v-model="newForm.firstName" :placeholder="t('newStudents.modal.firstNamePh')" />
              </div>
              <div class="modal-field">
                <div class="modal-label">{{ t('newStudents.modal.lastName') }}</div>
                <input class="modal-input" v-model="newForm.lastName" :placeholder="t('newStudents.modal.lastNamePh')" />
              </div>
            </div>
            <div class="modal-grid">
              <div class="modal-field">
                <div class="modal-label">{{ t('newStudents.modal.age') }}</div>
                <input class="modal-input" v-model.number="newForm.age" type="number" min="3" max="99" />
              </div>
              <div class="modal-field">
                <div class="modal-label">{{ t('newStudents.modal.manager') }}</div>
                <select class="modal-input" v-model="newForm.manager">
                  <option value="">— {{ t('newStudents.modal.notAssigned') }}</option>
                  <option v-for="m in ['Светлана','Александр','Мария','Артём']" :key="m">{{ m }}</option>
                </select>
              </div>
            </div>
            <div class="modal-field">
              <div class="modal-label">{{ t('newStudents.modal.startDate') }}</div>
              <input class="modal-input" v-model="newForm.startDate" type="date" />
            </div>
            <div class="modal-actions">
              <button class="btn btn-ghost" @click="addModalOpen = false">{{ t('common.cancel') }}</button>
              <button class="btn btn-primary" @click="submitAdd">✦ {{ t('newStudents.modal.submit') }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- GROUP PICKER -->
    <GroupPickerPanel
      v-model="groupPickerOpen"
      :student-name="groupPickerForName"
      @pick="onGroupPicked"
    />

    <!-- STUDENT SIDE PANEL -->
    <StudentSidePanel
      :student="activeStudent"
      :details="activeDetails"
      :payments="activePayments"
      :history-list="activeHistory"
      @close="activeStudent = null"
      @save="onPanelSave"
      @delete="onPanelDelete"
      @email="onPanelEmail"
      @set-price="onPanelSetPrice"
      @load-payments="onPanelLoadPayments"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNewStudentsStore, type NewStudent, type StudentPayments, MANAGER_COLORS } from '../../stores/newStudents.store'
import { useNotificationStore } from '../../stores/notification.store'
import GroupPickerPanel from './components/GroupPickerPanel.vue'
import StudentSidePanel from './components/StudentSidePanel.vue'

const { t } = useI18n()
const store = useNewStudentsStore()
const notif = useNotificationStore()

// ─── FILTERS ───
const searchQ    = ref('')
const chips      = ref({ mine: false, noManager: false, signed: false })
const groupFilter   = ref('all')
const managerFilter = ref('all')
const openDf     = ref<string | null>(null)
const openActions = ref<number | null>(null)

const groupFilterLabel = computed(() => {
  if (groupFilter.value === 'all')     return t('newStudents.filterGroup')
  if (groupFilter.value === '__none__') return t('newStudents.noGroup')
  return groupFilter.value.split(' ').slice(0, 3).join(' ')
})
const managerFilterLabel = computed(() => {
  if (managerFilter.value === 'all')     return t('newStudents.filterManager')
  if (managerFilter.value === '__none__') return t('newStudents.noManager')
  return managerFilter.value
})

function toggleChip(k: keyof typeof chips.value) {
  chips.value[k] = !chips.value[k]
  applyFilters()
}
function setGroupFilter(v: string)   { groupFilter.value = v;   openDf.value = null; }
function setManagerFilter(v: string) { managerFilter.value = v; openDf.value = null; }
function toggleDf(name: string) { openDf.value = openDf.value === name ? null : name }

// ─── FILTER COMPUTED ───
const filteredStudents = computed(() => {
  const q = searchQ.value.toLowerCase().trim()
  return store.students.filter(s => {
    if (q && !s.name.toLowerCase().includes(q)) return false
    if (chips.value.mine      && s.manager !== 'Артём')    return false
    if (chips.value.noManager && s.manager)                return false
    if (chips.value.signed    && s.contract !== 'signed')  return false
    if (groupFilter.value !== 'all') {
      if (groupFilter.value === '__none__' && s.group)     return false
      if (groupFilter.value !== '__none__' && s.group !== groupFilter.value) return false
    }
    if (managerFilter.value !== 'all') {
      if (managerFilter.value === '__none__' && s.manager) return false
      if (managerFilter.value !== '__none__' && s.manager !== managerFilter.value) return false
    }
    return true
  })
})

function applyFilters() { /* reactivity handles it */ }

// ─── SORT ───
const sortCol = ref<string | null>(null)
const sortDir = ref(1)

function setSort(col: string) {
  if (sortCol.value === col) sortDir.value *= -1
  else { sortCol.value = col; sortDir.value = 1 }
}
function sortIcon(col: string) {
  if (sortCol.value !== col) return '↕'
  return sortDir.value === 1 ? '↑' : '↓'
}
function sortVal(s: NewStudent, col: string): string | number {
  switch (col) {
    case 'name':        return s.name.toLowerCase()
    case 'age':         return s.age
    case 'payment':     return s.payment
    case 'waitDays':    return s.waitDays
    case 'startDate':   return s.startDate || ''
    case 'createdDate': return s.createdDate || ''
    default:            return ''
  }
}

const sortedStudents = computed(() => {
  const list = [...filteredStudents.value]
  if (sortCol.value) {
    list.sort((a, b) => {
      const va = sortVal(a, sortCol.value!), vb = sortVal(b, sortCol.value!)
      return va < vb ? -sortDir.value : va > vb ? sortDir.value : 0
    })
  }
  return list
})

const visiblePages = computed<(number | string)[]>(() => {
  const current = store.pagination.currentPage
  const last = store.pagination.lastPage

  if (last <= 7) {
    return Array.from({ length: last }, (_, index) => index + 1)
  }

  const pages: (number | string)[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(last - 1, current + 1)

  if (start > 2) pages.push('…')
  for (let page = start; page <= end; page += 1) pages.push(page)
  if (end < last - 1) pages.push('…')
  pages.push(last)

  return pages
})

// ─── HELPERS ───
function fmtDate(s: string | null) {
  if (!s) return '—'
  const [y, m, d] = s.split('-')
  return `${d}.${m}.${y}`
}
function timerCls(d: number) { return d <= 3 ? 'low' : d <= 10 ? 'mid' : 'high' }
function managerColor(name: string) { return MANAGER_COLORS[name] || 'linear-gradient(135deg,#4f6ef7,#8b5cf6)' }

// ─── ACTIONS ───
function toggleActions(id: number) {
  openActions.value = openActions.value === id ? null : id
}
function onEmail(_id: number) {
  openActions.value = null
  notif.addToast(`✉️ Email — ${t('newStudents.inDev')}`, 'info')
}
function onArchive(id: number) {
  const s = store.students.find(x => x.id === id)
  store.archiveStudent(id)
  openActions.value = null
  notif.addToast(`📦 ${s?.name} — ${t('newStudents.archived')}`, 'success')
}
function onExport() {
  notif.addToast(`⬇ ${t('newStudents.inDev')}`, 'info')
}

function goToPage(page: number) {
  if (page < 1 || page > store.pagination.lastPage || page === store.pagination.currentPage) return
  store.fetchStudentsFromApi(page)
}

function reloadCurrentPage() {
  store.fetchStudentsFromApi(store.pagination.currentPage)
}

// Close dropdowns on outside click
function onDocClick(_e: MouseEvent) {
  openDf.value = null
  openActions.value = null
}
onMounted(() => {
  store.fetchStudentsFromApi()
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

// ─── ADD MODAL ───
const addModalOpen = ref(false)
const newForm = ref({ firstName: '', lastName: '', age: 0, manager: '', startDate: '' })

function submitAdd() {
  const firstName = newForm.value.firstName.trim()
  const lastName  = newForm.value.lastName.trim()
  if (!firstName) { notif.addToast(`⚠️ ${t('newStudents.modal.nameRequired')}`, 'error'); return }
  store.addStudent({
    name: [firstName, lastName].filter(Boolean).join(' '),
    age: newForm.value.age || 0,
    manager: newForm.value.manager || null,
    startDate: newForm.value.startDate || null,
  })
  newForm.value = { firstName: '', lastName: '', age: 0, manager: '', startDate: '' }
  addModalOpen.value = false
  notif.addToast(`✅ ${t('newStudents.studentAdded')}`, 'success')
}

// ─── GROUP PICKER ───
const groupPickerOpen   = ref(false)
const groupPickerForId  = ref<number | null>(null)
const groupPickerForName = computed(() => {
  const s = store.students.find(x => x.id === groupPickerForId.value)
  return s ? `${t('newStudents.groupPicker.for')}: ${s.name}` : ''
})

function openGroupPicker(id: number) {
  groupPickerForId.value = id
  groupPickerOpen.value = true
}
function onGroupPicked(groupName: string, color: string) {
  if (!groupPickerForId.value) return
  const s = store.students.find(x => x.id === groupPickerForId.value)
  store.assignGroup(groupPickerForId.value, groupName, color)
  notif.addToast(`✅ ${s?.name} → «${groupName}»`, 'success')
  groupPickerForId.value = null
}

// ─── STUDENT PANEL ───
const activeStudent = ref<NewStudent | null>(null)
const activeDetails = computed(() =>
  activeStudent.value
    ? (store.currentStudentDetails ?? store.getDetails(activeStudent.value.id))
    : null
)
const activeHistory = computed(() =>
  activeStudent.value
    ? (store.currentHistory.length
        ? store.currentHistory
        : store.getHistory(activeStudent.value.id))
    : []
)
const activePayments = computed<StudentPayments | null>(() => {
  if (!activeStudent.value) return null
  if (store.currentStudentPayments?.studentId === activeStudent.value.id) {
    return store.currentStudentPayments
  }

  return {
    studentId: activeStudent.value.id,
    currentPrice: activeDetails.value?.currentPrice || '0.00',
    currentPriceDesc: activeDetails.value?.currentPriceDesc || 'Не выбран',
    documentList: [],
    transactionList: [],
  }
})

function openPanel(s: NewStudent) {
  openActions.value = null
  activeStudent.value = s
  store.fetchStudentById(s.id)
  store.fetchStudentHistory(s.id)
}
function onPanelSave(data: Parameters<typeof store.saveDetails>[1]) {
  if (!activeStudent.value) return
  store.saveDetails(activeStudent.value.id, data)
  notif.addToast(`✅ ${t('newStudents.panel.saved')}`, 'success')
}
function onPanelDelete() {
  if (!activeStudent.value) return
  const name = activeStudent.value.name
  store.archiveStudent(activeStudent.value.id)
  activeStudent.value = null
  notif.addToast(`🗑 ${name} ${t('newStudents.deleted')}`, 'success')
}
function onPanelEmail() {
  notif.addToast(`✉️ Email — ${t('newStudents.inDev')}`, 'info')
}
function onPanelSetPrice(amount: string, desc: string) {
  if (!activeStudent.value) return
  store.setPrice(activeStudent.value.id, amount, desc)
  notif.addToast(`💰 ${t('newStudents.panel.priceSet')}: ${amount} zł`, 'success')
}
function onPanelLoadPayments() {
  if (!activeStudent.value) return
  store.fetchStudentPayments(activeStudent.value.id)
}
</script>

<style scoped>
.ns-page { display: flex; flex-direction: column; min-height: 0; flex: 1; }

/* ACTIONS ROW */
.ns-actions-row {
  display: flex; align-items: center; gap: 10px; justify-content: flex-end;
  margin-bottom: 20px;
}

.search-box {
  display: flex; align-items: center; gap: 8px; background: var(--app-surface);
  border: 1px solid var(--app-border); border-radius: 8px; padding: 7px 12px; transition: all 0.2s;
}
.search-box:focus-within { border-color: var(--app-border-hi); box-shadow: 0 0 12px rgba(79,110,247,0.1); }
.search-icon { color: var(--app-text-dim); font-size: 14px; }
.search-box input { background: none; border: none; outline: none; color: var(--app-text-main); font-family: 'Outfit', sans-serif; font-size: 13px; width: 200px; }
.search-box input::placeholder { color: var(--app-text-dim); }

/* CONTENT */
.ns-content { padding: 24px 28px; flex: 1; overflow-y: auto; }
.ns-content::-webkit-scrollbar { width: 4px; }
.ns-content::-webkit-scrollbar-thumb { background: rgba(79,110,247,0.2); border-radius: 2px; }

.list-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
  min-height: 240px; padding: 32px 20px; text-align: center;
}
.list-state-icon { font-size: 32px; opacity: 0.9; }
.list-state-title { font-size: 18px; font-weight: 700; color: var(--app-text-main); }
.list-state-text { max-width: 560px; font-size: 13px; color: var(--app-text-dim); line-height: 1.5; }
.list-state.error .list-state-title { color: #ef4444; }
.list-state.loading .list-state-title { color: #4f6ef7; }

/* STATS */
.stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
.stat-card {
  background: var(--app-card); border: 1px solid var(--app-border); border-radius: 14px;
  padding: 20px; position: relative; overflow: hidden; transition: all 0.3s; cursor: default;
}
.stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 14px 14px 0 0; }
.stat-card.blue::before  { background: linear-gradient(90deg,#4f6ef7,#8b5cf6); }
.stat-card.green::before { background: linear-gradient(90deg,#10b981,#06b6d4); }
.stat-card.amber::before { background: linear-gradient(90deg,#f59e0b,#f97316); }
.stat-card.cyan::before  { background: linear-gradient(90deg,#06b6d4,#4f6ef7); }
.stat-card:hover { border-color: var(--app-border-hi); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
.stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--app-text-dim); margin-bottom: 10px; }
.stat-value { font-size: 26px; font-weight: 700; font-family: 'Space Mono', monospace; color: var(--app-text-main); line-height: 1; margin-bottom: 6px; }
.stat-sub { font-size: 11.5px; color: var(--app-text-dim); }
.stat-sub .up   { color: #10b981; }
.stat-sub .warn { color: #f59e0b; }
.stat-icon { position: absolute; top: 16px; right: 16px; font-size: 22px; opacity: 0.4; }

/* TOOLBAR */
.table-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 16px; flex-wrap: wrap; }
.toolbar-left  { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.toolbar-right { display: flex; gap: 8px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--app-text-main); display: flex; align-items: center; gap: 8px; }
.section-count { font-size: 11px; font-family: 'Space Mono', monospace; background: rgba(79,110,247,0.15); color: #4f6ef7; border: 1px solid rgba(79,110,247,0.3); padding: 2px 8px; border-radius: 8px; }

.filter-chips { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.chip { display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: 1px solid var(--app-border); background: var(--app-card); color: var(--app-text-dim); }
.chip:hover { border-color: var(--app-border-hi); color: var(--app-text-main); }
.chip.active { background: rgba(79,110,247,0.15); border-color: rgba(79,110,247,0.5); color: var(--app-text-main); }
.chip-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.chip-dot.blue  { background: #4f6ef7; }
.chip-dot.grey  { background: var(--app-text-dim); }
.chip-dot.green { background: #10b981; }

.dropdown-filter { position: relative; }
.dropdown-filter-btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px;
  font-size: 12.5px; font-weight: 500; cursor: pointer; transition: all 0.15s;
  border: 1px solid var(--app-border); background: var(--app-card); color: var(--app-text-dim); font-family: 'Outfit', sans-serif;
}
.dropdown-filter-btn:hover { border-color: var(--app-border-hi); color: var(--app-text-main); }
.dropdown-filter-btn.has-value { border-color: rgba(79,110,247,0.4); color: #4f6ef7; background: rgba(79,110,247,0.08); }
.dropdown-filter-menu { position: absolute; top: calc(100% + 6px); left: 0; background: var(--app-surface); border: 1px solid var(--app-border-hi); border-radius: 10px; min-width: 200px; z-index: 200; display: none; box-shadow: 0 8px 24px rgba(0,0,0,0.15); overflow: hidden; }
.dropdown-filter-menu.open { display: block; }
.df-item { padding: 9px 14px; font-size: 13px; cursor: pointer; transition: background 0.15s; color: var(--app-text-dim); display: flex; align-items: center; gap: 8px; }
.df-item:hover { background: rgba(79,110,247,0.1); color: var(--app-text-main); }
.df-item.selected { color: #4f6ef7; background: rgba(79,110,247,0.06); }
.df-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* TABLE */
.table-container { background: var(--app-card); border: 1px solid var(--app-border); border-radius: 14px; overflow: hidden; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; min-width: 1100px; }
thead tr { background: var(--app-surface); border-bottom: 1px solid var(--app-border); }
th { padding: 11px 14px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--app-text-dim); white-space: nowrap; cursor: pointer; user-select: none; transition: color 0.15s; }
th:hover { color: var(--app-text-main); background: rgba(79,110,247,0.04); }
th.no-sort { cursor: default; }
th.no-sort:hover { background: none; color: var(--app-text-dim); }
.actions-th { width: 60px; text-align: center; }
.sort-icon { display: inline-block; margin-left: 4px; font-size: 10px; opacity: 0.5; vertical-align: middle; }
tbody tr { border-bottom: 1px solid rgba(100,120,255,0.07); transition: all 0.15s; }
tbody tr:last-child { border-bottom: none; }
tbody tr:hover { background: rgba(79,110,247,0.04); }
td { padding: 12px 14px; font-size: 13.5px; vertical-align: middle; white-space: nowrap; }

.student-name { font-weight: 600; font-size: 13.5px; color: #4f6ef7; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(79,110,247,0.5); }
.student-name:hover { color: #8b5cf6; }
.age-mono  { font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; color: var(--app-text-main); }
.age-label { color: var(--app-text-dim); font-size: 11px; }

.contract-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.contract-signed  { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
.contract-pending { background: rgba(136,146,176,0.1); color: var(--app-text-dim); border: 1px solid rgba(136,146,176,0.2); }

.payment-mono { font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; color: var(--app-text-main); }
.payment-zero { color: var(--app-text-dim); font-style: italic; font-family: 'Space Mono', monospace; font-size: 13px; }

.group-cell { display: flex; align-items: center; gap: 8px; }
.group-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.group-name { font-size: 13px; color: var(--app-text-main); }

.add-group-btn {
  width: 32px; height: 32px; border-radius: 50%; background: rgba(16,185,129,0.12); color: #10b981;
  border: 1px solid rgba(16,185,129,0.3); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s; font-size: 18px; line-height: 1;
}
.add-group-btn:hover { background: rgba(16,185,129,0.25); box-shadow: 0 0 10px rgba(16,185,129,0.3); transform: scale(1.1); }

.date-mono { font-family: 'Space Mono', monospace; font-size: 12.5px; color: var(--app-text-main); }

.timer-cell { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; }
.timer-days { font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700; }
.timer-label { font-size: 10px; color: var(--app-text-dim); text-transform: uppercase; letter-spacing: 0.06em; }
.timer-days.low  { color: #10b981; }
.timer-days.mid  { color: #f59e0b; }
.timer-days.high { color: #ef4444; }

.person-cell { display: flex; align-items: center; gap: 8px; }
.manager-avatar {
  width: 27px; height: 27px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0; border: 1.5px solid rgba(255,255,255,0.1); color: white;
}
.person-name { font-size: 13px; font-weight: 500; color: var(--app-text-main); }
.empty-cell  { color: var(--app-text-dim); font-size: 12px; font-style: italic; opacity: 0.5; }

.actions-td { text-align: center; }
.actions-wrap { position: relative; display: inline-flex; justify-content: center; }
.actions-btn {
  width: 32px; height: 32px; border-radius: 8px; background: var(--app-surface);
  border: 1px solid var(--app-border); color: var(--app-text-dim); display: flex;
  align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; font-size: 16px;
}
.actions-btn:hover { background: rgba(79,110,247,0.1); border-color: var(--app-border-hi); color: var(--app-text-main); }
.actions-dropdown {
  position: absolute; right: 0; top: calc(100% + 6px); background: var(--app-surface);
  border: 1px solid var(--app-border-hi); border-radius: 10px; min-width: 180px; z-index: 300;
  display: none; box-shadow: 0 8px 24px rgba(0,0,0,0.15); overflow: hidden;
}
.actions-dropdown.open { display: block; }
.action-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; font-size: 13px; cursor: pointer; transition: background 0.15s; color: var(--app-text-dim); font-weight: 500; }
.action-item:hover { background: rgba(79,110,247,0.08); color: var(--app-text-main); }
.action-item:not(:last-child) { border-bottom: 1px solid rgba(100,120,255,0.07); }
.ai { font-size: 14px; }
.action-item.danger { color: #ef4444; }
.action-item.danger:hover { background: rgba(239,68,68,0.08); }

.table-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid var(--app-border); }
.table-info { color: var(--app-text-dim); font-size: 12.5px; }
.pagination-wrap { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: flex-end; }
.pagination-summary { color: var(--app-text-dim); font-size: 12.5px; }
.pagination-controls { display: flex; align-items: center; gap: 6px; }
.page-btn {
  min-width: 34px; height: 34px; padding: 0 10px; border-radius: 10px;
  border: 1px solid var(--app-border); background: var(--app-surface); color: var(--app-text-main);
  cursor: pointer; transition: all .2s ease; font-family: 'Outfit', sans-serif; font-weight: 600;
}
.page-btn:hover:not(:disabled) { border-color: var(--app-border-hi); transform: translateY(-1px); }
.page-btn.active { background: linear-gradient(135deg,#4f6ef7,#8b5cf6); color: #fff; border-color: transparent; }
.page-btn.nav { font-size: 18px; line-height: 1; }
.page-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.page-ellipsis { padding: 0 2px; color: var(--app-text-dim); }

/* ADD MODAL */
.modal-backdrop { position: fixed; inset: 0; background: rgba(4,4,15,0.82); backdrop-filter: blur(8px); z-index: 500; display: flex; align-items: center; justify-content: center; }
.modal { background: var(--app-surface); border: 1px solid var(--app-border-hi); border-radius: 16px; padding: 28px; width: 500px; max-width: calc(100vw - 40px); max-height: calc(100vh - 40px); overflow-y: auto; position: relative; box-shadow: 0 24px 80px rgba(0,0,0,0.3); }

.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-enter-from .modal { transform: scale(0.9) translateY(20px); }
.modal-close-btn { position: absolute; top: 16px; right: 16px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; cursor: pointer; background: var(--app-card); border: 1px solid var(--app-border); color: var(--app-text-dim); font-size: 14px; transition: all 0.15s; }
.modal-close-btn:hover { background: rgba(239,68,68,0.15); color: #ef4444; }
.modal-title { font-size: 18px; font-weight: 700; margin-bottom: 4px; color: var(--app-text-main); padding-right: 36px; }
.modal-sub   { font-size: 12.5px; color: var(--app-text-dim); margin-bottom: 20px; }
.modal-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 4px; }
.modal-field { margin-bottom: 16px; }
.modal-label { font-size: 11.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--app-text-dim); margin-bottom: 7px; }
.modal-input { width: 100%; background: var(--app-card); border: 1px solid var(--app-border); border-radius: 8px; padding: 9px 12px; color: var(--app-text-main); font-family: 'Outfit', sans-serif; font-size: 13.5px; outline: none; transition: all 0.2s; appearance: none; }
.modal-input:focus { border-color: var(--app-border-hi); box-shadow: 0 0 12px rgba(79,110,247,0.1); }
.modal-actions { display: flex; gap: 10px; margin-top: 20px; }
.modal-actions .btn { flex: 1; justify-content: center; }
</style>
