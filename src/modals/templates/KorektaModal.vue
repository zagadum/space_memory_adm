<template>
  <BaseModal popupClass="popup-korekta">
    <div class="popup-title">📝 {{ t("modals.korekta.title") }}</div>
    <div class="popup-sub">Создание корректировочного счёта для {{ fvnum }}</div>

    <div class="tx-info-card">
      <div class="tx-info-title">Исходный документ</div>
      <div class="tx-info-grid">
        <div class="tx-info-item">
          <span class="tx-info-label">№ СФ</span>
          <span class="tx-info-val">{{ fvnum }}</span>
        </div>
        <div class="tx-info-item">
          <span class="tx-info-label">Сумма</span>
          <span class="tx-info-val">{{ payload?.amount || 0 }} зл</span>
        </div>
        <div class="tx-info-item">
          <span class="tx-info-label">KSeF</span>
          <span class="kb kb-ok">✓ Отправлен</span>
        </div>
      </div>
    </div>

    <div class="popup-2col">
      <div>
        <div class="popup-label">Новая сумма (PLN) <span style="color:var(--red)">*</span></div>
        <input class="popup-input amt-input" v-model.number="amount" type="number" min="0" />
      </div>
      <div>
        <div class="popup-label">Дата коррекции</div>
        <input class="popup-input" type="date" v-model="corrDate" />
      </div>
    </div>

    <div style="margin-top:16px">
      <div class="popup-label">Причина корректировки <span style="color:var(--red)">*</span></div>
      <select class="popup-input" v-model="reasonId">
        <option value="" disabled>— выберите причину —</option>
        <option value="price_error">Ошибка в цене</option>
        <option value="discount">Предоставление скидки</option>
        <option value="return">Частичный возврат услуг</option>
        <option value="data_error">Ошибка в реквизитах</option>
      </select>
    </div>

    <div style="margin-top:16px">
      <div class="popup-label">Комментарий (печать в счёте)</div>
      <textarea 
        class="popup-input popup-textarea" 
        v-model="reason" 
        :placeholder="t('modals.korekta.reasonPlaceholder')"
      ></textarea>
    </div>

    <div class="info-box info-amber" style="margin-top:20px">
      <span>⚠️</span>
      <div>Изменение данных счёта не отменяет KSeF. Если счёт уже отправлен — используйте <strong>Корректуру</strong> для официального изменения.</div>
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">{{ t("common.cancel") }}</button>
      <button class="btn btn-primary-grad" :disabled="saving || !isValid" @click="save">
        <span v-if="!saving">💾 Сохранить изменения</span>
        <span v-else>{{ t("common.sending") }}</span>
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import BaseModal from "../BaseModal.vue";
import { useModalStore } from "../../stores/modal.store";
import { paymentsApi } from "../../api/paymentsApi";

const { t } = useI18n();
const modal = useModalStore();
const payload = modal.payload;

const programId = payload?.programId as string | undefined;
const year = payload?.year as string | undefined;
const monthIndex = (payload?.monthIndex ?? 0) as number;
const fvnum = ref(payload?.fvnum || "FV/2026/01/312");

const amount = ref(payload?.amount || 0);
const reasonId = ref("");
const reason = ref("");
const corrDate = ref(payload?.corrDate || "2026-03-02");
const saving = ref(false);

const isValid = computed(() => {
  return amount.value >= 0 && reasonId.value !== "";
});

function close(){ modal.close(); }

async function save(){
  if (!programId) return close();
  saving.value = true;
  try{
    await paymentsApi.submitCorrection({ 
      programId, 
      year: year || "", 
      monthIndex, 
      amount: amount.value, 
      note: `${reasonId.value}: ${reason.value}`, 
      corrDate: corrDate.value 
    });
    modal.close();
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.popup-korekta { max-width: 500px; }

/* Карточка транзакции из RefundModal для единства стиля */
.tx-info-card {
  background: rgba(255,255,255,.03);
  border: 1px solid var(--b);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 20px;
}
.tx-info-title { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--dim); margin-bottom: 12px; }
.tx-info-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 10px; }
.tx-info-item { display: flex; flex-direction: column; gap: 4px; }
.tx-info-label { font-size: 10px; color: var(--dim); }
.tx-info-val { font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700; }

.kb { font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 800; width: fit-content; }
.kb-ok { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }

.amt-input { color: var(--blue); font-weight: 800; font-size: 15px; }

.popup-textarea { min-height: 80px; resize: vertical; }

.info-box { border-radius: 8px; padding: 12px; font-size: 11px; display: flex; gap: 10px; line-height: 1.4; }
.info-amber { background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.2); color: #F59E0B; }

.btn-primary-grad {
  background: linear-gradient(135deg, var(--blue), var(--purple));
  color: white;
  border: none;
}
.btn-primary-grad:disabled { opacity: 0.3; }
</style>