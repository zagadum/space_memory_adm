<template>
  <BaseModal popupClass="popup-invoice-correct">
    <div class="popup-title">🔧 {{ t('faktury.correct') }}</div>
    <div class="popup-sub">{{ t('modals.invoice.correctSubtitle', { number: invoice.number }) }}</div>

    <!-- Original Document Summary -->
    <div class="invoice-summary">
      <div class="summary-item">
        <div class="item-label">{{ t('faktury.buyer') }}</div>
        <div class="item-value">{{ invoice.buyer_name }}</div>
      </div>
      <div class="summary-item">
        <div class="item-label">{{ t('faktury.amount') }} (Było)</div>
        <div class="item-value">{{ formatCurrency(invoice.amount_gross) }}</div>
      </div>
    </div>

    <div class="mt-5">
      <div class="popup-label">{{ t('faktury.correctionReason') }}</div>
      <div class="select-wrapper">
        <select class="popup-input" v-model="form.reason_type">
          <option value="price_reduction">{{ t('modals.korekta.reasons.discount') }}</option>
          <option value="return">{{ t('modals.korekta.reasons.return') }}</option>
          <option value="data_correction">{{ t('modals.korekta.reasons.dataError') }}</option>
          <option value="other">{{ t('modals.korekta.reasons.other') }}</option>
        </select>
      </div>
    </div>

    <div class="mt-4">
      <UiInput 
        v-model="form.reason_note" 
        :label="t('modals.korekta.commentLabel')" 
        required 
        placeholder="Opisz powód korekty (widoczne na dokumencie)..."
      />
    </div>

    <div class="mt-4">
      <UiInput 
        type="number"
        v-model="form.amount_gross" 
        :label="t('faktury.amount') + ' (Nowa kwota brutto)'" 
        required 
      />
      <div class="diff-preview" v-if="diff !== 0">
        <span class="diff-badge" :class="diff > 0 ? 'badge-green' : 'badge-red'">
          {{ diff > 0 ? '+' : '' }}{{ formatCurrency(diff) }}
        </span>
        <span class="diff-text">{{ t('faktury.difference') }}</span>
      </div>
    </div>

    <div class="info-alert mt-4">
      <span class="info-icon">ℹ️</span>
      <p>{{ t('faktury.correctionHint') }}</p>
    </div>

    <div class="mt-2 text-danger" v-if="error">{{ error }}</div>

    <div class="popup-actions mt-5">
      <UiButton variant="ghost" @click="modal.close">{{ t('common.cancel') }}</UiButton>
      <UiButton 
        variant="primary" 
        :loading="loading" 
        :disabled="!isFormValid || loading" 
        @click="submit"
      >
        {{ t('faktury.issueCorrection') }}
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
  reason_type: 'price_reduction',
  reason_note: '',
  amount_gross: props.invoice.amount_gross,
});

const diff = computed(() => form.amount_gross - props.invoice.amount_gross);

const isFormValid = computed(() => {
  return form.reason_note.trim().length > 3 && form.amount_gross >= 0;
});

async function submit() {
  loading.value = true;
  error.value = null;
  try {
    // Combine reason type and note into a single string for the store/api
    const combinedReason = `[${form.reason_type}] ${form.reason_note}`;
    
    await invoicesStore.issueCorrection(props.invoice.id, {
      reason: combinedReason,
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
.popup-invoice-correct { max-width: 520px; }

.invoice-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(79, 110, 247, 0.05));
  padding: 18px;
  border-radius: 16px;
  margin-top: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.item-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--dim, #8892b0);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 6px;
}

.item-value {
  font-weight: 600;
  color: white;
  font-size: 14px;
}

.popup-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--dim);
  margin-bottom: 8px;
}

.select-wrapper {
  position: relative;
}

.popup-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(100, 120, 255, 0.2);
  border-radius: 10px;
  padding: 11px 14px;
  color: white;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.select-wrapper::after {
  content: '▼';
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: var(--dim);
  pointer-events: none;
}

.diff-preview {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.diff-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.badge-green { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.badge-red { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

.diff-text {
  font-size: 12px;
  color: var(--dim);
  font-weight: 500;
}

.info-alert {
  display: flex;
  gap: 12px;
  background: rgba(79, 110, 247, 0.08);
  padding: 14px;
  border-radius: 12px;
  border-left: 3px solid var(--blue);
}

.info-alert p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dim);
}

.text-danger { 
  color: #ff5555; 
  font-size: 12px; 
  padding: 10px;
  background: rgba(255, 0, 0, 0.05);
  border-radius: 8px;
}

.mt-5 { margin-top: 32px; }
</style>
