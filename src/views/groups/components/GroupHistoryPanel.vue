<template>
  <div>
    <div class="sp-overlay active" @click="$emit('close')"></div>
    <div class="gp-panel open" style="width: 480px;">

      <!-- Header -->
      <div class="gp-header">
        <div class="gp-header-top">
          <div>
            <div class="gp-title">{{ $t('activity.groupHistory') }}</div>
            <div class="gp-subtitle">
              <span class="gp-group-name">{{ groupName }}</span>
            </div>
          </div>
          <div class="gp-close" @click="$emit('close')">✕</div>
        </div>

        <!-- Filter chips -->
        <div class="ghp-chips">
          <button
            v-for="chip in chips"
            :key="chip.value"
            class="ghp-chip"
            :class="{ active: activeChip === chip.value }"
            @click="activeChip = chip.value"
          >
            {{ chip.icon }} {{ chip.label }}
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="sp-body">
        <div v-if="store.isLoadingGroup" class="ghp-loading">
          <div class="ghp-skel" v-for="n in 5" :key="n"></div>
        </div>

        <div v-else-if="!filteredHistory.length" class="ghp-empty">
          <span style="font-size: 32px; opacity: 0.3">📋</span>
          <span>{{ $t('activity.historyEmpty') }}</span>
        </div>

        <div v-else class="ghp-timeline">
          <div
            v-for="(item, idx) in filteredHistory"
            :key="item.id"
            class="ghp-item"
          >
            <!-- Timeline -->
            <div class="ghp-tl">
              <div class="ghp-dot" :style="{ background: getActivityMeta(item.action_type).color }">
                {{ getActivityMeta(item.action_type).icon }}
              </div>
              <div v-if="idx < filteredHistory.length - 1" class="ghp-line"></div>
            </div>

            <!-- Content -->
            <div class="ghp-content">
              <div class="ghp-top">
                <span class="ghp-desc">{{ item.description }}</span>
                <span class="ghp-status" :class="`ghp-status--${item.status}`"></span>
              </div>
              <div class="ghp-meta">
                <span class="ghp-time" :title="formatDateTime(item.created_at)">
                  📅 {{ formatDateTime(item.created_at) }}
                </span>
                <span class="ghp-actor">
                  👤 {{ item.actor_name }}
                </span>
              </div>
              <!-- Extra payload details -->
              <div v-if="item.payload && Object.keys(item.payload).length" class="ghp-payload">
                <span
                  v-for="(val, key) in item.payload"
                  :key="key"
                  class="ghp-tag"
                >{{ payloadLabel(String(key)) }}: {{ val }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="ghp-footer">
        <span class="ghp-total">
          {{ $t('activity.totalRecords', { n: filteredHistory.length }) }}
        </span>
        <button class="ghp-view-all" @click="$router.push('/activity')">
          {{ $t('dashboard.activity.viewAll') }} →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useActivityStore, getActivityMeta, formatDateTime } from '../../../stores/activity.store'

const props = defineProps<{
  groupId: number | string
  groupName: string
}>()

defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useActivityStore()
const $router = useRouter()

const activeChip = ref('all')

const chips = [
  { value: 'all',      icon: '📋', label: t('activity.chipAll') },
  { value: 'student',  icon: '👤', label: t('activity.chipStudents') },
  { value: 'payment',  icon: '💰', label: t('activity.chipPayments') },
  { value: 'group',    icon: '🎓', label: t('activity.chipGroup') },
]

const filteredHistory = computed(() => {
  if (activeChip.value === 'all') return store.groupHistory
  return store.groupHistory.filter(l => l.entity_type === activeChip.value || l.action_type.startsWith(activeChip.value))
})

