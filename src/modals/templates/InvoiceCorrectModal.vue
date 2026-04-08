<template>
  <BaseModal popupClass="popup-invoice-correct">
    <div class="popup-title">🔧 {{ t('faktury.correct') }}</div>
    <div class="popup-sub">{{ t('modals.invoice.correctSubtitle', { number: invoice.number }) }}</div>

    <div class="invoice-summary">
      <div class="summary-item">
        <div class="item-label">{{ t('faktury.buyer') }}</div>
        <div class="item-value">{{ invoice.buyer_name }}</div>
      </div>
      <div class="summary-item">
        <div class="item-label">{{ t('faktury.amount') }} (Current Gross)</div>
        <div class="item-value">{{ formatCurrency(invoice.amount_gross) }}</div>
      </div>
    </div>

    <div class="mt-4">
      <UiInput 
        v-model="form.reason" 
        :label="t('faktury.correctionReason') || 'Reason for correction'" 
        required 
        placeholder="e.g. Price reduction, wrong buyer details..."
      />
    </div>

    <div class="mt-4">
      <UiInput 
        type="number"
        v-model="form.amount_gross" 
        :label="t('faktury.amount') + ' (New Gross)'" 
        required 
      />
      <div class="diff-preview" v-if="diff !== 0">
        <span :class="diff > 0 ? 'text-green' : 'text-red'">
          {{ diff > 0 ? '+' : '' }}{{ formatCurrency(diff) }}
        </span>
        {{ t('faktury.difference') || 'difference' }}
      </div>
    </div>

    <div class="mt-4 text-dim text-sm">
      ℹ️ {{ t('faktury.correctionHint') || 'This will create a new legal document (FK) linked to the original.' }}
    </div>

    <div class="mt-2 text-red" v-if="error">{{ error }}</div>

    <div class="popup-actions mt-4">
      <UiButton variant="ghost" @click="modal.close">{{ t('common.cancel') }}</UiButton>
      <UiButton 
        variant="primary" 
        :loading="loading" 
        :disabled="!isFormValid || loading" 
        @click="submit"
      >
        {{ t('faktury.issueCorrection') || 'Issue FK' }}
      </UiButton>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseModal from '../BaseModal.vue';
import UiInput from '../../components/ui/UiInput.vue';
import UiButton from '../../components/ui/UiButton.vue';
import { useModalStore } from '../../stores/modal.store';
import { useInvoicesStore } from '../../stores/invoices.store';

const props = defineProps<{
  invoice: any;
}>();

const { t } = useI18n();
const modal = useModalStore();
const invoicesStore = useInvoicesStore();

const loading = ref(false);
const error = ref<string | null>(null);

const form = reactive({
  reason: '',
  amount_gross: props.invoice.amount_gross,
});

const diff = computed(() => form.amount_gross - props.invoice.amount_gross);

const isFormValid = computed(() => {
  return form.reason.trim().length > 3 && form.amount_gross >= 0;
});

async function submit() {
  loading.value = true;
  error.value = null;
  try {
    await invoicesStore.issueCorrection(props.invoice.id, {
      reason: form.reason,
      amount_gross: form.amount_gross,
    });
    modal.close();
  } catch (err: any) {
    error.value = err.message || 'Error creating correction';
  } finally {
    loading.value = false;
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(amount);
}
</script>

<style scoped>
.popup-invoice-correct { max-width: 500px; }

.invoice-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  background: rgba(255, 255, 255, 0.03);
  padding: 16px;
  border-radius: 12px;
  margin-top: 16px;
}

.item-label {
  font-size: 11px;
  color: var(--app-text-dim);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.item-value {
  font-weight: 600;
  color: var(--app-text-main);
}

.diff-preview {
  margin-top: 4px;
  font-size: 12px;
  color: var(--app-text-dim);
}

.text-green { color: #10b981; }
.text-red { color: #ef4444; }
</style>
