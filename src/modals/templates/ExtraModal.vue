<template>
  <BaseModal popupClass="popup-extra">
    <div class="popup-title">{{ t("modals.extra.title") }}</div>
    <div class="popup-sub">{{ programName }} · {{ currentTeacher }}</div>

    <!-- ── Месяц ── -->
    <label class="popup-label">{{ t("modals.extra.monthLabel") }}</label>
    <div class="month-selector">
      <button
        v-for="(m, i) in months"
        :key="i"
        class="ms-btn"
        :class="{ active: selectedMonth === i }"
        @click="selectedMonth = i"
      >{{ m }}</button>
    </div>

    <!-- ── Учитель ── -->
    <label class="popup-label">{{ t("modals.extra.teacherLabel") }}</label>
    <select class="popup-input" v-model="selectedTeacher">
      <option value="ak">{{ currentTeacher }} ({{ t("modals.extra.mainTrainer") }})</option>
      <option value="mw">Marek Wójcik</option>
      <option value="qa">{{ t("modals.extra.qualityDept") }}</option>
      <option value="other">{{ t("modals.extra.otherTeacher") }}</option>
    </select>

    <!-- ── Info box (price breakdown) ── -->
    <div class="info-box info-blue">
      <span>💡</span>
      <div>
        {{ t("modals.extra.priceInfo") }} <strong style="color:var(--white)">{{ basePrice }} zł</strong><br>
        {{ t("modals.extra.afterAutoDisc") }} (<span class="dc dc-auto">{{ t("modals.extra.autoDiscLabel") }}</span>): <strong style="color:var(--green)">≈ {{ afterAutoDisc }} zł</strong><br>
        <span style="font-size:10.5px">{{ t("modals.extra.separateTx") }}</span>
      </div>
    </div>

    <!-- ── Calc Preview ── -->
    <div class="calc-preview">
      <div class="cp">
        <div class="cp-label">{{ t("modals.extra.basePrice") }}</div>
        <div class="cp-val">{{ basePrice }} zł</div>
      </div>
      <div class="cp" style="border-color:rgba(239,68,68,.2)">
        <div class="cp-label">{{ t("modals.extra.autoDiscount") }}</div>
        <div class="cp-val" style="color:var(--red)">−{{ autoDiscount }} zł</div>
      </div>
      <div class="cp" style="border-color:rgba(236,72,153,.3)">
        <div class="cp-label">{{ t("modals.extra.toPay") }}</div>
        <div class="cp-val" style="color:var(--pink)">{{ finalPrice }} zł</div>
      </div>
    </div>

    <!-- ── Тема ── -->
    <label class="popup-label">{{ t("modals.extra.topicLabel") }} <span style="font-size:10px;font-weight:400;color:var(--dim)">({{ t("modals.extra.topicHint") }})</span></label>
    <input class="popup-input" v-model="topic" :placeholder="t('modals.extra.topicPlaceholder')" />

    <!-- ── Доп. скидка ── -->
    <div class="extra-disc-section">
      <label class="popup-label">{{ t("modals.extra.extraDiscLabel") }} <span style="font-size:10px;font-weight:400;color:var(--dim)">({{ t("modals.extra.extraDiscHint") }})</span></label>
      <input type="number" class="popup-input" v-model.number="extraDisc" min="0" :placeholder="t('modals.extra.extraDiscPlaceholder')" />

      <div v-if="Number(extraDisc) > 0" class="fade-in">
        <div class="info-box info-amber" style="margin-bottom:8px">
          <span>⚠️</span>
          <div>{{ t("modals.extra.extraDiscWarning") }} <strong style="color:var(--white)">{{ t("modals.extra.approvalRequired") }}</strong>.</div>
        </div>

        <label class="popup-label">{{ t("modals.extra.discReasonLabel") }} <span style="color:var(--red)">★</span></label>
        <input class="popup-input" v-model="discReason" :placeholder="t('modals.extra.discReasonPlaceholder')" />

        <label class="popup-label">{{ t("modals.extra.approverLabel") }} <span style="color:var(--red)">★</span></label>
        <div class="approver-grid">
          <div class="reason-opt" :class="{ active: approver === 'account' }" @click="approver = 'account'">
            <input type="radio" :checked="approver === 'account'" style="accent-color:var(--blue); pointer-events: none;" />
            <div><div style="font-weight:700;font-size:11.5px">{{ t("modals.extra.approverAccount") }}</div></div>
          </div>
          <div class="reason-opt" :class="{ active: approver === 'dir' }" @click="approver = 'dir'">
            <input type="radio" :checked="approver === 'dir'" style="accent-color:var(--blue); pointer-events: none;" />
            <div><div style="font-weight:700;font-size:11.5px">{{ t("modals.extra.approverDirector") }}</div></div>
          </div>
        </div>

        <!-- Updated calc with extra discount -->
        <div class="calc-preview" style="margin-top:10px">
          <div class="cp">
            <div class="cp-label">{{ t("modals.extra.afterAuto") }}</div>
            <div class="cp-val">{{ afterAutoDisc }} zł</div>
          </div>
          <div class="cp" style="border-color:rgba(168,85,247,.2)">
            <div class="cp-label">{{ t("modals.extra.extraDiscCalc") }}</div>
            <div class="cp-val" style="color:var(--purple)">−{{ extraDisc }} zł</div>
          </div>
          <div class="cp" style="border-color:rgba(16,185,129,.3)">
            <div class="cp-label">{{ t("modals.extra.totalCalc") }}</div>
            <div class="cp-val" style="color:var(--green)">{{ finalPrice }} zł</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Actions ── -->
    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close" :disabled="saving">{{ t("modals.extra.cancel") }}</button>
      <div v-if="errorMessage" class="info-box info-red" style="margin-bottom:8px;font-size:11px"><span>⚠️</span><div>{{ errorMessage }}</div></div>
      <button class="btn btn-pink" @click="save" :disabled="saving">
        {{ saving ? t('modals.extra.saving') : t('modals.extra.submit') }}
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