function payloadLabel(key: string): string {
  const labels: Record<string, string> = {
    group_name: t('activity.payloadGroup'), 
    to_group: t('activity.payloadToGroup'), 
    from_group: t('activity.payloadFromGroup'),
    teacher_name: t('activity.payloadTeacher'), 
    reason: t('activity.payloadReason'), 
    amount: t('activity.payloadAmount'),
    students_count: t('activity.payloadStudentsCount'),
  }
  return labels[key] ?? key
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') document.dispatchEvent(new CustomEvent('close-group-history'))
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  store.fetchGroupHistory(props.groupId)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
/* PANEL & OVERLAY */
.sp-overlay {
  position: fixed;
  inset: 0;
  background: var(--glass-bg, rgba(0, 0, 0, 0.4));
  backdrop-filter: blur(4px);
  z-index: 450;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.sp-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.gp-panel {
  position: fixed;
  top: 0;
  right: -100%;
  bottom: 0;
  background: var(--app-bg, #fff);
  border-left: 1px solid var(--app-border);
  z-index: 500;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.2);
}

:global(.dark) .gp-panel {
  background: var(--app-surface, #1e1e2d);
}

.gp-panel.open {
  right: 0;
}

.gp-header {
  padding: 20px 20px 0;
  border-bottom: 1px solid var(--app-border);
}
.gp-header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.gp-title {
  font-size: 17px;
  font-weight: 800;
  color: var(--app-text-main);
}
.gp-subtitle { font-size: 12px; color: var(--app-text-dim); margin-top: 4px; }
.gp-group-name { font-weight: 700; color: var(--app-text-main); }
.gp-close {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  color: var(--app-text-dim);
  font-size: 14px;
  transition: background 0.2s;
}
.gp-close:hover { background: var(--app-surface); }

/* Chips */
.ghp-chips {
  display: flex;
  gap: 6px;
  padding-bottom: 14px;
  flex-wrap: wrap;
}
.ghp-chip {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: var(--app-surface);
  border: 1px solid var(--app-border-faint);
  color: var(--app-text-dim);
  cursor: pointer;
  transition: all 0.2s;
}
.ghp-chip:hover { border-color: var(--app-border); color: var(--app-text-main); }
.ghp-chip.active {
  background: var(--app-border-hi, rgba(79,110,247,0.15));
  border-color: #4f6ef7;
  color: #4f6ef7;
}

/* Body */
.sp-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* Loading */
.ghp-loading { display: flex; flex-direction: column; gap: 16px; }
.ghp-skel {
  height: 56px;
  border-radius: 8px;
  background: linear-gradient(90deg, var(--app-surface) 25%, var(--app-border) 50%, var(--app-surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Empty */
.ghp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 20px;
  color: var(--app-text-dim);
  font-size: 13px;
}

/* Timeline */
.ghp-timeline { display: flex; flex-direction: column; }
.ghp-item {
  display: flex;
  gap: 14px;
  padding-bottom: 18px;
}
.ghp-item:last-child { padding-bottom: 0; }

.ghp-tl {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 30px;
}
.ghp-dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  opacity: 0.85;
  flex-shrink: 0;
}
.ghp-line {
  width: 2px;
  flex: 1;
  background: var(--app-border);
  margin-top: 6px;
  min-height: 16px;
  border-radius: 1px;
}

.ghp-content {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
}
.ghp-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.ghp-desc {
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text-main);
  flex: 1;
  line-height: 1.4;
}
.ghp-status {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.ghp-status--success { background: #10b981; }
.ghp-status--info    { background: #4f6ef7; }
.ghp-status--warning { background: #f59e0b; }
.ghp-status--error   { background: #ef4444; }

.ghp-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 6px;
}
.ghp-time, .ghp-actor {
  font-size: 11px;
  color: var(--app-text-dim);
}

.ghp-payload {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.ghp-tag {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--app-surface);
  border: 1px solid var(--app-border-faint);
  color: var(--app-text-dim);
}

/* Footer */
.ghp-footer {
  padding: 14px 20px;
  border-top: 1px solid var(--app-border-faint);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ghp-total {
  font-size: 11px;
  color: var(--app-text-dim);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ghp-view-all {
  font-size: 12px;
  font-weight: 700;
  color: #4f6ef7;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s;
}
.ghp-view-all:hover { opacity: 0.7; }
</style>
