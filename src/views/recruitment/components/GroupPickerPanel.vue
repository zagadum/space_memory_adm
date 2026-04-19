<template>
  <Teleport to="body">
    <div class="gp-overlay" :class="{ active: modelValue }" @click="$emit('update:modelValue', false)" />
    <div class="gp-panel" :class="{ open: modelValue }">

      <div class="gpp-header">
        <div class="gpp-header-top">
          <div>
            <div class="gpp-title">👥 {{ t('newStudents.groupPicker.title') }}</div>
            <div class="gpp-sub">{{ studentName }}</div>
          </div>
          <div class="gpp-close" @click="$emit('update:modelValue', false)">✕</div>
        </div>
        <div class="gpp-search-wrap">
          <div class="gpp-search-box" :class="{ 'searching': searchPending }">
            <span class="search-icon">{{ searchPending ? '⏳' : '🔍' }}</span>
            <input
              v-model="searchQ"
              :placeholder="t('newStudents.groupPicker.searchPlaceholder')"
              @input="onSearchInput"
            />
            <button v-if="searchQ" class="search-clear" @click="clearSearch">✕</button>
          </div>
          <div class="gpp-age-filters">
            <div
              v-for="chip in ageChips" :key="chip.key"
              class="gpp-age-chip"
              :class="{ active: activeAge === chip.key, [`active-${chip.cls}`]: activeAge === chip.key }"
              @click="setAge(chip.key)"
            >{{ chip.label }}</div>
          </div>
        </div>
      </div>

      <div class="gpp-list">
        <div v-if="loading" class="gpp-empty">
          <div class="gpp-loader">
            <div class="gpp-spinner" />
          </div>
          {{ t('newStudents.groupPicker.loading') }}
        </div>
        <div v-else-if="!groups.length" class="gpp-empty">
          <div class="gpp-empty-icon">🔭</div>
          {{ t('newStudents.groupPicker.noResults') }}
        </div>
        <div
          v-for="g in groups" :key="g.id"
          class="gpp-item"
          @click="pick(g)"
        >
          <div class="gpp-item-left">
            <div class="gpp-color-dot" :style="{ background: dotColor(g.age) }" />
            <div class="gpp-item-info">
              <div class="gpp-item-name">{{ g.name }}</div>
              <div class="gpp-item-meta">{{ normalizeDayToKey(g.day) ? t('newGroups.weekdays.' + normalizeDayToKey(g.day)) : g.day }}<template v-if="g.time">, {{ g.time }}</template> · {{ g.teacher?.name ?? '—' }}</div>
            </div>
          </div>
          <div class="gpp-item-right">
            <span v-if="ageMap[g.age ?? '']" class="gpp-age-badge" :class="`gpp-${ageMap[g.age!].cls}`">
              {{ ageMap[g.age!].icon }} {{ ageMap[g.age!].label }}
            </span>
          </div>
        </div>
      </div>

      <div class="gpp-footer">
        <!-- Pagination -->
        <div v-if="lastPage > 1" class="gpp-pagination">
          <button class="gpp-page-btn" :disabled="currentPage <= 1 || loading" @click="goToPage(currentPage - 1)">‹</button>
          <span class="gpp-page-info">{{ currentPage }} / {{ lastPage }}</span>
          <button class="gpp-page-btn" :disabled="currentPage >= lastPage || loading" @click="goToPage(currentPage + 1)">›</button>
        </div>
        <button class="btn btn-primary" style="width:100%;justify-content:center" @click="$emit('create-group'); $emit('update:modelValue', false)">
          ✦ {{ t('newStudents.groupPicker.createGroup') }}
        </button>
      </div>

    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ageMap, CANONICAL_AGE_GROUPS, normalizeDayToKey } from '../../../utils/newGroupsUtils'

interface ApiGroup {
  id: number
  name: string
  teacher: { id: number; name: string } | null
  day: string
  time: string
  age: string | null
  status: string
}

const props = defineProps<{
  modelValue: boolean
  studentName?: string
  backend?: 'default' | 'indigo'
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  pick: [groupId: number, groupName: string, teacherId: number | null]
  'create-group': []
}>()

const { t } = useI18n()

const searchQ = ref('')
const activeAge = ref<'all' | 'junior' | 'middle' | 'senior' | 'adult'>('all')
const groups = ref<ApiGroup[]>([])
const loading = ref(false)
const searchPending = ref(false)
const hasLoaded = ref(false)
let loadedBackend: 'default' | 'indigo' = props.backend ?? 'default'

