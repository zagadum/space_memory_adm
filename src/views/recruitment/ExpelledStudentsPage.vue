<template>
  <div class="content">

    <!-- Заголовок страницы (в table-toolbar) -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <div class="section-title">
          📤 {{ t('expelled.pageTitle') }}
          <span class="section-count">инструмент повторных продаж · дозакрытие</span>
        </div>
      </div>
    </div>

    <!-- 4 карточки статистики -->
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-label">{{ t('expelled.stats.total') }}</div>
        <div class="stat-value">{{ store.stats?.total ?? 0 }}</div>
        <div class="stat-sub">{{ t('expelled.stats.totalSub') }}</div>
        <div class="stat-icon">📞</div>
      </div>

      <div class="stat-card amber">
        <div class="stat-label">{{ t('expelled.stats.hot') }}</div>
        <div class="stat-value">{{ store.stats?.hot ?? 0 }}</div>
        <div class="stat-sub"><span class="warn">{{ t('expelled.stats.hotSub') }}</span></div>
        <div class="stat-icon">🔥</div>
      </div>

      <div class="stat-card red">
        <div class="stat-label">{{ t('expelled.stats.none') }}</div>
        <div class="stat-value">{{ store.stats?.none ?? 0 }}</div>
        <div class="stat-sub">{{ t('expelled.stats.noneSub') }}</div>
        <div class="stat-icon">📵</div>
      </div>

      <div class="stat-card green">
        <div class="stat-label">{{ t('expelled.stats.unpaid') }}</div>
        <div class="stat-value">{{ store.stats?.unpaid ?? 0 }}</div>
        <div class="stat-sub"><span class="up">{{ t('expelled.stats.unpaidSub') }}</span></div>
        <div class="stat-icon">💳</div>
      </div>
    </div>

    <!-- Bulk-бар -->
    <div v-if="store.selectedIds.length > 0" class="table-toolbar" style="background: var(--status-info-bg); padding: 12px; border-radius: 12px; border: 1px solid var(--border);">
      <div class="toolbar-left">
        <span style="font-weight: bold; color: var(--blue);">{{ store.selectedIds.length }} {{ t('expelled.bulk.selected') }}</span>
      </div>
      <div class="toolbar-right">
        <button class="btn btn-ghost" @click="showBulkAssignModal = true">👤 {{ t('expelled.bulk.assign') }}</button>
        <button class="btn btn-danger" @click="openBulkArchive">🗃️ {{ t('expelled.bulk.archive') }}</button>
        <button class="btn btn-ghost" @click="store.clearSelection()">✕ {{ t('expelled.bulk.deselect') }}</button>
      </div>
    </div>

    <!-- Тулбар с фильтрами -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <div class="section-title">
          СПИСОК
          <span class="section-count">{{ filtered.length }}</span>
        </div>
      </div>
      <div class="toolbar-right">
        <!-- Поиск -->
        <div class="search-box">
          <input v-model="search" type="text"
            style="min-width: 200px;"
            :placeholder="t('expelled.filter.search')" />
        </div>

        <!-- Фильтр: Ответственный -->
        <select v-model="filterManager" class="dropdown-filter-btn">
          <option value="all">{{ t('expelled.filter.allManagers') }}</option>
          <option value="__none__">{{ t('expelled.filter.noManager') }}</option>
          <option v-for="m in managerOptions" :key="m" :value="m">{{ m }}</option>
        </select>

        <!-- Фильтр: Группа -->
        <select v-model="filterGroup" class="dropdown-filter-btn">
          <option value="all">{{ t('expelled.filter.allGroups') }}</option>
          <option v-for="g in groupOptions" :key="g" :value="g">{{ g }}</option>
        </select>

        <!-- Фильтр: Последний контакт -->
        <select v-model="filterContact" class="dropdown-filter-btn">
          <option value="all">{{ t('expelled.filter.contactAny') }}</option>
          <option value="none">{{ t('expelled.filter.contactNone') }}</option>
          <option value="hot">{{ t('expelled.filter.contactHot') }}</option>
          <option value="week">{{ t('expelled.filter.contactWeek') }}</option>
          <option value="today">{{ t('expelled.filter.contactToday') }}</option>
        </select>

        <!-- Сортировка -->
        <select v-model="sortBy" class="dropdown-filter-btn">
          <option value="con_asc">{{ t('expelled.sort.conAsc') }}</option>
          <option value="con_desc">{{ t('expelled.sort.conDesc') }}</option>
          <option value="exp_asc">{{ t('expelled.sort.expAsc') }}</option>
          <option value="exp_desc">{{ t('expelled.sort.expDesc') }}</option>
        </select>
      </div>
    </div>

    <!-- Loading / Error / Empty / Таблица -->
    <div v-if="store.isLoading" class="table-toolbar" style="justify-content: center; padding: 40px;">
      <span class="section-title" style="color: var(--dim);">{{ t('expelled.loading') }}</span>
    </div>

    <div v-else-if="store.error" class="table-toolbar" style="justify-content: center; padding: 40px;">
      <span class="section-title" style="color: #ef4444;">{{ store.error }}</span>
    </div>

    <div v-else-if="!filtered.length" class="table-toolbar" style="justify-content: center; padding: 60px; flex-direction: column; gap: 10px;">
      <span style="font-size: 40px; opacity: 0.3;">📤</span>
      <span class="section-title">{{ t('expelled.empty.title') }}</span>
      <span style="color: var(--dim); font-size: 13px;">{{ t('expelled.empty.sub') }}</span>
    </div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">
              <input type="checkbox" :checked="allSelected" @change="toggleAll" style="cursor: pointer;" />
            </th>
            <th>{{ t('expelled.table.name') }}</th>
            <th>{{ t('expelled.table.group') }}</th>
            <th>{{ t('expelled.table.type') }}</th>
            <th style="text-align: center;">{{ t('expelled.table.paid') }}</th>
            <th>{{ t('expelled.table.expelled') }}</th>
            <th>{{ t('expelled.table.lastContact') }}</th>
            <th>{{ t('expelled.table.manager') }}</th>
            <th>{{ t('expelled.table.comment') }}</th>
            <th class="actions-header">···</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filtered" :key="s.id"
            :style="[isHot(s) ? { boxShadow: 'inset 3px 0 0 #ef4444', backgroundColor: 'rgba(239,68,68,0.03)' } : {}, { lineHeight: '1' }]">

            <td style="padding: 10px 11px; vertical-align: middle; text-align: center;">
              <input type="checkbox"
                :checked="store.selectedIds.includes(s.id)"
                @change="store.toggleSelect(s.id)"
                style="cursor: pointer;" />
            </td>

            <td style="padding: 10px 11px; vertical-align: middle;">
              <div class="name-cell">
                <span class="student-name">{{ s.name }}</span>
                <span class="student-meta">{{ s.phone }}</span>
              </div>
            </td>

            <td style="padding: 10px 11px; vertical-align: middle;">
              <div class="group-cell">
                <span class="group-dot" style="background: var(--blue);"></span>
                <span class="group-name">{{ s.group }}</span>
              </div>
            </td>

            <td style="padding: 10px 11px; vertical-align: middle;">
              <span class="chip" :style="s.type === 'individual' ? 'border-color: var(--blue); color: var(--blue);' : 'border-color: var(--purple); color: var(--purple);'">
                {{ s.type === 'individual' ? '👤 ' + t('expelled.table.typeIndividual') : '👥 ' + t('expelled.table.typeGroup') }}
              </span>
            </td>

            <td style="padding: 10px 11px; vertical-align: middle; text-align: center; font-size: 16px;">{{ s.paid ? '✅' : '❌' }}</td>

            <td style="padding: 10px 11px; vertical-align: middle;"><span class="date-mono">{{ formatDate(s.expelled) }}</span></td>

            <td style="padding: 10px 11px; vertical-align: middle;">
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <input type="date"
                  :value="s.lastContact ?? ''"
                  class="dropdown-filter-btn"
                  style="width: 140px; padding: 4px 8px; font-family: 'Space Mono', monospace;"
                  @change="onFieldChange(s.id, 'lastContact', ($event.target as HTMLInputElement).value)" />
                <span class="chip" style="font-size: 10px; padding: 2px 6px; width: fit-content;"
                  :style="s.lastContact ? (isHot(s) ? 'background: #ef444422; color: #ef4444; border-color: #ef4444' : 'background: #10b98122; color: #10b981; border-color: #10b981') : 'background: var(--surface);'">
                  {{ contactTagText(s.lastContact) }}
                </span>
              </div>
            </td>

            <td style="padding: 10px 11px; vertical-align: middle;">
              <select
                :value="s.manager"
                class="dropdown-filter-btn"
                style="max-width: 120px; padding: 4px 8px;"
                @change="onFieldChange(s.id, 'manager', ($event.target as HTMLSelectElement).value)">
                <option value="">— Нет —</option>
                <option v-for="m in MANAGERS" :key="m" :value="m">{{ m }}</option>
              </select>
            </td>

            <td style="padding: 10px 11px; vertical-align: middle;">
              <input type="text"
                :value="s.comment"
                placeholder="Добавить..."
                class="dropdown-filter-btn"
                style="width: 140px; padding: 4px 8px;"
                @change="onFieldChange(s.id, 'comment', ($event.target as HTMLInputElement).value)" />
            </td>

            <td style="padding: 10px 11px; vertical-align: middle;">
              <div class="actions-wrap" @click.stop>
                <button class="actions-btn" @click="toggleActMenu(s.id)">⋮</button>
                <div class="actions-dropdown" :class="{ open: actMenuId === s.id }">
                  <div v-if="isManager" class="action-item" style="color: var(--green);" @click="openTransfer(s)">⭐ {{ t('expelled.actions.transferAny') }}</div>
                  <div v-if="isManager" class="action-divider"></div>
                  <div class="action-item" @click="openTransfer(s)">🔄 {{ t('expelled.actions.transfer') }}</div>
                  <div class="action-divider"></div>
                  <div class="action-item" @click="markToday(s.id)">📞 {{ t('expelled.actions.callToday') }}</div>
                  <div class="action-divider"></div>
                  <div class="action-item" @click="openHistory(s)">📋 {{ t('expelled.actions.history') }}</div>
                  <div class="action-divider"></div>
                  <div class="action-item danger" @click="openArchive(s)">🗃️ {{ t('expelled.actions.archive') }}</div>
                </div>
              </div>
            </td>

          </tr>
        </tbody>
      </table>
      
      <div class="pagination-footer">
        <span class="pagination-info">{{ t('expelled.showing', { shown: filtered.length, total: store.stats?.total ?? 0 }) }}</span>
      </div>
    </div>

    <!-- Компоненты-панели -->
    <ExpelledHistoryPanel v-model="showHistory" :student="activeStudent" />
    <ExpelledTransferPanel v-model="showTransfer" :student="activeStudent" @transfer="onTransfer" />

    <!-- Модалка: назначить менеджера -->
    <Teleport to="body">
      <div class="modal-backdrop" :class="{ active: showBulkAssignModal }" @click.self="showBulkAssignModal = false">
        <div class="modal" style="width: 400px;">
          <div class="popup-title">👤 {{ t('expelled.bulk.assign') }}</div>
          <div class="popup-sub">Для {{ store.selectedIds.length }} учеников</div>
          
          <label class="popup-label">{{ t('expelled.table.manager') }}</label>
          <select v-model="bulkManager" class="modal-input">
            <option value="">— Выберите —</option>
            <option v-for="m in MANAGERS" :key="m" :value="m">{{ m }}</option>
          </select>
          
          <div class="popup-actions">
            <button class="btn btn-ghost" @click="showBulkAssignModal = false">{{ t('common.cancel') }}</button>
            <button class="btn btn-primary" @click="confirmBulkAssign">{{ t('expelled.actions.apply') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Модалка: Архивация одного -->
    <Teleport to="body">
      <div class="modal-backdrop" :class="{ active: showArchiveModal }" @click.self="showArchiveModal = false">
        <div class="modal" style="width: 500px;">
          <div class="popup-title">🗃️ {{ t('expelled.archiveTitle') }}</div>
          <div class="popup-sub">{{ t('expelled.archiveSub') }}</div>
          
          <label class="popup-label">{{ t('expelled.archiveReason') }}</label>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
            <label v-for="r in ARCHIVE_REASONS" :key="r" class="chip" style="justify-content: flex-start; padding: 10px 14px;" :class="{ active: archiveReason === r }">
              <input type="radio" v-model="archiveReason" :value="r" style="margin-right: 8px;" />
              {{ r }}
            </label>
          </div>
          
          <div v-if="archiveReason === 'Другое'">
            <label class="popup-label">{{ t('expelled.archiveSpecify') }}</label>
            <input type="text" v-model="archiveReasonOther" :placeholder="t('common.add')" class="modal-input" />
          </div>
          
          <div class="popup-actions">
            <button class="btn btn-ghost" @click="showArchiveModal = false">{{ t('common.cancel') }}</button>
            <button class="btn btn-danger" @click="confirmArchive">🗃️ {{ t('expelled.actions.archive') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Модалка: Массовая архивация -->
    <Teleport to="body">
      <div class="modal-backdrop" :class="{ active: showArchiveModal && archiveMode === 'bulk' }" @click.self="showArchiveModal = false">
        <div class="modal" style="width: 500px;">
          <div class="popup-title">🗃️ {{ t('expelled.bulk.archive') }}</div>
          <div class="popup-sub">Для {{ store.selectedIds.length }} учеников</div>
          
          <label class="popup-label">{{ t('expelled.archiveReason') }}</label>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
            <label v-for="r in ARCHIVE_REASONS" :key="r" class="chip" style="justify-content: flex-start; padding: 10px 14px;" :class="{ active: archiveReason === r }">
              <input type="radio" v-model="archiveReason" :value="r" style="margin-right: 8px;" />
              {{ r }}
            </label>
          </div>
          
          <div class="popup-actions">
            <button class="btn btn-ghost" @click="showArchiveModal = false">{{ t('common.cancel') }}</button>
            <button class="btn btn-danger" @click="confirmArchive">🗃️ {{ t('expelled.actions.archiveAll') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useExpelledStudentsStore } from '../../stores/expelledStudents.store'
import { useAuthStore } from '../../stores/auth.store'
import type { ExpelledStudent } from '../../api/expelledStudentsApi'
import ExpelledHistoryPanel from './components/expelled/ExpelledHistoryPanel.vue'
import ExpelledTransferPanel from './components/expelled/ExpelledTransferPanel.vue'

const { t } = useI18n()
const store = useExpelledStudentsStore()
const authStore = useAuthStore()

// ── РОЛЬ ────────────────────────────────────────────────
const isManager = computed(() => authStore.user?.role === 'manager')

// ── КОНСТАНТЫ ───────────────────────────────────────────
const MANAGERS = ['Светлана', 'Александр', 'Мария', 'Артём']
const ARCHIVE_REASONS = [
  t('expelled.archive.notRelevant'),
  t('expelled.archive.noAnswer'),
  t('expelled.archive.moved'),
  t('expelled.archive.otherSchool'),
  t('expelled.archive.other'),
]

// ── ФИЛЬТРЫ ─────────────────────────────────────────────
const search = ref('')
const filterManager = ref('all')
const filterGroup = ref('all')
const filterContact = ref('all')
const sortBy = ref('con_asc')

// Уникальные менеджеры из списка
const managerOptions = computed(() =>
  [...new Set(store.list.map(s => s.manager).filter(Boolean))]
)

// Уникальные группы из списка
const groupOptions = computed(() =>
  [...new Set(store.list.map(s => s.group))]
)

// Вычисление "дней назад"
const daysAgo = (d: string | null): number =>
  d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 9999

// Основной computed с фильтрацией и сортировкой
const filtered = computed(() => {
  let list = store.list

  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(s => s.name.toLowerCase().includes(q))
  }

  if (filterManager.value !== 'all') {
    list = filterManager.value === '__none__'
      ? list.filter(s => !s.manager)
      : list.filter(s => s.manager === filterManager.value)
  }

  if (filterGroup.value !== 'all') {
    list = list.filter(s => s.group === filterGroup.value)
  }

  if (filterContact.value !== 'all') {
    if (filterContact.value === 'none')  list = list.filter(s => !s.lastContact)
    if (filterContact.value === 'hot')   list = list.filter(s => daysAgo(s.lastContact) > 7)
    if (filterContact.value === 'week')  list = list.filter(s => { const d = daysAgo(s.lastContact); return d >= 1 && d <= 7 })
    if (filterContact.value === 'today') list = list.filter(s => daysAgo(s.lastContact) === 0)
  }

  return [...list].sort((a, b) => {
    if (sortBy.value === 'con_asc')  return daysAgo(b.lastContact) - daysAgo(a.lastContact)
    if (sortBy.value === 'con_desc') return daysAgo(a.lastContact) - daysAgo(b.lastContact)
    if (sortBy.value === 'exp_asc')  return new Date(a.expelled).getTime() - new Date(b.expelled).getTime()
    if (sortBy.value === 'exp_desc') return new Date(b.expelled).getTime() - new Date(a.expelled).getTime()
    return 0
  })
})

// ── ВЫДЕЛЕНИЕ СТРОК ─────────────────────────────────────
const isHot = (s: ExpelledStudent) => !s.lastContact || daysAgo(s.lastContact) > 7

const allSelected = computed(() =>
  filtered.value.length > 0 && filtered.value.every(s => store.selectedIds.includes(s.id))
)

function toggleAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  if (checked) store.selectAll(filtered.value.map(s => s.id))
  else store.clearSelection()
}

// ── INLINE РЕДАКТИРОВАНИЕ ────────────────────────────────
function onFieldChange(id: number, field: 'lastContact' | 'manager' | 'comment', value: string) {
  store.updateStudent(id, { [field]: value || (field === 'lastContact' ? null : '') })
}

function markToday(id: number) {
  const today = new Date().toISOString().split('T')[0]
  store.updateStudent(id, { lastContact: today })
  actMenuId.value = null
}

// ── МЕНЮ ДЕЙСТВИЙ ───────────────────────────────────────
const actMenuId = ref<number | null>(null)

function toggleActMenu(id: number) {
  actMenuId.value = actMenuId.value === id ? null : id
}

// Закрытие меню по клику вне
function onDocClick(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest('.relative')) {
    actMenuId.value = null
  }
}
onMounted(() => {
  store.fetchList()
  document.addEventListener('click', onDocClick)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})

// ── БОКОВЫЕ ПАНЕЛИ ───────────────────────────────────────
const activeStudent = ref<ExpelledStudent | null>(null)
const showHistory = ref(false)
const showTransfer = ref(false)

function openHistory(s: ExpelledStudent) {
  activeStudent.value = s
  showHistory.value = true
  actMenuId.value = null
}

function openTransfer(s: ExpelledStudent) {
  activeStudent.value = s
  showTransfer.value = true
  actMenuId.value = null
}

async function onTransfer(groupId: number) {
  if (!activeStudent.value) return
  await store.transferStudent(activeStudent.value.id, groupId)
}

// ── АРХИВАЦИЯ ────────────────────────────────────────────
const showArchiveModal = ref(false)
const archiveMode = ref<'single' | 'bulk'>('single')
const archiveReason = ref('')
const archiveReasonOther = ref('')

function openArchive(s: ExpelledStudent) {
  activeStudent.value = s
  archiveMode.value = 'single'
  archiveReason.value = ''
  archiveReasonOther.value = ''
  showArchiveModal.value = true
  actMenuId.value = null
}

async function confirmArchive() {
  const reason = archiveReason.value === t('expelled.archive.other')
    ? (archiveReasonOther.value || t('expelled.archive.other'))
    : archiveReason.value
  if (!reason) return
  if (archiveMode.value === 'single' && activeStudent.value) {
    await store.archiveStudent(activeStudent.value.id, reason)
  } else {
    await store.bulkArchive(store.selectedIds, reason)
  }
  showArchiveModal.value = false
}

// ── BULK ASSIGN ──────────────────────────────────────────
const showBulkAssignModal = ref(false)
const bulkManager = ref('')

async function confirmBulkAssign() {
  if (!bulkManager.value) return
  await store.bulkAssign(store.selectedIds, bulkManager.value)
  showBulkAssignModal.value = false
  bulkManager.value = ''
}

// Bulk archive — открывает ту же архивную модалку в режиме bulk
function openBulkArchive() {
  archiveMode.value = 'bulk'
  archiveReason.value = ''
  archiveReasonOther.value = ''
  showArchiveModal.value = true
}

// ── УТИЛИТЫ ─────────────────────────────────────────────
function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d))
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const GRADIENTS = [
  'linear-gradient(135deg,#4f6ef7,#8b5cf6)',
  'linear-gradient(135deg,#06b6d4,#4f6ef7)',
  'linear-gradient(135deg,#10b981,#06b6d4)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#8b5cf6,#ef4444)',
]
function avatarGradient(name: string): string {
  let h = 0
  for (const c of name) h += c.charCodeAt(0)
  return GRADIENTS[h % GRADIENTS.length]
}

function contactTagClass(d: string | null): string {
  const days = daysAgo(d)
  if (!d)        return 'bg-slate-100 text-slate-400 dark:bg-slate-800'
  if (days === 0) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  if (days <= 3)  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  if (days <= 7)  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
}

function contactTagText(d: string | null): string {
  const days = daysAgo(d)
  if (!d)         return '📵 Нет контакта'
  if (days === 0) return '✓ Сегодня'
  if (days <= 3)  return `${days} дн. назад`
  if (days <= 7)  return `${days} дн. назад`
  return `${days} дн. назад ⚠️`
}
</script>
