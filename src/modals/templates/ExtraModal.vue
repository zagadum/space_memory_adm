<template>
  <BaseModal popupClass="popup-extra">
    <div class="popup-title">{{ t("modals.extra.title") }}</div>
    <div class="popup-sub">{{ t("modals.extra.subtitle") }}</div>

    <div class="popup-2col">
      <div>
        <div class="popup-label">{{ t("modals.extra.date") }}</div>
        <input class="popup-input" v-model="date" :placeholder="t('modals.placeholders.ddmmyyyy')" />
      </div>
      <div>
        <div class="popup-label">{{ t("modals.extra.amount") }} (zł)</div>
        <input class="popup-input" v-model.number="amount" type="number" min="0" />
      </div>
    </div>

    <div>
      <div class="popup-label">{{ t("modals.extra.titleField") }}</div>
      <input class="popup-input" v-model="title" :placeholder="t('modals.extra.titlePlaceholder')" />
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">{{ t("common.cancel") }}</button>
      <button class="btn btn-cyan" :disabled="saving" @click="save">{{ t("common.add") }}</button>
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

const date = ref("");
const amount = ref(110);
const title = ref("");
const saving = ref(false);

function close(){ modal.close(); }

async function save(){
  if (!programId) return close();
  saving.value = true;
  try{
    await paymentsApi.addExtra({ programId, date: date.value, title: title.value || "Extra", amount: amount.value });
    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>
