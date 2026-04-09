<script setup lang="ts">
import { ref, computed } from "vue"
import { useI18n } from "vue-i18n"
import BaseModal from "../BaseModal.vue"
import UiButton from "../../components/ui/UiButton.vue"
import UiBadge from "../../components/ui/UiBadge.vue"
import { useInvoicesStore } from "../../stores/invoices.store"
import { useModalStore } from "../../stores/modal.store"
import { invoicesApi } from "../../api/invoices.api"

const { t } = useI18n()
const invoicesStore = useInvoicesStore()
const modal = useModalStore()
const payload = modal.payload as any
const invoice = payload?.invoice || {}

// Data from invoice
const fvnum = invoice.number || "FV/2026/01/???"
const origAmount = invoice.amount_gross || 0
const ksefStatus = invoice.ksef_status || "draft"

// Form state
const corrType = ref<"full" | "partial">("full")
const newAmount = ref(0)
const corrDate = ref(new Date().toISOString().split("T")[0])
const reasonId = ref("return")
const comment = ref("")
const saving = ref(false)
const errorMessage = ref('')

// Calculations
const diffAmount = computed(() => {
  if (corrType.value === 'full') return -origAmount
  return newAmount.value - origAmount
})

function getStatusVariant(status: string) {
  switch (status) {
    case 'paid': return 'success'
    case 'cancelled': return 'danger'
    case 'draft': return 'warning'
    case 'wystawiona':
    case 'sent': return 'info'
    case 'sending':
    case 'pending': return 'warning'
    case 'error': return 'danger'
    default: return 'neutral'
  }
}

const isValid = computed(() => {
  if (!reasonId.value) return false
  if (corrType.value === "partial" && (newAmount.value < 0 || newAmount.value === origAmount)) return false
  return true
})

function close() { modal.close() }

async function save() {
  saving.value = true
  errorMessage.value = ''
  try {
    const finalAmount = corrType.value === 'full' ? 0 : newAmount.value
    await invoicesApi.correct(invoice.id, {
      amount_gross: finalAmount,
      reason: reasonId.value,
      notes: comment.value || undefined,
      issue_date: corrDate.value || undefined,
    })
    await invoicesStore.fetchInvoices()
    modal.close()
  } catch (e: unknown) {
    errorMessage.value = e instanceof Error ? e.message : 'Operation failed. Please try again.'
  } finally {
    saving.value = false
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(val)
}
</script>

<template>
  <BaseModal popupClass="popup-korekta">
    <div class="modal-header">
      <div class="header-icon">📋</div>
      <div class="header-text">
        <h2 class="popup-title">{{ t("modals.korekta.title") }}</h2>
        <p class="popup-sub">{{ t("modals.korekta.subtitle") }}</p>
      </div>
    </div>

    <div class="scroll-body">
      <!-- Source Doc Card -->
      <div class="section-card source-doc">
        <div class="card-header">
          <label class="section-label">{{ t("modals.korekta.sourceDoc") }}</label>
          <UiBadge :variant="getStatusVariant(ksefStatus)">{{ t(`faktury.statuses.${ksefStatus}`) }}</UiBadge>
        </div>
        <div class="source-grid">
          <div class="info-item">
            <span class="info-label">{{ t("modals.refund.fvLabel") }}</span>
            <span class="info-value font-mono">{{ fvnum }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ t("modals.korekta.sumLabel") }}</span>
            <span class="info-value amount-highlight">{{ formatCurrency(origAmount) }}</span>
          </div>
        </div>
      </div>

      <!-- Correction Type -->
      <div class="section-card">
        <label class="section-label">🎯 {{ t("modals.korekta.typeLabel") }}</label>
        <div class="segmented-control">
          <button 
            class="seg-btn" 
            :class="{ active: corrType === 'full' }" 
            @click="corrType = 'full'"
          >
            {{ t("modals.korekta.typeFull") }}
          </button>
          <button 
            class="seg-btn" 
            :class="{ active: corrType === 'partial' }" 
            @click="corrType = 'partial'"
          >
            {{ t("modals.korekta.typePartial") }}
          </button>
        </div>
        <p class="type-hint mt-2">
          {{ corrType === 'full' ? t("modals.korekta.typeFullDesc") : t("modals.korekta.typePartialDesc") }}
        </p>
      </div>

      <!-- Amounts & Date -->
      <div class="section-card">
        <div class="form-grid">
          <div class="form-group" v-if="corrType === 'partial'">
            <label class="mini-label">{{ t("modals.korekta.amount") }} *</label>
            <input class="premium-input-raw highlight" v-model.number="newAmount" type="number" min="0" />
          </div>
          <div class="form-group" :class="{ 'col-span-2': corrType === 'full' }">
            <label class="mini-label">{{ t("modals.korekta.corrDateLabel") }}</label>
            <input class="premium-input-raw" type="date" v-model="corrDate" />
          </div>
        </div>

        <Transition name="fade">
          <div v-if="corrType === 'partial'" class="diff-preview">
            <div class="diff-row">
              <span class="diff-lbl">{{ t("modals.korekta.wasLabel") }}</span>
              <span class="diff-val">{{ formatCurrency(origAmount) }}</span>
            </div>
            <div class="diff-divider"></div>
            <div class="diff-row total">
              <span class="diff-lbl">{{ t("modals.korekta.diffLabel") }}</span>
              <span class="diff-val" :class="diffAmount < 0 ? 'text-emerald-500' : 'text-rose-500'">
                {{ diffAmount > 0 ? '+' : '' }}{{ formatCurrency(diffAmount) }}
              </span>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Reason & Comments -->
      <div class="section-card">
        <div class="form-group">
          <label class="section-label">📑 {{ t("modals.korekta.reasonLabel") }} *</label>
          <select class="premium-select" v-model="reasonId">
            <option value="" disabled>{{ t("modals.korekta.selectReasonPlaceholder") }}</option>
            <option value="price_error">{{ t("modals.korekta.reasons.priceError") }}</option>
            <option value="discount">{{ t("modals.korekta.reasons.discount") }}</option>
            <option value="return">{{ t("modals.korekta.reasons.return") }}</option>
            <option value="data_error">{{ t("modals.korekta.reasons.dataError") }}</option>
            <option value="other">{{ t("modals.korekta.reasons.other") }}</option>
          </select>
        </div>
        <div class="form-group mt-4">
          <label class="mini-label">{{ t("modals.korekta.commentLabel") }}</label>
          <textarea
            class="premium-input-raw textarea"
            v-model="comment"
            :placeholder="t('modals.korekta.commentPlaceholder')"
          ></textarea>
        </div>
      </div>

      <!-- Warning -->
      <div class="info-alert">
        <span class="info-emoji">⚠️</span>
        <div class="info-text">{{ t("modals.korekta.ksefWarning", { fvnum }) }}</div>
      </div>
    </div>

    <div v-if="errorMessage" class="error-toast">{{ errorMessage }}</div>

    <div class="modal-footer">
      <UiButton variant="ghost" @click="close">{{ t("modals.korekta.cancel") }}</UiButton>
      <UiButton 
        variant="primary" 
        :loading="saving" 
        :disabled="!isValid || saving" 
        @click="save"
      >
        🔧 {{ t('modals.korekta.submit') }}
      </UiButton>
    </div>
  </BaseModal>
