<template>
  <div v-if="payments.loading" class="note">{{ t("common.loading") }}</div>
  <div v-else-if="payments.error" class="note" style="border-color:rgba(239,68,68,.35); background:rgba(239,68,68,.08)">
    {{ payments.error }}
  </div>

  <div v-else class="payments-tab">
    <PaymentBalance />
    <PaymentPrograms />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePaymentsStore } from "../../../../stores/payments.store";

import PaymentBalance from "./payments/PaymentBalance.vue";
import PaymentPrograms from "./payments/PaymentPrograms.vue";

const { t } = useI18n();
const payments = usePaymentsStore();
</script>