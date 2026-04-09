<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '../BaseModal.vue'
import UiInput from '../../components/ui/UiInput.vue'
import UiButton from '../../components/ui/UiButton.vue'
import { useModalStore } from '../../stores/modal.store'
import { useInvoicesStore } from '../../stores/invoices.store'

const props = defineProps<{
  invoice: any
}>()

const { t } = useI18n()
const modal = useModalStore()
const invoicesStore = useInvoicesStore()

const loading = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  reason_type: 'price_reduction',
  reason_note: '',
  amount_gross: props.invoice.amount_gross,
})

const diff = computed(() => form.amount_gross - props.invoice.amount_gross)

const isFormValid = computed(() => {
  return form.reason_note.trim().length > 3 && form.amount_gross >= 0
})

const submit = async () => {
  loading.value = true
  error.value = null
  try {
    const combinedReason = `[${form.reason_type}] ${form.reason_note}`
    await invoicesStore.issueCorrection(props.invoice.id, {
      reason: combinedReason,
      amount_gross: form.amount_gross,
    })
    modal.close()
  } catch (err: any) {
    error.value = err.message || 'Error creating correction'
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(amount)
}
</script>

<template>
  <BaseModal popupClass="popup-invoice-correct">
    <div class="modal-header">
      <div class="header-icon">🔧</div>
      <div class="header-text">
        <h2 class="popup-title">{{ t('faktury.correct') }}</h2>
        <p class="popup-sub">{{ t('modals.invoice.correctSubtitle', { number: invoice.number }) }}</p>
      </div>
    </div>

    <div class="scroll-body">
      <!-- Original Summary -->
      <div class="summary-card">
        <div class="summary-item">
          <label class="item-label">👤 {{ t('faktury.buyer') }}</label>
          <div class="item-value">{{ invoice.buyer_name }}</div>
        </div>
        <div class="summary-item">
          <label class="item-label">💰 {{ t('faktury.amount') }} (Było)</label>
          <div class="item-value highlight">{{ formatCurrency(invoice.amount_gross) }}</div>
        </div>
      </div>

      <!-- Correction Details -->
      <div class="section-card">
        <div class="form-group">
          <label class="section-label">📋 {{ t('faktury.correctionReason') }}</label>
          <div class="custom-select-wrap">
            <select class="premium-select" v-model="form.reason_type">
              <option value="price_reduction">{{ t('modals.korekta.reasons.discount') }}</option>
              <option value="return">{{ t('modals.korekta.reasons.return') }}</option>
              <option value="data_correction">{{ t('modals.korekta.reasons.dataError') }}</option>
              <option value="other">{{ t('modals.korekta.reasons.other') }}</option>
            </select>
          </div>
        </div>

        <div class="form-group mt-4">
          <UiInput 
            v-model="form.reason_note" 
            :label="t('modals.korekta.commentLabel')" 
            required 
            placeholder="Opisz powód korekty..."
          />
        </div>
      </div>

      <!-- New Values -->
      <div class="section-card amount-card">
        <div class="form-group">
          <UiInput 
            type="number"
            v-model="form.amount_gross" 
            :label="t('faktury.amount') + ' (Nowa kwota brutto)'" 
            required 
          />
        </div>

        <Transition name="fade">
          <div v-if="diff !== 0" class="diff-display">
            <div class="diff-pill" :class="diff > 0 ? 'is-plus' : 'is-minus'">
              {{ diff > 0 ? '+' : '' }}{{ formatCurrency(diff) }}
            </div>
            <div class="diff-label">{{ t('faktury.difference') }}</div>
          </div>
        </Transition>
      </div>

      <div class="info-box">
        <span class="info-emoji">💡</span>
        <p class="info-text">{{ t('faktury.correctionHint') }}</p>
      </div>
    </div>

    <div v-if="error" class="error-toast">{{ error }}</div>

    <div class="modal-footer">
      <UiButton variant="ghost" @click="modal.close">{{ t('common.cancel') }}</UiButton>
      <UiButton 
        variant="primary" 
        :loading="loading" 
        :disabled="!isFormValid || loading" 
        @click="submit"
      >
        🔧 {{ t('faktury.issueCorrection') }}
      </UiButton>
    </div>
  </BaseModal>
</template>

<style scoped>
.popup-invoice-correct { max-width: 520px; padding: 0 !important; overflow: hidden; }

.modal-header { padding: 24px 24px 16px; background: var(--app-card-hi); border-bottom: 1px solid var(--app-border); display: flex; gap: 16px; align-items: flex-start; }
.header-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(59, 130, 246, 0.1); display: flex; align-items: center; justify-content: center; font-size: 20px; }
.popup-title { font-size: 18px; font-weight: 800; color: var(--app-text-main); margin: 0; }
.popup-sub { font-size: 13px; color: var(--app-text-dim); margin: 4px 0 0; }

.scroll-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }

.summary-card { padding: 16px; background: var(--app-card-hi); border: 1px solid var(--app-border); border-radius: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.item-label { font-size: 10px; font-weight: 800; color: var(--app-text-dim); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px; }
.item-value { font-size: 14px; font-weight: 700; color: var(--app-text-main); }
.item-value.highlight { color: var(--app-primary); font-family: 'Outfit', sans-serif; font-size: 16px; }

.section-card { padding: 16px; background: var(--app-card); border: 1px solid var(--app-border); border-radius: 16px; }
.section-label { font-size: 11px; font-weight: 800; color: var(--app-primary); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 12px; }

.premium-select { width: 100%; background: var(--app-bg); border: 1px solid var(--app-border); border-radius: 10px; padding: 10px 12px; color: var(--app-text-main); font-size: 13px; outline: none; arrival: none; cursor: pointer; }
.premium-select:focus { border-color: var(--app-primary); }

.diff-display { margin-top: 16px; display: flex; align-items: center; gap: 12px; padding-top: 16px; border-top: 1px solid var(--app-border); }
.diff-pill { padding: 4px 12px; border-radius: 8px; font-size: 13px; font-weight: 800; font-family: 'Outfit', sans-serif; }
.diff-pill.is-plus { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.diff-pill.is-minus { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
.diff-label { font-size: 12px; color: var(--app-text-dim); font-weight: 600; }

.info-box { display: flex; gap: 12px; background: var(--app-card-hi); padding: 14px; border-radius: 14px; border: 1px solid var(--app-border); }
.info-emoji { font-size: 18px; }
.info-text { margin: 0; font-size: 12px; color: var(--app-text-dim); line-height: 1.5; }

.error-toast { margin: 0 24px 16px; padding: 10px 16px; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 10px; color: #f43f5e; font-size: 12px; font-weight: 600; }

.modal-footer { padding: 16px 24px 24px; background: var(--app-card-hi); border-top: 1px solid var(--app-border); display: flex; justify-content: flex-end; gap: 12px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
