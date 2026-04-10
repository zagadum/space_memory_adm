<template>
  <div class="content">

    <!-- 4 карточки статистики -->
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-label">{{ t('expelled.stats.total') }}</div>
        <div class="stat-value">{{ store.stats?.total ?? 0 }}</div>
        <div class="stat-sub">{{ t('expelled.stats.totalSub') }}</div>
        <div class="stat-icon">📞</div>
      </div>

      <div class="stat-card red">
        <div class="stat-label">{{ t('expelled.stats.hot') }}</div>
        <div class="stat-value">{{ store.stats?.hot ?? 0 }}</div>
        <div class="stat-sub"><span class="danger">{{ t('expelled.stats.hotSub') }}</span></div>
        <div class="stat-icon">🔥</div>
      </div>

      <div class="stat-card amber">
        <div class="stat-label">{{ t('expelled.stats.none') }}</div>
        <div class="stat-value">{{ store.stats?.none ?? 0 }}</div>
        <div class="stat-sub"><span class="warn">{{ t('expelled.stats.noneSub') }}</span></div>
        <div class="stat-icon">📵</div>
      </div>

      <div class="stat-card green">
        <div class="stat-label">{{ t('expelled.stats.unpaid') }}</div>
        <div class="stat-value">{{ store.stats?.unpaid ?? 0 }}</div>
        <div class="stat-sub"><span class="ok">{{ t('expelled.stats.unpaidSub') }}</span></div>
        <div class="stat-icon">💳</div>
      </div>
    </div>

    <!-- INFO BLOCK -->
    <div class="info-block">
      <div class="info-block-header" :class="{ open: showInfo }" @click="showInfo = !showInfo">
        <span style="font-size:15px">📋</span>
        <span class="info-block-title">{{ t('expelled.info.title') }}</span>
        <span class="info-block-arrow">›</span>
      </div>
      <div class="info-block-body" :class="{ open: showInfo }">
        <div class="rules-row">
          <div class="rule-item">
            <div class="rule-num">1</div>
            <div class="rule-text" v-html="t('expelled.info.rule1')"></div>
          </div>
          <div class="rule-item">
            <div class="rule-num">2</div>
            <div class="rule-text" v-html="t('expelled.info.rule2')"></div>
          </div>
          <div class="rule-item">
            <div class="rule-num">3</div>
            <div class="rule-text" v-html="t('expelled.info.rule3')"></div>
          </div>
          <div class="rule-item">
            <div class="rule-num">4</div>
            <div class="rule-text" v-html="t('expelled.info.rule4')"></div>
          </div>
          <div class="rule-item">
            <div class="rule-num">5</div>
            <div class="rule-text" v-html="t('expelled.info.rule5')"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- BULK BAR -->
    <div class="bulk-bar" :class="{ visible: store.selectedIds.length > 0 }">
      <span class="bulk-count">{{ t('expelled.bulk.selected', { n: store.selectedIds.length }) }}</span>
      <div class="bulk-sep"></div>
      <button class="btn btn-ghost btn-sm" @click="showBulkAssignModal = true">👤 {{ t('expelled.bulk.assign') }}</button>
      <button class="btn btn-danger btn-sm" @click="openBulkArchive">🗃️ {{ t('expelled.bulk.archive') }}</button>
      <button class="btn btn-ghost btn-sm" style="margin-left:auto" @click="store.clearSelection()">✕ {{ t('expelled.bulk.deselect') }}</button>
    </div>

    <!-- Тулбар с фильтрами -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <div class="section-title">
          {{ t('expelled.tableToolbar.title') }}
          <span class="section-count">{{ filtered.length }}</span>
        </div>
      </div>
      <div class="toolbar-right">
        <!-- Фильтр: Ответственный -->
        <div class="dropdown-filter">
          <select v-model="filterManager" class="dropdown-filter-btn" style="appearance: none; padding-right: 24px;">
            <option value="all">{{ t('expelled.filter.allManagers') }}</option>
            <option value="__none__">{{ t('expelled.filter.noManager') }}</option>
            <option v-for="m in managerOptions" :key="m" :value="m">{{ m }}</option>
          </select>
          <span class="dropdown-icon">▾</span>
        </div>

        <!-- Фильтр: Группа -->
        <div class="dropdown-filter">
          <select v-model="filterGroup" class="dropdown-filter-btn" style="appearance: none; padding-right: 24px;">
            <option value="all">{{ t('expelled.filter.allGroups') }}</option>
            <option v-for="g in groupOptions" :key="g" :value="g">{{ g }}</option>
          </select>
          <span class="dropdown-icon">▾</span>
        </div>

        <!-- Фильтр: Последний контакт -->
        <div class="dropdown-filter">
          <select v-model="filterContact" class="dropdown-filter-btn" style="appearance: none; padding-right: 24px;">
            <option value="all">{{ t('expelled.filter.contactAny') }}</option>
            <option value="none">{{ t('expelled.filter.contactNone') }}</option>
            <option value="hot">{{ t('expelled.filter.contactHot') }}</option>
            <option value="week">{{ t('expelled.filter.contactWeek') }}</option>
            <option value="today">{{ t('expelled.filter.contactToday') }}</option>
          </select>
          <span class="dropdown-icon">▾</span>
        </div>

        <!-- Сортировка -->
        <select v-model="sortBy" class="sort-sel">
          <option value="con_asc">{{ t('expelled.sort.conAsc') }}</option>
          <option value="con_desc">{{ t('expelled.sort.conDesc') }}</option>
          <option value="exp_asc">{{ t('expelled.sort.expAsc') }}</option>
          <option value="exp_desc">{{ t('expelled.sort.expDesc') }}</option>
        </select>
      </div>
    </div>

    <!-- Таблица -->
    <div class="table-wrap">
      <div v-if="store.isLoading" class="loading-state">
        <span class="section-title" style="color: var(--app-text-dim);">{{ t('expelled.loading') }}</span>
      </div>

      <div v-else-if="store.error" class="error-state">
        <span class="section-title" style="color: #ef4444;">{{ store.error }}</span>
      </div>

      <div v-else-if="!filtered.length" class="empty-state">
        <div class="empty-icon">📤</div>
        <div class="empty-title">{{ t('expelled.empty.title') }}</div>
        <div class="empty-sub">{{ t('expelled.empty.sub') }}</div>
      </div>

      <table v-else>
        <thead>
          <tr>
            <th style="width:38px;text-align:center">
              <input type="checkbox" :checked="allSelected" @change="toggleAll" />
            </th>
            <th>{{ t('expelled.table.name') }}</th>
            <th>{{ t('expelled.table.group') }}</th>
            <th>{{ t('expelled.table.type') }}</th>
            <th style="text-align: center;">{{ t('expelled.table.paid') }}</th>
            <th>{{ t('expelled.table.expelled') }}</th>
            <th>{{ t('expelled.table.lastContact') }}</th>
            <th>{{ t('expelled.table.manager') }}</th>
            <th>{{ t('expelled.table.comment') }}</th>
            <th style="width:52px;text-align:center">···</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filtered" :key="s.id" :class="{ 'hot-row': isHot(s) }">
            <td style="text-align:center">
              <input type="checkbox"
                :checked="store.selectedIds.includes(s.id)"
                @change="store.toggleSelect(s.id)" />
            </td>

            <td>
              <div class="name-cell">
                <div class="name-avatar" :style="{ background: avatarGradient(s.name) }">
                  {{ initials(s.name) }}
                </div>
                <div>
                  <div class="st-name">{{ s.name }}</div>
                  <div class="st-meta">{{ s.phone }}</div>
                </div>
              </div>
            </td>

            <td>
              <div class="group-cell">
                <span class="g-dot" style="background: #4f6ef7;"></span>
                <span>{{ s.group }}</span>
              </div>
            </td>

            <td>
              <span class="type-badge" :class="s.type === 'individual' ? 't-ind' : 't-grp'">
                {{ s.type === 'individual' ? t('expelled.table.typeIndividual') : t('expelled.table.typeGroup') }}
              </span>
            </td>

            <td style="text-align: center; font-size: 16px;">{{ s.paid ? '✅' : '❌' }}</td>

            <td><span class="date-mono">{{ formatDate(s.expelled) }}</span></td>

            <td>
              <div class="contact-cell">
                <input type="date"
                  :value="s.lastContact ?? ''"
                  class="ed-date"
                  @change="onFieldChange(s.id, 'lastContact', ($event.target as HTMLInputElement).value)" />
                <span class="contact-tag" :class="contactTagStyle(s.lastContact)">
                  {{ contactTagText(s.lastContact) }}
                </span>
              </div>
            </td>

            <td>
              <select
                :value="s.manager"
                class="mgr-sel"
                @change="onFieldChange(s.id, 'manager', ($event.target as HTMLSelectElement).value)">
                <option value="">{{ t('common.none') }}</option>
                <option v-for="m in MANAGERS" :key="m" :value="m">{{ m }}</option>
              </select>
            </td>

            <td>
              <input type="text"
                :value="s.comment"
                :placeholder="t('common.add')"
                class="ed-comment"
                @change="onFieldChange(s.id, 'comment', ($event.target as HTMLInputElement).value)" />
            </td>

            <td>
              <div class="actions-wrap">
                <UiDropdown align="right">
                  <template #trigger>
                    <div class="act-btn">⋯</div>
                  </template>
                  <template #default="{ close }">
                    <div v-if="isManager" class="act-item success" @click="openTransfer(s); close()">⭐ {{ t('expelled.actions.transferAny') }}</div>
                    <div class="act-item" @click="openTransfer(s); close()">🔄 {{ t('expelled.actions.transfer') }}</div>
                    <div class="act-item" @click="markToday(s.id); close()">📞 {{ t('expelled.actions.callToday') }}</div>
                    <div class="act-item" @click="openHistory(s); close()">📋 {{ t('expelled.actions.history') }}</div>
                    <div class="act-item danger" @click="openArchive(s); close()">🗃️ {{ t('expelled.actions.archive') }}</div>
                  </template>
                </UiDropdown>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="tbl-footer" v-if="store.pagination && store.pagination.lastPage > 1">
        <div class="pagination-info">
          {{ t('common.pagination.showing', { from: (store.pagination.currentPage - 1) * store.pagination.perPage + 1, to: Math.min(store.pagination.currentPage * store.pagination.perPage, store.pagination.total), total: store.pagination.total }) }}
        </div>
        <div class="pagination-btns">
          <button class="page-btn nav" :disabled="store.pagination.currentPage <= 1 || store.isLoading" @click="store.fetchList(store.pagination.currentPage - 1)">‹</button>
          <template v-for="page in store.pagination.lastPage" :key="page">
            <button 
              v-if="Math.abs(page - store.pagination.currentPage) < 3 || page === 1 || page === store.pagination.lastPage"
              class="page-btn" 
              :class="{ active: store.pagination.currentPage === page }"
              @click="store.fetchList(page)"
            >
              {{ page }}
            </button>
            <span v-else-if="page === 2 || page === store.pagination.lastPage - 1" class="page-sep">...</span>
          </template>
          <button class="page-btn nav" :disabled="store.pagination.currentPage >= store.pagination.lastPage || store.isLoading" @click="store.fetchList(store.pagination.currentPage + 1)">›</button>
        </div>
      </div>
    </div>

    <!-- Компоненты-панели -->
    <ExpelledHistoryPanel v-model="showHistory" :student="activeStudent" />
    <ExpelledTransferPanel v-model="showTransfer" :student="activeStudent" @transfer="onTransfer" />

    <!-- Модалка: назначить менеджера -->
    <Teleport to="body">
      <div class="modal-bd" :class="{ active: showBulkAssignModal }" @click.self="showBulkAssignModal = false">
        <div class="modal" style="width: 400px;">
          <div class="modal-x" @click="showBulkAssignModal = false">✕</div>
          <div class="modal-title">👤 {{ t('expelled.bulk.assign') }}</div>
          <div class="modal-sub">{{ t('expelled.bulk.forStudents', { count: store.selectedIds.length }) }}</div>
          
          <div class="m-field">
            <div class="m-label">{{ t('expelled.table.manager') }}</div>
            <select v-model="bulkManager" class="m-input">
              <option value="">{{ t('common.select') }}</option>
              <option v-for="m in MANAGERS" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          
          <div class="m-actions">
            <button class="btn btn-ghost" @click="showBulkAssignModal = false">{{ t('common.cancel') }}</button>
            <button class="btn btn-primary" @click="confirmBulkAssign">{{ t('expelled.actions.apply') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Модалка: Архивация одного -->
    <Teleport to="body">
      <div class="modal-bd" :class="{ active: showArchiveModal }" @click.self="showArchiveModal = false">
        <div class="modal" style="width: 500px;">
          <div class="modal-x" @click="showArchiveModal = false">✕</div>
          <div class="modal-title">🗃️ {{ t('expelled.archive.title') }}</div>
          <div class="modal-sub" v-if="archiveMode === 'single'">{{ t('expelled.archive.sub') }}</div>
          <div class="modal-sub" v-else>{{ t('expelled.bulk.forStudents', { count: store.selectedIds.length }) }}</div>
          
          <div class="m-field">
            <div class="m-label">{{ t('expelled.archive.reason') }}</div>
            <div class="reason-list">
              <label v-for="r in ARCHIVE_REASONS" :key="r.id" class="reason-opt" :class="{ sel: archiveReason === r.id }">
                <input type="radio" v-model="archiveReason" :value="r.id" />
                {{ r.label }}
              </label>
            </div>
          </div>
          
          <div v-if="archiveReason === 'other'" class="m-field">
            <div class="m-label">{{ t('expelled.archive.specify') }}</div>
            <input type="text" v-model="archiveReasonOther" :placeholder="t('common.add')" class="m-input" />
          </div>
          
          <div class="m-actions">
            <button class="btn btn-ghost" @click="showArchiveModal = false">{{ t('common.cancel') }}</button>
            <button class="btn" style="background:linear-gradient(135deg,#ef4444,#b91c1c);color:white;flex:1;justify-content:center" @click="confirmArchive">
              🗃️ {{ archiveMode === 'single' ? t('expelled.actions.archive') : t('expelled.actions.archiveAll') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useExpelledStudentsStore } from '../../stores/expelledStudents.store'
import { useAuthStore } from '../../stores/auth.store'
import type { ExpelledStudent } from '../../api/expelledStudentsApi'
import type { RecruitmentBackend } from '../../api/http'
import { useGlobalSearchStore } from '../../stores/globalSearch.store'
import { UiDropdown } from '../../components/ui'
import ExpelledHistoryPanel from './components/expelled/ExpelledHistoryPanel.vue'
import ExpelledTransferPanel from './components/expelled/ExpelledTransferPanel.vue'

const { t } = useI18n()
const route = useRoute()
const store = useExpelledStudentsStore()
const authStore = useAuthStore()
const searchStore = useGlobalSearchStore()
const recruitmentBackend = computed<RecruitmentBackend>(() => route.meta.recruitmentBackend === 'indigo' ? 'indigo' : 'default')

// ── РОЛЬ ────────────────────────────────────────────────
const isManager = computed(() => authStore.user?.role === 'manager')

// ── КОНСТАНТЫ ───────────────────────────────────────────
const MANAGERS = ['Светлана', 'Александр', 'Мария', 'Артём']
const ARCHIVE_REASONS = computed(() => [
  { id: 'notRelevant', label: t('expelled.archive.notRelevant') },
  { id: 'noAnswer', label: t('expelled.archive.noAnswer') },
  { id: 'moved', label: t('expelled.archive.moved') },
  { id: 'otherSchool', label: t('expelled.archive.otherSchool') },
  { id: 'other', label: t('expelled.archive.other') },
])

// ── ФИЛЬТРЫ ─────────────────────────────────────────────
const showInfo = ref(false)
const filterManager = computed({
  get: () => store.filters.manager,
  set: (v) => { store.filters.manager = v; store.applyFilters() }
})
const filterGroup = computed({
  get: () => store.filters.group,
  set: (v) => { store.filters.group = v; store.applyFilters() }
})
const filterContact = computed({
  get: () => store.filters.contact,
  set: (v) => { store.filters.contact = v; store.applyFilters() }
})
const sortBy = ref('con_asc')

const safeList = computed<ExpelledStudent[]>(() => Array.isArray(store.list) ? store.list : [])

// Уникальные менеджеры из списка
const managerOptions = computed(() =>
  [...new Set(safeList.value.map(s => s.manager).filter(Boolean))]
)

// Уникальные группы из списка
const groupOptions = computed(() =>
  [...new Set(safeList.value.map(s => s.group))]
)

// Вычисление "дней назад"
const daysAgo = (d: string | null): number =>
  d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 9999

// Дебаунс поиск через global search
let searchDebounce: ReturnType<typeof setTimeout> | null = null
watch(() => searchStore.query, (val) => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(async () => {
    store.filters.search = val.trim()
    await store.applyFilters()
  }, 400)
})

// Основной computed с фильтрацией и сортировкой
const filtered = computed(() => {
  let list = safeList.value
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
  store.updateStudent(id, { [field]: value || (field === 'lastContact' ? null : '') }, recruitmentBackend.value)
}

function markToday(id: number) {
  const today = new Date().toISOString().split('T')[0]
  store.updateStudent(id, { lastContact: today }, recruitmentBackend.value)
}

// ── МЕНЮ ДЕЙСТВИЙ ───────────────────────────────────────

// Закрытие меню по клику вне
function onDocClick(e: MouseEvent) {
  // Moved to UiDropdown
}
onMounted(() => {
  document.addEventListener('click', onDocClick)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})

// ── БОКОВЫЕ ПАНЕЛИ ───────────────────────────────────────
const activeStudent = ref<ExpelledStudent | null>(null)
const showHistory = ref(false)
const showTransfer = ref(false)

watch(recruitmentBackend, () => {
  activeStudent.value = null
  showHistory.value = false
  showTransfer.value = false
  store.clearSelection()
  store.fetchList(1, undefined, recruitmentBackend.value)
}, { immediate: true })


function openHistory(s: ExpelledStudent) {
  activeStudent.value = s
  showHistory.value = true
  actMenuId.value = null
}

function openTransfer(s: ExpelledStudent) {
  activeStudent.value = s
  showTransfer.value = true
}

async function onTransfer(groupId: number) {
  if (!activeStudent.value) return
  await store.transferStudent(activeStudent.value.id, groupId, recruitmentBackend.value)
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
}

async function confirmArchive() {
  const reasonId = archiveReason.value
  const otherText = archiveReasonOther.value
  
  let finalReasonLabel = ''
  if (reasonId === 'other') {
    finalReasonLabel = otherText || t('expelled.archive.other')
  } else {
    const found = ARCHIVE_REASONS.value.find(r => r.id === reasonId)
    finalReasonLabel = found ? found.label : reasonId
  }

  if (!reasonId) return

  if (archiveMode.value === 'single' && activeStudent.value) {
    await store.archiveStudent(activeStudent.value.id, finalReasonLabel, recruitmentBackend.value)
  } else {
    await store.bulkArchive(store.selectedIds, finalReasonLabel, recruitmentBackend.value)
  }
  showArchiveModal.value = false
}

// ── BULK ASSIGN ──────────────────────────────────────────
const showBulkAssignModal = ref(false)
const bulkManager = ref('')

async function confirmBulkAssign() {
  if (!bulkManager.value) return
  await store.bulkAssign(store.selectedIds, bulkManager.value, recruitmentBackend.value)
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

function contactTagStyle(d: string | null): string {
  const days = daysAgo(d)
  if (!d)        return 'ct-none'
  if (days === 0) return 'ct-ok'
  if (days <= 7)  return 'ct-warn'
  return 'ct-hot'
}

function contactTagText(d: string | null): string {
  const days = daysAgo(d)
  if (!d)         return `📵 ${t('expelled.contact.none')}`
  if (days === 0) return `✓ ${t('expelled.contact.today')}`
  return t('expelled.contact.daysAgo', { days })
}
</script>

<style scoped>
:global(:root){
  --surface: var(--app-card);
  --border: var(--app-border);
  --text: var(--app-text-main);
  --dim: var(--app-text-dim);
  --hover: rgba(79,110,247,0.08);
  --input-bg: var(--app-surface);
  --clr-dim: var(--app-text-dim);
  --debt-red: #ef4444;
  --nebula-blue: #4f6ef7;
  --blue: #4f6ef7;
  --purple: #8b5cf6;
}

/* ═══ STATS ═══ */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px;position:relative;overflow:hidden;transition:all 0.3s;}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;border-radius:14px 14px 0 0;}
.stat-card.blue::before{background:linear-gradient(90deg,var(--blue),var(--purple));}
.stat-card.green::before{background:linear-gradient(90deg,#10b981,#06b6d4);}
.stat-card.amber::before{background:linear-gradient(90deg,#f59e0b,#f97316);}
.stat-card.red::before{background:linear-gradient(90deg,#ef4444,#f97316);}
.stat-card:hover{border-color:var(--blue);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.12);}
.stat-label{font-size:10.5px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--dim);margin-bottom:8px;}
.stat-value{font-size:26px;font-weight:700;font-family:'Space Mono',monospace;color:var(--text);line-height:1;margin-bottom:5px;}
.stat-sub{font-size:11px;color:var(--dim);}
.stat-sub .warn{color:#f59e0b;}.stat-sub .ok{color:#10b981;}.stat-sub .danger{color:#ef4444;}
.stat-icon{position:absolute;top:14px;right:14px;font-size:20px;opacity:0.35;}

/* ═══ INFO BLOCK ═══ */
.info-block{background:var(--surface);border:1px solid var(--border);border-radius:12px;margin-bottom:18px;overflow:hidden;}
.info-block-header{display:flex;align-items:center;gap:10px;padding:12px 16px;cursor:pointer;user-select:none;transition:background 0.15s;}
.info-block-header:hover{background:var(--hover);}
.info-block-title{font-size:13px;font-weight:700;flex:1;color:var(--text);}
.info-block-arrow{font-size:11px;color:var(--dim);transition:transform 0.25s;}
.info-block-header.open .info-block-arrow{transform:rotate(90deg);}
.info-block-body{overflow:hidden;max-height:0;transition:max-height 0.32s cubic-bezier(0.4,0,0.2,1);}
.info-block-body.open{max-height:400px;}
.rules-row{display:flex;gap:8px;padding:4px 16px 14px;flex-wrap:wrap;}
.rule-item{display:flex;gap:9px;padding:9px 12px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;align-items:flex-start;flex:1;min-width:220px;}
.rule-num{width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--purple));display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;font-family:'Space Mono',monospace;flex-shrink:0;color:white;}
.rule-text{font-size:11.5px;color:var(--dim);line-height:1.5;}
.rule-text strong{color:var(--text);font-weight:600;}

/* ═══ BULK BAR ═══ */
.bulk-bar{display:none;align-items:center;gap:8px;padding:9px 14px;background:rgba(79,110,247,0.08);border:1px solid rgba(79,110,247,0.3);border-radius:10px;margin-bottom:12px;flex-wrap:wrap;}
.bulk-bar.visible{display:flex;}
.bulk-count{font-size:13px;font-weight:700;color:var(--blue);}
.bulk-sep{width:1px;height:20px;background:var(--border);margin:0 2px;}

/* ═══ TOOLBAR ═══ */
.table-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:10px;flex-wrap:wrap;}
.toolbar-left{display:flex;align-items:center;gap:8px;}
.section-title{font-size:15px;font-weight:600;display:flex;align-items:center;gap:8px;color:var(--text);}
.section-count{font-size:11px;font-family:'Space Mono',monospace;background:rgba(79,110,247,0.15);color:var(--blue);border:1px solid rgba(79,110,247,0.3);padding:2px 8px;border-radius:8px;}
.toolbar-right{display:flex;gap:7px;flex-wrap:wrap;align-items:center;}
.search-box{display:flex;align-items:center;gap:7px;background:var(--input-bg);border:1px solid var(--border);border-radius:8px;padding:6px 10px;transition:all 0.2s;}
.search-box:focus-within{border-color:var(--blue);box-shadow:0 0 10px rgba(79,110,247,0.1);}
.search-box input{background:none;border:none;outline:none;color:var(--text);font-family:inherit;font-size:12.5px;width:155px;}
.dropdown-filter{position:relative;display:flex;align-items:center;}
.dropdown-filter-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.15s;border:1px solid var(--border);background:var(--input-bg);color:var(--dim);font-family:inherit;outline:none;}
.dropdown-filter-btn:hover{border-color:var(--blue);color:var(--text);}
.dropdown-icon{position:absolute;right:8px;font-size:10px;color:var(--dim);pointer-events:none;}
.sort-sel{background:var(--input-bg);border:1px solid var(--border);border-radius:8px;padding:6px 10px;color:var(--dim);font-family:inherit;font-size:12px;outline:none;cursor:pointer;transition:all 0.15s;}

/* ═══ TABLE ═══ */
.table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;overflow-x:auto;}
table{width:100%;border-collapse:collapse;min-width:1200px;}
thead tr{background:rgba(255,255,255,0.02);border-bottom:1px solid var(--border);}
th{padding:12px 11px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--dim);white-space:nowrap;}
tbody tr{border-bottom:1px solid var(--border);transition:background 0.13s;}
tbody tr:last-child{border-bottom:none;}
tbody tr:hover{background:var(--hover);}
tbody tr.hot-row{background:rgba(239,68,68,0.02);}
tbody tr.hot-row td:first-child{box-shadow:inset 3px 0 0 #ef4444;}
td{padding:10px 11px;font-size:12.5px;vertical-align:middle;white-space:nowrap;}

.name-cell{display:flex;align-items:center;gap:9px;}
.name-avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:700;flex-shrink:0;border:1px solid rgba(255,255,255,0.1);color:white;}
.st-name{font-weight:600;font-size:13px;color:var(--text);}
.st-meta{font-size:10px;color:var(--dim);margin-top:1px;}
.group-cell{display:flex;align-items:center;gap:7px;}
.g-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.type-badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10.5px;font-weight:600;}
.t-ind{background:rgba(79,110,247,0.12);color:var(--blue);border:1px solid rgba(79,110,247,0.3);}
.t-grp{background:rgba(139,92,246,0.12);color:var(--purple);border:1px solid rgba(139,92,246,0.3);}
.date-mono{font-family:'Space Mono',monospace;font-size:11.5px;}
.contact-cell{display:flex;flex-direction:column;gap:3px;}
.contact-tag{font-size:10px;font-weight:600;padding:1px 6px;border-radius:10px;display:inline-block;width:fit-content;}
.ct-hot{background:rgba(239,68,68,0.15);color:#ef4444;}
.ct-warn{background:rgba(245,158,11,0.15);color:#f59e0b;}
.ct-ok{background:rgba(16,185,129,0.12);color:#10b981;}
.ct-none{background:rgba(136,146,176,0.1);color:var(--dim);}

.ed-date{background:var(--input-bg);border:1px solid var(--border);border-radius:6px;padding:4px 7px;color:var(--text);font-family:'Space Mono',monospace;font-size:11.5px;outline:none;width:128px;}
.ed-comment{background:var(--input-bg);border:1px solid var(--border);border-radius:6px;padding:4px 7px;color:var(--text);font-family:inherit;font-size:12px;outline:none;width:135px;}
.mgr-sel{background:var(--input-bg);border:1px solid var(--border);border-radius:6px;padding:4px 7px;color:var(--text);font-family:inherit;font-size:12px;outline:none;cursor:pointer;max-width:115px;}

/* ═══ ACTIONS ═══ */
.actions-wrap{position:relative;display:flex;justify-content:center;}
.act-btn{width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid var(--border);color:var(--dim);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;font-size:16px;}
.act-btn:hover{background:var(--hover);border-color:var(--blue);color:var(--text);}

.act-item{display:flex;align-items:center;gap:9px;padding:9px 13px;font-size:12.5px;cursor:pointer;transition:background 0.15s;color:var(--dim);font-weight:500;}
.act-item:hover{background:var(--hover);color:var(--text);}
.act-item+.act-item{border-top:1px solid var(--border);}
.act-item.danger{color:#ef4444;}
.act-item.success{color:#10b981;}

/* ═══ MODALS ═══ */
.modal-bd{position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(8px);z-index:500;display:none;align-items:center;justify-content:center;}
.modal-bd.active{display:flex;}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:26px;position:relative;box-shadow:0 24px 80px rgba(0,0,0,0.4);}
.modal-x{position:absolute;top:14px;right:14px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;background:rgba(255,255,255,0.05);border:1px solid var(--border);color:var(--dim);font-size:13px;}
.modal-title{font-size:17px;font-weight:700;margin-bottom:3px;color:var(--text);}
.modal-sub{font-size:12px;color:var(--dim);margin-bottom:18px;}
.m-field{margin-bottom:13px;}
.m-label{font-size:10.5px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--dim);margin-bottom:6px;}
.m-input{width:100%;background:var(--input-bg);border:1px solid var(--border);border-radius:8px;padding:8px 11px;color:var(--text);font-family:inherit;font-size:13px;outline:none;}
.m-actions{display:flex;gap:10px;margin-top:18px;}
.reason-list{display:flex;flex-direction:column;gap:7px;}
.reason-opt{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:9px;border:1px solid var(--border);cursor:pointer;transition:all 0.15s;font-size:13px;color:var(--dim);}
.reason-opt:hover{border-color:var(--blue);color:var(--text);}
.reason-opt.sel{border-color:#ef4444;background:rgba(239,68,68,0.05);color:var(--text);}

.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:55px 20px;gap:12px;}
.empty-icon{font-size:42px;opacity:0.3;}
.empty-title{font-size:15px;font-weight:600;color:var(--dim);}
.empty-sub{font-size:12.5px;color:var(--dim);opacity:0.5;}

.tbl-footer{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-top:1px solid var(--border);}
.pagination-info{color:var(--dim);font-size:11.5px;}

.loading-state, .error-state {
  display: flex;
  justify-content: center;
  padding: 40px;
}
</style>
