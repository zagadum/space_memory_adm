<script setup lang="ts">
/**
 * UiDropdown - Premium dropdown component using Teleport
 * This component solves the clipping issue in tables by rendering
 * the dropdown content in the document body.
 */
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';

const props = defineProps<{
  modelValue?: boolean;
  align?: 'left' | 'right';
  width?: string;
  zIndex?: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const isOpen = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref({
  top: '0px',
  left: '0px',
  minWidth: props.width || '180px',
  zIndex: props.zIndex || 9999,
});

// Sync with modelValue if provided
watch(() => props.modelValue, (val) => {
  if (val !== undefined && val !== isOpen.value) {
    isOpen.value = val;
  }
});

watch(isOpen, (val) => {
  emit('update:modelValue', val);
  if (val) {
    // Add a small delay to ensure triggerRef is available and layout is stable
    nextTick(() => {
      updatePosition();
      // Second update after a frame to catch any layout shifts
      requestAnimationFrame(updatePosition);
    });
  }
});

const toggle = (e: MouseEvent) => {
  e.stopPropagation();
  isOpen.value = !isOpen.value;
};

const close = () => {
  isOpen.value = false;
};

const updatePosition = () => {
  if (!triggerRef.value || !dropdownRef.value || !isOpen.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const dropdownHeight = dropdownRef.value.offsetHeight;
  const dropdownWidth = dropdownRef.value.offsetWidth;

  // Space available
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;

  // Initial positioning (relative to viewport)
  let top = triggerRect.bottom + 5;
  let left = props.align === 'right' 
    ? triggerRect.right - dropdownWidth 
    : triggerRect.left;

  // Vertical overflow check: if not enough space below, show above
  if (top + dropdownHeight > windowHeight - 10) {
    top = triggerRect.top - dropdownHeight - 5;
  }
  
  // Horizontal overflow check
  if (left < 10) {
    left = 10;
  } else if (left + dropdownWidth > windowWidth - 10) {
    left = windowWidth - dropdownWidth - 10;
  }

  dropdownStyle.value = {
    ...dropdownStyle.value,
    top: `${top}px`,
    left: `${left}px`,
  };
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (
    isOpen.value &&
    triggerRef.value &&
    !triggerRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    close();
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside, true);
  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition, true);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside, true);
  window.removeEventListener('resize', updatePosition);
  window.removeEventListener('scroll', updatePosition, true);
});

defineExpose({ close, open: () => isOpen.value = true });
</script>

<template>
  <div class="ui-dropdown-wrapper">
    <div ref="triggerRef" class="ui-dropdown-trigger" @click="toggle">
      <slot name="trigger" :is-open="isOpen" />
    </div>

    <Teleport to="body">
      <Transition name="dropdown-fade">
        <div 
          v-if="isOpen" 
          ref="dropdownRef" 
          class="ui-dropdown-content" 
          :style="dropdownStyle"
          @click.stop
        >
          <slot :close="close" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.ui-dropdown-wrapper {
  display: inline-block;
  position: relative;
}

.ui-dropdown-trigger {
  cursor: pointer;
  display: inline-flex;
}

.ui-dropdown-content {
  position: fixed; /* Using fixed since we use triggerRect (viewport relative) */
  background: var(--app-card);
  border: 1px solid var(--app-border-hi);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(12px);
  overflow: hidden;
}

/* Glass effect for dark mode */
:global(.dark) .ui-dropdown-content {
  background: rgba(12, 12, 36, 0.9);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1), 
              transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
