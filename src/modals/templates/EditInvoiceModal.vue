<script setup lang="ts">
import { ref, computed } from "vue"
import { useI18n } from "vue-i18n"
import BaseModal from "../BaseModal.vue"
import UiButton from "../../components/ui/UiButton.vue"
import { usePaymentsStore } from "../../stores/payments.store"
import { useModalStore } from "../../stores/modal.store"
import { paymentsApi } from "../../api/paymentsApi"

const { t } = useI18n()
const paymentsStore = usePaymentsStore()
const modal = useModalStore()

const MONTHS = computed(() => (t('payments.monthsFull') as unknown as string[]))

const payload = modal.payload as any
const programId = payload?.programId
const tx = payload?.tx || {}

// Form Fields
const fv = ref(tx.fvnum || "")
const issueDate = ref(payload?.issueDate || new Date().toISOString().split('T')[0])
const payDate = ref(payload?.payDate || new Date().toISOString().split('T')[0])
const amount = ref(tx.amount || "0.00")

// Service Logic
const serviceType = ref("lang_course")
const serviceName = ref("Курс иностранных языков")

// Selection logic
const targetMonth = ref(payload?.monthIndex ?? new Date().getMonth())
const targetYear = ref(payload?.year || new Date().getFullYear().toString())

// Buyer data
const buyerName = ref(payload?.clientName || "")
const buyerAddress = ref(payload?.clientAddress || "")
const buyerNip = ref(payload?.clientNip || "")

const saving = ref(false)
const errorMessage = ref('')

const onTypeChange = () => {
  if (serviceType.value === 'lang_course') serviceName.value = "Курс иностранных языков"
  else if (serviceType.value === 'bonus') serviceName.value = "Дополнительные / Бонусные занятия"
}

const close = () => { modal.close() }

