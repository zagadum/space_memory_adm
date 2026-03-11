<template>
  <div class="sp-overlay" :class="{ active: modelValue }" @click="emit('update:modelValue', false)"></div>
  <div class="student-panel" :class="{ open: modelValue }" style="width: 400px;">
    
    <div class="panel-head">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <div>
          <div class="section-title">🔄 Перенести в группу</div>
          <div class="student-meta" style="margin-top: 4px;">{{ student?.name }}</div>
        </div>
        <button class="actions-btn" @click="emit('update:modelValue', false)">✕</button>
      </div>
    </div>

    <div class="sp-body">
      <div class="popup-label" style="margin-bottom: 16px;">Выберите активную группу</div>
      
      <div class="enrollment-list" style="gap: 12px;">
        <div v-for="g in MOCK_GROUPS" :key="g.id" 
          class="table-row"
          style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; cursor: pointer; transition: all 0.2s;"
          :style="selectedGroupId === g.id ? 'border-color: var(--blue); background: var(--status-info-bg);' : 'background: var(--card);'"
          @click="selectedGroupId = g.id">
          
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="group-dot" style="background: var(--blue);"></div>
            <div>
              <div style="font-weight: 600; color: var(--app-text-main); font-size: 13.5px;">{{ g.name }}</div>
              <div class="student-meta">{{ g.teacher }}</div>
            </div>
          </div>
          
          <div class="date-mono" :style="{ color: slotsClass(g.slots) }" style="font-size: 12px;">
            {{ slotsLabel(g.slots) }}
          </div>
        </div>
      </div>
    </div>

    <div style="padding: 20px 24px; border-top: 1px solid var(--border); background: rgba(13, 13, 43, 0.6);">
      <button class="btn" :class="selectedGroupId ? 'btn-primary' : ''" style="width: 100%; justify-content: center; padding: 12px;" :disabled="!selectedGroupId" @click="onConfirm">
        ✦ Перенести
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { ExpelledStudent } from '../../../../api/expelledStudentsApi'

const props = defineProps<{
  modelValue: boolean
  student: ExpelledStudent | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'transfer': [groupId: number]
}>()

interface MockGroup {
  id: number
  name: string
  teacher: string
  slots: number
}

const MOCK_GROUPS: MockGroup[] = [
  { id: 1, name: 'Вт 17 КЛе Младшая', teacher: 'КЛе', slots: 3 },
  { id: 2, name: 'Ср 15 ПИе Младшая', teacher: 'ПИе', slots: 1 },
  { id: 3, name: 'Пт 19 АНа Старшая', teacher: 'АНа', slots: 0 },
  { id: 4, name: 'Чт 18 МАр Средняя', teacher: 'МАр', slots: 4 },
  { id: 5, name: 'Пн 16 ДАн Онлайн',  teacher: 'ДАн', slots: 6 },
  { id: 6, name: 'Сб 11 КИр Индив.',  teacher: 'КИр', slots: 2 },
]

const selectedGroupId = ref<number | null>(null)

// Сбрасывать выбор при каждом открытии панели
watch(() => props.modelValue, (val) => {
  if (val) selectedGroupId.value = null
})

function slotsClass(slots: number): string {
  if (slots === 0) return 'var(--red)'
  if (slots <= 2)  return 'var(--amber)'
  return 'var(--green)'
}

function slotsLabel(slots: number): string {
  if (slots === 0) return 'Мест нет'
  return `${slots} мест`
}

function onConfirm() {
  if (!selectedGroupId.value) return
  emit('transfer', selectedGroupId.value)
  emit('update:modelValue', false)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('update:modelValue', false)
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>
