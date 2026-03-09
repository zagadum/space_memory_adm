<template>
  <div class="tx-section" :class="{ open: isOpen }">
    <!-- ── Toggle header ── -->
    <div class="tx-toggle" @click="toggle">
      <div class="tx-toggle-left">💳 {{ t('payments.tx.combinedTitle') }}</div>
      <div class="tx-toggle-right">
        <span class="tx-cnt">{{ t('payments.tx.count', txList.length) }}</span>
        <div class="tx-arrow" :class="{ rotated: isOpen }">›</div>
      </div>
    </div>

    <!-- ── Body ── -->
    <div class="tx-body" v-show="isOpen">
      <div class="tx-body-inner">
        <div
          v-for="tx in txList"
          :key="tx.id"
          class="tx-row"
          :class="{ 'tx-extra': tx.type === 'extra' }"
        >
          <!-- date -->
          <div class="tx-date">{{ tx.date }}</div>

          <!-- description -->
          <div class="tx-desc">
            <div class="tx-title">{{ formatTxTitle(tx.title) }}</div>
            <div class="tx-sub">{{ tx.sub || '' }}</div>
          </div>

          <!-- amount + status -->
          <div class="tx-amount-block">
            <div class="tx-amt" :style="{ color: tx.status === 'paid' ? 'var(--green)' : 'var(--blue)' }">
              {{ tx.amountFmt || tx.amount + ' zł' }}
            </div>
            <div
              class="tx-status"
              :style="{ color: tx.status === 'paid' ? 'var(--green)' : 'var(--blue)' }"
            >
              {{ tx.status === 'paid' ? t('payments.tx.paid') : t('payments.tx.pending') }}
            </div>
          </div>

          <!-- ksef badge -->
          <div class="tx-ksef">
            <span v-if="tx.ksef" class="kb" :class="'kb-' + tx.ksef">
              {{ KL[tx.ksef] || tx.ksef }}
            </span>
            <span v-else class="tx-no-ksef">—</span>
          </div>

          <!-- action buttons -->
          <div class="tx-btns">
            <button class="tx-btn" :title="t('payments.tx.edit')" @click.stop="onEdit(tx)">✏️</button>
            <button class="tx-btn" :title="t('payments.tx.correction')" @click.stop="onKorekta(tx)">📋</button>
            <button class="tx-btn" :title="t('payments.tx.refund')" @click.stop="onRefund(tx)">↩️</button>
          </div>
        </div>

        <!-- empty state -->
        <div v-if="!txList.length" class="tx-empty">
          {{ t('payments.tx.empty') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { usePaymentsStore } from "../../../../../stores/payments.store";
import { useModalStore } from "../../../../../stores/modal.store";
import type { Transaction } from "../../../../../api/paymentsApi";

const { t, tm } = useI18n();
const payments = usePaymentsStore();
const modal = useModalStore();

const props = defineProps<{
  prog: string;
}>();

const isOpen = ref(false);

/** 
 * Translates hardcoded Russian titles to localized versions.
 * "Абонемент февраль 2026" -> Localized string
 */
function formatTxTitle(title: string): string {
  if (!title) return "";
  
  let res = title;
  
  // 1. Map type keywords
  const types: Record<string, string> = {
    "Абонемент": t('payments.tx.subscription'),
    "Счет": t('payments.tx.invoice'),
    "Доп. занятие": t('payments.tx.extra')
  };
  
  for (const [key, val] of Object.entries(types)) {
    if (res.includes(key)) {
      res = res.replace(key, val);
    }
  }

  // 2. Map months (if present)
  // We look for Russian month names in the string
  const ruMonths = [
    "январь", "февраль", "март", "апрель", "май", "июнь", 
    "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"
  ];
  const fullMonths = tm('payments.monthsFull') as string[];

  ruMonths.forEach((m, idx) => {
    // Check both lowercase and Capitalized (common in titles)
    const capitalized = m.charAt(0).toUpperCase() + m.slice(1);
    const localized = fullMonths[idx];

    if (res.toLowerCase().includes(m)) {
      // We use a regex for case-insensitive replace to preserve year/rest of string
      const reg = new RegExp(m, 'gi');
      res = res.replace(reg, localized);
    }
  });

  return res;
}

/** Transactions from store (loaded on expand) or from program.transactions fallback */
const txList = computed<Transaction[]>(() => {
  const fromStore = payments.transactionsByProgram[props.prog];
  if (fromStore?.length) return fromStore;
  const p = payments.programs.find(x => x.id === props.prog);
  return (p?.transactions || []) as unknown as Transaction[];
});

async function toggle() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    await Promise.all([
      payments.loadTransactions(props.prog),
      payments.loadKsefInvoices(props.prog),
    ]);
  }
}