async function save() {
  saving.value = true
  errorMessage.value = ''
  try {
    await paymentsApi.editInvoice({
      programId,
      fvnum: fv.value,
      issueDate: issueDate.value,
      payDate: payDate.value,
      amount: Number(amount.value),
      serviceName: serviceName.value,
      buyerName: buyerName.value,
      buyerAddress: buyerAddress.value,
      buyerNip: buyerNip.value || undefined,
      monthIndex: targetMonth.value,
      year: String(targetYear.value),
    })
    await paymentsStore.reloadCurrent()
    modal.close()
  } catch (e: unknown) {
    errorMessage.value = e instanceof Error ? e.message : 'Operation failed. Please try again.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal popupClass="popup-edit-invoice">
    <div class="modal-header">
      <div class="header-icon">✍️</div>
      <div class="header-text">
        <h2 class="popup-title">{{ t("modals.invoice.title") }}</h2>
        <p class="popup-sub">{{ t("modals.invoice.subtitle") }}</p>
      </div>
    </div>

    <div class="scroll-body">
      <!-- General Data -->
      <div class="section-card">
        <label class="section-label">📋 {{ t("faktury.mainDetails") }}</label>
        <div class="form-grid">
          <div class="form-group">
            <label class="mini-label">{{ t("modals.invoice.fvnum") }}</label>
            <input class="premium-input-raw font-mono" v-model="fv" placeholder="FV/2026/03/..." />
          </div>
          <div class="form-group">
            <label class="mini-label">{{ t("modals.invoice.issueDate") }}</label>
            <input class="premium-input-raw" type="date" v-model="issueDate" />
          </div>
          <div class="form-group">
            <label class="mini-label">{{ t("modals.invoice.serviceTypeLabel") }}</label>
            <select class="premium-select" v-model="serviceType" @change="onTypeChange">
              <option value="lang_course">{{ t("modals.invoice.serviceTypes.langCourse") }}</option>
              <option value="bonus">{{ t("modals.invoice.serviceTypes.bonus") }}</option>
              <option value="custom">{{ t("modals.invoice.serviceTypes.custom") }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="mini-label">{{ t("modals.invoice.payDueLabel") }}</label>
            <input class="premium-input-raw" type="date" v-model="payDate" />
          </div>
        </div>

        <div class="form-group mt-3">
          <label class="mini-label">{{ t("modals.invoice.serviceTextLabel") }}</label>
          <input 
            class="premium-input-raw" 
            v-model="serviceName" 
            :disabled="serviceType !== 'custom'"
            :class="{ 'opacity-50': serviceType !== 'custom' }"
            :placeholder="t('modals.invoice.serviceTextPlaceholder')"
          />
        </div>
      </div>

      <!-- Financial Period & Amount -->
      <div class="section-card">
        <div class="form-grid">
          <div class="form-group">
            <label class="mini-label">{{ t("modals.invoice.periodLabel") }}</label>
            <div class="dual-row">
              <select class="premium-select flex-2" v-model="targetMonth">
                <option v-for="(m, i) in MONTHS" :key="i" :value="i">{{ m }}</option>
              </select>
              <input class="premium-input-raw flex-1" v-model="targetYear" placeholder="2026" />
            </div>
          </div>
          <div class="form-group">
            <label class="mini-label">{{ t("modals.invoice.totalAmountLabel") }}</label>
            <input class="premium-input-raw amount-highlight" v-model="amount" />
          </div>
        </div>
      </div>

      <!-- Buyer Card -->
      <div class="section-card buyer-card">
        <label class="section-label">👤 {{ t("modals.invoice.buyerTitle") }}</label>
        <div class="form-grid">
          <div class="form-group">
            <label class="mini-label">{{ t("modals.invoice.buyerName") }}</label>
            <input class="premium-input-raw sm-text" v-model="buyerName" />
          </div>
          <div class="form-group">
            <label class="mini-label">{{ t("modals.invoice.buyerNip") }}</label>
            <input class="premium-input-raw sm-text" v-model="buyerNip" placeholder="—" />
          </div>
          <div class="form-group col-span-2">
            <label class="mini-label">{{ t("modals.invoice.buyerAddress") }}</label>
            <input class="premium-input-raw sm-text" v-model="buyerAddress" />
          </div>
        </div>
      </div>

      <!-- Warning -->
      <div class="info-alert compact">
        <span class="info-emoji">⚠️</span>
        <div class="info-text">{{ t("modals.invoice.ksefWarning") }}</div>
      </div>
    </div>

    <div v-if="errorMessage" class="error-toast">{{ errorMessage }}</div>

    <div class="modal-footer">
      <UiButton variant="ghost" @click="close">{{ t("common.cancel") }}</UiButton>
      <UiButton 
        variant="primary" 
        :loading="saving" 
        @click="save"
      >
        ✨ {{ t('modals.invoice.saveChanges') }}
      </UiButton>
    </div>
  </BaseModal>
</template>

<style scoped>
.popup-edit-invoice { max-width: 540px; padding: 0 !important; overflow: hidden; }

.modal-header { padding: 24px 24px 16px; background: var(--app-card-hi); border-bottom: 1px solid var(--app-border); display: flex; gap: 16px; align-items: flex-start; }
.header-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(59, 130, 246, 0.1); display: flex; align-items: center; justify-content: center; font-size: 20px; }
.popup-title { font-size: 18px; font-weight: 800; color: var(--app-text-main); margin: 0; }
.popup-sub { font-size: 13px; color: var(--app-text-dim); margin: 4px 0 0; }

.scroll-body { padding: 20px 24px 24px; max-height: 65vh; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }

.section-card { border: 1px solid var(--app-border); border-radius: 16px; padding: 16px; background: var(--app-card); }
.section-label { font-size: 11px; font-weight: 800; color: var(--app-primary); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 12px; }

.buyer-card { background: var(--app-card-hi); }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.col-span-2 { grid-column: span 2; }
.mini-label { font-size: 11px; font-weight: 600; color: var(--app-text-dim); margin-bottom: 6px; display: block; }

.dual-row { display: flex; gap: 8px; }
.flex-2 { flex: 2; }
.flex-1 { flex: 1; }

.premium-input-raw { width: 100%; background: var(--app-bg); border: 1px solid var(--app-border); border-radius: 10px; padding: 10px 14px; color: var(--app-text-main); font-size: 13px; outline: none; }
.premium-input-raw:focus { border-color: var(--app-primary); }
.premium-input-raw.sm-text { font-size: 12px; padding: 8px 12px; }
.premium-input-raw.amount-highlight { color: var(--app-primary); font-weight: 700; font-family: 'Space Mono', monospace; font-size: 15px; }

.premium-select { width: 100%; background: var(--app-bg); border: 1px solid var(--app-border); border-radius: 10px; padding: 10px 12px; color: var(--app-text-main); font-size: 13px; outline: none; arrival: none; cursor: pointer; }
.premium-select:focus { border-color: var(--app-primary); }

.info-alert { display: flex; gap: 12px; background: rgba(245, 158, 11, 0.08); padding: 12px; border-radius: 14px; border: 1px solid rgba(245, 158, 11, 0.15); }
.info-emoji { font-size: 16px; }
.info-text { font-size: 11px; color: #d4a017; line-height: 1.5; font-weight: 600; }

.error-toast { margin: 0 24px 16px; padding: 10px 16px; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 10px; color: #f43f5e; font-size: 12px; font-weight: 600; }

.modal-footer { padding: 16px 24px 24px; background: var(--app-card-hi); border-top: 1px solid var(--app-border); display: flex; justify-content: flex-end; gap: 12px; }

.mt-3 { margin-top: 12px; }
.opacity-50 { opacity: 0.5; }
</style>