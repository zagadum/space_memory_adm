<template>
  <BaseModal popupClass="popup-edit-invoice">
    <div class="popup-title">🧾 {{ t("modals.invoice.title") }}</div>
    <div class="popup-sub">{{ t("modals.invoice.subtitle") }}</div>

    <div class="popup-2col">
      <div>
        <div class="popup-label">{{ t("modals.invoice.fvnum") }}</div>
        <input class="popup-input" v-model="fv" placeholder="FV/2026/03/..." />
      </div>
      <div>
        <div class="popup-label">{{ t("modals.invoice.issueDate") }}</div>
        <input class="popup-input" type="date" v-model="issueDate" />
      </div>
    </div>

    <div class="popup-2col">
      <div>
        <div class="popup-label">{{ t("modals.invoice.serviceTypeLabel") }}</div>
        <select class="popup-input" v-model="serviceType" @change="onTypeChange">
          <option value="lang_course">{{ t("modals.invoice.serviceTypes.langCourse") }}</option>
          <option value="bonus">{{ t("modals.invoice.serviceTypes.bonus") }}</option>
          <option value="custom">{{ t("modals.invoice.serviceTypes.custom") }}</option>
        </select>
      </div>
      <div>
        <div class="popup-label">{{ t("modals.invoice.payDueLabel") }}</div>
        <input class="popup-input" type="date" v-model="payDate" />
      </div>
    </div>

    <div>
      <div class="popup-label">{{ t("modals.invoice.serviceTextLabel") }}</div>
      <input 
        class="popup-input" 
        v-model="serviceName" 
        :disabled="serviceType !== 'custom'"
        :style="{ opacity: serviceType !== 'custom' ? 0.6 : 1 }"
        :placeholder="t('modals.invoice.serviceTextPlaceholder')"
      />
    </div>

    <div class="popup-2col">
      <div>
        <div class="popup-label">{{ t("modals.invoice.periodLabel") }}</div>
        <div style="display:flex; gap:5px">
          <select class="popup-input" style="flex:2" v-model="targetMonth">
            <option v-for="(m, i) in MONTHS" :key="i" :value="i">{{ m }}</option>
          </select>
          <input class="popup-input" style="flex:1" v-model="targetYear" placeholder="2026" />
        </div>
      </div>
      <div>
        <div class="popup-label">{{ t("modals.invoice.totalAmountLabel") }}</div>
        <input class="popup-input amt-input" v-model="amount" />
      </div>
    </div>

    <div class="client-card">
      <div class="client-card-title">{{ t("modals.invoice.buyerTitle") }}</div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px">
        <div>
          <div class="popup-label">{{ t("modals.invoice.buyerName") }}</div>
          <input class="popup-input input-sm" v-model="buyerName" />
        </div>
        <div>
          <div class="popup-label">{{ t("modals.invoice.buyerNip") }}</div>
          <input class="popup-input input-sm" v-model="buyerNip" placeholder="—" />
        </div>
      </div>
      <div style="margin-top:8px">
        <div class="popup-label">{{ t("modals.invoice.buyerAddress") }}</div>
        <input class="popup-input input-sm" v-model="buyerAddress" />
      </div>
    </div>

    <div class="info-box info-amber">
      <span>⚠️</span>
      <div>{{ t("modals.invoice.ksefWarning") }}</div>
    </div>

    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">{{ t("common.cancel") }}</button>
      <div v-if="errorMessage" class="info-box info-red" style="margin-bottom:8px;font-size:11px"><span>⚠️</span><div>{{ errorMessage }}</div></div>
      <button class="btn btn-primary" :disabled="saving" @click="save">
        {{ saving ? t("common.saving") : t('modals.invoice.saveChanges') }}
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

const MONTHS = computed(() => (t('payments.monthsFull') as unknown as string[]));

const payload = modal.payload as any;
const programId = payload?.programId;
const tx = payload?.tx || {};

// Поля формы
const fv = ref(tx.fvnum || "");
const issueDate = ref(payload?.issueDate || new Date().toISOString().split('T')[0]);
const payDate = ref(payload?.payDate || new Date().toISOString().split('T')[0]);
const amount = ref(tx.amount || "0.00");

// Логика типа услуги
const serviceType = ref("lang_course");
const serviceName = ref("Курс иностранных языков");

// Период
const targetMonth = ref(payload?.monthIndex ?? new Date().getMonth());
const targetYear = ref(payload?.year ?? "2026");

// Данные клиента
const buyerName = ref(payload?.clientName || "Jan Kowalski");
const buyerAddress = ref(payload?.clientAddress || "ul. Marszałkowska 1, 00-001 Warszawa");
const buyerNip = ref(payload?.clientNip || "");

const saving = ref(false);
const errorMessage = ref('');

function onTypeChange() {
  if (serviceType.value === 'lang_course') serviceName.value = "Курс иностранных языков";
  else if (serviceType.value === 'bonus') serviceName.value = "Дополнительные / Бонусные занятия";
}

function close(){ modal.close(); }

async function save() {
  saving.value = true;
  errorMessage.value = '';
  try {
    // Simulated API call — replace with real API in production
    await new Promise(r => setTimeout(r, 600));
    // Reload store data after successful mutation
    await paymentsStore.loadStudent();
    modal.close();
  } catch (e: unknown) {
    errorMessage.value = e instanceof Error ? e.message : 'Operation failed. Please try again.';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.popup-edit-invoice { max-width: 520px; }
.popup-title { font-size: 16px; font-weight: 800; margin-bottom: 4px; }
.popup-sub { font-size: 12px; color: var(--dim); margin-bottom: 16px; }

.popup-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }

.popup-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--dim); margin-bottom: 5px; }

.popup-input { 
  background: rgba(255,255,255,.04); 
  border: 1px solid var(--b); 
  border-radius: 8px; 
  padding: 9px 12px; 
  color: var(--white); 
  font-family: inherit; 
  width: 100%; 
  outline: none; 
  font-size: 13px;
}
.popup-input:focus { border-color: var(--blue); background: rgba(255,255,255,.07); }

.amt-input { color: var(--green); font-family: 'Space Mono', monospace; font-weight: 700; font-size: 15px; }

.client-card { 
  background: rgba(255,255,255,.02); 
  border: 1px solid var(--b); 
  border-radius: 10px; 
  padding: 12px; 
  margin: 15px 0;
}
.client-card-title { font-size: 11px; font-weight: 800; color: var(--blue); text-transform: uppercase; margin-bottom: 10px; }
.input-sm { padding: 6px 10px; font-size: 12px; }

.info-box { border-radius: 8px; padding: 10px 12px; font-size: 11px; display: flex; gap: 10px; line-height: 1.4; margin-bottom: 15px; }
.info-amber { background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.2); color: #d4a017; }

.popup-actions { display: flex; gap: 10px; margin-top: 20px; }
.btn { flex: 1; padding: 11px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: .2s; }
.btn-ghost { background: rgba(255,255,255,.05); color: var(--dim); }
.btn-primary { background: linear-gradient(135deg, var(--blue), var(--purple)); color: white; }
.btn:hover { filter: brightness(1.2); }
</style>