<template>
  <BaseModal popupClass="popup-refund-ok">
    <div class="popup-title">{{ t("modals.refundOk.title") }}</div>
    <div class="popup-sub">
      ID: <span style="font-family:'Space Mono',monospace">{{ payload?.id }}</span><br/>
      {{ t("modals.refundOk.status") }} <b>{{ payload?.status }}</b><br/>
      Дата: <span style="font-family:'Space Mono',monospace">{{ payload?.createdAt }}</span>
    </div>

    <div class="popup-actions">
      <button class="btn btn-green" @click="close">ОК</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import BaseModal from "../BaseModal.vue";
import { useModalStore } from "../../stores/modal.store";
const modal = useModalStore();
const payload = computed(() => modal.payload);
function close(){ modal.close(); }
</script>
