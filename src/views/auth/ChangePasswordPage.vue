<template>
  <div class="change-password-page">
    <div class="change-password-card">
      <!-- Заголовок -->
      <div class="card-header">
        <div class="key-icon">🔑</div>
        <h1 class="card-title">{{ t('changePassword.title') }}</h1>
        <p class="card-subtitle">{{ t('changePassword.subtitle') }}</p>
      </div>

      <!-- Форма -->
      <form class="cp-form" @submit.prevent="handleSubmit" novalidate>
        <!-- Новый пароль -->
        <div class="field-group">
          <label class="field-label">{{ t('changePassword.newPassword') }}</label>
          <div class="input-wrapper" :class="{ error: errors.newPassword }">
            <input
              id="new-password"
              v-model="form.newPassword"
              :type="showNew ? 'text' : 'password'"
              class="field-input"
              :placeholder="t('changePassword.newPassword')"
              autocomplete="new-password"
              @input="clearErrors"
            />
            <button type="button" class="toggle-eye" @click="showNew = !showNew">
              {{ showNew ? '👁' : '🙈' }}
            </button>
          </div>
          <span v-if="errors.newPassword" class="field-error">{{ errors.newPassword }}</span>
          <span class="field-hint">{{ t('changePassword.requirements') }}</span>
        </div>

        <!-- Подтверждение пароля -->
        <div class="field-group">
          <label class="field-label">{{ t('changePassword.confirmPassword') }}</label>
          <div class="input-wrapper" :class="{ error: errors.confirmPassword }">
            <input
              id="confirm-password"
              v-model="form.confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              class="field-input"
              :placeholder="t('changePassword.confirmPassword')"
              autocomplete="new-password"
              @input="clearErrors"
            />
            <button type="button" class="toggle-eye" @click="showConfirm = !showConfirm">
              {{ showConfirm ? '👁' : '🙈' }}
            </button>
          </div>
          <span v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</span>
        </div>

        <!-- Индикатор силы пароля -->
        <div class="strength-bar">
          <div class="strength-fill" :style="{ width: strengthPercent + '%' }" :class="strengthClass"></div>
        </div>
        <span class="strength-label" :class="strengthClass">{{ strengthLabel }}</span>

        <!-- Кнопка -->
        <button class="btn-submit" type="submit" :disabled="isLoading">
          <span v-if="isLoading">{{ t('changePassword.saving') }}</span>
          <span v-else>{{ t('changePassword.submit') }}</span>
        </button>

        <!-- Сообщение об ошибке API -->
        <div v-if="apiError" class="api-error">{{ apiError }}</div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth.store'
import { authApi } from '../../api/authApi'
import { useNotificationStore } from '../../stores/notification.store'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const form = ref({ newPassword: '', confirmPassword: '' })
const errors = ref({ newPassword: '', confirmPassword: '' })
const apiError = ref('')
const isLoading = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

// ── Индикатор силы пароля
const strengthPercent = computed(() => {
  const p = form.value.newPassword
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score += 25
  if (p.length >= 12) score += 25
  if (/[A-Z]/.test(p)) score += 25
  if (/[0-9]/.test(p)) score += 15
  if (/[^A-Za-z0-9]/.test(p)) score += 10
  return Math.min(score, 100)
})

const strengthClass = computed(() => {
  const s = strengthPercent.value
  if (s < 40) return 'weak'
  if (s < 70) return 'medium'
  return 'strong'
})

const strengthLabel = computed(() => {
  const s = strengthPercent.value
  if (!form.value.newPassword) return ''
  if (s < 40) return '🔴 Слабый'
  if (s < 70) return '🟡 Средний'
  return '🟢 Сильный'
})

function clearErrors() {
  errors.value = { newPassword: '', confirmPassword: '' }
  apiError.value = ''
}

function validate(): boolean {
  let valid = true
  if (form.value.newPassword.length < 8) {
    errors.value.newPassword = t('changePassword.errorMinLength')
    valid = false
  }
  if (form.value.newPassword !== form.value.confirmPassword) {
    errors.value.confirmPassword = t('changePassword.errorMismatch')
    valid = false
  }
  return valid
}

async function handleSubmit() {
  if (!validate()) return

  isLoading.value = true
  apiError.value = ''

  try {
    await authApi.changePassword({ newPassword: form.value.newPassword })

    // Снимаем флаг в store
    if (authStore.user) {
      authStore.updateProfile({ forcePasswordChange: false } as any)
    }

    notificationStore.addToast(t('changePassword.success'), 'success')
    router.push('/')
  } catch (e: any) {
    apiError.value = e?.response?.data?.message || 'Ошибка при смене пароля'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.change-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-bg);
  padding: 24px;
}

.change-password-card {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 20px;
  padding: 48px 44px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
}

.change-password-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--blue), var(--purple));
}

/* ── Шапка ── */
.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.key-icon {
  font-size: 40px;
  margin-bottom: 12px;
  animation: sway 2s ease-in-out infinite;
}

@keyframes sway {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.card-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--app-text-main);
  margin: 0 0 8px;
}

.card-subtitle {
  font-size: 13px;
  color: var(--app-text-dim);
  line-height: 1.5;
  margin: 0;
}

/* ── Форма ── */
.cp-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--app-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper.error .field-input {
  border-color: #ef4444;
}

.field-input {
  width: 100%;
  padding: 12px 44px 12px 14px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  color: var(--app-text-main);
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.field-input:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.12);
}

.toggle-eye {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  line-height: 1;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.toggle-eye:hover { opacity: 1; }

.field-error {
  font-size: 12px;
  color: #ef4444;
}

.field-hint {
  font-size: 11px;
  color: var(--app-text-dim);
  opacity: 0.7;
}

/* ── Индикатор силы ── */
.strength-bar {
  height: 4px;
  background: var(--app-border);
  border-radius: 2px;
  overflow: hidden;
  margin-top: -8px;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s, background-color 0.4s;
}

.strength-fill.weak { background: #ef4444; }
.strength-fill.medium { background: #f59e0b; }
.strength-fill.strong { background: #10b981; }

.strength-label {
  font-size: 11px;
  font-weight: 600;
  margin-top: -10px;
}

.strength-label.weak { color: #ef4444; }
.strength-label.medium { color: #f59e0b; }
.strength-label.strong { color: #10b981; }

/* ── Кнопка ── */
.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--blue), var(--purple));
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(79, 110, 247, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(79, 110, 247, 0.45);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── API ошибка ── */
.api-error {
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 8px;
  color: #ef4444;
  font-size: 13px;
  text-align: center;
}
</style>
