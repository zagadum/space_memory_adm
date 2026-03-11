<template>
  <BaseModal popupClass="popup-refund">
    <div class="popup-title">↪️ {{ t("modals.refund.title") }}</div>
    <div class="popup-sub">{{ t("modals.refund.subtitle") }} {{ fvnum }} · {{ payload?.desc || t('modals.refund.subscription') }}</div>

    <div class="tx-info-card">
      <div class="tx-info-title">{{ t("modals.refund.txInfo") }}</div>
      <div class="tx-info-grid">
        <div class="tx-info-item">
          <span class="tx-info-label">{{ t("modals.refund.fvLabel") }}</span>
          <span class="tx-info-val">{{ fvnum }}</span>
        </div>
        <div class="tx-info-item">
          <span class="tx-info-label">{{ t("modals.refund.sumLabel") }}</span>
          <span class="tx-info-val" style="color:var(--cyan)">{{ payload?.amount || 0 }} zł</span>
        </div>
        <div class="tx-info-item">
          <span class="tx-info-label">KSeF</span>
          <span class="kb kb-ok">{{ t("modals.refund.ksefSent") }}</span>
        </div>
      </div>
    </div>

    <div class="popup-label">{{ t("modals.refund.typeLabel") }}</div>
    <div class="radio-grid">
      <div class="radio-card" :class="{ active: refundType === 'full' }" @click="refundType = 'full'">
        <div class="radio-dot"></div>
        <div>
          <div class="radio-title">{{ t("modals.refund.typeFull") }}</div>
          <div class="radio-desc">{{ t("modals.refund.typeFullDesc") }}</div>
        </div>
      </div>
      <div class="radio-card" :class="{ active: refundType === 'partial' }" @click="refundType = 'partial'">
        <div class="radio-dot"></div>
        <div>
          <div class="radio-title">{{ t("modals.refund.typePartial") }}</div>
          <div class="radio-desc">{{ t("modals.refund.typePartialDesc") }}</div>
        </div>
      </div>
    </div>

    <div class="popup-label" style="margin-top:16px">{{ t("modals.refund.reasonLabel") }}</div>
    <div class="radio-grid grid-2col">
      <div v-for="r in reasons" :key="r.id" 
           class="radio-card card-sm" 
           :class="{ active: reasonId === r.id }" 
           @click="reasonId = r.id">
        <div class="radio-dot"></div>
        <span class="radio-title">{{ r.icon }} {{ r.label }}</span>
      </div>
    </div>

    <div style="margin-top:16px">
      <div class="popup-label">{{ t("modals.refund.descriptionLabel") }} <span style="color:var(--red)">*</span></div>
      <textarea 
        class="popup-input popup-textarea" 
        v-model="description" 
        :placeholder="t('modals.refund.descriptionPlaceholder')"
      ></textarea>
    </div>

    <div class="popup-label" style="margin-top:16px">{{ t("modals.refund.methodLabel") }}</div>
    <div class="radio-grid">
      <div class="radio-card" :class="{ active: method === 'imoje' }" @click="method = 'imoje'">
        <div class="radio-dot"></div>
        <div>
          <div class="radio-title">{{ t("modals.refund.methodImoje") }}</div>
          <div class="radio-desc">{{ t("modals.refund.methodImojeDesc") }}</div>
        </div>
      </div>
      <div class="radio-card" :class="{ active: method === 'bank' }" @click="method = 'bank'">
        <div class="radio-dot"></div>
        <div>
          <div class="radio-title">{{ t("modals.refund.methodBank") }}</div>
          <div class="radio-desc">{{ t("modals.refund.methodBankDesc") }}</div>
        </div>
      </div>
    </div>

    <div v-if="method === 'bank'" style="margin-top:12px" class="animate-fade">
      <div class="popup-label">{{ t("modals.refund.ibanLabel") }} <span style="color:var(--red)">*</span></div>
      <input class="popup-input" v-model="iban" :placeholder="t('modals.refund.ibanPlaceholder')" />
    </div>

    <div class="info-box info-amber" style="margin-top:20px">
      <span>⚠️</span>
      <div>{{ t("modals.refund.warning") }}</div>
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">{{ t("modals.refund.cancel") }}</button>
      <div v-if="errorMessage" class="info-box info-red" style="margin-bottom:8px;font-size:11px"><span>⚠️</span><div>{{ errorMessage }}</div></div>
      <button class="btn btn-primary-grad" :disabled="saving || !isValid" @click="submit">
        {{ saving ? t("common.sending") : t('modals.refund.submitBtn') }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import BaseModal from "../BaseModal.vue";
import { usePaymentsStore } from "../../stores/payments.store";
import { useModalStore } from "../../stores/modal.store";
import { paymentsApi } from "../../api/paymentsApi";

const { t } = useI18n();
const paymentsStore = usePaymentsStore();
const modal = useModalStore();
const payload = modal.payload;

const fvnum = ref(payload?.fvnum ?? "");
const refundType = ref('full');
const reasonId = ref('cancel');
const description = ref("");
const method = ref('imoje');
const iban = ref("");
const saving = ref(false);
const errorMessage = ref('');

const reasons = computed(() => [
  { id: 'cancel', label: t('modals.refund.reasons.cancel'), icon: '🚪' },
  { id: 'quality', label: t('modals.refund.reasons.quality'), icon: '⭐' },
  { id: 'overpaid', label: t('modals.refund.reasons.overpaid'), icon: '💰' },
  { id: 'other', label: t('modals.refund.reasons.other'), icon: '📝' }
]);

const isValid = computed(() => {
  if (description.value.length < 5) return false;
  if (method.value === 'bank' && iban.value.length < 10) return false;
  return true;
});

function close(){ modal.close(); }

async function submit() {
  saving.value = true;
  errorMessage.value = '';
  try {
    await paymentsApi.submitRefund({
      fvnum: fvnum.value,
      amount: payload?.amount,
      reason: reasonId.value,
      type: refundType.value,
      description: description.value,
      method: method.value,
      iban: method.value === 'bank' ? iban.value : undefined,
    });
    await paymentsStore.reloadCurrent();
    modal.close();
  } catch (e: unknown) {
    errorMessage.value = e instanceof Error ? e.message : 'Operation failed. Please try again.';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.popup-refund { max-width: 520px; }

/* Карточка данных транзакции */
.tx-info-card {
  background: rgba(255,255,255,.03);
  border: 1px solid var(--b);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 20px;
}
.tx-info-title { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--dim); margin-bottom: 12px; letter-spacing: 1px; }
.tx-info-grid { display: grid; grid-template-columns: 1.5fr 1fr 1.2fr; gap: 10px; }
.tx-info-item { display: flex; flex-direction: column; gap: 4px; }
.tx-info-label { font-size: 10px; color: var(--dim); }
.tx-info-val { font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700; }

/* Сетка Radio-карточек */
.radio-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px; }
.radio-card {
  background: rgba(255,255,255,.02);
  border: 1px solid var(--b);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all .2s ease;
}
.radio-card:hover { border-color: var(--bh); background: rgba(255,255,255,.05); }
.radio-card.active { border-color: var(--blue); background: rgba(79,110,247,.08); }

.radio-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--b);
  position: relative;
}
.radio-card.active .radio-dot { border-color: var(--blue); }
.radio-card.active .radio-dot::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--blue);
  border-radius: 50%;
  top: 2px;
  left: 2px;
}

.radio-title { font-size: 13px; font-weight: 700; color: var(--white); }
.radio-desc { font-size: 11px; color: var(--dim); }
.card-sm { padding: 10px; }

/* Поля ввода */
.popup-textarea { min-height: 80px; resize: vertical; line-height: 1.5; }

.info-box { border-radius: 8px; padding: 12px; font-size: 11px; display: flex; gap: 10px; line-height: 1.4; }
.info-amber { background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.2); color: #F59E0B; }

.btn-primary-grad {
  background: linear-gradient(135deg, var(--blue), var(--purple));
  color: white;
  border: none;
}

.animate-fade { animation: fadeIn .2s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>