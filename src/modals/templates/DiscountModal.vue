<template>
  <BaseModal popupClass="popup-discount">
    <div class="popup-title">{{ t('modals.discount.title') }}</div>
    <div class="popup-sub">{{ programLabel }} · {{ studentName }}</div>

    <!-- ── Выберите месяц ── -->
    <label class="popup-label">{{ t('modals.discount.selectMonth') }}</label>
    <div class="month-selector">
      <button
        v-for="(m, i) in MONTHS_SHORT"
        :key="i"
        class="ms-btn"
        :class="{ active: selectedMonth === i, disabled: isMonthDisabled(i) }"
        :disabled="isMonthDisabled(i)"
        @click="selectedMonth = i"
      >{{ m }}</button>
    </div>

    <!-- ── Тип + Значение ── -->
    <div class="popup-2col">
      <div>
        <label class="popup-label">{{ t('modals.discount.type') }}</label>
        <select class="popup-input" v-model="discountType" @change="calcDisc" style="margin-bottom:0">
          <option value="fixed">{{ t('modals.discount.fixedSum') }}</option>
          <option value="pct">{{ t('modals.discount.percent') }}</option>
        </select>
      </div>
      <div>
        <label class="popup-label">{{ t('modals.discount.value') }}</label>
        <input
          type="number"
          class="popup-input"
          v-model.number="discountValue"
          :placeholder="t('modals.discount.valuePlaceholder')"
          @input="calcDisc"
          style="margin-bottom:0"
        />
      </div>
    </div>

    <!-- ── Info: auto-discounts ── -->
    <div class="info-box info-green" style="margin-top:12px">
      <span>🔖</span>
      <div>{{ t('modals.discount.activeAuto') }} <span class="dc dc-family">−10% {{ t('payments.disc.family').toLowerCase() }}</span> <span class="dc dc-referral">−10% polecenie</span><br>
      <span style="font-size:10.5px">{{ t('modals.discount.orderInfo') }}</span></div>
    </div>

    <!-- ── Calc preview ── -->
    <div class="calc-preview">
      <div class="cp">
        <div class="cp-label">{{ t('modals.discount.baseTariff') }}</div>
        <div class="cp-val">{{ baseTariff }} zł</div>
      </div>
      <div class="cp" style="border-color:rgba(239,68,68,.2)">
        <div class="cp-label">{{ t('modals.discount.totalDiscounts') }}</div>
        <div class="cp-val" style="color:var(--red)">−{{ discountAmount }} zł</div>
      </div>
      <div class="cp" style="border-color:rgba(16,185,129,.2)">
        <div class="cp-label">{{ t('modals.discount.toPay') }}</div>
        <div class="cp-val" style="color:var(--green)">{{ finalAmount }} zł</div>
      </div>
    </div>

    <!-- ── Причина скидки ── -->
    <label class="popup-label">{{ t('modals.discount.reason') }}</label>
    <div class="reason-grid">
      <div
        class="reason-opt"
        :class="{ active: selectedReason === 'loyalty' }"
        @click="setReason('loyalty')"
      >
        <input type="radio" name="dr" :checked="selectedReason === 'loyalty'" style="accent-color:var(--blue)" />
        <div>
          <div style="font-weight:700">{{ t('modals.discount.reasons.loyalty') }}</div>
          <div style="font-size:10.5px;color:var(--dim)">{{ t('modals.discount.reasons.loyaltyDesc') }}</div>
        </div>
      </div>
      <div
        class="reason-opt"
        :class="{ active: selectedReason === 'referral' }"
        @click="setReason('referral')"
      >
        <input type="radio" name="dr" :checked="selectedReason === 'referral'" style="accent-color:var(--blue)" />
        <div>
          <div style="font-weight:700">{{ t('modals.discount.reasons.referral') }}</div>
          <div style="font-size:10.5px;color:var(--dim)">{{ t('modals.discount.reasons.referralDesc') }}</div>
        </div>
      </div>
      <div
        class="reason-opt"
        :class="{ active: selectedReason === 'complaint' }"
        @click="setReason('complaint')"
      >
        <input type="radio" name="dr" :checked="selectedReason === 'complaint'" style="accent-color:var(--blue)" />
        <div>
          <div style="font-weight:700">{{ t('modals.discount.reasons.complaint') }}</div>
          <div style="font-size:10.5px;color:var(--dim)">{{ t('modals.discount.reasons.complaintDesc') }}</div>
        </div>
      </div>
      <div
        class="reason-opt"
        :class="{ active: selectedReason === 'promo' }"
        @click="setReason('promo')"
      >
        <input type="radio" name="dr" :checked="selectedReason === 'promo'" style="accent-color:var(--blue)" />
        <div>
          <div style="font-weight:700">{{ t('modals.discount.reasons.promo') }}</div>
          <div style="font-size:10.5px;color:var(--dim)">{{ t('modals.discount.reasons.promoDesc') }}</div>
        </div>
      </div>
    </div>

    <!-- ── Referral fields ── -->
    <div v-if="selectedReason === 'referral'" style="margin-bottom:0">
      <div class="info-box info-blue" style="margin-bottom:10px">
        <span>ℹ️</span>
        <div><strong style="color:var(--white)">{{ t('modals.discount.referralInfo') }}</strong>, {{ t('modals.discount.referred').toLowerCase() }} {{ t('modals.discount.willReceive').toLowerCase() }} <strong style="color:var(--white)">{{ t('modals.discount.referredNewGets') }}</strong>. {{ t('modals.discount.referralAutoInfo') }}</div>
      </div>
      <div class="popup-2col" style="margin-bottom:0">
        <div>
          <label class="popup-label">{{ t('modals.discount.referrer') }}</label>
          <input class="popup-input" v-model="referrerName" :placeholder="t('modals.discount.searchClient')" style="margin-bottom:0" />
          <div style="font-size:10px;color:var(--dim);margin-top:3px;margin-bottom:12px">{{ t('modals.discount.willReceive') }} <strong style="color:var(--white)">{{ t('modals.discount.referredGets') }}</strong> {{ t('modals.discount.nextMonth') }}</div>
        </div>
        <div>
          <label class="popup-label">{{ t('modals.discount.referred') }}</label>
          <input class="popup-input" :value="studentName" readonly style="color:var(--dim);margin-bottom:0" />
          <div style="font-size:10px;color:var(--dim);margin-top:3px;margin-bottom:12px">{{ t('modals.discount.willReceive') }} <strong style="color:var(--white)">{{ t('modals.discount.referredNewGets') }}</strong> {{ t('modals.discount.thisMonth') }}</div>
        </div>
      </div>
    </div>

    <!-- ── Complaint fields ── -->
    <div v-if="selectedReason === 'complaint'" style="margin-bottom:0">
      <label class="popup-label">{{ t('modals.discount.complaintDescLabel') }}</label>
      <textarea class="popup-input" v-model="complaintDesc" rows="3" :placeholder="t('modals.discount.complaintPlaceholder')" style="resize:none"></textarea>
      <label class="popup-label">{{ t('modals.discount.deptIssuing') }}</label>
      <div class="popup-2col" style="margin-bottom:12px">
        <div
          class="reason-opt"
          :class="{ active: complaintDept === 'quality' }"
          @click="complaintDept = 'quality'"
          style="padding:8px 10px"
        >
          <input type="radio" name="dept" :checked="complaintDept === 'quality'" style="accent-color:var(--blue)" />
          <div><div style="font-weight:700;font-size:12px">{{ t('modals.discount.depts.quality') }}</div></div>
        </div>
        <div
          class="reason-opt"
          :class="{ active: complaintDept === 'admin' }"
          @click="complaintDept = 'admin'"
          style="padding:8px 10px"
        >
          <input type="radio" name="dept" :checked="complaintDept === 'admin'" style="accent-color:var(--blue)" />
          <div><div style="font-weight:700;font-size:12px">{{ t('modals.discount.depts.admin') }}</div></div>
        </div>
      </div>
      <div class="approval-block">
        <div class="approval-title">{{ t('modals.discount.requiresApproval') }}</div>
        <div style="display:flex;align-items:center;gap:10px;font-size:12px">
          <div style="flex:1"><div style="color:var(--dim)">{{ t('modals.discount.approver') }}</div><div style="font-weight:700">Tomasz Adamski — Главный менеджер</div></div>
          <span class="badge badge-amber">{{ t('payments.status.pending') }}</span>
        </div>
        <div style="font-size:10.5px;color:var(--dim);margin-top:6px">{{ t('modals.discount.approvalInfo') }}</div>
      </div>
    </div>

    <!-- ── Promo fields ── -->
    <div v-if="selectedReason === 'promo'" style="margin-bottom:12px">
      <label class="popup-label">{{ t('modals.discount.promoCode') }}</label>
      <input class="popup-input" v-model="promoCode" :placeholder="t('modals.discount.promoPlaceholder')" />
    </div>

    <!-- ── Отдел (global) ── -->
    <label class="popup-label">{{ t('modals.discount.department') }} <span style="color:var(--red)">★</span></label>
    <div class="popup-2col" style="margin-bottom:12px">
      <div
        class="reason-opt"
        :class="{ active: globalDept === 'quality' }"
        @click="globalDept = 'quality'"
        style="padding:8px 10px"
      >
        <input type="radio" name="dept-g" :checked="globalDept === 'quality'" style="accent-color:var(--blue)" />
        <div><div style="font-weight:700;font-size:12px">{{ t('modals.discount.depts.quality') }}</div></div>
      </div>
      <div
        class="reason-opt"
        :class="{ active: globalDept === 'admin' }"
        @click="globalDept = 'admin'"
        style="padding:8px 10px"
      >
        <input type="radio" name="dept-g" :checked="globalDept === 'admin'" style="accent-color:var(--blue)" />
        <div><div style="font-weight:700;font-size:12px">{{ t('modals.discount.depts.admin') }}</div></div>
      </div>
      <div
        class="reason-opt"
        :class="{ active: globalDept === 'account' }"
        @click="globalDept = 'account'"
        style="padding:8px 10px"
      >
        <input type="radio" name="dept-g" :checked="globalDept === 'account'" style="accent-color:var(--blue)" />
        <div><div style="font-weight:700;font-size:12px">{{ t('modals.discount.depts.accounting') }}</div></div>
      </div>
      <div
        class="reason-opt"
        :class="{ active: globalDept === 'dir' }"
        @click="globalDept = 'dir'"
        style="padding:8px 10px"
      >
        <input type="radio" name="dept-g" :checked="globalDept === 'dir'" style="accent-color:var(--blue)" />
        <div><div style="font-weight:700;font-size:12px">{{ t('modals.discount.depts.director') }}</div></div>
      </div>
    </div>

    <!-- ── Комментарий ── -->
    <label class="popup-label">{{ t('modals.discount.comment') }} <span style="color:var(--red)">★</span></label>
    <input class="popup-input" v-model="comment" :placeholder="t('modals.discount.commentPlaceholder')" />

    <!-- ── Actions ── -->
    <div class="popup-actions">
      <button class="btn btn-ghost" @click="close">{{ t('common.cancel') }}</button>
      <div v-if="errorMessage" class="info-box info-red" style="margin-bottom:8px;font-size:11px"><span>⚠️</span><div>{{ errorMessage }}</div></div>
      <button
        class="btn btn-primary"
        :disabled="saving || !selectedReason || discountValue <= 0 || !globalDept"
        @click="save"
      >
        {{ saving ? t('modals.discount.saving') : t('modals.discount.apply') }}
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

