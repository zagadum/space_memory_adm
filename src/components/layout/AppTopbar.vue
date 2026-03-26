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
      <div class="search-box">
        <span style="color:var(--dim);font-size:14px">🔍</span>
        <input type="text" :placeholder="t('common.searchHint')" />
      </div>
      <button class="btn btn-ghost">⬇ {{ t('common.export') }}</button>
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

const { t } = useI18n();
const route = useRoute();
const themeStore = useThemeStore();
const appStore = useAppStore();

const pageTitle = computed(() => (route.meta.title as string) || 'studentList.title');
const pageSubTitle = computed(() => (route.meta.subTitle as string) || '');
const pageIcon = computed(() => (route.meta.icon as string) || '🛰');
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

@media (max-width: 1024px) {
  .menu-toggle-btn {
    display: flex;
  }
  
  /* Hide search and export on mobile Topbar to save space, 
     they are usually duplicated or needed differently on mobile */
  .search-box, .btn-ghost {
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
</style>
