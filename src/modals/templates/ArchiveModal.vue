<template>
  <BaseModal popupClass="popup-archive">
    <div class="popup-title">📦 {{ t("modals.archive.title") }}</div>
    <div class="popup-sub">{{ t("modals.archive.subtitle") }}</div>

    <div class="info-box info-red">
      <span>⚠️</span>
      <div><strong>{{ t("modals.archive.warningTitle") }}</strong> {{ t("modals.archive.warning") }}</div>
    </div>

    <div style="margin-bottom: 16px;">
      <div class="popup-label">{{ t("modals.archive.endDateLabel") }} <span style="color:var(--red)">*</span></div>
      <div class="input-with-icon">
        <span class="icon">📅</span>
        <input class="popup-input" type="date" v-model="endDate" />
      </div>
    </div>

    <div style="margin-bottom: 16px;">
      <div class="popup-label">{{ t("modals.archive.reasonLabel") }} <span style="color:var(--red)">*</span></div>
      <select class="popup-input" v-model="reason">
        <option value="" disabled>{{ t("modals.archive.selectPlaceholder") }}</option>
        <option value="finished">{{ t("modals.archive.archiveReasons.finished") }}</option>
        <option value="relocation">{{ t("modals.archive.archiveReasons.relocation") }}</option>
        <option value="schedule">{{ t("modals.archive.archiveReasons.schedule") }}</option>
        <option value="financial">{{ t("modals.archive.archiveReasons.financial") }}</option>
        <option value="quality">{{ t("modals.archive.archiveReasons.quality") }}</option>
        <option value="other">{{ t("modals.archive.archiveReasons.other") }}</option>
      </select>
    </div>

    <div style="margin-bottom: 20px;">
      <div class="popup-label">{{ t("modals.archive.commentLabel") }}</div>
      <textarea 
        class="popup-input popup-textarea" 
        v-model="comment" 
        :placeholder="t('modals.archive.commentPlaceholder')"
      ></textarea>
    </div>

    <div style="margin-bottom: 16px;">
      <div class="popup-label">{{ t("modals.archive.futureActionLabel") }}</div>
      <select class="popup-input" v-model="futureAction">
        <option value="keep_credit">{{ t("modals.archive.futureActions.keepCredit") }}</option>
        <option value="refund">{{ t("modals.archive.futureActions.refund") }}</option>
        <option value="transfer">{{ t("modals.archive.futureActions.transfer") }}</option>
      </select>
    </div>

    <div class="info-box info-neutral">
      <span>ℹ️</span>
      <div>{{ futureActionDescription }}</div>
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close" :disabled="saving">{{ t("common.cancel") }}</button>
      <div v-if="errorMessage" class="info-box info-red" style="margin-bottom:0;font-size:11px;flex:1 1 100%"><span>⚠️</span><div>{{ errorMessage }}</div></div>
      <button class="btn btn-red-grad" :disabled="saving || !isValid" @click="confirm">
        {{ saving ? t("common.saving") : t('modals.archive.submit') }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import BaseModal from "../BaseModal.vue";
import { useModalStore } from "../../stores/modal.store";
import { usePaymentsStore } from "../../stores/payments.store";
import { paymentsApi } from "../../api/paymentsApi";
import type { ArchivePayload } from "../../api/paymentsApi";

const { t } = useI18n();
const modal = useModalStore();
const paymentsStore = usePaymentsStore();

const payload = modal.payload;
const programId = payload?.programId as string | undefined;

const endDate = ref(new Date().toISOString().split('T')[0]); // По умолчанию сегодня
const reason = ref("");
const comment = ref("");
const futureAction = ref<"keep_credit" | "refund" | "transfer">("keep_credit");
const saving = ref(false);
const errorMessage = ref("");

const isValid = computed(() => {
  return endDate.value !== "" && reason.value !== "";
});

const futureActionDescription = computed(() => {
  return t(`modals.archive.futureActionDescriptions.${futureAction.value}`);
});

function close(){ modal.close(); }

async function confirm(){
  if (!programId) return close();
  saving.value = true;
  errorMessage.value = "";
  try{
    const payload: ArchivePayload = {
      programId,
      endDate: endDate.value,
      reason: reason.value,
      comment: comment.value,
    };
    (payload as ArchivePayload & { futureAction?: "keep_credit" | "refund" | "transfer" }).futureAction = futureAction.value;
    await paymentsApi.archive(payload);
    await paymentsStore.reloadCurrent();
    modal.close();
  } catch (e: unknown) {
    errorMessage.value = e instanceof Error ? e.message : t("common.error");
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
:deep(.popup-archive) { max-width: 420px; }

.info-box { 
  border-radius: 10px; 
  padding: 12px 16px; 
  font-size: 11px; 
  display: flex; 
  gap: 12px; 
  line-height: 1.5; 
  margin-bottom: 20px;
  background: rgba(239, 68, 68, 0.08); 
  border: 1px solid rgba(239, 68, 68, 0.2); 
  color: #fca5a5;
}

.info-neutral {
  background: rgba(79, 110, 247, 0.08);
  border: 1px solid rgba(79, 110, 247, 0.2);
  color: var(--dim);
}

.input-with-icon { position: relative; display: flex; align-items: center; }
.input-with-icon .icon { position: absolute; left: 12px; font-size: 14px; opacity: 0.8; }
.input-with-icon .popup-input { padding-left: 38px; }

.popup-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--dim); margin-bottom: 6px; letter-spacing: 0.05em; }

.popup-input { 
  background: rgba(255,255,255,.03); 
  border: 1px solid var(--b); 
  border-radius: 8px; 
  padding: 10px 12px; 
  color: var(--white); 
  width: 100%; 
  outline: none; 
  font-family: inherit;
  font-size: 13px;
  transition: .2s;
}
.popup-input:focus { border-color: var(--red); background: rgba(255,255,255,.06); }

.popup-textarea { min-height: 90px; resize: vertical; line-height: 1.5; }

.popup-actions { display: flex; gap: 10px; margin-top: 25px; }
.btn { flex: 1; padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: .2s; }
.btn-ghost { background: rgba(255,255,255,.05); color: var(--dim); }

.btn-red-grad { 
  background: linear-gradient(135deg, #ef4444, #991b1b); 
  color: white; 
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}
.btn-red-grad:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); box-shadow: 0 6px 15px rgba(239, 68, 68, 0.3); }
.btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none !important; }
</style>