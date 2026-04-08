<template>
  <div class="date-range-picker" :class="{ active: hasValue }">
    <div class="picker-inputs">
      <div class="date-field">
        <label v-if="label">{{ label }}</label>
        <input 
          type="date" 
          v-model="internalStart" 
          @change="emitChange"
          aria-label="Start date"
        />
      </div>
      <div class="date-separator">—</div>
      <div class="date-field">
        <input 
          type="date" 
          v-model="internalEnd" 
          @change="emitChange"
          aria-label="End date"
        />
      </div>
    </div>
    <button 
      v-if="hasValue" 
      class="clear-btn" 
      @click="clear"
      title="Clear dates"
    >
      ✕
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

const props = defineProps<{
  startDate?: string;
  endDate?: string;
  label?: string;
}>();

const emit = defineEmits<{
  'update:startDate': [value: string | undefined];
  'update:endDate': [value: string | undefined];
  'change': [{ start?: string, end?: string }];
}>();

const internalStart = ref(props.startDate || '');
const internalEnd = ref(props.endDate || '');

const hasValue = computed(() => internalStart.value || internalEnd.value);

watch(() => props.startDate, (val) => { internalStart.value = val || ''; });
watch(() => props.endDate, (val) => { internalEnd.value = val || ''; });

function emitChange() {
  emit('update:startDate', internalStart.value || undefined);
  emit('update:endDate', internalEnd.value || undefined);
  emit('change', { 
    start: internalStart.value || undefined, 
    end: internalEnd.value || undefined 
  });
}

function clear() {
  internalStart.value = '';
  internalEnd.value = '';
  emitChange();
}
</script>

<style scoped>
.date-range-picker {
  display: flex;
  align-items: center;
  background: var(--app-card);
  border: 1px solid var(--app-border);
  padding: 4px 12px;
  border-radius: 10px;
  transition: all 0.2s;
  position: relative;
}

.date-range-picker:hover, .date-range-picker.active {
  border-color: var(--blue);
}

.picker-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-field {
  display: flex;
  flex-direction: column;
}

.date-field label {
  font-size: 10px;
  color: var(--app-text-dim);
  text-transform: uppercase;
}

input[type="date"] {
  background: transparent;
  border: none;
  color: var(--app-text-main);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  padding: 4px 0;
}

/* Hide native icon if needed or style it */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: var(--calendar-icon-filter, invert(0.5));
}

.date-separator {
  color: var(--app-text-dim);
  font-size: 14px;
}

.clear-btn {
  background: var(--app-surface);
  color: var(--app-text-dim);
  border: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--red);
  color: white;
}
</style>
