<template>
  <div class="access-denied-page">
    <div class="access-denied-card">
      <!-- Анимированная иконка -->
      <div class="icon-wrapper">
        <div class="icon-ring ring-1"></div>
        <div class="icon-ring ring-2"></div>
        <div class="icon-ring ring-3"></div>
        <div class="lock-icon">🔐</div>
      </div>

      <!-- Код ошибки -->
      <div class="error-code">403</div>

      <!-- Заголовок и описание -->
      <h1 class="error-title">{{ t('accessDenied.title') }}</h1>
      <p class="error-message">{{ t('accessDenied.message') }}</p>

      <!-- Роль пользователя -->
      <div v-if="currentRole" class="role-badge">
        <span class="role-icon">👤</span>
        <span>{{ t('accessDenied.yourRole') }}: <strong>{{ t(`roles.${currentRole}`) }}</strong></span>
      </div>

      <!-- Действия -->
      <div class="actions">
        <button class="btn-home" @click="goHome">
          <span>🏠</span>
          {{ t('accessDenied.btnHome') }}
        </button>
        <button class="btn-back" @click="goBack">
          <span>←</span>
          {{ t('accessDenied.btnBack') }}
        </button>
      </div>

      <!-- Подсказка -->
      <p class="hint">{{ t('accessDenied.hint') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth.store'
import { normalizeRole } from '../../config/roleMenuAccess.config'
import { getFirstAllowedFallbackPath } from '../../utils/menuAccess'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const currentRole = computed(() => normalizeRole(authStore.user?.role))

function goHome() {
  const path = getFirstAllowedFallbackPath()
  router.push(path)
}

function goBack() {
  const hist = window.history.length
  if (hist > 2) {
    router.go(-2) // go back past the 403 page itself
  } else {
    goHome()
  }
}
</script>

<style scoped>
.access-denied-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-bg);
  padding: 24px;
}

.access-denied-card {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 20px;
  padding: 52px 48px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.access-denied-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--blue), var(--purple), #ef4444);
}

/* ── Анимированные кольца ── */
.icon-wrapper {
  position: relative;
  width: 96px;
  height: 96px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid;
  animation: pulse-ring 3s ease-out infinite;
}

.ring-1 {
  width: 96px;
  height: 96px;
  border-color: rgba(239, 68, 68, 0.25);
  animation-delay: 0s;
}

.ring-2 {
  width: 72px;
  height: 72px;
  border-color: rgba(239, 68, 68, 0.35);
  animation-delay: 0.4s;
}

.ring-3 {
  width: 52px;
  height: 52px;
  border-color: rgba(239, 68, 68, 0.5);
  animation-delay: 0.8s;
}

.lock-icon {
  font-size: 28px;
  position: relative;
  z-index: 1;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.85); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.85); opacity: 0.5; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* ── Код ошибки ── */
.error-code {
  font-size: 72px;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #ef4444 0%, var(--purple) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Space Mono', monospace;
  letter-spacing: -2px;
}

/* ── Текст ── */
.error-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--app-text-main);
  margin: 0 0 12px;
}

.error-message {
  font-size: 14px;
  color: var(--app-text-dim);
  line-height: 1.6;
  margin: 0 0 24px;
}

/* ── Роль пользователя ── */
.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(79, 110, 247, 0.08);
  border: 1px solid rgba(79, 110, 247, 0.2);
  border-radius: 100px;
  font-size: 13px;
  color: var(--app-text-dim);
  margin-bottom: 32px;
}

.role-badge strong {
  color: var(--blue);
}

.role-icon {
  font-size: 14px;
}

/* ── Кнопки ── */
.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.btn-home,
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  font-family: inherit;
}

.btn-home {
  background: linear-gradient(135deg, var(--blue), var(--purple));
  color: #fff;
  box-shadow: 0 4px 16px rgba(79, 110, 247, 0.3);
}

.btn-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(79, 110, 247, 0.45);
}

.btn-back {
  background: var(--app-surface);
  color: var(--app-text-dim);
  border-color: var(--app-border);
}

.btn-back:hover {
  background: var(--status-info-bg);
  color: var(--app-text-main);
  border-color: var(--app-border-hi);
}

/* ── Подсказка ── */
.hint {
  font-size: 12px;
  color: var(--app-text-dim);
  opacity: 0.6;
  margin: 0;
}
</style>
