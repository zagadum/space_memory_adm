<template>
  <div class="af-wrap">
    <div v-if="isLoading" class="af-loading">
      <div class="af-skeleton" v-for="n in skeletonCount" :key="n"></div>
    </div>

    <div v-else-if="!items.length" class="af-empty">
      <span class="af-empty-icon">📋</span>
      <span>{{ emptyText }}</span>
    </div>

    <div v-else class="af-list">
      <div
        v-for="(item, idx) in items"
        :key="item.id"
        class="af-item"
        :class="{ 'af-item--last': idx === items.length - 1 }"
      >
        <!-- Timeline line -->
        <div class="af-timeline">
          <div class="af-dot" :style="{ background: getActivityMeta(item.action_type).color }">
            <span class="af-dot-icon">{{ getActivityMeta(item.action_type).icon }}</span>
          </div>
          <div v-if="idx < items.length - 1" class="af-line"></div>
        </div>

        <!-- Content -->
        <div class="af-content">
          <div class="af-content-top">
            <span class="af-desc">{{ item.description }}</span>
            <span class="af-time" :title="formatDateTime(item.created_at)">
              {{ formatRelativeTime(item.created_at) }}
            </span>
          </div>
          <div class="af-meta">
            <span class="af-actor">
              <span class="af-actor-dot"></span>
              {{ item.actor_name }}
            </span>
            <span v-if="item.entity_name && showEntity" class="af-entity-tag">
              {{ entityIcon(item.entity_type) }} {{ item.entity_name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityLog, ActivityEntityType, ActivityActionType } from '../../stores/activity.store'
import { getActivityMeta, formatRelativeTime, formatDateTime } from '../../stores/activity.store'

withDefaults(defineProps<{
  items: ActivityLog[]
  isLoading?: boolean
  emptyText?: string
  skeletonCount?: number
  showEntity?: boolean
}>(), {
  isLoading: false,
  emptyText: 'Нет записей',
  skeletonCount: 4,
  showEntity: true,
})

function entityIcon(type: ActivityEntityType): string {
  const icons: Record<ActivityEntityType, string> = {
    student: '👤',
    group: '🎓',
    payment: '💰',
    lead: '📋',
    teacher: '👨‍🏫',
    settings: '⚙️',
  }
  return icons[type] ?? '📌'
}
</script>

<style scoped>
.af-wrap {
  width: 100%;
}

/* Loading skeletons */
.af-loading {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
}
.af-skeleton {
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(90deg, var(--app-surface) 25%, var(--app-border) 50%, var(--app-surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty state */
.af-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 20px;
  color: var(--app-text-dim);
  font-size: 13px;
}
.af-empty-icon { font-size: 32px; opacity: 0.4; }

/* Timeline list */
.af-list {
  display: flex;
  flex-direction: column;
}

.af-item {
  display: flex;
  gap: 14px;
  padding-bottom: 16px;
}
.af-item--last {
  padding-bottom: 0;
}

/* Timeline column */
.af-timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 32px;
}
.af-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.85;
  flex-shrink: 0;
  font-size: 14px;
}
.af-dot-icon {
  line-height: 1;
}
.af-line {
  width: 2px;
  flex: 1;
  background: var(--app-border);
  margin-top: 6px;
  min-height: 16px;
  border-radius: 1px;
}

/* Content */
.af-content {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
}
.af-content-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}
.af-desc {
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text-main);
  line-height: 1.4;
  flex: 1;
  min-width: 0;
}
.af-time {
  font-size: 11px;
  color: var(--app-text-dim);
  white-space: nowrap;
  flex-shrink: 0;
  cursor: default;
}
.af-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.af-actor {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--app-text-dim);
  font-weight: 500;
}
.af-actor-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--app-text-dim);
  opacity: 0.5;
}
.af-entity-tag {
  font-size: 11px;
  color: var(--app-text-dim);
  background: var(--app-surface);
  border: 1px solid var(--app-border-faint);
  border-radius: 4px;
  padding: 1px 6px;
}
</style>
