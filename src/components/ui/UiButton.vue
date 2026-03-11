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
    variant?: "primary" | "ghost" | "amber" | "cyan" | "red" | "green" | "pink" | "archive" | "unlock";
    type?: "button" | "submit";
    disabled?: boolean;
  }>(),
  { variant: "ghost", type: "button", disabled: false }
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
  }[v];
});
</script>
