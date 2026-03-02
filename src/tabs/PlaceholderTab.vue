<template>
  <div class="grid">
    <div class="card">
      <div class="card-h">
        <div class="h-title">{{ t(titleKey) }}</div>
        <div class="h-sub">Заглушка вкладки — структура готова, можно подключать реальные API.</div>
      </div>
      <div class="card-b">
        <div class="note">Тут будет контент. Пока — чистый SPA, как просили.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
defineProps<{ titleKey: string }>();
const { t } = useI18n();
</script>
