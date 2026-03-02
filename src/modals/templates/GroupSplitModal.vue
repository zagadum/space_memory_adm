<template>
  <BaseModal popupClass="popup-group-split">
    <div class="popup-title">{{ t("modals.groupSplit.title") }}</div>
    <div class="popup-sub">{{ t("modals.groupSplit.subtitle") }}</div>

    <div class="popup-2col">
      <div>
        <div class="popup-label">{{ t("modals.groupSplit.from") }}</div>
        <input class="popup-input" v-model="from" placeholder="A" />
      </div>
      <div>
        <div class="popup-label">{{ t("modals.groupSplit.to") }}</div>
        <input class="popup-input" v-model="to" placeholder="B" />
      </div>
    </div>

    <div>
      <div class="popup-label">{{ t("modals.groupSplit.date") }}</div>
      <input class="popup-input" v-model="date" :placeholder="t('modals.placeholders.ddmmyyyy')" />
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

const from = ref("A");
const to = ref("B");
const date = ref("");
const saving = ref(false);

function close(){ modal.close(); }

async function save(){
  if (!programId) return close();
  saving.value = true;
  try{
    await paymentsApi.split({ programId, fromGroup: from.value, toGroup: to.value, effectiveDate: date.value });
    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>