</template>

<style scoped>
.popup-korekta { max-width: 540px; padding: 0 !important; overflow: hidden; }

.modal-header { padding: 24px 24px 16px; background: var(--app-card-hi); border-bottom: 1px solid var(--app-border); display: flex; gap: 16px; align-items: flex-start; }
.header-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(59, 130, 246, 0.1); display: flex; align-items: center; justify-content: center; font-size: 20px; }
.popup-title { font-size: 18px; font-weight: 800; color: var(--app-text-main); margin: 0; }
.popup-sub { font-size: 13px; color: var(--app-text-dim); margin: 4px 0 0; }

.scroll-body { padding: 24px; max-height: 60vh; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }

.section-card { border: 1px solid var(--app-border); border-radius: 16px; padding: 16px; background: var(--app-card); }
.section-label { font-size: 11px; font-weight: 800; color: var(--app-primary); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 12px; }

.source-doc { background: var(--app-card-hi); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.source-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.info-item { display: flex; flex-direction: column; }
.info-label { font-size: 10px; font-weight: 700; color: var(--app-text-dim); text-transform: uppercase; margin-bottom: 4px; }
.info-value { font-size: 15px; font-weight: 700; color: var(--app-text-main); }
.amount-highlight { color: var(--app-primary); font-family: 'Outfit', sans-serif; }

.segmented-control { display: flex; background: var(--app-bg); padding: 4px; border-radius: 12px; border: 1px solid var(--app-border); }
.seg-btn { flex: 1; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 700; color: var(--app-text-dim); transition: all 0.2s; }
.seg-btn.active { background: var(--app-primary); color: white; box-shadow: 0 4px 12px rgba(79, 110, 247, 0.2); }
.type-hint { font-size: 11px; color: var(--app-text-dim); font-style: italic; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.col-span-2 { grid-column: span 2; }
.mini-label { font-size: 11px; font-weight: 600; color: var(--app-text-dim); margin-bottom: 6px; display: block; }

.premium-input-raw { width: 100%; background: var(--app-bg); border: 1px solid var(--app-border); border-radius: 10px; padding: 10px 14px; color: var(--app-text-main); font-size: 14px; outline: none; }
.premium-input-raw:focus { border-color: var(--app-primary); }
.premium-input-raw.highlight { color: var(--app-primary); font-weight: 700; font-family: 'Space Mono', monospace; }
.textarea { min-height: 80px; resize: vertical; font-size: 13px; }

.diff-preview { margin-top: 12px; padding: 12px; background: rgba(79, 110, 247, 0.04); border: 1px solid rgba(79, 110, 247, 0.1); border-radius: 12px; }
.diff-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.diff-lbl { font-size: 12px; color: var(--app-text-dim); }
.diff-val { font-size: 13px; font-weight: 700; font-family: 'Space Mono', monospace; }
.diff-divider { height: 1px; background: var(--app-border); margin: 8px 0; }
.total .diff-lbl { font-weight: 700; color: var(--app-text-main); }
.total .diff-val { font-size: 15px; }

.premium-select { width: 100%; background: var(--app-bg); border: 1px solid var(--app-border); border-radius: 10px; padding: 10px 12px; color: var(--app-text-main); font-size: 13px; outline: none; arrival: none; cursor: pointer; }
.premium-select:focus { border-color: var(--app-primary); }

.info-alert { display: flex; gap: 12px; background: rgba(245, 158, 11, 0.08); padding: 12px 16px; border-radius: 14px; border: 1px solid rgba(245, 158, 11, 0.2); }
.info-emoji { font-size: 18px; }
.info-text { font-size: 12px; color: #f59e0b; line-height: 1.5; font-weight: 600; }

.error-toast { margin: 0 24px 16px; padding: 10px 16px; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 10px; color: #f43f5e; font-size: 12px; font-weight: 600; }

.modal-footer { padding: 16px 24px 24px; background: var(--app-card-hi); border-top: 1px solid var(--app-border); display: flex; justify-content: flex-end; gap: 12px; }

.fade-enter-active, .fade-leave-active { transition: all 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>