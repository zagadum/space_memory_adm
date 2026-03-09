<template>
  <BaseModal popupClass="popup-resume">
    <div class="popup-title">▶️ {{ t("modals.resume.title") }}</div>
    <div class="popup-sub">{{ t("modals.resume.subtitle") }}</div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">{{ t("common.cancel") }}</button>
      <button class="btn btn-green" :disabled="saving" @click="confirm">{{ t("modals.resume.action") }}</button>
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
const saving = ref(false);

function close(){ modal.close(); }

async function confirm(){
  if (!programId) return close();
  saving.value = true;
  try{
    await paymentsApi.resume({ programId });
    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>
