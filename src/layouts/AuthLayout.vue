<template>
  <div class="demo">
    <div class="panel" style="width:520px">
      <div class="panel-head" style="padding:18px 22px 18px">
        <div class="s-name">{{ t("auth.title") }}</div>

      </div>
      <div class="panel-body">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>
