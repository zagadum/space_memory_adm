<template>
  <BaseModal popupClass="popup-tariff">
    <div class="popup-title">{{ t("modals.tariff.titleFull") }}</div>
    <div class="popup-sub">{{ programName }} · {{ t("modals.tariff.currentTariffSub") }} {{ currentTariff }} {{ t("modals.tariff.perMonth") }}</div>

    <!-- ── С какого месяца ── -->
    <label class="popup-label">{{ t("modals.tariff.fromMonthLabel") }}</label>
    <div class="month-selector">
      <button
        v-for="(m, i) in months"
        :key="i"
        class="ms-btn"
        :class="{ active: selectedMonth === i }"
        @click="selectedMonth = i"
      >{{ m }}</button>
    </div>

    <!-- ── Новый тариф ── -->
    <div class="popup-2col">
      <div>
        <label class="popup-label">{{ t("modals.tariff.newTariffLabel") }}</label>
        <div class="input-with-icon">
          <span class="icon">💰</span>
          <input class="popup-input" type="number" min="0" v-model.number="newTariff" />
        </div>
      </div>
      <div>
        <label class="popup-label">{{ t("modals.tariff.reasonLabel") }}</label>
        <select class="popup-input" v-model="reason">
          <option value="index">{{ t("modals.tariff.reasons.index") }}</option>
          <option value="promo">{{ t("modals.tariff.reasons.promo") }}</option>
          <option value="group-change">{{ t("modals.tariff.reasons.groupChange") }}</option>
          <option value="individual">{{ t("modals.tariff.reasons.individual") }}</option>
          <option value="other">{{ t("modals.tariff.reasons.other") }}</option>
        </select>
      </div>
    </div>

    <!-- ── Calc Preview ── -->
    <div class="tariff-preview" v-if="newTariff > 0">
      <div class="tp-title">{{ t("modals.tariff.calcTitle") }}</div>
      <div class="tp-grid">
        <div class="tp-card">
          <div class="tp-lbl">{{ t("modals.tariff.currentLabel") }}</div>
          <div class="tp-val">{{ currentTariff }} zł</div>
        </div>
        <div class="tp-card">
          <div class="tp-lbl">{{ t("modals.tariff.diffLabel") }}</div>
          <div class="tp-val" :style="{ color: diffColor }">
            {{ diff > 0 ? '+' : '' }}{{ diff }} zł
          </div>
        </div>
        <div class="tp-card tp-card-hl" :style="{ borderColor: diffColor + '40' }">
          <div class="tp-lbl">{{ t("modals.tariff.newLabel") }}</div>
          <div class="tp-val" :style="{ color: diffColor }">{{ newTariff }} zł</div>
        </div>
      </div>

      <!-- per-lesson breakdown -->
      <div class="tp-sub">
        {{ t("modals.tariff.perLessonText") }} {{ currentTariff }} ÷ 4 = <strong>{{ perLesson }} zł</strong> →
        {{ newTariff }} ÷ 4 = <strong :style="{ color: diffColor }">{{ newPerLesson }} zł</strong>
      </div>
    </div>

    <!-- ── Комментарий ── -->
    <div style="margin-top:12px">
      <label class="popup-label">{{ t("modals.tariff.commentLabel") }}</label>
      <div class="input-with-icon">
        <span class="icon">💬</span>
        <input class="popup-input" v-model="comment" :placeholder="t('modals.tariff.commentPlaceholder')" />
      </div>
    </div>

    <!-- ── Warning ── -->
    <div class="info-box info-amber" v-if="diff !== 0">
      {{ t("modals.tariff.warning", { month: MONTHS_F[selectedMonth], year: activeYear }) }}
    </div>

    <!-- ── Actions ── -->
    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close" :disabled="saving">{{ t("modals.tariff.cancel") }}</button>
      <div v-if="errorMessage" class="info-box info-red" style="margin-bottom:8px;font-size:11px"><span>⚠️</span><div>{{ errorMessage }}</div></div>
      <button
        class="btn btn-amber-grad"
        :disabled="saving || newTariff <= 0 || diff === 0"
        @click="save"
      >
        {{ saving ? t('modals.tariff.saving') : t('modals.tariff.submit') }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import BaseModal from "../BaseModal.vue";
import { useModalStore } from "../../stores/modal.store";
import { usePaymentsStore } from "../../stores/payments.store";
import { paymentsApi } from "../../api/paymentsApi";

const { t } = useI18n();
const modal = useModalStore();
const payments = usePaymentsStore();

const programId = (modal.payload?.programId ?? "space") as string;

const programName = computed(() => {
  const p = payments.programs.find(x => x.id === programId);
  return p?.name || programId;
});

const currentTariff = computed(() => {
  const p = payments.programs.find(x => x.id === programId);
  return p?.tariff || 490;
});

const activeYear = computed(() => payments.activeYear[programId] || 2026);

// ── Form state ──
const months = computed(() => (t('common.monthsShort') as unknown as string[]));
const MONTHS_F = computed(() => (t('payments.monthsFull') as unknown as string[]) || months.value);

const selectedMonth = ref((modal.payload?.monthIndex as number) ?? new Date().getMonth());
const newTariff = ref(currentTariff.value);
const reason = ref("index");
const comment = ref("");
const saving = ref(false);
const errorMessage = ref('');

// ── Calculations ──
const diff = computed(() => newTariff.value - currentTariff.value);
const diffColor = computed(() => {
  if (diff.value < 0) return "var(--green)";
  if (diff.value > 0) return "var(--red)";
  return "var(--dim)";
});
const perLesson = computed(() => Math.round(currentTariff.value / 4 * 100) / 100);
const newPerLesson = computed(() => Math.round(newTariff.value / 4 * 100) / 100);

// ── Actions ──
function close() { modal.close(); }

async function save() {
  saving.value = true;
  errorMessage.value = '';
  try {
    // Simulated API call — replace with real API in production
    await new Promise(r => setTimeout(r, 600));
    // Reload store data after successful mutation
    await payments.loadStudent();
    modal.close();
  } catch (e: unknown) {
    errorMessage.value = e instanceof Error ? e.message : 'Operation failed. Please try again.';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.popup-tariff { max-width: 480px; }
.popup-title { font-size: 16px; font-weight: 800; margin-bottom: 4px; }
.popup-sub { font-size: 12px; color: var(--dim); margin-bottom: 16px; }

.popup-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  color: var(--dim); margin-bottom: 5px; letter-spacing: .5px; display: block;
}

/* inputs */
.input-with-icon { position: relative; display: flex; align-items: center; }
.input-with-icon .icon { position: absolute; left: 12px; font-size: 14px; z-index: 1; opacity: .7; }
.input-with-icon .popup-input { padding-left: 36px; }

.popup-input {
  background: rgba(255,255,255,.04);
  border: 1px solid var(--b);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--white);
  width: 100%;
  outline: none;
  font-family: inherit;
  font-size: 13px;
}
.popup-input:focus { border-color: var(--cyan); background: rgba(255,255,255,.08); }

.popup-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

/* month selector */
.month-selector { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; margin-bottom: 14px; }
.ms-btn {
  padding: 6px 3px; border-radius: 7px; font-size: 11px; font-weight: 600;
  text-align: center; cursor: pointer; border: 1px solid var(--b);
  background: transparent; color: var(--dim); transition: all .15s;
  font-family: 'Outfit', sans-serif;
}
.ms-btn:hover { border-color: var(--bh); color: var(--white); }
.ms-btn.active { background: rgba(79,110,247,.15); border-color: rgba(79,110,247,.4); color: var(--blue); }

/* tariff preview */
.tariff-preview {
  margin-top: 14px;
  padding: 14px;
  background: linear-gradient(145deg, rgba(245,158,11,.06), rgba(245,158,11,.02));
  border: 1px solid rgba(245,158,11,.18);
  border-radius: 11px;
  animation: fadeIn .18s ease;
}
.tp-title {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  color: var(--amber); margin-bottom: 10px; letter-spacing: .5px;
}
.tp-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
.tp-card {
  background: rgba(255,255,255,.03);
  border: 1px solid var(--b);
  border-radius: 9px;
  padding: 10px;
  text-align: center;
}
.tp-card-hl { border-width: 2px; }
.tp-lbl { font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--dim); margin-bottom: 4px; }
.tp-val { font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700; }
.tp-sub { font-size: 11px; color: var(--dim); margin-top: 10px; text-align: center; line-height: 1.5; }

/* info box */
.info-box {
  border-radius: 8px; padding: 9px 12px; font-size: 11px;
  margin-top: 10px; line-height: 1.5;
}
.info-amber {
  background: rgba(245,158,11,.06);
  border: 1px solid rgba(245,158,11,.2);
  color: var(--amber);
}

/* actions */
.popup-actions { display: flex; gap: 10px; margin-top: 18px; }
.btn {
  flex: 1; padding: 11px; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  border: none; transition: .2s;
}
.btn-ghost { background: rgba(255,255,255,.05); color: var(--dim); border: 1px solid var(--b); }
.btn-amber-grad { background: linear-gradient(135deg, var(--amber), #d97706); color: #000; font-weight: 700; }
.btn-amber-grad:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
.btn:disabled { opacity: .3; cursor: not-allowed; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
