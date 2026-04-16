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
          <div class="gpp-search-box">
            <span class="search-icon">🔍</span>
            <input v-model="searchQ" :placeholder="t('newStudents.groupPicker.searchPlaceholder')" />
          </div>
          <div class="gpp-age-filters">
            <div
              v-for="chip in ageChips" :key="chip.key"
              class="gpp-age-chip"
              :class="{ active: activeAge === chip.key, [`active-${chip.cls}`]: activeAge === chip.key }"
              @click="activeAge = chip.key"
            >{{ chip.label }}</div>
          </div>
        </div>
      </div>

      <div class="gpp-list">
        <div v-if="loading" class="gpp-empty">⏳ Загрузка...</div>
        <div v-else-if="!filteredGroups.length" class="gpp-empty">
          <div class="gpp-empty-icon">🔭</div>
          {{ t('newStudents.groupPicker.noResults') }}
        </div>
        <div
          v-for="g in filteredGroups" :key="g.id"
          class="gpp-item"
          @click="pick(g)"
        >
          <div class="gpp-item-left">
            <div class="gpp-color-dot" :style="{ background: ageMap[g.age ?? '']?.icon === '🟢' ? 'var(--green)' : (ageMap[g.age ?? '']?.icon === '🟡' ? 'var(--amber)' : (ageMap[g.age ?? '']?.icon === '🔴' ? 'var(--red)' : 'var(--blue)')), boxShadow: `0 0 6px rgba(0,0,0,0.2)` }" />
            <div class="gpp-item-info">
              <div class="gpp-item-name">{{ g.name }}</div>
              <div class="gpp-item-meta">{{ g.day }}<template v-if="g.time">, {{ g.time }}</template> · {{ g.teacher?.name ?? '—' }}</div>
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
        <button class="btn btn-primary" style="width:100%;justify-content:center" @click="$emit('create-group'); $emit('update:modelValue', false)">
          ✦ {{ t('newStudents.groupPicker.createGroup') }}
        </button>
      </div>

    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ageMap, CANONICAL_AGE_GROUPS } from '../../../utils/newGroupsUtils'

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
const hasLoaded = ref(false)
let loadedBackend: 'default' | 'indigo' = props.backend ?? 'default'

// Pagination
const currentPage = ref(1)
const lastPage = ref(1)
const perPage = ref(20)

const ageChips = [
  { key: 'all' as const,      cls: 'all',    label: 'Все' },
  ...CANONICAL_AGE_GROUPS.map(a => ({
    key: a.key as 'junior' | 'middle' | 'senior' | 'adult',
    cls: a.key,
    label: `${a.icon} ${a.label}`
  }))
]

async function loadGroups(page = 1) {
  if (loading.value) return
  loading.value = true
  try {
    const { getRecruitmentApi } = await import('../../../api/recruitmentApi')
    const api = getRecruitmentApi(props.backend ?? 'default')
    // use paged API to avoid loading huge lists in one go
    const res = await api.getGroupsForPickerPaged(page, perPage.value)
    groups.value = res.items
    currentPage.value = res.pagination.currentPage
    lastPage.value = res.pagination.lastPage
    hasLoaded.value = true
  } catch (e) {
    console.error('GroupPickerPanel: failed to load groups', e)
  } finally {
    loading.value = false
  }
}

watch(() => props.backend, (backend) => {
  const nextBackend = backend ?? 'default'
  if (nextBackend === loadedBackend) return
  loadedBackend = nextBackend
  hasLoaded.value = false
  groups.value = []
  currentPage.value = 1
  lastPage.value = 1
})

watch(() => props.modelValue, (open) => {
  if (!open || hasLoaded.value) return
  nextTick(() => loadGroups())
})

function goToPage(page: number) {
  if (page < 1 || page > lastPage.value || page === currentPage.value) return
  loadGroups(page)
}

const filteredGroups = computed(() => {
  const q = searchQ.value.toLowerCase().trim()
  return groups.value.filter(g => {
    if (activeAge.value !== 'all') {
      const normalizedAge = ageMap[g.age ?? '']?.key ?? g.age
      if (normalizedAge !== activeAge.value) return false
    }
    if (q) {
      const haystack = [g.name, g.teacher?.name ?? '', g.day].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
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
.dark .gp-overlay { background: rgba(4,4,15,0.55); }
:root:not(.dark) .gp-overlay { background: rgba(160,170,220,0.50); }
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
.search-icon { color: var(--app-text-dim); font-size: 14px; }
.gpp-search-box input { background: none; border: none; outline: none; color: var(--app-text-main); font-family: 'Outfit', sans-serif; font-size: 13.5px; flex: 1; }
.gpp-search-box input::placeholder { color: var(--app-text-dim); }

.gpp-age-filters { display: flex; gap: 6px; }
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

.gpp-slots { font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; }
.gpp-slots.full { color: #ef4444; }
.gpp-slots.ok   { color: #10b981; }
.gpp-slots.warn { color: #f59e0b; }

.gpp-footer { padding: 14px 22px; border-top: 1px solid var(--app-border); flex-shrink: 0; background: var(--app-surface); }
</style>
