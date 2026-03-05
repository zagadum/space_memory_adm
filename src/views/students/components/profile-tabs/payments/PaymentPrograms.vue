<template>
  <!-- Programs accordion -->
  <div
    v-for="(enr, idx) in currentStudent?.enrollments"
    :key="idx"
    class="prog"
    :class="{ open: progId(enr) === openProg }"
  >
    <!-- ── head ── -->
    <div class="prog-head" @click="toggleProg(progId(enr))">
      <div
        class="prog-bar"
        :style="{ background: progFor(enr)?.barGradient || 'var(--blue)' }"
      ></div>

      <div class="prog-info">
        <div class="prog-name">{{ progFor(enr)?.name || enr.school }}</div>
        <div class="prog-sub">
          <span>{{ enr.group }} · {{ enr.teacher }}</span>
          <span> · {{ schedule(enr.teacher) }}</span>
          <span> · {{ progFor(enr)?.tariff || 0 }} zł/{{ t('payments.table.month').toLowerCase() }}</span>
          <span
            v-if="enr.school.includes('Indigo')"
            class="badge badge-child2"
          >
            {{ t('payments.child2badge') }}
          </span>
        </div>
      </div>

      <div class="prog-bal" v-if="progFor(enr)">
        <div
          class="prog-bal-val"
          :style="{ color: balColor(progFor(enr)!.balance) }"
        >
          {{ progFor(enr)!.balance > 0 ? '+' : '' }}{{ progFor(enr)!.balance }} zł
        </div>
        <div class="prog-bal-sub">{{ progFor(enr)?.balanceLabel || t('payments.balance') }}</div>
      </div>

      <div class="prog-arrow">›</div>
    </div>

    <!-- ── body ── -->
    <div class="prog-body" v-show="progId(enr) === openProg">
      <div class="prog-inner">

        <!-- year toggle + view toggle -->
        <div class="year-row">
          <span class="yr-label">{{ t("payments.year") }}</span>
          <button
            v-for="y in payments.yearsForProgram(progId(enr))"
            :key="y"
            class="yr-btn"
            :class="{ active: payments.activeYear[progId(enr)] === y }"
            @click="payments.setYear(progId(enr), y)"
          >
            {{ y }}
          </button>

          <div class="view-toggle">
            <button
              class="vt-btn"
              :class="{ active: payments.activeView[progId(enr)] !== 'table' }"
              @click.stop="payments.setView(progId(enr), 'grid')"
            >⬛ {{ t("payments.view.grid") }}</button>
            <button
              class="vt-btn"
              :class="{ active: payments.activeView[progId(enr)] === 'table' }"
              @click.stop="payments.setView(progId(enr), 'table')"
            >☰ {{ t("payments.view.table") }}</button>
          </div>
        </div>

        <!-- ════════ GRID VIEW ════════ -->
        <div
          v-if="payments.activeView[progId(enr)] !== 'table'"
          class="month-grid"
        >
          <button
            v-for="(m, i) in payments.monthsForProgram(progId(enr))"
            :key="i"
            type="button"
            class="mcell"
            :class="['ms-' + m.s, { sel: payments.activeMonth[progId(enr)] === i }]"
            @click="payments.setMonth(progId(enr), i)"
          >
            <!-- KSeF / split / bonus badges -->
            <div v-if="m.split" class="cbadge cb-split">⇄</div>
            <div v-if="m.ksef === 'conflict'" class="cbadge cb-conflict">!</div>
            <div v-if="m.ksef === 'error'" class="cbadge cb-error">✕</div>
            <div v-if="m.bonus" class="bonus-strip">⭐ {{ t('payments.detail.bonus').replace('⭐ ','') }}</div>

            <div class="mc-name">{{ MONTHS_SHORT[i] }}</div>
            <div class="mc-icon">{{ icon(m) }}</div>
            <div class="mc-amt">{{ m.a ? m.a + ' zł' : '—' }}</div>
            <div
              v-if="m.s.startsWith('extra')"
              class="mc-pay"
              :style="{ color: statusColor(m) }"
            >{{ statusLabel(m) }}</div>
          </button>

          <!-- + Доп. занятие -->
          <button
            class="mcell mcell-add"
            @click="modal.open('extra', { programId: progId(enr) })"
          >
            <div style="font-size:17px;color:var(--pink)">＋</div>
            <div style="font-size:9px;color:var(--pink);font-weight:700;margin-top:1px">{{ t('payments.btn.addExtra') }}</div>
          </button>
        </div>

        <!-- ════════ TABLE VIEW ════════ -->
        <div v-else class="month-table-wrap">
          <table class="exp-table">
            <thead>
              <tr>
                <th>{{ t("payments.table.month") }}</th>
                <th>{{ t("payments.table.status") }}</th>
                <th>{{ t("payments.table.payment") }}</th>
                <th>{{ t("payments.table.amount") }}</th>
                <th>{{ t("payments.table.discount") }}</th>
                <th>{{ t("payments.table.lessons") }}</th>
                <th>{{ t("payments.table.txDate") }}</th>
                <th>{{ t("payments.table.ksef") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(m, i) in payments.monthsForProgram(progId(enr))"
                :key="i"
                :class="['ms-' + m.s, { selrow: payments.activeMonth[progId(enr)] === i }]"
                @click="payments.setMonth(progId(enr), i)"
              >
                <td class="td-mono">{{ MONTHS_SHORT[i] }}</td>
                <td>
                  <span class="st" :class="'st-' + m.s">{{ icon(m) }} {{ statusLabelT(m) }}</span>
                </td>
                <td>
                  <span class="td-pay" :style="{ color: statusColor(m) }">{{ statusLabel(m) }}</span>
                </td>
                <td class="td-mono td-amt" :style="{ color: statusColor(m) }">
                  {{ m.a ? m.a + ' zł' : '—' }}
                </td>
                <td>{{ m.disc || '—' }}</td>
                <td class="td-mono">G1: {{ m.g1 }} · G2: {{ m.g2 }}</td>
                <td class="td-mono td-dim">{{ m.txDate || '—' }}</td>
                <td>
                  <span v-if="m.ksef" class="kb" :class="'kb-' + m.ksef">{{ m.ksef }}</span>
                  <span v-else>—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ════════ MONTH DETAIL ════════ -->
        <PaymentMonthDetail
          v-if="payments.activeMonth[progId(enr)] != null"
          :prog="progId(enr)"
          :monthIdx="payments.activeMonth[progId(enr)]!"
          :year="payments.activeYear[progId(enr)] || 2026"
          :month="payments.currentMonth(progId(enr))"
        />

      </div><!-- /prog-inner -->

      <!-- Actions & Transactions will be added in next steps -->
      <PaymentActions
        :programId="progId(enr)"
        :year="String(payments.activeYear[progId(enr)] || 2026)"
        :monthIndex="payments.activeMonth[progId(enr)] ?? 0"
      />

      <PaymentTransactions :prog="progId(enr)" />
    </div>
  </div>

  <!-- ── Extras card ── -->
  <div
    v-if="payments.programs.find(p => p.id === 'extras')"
    class="prog"
    :class="{ open: openProg === 'extras' }"
  >
    <div class="prog-head" @click="toggleProg('extras')">
      <div class="prog-bar" style="background:linear-gradient(180deg,var(--amber),var(--orange))"></div>
      <div class="prog-info">
        <div class="prog-name">{{ extrasProgram.name }}</div>
        <div class="prog-sub">{{ t('payments.extras.subtitle') }} · {{ extrasProgram.extras?.length || 0 }} {{ t('payments.extras.items') }}</div>
      </div>
      <div class="prog-bal">
        <div class="prog-bal-val" style="color:var(--green)">{{ totalExtrasPaid }} зл</div>
        <div class="prog-bal-sub" style="color:var(--green)">{{ t('payments.extras.paid') }}</div>
      </div>
      <div class="prog-arrow">›</div>
    </div>
    <div class="prog-body" v-show="openProg === 'extras'">
      <div class="prog-inner" style="display:flex;flex-direction:column;gap:8px">
        <!-- Extra items -->
        <div
          v-for="item in extrasProgram.extras"
          :key="item.id"
          :style="{
            display: 'flex', alignItems: 'center', gap: '11px', padding: '11px 13px',
            background: item.status === 'paid' ? 'rgba(16,185,129,.06)' : 'rgba(79,110,247,.06)',
            border: `1px ${item.status === 'paid' ? 'solid' : 'dashed'} ${item.status === 'paid' ? 'rgba(16,185,129,.2)' : 'rgba(79,110,247,.2)'}`,
            borderRadius: '10px'
          }"
        >
          <span style="font-size:20px;flex-shrink:0">{{ item.icon }}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700">{{ item.title }}</div>
            <div style="font-size:11px;color:var(--dim);margin-top:1px">
              {{ item.price }} зл
              <template v-if="item.date"> · {{ item.date }}</template>
              <template v-if="item.txId"> · {{ item.txId }}</template>
              <template v-if="!item.date"> · {{ t('payments.extras.awaitingPayment') }}</template>
              · <span
                  :class="item.ksef === 'ok' ? 'kb kb-ok' : 'kb kb-pending'"
                  style="font-size:9px"
                >{{ item.ksef === 'ok' ? '✓ KSeF' : '🕐 KSeF ' + t('payments.extras.afterPayment') }}</span>
            </div>
          </div>
          <span
            style="font-family:'Space Mono',monospace;font-size:14px;font-weight:700;flex-shrink:0"
            :style="{ color: item.status === 'paid' ? 'var(--green)' : 'var(--blue)' }"
          >{{ item.price }} зл</span>
          <div class="tx-btns" style="flex-shrink:0">
            <div
              class="tx-btn"
              :title="item.status === 'paid' ? t('payments.tx.editInvoice') : t('payments.extras.afterPayment')"
              :style="item.status !== 'paid' ? 'opacity:.3;cursor:not-allowed' : ''"
              @click="item.status === 'paid' && modal.open('edit-invoice', { tx: item })"
            >✏️</div>
            <div
              class="tx-btn"
              :title="item.status === 'paid' ? t('payments.tx.korekta') : t('payments.extras.afterPayment')"
              :style="item.status !== 'paid' ? 'opacity:.3;cursor:not-allowed' : ''"
              @click="item.status === 'paid' && modal.open('korekta', { tx: item })"
            >📋</div>
            <div
              class="tx-btn"
              :title="item.status === 'paid' ? t('payments.tx.refund') : t('payments.extras.afterPayment')"
              :style="item.status !== 'paid' ? 'opacity:.3;cursor:not-allowed' : ''"
              @click="item.status === 'paid' && modal.open('refund', { tx: item })"
            >↩️</div>
          </div>
        </div>
        <div class="info-box info-blue" style="margin-bottom:0;font-size:11px">
          <span>ℹ️</span>
          <div>{{ t('payments.extras.infoText') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- ══════════════════════════════════════════════════════════ -->
<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { usePaymentsStore } from "../../../../../stores/payments.store";
import { useModalStore } from "../../../../../stores/modal.store";
import { TEACHERS_DB } from "../../../../../api/mockDb";
import type { MonthObj, Program, Enrollment } from "../../../../../api/mockDb";

import PaymentActions from "./PaymentActions.vue";
import PaymentTransactions from "./PaymentTransactions.vue";
import PaymentMonthDetail from "./PaymentMonthDetail.vue";

const { t } = useI18n();
const payments = usePaymentsStore();
const modal = useModalStore();
const { student: currentStudent } = storeToRefs(payments);

const MONTHS_SHORT = computed(() => {
  const arr = t('common.monthsShort');
  return Array.isArray(arr) ? arr : ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
});

const openProg = ref<string>("space");

const extrasProgram = computed(() => {
  const p = payments.programs.find(p => p.id === 'extras');
  return p || { name: '📚 Extras', sub: '', extras: [], balance: 0, balanceLabel: '' } as any;
});
const totalExtrasPaid = computed(() => {
  const items = extrasProgram.value.extras || [];
  return items.filter((e: any) => e.status === 'paid').reduce((sum: number, e: any) => sum + e.price, 0);
});

// ── helpers ──
function progId(e: Enrollment): string {
  return e.school.includes("Indigo") ? "indigo" : "space";
}
function progFor(e: Enrollment): Program | null {
  return payments.programs.find(p => p.id === progId(e)) || null;
}
function schedule(teacher?: string): string {
  if (!teacher) return "—";
  return TEACHERS_DB.find(t => t.name === teacher)?.schedule || "—";
}
function toggleProg(id: string) {
  openProg.value = openProg.value === id ? "" : id;
}
function balColor(b: number): string {
  return b > 0 ? "var(--green)" : b < 0 ? "var(--red)" : "var(--white)";
}

// status → icon
function icon(m: MonthObj): string {
  const MAP: Record<string, string> = {
    paid: '\u2713', pending: '\uD83D\uDD50', overdue: '\u26A0', pause: '\uD83C\uDF19',
    summer: '\u2600', partial: '\u25D0', 'extra-paid': '\u2795',
    'extra-pending': '\u2795', future: '\u00B7'
  };
  return MAP[m.s] || '\u00B7';
}

// status → label
function statusLabel(m: MonthObj): string {
  const MAP: Record<string, string> = {
    paid: t('payments.status.paid'), pending: t('payments.status.pending'),
    overdue: t('payments.status.overdue'), pause: t('payments.status.pause'),
    summer: t('payments.status.summer'), partial: t('payments.status.partial'),
    "extra-paid": t('payments.status.extra'), "extra-pending": t('payments.status.extra')
  };
  return MAP[m.s] || "";
}

// status → translated label
function statusLabelT(m: MonthObj): string {
  const keys: Record<string, string> = {
    paid: "payments.status.paid", pending: "payments.status.pending",
    overdue: "payments.status.overdue", pause: "payments.status.pause",
    summer: "payments.status.summer", partial: "payments.status.partial",
    "extra-paid": "payments.status.extra", "extra-pending": "payments.status.extra"
  };
  return keys[m.s] ? t(keys[m.s]) : "";
}

// status → color
function statusColor(m: MonthObj): string {
  const MAP: Record<string, string> = {
    paid: "var(--green)", pending: "var(--blue)", overdue: "var(--red)",
    pause: "var(--amber)", summer: "var(--gold)", partial: "var(--cyan)",
    "extra-paid": "var(--pink)", "extra-pending": "var(--pink)"
  };
  return MAP[m.s] || "rgba(255,255,255,.35)";
}

// transactions for program
function txsFor(p: Program) {
  return payments.transactionsByProgram[p.id] || p.transactions || [];
}
</script>

<!-- ══════════════════════════════════════════════════════════ -->
<style scoped>
/* ── PROGRAM CARD ── */
.prog {
  border: 1px solid var(--b);
  border-radius: 14px;
  margin-bottom: 12px;
  overflow: hidden;
  transition: border-color .2s;
}
.prog:hover { border-color: rgba(120,140,255,.30); }

.prog-head {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background .15s;
}
.prog-head:hover { background: rgba(255,255,255,.02); }

.prog-bar {
  width: 4px;
  border-radius: 2px;
  align-self: stretch;
  min-height: 32px;
  flex-shrink: 0;
}

.prog-info { flex: 1; min-width: 0; }
.prog-name { font-size: 13px; font-weight: 700; }
.prog-sub {
  font-size: 10.5px;
  color: var(--dim);
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.prog-bal { text-align: right; flex-shrink: 0; }
.prog-bal-val {
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  font-weight: 700;
}
.prog-bal-sub { font-size: 10px; color: var(--dim); margin-top: 1px; }

.prog-arrow {
  font-size: 11px;
  color: var(--dim);
  transition: transform .2s;
  flex-shrink: 0;
  margin-left: 4px;
}
.prog.open .prog-arrow { transform: rotate(90deg); }

.prog-body {
  display: none;
  border-top: 1px solid var(--b);
}
.prog.open .prog-body { display: block; }
.prog-inner { padding: 12px 16px; }

/* ── BADGES ── */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 9.5px;
  font-weight: 700;
}
.badge-child2 {
  background: rgba(236,72,153,.08);
  color: var(--pink);
  border: 1px solid rgba(236,72,153,.22);
  margin-left: 6px;
}

/* ── YEAR ROW ── */
.year-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.yr-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--dim);
  margin-right: 2px;
}
.yr-btn {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Space Mono', monospace;
  cursor: pointer;
  border: 1px solid var(--b);
  background: transparent;
  color: var(--dim);
  transition: all .15s;
}
.yr-btn.active {
  background: rgba(79,110,247,.15);
  border-color: rgba(79,110,247,.4);
  color: var(--blue);
}

.view-toggle { display: flex; gap: 4px; margin-left: auto; }
.vt-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--b);
  background: transparent;
  color: var(--dim);
  transition: all .15s;
  font-family: 'Outfit', sans-serif;
}
.vt-btn.active {
  background: rgba(79,110,247,.12);
  border-color: rgba(79,110,247,.3);
  color: var(--blue);
}

