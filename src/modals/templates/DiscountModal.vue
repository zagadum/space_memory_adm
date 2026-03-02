<template>
  <BaseModal popupClass="popup-discount">
    <div class="popup-title">🏷️ {{ t("modals.discount.title") }}</div>
    <div class="popup-sub">{{ t("modals.discount.subtitle") }}</div>

    <div class="popup-2col">
      <div>
        <div class="popup-label">{{ t("modals.discount.kind") }}</div>
        <select class="popup-input" v-model="kind">
          <option value="family">{{ t("modals.discount.kinds.family") }}</option>
          <option value="referral">{{ t("modals.discount.kinds.referral") }}</option>
          <option value="promo">{{ t("modals.discount.kinds.promo") }}</option>
          <option value="loyalty">{{ t("modals.discount.kinds.loyalty") }}</option>
        </select>
      </div>
      <div>
        <div class="popup-label">{{ t("modals.discount.amount") }} (zł)</div>
        <input class="popup-input" v-model.number="amount" type="number" min="0" />
      </div>
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">{{ t("common.cancel") }}</button>
      <button class="btn btn-amber" :disabled="saving" @click="save">{{ t("modals.discount.apply") }}</button>
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
const fromMonthIndex = (modal.payload?.monthIndex ?? 0) as number;

const kind = ref("family");
const amount = ref(0);
const saving = ref(false);

function close(){ modal.close(); }

async function save(){
  if (!programId) return close();
  saving.value = true;
  try{
    await paymentsApi.setDiscount({ programId, kind: kind.value, value: amount.value, fromMonthIndex });
    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>