// Pagination
const currentPage = ref(1)
const lastPage = ref(1)
const perPage = 20

// Debounce timer
let searchTimer: ReturnType<typeof setTimeout> | null = null

const ageChips = [
  { key: 'all' as const,      cls: 'all',    label: 'Все' },
  ...CANONICAL_AGE_GROUPS.map(a => ({
    key: a.key as 'junior' | 'middle' | 'senior' | 'adult',
    cls: a.key,
    label: `${a.icon} ${a.label}`
  }))
]

function dotColor(age: string | null): string {
  const key = ageMap[age ?? '']?.icon
  if (key === '🟢') return 'var(--green)'
  if (key === '🟡') return 'var(--amber)'
  if (key === '🔴') return 'var(--red)'
  return 'var(--blue)'
}

async function loadGroups(page = 1) {
  if (loading.value) return
  loading.value = true
  searchPending.value = false
  try {
    const { getRecruitmentApi } = await import('../../../api/recruitmentApi')
    const api = getRecruitmentApi(props.backend ?? 'default')
    const ageName = activeAge.value !== 'all' ? activeAge.value : undefined
    const res = await api.getGroupsForPickerPaged(page, perPage, searchQ.value.trim() || undefined, ageName)
    groups.value = res.items
    currentPage.value = res.pagination.currentPage
    lastPage.value = res.pagination.lastPage
    hasLoaded.value = true
  } catch (e) {
    console.error('GroupPickerPanel: failed to load groups', e)
    groups.value = []
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  searchPending.value = true
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadGroups(1)
  }, 350)
}

function clearSearch() {
  searchQ.value = ''
  if (searchTimer) clearTimeout(searchTimer)
  currentPage.value = 1
  loadGroups(1)
}

function setAge(key: typeof activeAge.value) {
  if (activeAge.value === key) return
  activeAge.value = key
  currentPage.value = 1
  loadGroups(1)
}

function goToPage(page: number) {
  if (page < 1 || page > lastPage.value || page === currentPage.value) return
  loadGroups(page)
}

watch(() => props.backend, (backend) => {
  const nextBackend = backend ?? 'default'
  if (nextBackend === loadedBackend) return
  loadedBackend = nextBackend
  hasLoaded.value = false
  groups.value = []
  currentPage.value = 1
  lastPage.value = 1
  searchQ.value = ''
  activeAge.value = 'all'
})

watch(() => props.modelValue, (open) => {
  if (!open || hasLoaded.value) return
  nextTick(() => loadGroups(1))
})

function pick(g: ApiGroup) {
  emit('pick', g.id, g.name, g.teacher?.id ?? null)
  emit('update:modelValue', false)
}
</script>

<style scoped>
.gp-overlay {
  position: fixed; inset: 0; background: rgba(4,4,15,0.55);
  backdrop-filter: blur(4px); z-index: 450;
  opacity: 0; pointer-events: none; transition: opacity 0.3s;
}
.gp-overlay.active { opacity: 1; pointer-events: all; }

.gp-panel {
  position: fixed; top: 0; right: 0; bottom: 0; width: 440px; max-width: 100vw;
  background: var(--app-sidebar); border-left: 1px solid var(--app-border-hi);
  backdrop-filter: blur(30px); z-index: 500; display: flex; flex-direction: column;
  transform: translateX(100%); transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
}
.gp-panel.open { transform: translateX(0); box-shadow: -12px 0 40px rgba(0,0,0,0.5); }

