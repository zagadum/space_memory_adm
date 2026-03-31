<template>
  <div class="topbar">
    <div class="topbar-left-wrap">
      <button class="menu-toggle-btn" @click="appStore.toggleSidebar()">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <div class="topbar-title">
        {{ pageIcon }} {{ t(pageTitle) }} 
        <span v-if="pageSubTitle">· {{ t(pageSubTitle) }}</span>
      </div>
    </div>
    <div class="topbar-actions">
      <div v-if="route.meta.searchPlaceholder" class="search-box" :class="{ 'has-query': searchStore.query }">
        <span class="search-icon-left">🔍</span>
        <input
          type="text"
          v-model="searchStore.query"
          :placeholder="searchPlaceholder"
        />
        <button v-if="searchStore.query" class="search-clear-btn" @click="searchStore.clear()">✕</button>
      </div>
      <button class="theme-toggle-btn" @click="themeStore.toggleTheme">
        <span class="theme-toggle-icon" v-if="themeStore.isDark">🌙</span>
        <span class="theme-toggle-icon" v-else>🌞</span>
        <span>{{ themeStore.isDark ? t('common.themeDark') : t('common.themeLight') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useThemeStore } from '../../stores/theme.store';
import { useAppStore } from '../../stores/app.store';
import { useGlobalSearchStore } from '../../stores/globalSearch.store';

const { t } = useI18n();
const route = useRoute();
const themeStore = useThemeStore();
const appStore = useAppStore();
const searchStore = useGlobalSearchStore();

const pageTitle = computed(() => (route.meta.title as string) || 'studentList.title');
const pageSubTitle = computed(() => (route.meta.subTitle as string) || '');
const pageIcon = computed(() => (route.meta.icon as string) || '🛰');
const searchPlaceholder = computed(() => {
  const key = route.meta.searchPlaceholder as string;
  return key ? t(key) : t('common.searchHint');
});
</script>

<style scoped>
.topbar-left-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-toggle-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text-main);
  cursor: pointer;
  transition: all 0.2s;
}

.menu-toggle-btn:hover {
  background: var(--status-info-bg);
  border-color: var(--app-border-hi);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

@media (max-width: 1024px) {
  .menu-toggle-btn {
    display: flex;
  }

  .search-box {
    display: none;
  }

  .theme-toggle-btn span:last-child {
    display: none;
  }

  .theme-toggle-btn {
    padding: 6px;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    justify-content: center;
  }
}

/* ── Search box (global search) ── */
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  padding: 0 12px;
  height: 38px;
  width: 280px;
  transition: all 0.2s;
  position: relative;
}

.search-box:focus-within {
  border-color: var(--blue);
  background: var(--app-card);
  box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.1);
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 13.5px;
  color: var(--app-text-main);
  padding: 0;
  width: 100%;
}

.search-box input::placeholder {
  color: var(--app-text-dim);
  opacity: 0.7;
}

.search-icon-left {
  color: var(--app-text-dim);
  font-size: 14px;
  flex-shrink: 0;
  pointer-events: none;
}

.search-box.has-query {
  border-color: rgba(79, 110, 247, 0.4);
}

.search-clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(136, 146, 176, 0.15);
  color: var(--app-text-dim);
  font-size: 11px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}

.search-clear-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
</style>
