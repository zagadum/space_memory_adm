<template>
  <div class="sp-overlay" :class="{ active: modelValue }" @click="emit('update:modelValue', false)"></div>
  <div class="student-panel" :class="{ open: modelValue }" style="width: 460px;">
    
    <div class="panel-head">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <div>
          <div class="section-title">📋 {{ student?.name }}</div>
          <div class="student-meta" style="margin-top: 4px;">{{ student?.group }} · {{ student?.phone }}</div>
        </div>
        <button class="actions-btn" @click="emit('update:modelValue', false)">✕</button>
      </div>
    </div>

    <div class="sp-body">
      <div v-if="!student || !student.history.length" style="color: var(--dim); padding: 20px 0;">
        История пуста
      </div>
      <div v-else>
        <div v-for="(item, idx) in [...student.history].reverse()" :key="idx" style="display: flex; gap: 16px; margin-bottom: 20px;">
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div class="group-dot" :style="{ background: item.color, marginTop: '5px' }"></div>
            <div v-if="idx < student.history.length - 1" style="width: 2px; flex: 1; background: var(--border); margin-top: 6px; min-height: 20px;"></div>
          </div>
          <div style="padding-bottom: 4px;">
            <div style="font-weight: 600; color: var(--app-text-main); font-size: 14px;">{{ item.event }}</div>
            <div class="date-mono" style="font-size: 11px; color: var(--dim); margin-top: 2px;">{{ formatDate(item.date) }}</div>
            <div style="font-size: 13px; color: var(--dim); margin-top: 6px; line-height: 1.5;">{{ item.detail }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import type { ExpelledStudent } from '../../../../api/expelledStudentsApi'

const props = defineProps<{
  modelValue: boolean
  student: ExpelledStudent | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function formatDate(d: string): string {
  if (!d) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(d))
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('update:modelValue', false)
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>
