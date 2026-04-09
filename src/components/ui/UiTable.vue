<script setup lang="ts">
/**
 * UiTable - Premium table component
 * Features:
 * - Skeleton loading state
 * - Integrated pagination
 * - Flexible slots for header, rows and empty state
 */
import { computed } from 'vue';
import UiButton from './UiButton.vue';

const props = defineProps<{
  items: any[];
  loading?: boolean;
  total?: number;
  page?: number;
  perPage?: number;
}>();

const emit = defineEmits<{
  (e: 'page-change', page: number): void;
}>();

const lastPage = computed(() => {
  if (!props.total || !props.perPage) return 1;
  return Math.ceil(props.total / props.perPage);
});

const handlePrev = () => {
  if (props.page && props.page > 1) emit('page-change', props.page - 1);
};

const handleNext = () => {
  if (props.page && props.page < lastPage.value) emit('page-change', props.page + 1);
};
</script>

<template>
  <div class="ui-table-container">
    <div class="table-scroll">
      <table class="ui-table">
        <thead>
          <slot name="head" />
        </thead>
        
        <tbody v-if="loading && (!items || items.length === 0)">
          <tr v-for="i in 5" :key="i" class="skeleton-row">
            <td colspan="20">
              <div class="skeleton-line"></div>
            </td>
          </tr>
        </tbody>
        
        <tbody v-else-if="items && items.length > 0">
          <slot v-for="(item, index) in items" :key="index" name="row" :item="item" :index="index" />
        </tbody>
        
        <tbody v-else>
          <tr>
            <td colspan="20">
              <slot name="empty">
                <div class="empty-state">
                  <span class="empty-icon">📁</span>
                  <p>No data found</p>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Footer -->
    <div v-if="total && total > 0" class="table-footer">
      <div class="pagination-info">
        {{ (page! - 1) * perPage! + 1 }}-{{ Math.min(page! * perPage!, total) }}
        <span class="dim">/ {{ total }}</span>
      </div>
      
      <div class="pagination-actions">
        <UiButton 
          variant="ghost" 
          size="sm" 
          :disabled="page === 1 || loading"
          @click="handlePrev"
        >
          ←
        </UiButton>
        <span class="page-current">{{ page }} / {{ lastPage }}</span>
        <UiButton 
          variant="ghost" 
          size="sm" 
          :disabled="page === lastPage || loading"
          @click="handleNext"
        >
          →
        </UiButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ui-table-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.ui-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.ui-table :deep(th) {
  padding: 14px 20px;
  background: var(--app-card-hi);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--app-text-dim);
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--app-border);
}

.ui-table :deep(td) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--app-border);
  vertical-align: middle;
}

.ui-table :deep(tr:last-child td) {
  border-bottom: none;
}

/* Skeleton Styles */
.skeleton-row td {
  padding: 24px 20px;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, var(--app-card-hi) 25%, var(--app-border) 50%, var(--app-card-hi) 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s infinite linear;
  border-radius: 6px;
}

@keyframes skeleton-pulse {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

/* Empty State */
.empty-state {
  padding: 64px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--app-text-dim);
}

.empty-icon {
  font-size: 40px;
  opacity: 0.5;
}

/* Footer */
.table-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--app-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--app-card-hi);
}

.pagination-info {
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text-main);
}

.dim {
  color: var(--app-text-dim);
  font-weight: 400;
}

.pagination-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-current {
  font-size: 13px;
  font-weight: 700;
  color: var(--app-primary);
  min-width: 60px;
  text-align: center;
}
</style>
