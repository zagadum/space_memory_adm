<template>
  <div class="not-found-page">
    <div class="not-found-card">
      <div class="icon-wrapper">
        <span class="icon">🔭</span>
      </div>
      <h1 class="title">404</h1>
      <p class="subtitle">{{ t('notFound.subtitle') }}</p>
      <button class="back-btn" @click="goHome">
        ← {{ t('notFound.homeButton') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

function goHome() {
  router.push({ name: 'dashboard' })
}
</script>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 72px);
  padding: 24px;
}

.not-found-card {
  text-align: center;
  max-width: 440px;
  padding: 48px 36px;
  background: var(--bg-card, rgba(15, 15, 35, 0.6));
  border: 1px solid rgba(239, 68, 68, 0.12);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.icon-wrapper {
  margin-bottom: 16px;
}

.icon {
  font-size: 56px;
  display: inline-block;
}

.title {
  font-size: 48px;
  font-weight: 800;
  color: var(--text-primary, #e2e8f0);
  margin: 0 0 8px;
  letter-spacing: -1px;
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary, #8892b0);
  margin: 0 0 28px;
  line-height: 1.5;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  background: rgba(79, 110, 247, 0.12);
  color: var(--blue, #4f6ef7);
  border: 1px solid rgba(79, 110, 247, 0.25);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(79, 110, 247, 0.22);
  border-color: rgba(79, 110, 247, 0.4);
  transform: translateY(-1px);
}
</style>