const { t } = useI18n();
const modal = useModalStore();
const payments = usePaymentsStore();

const MONTHS_SHORT = computed(() => {
  const arr = t('common.monthsShort');
  return Array.isArray(arr) ? arr : ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
});

// ── State ──
const selectedMonth = ref<number>(modal.modalData?.monthIndex ?? 2);
const discountType = ref<"fixed" | "pct">("fixed");
const discountValue = ref<number>(0);
const selectedReason = ref<string>("");
const comment = ref("");
const saving = ref(false);
const errorMessage = ref('');

// referral
const referrerName = ref("");
// complaint
const complaintDesc = ref("");
const complaintDept = ref<string>("");
// promo
const promoCode = ref("");
// global dept
const globalDept = ref<string>("");

// ── Computed ──
const programId = computed(() => modal.modalData?.programId || "space");
const programLabel = computed(() => {
  const prog = payments.programs.find(p => p.id === programId.value);
  return prog?.name || "Space Memory";
});
const studentName = computed(() => payments.student?.name || "Anna Kowalska");

const baseTariff = computed(() => {
  const prog = payments.programs.find(p => p.id === programId.value);
  return prog?.tariff || 490;
});

const discountAmount = computed(() => {
  if (discountType.value === "pct") {
    return Math.round(baseTariff.value * (discountValue.value / 100));
  }
  return Math.min(discountValue.value, baseTariff.value);
});