.gpp-header {
  padding: 22px 22px 0; border-bottom: 1px solid var(--app-border); flex-shrink: 0;
  background: var(--app-surface);
}
.gpp-header-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.gpp-title { font-size: 17px; font-weight: 700; color: var(--app-text-main); }
.gpp-sub   { font-size: 12px; color: var(--app-text-dim); margin-top: 3px; }
.gpp-close {
  width: 30px; height: 30px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; cursor: pointer; background: rgba(255,255,255,0.06); border: 1px solid var(--app-border);
  color: var(--app-text-dim); font-size: 14px; transition: all 0.15s;
}
.gpp-close:hover { background: rgba(239,68,68,0.15); color: #ef4444; border-color: rgba(239,68,68,0.3); }

.gpp-search-wrap { padding: 14px 0 12px; display: flex; flex-direction: column; gap: 10px; }
.gpp-search-box {
  display: flex; align-items: center; gap: 8px; background: var(--app-card);
  border: 1px solid var(--app-border); border-radius: 9px; padding: 8px 13px; transition: all 0.2s;
}
.gpp-search-box:focus-within { border-color: var(--app-border-hi); box-shadow: 0 0 12px rgba(79,110,247,0.1); }
.gpp-search-box.searching { border-color: rgba(79,110,247,0.4); }
.search-icon { color: var(--app-text-dim); font-size: 14px; flex-shrink: 0; }
.gpp-search-box input { background: none; border: none; outline: none; color: var(--app-text-main); font-family: 'Outfit', sans-serif; font-size: 13.5px; flex: 1; min-width: 0; }
.gpp-search-box input::placeholder { color: var(--app-text-dim); }
.search-clear {
  background: none; border: none; cursor: pointer; color: var(--app-text-dim);
  font-size: 12px; padding: 0 2px; line-height: 1; transition: color 0.15s; flex-shrink: 0;
}
.search-clear:hover { color: #ef4444; }

.gpp-age-filters { display: flex; gap: 6px; flex-wrap: wrap; }
.gpp-age-chip {
  display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s;
  border: 1px solid var(--app-border); background: var(--app-card); color: var(--app-text-dim);
}
.gpp-age-chip:hover { border-color: var(--app-border-hi); color: var(--app-text-main); }
.gpp-age-chip.active-junior { background: rgba(16,185,129,0.18); border-color: rgba(16,185,129,0.5); color: #10b981; }
.gpp-age-chip.active-middle { background: rgba(245,158,11,0.18); border-color: rgba(245,158,11,0.5); color: #f59e0b; }
.gpp-age-chip.active-senior { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.5); color: #ef4444; }
.gpp-age-chip.active-adult  { background: rgba(139,92,246,0.18); border-color: rgba(139,92,246,0.5); color: #8b5cf6; }
.gpp-age-chip.active-all { background: rgba(79,110,247,0.12); border-color: rgba(79,110,247,0.4); color: var(--blue); }

.gpp-list { flex: 1; overflow-y: auto; padding: 10px 22px; }
.gpp-empty { text-align: center; padding: 40px 20px; color: var(--app-text-dim); font-size: 13px; }
.gpp-empty-icon { font-size: 30px; margin-bottom: 10px; }

.gpp-loader { display: flex; justify-content: center; margin-bottom: 12px; }
.gpp-spinner {
  width: 28px; height: 28px; border: 3px solid var(--app-border);
  border-top-color: #4f6ef7; border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.gpp-item {
  display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 10px;
  cursor: pointer; transition: all 0.15s; border: 1px solid transparent; margin-bottom: 4px;
}
.gpp-item:hover { background: rgba(79,110,247,0.08); border-color: rgba(79,110,247,0.15); }
.gpp-item-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.gpp-color-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.gpp-item-info { flex: 1; min-width: 0; }
.gpp-item-name { font-size: 13.5px; font-weight: 600; color: var(--app-text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gpp-item-meta { font-size: 11.5px; color: var(--app-text-dim); margin-top: 2px; }
.gpp-item-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.gpp-age-badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 20px; font-size: 10.5px; font-weight: 600; white-space: nowrap; border: 1px solid rgba(255,255,255,0.08); }
.gpp-age-junior { background: rgba(16,185,129,0.12); color: #10b981; border-color: rgba(16,185,129,0.3); }
.gpp-age-middle { background: rgba(245,158,11,0.12); color: #f59e0b; border-color: rgba(245,158,11,0.3); }
.gpp-age-senior { background: rgba(239,68,68,0.12); color: #ef4444; border-color: rgba(239,68,68,0.3); }
.gpp-age-adult  { background: rgba(139,92,246,0.12); color: #8b5cf6; border-color: rgba(139,92,246,0.3); }

.gpp-footer { padding: 14px 22px; border-top: 1px solid var(--app-border); flex-shrink: 0; background: var(--app-surface); display: flex; flex-direction: column; gap: 10px; }

.gpp-pagination { display: flex; align-items: center; justify-content: center; gap: 12px; }
.gpp-page-info { font-size: 12.5px; color: var(--app-text-dim); font-family: 'Space Mono', monospace; min-width: 50px; text-align: center; }
.gpp-page-btn {
  width: 30px; height: 30px; border-radius: 8px; background: var(--app-card);
  border: 1px solid var(--app-border); color: var(--app-text-main);
  cursor: pointer; font-size: 16px; line-height: 1; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.gpp-page-btn:hover:not(:disabled) { border-color: var(--app-border-hi); background: rgba(79,110,247,0.1); color: #4f6ef7; }
.gpp-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
