<template>
  <span class="ui-badge" :class="[`ui-badge--${variant}`, `ui-badge--${size}`]">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "success" | "danger" | "warning" | "info" | "default";
    size?: "sm" | "md";
  }>(),
  { variant: "default", size: "sm" }
);
</script>

<style scoped>
.ui-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
  font-weight: 700;
  white-space: nowrap;
  line-height: 1;
  letter-spacing: 0.01em;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: opacity 0.15s;
}

/* ── sizes ── */
.ui-badge--sm {
  padding: 2px 8px;
  font-size: 10.5px;
}
.ui-badge--md {
  padding: 4px 10px;
  font-size: 12px;
}

/* ── variants ── */
.ui-badge--success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--green, #10b981);
  border: 1px solid rgba(16, 185, 129, 0.22);
}
.ui-badge--danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--red, #ef4444);
  border: 1px solid rgba(239, 68, 68, 0.22);
}
.ui-badge--warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--amber, #f59e0b);
  border: 1px solid rgba(245, 158, 11, 0.22);
}
.ui-badge--info {
  background: rgba(79, 110, 247, 0.1);
  color: var(--blue, #4f6ef7);
  border: 1px solid rgba(79, 110, 247, 0.2);
}
.ui-badge--default {
  background: rgba(255, 255, 255, 0.04);
  color: var(--dim, #8892b0);
  border: 1px solid rgba(100, 120, 255, 0.13);
}
</style>
