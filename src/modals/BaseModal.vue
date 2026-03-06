<template>
  <div class="popup-bd" :class="{ active: isOpen }" @mousedown.self="close">
    <div class="popup" :class="popupClass" role="dialog" aria-modal="true">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { useModalStore } from "../stores/modal.store";

const props = defineProps<{ popupClass?: string }>();
const modal = useModalStore();
const isOpen = computed(() => !!modal.openId);
const close = () => modal.close();

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") close();
}

onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => window.removeEventListener("keydown", onKey));
</script>
