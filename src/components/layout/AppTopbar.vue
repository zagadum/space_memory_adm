<template>
  <div class="topbar">
    <div class="topbar-title">
      {{ pageIcon }} {{ t(pageTitle) }} 
      <span v-if="pageSubTitle">· {{ t(pageSubTitle) }}</span>
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

const { t } = useI18n();
const route = useRoute();
const themeStore = useThemeStore();

const pageTitle = computed(() => (route.meta.title as string) || 'studentList.title');
const pageSubTitle = computed(() => (route.meta.subTitle as string) || '');
const pageIcon = computed(() => (route.meta.icon as string) || '🛰');
</script>