/** KSeF → short label */
const KL = computed<Record<string, string>>(() => ({
  ok: "✓ OK",
  manual: "✎ " + t('payments.ksef.manual'),
  pending: "⏳ " + t('payments.ksef.pending'),
  error: "✕ " + t('payments.ksef.error'),
  conflict: "! " + t('payments.ksef.conflict'),
}));

// ── action handlers → open modals ──
function onEdit(tx: Transaction) {
  modal.open("edit-invoice", { tx, programId: props.prog });
}
function onKorekta(tx: Transaction) {
  modal.open("korekta", { tx, programId: props.prog });
}
function onRefund(tx: Transaction) {
  modal.open("refund", { tx, programId: props.prog, fvnum: tx.fvnum, amount: tx.amount, desc: tx.title });
}
</script>

<style scoped>
/* ── SECTION ── */
.tx-section {
  border-top: 1px solid var(--b);
}

/* ── TOGGLE ── */
.tx-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  cursor: pointer;
  transition: background .15s;
}
.tx-toggle:hover { background: rgba(255,255,255,.02); }

.tx-toggle-left {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 600;
}
.tx-toggle-right {
  display: flex;
  align-items: center;
  gap: 7px;
}
.tx-cnt {
  font-size: 11px;
  color: var(--dim);
}
.tx-arrow {
  font-size: 11px;
  color: var(--dim);
  transition: transform .2s;
}
.tx-arrow.rotated { transform: rotate(90deg); }

/* ── BODY ── */
.tx-body-inner {
  padding: 6px 16px 12px;
}

/* ── ROW ── */
.tx-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 11px;
  background: rgba(255,255,255,.025);
  border: 1px solid var(--b);
  border-radius: 9px;
  margin-bottom: 5px;
  transition: all .15s;
}
.tx-row:hover { border-color: var(--bh); }

/* extra type — dashed border */
.tx-extra {
  border-style: dashed;
  border-color: rgba(236,72,153,.22);
  background: rgba(236,72,153,.03);
}
.tx-extra:hover {
  border-color: rgba(236,72,153,.4);
}

/* date */
.tx-date {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  color: var(--dim);
  white-space: nowrap;
  width: 62px;
  flex-shrink: 0;
}

/* desc */
.tx-desc {
  flex: 1;
  min-width: 0;
}
.tx-title {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tx-sub {
  font-size: 10px;
  color: var(--dim);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* amount block */
.tx-amount-block {
  text-align: right;
  flex-shrink: 0;
}
.tx-amt {
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}
.tx-status {
  font-size: 9px;
  font-weight: 600;
  white-space: nowrap;
  margin-top: 1px;
}

/* ksef */
.tx-ksef {
  flex-shrink: 0;
  width: 80px;
  text-align: center;
}
.tx-no-ksef {
  color: var(--dim);
  font-size: 11px;
}

/* ksef badges */
.kb {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 5px;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}
.kb-ok       { background: rgba(16,185,129,.1);  color: var(--green);  border: 1px solid rgba(16,185,129,.2); }
.kb-manual   { background: rgba(100,120,255,.08); color: var(--dim);    border: 1px solid var(--b); }
.kb-pending  { background: rgba(245,158,11,.1);   color: var(--amber);  border: 1px solid rgba(245,158,11,.2); animation: pamber 2s ease-in-out infinite; }
.kb-error    { background: rgba(239,68,68,.1);    color: var(--red);    border: 1px solid rgba(239,68,68,.2); }
.kb-conflict { background: rgba(249,115,22,.1);   color: var(--orange); border: 1px solid rgba(249,115,22,.2); }

@keyframes pamber {
  0%,100% { box-shadow: 0 0 3px rgba(245,158,11,.3); }
  50%     { box-shadow: 0 0 8px rgba(245,158,11,.5); }
}

/* action buttons */
.tx-btns {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}
.tx-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  transition: all .15s;
  cursor: pointer;
}
.tx-btn:hover {
  background: rgba(79,110,247,.15);
  border-color: rgba(79,110,247,.3);
}

/* empty */
.tx-empty {
  text-align: center;
  padding: 16px;
  color: var(--dim);
  font-size: 12px;
}
</style>
