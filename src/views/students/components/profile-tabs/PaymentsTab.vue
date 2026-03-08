<template>
  <div v-if="payments.loading" class="note">{{ t("common.loading") }}</div>
  <div v-else-if="payments.error" class="error-container">
    <div class="error-icon">⏱️</div>
    <div class="error-message">{{ payments.error }}</div>
    <button class="retry-button" @click="retryLoad">
      🔄 {{ t("common.retry") || "Повторить попытку" }}
    </button>
  </div>

  <div v-else class="payments-tab">
    <PaymentBalance />
    <PaymentPrograms />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { usePaymentsStore } from "../../../../stores/payments.store";

import PaymentBalance from "./payments/PaymentBalance.vue";
import PaymentPrograms from "./payments/PaymentPrograms.vue";

const { t } = useI18n();
const route = useRoute();
const payments = usePaymentsStore();

function retryLoad() {
  const studentId = route.params.id as string;
  if (studentId) {
    payments.loadStudent(studentId);
  }
}
</script>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.08);
  border-radius: 8px;
  gap: 16px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  line-height: 1;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.error-message {
  font-size: 16px;
  color: #991b1b;
  max-width: 500px;
  line-height: 1.5;
}

.retry-button {
  padding: 10px 24px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.retry-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.retry-button:active {
  transform: translateY(0);
}
</style>
