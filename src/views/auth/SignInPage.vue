<template>
  <div class="login-wrapper">
    <div class="login-logo">
      <img src="/Logo_gls_spacem_indigo.webp" alt="GLS Logo" class="logo-img" />
    </div>

    <h1 class="login-title">{{ t("auth.title") }}</h1>
    <p class="login-subtitle">Witaj ponownie! Zaloguj się do swojego konta.</p>

    <form @submit.prevent="onSubmit" class="login-form">
      <UiInput
        v-model="email"
        :label="t('auth.email')"
        placeholder="admin@demo.local"
        autocomplete="username"
      />

      <UiInput
        v-model="password"
        type="password"
        :label="t('auth.password')"
        placeholder="••••••••"
        autocomplete="current-password"
      />

      <div v-if="auth.error" class="error-note">
        {{ auth.error }}
      </div>

      <UiButton
        variant="primary"
        type="submit"
        :disabled="auth.loading"
        class="login-submit"
      >
        {{ auth.loading ? "…" : t("auth.submit") }}
      </UiButton>
    </form>

    <div class="login-footer">
      <p class="platform-desc">{{ t("auth.description") }}</p>
      <div class="school-links-container">
        <span class="school-links-label">{{ t("auth.schools") }}</span>
        <div class="school-buttons">
          <a href="https://space-memory.pl" target="_blank" class="school-link-btn">space-memory.pl</a>
          <a href="https://indigomental.pl" target="_blank" class="school-link-btn">indigomental.pl</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../stores/auth.store";
import UiInput from "../../components/ui/UiInput.vue";
import UiButton from "../../components/ui/UiButton.vue";

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const email = ref("admin@demo.local");
const password = ref("demo");

async function onSubmit() {
  const ok = await auth.signIn(email.value, password.value);
  if (ok) router.push("/");
}
</script>

<style scoped>
.login-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  position: relative;
}

.login-logo {
  margin-bottom: 24px;
  animation: fadeInDown 0.6s ease-out;
}

.logo-img {
  height: 80px;
  width: auto;
  filter: drop-shadow(0 0 15px rgba(79, 110, 247, 0.2));
}

.login-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--white, #e8eeff);
  margin-bottom: 8px;
  text-align: center;
}

.login-subtitle {
  font-size: 14px;
  color: var(--dim, #8892b0);
  margin-bottom: 32px;
  text-align: center;
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}

.login-submit {
  width: 100%;
  height: 44px;
  margin-top: 8px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.error-note {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 13px;
  text-align: center;
  margin-bottom: 8px;
}

.login-footer {
  width: 100%;
  border-top: 1px solid rgba(100, 120, 255, 0.1);
  padding-top: 24px;
  text-align: center;
}

.platform-desc {
  font-size: 12px;
  line-height: 1.6;
  color: var(--dim, #8892b0);
  margin-bottom: 16px;
}

.school-links-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.school-links-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--dim, #8892b0);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.school-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.school-link-btn {
  font-size: 11px;
  font-weight: 600;
  color: var(--blue, #4f6ef7);
  text-decoration: none;
  padding: 6px 12px;
  background: rgba(79, 110, 247, 0.08);
  border: 1px solid rgba(79, 110, 247, 0.2);
  border-radius: 8px;
  transition: all 0.2s ease;
  letter-spacing: 0.02em;
}

.school-link-btn:hover {
  background: rgba(79, 110, 247, 0.15);
  border-color: rgba(79, 110, 247, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
