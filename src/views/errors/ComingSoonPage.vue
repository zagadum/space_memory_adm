<template>
  <div class="coming-soon-page">
    <div class="coming-soon-card">
      <div class="icon-wrapper">
        <span class="icon">🚧</span>
      </div>
      <h1 class="title">{{ t('comingSoon.title') }}</h1>
      <p class="subtitle">{{ t('comingSoon.subtitle') }}</p>
      <button class="back-btn" @click="goBack">
        ← {{ t('comingSoon.backButton') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

function goBack() {
  if (window.history.length > 2) {
    router.back()
  } else {
    router.push({ name: 'dashboard' })
  }
}
</script>

<style scoped>
.coming-soon-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 72px);
  padding: 24px;
}

.coming-soon-card {
  text-align: center;
  max-width: 440px;
  padding: 48px 36px;
  background: var(--bg-card, rgba(15, 15, 35, 0.6));
  border: 1px solid rgba(79, 110, 247, 0.12);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.icon-wrapper {
  margin-bottom: 20px;
}

.icon {
  font-size: 56px;
  display: inline-block;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary, #e2e8f0);
  margin: 0 0 10px;
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
