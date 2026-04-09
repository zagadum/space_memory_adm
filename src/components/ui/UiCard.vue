<script setup lang="ts">
/**
 * UiCard - Premium container component
 * Provides a consistent card layout with optional glassmorphism effects.
 */
defineProps<{
  glass?: boolean;
}>();
</script>

<template>
  <div class="ui-card" :class="{ 'is-glass': glass }">
    <slot />
  </div>
</template>

<style scoped>
.ui-card {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 16px;
  box-shadow: var(--app-shadow-sm);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.ui-card.is-glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Base utilities for content inside cards */
.ui-card :deep(.card-header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--app-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ui-card :deep(.card-body) {
  padding: 20px;
}

.ui-card :deep(.card-footer) {
  padding: 14px 20px;
  background: rgba(var(--app-text-main-rgb), 0.02);
  border-top: 1px solid var(--app-border);
}
</style>