const finalAmount = computed(() => Math.max(0, baseTariff.value - discountAmount.value));

function isMonthDisabled(_i: number): boolean {
  return false;
}

function setReason(r: string) {
  selectedReason.value = r;
}

function calcDisc() {
  // auto-trigger — computed handles the rest
}

function close() {
  modal.close();
}

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
/* ── POPUP BASE ── */
.popup-discount { max-width: 500px; }
.popup-title { font-size: 15px; font-weight: 800; margin-bottom: 4px; }
.popup-sub { font-size: 11.5px; color: var(--dim); margin-bottom: 14px; line-height: 1.5; }
.popup-label { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--dim); margin-bottom: 5px; display: block; }
.popup-input { width: 100%; background: rgba(255,255,255,.04); border: 1px solid var(--b); border-radius: 8px; padding: 8px 12px; color: var(--white); font-family: 'Outfit', sans-serif; font-size: 13px; outline: none; transition: border-color .2s; margin-bottom: 12px; }
.popup-input:focus { border-color: var(--blue); }
.popup-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }

/* ── MONTH SELECTOR ── */
.month-selector { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; margin-bottom: 12px; }
.ms-btn { padding: 5px 3px; border-radius: 7px; font-size: 11px; font-weight: 600; text-align: center; cursor: pointer; border: 1px solid var(--b); background: transparent; color: var(--dim); transition: all .15s; font-family: 'Outfit', sans-serif; }
.ms-btn:hover:not(.disabled) { border-color: var(--bh); color: var(--white); }
.ms-btn.active { background: rgba(79,110,247,.15); border-color: rgba(79,110,247,.4); color: var(--blue); }
.ms-btn.disabled { opacity: .3; cursor: not-allowed; }