/* ═══ GRID ═══ */
.month-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
  margin-bottom: 12px;
}
.mcell {
  aspect-ratio: 1;
  border-radius: 9px;
  border: 1px solid var(--b);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  cursor: pointer;
  transition: all .18s;
  position: relative;
  background: rgba(255,255,255,.02);
  overflow: hidden;
  padding: 0;
}
.mcell:hover {
  border-color: rgba(120,140,255,.30);
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0,0,0,.3);
  z-index: 2;
}
.mcell.sel { box-shadow: 0 0 0 2px rgba(79,110,247,.5); }

.mc-name { font-size: 9.5px; font-weight: 700; color: var(--dim); letter-spacing: .02em; }
.mc-icon { font-size: 13px; line-height: 1; color: var(--white, #E8EEFF); }
.mc-amt { font-family: 'Space Mono', monospace; font-size: 8px; font-weight: 700; line-height: 1; }
.mc-pay { font-size: 8px; line-height: 1; font-weight: 700; }

/* corner badges */
.cbadge {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7px;
  font-weight: 800;
  border: 1.5px solid var(--bg);
  z-index: 3;
}
.cb-split { background: var(--cyan); color: #000; }
.cb-conflict { background: var(--orange); color: #000; right: 8px; }
.cb-error { background: var(--red); color: #fff; right: 8px; }

/* bonus strip at bottom of cell */
.bonus-strip {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: rgba(251,191,36,.25);
  border-top: 1px solid rgba(251,191,36,.5);
  font-size: 7px;
  font-weight: 800;
  color: var(--gold);
  text-align: center;
  padding: 2px 0;
  letter-spacing: .04em;
  border-radius: 0 0 7px 7px;
  z-index: 2;
}

/* ── STATUS SKINS ── */
.ms-paid          { border-color: rgba(16,185,129,.28); background: rgba(16,185,129,.07); }
.ms-paid .mc-name { color: var(--green); }
.ms-paid .mc-amt  { color: var(--green); }

.ms-pending          { border-color: rgba(79,110,247,.22); background: rgba(79,110,247,.06); }
.ms-pending .mc-name { color: var(--blue); }
.ms-pending .mc-amt  { color: var(--blue); }

.ms-overdue          { border-color: rgba(239,68,68,.3); background: rgba(239,68,68,.07); animation: cpulse 2s ease-in-out infinite; }
.ms-overdue .mc-name { color: var(--red); }
.ms-overdue .mc-amt  { color: var(--red); }

.ms-pause          { border-color: rgba(245,158,11,.25); background: rgba(245,158,11,.06); }
.ms-pause .mc-name { color: var(--amber); }

.ms-summer          { border-color: rgba(251,191,36,.2); background: rgba(251,191,36,.05); }
.ms-summer .mc-name { color: var(--gold); }

.ms-partial          { border-color: rgba(6,182,212,.3); background: linear-gradient(135deg, rgba(16,185,129,.1) 50%, rgba(245,158,11,.1) 50%); }
.ms-partial .mc-name { color: var(--cyan); }
.ms-partial .mc-amt  { color: var(--cyan); }

.ms-extra-paid          { border-color: rgba(236,72,153,.3); background: rgba(236,72,153,.08); border-style: dashed; }
.ms-extra-paid .mc-name { color: var(--pink); }

.ms-extra-pending          { border-color: rgba(79,110,247,.3); background: rgba(79,110,247,.06); border-style: dashed; }
.ms-extra-pending .mc-name { color: var(--blue); }

.ms-future { opacity: .28; }

/* add button */
.mcell-add {
  border-style: dashed;
  border-color: rgba(236,72,153,.22);
  background: rgba(236,72,153,.03);
  cursor: pointer;
}
.mcell-add:hover {
  background: rgba(236,72,153,.1);
  border-color: rgba(236,72,153,.5);
}

/* overdue pulse */
@keyframes cpulse {
  0%,100% { box-shadow: 0 0 0 rgba(239,68,68,.2); }
  50%     { box-shadow: 0 0 8px rgba(239,68,68,.4); }
}

/* ═══ TABLE ═══ */
.month-table-wrap { overflow-x: auto; }
.exp-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.exp-table th {
  font-size: 9px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: var(--dim);
  padding: 6px 8px; text-align: left;
  border-bottom: 1px solid var(--b);
  white-space: nowrap;
}
.exp-table td {
  padding: 6px 8px;
  border-bottom: 1px solid rgba(100,120,255,.06);
  vertical-align: middle;
  cursor: pointer;
}
.exp-table tr:hover td { background: rgba(79,110,247,.03); }
.exp-table tr.selrow td { background: rgba(79,110,247,.1); }

.td-mono { font-family: 'Space Mono', monospace; font-size: 10.5px; }
.td-amt  { font-weight: 700; font-size: 11.5px; }
.td-pay  { font-size: 11px; font-weight: 700; }
.td-dim  { font-size: 10px; color: var(--dim); }

.st {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 6px; border-radius: 5px;
  font-size: 10px; font-weight: 700; white-space: nowrap;
}

/* KSeF badges */
.kb {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 6px; border-radius: 5px;
  font-size: 10px; font-weight: 700; white-space: nowrap;
}
.kb-ok      { background: rgba(16,185,129,.1); color: var(--green); border: 1px solid rgba(16,185,129,.2); }
.kb-manual  { background: rgba(100,120,255,.1); color: var(--dim); border: 1px solid var(--b); }
.kb-pending { background: rgba(245,158,11,.1); color: var(--amber); border: 1px solid rgba(245,158,11,.2); animation: pamber 2s ease-in-out infinite; }
.kb-error   { background: rgba(239,68,68,.1); color: var(--red); border: 1px solid rgba(239,68,68,.2); }
.kb-conflict{ background: rgba(249,115,22,.1); color: var(--orange); border: 1px solid rgba(249,115,22,.2); }

@keyframes pamber {
  0%,100% { box-shadow: 0 0 3px rgba(245,158,11,.3); }
  50%     { box-shadow: 0 0 8px rgba(245,158,11,.5); }
}

/* ── EXTRAS TX ── */
.tx-row {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 10px;
  background: rgba(255,255,255,.025);
  border: 1px solid var(--b);
  border-radius: 9px;
  margin-bottom: 4px;
  transition: all .15s;
}
.tx-row:hover { border-color: rgba(120,140,255,.30); }
.tx-amt {
  font-family: 'Space Mono', monospace;
  font-size: 13px; font-weight: 700;
  white-space: nowrap; flex-shrink: 0;
}
</style>
