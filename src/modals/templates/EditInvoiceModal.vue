<template>
  <BaseModal popupClass="popup-edit-invoice">
    <div class="popup-title">🧾 {{ t("modals.invoice.title") }}</div>
    <div class="popup-sub">{{ payload?.headerText || t("modals.invoice.subtitle") }}</div>

    <div class="popup-2col">
      <div>
        <div class="popup-label">{{ t("modals.invoice.fvnum") }}</div>
        <input class="popup-input" v-model="fv" :placeholder="t('modals.invoice.fvPlaceholder')" />
      </div>
      <div>
        <div class="popup-label">{{ t("modals.invoice.ksef") }}</div>
        <input class="popup-input" v-model="ksef" :placeholder="t('modals.invoice.ksefPlaceholder')" />
      </div>
    </div>

    <div class="popup-2col" style="margin-top:10px">
      <div>
        <div class="popup-label">{{ t("modals.invoice.issueDate") }}</div>
        <input class="popup-input" type="date" v-model="issueDate" />
      </div>
      <div>
        <div class="popup-label">{{ t("modals.invoice.payDate") }}</div>
        <input class="popup-input" type="date" v-model="payDate" />
      </div>
    </div>

    <div>
      <div class="popup-label">{{ t("modals.invoice.comment") }}</div>
      <input class="popup-input" v-model="comment" :placeholder="t('modals.invoice.commentPlaceholder')" />
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

const payload = modal.payload as any;
const programId = payload?.programId as string | undefined;
const year = payload?.year as string | undefined;
const monthIndex = (payload?.monthIndex ?? 0) as number;
const tx = payload?.tx || null;

const issueDate = ref(payload?.issueDate || "2026-03-02");
const payDate = ref(payload?.payDate || "2026-03-02");

const fv = ref(tx?.fvnum ?? "");
const ksef = ref(tx?.ksef ?? "");
const comment = ref("");
const saving = ref(false);

function close(){ modal.close(); }

async function save(){
  if (!programId) return close();
  saving.value = true;
  try{
    await paymentsApi.editInvoice({ programId, year: year || "", monthIndex, fvnum: fv.value, ksef: ksef.value || undefined, issueDate: issueDate.value, payDate: payDate.value });
    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>
