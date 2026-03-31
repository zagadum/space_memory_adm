import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGlobalSearchStore = defineStore('globalSearch', () => {
  const query = ref('')
  const queryLower = computed(() => query.value.toLowerCase().trim())

  function clear() {
    query.value = ''
  }

  return { query, queryLower, clear }
})
