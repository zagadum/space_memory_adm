<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="toast-item"
        :class="toast.type"
      >
        <div class="toast-icon">{{ getIcon(toast.type) }}</div>
        <div class="toast-content">{{ toast.message }}</div>
        <button class="toast-close" @click="removeToast(toast.id)">✕</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '../../stores/notification.store';
import { storeToRefs } from 'pinia';

const store = useNotificationStore();
const { toasts } = storeToRefs(store);
const { removeToast } = store;

function getIcon(type: string) {
  switch (type) {
    case 'success': return '✅';
    case 'error':   return '❌';
    case 'warning': return '⚠️';
    case 'info':    return 'ℹ️';
    default:        return '🔔';
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 9999;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  min-width: 300px;
  max-width: 450px;
  background: var(--card);
  border: 1px solid var(--b);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.toast-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.toast-item.success::before { background: var(--green); }
.toast-item.error::before   { background: var(--red); }
.toast-item.warning::before { background: var(--amber); }
.toast-item.info::before    { background: var(--blue); }

.toast-icon {
  font-size: 18px;
}

.toast-content {
  flex: 1;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--white);
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: var(--dim);
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  transition: color 0.2s;
}

.toast-close:hover {
  color: var(--white);
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}

.toast-move {
  transition: transform 0.4s;
}
</style>
