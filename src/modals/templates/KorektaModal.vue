<template>
  <BaseModal popupClass="popup-korekta">
    <div class="popup-title">{{ t("modals.korekta.title") }}</div>
    <div class="popup-sub">{{ modal.payload?.headerText || t("modals.korekta.subtitle") }}</div>

    <div class="popup-2col">
      <div>
        <div class="popup-label">{{ t("modals.korekta.amount") }}</div>
        <input class="popup-input" v-model.number="amount" type="number" min="0" />
      </div>
      <div>
        <div class="popup-label">{{ t("modals.korekta.reason") }}</div>
        <input class="popup-input" v-model="reason" :placeholder="t('modals.korekta.reasonPlaceholder')" />
      </div>
    </div>

    <div style="margin-top:10px">
      <div class="popup-label">{{ t("modals.korekta.date") }}</div>
      <input class="popup-input" type="date" v-model="corrDate" />
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">{{ t("common.cancel") }}</button>
      <button class="btn btn-amber" :disabled="saving" @click="save">{{ t("modals.korekta.create") }}</button>
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
const year = modal.payload?.year as string | undefined;
const monthIndex = (modal.payload?.monthIndex ?? 0) as number;

const amount = ref(0);
const reason = ref("");
const corrDate = ref(modal.payload?.corrDate || "2026-03-02");
const saving = ref(false);

function close(){ modal.close(); }

async function save(){
  if (!programId) return close();
  saving.value = true;
  try{
    await paymentsApi.submitCorrection({ programId, year: year || "", monthIndex, amount: amount.value, note: reason.value || undefined, corrDate: corrDate.value });
    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>