const currentTeacher = computed(() => {
  const p = payments.programs.find(x => x.id === programId);
  return p?.sub?.match(/·\s*([^·]+?)\s*·\s*\d/)?.[1]?.trim() || "Anna Kowalska";
});

// ── Form state ──
const months = computed(() => (t('common.monthsShort') as unknown as string[]));
const selectedMonth = ref(new Date().getMonth());
const selectedTeacher = ref("ak");
const topic = ref("");
const extraDisc = ref<number | "">(0);
const discReason = ref("");
const approver = ref("account");
const saving = ref(false);
const errorMessage = ref('');

// ── Calculations (dynamic from store tariff) ──
const AUTO_DISC_PERCENT = 20;

const basePrice = computed(() => Math.round(currentTariff.value / 4 * 100) / 100);
const autoDiscount = computed(() => Math.round(basePrice.value * AUTO_DISC_PERCENT / 100 * 100) / 100);
const afterAutoDisc = computed(() => Math.round((basePrice.value - autoDiscount.value) * 100) / 100);

const finalPrice = computed(() => {
  const disc = typeof extraDisc.value === "number" ? extraDisc.value : 0;
  return Math.max(0, Math.round((afterAutoDisc.value - disc) * 100) / 100);
});

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
.popup-extra { max-width: 480px; }
.popup-title { font-size: 16px; font-weight: 800; margin-bottom: 4px; }
.popup-sub { font-size: 12px; color: var(--dim); margin-bottom: 14px; }

.popup-label {
  font-size: 10px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: var(--dim); margin-bottom: 5px; display: block;
}

.popup-input {
  width: 100%; background: rgba(255,255,255,.04);
  border: 1px solid var(--b); border-radius: 8px;
  padding: 8px 12px; color: var(--white);
  font-family: 'Outfit', sans-serif; font-size: 13px;
  outline: none; transition: border-color .2s; margin-bottom: 12px;
}
.popup-input:focus { border-color: var(--blue); }

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

/* info boxes */
.info-box {
  border-radius: 8px; padding: 9px 12px; font-size: 11.5px;
  margin-bottom: 12px; display: flex; align-items: flex-start;
  gap: 8px; line-height: 1.5;
}
.info-blue { background: rgba(79,110,247,.07); border: 1px solid rgba(79,110,247,.2); color: var(--dim); }
.info-amber { background: rgba(245,158,11,.07); border: 1px solid rgba(245,158,11,.22); color: var(--amber); }

.dc-auto {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;
  background: rgba(239,68,68,.1); color: var(--red);
}

/* calc preview */
.calc-preview { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 12px; }
.cp {
  background: rgba(255,255,255,.03);
  border: 1px solid var(--b);
  border-radius: 9px; padding: 10px; text-align: center;
}
.cp-label {
  font-size: 9.5px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: var(--dim); margin-bottom: 5px;
}
.cp-val { font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700; }

/* extra discount section */
.extra-disc-section {
  border-top: 1px solid var(--b);
  padding-top: 12px; margin-top: 4px;
}

/* approver grid */
.approver-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
.reason-opt {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 11px; background: rgba(255,255,255,.03);
  border: 1px solid var(--b); border-radius: 9px;
  cursor: pointer; transition: all .15s;
}
.reason-opt:hover { border-color: var(--bh); }
.reason-opt.active { border-color: rgba(79,110,247,.5); background: rgba(79,110,247,.1); }

/* actions */
.popup-actions { display: flex; gap: 8px; margin-top: 16px; }
.btn {
  flex: 1; display: inline-flex; justify-content: center; align-items: center; gap: 5px;
  padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 600;
  font-family: 'Outfit', sans-serif; cursor: pointer; border: none; transition: all .15s;
}
.btn-ghost { background: rgba(255,255,255,.05); color: var(--dim); border: 1px solid var(--b); }
.btn-ghost:hover:not(:disabled) { background: rgba(255,255,255,.08); color: var(--white); }
.btn-pink { background: rgba(236,72,153,.1); color: var(--pink); border: 1px solid rgba(236,72,153,.28); }
.btn-pink:hover:not(:disabled) { background: rgba(236,72,153,.18); transform: translateY(-1px); }
.btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

.fade-in { animation: fadeIn .2s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>
