<template>
  <div class="month-detail" v-if="month">
    <!-- ── HEAD ── -->
    <div class="md-head">
      <div class="md-title">{{ MONTHS_F[monthIdx] }} · {{ year }}</div>
      <span
        class="md-badge"
        :style="{ color: SC[month.s], borderColor: SC[month.s] + '40', background: SC[month.s] + '10' }"
      >
        {{ SI[month.s] }} {{ SL[month.s] }}
      </span>
    </div>

    <!-- ── DETAIL ROWS ── -->
    <div class="md-rows">

      <!-- 💰 Статус оплаты -->
      <div
        v-if="month.payStatus"
        class="md-row"
        :style="{ border: `1px solid ${SC[month.s]}30`, background: SC[month.s] + '10' }"
      >
      <span class="md-lbl">{{ t('payments.detail.payStatus') }}</span>
        <div class="md-right">
          <span v-if="month.txDate" class="md-dim">📅 {{ month.txDate }}</span>
          <span class="md-val" :style="{ color: SC[month.s] }">{{ SL[month.s] }}</span>
        </div>
      </div>

      <!-- 💵 Сумма -->
      <div class="md-row">
        <span class="md-lbl">{{ t('payments.detail.amount') }}</span>
        <span class="md-val" :style="{ color: SC[month.s] }">{{ month.a ? month.a + ' zł' : '0 zł' }}</span>
      </div>

      <!-- 📊 Занятия -->
      <div v-if="month.lessons != null || month.totalLessons != null" class="md-row">
        <span class="md-lbl">{{ t('payments.detail.lessons') }}</span>
        <span class="md-val">{{ month.lessons ?? 0 }} / {{ month.totalLessons ?? 0 }}</span>
      </div>

      <!-- ◐ Частичная пауза -->
      <div v-if="month.s === 'partial'" class="md-row" style="border:1px solid rgba(6,182,212,.2);background:rgba(6,182,212,.06)">
        <span class="md-lbl">{{ t('payments.detail.partialPause') }}</span>
        <div class="md-right">
          <span class="md-dim" v-if="month.pauseFrom">{{ t('payments.labels.from') }} {{ month.pauseFrom }}</span>
          <span class="md-dim" v-if="month.returnDate">{{ t('payments.labels.return') }} {{ month.returnDate }}</span>
          <span class="md-val" style="color:var(--cyan)">{{ month.lessons ?? '?' }} {{ t('payments.labels.lessonsCount') }}</span>
        </div>
      </div>

      <!-- 🌙 Пауза -->
      <div v-if="month.s === 'pause'" class="md-row" style="border:1px solid rgba(245,158,11,.2);background:rgba(245,158,11,.06)">
        <span class="md-lbl">{{ t('payments.detail.activePause') }}</span>
        <div class="md-right">
          <span v-if="month.pauseFrom" class="md-dim">{{ t('payments.labels.from') }} {{ month.pauseFrom }}</span>
          <span class="md-val" style="color:var(--amber)">{{ t('payments.labels.until') }} {{ month.pauseUntil || '—' }}</span>
        </div>
      </div>

      <!-- 🔄 Распределение по группам -->
      <div v-if="month.groupSplit && month.groupSplit.length" class="md-row" style="border:1px solid rgba(6,182,212,.2);background:rgba(6,182,212,.06)">
        <span class="md-lbl">{{ t('payments.detail.distribution') }}</span>
        <div class="md-splits">
          <div v-for="(gs, gi) in month.groupSplit" :key="gi" class="md-split">
            <span class="md-dim">{{ gs.group || t('groups.group') + ' ' + (gi+1) }}</span>
            <span class="md-val" style="color:var(--cyan)">{{ gs.lessons || 0 }} {{ t('payments.labels.lessonsSuffix') }} · {{ gs.amount || 0 }} zł</span>
          </div>
        </div>
      </div>

      <!-- 🏷️ Скидка -->
      <div v-if="month.disc" class="md-row" style="border:1px solid rgba(168,85,247,.2);background:rgba(168,85,247,.06)">
        <span class="md-lbl">{{ t('payments.detail.discount') }}</span>
        <div class="md-right">
          <span
            class="disc-badge"
            :style="{ background: DC[month.disc] + '18', color: DC[month.disc], border: '1px solid ' + DC[month.disc] + '30' }"
          >{{ DL[month.disc] || month.disc }}</span>
          <span v-if="month.discAmt" class="md-val" style="color:var(--purple)">−{{ month.discAmt }} zł</span>
        </div>
      </div>

      <!-- 👩‍🏫 Учитель -->
      <div v-if="month.teacher" class="md-row">
        <span class="md-lbl">{{ t('payments.detail.teacher') }}</span>
        <span class="md-val">{{ month.teacher }}</span>
      </div>

      <!-- ⭐ Бонус -->
      <div v-if="month.bonus" class="md-row" style="border:1px solid rgba(251,191,36,.25);background:rgba(251,191,36,.06)">
        <span class="md-lbl">{{ t('payments.detail.bonus') }}</span>
        <div class="md-right">
          <span v-if="month.bonusDate" class="md-dim">{{ month.bonusDate }}</span>
          <span class="md-val" style="color:var(--gold)">{{ t('payments.labels.free') }}</span>
        </div>
      </div>

      <!-- 📄 KSeF -->
      <div v-if="month.ksef" class="md-row">
        <span class="md-lbl">{{ t('payments.detail.ksefLabel') }}</span>
        <span
          class="ksef-badge"
          :class="'kb-' + month.ksef"
        >{{ KL[month.ksef] || month.ksef }}</span>
      </div>
    </div>

    <!-- ── ACTIONS ── -->
    <div class="md-acts">
      <button class="md-btn" @click="onDiscount">{{ t('payments.detail.discount') }}</button>
      <button class="md-btn" @click="onGroupChange">🔄 {{ t('payments.btn.changeGroup') }}</button>
      <button v-if="month.s === 'pause'" class="md-btn md-btn-green" @click="onResume">▶ {{ t('payments.btn.resume') }}</button>
      <span class="md-hint">{{ t('payments.detail.txHint') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { MonthObj } from "../../../../../api/mockDb";
import { useModalStore } from "../../../../../stores/modal.store";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  prog: string;
  monthIdx: number;
  year: number;
  month: MonthObj | null;
}>();

const emit = defineEmits<{
  (e: "action", type: string): void;
}>();

const modal = useModalStore();

// ── Dictionaries (из HTML-прототипа) ──

/** Полные названия месяцев — из i18n */
const MONTHS_F = computed(() => {
  const arr = t('payments.monthsFull');
  return typeof arr === 'string' ? arr.split(',') : arr;
});

/** Status → Icon */
const SI: Record<string, string> = {
  paid: "✓", pending: "🕐", overdue: "⚠️", pause: "⏸",
  summer: "☀️", partial: "◐", "extra-paid": "➕",
  "extra-pending": "➕", future: "•"
};

/** Status → Label  (i18n) */
const SL = computed<Record<string, string>>(() => ({
  paid: t('payments.status.paid'), pending: t('payments.status.pendingFull'),
  overdue: t('payments.status.overdue'), pause: t('payments.status.pause'),
  summer: t('payments.status.summer'), partial: t('payments.status.partialPause'),
  "extra-paid": t('payments.status.extraPaid'), "extra-pending": t('payments.status.extraPending'),
  future: t('payments.status.future')
}));

/** Status → Color */
const SC: Record<string, string> = {
  paid: "var(--green)", pending: "var(--blue)", overdue: "var(--red)",
  pause: "var(--amber)", summer: "var(--gold)", partial: "var(--cyan)",
  "extra-paid": "var(--pink)", "extra-pending": "var(--pink)", future: "rgba(255,255,255,.35)"
};

/** KSeF → Label (i18n) */
const KL = computed<Record<string, string>>(() => ({
  ok: t('payments.ksef.ok'), manual: t('payments.ksef.manual'),
  pending: t('payments.ksef.pending'), error: t('payments.ksef.error'),
  conflict: t('payments.ksef.conflict')
}));

/** Discount → Color */
const DC: Record<string, string> = {
  family: "#a855f7", referral: "#06b6d4", loyalty: "#10b981",
  complaint: "#ef4444", promo: "#f59e0b"
};

/** Discount → Label (i18n) */
const DL = computed<Record<string, string>>(() => ({
  family: t('payments.disc.family'), referral: t('payments.disc.referral'),
  loyalty: t('payments.disc.loyalty'), complaint: t('payments.disc.complaint'),
  promo: t('payments.disc.promo')
}));

// ── Action handlers → open modals ──
function onDiscount() {
  modal.open("discount", { programId: props.prog, monthIndex: props.monthIdx });
  emit("action", "discount");
}
function onGroupChange() {
  modal.open("groupSplit", { programId: props.prog, monthIndex: props.monthIdx, year: props.year });
  emit("action", "groupChange");
}
function onResume() {
  modal.open("resume", { programId: props.prog });
  emit("action", "resume");
}
</script>

<style scoped>
.month-detail {
  background: rgba(79,110,247,.05);
  border: 1px solid rgba(79,110,247,.2);
  border-radius: 11px;
  padding: 14px;
  margin-bottom: 12px;
  animation: fadeIn .18s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* head */
.md-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 6px;
}
.md-title {
  font-size: 14px;
  font-weight: 700;
}
.md-badge {
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid;
}

/* rows */
.md-rows {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}
.md-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: rgba(255,255,255,.025);
  border: 1px solid var(--b);
  border-radius: 8px;
  font-size: 12px;
}
.md-lbl {
  color: var(--dim);
  flex-shrink: 0;
  white-space: nowrap;
}
.md-val {
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  margin-left: auto;
  white-space: nowrap;
}
.md-right {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}
.md-dim {
  font-size: 10.5px;
  color: var(--dim);
  white-space: nowrap;
}

