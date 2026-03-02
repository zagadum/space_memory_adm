<template>
  <div v-if="payments.loading" class="note">{{ t("common.loading") }}</div>
  <div v-else-if="payments.error" class="note" style="border-color:rgba(239,68,68,.35); background:rgba(239,68,68,.08)">
    {{ payments.error }}
  </div>

  <template v-else>
    <!-- BALANCE -->
    <div class="bal-row">
      <div class="bc" style="border-color:rgba(16,185,129,.25)">
        <div class="bc-label">{{ t("payments.overall") }}</div>
        <div class="bc-val" :style="{ color: payments.student?.totalBalance?.color || 'var(--white)' }">
          {{ payments.student?.totalBalance?.value || "—" }}
        </div>
        <div class="bc-sub">{{ payments.student?.totalBalance?.label || "" }}</div>
      </div>

      <div class="bc">
        <div class="bc-label">{{ t("payments.nextPay") }}</div>
        <div class="bc-val">{{ payments.student?.nextPay?.date || "—" }}</div>
        <div class="bc-sub">{{ payments.student?.nextPay?.approx || "" }}</div>
      </div>

      <div class="bc">
        <div class="bc-label">{{ t("payments.activePrograms") }}</div>
        <div class="bc-val">{{ payments.programs.length }}</div>
        <div class="bc-sub">Space · INDIGO · Extras</div>
      </div>
    </div>


    <!-- LEGEND -->
    <div class="legend">
      <div class="leg-title">{{ t("payments.legend.title") }}</div>
      <div class="leg-items">
        <div class="leg-item"><span class="leg-dot dot-paid"></span>{{ t("payments.legend.paid") }}</div>
        <div class="leg-item"><span class="leg-dot dot-pending"></span>{{ t("payments.legend.pending") }}</div>
        <div class="leg-item"><span class="leg-dot dot-overdue"></span>{{ t("payments.legend.overdue") }}</div>
        <div class="leg-item"><span class="leg-dot dot-pause"></span>{{ t("payments.legend.pause") }}</div>
        <div class="leg-item"><span class="leg-dot dot-summer"></span>{{ t("payments.legend.summer") }}</div>
        <div class="leg-item"><span class="leg-dot dot-extra"></span>{{ t("payments.legend.extra") }}</div>
      </div>
    </div>

    <!-- PROGRAMS -->
    <div v-for="p in payments.programs" :key="p.id" class="prog" :class="{ open: p.id === activeProgramId }">
      <div class="prog-head" @click="toggleProgram(p.id)">
        <div class="prog-bar" :style="{ background: p.barGradient }"></div>
        <div class="prog-info">
          <div class="prog-name">{{ p.name }}</div>
          <div class="prog-sub">
            <span v-if="p.tariff">{{ p.tariff }} зл/мес</span>
            <span v-if="p.sub"> · {{ p.sub }}</span>
          </div>
        </div>

        <div class="prog-bal">
          <div class="prog-bal-val" :style="{ color: p.balance>=0 ? 'var(--green)' : 'var(--red)' }">
            {{ p.balance>=0 ? "+" : "" }}{{ p.balance }} zł
          </div>
          <div class="prog-bal-sub">{{ p.balanceLabel }}</div>
        </div>
        <div class="prog-arrow">›</div>
      </div>

      <div class="prog-body">
        <div class="prog-inner">
          <div class="year-row">
            <span class="yr-label">{{ t("payments.year") }}</span>
            <button
              v-for="y in yearsOf(p)"
              :key="y"
              class="yr-btn"
              :class="{ active: yearByProgram[p.id] === y }"
              @click="yearByProgram[p.id] = y"
            >
              {{ y }}
            </button>

            <div class="view-toggle">
              <button class="vt-btn" :class="{ active: viewMode[p.id] !== 'table' }" @click.stop="viewMode[p.id]='grid'">{{ t("payments.view.grid") }}</button>
              <button class="vt-btn" :class="{ active: viewMode[p.id] === 'table' }" @click.stop="viewMode[p.id]='table'">{{ t("payments.view.table") }}</button>
            </div>
          </div>

          <div v-if="viewMode[p.id] !== 'table'" class="month-grid">
            <button
              v-for="(m, idx) in monthsFor(p)"
              :key="idx"
              class="mcell"
              :class="[statusClass(m), { sel: selected[p.id] === idx }]"
              @click="selected[p.id] = idx"
              type="button"
            >
              <div class="mc-name">{{ monthNames[idx] }}</div>
              <div class="mc-icon">{{ iconFor(m) }}</div>
              <div class="mc-amt">{{ m.amount ? m.amount + ' zł' : '' }}</div>
              <div class="mc-pay" :style="{ color: payColor(m) }">{{ payLabel(m) }}</div>
              <div class="mc-sub">{{ subLabel(m) }}</div>
              <div v-if="badgeFor(m)" class="cbadge" :class="badgeClass(m)">{{ badgeFor(m) }}</div>
            </button>
          </div>

          <div v-else class="month-table-wrap">
            <table class="month-table">
              <thead>
                <tr>
                  <th>{{ t("payments.table.month") }}</th>
                  <th>{{ t("payments.table.status") }}</th>
                  <th>{{ t("payments.table.amount") }}</th>
                  <th>{{ t("payments.table.ksef") }}</th>
                  <th>{{ t("payments.table.lessons") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(m, idx) in monthsFor(p)" :key="idx" :class="[statusClass(m), { selrow: selected[p.id]===idx }]" @click="selected[p.id]=idx">
                  <td class="mt-month">{{ monthNames[idx] }}</td>
                  <td>{{ payLabelT(m) }}</td>
                  <td>{{ m.amount ? (m.amount + ' zł') : '—' }}</td>
                  <td>{{ m.ksef ?? "—" }}</td>
                  <td>G1: {{ m.g1 }} · G2: {{ m.g2 }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="currentMonth(p)" class="month-detail">
            <div class="md-head">
              <div class="md-title">{{ monthNames[selected[p.id] ?? 0] }} · {{ yearByProgram[p.id] }}</div>
              <div style="display:flex; gap:6px; flex-wrap:wrap">
                <button class="btn btn-sm btn-ghost" @click="openEditInvoice(p)">✏️ {{ t("payments.btn.invoice") }}</button>
                <button class="btn btn-sm btn-ghost" @click="openRefund(p)">↩️ {{ t("payments.btn.refund") }}</button>
                <button class="btn btn-sm btn-ghost" @click="modal.open('korekta', { programId: p.id, year: yearByProgram[p.id], monthIndex: selected[p.id] ?? 0 })">📋 {{ t("payments.btn.korekta") }}</button>
              </div>
            </div>

            <div class="md-rows">
              <div class="md-row"><div class="md-k">{{ t("payments.month.status") }}</div><div class="md-v">{{ currentMonth(p)?.status }}</div></div>
              <div class="md-row"><div class="md-k">{{ t("payments.month.amount") }}</div><div class="md-v">{{ currentMonth(p)?.amount }} zł</div></div>
              <div class="md-row"><div class="md-k">KSeF</div><div class="md-v">{{ currentMonth(p)?.ksef ?? "—" }}</div></div>
              <div class="md-row"><div class="md-k">{{ t("payments.month.lessons") }}</div><div class="md-v">G1: {{ currentMonth(p)?.g1 }} · G2: {{ currentMonth(p)?.g2 }}</div></div>
            </div>

            <div class="note" style="margin:0">
              {{ t("payments.actions") }}
              <button class="btn btn-sm btn-amber" @click="modal.open('tariff', { programId: p.id, year: yearByProgram[p.id], monthIndex: selected[p.id] ?? 0 })">{{ t("payments.btn.tariff") }}</button>
              <button class="btn btn-sm btn-cyan" @click="modal.open('discount', { programId: p.id, year: yearByProgram[p.id], monthIndex: selected[p.id] ?? 0 })">{{ t("payments.btn.discount") }}</button>
              <button class="btn btn-sm btn-amber" @click="modal.open('pause', { programId: p.id })">{{ t("payments.btn.pause") }}</button>
              <button class="btn btn-sm btn-cyan" @click="modal.open('extra', { programId: p.id })">{{ t("payments.btn.extra") }}</button>
              <button class="btn btn-sm btn-unlock" @click="modal.open('unlock', { programId: p.id })">{{ t("payments.btn.unlock") }}</button>
              <button class="btn btn-sm btn-archive" @click="modal.open('archive', { programId: p.id })">{{ t("payments.btn.archive") }}</button>
              <button class="btn btn-sm btn-ghost" @click="modal.open('group-split', { programId: p.id })">{{ t("payments.btn.split") }}</button>
              <button class="btn btn-sm btn-green" @click="modal.open('resume', { programId: p.id })">{{ t("payments.btn.resume") }}</button>
            </div>
          </div>

          <!-- TRANSACTIONS -->
          <div class="tx-section" :class="{ open: openTx[p.id] }">
            <div class="tx-toggle" @click="toggleTx(p.id)">
              <div class="tx-toggle-left">💳 {{ t("payments.tx.title") }}</div>
              <div style="display:flex;align-items:center;gap:7px">
                <span class="tx-cnt">{{ txsFor(p).length }} {{ t("payments.tx.count") }}</span>
                <div class="tx-arrow" :class="{ open: openTx[p.id] }">›</div>
              </div>
            </div>

            <div class="tx-body">
              <div v-if="payments.txLoading[p.id]" class="note">{{ t("payments.tx.loading") }}</div>
              <div v-else-if="payments.txError[p.id]" class="note" style="border-color:rgba(239,68,68,.35); background:rgba(239,68,68,.08)">{{ payments.txError[p.id] }}</div>
              
              <div v-else>
                <div v-for="(tx, i) in txsFor(p)" :key="tx.id || i" class="tx-item">
                  <div class="tx-row" @click="toggleTxItem(p.id, tx)">
                    <div class="tx-date">{{ tx.date }}</div>
                    <div class="tx-desc">
                      <div class="tx-title">{{ tx.title }}</div>
                      <div class="tx-sub">{{ tx.sub }}</div>
                    </div>

                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex-shrink:0">
                      <div class="tx-amt" :class="{ pos: tx.paid, neg: !tx.paid }">{{ tx.amount }}</div>
                      <div class="tx-tags">
                        <span class="tag" :class="tx.paid ? 'tag-paid' : 'tag-pending'">
                          {{ tx.paid ? t("payments.tx.paid") : t("payments.tx.pending") }}
                        </span>
                        <span v-if="tx.ksef" class="tag tag-ksef">{{ tx.ksef }}</span>
                        <span v-if="tx.fvnum" class="tag tag-fv" @click.stop="openTxEditInvoice(p, tx)">FV</span>
                        <span class="tag tag-refund" @click.stop="openTxRefund(p, tx)">↩</span>
                      </div>
                    </div>
                  </div>

                  <div v-if="isTxItemOpen(p.id, tx)" class="tx-detail">
                    <div class="tx-detail-row">
                      <button class="btn btn-sm btn-ghost" @click.stop="openTxEditInvoice(p, tx)">✏️ {{ t("payments.btn.invoice") }}</button>
                      <button class="btn btn-sm btn-ghost" @click.stop="openTxKorekta(p, tx)">📋 {{ t("payments.btn.korekta") }}</button>
                      <button class="btn btn-sm btn-ghost" @click.stop="openTxRefund(p, tx)">↩️ {{ t("payments.btn.refund") }}</button>
                    </div>
                  </div>
                </div>


                <div class="ksef-wrap">
                  <div class="ksef-title">🧾 {{ t("payments.ksef.title") }}</div>

                  <div v-if="payments.ksefLoading[p.id]" class="note">{{ t("payments.ksef.loading") }}</div>
                  <div v-else-if="payments.ksefError[p.id]" class="note" style="border-color:rgba(239,68,68,.35); background:rgba(239,68,68,.08)">{{ payments.ksefError[p.id] }}</div>
                  <div v-else>
                    <div v-for="inv in ksefFor(p)" :key="inv.fvnum" class="ksef-row">
                      <div class="ksef-fv">{{ inv.fvnum }}</div>
                      <div class="ksef-desc">{{ inv.title }}</div>
                      <div class="ksef-st" :class="inv.statusClass">{{ inv.status }}</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          
          <!-- EXTRAS / MATERIALS -->
          <div v-if="p.id === 'extras' && p.extras?.length" class="extras-sec" :class="{ open: openExtras[p.id] }">
            <div class="extras-toggle" @click="openExtras[p.id] = !openExtras[p.id]">
              <div class="extras-title">📚 {{ t("payments.extras.title") }}</div>
              <div class="extras-right">
                <span class="extras-cnt">{{ p.extras.length }} {{ t("payments.extras.count") }}</span>
                <span class="extras-arr">›</span>
              </div>
            </div>

            <div class="extras-body">
              <div v-for="(e, i) in p.extras" :key="i" class="extras-item">
                <div class="ex-ic">{{ e.icon }}</div>
                <div class="ex-desc">
                  <div class="ex-name">{{ e.title }}</div>
                  <div class="ex-sub">{{ e.meta }}</div>
                </div>

                <div class="extras-btns">
                  <button class="btn btn-sm btn-ghost" @click.stop="openExtraEditInvoice(p, e)">✏️</button>
                  <button class="btn btn-sm btn-ghost" @click.stop="openExtraKorekta(p, e)">📋</button>
                  <button class="btn btn-sm btn-ghost" @click.stop="openExtraRefund(p, e)">↩️</button>
                </div>

                <div class="ex-amt">{{ e.amount }}</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { usePaymentsStore } from "../stores/payments.store";
import { useModalStore } from "../stores/modal.store";
import type { MonthItem, Program } from "../api/mockDb";

const { t, tm } = useI18n();
const payments = usePaymentsStore();
const modal = useModalStore();

const monthNames = (tm("common.monthsShort") as string[]) || ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const activeProgramId = ref<string>("space");
const yearByProgram = reactive<Record<string, string>>({});
const selected = reactive<Record<string, number>>({});
const openTx = reactive<Record<string, boolean>>({});
const viewMode = reactive<Record<string, "grid" | "table">>({});
const openExtras = reactive<Record<string, boolean>>({});
const txItemOpen = reactive<Record<string, string | null>>({});


onMounted(() => {
  if (!payments.student) payments.loadStudent("s_1");
});

function toggleProgram(id: string) {
  activeProgramId.value = activeProgramId.value === id ? "" : id;
}

function yearsOf(p: Program) {
  const ys = Object.keys(p.years || {});
  if (!ys.length) return ["2026"];
  if (!yearByProgram[p.id]) yearByProgram[p.id] = ys[ys.length - 1];
  return ys;
}

function monthsFor(p: Program): MonthItem[] {
  const y = yearByProgram[p.id] || yearsOf(p)[0];
  const arr = (p.years?.[y] || []) as MonthItem[];
  // ensure 12
  const out = Array.from({ length: 12 }, (_, i) => arr[i] || ({ status: "future", amount: 0, ksef: null, g1: 0, g2: 0 } as MonthItem));
  if (selected[p.id] == null) selected[p.id] = 0;
  if (openTx[p.id] == null) openTx[p.id] = false;
  if (viewMode[p.id] == null) viewMode[p.id] = "grid";
  if (openExtras[p.id] == null) openExtras[p.id] = true;
  return out;
}

function currentMonth(p: Program): MonthItem | null {
  const idx = selected[p.id] ?? 0;
  return monthsFor(p)[idx] || null;
}

function statusClass(m: MonthItem) {
  return {
    paid: "ms-paid",
    pending: "ms-pending",
    overdue: "ms-overdue",
    pause: "ms-pause",
    summer: "ms-summer",
    partial: "ms-partial",
    "extra-paid": "ms-extra-paid",
    "extra-pending": "ms-extra-pending",
    future: "ms-future",
  }[m.status] || "";
}

function iconFor(m: MonthItem) {
  const map: Record<string, string> = {
    paid: "✓",
    pending: "🕐",
    overdue: "⚠️",
    pause: "⏸",
    summer: "☀️",
    partial: "➗",
    "extra-paid": "➕",
    "extra-pending": "➕",
    future: "•",
  };
  return map[m.status] || "•";
}

function payLabel(m: MonthItem) {
  if (m.status === "paid") return "PAID";
  if (m.status === "overdue") return "OVERDUE";
  if (m.status === "pending") return "PENDING";
  if (m.status === "pause") return "PAUSE";
  if (m.status === "summer") return "SUMMER";
  if (m.status === "partial") return "PART";
  if (m.status.startsWith("extra")) return "EXTRA";
  return "";
}

function payLabelT(m: MonthItem) {
  if (m.status === "paid") return t("payments.status.paid");
  if (m.status === "overdue") return t("payments.status.overdue");
  if (m.status === "pending") return t("payments.status.pending");
  if (m.status === "pause") return t("payments.status.pause");
  if (m.status === "summer") return t("payments.status.summer");
  if (m.status === "partial") return t("payments.status.partial");
  if (String(m.status).startsWith("extra")) return t("payments.status.extra");
  return "";
}

function payColor(m: MonthItem) {
  if (m.status === "paid") return "var(--green)";
  if (m.status === "overdue") return "var(--red)";
  if (m.status === "pending") return "var(--blue)";
  if (m.status === "pause") return "var(--amber)";
  if (m.status === "summer") return "var(--gold)";
  if (m.status === "partial") return "var(--purple)";
  if (m.status.startsWith("extra")) return "var(--cyan)";
  return "rgba(255,255,255,.35)";
}

function subLabel(m: MonthItem) {
  if (m.disc && m.discAmt) return `${t("payments.labels.discountShort")} −${m.discAmt} zł`;
  if (m.pauseUntil) return `${t("payments.labels.until")} ${m.pauseUntil}`;
  if (m.teacher) return m.teacher;
  return m.ksef ? `KSeF: ${m.ksef}` : "";
}

function badgeFor(m: MonthItem) {
  if (m.ksef === "ok") return "K";
  if (m.ksef === "manual") return "M";
  if (m.ksef === "pending") return "…";
  if (m.ksef === "error") return "!";
  if (m.ksef === "conflict") return "⚡";
  return "";
}

function badgeClass(m: MonthItem) {
  const k = m.ksef;
  return k ? `cb-${k}` : "";
}

async function toggleTx(programId: string) {
  openTx[programId] = !openTx[programId];
  if (openTx[programId]) {
    await Promise.all([payments.loadTransactions(programId), payments.loadKsefInvoices(programId)]);
  }
}

function txsFor(p: Program) {
  return payments.transactionsByProgram[p.id] || (p as any).transactions || [];
}

function ksefFor(p: Program) {
  return payments.ksefInvoicesByProgram[p.id] || [];
}

function toggleTxItem(programId: string, tx: any) {
  const id = tx?.id || tx?.fvnum || String(Math.random());
  txItemOpen[programId] = txItemOpen[programId] === id ? null : id;
}

function isTxItemOpen(programId: string, tx: any) {
  const id = tx?.id || tx?.fvnum;
  return txItemOpen[programId] === id;
}

function openTxEditInvoice(p: Program, tx: any) {
  const idx = selected[p.id] ?? 0;
  const year = yearByProgram[p.id] || yearsOf(p)[0];
  modal.open("edit-invoice", { programId: p.id, year, monthIndex: idx, tx, headerText: `${tx?.fvnum || ""} · ${tx?.title || ""}`.trim() });
}

function openTxKorekta(p: Program, tx: any) {
  const idx = selected[p.id] ?? 0;
  const year = yearByProgram[p.id] || yearsOf(p)[0];
  modal.open("korekta", { programId: p.id, year, monthIndex: idx, tx, headerText: `${t("payments.korekta.forInvoice")} ${tx?.fvnum || ""} · ${tx?.title || ""}`.trim() });
}

function openTxRefund(p: Program, tx: any) {
  modal.open("refund", { programId: p.id, fvnum: tx?.fvnum, headerText: `${t("payments.refund.forInvoice")} ${tx?.fvnum || ""} · ${tx?.title || ""}`.trim() });
}

function openExtraEditInvoice(p: Program, e: any) {
  const year = yearByProgram[p.id] || yearsOf(p)[0];
  modal.open("edit-invoice", { programId: p.id, year, monthIndex: 0, item: e, headerText: `${e?.fvnum || ""} · ${e?.title || ""}`.trim() });
}
function openExtraKorekta(p: Program, e: any) {
  const year = yearByProgram[p.id] || yearsOf(p)[0];
  modal.open("korekta", { programId: p.id, year, monthIndex: 0, item: e, headerText: `${t("payments.korekta.forInvoice")} ${e?.fvnum || ""} · ${e?.title || ""}`.trim() });
}
function openExtraRefund(p: Program, e: any) {
  modal.open("refund", { programId: p.id, fvnum: e?.fvnum, headerText: `${t("payments.refund.forInvoice")} ${e?.fvnum || ""} · ${e?.title || ""}`.trim() });
}

function openEditInvoice(p: Program) {
  const idx = selected[p.id] ?? 0;
  const year = yearByProgram[p.id] || yearsOf(p)[0];
  const tx = txsFor(p).find((x: any) => x.fvnum) || null;
  modal.open("edit-invoice", { programId: p.id, year, monthIndex: idx, tx });
}

function openRefund(p: Program) {
  const tx = txsFor(p).find((x: any) => x.fvnum) || null;
  modal.open("refund", { programId: p.id, fvnum: tx?.fvnum });
}
</script>