/* ── CALC PREVIEW ── */
.calc-preview { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 12px; }
.cp { background: rgba(255,255,255,.03); border: 1px solid var(--b); border-radius: 9px; padding: 10px; text-align: center; }
.cp-label { font-size: 9.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--dim); margin-bottom: 5px; }
.cp-val { font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700; }

/* ── REASON GRID ── */
.reason-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 12px; }
.reason-opt { display: flex; align-items: flex-start; gap: 8px; padding: 9px 11px; background: rgba(255,255,255,.03); border: 1px solid var(--b); border-radius: 9px; cursor: pointer; font-size: 12px; transition: all .15s; }
.reason-opt:hover { border-color: var(--bh); }
.reason-opt.active { border-color: rgba(79,110,247,.5); background: rgba(79,110,247,.1); }

/* ── INFO BOXES ── */
.info-box { border-radius: 8px; padding: 9px 12px; font-size: 11.5px; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px; line-height: 1.5; }
.info-blue { background: rgba(79,110,247,.07); border: 1px solid rgba(79,110,247,.2); color: var(--dim); }
.info-green { background: rgba(16,185,129,.07); border: 1px solid rgba(16,185,129,.22); color: var(--green); }
.info-amber { background: rgba(245,158,11,.07); border: 1px solid rgba(245,158,11,.22); color: var(--amber); }

/* ── DC BADGES ── */
.dc { display: inline-flex; align-items: center; gap: 3px; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
.dc-family { background: rgba(16,185,129,.1); color: var(--green); }
.dc-referral { background: rgba(139,92,246,.1); color: var(--purple); }

/* ── APPROVAL BLOCK ── */
.approval-block { background: rgba(245,158,11,.06); border: 1px solid rgba(245,158,11,.22); border-radius: 9px; padding: 10px 12px; margin-bottom: 12px; }
.approval-title { font-size: 10px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--amber); margin-bottom: 7px; display: flex; align-items: center; gap: 5px; }
.badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 5px; font-size: 9.5px; font-weight: 700; }
.badge-amber { background: rgba(245,158,11,.08); color: var(--amber); border: 1px solid rgba(245,158,11,.22); }

/* ── ACTIONS ── */
.popup-actions { display: flex; gap: 8px; margin-top: 4px; }
.popup-actions .btn { flex: 1; justify-content: center; padding: 10px; }
.btn { display: inline-flex; align-items: center; gap: 5px; padding: 8px 14px; border-radius: 9px; font-size: 13px; font-weight: 600; font-family: 'Outfit', sans-serif; cursor: pointer; border: none; transition: all .15s; white-space: nowrap; }
.btn-ghost { background: rgba(255,255,255,.05); color: var(--dim); border: 1px solid var(--b); }
.btn-ghost:hover { background: rgba(255,255,255,.08); color: var(--white); border-color: var(--bh); }
.btn-primary { background: linear-gradient(135deg, var(--blue), var(--purple)); color: #fff; font-weight: 700; }
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
.btn:disabled { opacity: .3; cursor: not-allowed; }
</style>
