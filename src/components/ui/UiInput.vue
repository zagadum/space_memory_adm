<template>
  <div class="ui-input-wrap" :class="{ 'ui-input-wrap--error': !!error }">
    <label v-if="label" class="ui-input-label">{{ label }}</label>
    <div class="ui-input-container">
      <input
        class="ui-input"
        :type="inputType"
        :placeholder="placeholder"
        :value="modelValue"
        :readonly="readonly"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="type === 'password'"
        type="button"
        class="ui-input-toggle"
        @click="togglePassword"
        title="Toggle password visibility"
      >
        <span v-if="isPasswordVisible">👁️</span>
        <span v-else>👁️‍🗨️</span>
      </button>
    </div>
    <span v-if="error" class="ui-input-error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    label?: string;
    placeholder?: string;
    type?: string;
    error?: string;
    readonly?: boolean;
  }>(),
  { modelValue: "", placeholder: "", type: "text", error: "", readonly: false }
);

defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const isPasswordVisible = ref(false);

const inputType = computed(() => {
  if (props.type === "password") {
    return isPasswordVisible.value ? "text" : "password";
  }
  return props.type;
});

function togglePassword() {
  isPasswordVisible.value = !isPasswordVisible.value;
}
</script>

<style scoped>
.ui-input-wrap {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 12px;
}

.ui-input-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dim, #8892b0);
  margin-bottom: 5px;
  display: block;
}

.ui-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.ui-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(100, 120, 255, 0.15);
  border-radius: 8px;
  padding: 9px 12px;
  color: var(--white, #e8eeff);
  font-family: "Outfit", sans-serif;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.ui-input::placeholder {
  color: var(--dim, #8892b0);
  opacity: 0.5;
}

.ui-input:focus {
  border-color: var(--blue, #4f6ef7);
  box-shadow: 0 0 0 2px rgba(79, 110, 247, 0.12);
}

.ui-input[readonly] {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(100, 120, 255, 0.1);
  color: var(--dim, #8892b0);
  cursor: default;
}

.ui-input-toggle {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--dim, #8892b0);
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.ui-input-toggle:hover {
  opacity: 1;
}

/* ── error state ── */
.ui-input-wrap--error .ui-input {
  border-color: rgba(239, 68, 68, 0.5);
}

.ui-input-wrap--error .ui-input:focus {
  border-color: var(--red, #ef4444);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.12);
}

.ui-input-error {
  margin-top: 4px;
  font-size: 11px;
  color: var(--red, #ef4444);
  font-weight: 500;
}
</style>
