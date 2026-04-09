<template>
  <button 
    class="btn disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none" 
    :class="variantClass" 
    :type="type"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    variant?: "primary" | "ghost" | "amber" | "cyan" | "red" | "green" | "pink" | "archive" | "unlock" | "neutral" | "secondary" | "success" | "danger" | "info";
    type?: "button" | "submit";
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
  }>(),
  { variant: "ghost", type: "button", disabled: false, size: "md" }
);

const variantClass = computed(() => {
  const v = props.variant;
  return {
    primary: "btn-primary",
    ghost: "btn-ghost",
    amber: "btn-amber",
    cyan: "btn-cyan",
    red: "btn-red",
    green: "btn-green",
    pink: "btn-pink",
    archive: "btn-archive",
    unlock: "btn-unlock",
    neutral: "btn-neutral",
    secondary: "btn-secondary",
    success: "btn-success",
    danger: "btn-danger",
    info: "btn-info",
  }[v] + ` btn-${props.size}`;
});
</script>
