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
        <div v-if="!filteredGroups.length" class="gpp-empty">
          <div class="gpp-empty-icon">🔭</div>
          {{ t('newStudents.groupPicker.noResults') }}
        </div>
        <div
          v-for="g in filteredGroups" :key="g.name"
          class="gpp-item"
          @click="pick(g)"
        >
          <div class="gpp-item-left">
            <div class="gpp-color-dot" :style="{ background: g.color, boxShadow: `0 0 6px ${g.color}66` }" />
            <div class="gpp-item-info">
              <div class="gpp-item-name">{{ g.name }}</div>
              <div class="gpp-item-meta">{{ g.day }}, {{ g.time }} · {{ g.teacher }}</div>
            </div>
          </div>
          <div class="gpp-item-right">
            <span class="gpp-age-badge" :class="`gpp-age-${g.age === '5-7' ? 'j' : g.age === '8-10' ? 'm' : 's'}`">
              {{ g.age === '5-7' ? '🟢' : g.age === '8-10' ? '🟡' : '🔴' }} {{ g.age }}
            </span>
            <span class="gpp-slots" :class="freeSlots(g) === 0 ? 'full' : freeSlots(g) <= 2 ? 'warn' : 'ok'">
              {{ freeSlots(g) === 0 ? t('newStudents.groupPicker.noSlots') : `${freeSlots(g)}/${g.slots}` }}
            </span>
          </div>
        </div>
      </div>

      <div class="gpp-footer">
        <button class="btn btn-ghost" style="width:100%;justify-content:center" @click="$emit('update:modelValue', false)">
          ✦ {{ t('newStudents.groupPicker.createGroup') }}
        </button>
      </div>

    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ALL_GROUPS } from '../../../stores/newStudents.store'

const props = defineProps<{
  modelValue: boolean
  studentName?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  pick: [groupName: string, color: string]
}>()

const { t } = useI18n()

const searchQ = ref('')
const activeAge = ref<'all' | '5-7' | '8-10' | '11-14'>('all')

const ageChips = [
  { key: 'all' as const,    cls: 'j', label: 'Все' },
  { key: '5-7' as const,   cls: 'j', label: '🟢 5–7' },
  { key: '8-10' as const,  cls: 'm', label: '🟡 8–10' },
  { key: '11-14' as const, cls: 's', label: '🔴 11–14' },
]

const filteredGroups = computed(() => {
  const q = searchQ.value.toLowerCase().trim()
  return ALL_GROUPS.filter(g => {
    if (activeAge.value !== 'all' && g.age !== activeAge.value) return false
    if (q && !g.name.toLowerCase().includes(q) && !g.teacher.toLowerCase().includes(q) && !g.day.toLowerCase().includes(q)) return false
    return true
  })
})

function freeSlots(g: typeof ALL_GROUPS[0]) { return g.slots - g.taken }

function pick(g: typeof ALL_GROUPS[0]) {
  emit('pick', g.name, g.color)
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
.gpp-age-chip.active-j { background: rgba(16,185,129,0.18); border-color: rgba(16,185,129,0.5); color: #10b981; }
.gpp-age-chip.active-m { background: rgba(245,158,11,0.18); border-color: rgba(245,158,11,0.5); color: #f59e0b; }
.gpp-age-chip.active-s { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.5); color: #ef4444; }

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

.gpp-age-badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 20px; font-size: 10.5px; font-weight: 600; white-space: nowrap; }
.gpp-age-j { background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
.gpp-age-m { background: rgba(245,158,11,0.12); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
.gpp-age-s { background: rgba(239,68,68,0.12); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }

.gpp-slots { font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; }
.gpp-slots.full { color: #ef4444; }
.gpp-slots.ok   { color: #10b981; }
.gpp-slots.warn { color: #f59e0b; }

.gpp-footer { padding: 14px 22px; border-top: 1px solid var(--app-border); flex-shrink: 0; background: var(--app-surface); }
</style>