/* splits */
.md-splits {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-left: auto;
}
.md-split {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* discount badge */
.disc-badge {
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

/* ksef badge */
.ksef-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
  margin-left: auto;
}
.kb-ok       { background: rgba(16,185,129,.1); color: var(--green); border: 1px solid rgba(16,185,129,.2); }
.kb-manual   { background: rgba(100,120,255,.08); color: var(--dim); border: 1px solid var(--b); }
.kb-pending  { background: rgba(245,158,11,.1); color: var(--amber); border: 1px solid rgba(245,158,11,.2); }
.kb-error    { background: rgba(239,68,68,.1); color: var(--red); border: 1px solid rgba(239,68,68,.2); }
.kb-conflict { background: rgba(249,115,22,.1); color: var(--orange); border: 1px solid rgba(249,115,22,.2); }

/* actions */
.md-acts {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid rgba(79,110,247,.12);
}
.md-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  border: 1px solid var(--b);
  background: rgba(255,255,255,.04);
  color: var(--dim);
  transition: all .15s;
}
.md-btn:hover {
  background: rgba(79,110,247,.1);
  border-color: rgba(79,110,247,.3);
  color: var(--blue);
}
.md-btn-green {
  background: rgba(16,185,129,.08);
  color: var(--green);
  border-color: rgba(16,185,129,.25);
}
.md-btn-green:hover {
  background: rgba(16,185,129,.18);
  border-color: rgba(16,185,129,.4);
}
.md-hint {
  font-size: 10px;
  color: var(--dim);
  margin-left: auto;
  opacity: .6;
}
</style>
