<template>
  <BaseModal popupClass="popup-pause">
    <div class="popup-title">{{ t("modals.pause.title") }}</div>
    <div class="popup-sub">{{ t("modals.pause.subtitle") }}</div>

    <div class="popup-2col">
      <div>
        <div class="popup-label">{{ t("modals.pause.from") }}</div>
        <input class="popup-input" type="date" v-model="from" />
      </div>
      <div>
        <div class="popup-label">{{ t("modals.pause.to") }}</div>
        <input class="popup-input" type="date" v-model="to" />
      </div>
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">{{ t("common.cancel") }}</button>
      <button class="btn btn-amber" :disabled="saving" @click="save">{{ t("common.save") }}</button>
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
const from = ref("");
const to = ref("");
const saving = ref(false);

function close() { modal.close(); }

async function save() {
  if (!programId) return close();
  saving.value = true;
  try {
    await paymentsApi.setPause({ programId, from: from.value, to: to.value });
    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>
