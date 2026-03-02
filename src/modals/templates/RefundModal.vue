<template>
  <BaseModal popupClass="popup-refund">
    <div class="popup-title">{{ t("modals.refund.title") }}</div>
    <div class="popup-sub">{{ modal.payload?.headerText || t("modals.refund.subtitle") }}</div>

    <div>
      <div class="popup-label">{{ t("modals.refund.fv") }}</div>
      <input class="popup-input" v-model="fvnum" placeholder="FV/2026/02/091" />
    </div>

    <div class="popup-2col">
      <div>
        <div class="popup-label">{{ t("modals.refund.amount") }}</div>
        <input class="popup-input" v-model.number="amount" type="number" min="0" />
      </div>
      <div>
        <div class="popup-label">{{ t("modals.refund.reason") }}</div>
        <input class="popup-input" v-model="reason" placeholder="например: ошибка оплаты" />
      </div>
    </div>

    <div style="margin-top:10px">
      <div class="popup-label">{{ t("modals.refund.date") }}</div>
      <input class="popup-input" type="date" v-model="refundDate" />
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">{{ t("common.cancel") }}</button>
      <button class="btn btn-red" :disabled="saving" @click="submit">
        {{ saving ? t("common.sending") : t("modals.refund.submit") }}
      </button>
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
const fvnum = ref(modal.payload?.fvnum ?? "");
const amount = ref<number | null>(null);
const reason = ref("");
const refundDate = ref(modal.payload?.refundDate || "2026-03-02");
const saving = ref(false);

function close(){ modal.close(); }

async function submit(){
  saving.value = true;
  try{
    const res = await paymentsApi.submitRefund({ fvnum: fvnum.value, amount: amount.value ?? undefined, reason: reason.value || undefined, refundDate: refundDate.value } as any);
    modal.open("refund-ok", res);
  } finally {
    saving.value = false;
  }
}
</script>
