<template>
  <!-- Programs accordion -->
  <div
    v-for="(prog, idx) in payments.programs"
    :key="prog.id"
    class="prog"
    :class="{ open: prog.id === openProg }"
  >
    <!-- ── head ── -->
    <div class="prog-head" @click="toggleProg(prog.id)">
      <div
        class="prog-bar"
        :style="{ background: prog.barGradient || 'var(--blue)' }"
      ></div>

      <div class="prog-info">
        <div class="prog-name">{{ prog.name }}</div>
        <div class="prog-sub">
          <span>{{ prog.sub }}</span>
        </div>
      </div>

      <div class="prog-bal">
        <div
          class="prog-bal-val"
          :style="{ color: balColor(prog.balance) }"
        >
          {{ prog.balance > 0 ? '+' : '' }}{{ prog.balance }} zł
        </div>
        <div class="prog-bal-sub">{{ prog.balanceLabel || t('payments.balance') }}</div>
      </div>

      <div class="prog-arrow">›</div>
    </div>

    <!-- ── body ── -->
    <div class="prog-body" v-show="prog.id === openProg">
      <div class="prog-inner">

        <!-- Скелетон пока грузится календарь -->
        <div v-if="payments.calendarLoading[prog.id]" class="calendar-skeleton">
          <div class="skel-bar"></div>
          <div class="skel-grid">
            <div v-for="n in 12" :key="n" class="skel-cell"></div>
          </div>
        </div>

        <!-- Ошибка загрузки календаря -->
        <div v-else-if="payments.calendarError[prog.id]" class="calendar-error">
          ⚠️ {{ payments.calendarError[prog.id] }}
          <button class="retry-btn-sm" @click="payments.loadCalendar(prog.id)">
            🔄 {{ t('common.retry') }}
          </button>
        </div>

        <template v-else>
        <!-- year toggle + view toggle -->
        <div class="year-row">
          <span class="yr-label">{{ t("payments.year") }}</span>
          <button
            v-for="y in payments.yearsForProgram(prog.id)"
            :key="y"
            class="yr-btn"
            :class="{ active: payments.activeYear[prog.id] === y }"
            @click="payments.setYear(prog.id, y)"
          >
            {{ y }}
          </button>

          <div class="view-toggle">
            <button
              class="vt-btn"
              :class="{ active: payments.activeView[prog.id] !== 'table' }"
              @click.stop="payments.setView(prog.id, 'grid')"
            >⬛ {{ t("payments.view.grid") }}</button>
            <button
              class="vt-btn"
              :class="{ active: payments.activeView[prog.id] === 'table' }"
              @click.stop="payments.setView(prog.id, 'table')"
            >☰ {{ t("payments.view.table") }}</button>
          </div>
        </div>

        <!-- ════════ GRID VIEW ════════ -->
        <div
          v-if="payments.activeView[prog.id] !== 'table'"
          class="month-grid"
        >
          <button
            v-for="(m, i) in payments.monthsForProgram(prog.id)"
            :key="i"
            type="button"
            class="mcell"
            :class="['ms-' + m.s, { sel: payments.activeMonth[prog.id] === i }]"
            @click="payments.setMonth(prog.id, i)"
          >
            <!-- KSeF / split / bonus badges -->
            <div v-if="m.split" class="cbadge cb-split">⇄</div>
            <div v-if="m.ksef === 'conflict'" class="cbadge cb-conflict">!</div>
            <div v-if="m.ksef === 'error'" class="cbadge cb-error">✕</div>
            <div v-if="m.bonus" class="bonus-strip">⭐ {{ t('payments.detail.bonus').replace('⭐ ','') }}</div>

            <div class="mc-name">{{ shortMonths[i] }}</div>
            
            <div class="mc-status" v-if="m.s !== 'future'" :style="{ color: statusData(m).color }">
              <span class="mcs-icon">{{ statusData(m).icon }}</span>
              <span class="mcs-text">{{ statusData(m).label }}</span>
            </div>

            <div class="mc-amt" v-if="m.s !== 'future'">{{ m.a ? m.a + ' zł' : '—' }}</div>
          </button>

          <!-- + Доп. занятие -->
          <button
            class="mcell mcell-add"
            @click="modal.open('extra', { programId: prog.id })"
          >
            <div style="font-size:20px;color:var(--pink)">＋</div>
            <div style="font-size:10px;color:var(--pink);font-weight:700;margin-top:2px">{{ t('payments.btn.extra') }}</div>
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
                v-for="(m, i) in payments.monthsForProgram(prog.id)"
                :key="i"
                :class="['ms-' + m.s, { selrow: payments.activeMonth[prog.id] === i }]"
                @click="payments.setMonth(prog.id, i)"
              >
                <td class="td-mono">{{ shortMonths[i] }}</td>
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
          v-if="payments.activeMonth[prog.id] != null"
          :prog="prog.id"
          :monthIdx="payments.activeMonth[prog.id]!"
          :year="payments.activeYear[prog.id] || 2026"
          :month="payments.currentMonth(prog.id)"
        />

      </div><!-- /prog-inner, end calendar template -->
        </template><!-- /v-else calendar loaded -->

      <!-- Actions & Transactions will be added in next steps -->
      <PaymentActions
        :programId="prog.id"
        :year="String(payments.activeYear[prog.id] || 2026)"
        :monthIndex="payments.activeMonth[prog.id] ?? 0"
      />

      <PaymentTransactions :prog="prog.id" />
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
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { usePaymentsStore } from "../../../../../stores/payments.store";
import { useModalStore } from "../../../../../stores/modal.store";
import type { MonthObj, Program } from "../../../../../api/mockDb";

