<template>
  <div class="auth-layout">
    <div class="auth-background">
      <div class="auth-blob blob-1"></div>
      <div class="auth-blob blob-2"></div>
      <div class="auth-blob blob-3"></div>
    </div>

    <div class="auth-top-actions">
      <button class="theme-toggle-btn" @click="themeStore.toggleTheme">
        <span class="theme-toggle-icon">{{ themeStore.isDark ? '🌙' : '🌞' }}</span>
        <span>{{ themeStore.isDark ? t('common.themeDark') : t('common.themeLight') }}</span>
      </button>

      <div class="lang-switcher">
        <select class="lang-select-premium" :value="locale" @change="onLocale(($event.target as HTMLSelectElement).value)">
          <option value="pl">🇵🇱 Polski</option>
          <option value="en">🇬🇧 English</option>
          <option value="uk">🇺🇦 Українська</option>
          <option value="ru">🏳️ Русский</option>
        </select>
      </div>
    </div>
    
    <div class="auth-container">
      <div class="auth-card">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useThemeStore } from "../stores/theme.store";
import { setLocale } from "../app/i18n";

const { t, locale } = useI18n();
const themeStore = useThemeStore();

function onLocale(l: string) {
  setLocale(l as any);
}

onMounted(() => {
  themeStore.initTheme();
});
</script>

<style scoped>
.auth-layout {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--app-bg, #05051a);
  overflow: hidden;
  font-family: 'Outfit', sans-serif;
  transition: background-color 0.3s ease;
}

.auth-background {
  position: absolute;
  inset: 0;
  z-index: 1;
  filter: blur(80px);
  opacity: 0.5;
}

.auth-blob {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: screen;
  animation: move 20s infinite alternate;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: rgba(79, 110, 247, 0.3);
  top: -100px;
  left: -100px;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: rgba(139, 92, 246, 0.2);
  bottom: -50px;
  right: -50px;
  animation-delay: -5s;
}

.blob-3 {
  width: 300px;
  height: 300px;
  background: rgba(6, 182, 212, 0.2);
  top: 50%;
  left: 50%;
  animation-delay: -10s;
}

.auth-top-actions {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 120, 255, 0.15);
  border-radius: 12px;
  color: var(--white, #e8eeff);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--blue, #4f6ef7);
}

.lang-select-premium {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 120, 255, 0.15);
  border-radius: 12px;
  color: var(--white, #e8eeff);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}

.lang-select-premium:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--blue, #4f6ef7);
}

.auth-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 440px;
  padding: 20px;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-card {
  background: var(--app-card, rgba(13, 13, 43, 0.8));
  backdrop-filter: blur(20px);
  border: 1px solid var(--app-border, rgba(100, 120, 255, 0.15));
  border-radius: 24px;
  padding: 40px;
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(100, 120, 255, 0.05);
  transition: all 0.3s ease;
}

@keyframes move {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(100px, 100px) scale(1.1); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.popup-label) {
  display: none;
}
</style>
