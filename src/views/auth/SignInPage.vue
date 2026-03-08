<template>
  <form @submit.prevent="onSubmit" style="display:flex; flex-direction:column; gap:12px">
    <div>
      <div class="popup-label">{{ t("auth.email") }}</div>
      <input class="popup-input" v-model="email" autocomplete="username" placeholder="admin@demo.local" />
    </div>
    <div>
      <div class="popup-label">{{ t("auth.password") }}</div>
      <input class="popup-input" v-model="password" type="password" autocomplete="current-password" placeholder="anything" />
    </div>

    <div v-if="auth.error" class="note" style="border-color:rgba(239,68,68,.35); background:rgba(239,68,68,.08)">
      {{ auth.error }}
    </div>

    <button class="btn btn-primary" :disabled="auth.loading" type="submit">
      {{ auth.loading ? "…" : t("auth.submit") }}
    </button>

    <div class="note">
      Вход с паролями space memory
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../stores/auth.store";

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const email = ref("admin@demo.local");
const password = ref("demo");

async function onSubmit() {
  const ok = await auth.signIn(email.value, password.value);
  if (ok) router.push("/payments");
}
</script>
