<template>
  <button class="btn" :class="variantClass" :type="type">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    variant?: "primary" | "ghost" | "amber" | "cyan" | "red" | "green" | "pink" | "archive" | "unlock";
    type?: "button" | "submit";
  }>(),
  { variant: "ghost", type: "button" }
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
