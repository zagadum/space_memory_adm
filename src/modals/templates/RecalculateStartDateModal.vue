<template>
  <BaseModal popupClass="popup-recalculate">
    <div class="popup-title">🗓️ {{ t("recalculateStartDate.title") }}</div>
    <div class="popup-sub">{{ t("recalculateStartDate.subtitle") }}</div>

    <div class="info-box info-blue">
      <span>💡</span>
      <div>{{ t("recalculateStartDate.description") }}</div>
    </div>

    <div class="input-group">
      <label class="popup-label">{{ t("recalculateStartDate.startDateLabel") }}</label>
      <input type="date" class="popup-input" v-model="startDate" />
    </div>

    <div class="info-box info-amber">
      <span>⚠️</span>
      <div>{{ t("recalculateStartDate.warning") }}</div>
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close" :disabled="saving">{{ t("common.cancel") }}</button>
      <div v-if="errorMessage" class="info-box info-red" style="margin-bottom:8px;font-size:11px"><span>⚠️</span><div>{{ errorMessage }}</div></div>
      <button class="btn btn-primary" :disabled="saving || !startDate" @click="save">
        {{ saving ? t("common.saving") : t("recalculateStartDate.submit") }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseModal from "../BaseModal.vue";
import { usePaymentsStore } from "../../stores/payments.store";
import { useModalStore } from "../../stores/modal.store";
import { paymentsApi } from "../../api/paymentsApi";

const { t } = useI18n();
const paymentsStore = usePaymentsStore();
const modal = useModalStore();

const startDate = ref("");
const saving = ref(false);
const errorMessage = ref("");

function close() {
  modal.close();
}

async function save() {
  if (!startDate.value) return;
  saving.value = true;
  errorMessage.value = "";
  try {
    await paymentsApi.recalculateStartDate({
      programId: modal.payload?.programId as string,
      startDate: startDate.value,
    });
    await paymentsStore.reloadCurrent();
    modal.close();
  } catch (e: unknown) {
    errorMessage.value = e instanceof Error ? e.message : "Operation failed. Please try again.";
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.popup-recalculate { max-width: 460px; }
.popup-title { font-size: 15px; font-weight: 800; margin-bottom: 4px; }
.popup-sub { font-size: 12px; color: var(--dim); margin-bottom: 16px; line-height: 1.5; }

.input-group { margin-bottom: 16px; }
.popup-label { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--dim); margin-bottom: 5px; display: block; }
.popup-input {
  width: 100%;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--b);
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--white);
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  outline: none;
  transition: border-color .2s;
}
.popup-input:focus { border-color: var(--blue); }

.info-box { border-radius: 8px; padding: 10px 12px; font-size: 11.5px; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px; line-height: 1.5; }
.info-blue { background: rgba(79,110,247,.08); border: 1px solid rgba(79,110,247,.2); color: var(--dim); }
.info-amber { background: rgba(245,158,11,.07); border: 1px solid rgba(245,158,11,.22); color: var(--amber); }
.info-red { background: rgba(239,68,68,.07); border: 1px solid rgba(239,68,68,.2); color: var(--red); }

.popup-actions { display: flex; gap: 10px; margin-top: 20px; }
.btn { flex: 1; padding: 11px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s; }
.btn-ghost { background: rgba(255,255,255,.05); color: var(--dim); border: 1px solid var(--b); }
.btn-primary { background: var(--blue); color: var(--white); font-weight: 700; }
.btn-primary:hover:not(:disabled) { background: #5a7fff; }
.btn:disabled { opacity: 0.3; cursor: not-allowed; }
</style>
