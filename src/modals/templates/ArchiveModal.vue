<template>
  <BaseModal popupClass="popup-archive">
    <div class="popup-title">{{ t("modals.archive.title") }}</div>
    <div class="popup-sub">{{ t("modals.archive.subtitle") }}</div>

    <div>
      <div class="popup-label">{{ t("modals.archive.reason") }}</div>
      <select class="popup-input" v-model="reason">
        <option value="left">{{ t("modals.archive.reasons.left") }}</option>
        <option value="pause">{{ t("modals.archive.reasons.pause") }}</option>
        <option value="other">{{ t("modals.archive.reasons.other") }}</option>
      </select>
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">{{ t("common.cancel") }}</button>
      <button class="btn btn-archive" :disabled="saving" @click="confirm">{{ t("modals.archive.action") }}</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import BaseModal from "../BaseModal.vue";
import { useModalStore } from "../../stores/modal.store";
import { paymentsApi } from "../../api/paymentsApi";

const { t } = useI18n();
const modal = useModalStore();

const programId = modal.payload?.programId as string | undefined;
const reason = ref("left");
const saving = ref(false);

function close(){ modal.close(); }

async function confirm(){
  if (!programId) return close();
  saving.value = true;
  try{
    await paymentsApi.archive({ programId, reason: reason.value });
    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>
