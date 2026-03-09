<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  title: string;
  amount: number;
  icon: string;
  isOpen: boolean;
  type?: string;
}>();

const emit = defineEmits<{
  (e: 'toggle'): void;
}>();

const formatCurrency = (val: number) => {
  return val.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' zł';
};

const getAmountClass = () => {
    if (props.type === 'subscription' || props.type === 'olympiad' || props.type === 'replacement') return 'val-blue';
    if (props.type === 'meetings') return 'val-purple';
    if (props.type === 'individual') return 'val-pink';
    if (props.type === 'admin' || props.type === 'bonus') return 'val-green';
    if (props.type === 'trial') return 'val-cyan';
    return '';
};
</script>

<template>
  <div class="section">
    <div class="section-header" @click="emit('toggle')">
      <div class="section-title">
        <div class="section-icon">{{ icon }}</div>
        {{ title }}
      </div>
      <div class="section-amount">
        <span :class="getAmountClass()">{{ formatCurrency(amount) }}</span>
        <span class="section-chevron" :class="{ open: isOpen }">▼</span>
      </div>
    </div>
    
    <transition name="fade-slide">
      <div class="section-body" v-show="isOpen">
        <slot />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.section {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 20px;
  transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
}

.section-header {
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.02);
  user-select: none;
}

.section-header:hover { background: rgba(255, 255, 255, 0.04); }

.section-title {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 15px;
  font-weight: 700;
}

.section-icon {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.section-amount {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Space Mono', monospace;
  font-weight: 700;
}

.val-blue { color: #4f6ef7; }
.val-purple { color: #8b5cf6; }
.val-green { color: #22c55e; }
.val-pink { color: #ec4899; }
.val-cyan { color: #06b6d4; }

.section-chevron {
  font-size: 10px;
  color: #4b5563;
  transition: transform .3s;
}

.section-chevron.open { transform: rotate(180deg); }

.section-body { padding: 0 24px 24px; }

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease-out;
  max-height: 2000px;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
</style>