import PaymentActions from "./PaymentActions.vue";
import PaymentTransactions from "./PaymentTransactions.vue";
import PaymentMonthDetail from "./PaymentMonthDetail.vue";

const { t, tm } = useI18n();
const payments = usePaymentsStore();
const modal = useModalStore();
const { student: currentStudent } = storeToRefs(payments);

// MONTHS_SHORT is now directly used in template via shortMonths computed
const shortMonths = computed(() => tm('common.monthsShort') as string[]);

// Открываем первую программу по умолчанию
const openProg = ref<string>("");

// Автоматически открываем первую программу при загрузке данных
watch(() => payments.programs, (newPrograms) => {
  if (newPrograms.length > 0 && !openProg.value) {
    openProg.value = newPrograms[0].id;
  }
}, { immediate: true });

const extrasProgram = computed(() => {
  const p = payments.programs.find(p => p.id === 'extras');
  return p || { name: '📚 Extras', sub: '', extras: [], balance: 0, balanceLabel: '' } as any;
});
const totalExtrasPaid = computed(() => {
  const items = extrasProgram.value.extras || [];
  return items.filter((e: any) => e.status === 'paid').reduce((sum: number, e: any) => sum + e.price, 0);
});

// ── helpers ──
function toggleProg(id: string) {
  const isOpening = openProg.value !== id;
  openProg.value = openProg.value === id ? "" : id;

  // При открытии проекта — загружаем календарь (если ещё не загружен)
  if (isOpening) {
    payments.loadCalendar(id);
  }
}
function balColor(b: number): string {
  return b > 0 ? "var(--green)" : b < 0 ? "var(--red)" : "var(--white)";
}

// ── status logic audit ──
function statusData(m: MonthObj) {
  const s = m.s;
  const data = {
    icon: '\u00B7',
    label: '',
    color: 'rgba(255,255,255,.35)',
    key: ''
  };

  const MAP: Record<string, { i: string; k: string; c: string }> = {
    paid:    { i: '\u2713', k: 'payments.status.paid',    c: 'var(--green)' },
    pending: { i: '\u231B', k: 'payments.status.pending', c: 'var(--blue)'  },
    overdue: { i: '\u26A0', k: 'payments.status.overdue', c: 'var(--red)'   },
    pause:   { i: '\uD83C\uDF19', k: 'payments.status.pause',   c: 'var(--amber)' },
    summer:  { i: '\u2600', k: 'payments.status.summer',  c: 'var(--gold)'  },
    partial: { i: '\u25D0', k: 'payments.status.partial', c: 'var(--cyan)'  },
    "extra-paid":    { i: '\u2795', k: 'payments.status.extra', c: 'var(--pink)' },
    "extra-pending": { i: '\u2795', k: 'payments.status.extra', c: 'var(--pink)' },
    future:  { i: '\u00B7', k: 'payments.status.future',  c: 'rgba(255,255,255,.35)' }
  };

  const entry = MAP[s] || MAP.future;
  data.icon = entry.i;
  data.key = 'payments.status.' + s;
  data.label = t(data.key);
  data.color = entry.c;

  return data;
}

// Deprecated in favor of statusData, but kept for table view compatibility if needed
function icon(m: MonthObj): string {
  return statusData(m).icon;
}
function statusLabel(m: MonthObj): string {
  return statusData(m).label;
}
function statusLabelT(m: MonthObj): string {
  return statusData(m).label;
}
function statusColor(m: MonthObj): string {
  return statusData(m).color;
}

// transactions for program
function txsFor(p: Program) {
  return payments.transactionsByProgram[p.id] || p.transactions || [];
}
</script>

<!-- ══════════════════════════════════════════════════════════ -->
<style scoped>
/* ── CALENDAR SKELETON ── */
.calendar-skeleton { padding: 16px 0; }
.skel-bar {
  height: 28px; width: 200px; border-radius: 6px;
  background: linear-gradient(90deg, rgba(255,255,255,.06) 25%, rgba(255,255,255,.12) 50%, rgba(255,255,255,.06) 75%);
  background-size: 400% 100%;
  animation: shimmer 1.4s infinite;
  margin-bottom: 12px;
}
.skel-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
.skel-cell {
  height: 52px; border-radius: 8px;
  background: linear-gradient(90deg, rgba(255,255,255,.06) 25%, rgba(255,255,255,.12) 50%, rgba(255,255,255,.06) 75%);
  background-size: 400% 100%;
  animation: shimmer 1.4s infinite;
}
.skel-cell:nth-child(odd) { animation-delay: .1s; }
@keyframes shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }

/* ── CALENDAR ERROR ── */
.calendar-error {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-radius: 8px;
  background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.25);
  font-size: 13px; color: rgba(255,255,255,.7);
}
.retry-btn-sm {
  background: rgba(239,68,68,.2); border: 1px solid rgba(239,68,68,.4);
  color: #fff; border-radius: 6px; padding: 4px 10px;
  font-size: 12px; cursor: pointer;
}
.retry-btn-sm:hover { background: rgba(239,68,68,.35); }

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

.mc-name { font-size: 11px; font-weight: 800; color: var(--dim); letter-spacing: .02em; margin-bottom: 2px; text-transform: uppercase; }
.mc-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 3px;
}
.mcs-icon { font-size: 12px; line-height: 1; }
.mcs-text { font-size: 10px; opacity: 0.9; }
.mc-amt { font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 800; line-height: 1; }

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
