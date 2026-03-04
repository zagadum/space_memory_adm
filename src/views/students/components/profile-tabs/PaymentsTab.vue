<template>
  <div v-if="payments.loading" class="note">{{ t("common.loading") }}</div>
  <div v-else-if="payments.error" class="note" style="border-color:rgba(239,68,68,.35); background:rgba(239,68,68,.08)">
    {{ payments.error }}
  </div>

  <template v-else>
    <div class="bal-row">
      <div class="bc" style="border-color:rgba(16,185,129,.25)">
        <div class="bc-label">{{ t("payments.overall") }}</div>
        <div class="bc-val" :style="{ color: payments.student?.totalBalance?.color || 'var(--green)' }">
          {{ payments.student?.totalBalance?.value || "—" }}
        </div>
        <div class="bc-sub" style="color:var(--green)">{{ payments.student?.totalBalance?.label || "переплата" }}</div>
      </div>

      <div class="bc">
        <div class="bc-label">{{ t("payments.nextPay") }}</div>
        <div class="bc-val" style="color:var(--blue);font-size:13px">{{ payments.student?.nextPay?.date || "—" }}</div>
        <div class="bc-sub">{{ payments.student?.nextPay?.approx || "с учётом скидок" }}</div>
      </div>

      <div class="bc">
        <div class="bc-label">{{ t("payments.activePrograms") }}</div>
        <div class="bc-val">{{ currentStudent?.enrollments?.length || 0 }}</div>
        <div class="bc-sub">Space · INDIGO · Extras</div>
      </div>
    </div>

    <div class="legend">
      <div class="li"><div class="ld" style="background:rgba(16,185,129,.6)"></div>{{ t("payments.legend.paid") }}</div>
      <div class="li"><div class="ld" style="background:rgba(79,110,247,.6)"></div>{{ t("payments.legend.pending") }}</div>
      <div class="li"><div class="ld" style="background:rgba(239,68,68,.6)"></div>{{ t("payments.legend.overdue") }}</div>
      <div class="li"><div class="ld" style="background:rgba(245,158,11,.6)"></div>{{ t("payments.legend.pause") }}</div>
      <div class="li"><div class="ld" style="background:rgba(251,191,36,.6)"></div>{{ t("payments.legend.summer") }}</div>
      <div class="li"><div class="ld" style="background:linear-gradient(135deg,rgba(16,185,129,.5) 50%,rgba(245,158,11,.5) 50%)"></div>Частичная пауза</div>
      <div class="li"><div class="ld" style="background:rgba(236,72,153,.5);border:1px dashed rgba(236,72,153,.5)"></div>{{ t("payments.legend.extra") }}</div>
    </div>

    <!-- Iterate over enrollments -->
    <div v-for="(enr, idx) in currentStudent?.enrollments" :key="idx" class="prog" :class="{ open: getProgramId(enr) === activeProgramId }">
      <div class="prog-head" @click="toggleProgram(getProgramId(enr))">
        <div class="prog-bar" :style="{ background: enr.school.includes('Indigo') ? 'linear-gradient(180deg,var(--purple),var(--pink))' : 'linear-gradient(180deg,var(--blue),var(--purple))' }"></div>
        <div class="prog-info">
          <div class="prog-name">{{ enr.school }}</div>
          <div class="prog-sub">
            <span>{{ enr.group }} · {{ enr.teacher }}</span>
            <span> · {{ getSchedule(enr.teacher) }}</span>
            <span v-if="enr.school.includes('Indigo')" class="badge badge-child2" style="font-size:9.5px;margin-left:6px">👧 2-й ребёнок · <strong>−10% семья</strong></span>
          </div>
        </div>

        <div class="prog-bal" v-if="getProgramForEnrollment(enr)">
          <div class="prog-bal-val" :style="{ color: (getProgramForEnrollment(enr)?.balance || 0) > 0 ? 'var(--green)' : (getProgramForEnrollment(enr)?.balance || 0) < 0 ? 'var(--red)' : 'var(--white)' }">
            {{ (getProgramForEnrollment(enr)?.balance || 0) > 0 ? "+" : "" }}{{ getProgramForEnrollment(enr)?.balance }} zł
          </div>
          <div class="prog-bal-sub">{{ getProgramForEnrollment(enr)?.balanceLabel || 'баланс' }}</div>
        </div>
        <div class="prog-arrow">›</div>
      </div>

      <div class="prog-body" v-if="getProgramForEnrollment(enr)" v-show="getProgramId(enr) === activeProgramId">
        <div class="prog-inner">
          <div class="year-row">
            <span class="yr-label">{{ t("payments.year") }}</span>
            <button
              v-for="y in yearsOf(getProgramForEnrollment(enr)!)"
              :key="y"
              class="yr-btn"
              :class="{ active: yearByProgram[getProgramId(enr)] === y }"
              @click="yearByProgram[getProgramId(enr)] = y"
            >
              {{ y }}
            </button>

            <div class="view-toggle">
              <button class="vt-btn" :class="{ active: viewMode[getProgramId(enr)] !== 'table' }" @click.stop="viewMode[getProgramId(enr)]='grid'">⬛ {{ t("payments.view.grid") }}</button>
              <button class="vt-btn" :class="{ active: viewMode[getProgramId(enr)] === 'table' }" @click.stop="viewMode[getProgramId(enr)]='table'">☰ {{ t("payments.view.table") }}</button>
            </div>
          </div>

          <!-- GRID VIEW -->
          <div v-if="viewMode[getProgramId(enr)] !== 'table'" class="month-grid">
            <button
              v-for="(m, midx) in monthsFor(getProgramForEnrollment(enr)!)"
              :key="midx"
              class="mcell"
              :class="[statusClass(m), { sel: selected[getProgramId(enr)] === midx }]"
              @click="selected[getProgramId(enr)] = midx"
              type="button"
            >
              <div v-if="m.split" class="cbadge" style="background:var(--cyan);color:#000">⇄</div>
              <div v-if="m.bonus" style="position:absolute;bottom:0;left:0;right:0;background:rgba(251,191,36,.25);border-top:1px solid rgba(251,191,36,.5);font-size:7px;font-weight:800;color:var(--gold);text-align:center;padding:2px 0;letter-spacing:.04em;border-radius:0 0 7px 7px;z-index:2">⭐ БОНУС</div>
              <div v-if="m.ksef === 'conflict'" class="cbadge" style="background:var(--orange);color:#000;right:8px">!</div>
              <div v-if="m.ksef === 'error'" class="cbadge" style="background:var(--red);color:#fff;right:8px">✕</div>

              <div class="mc-name">{{ monthNames[midx] }}</div>
              <div class="mc-icon">{{ iconFor(m) }}</div>
              <div class="mc-amt">{{ m.amount ? m.amount + ' zł' : '—' }}</div>
              <div class="mc-pay" :style="{ color: payColor(m) }" v-if="m.status.startsWith('extra')">{{ payLabel(m) }}</div>
            </button>
            <button class="mcell mcell-add" @click="modal.open('extra', { programId: getProgramId(enr) })">
              <div style="font-size:17px;color:var(--pink)">＋</div>
              <div style="font-size:9px;color:var(--pink);font-weight:700;margin-top:1px">Доп. зан.</div>
            </button>
          </div>

          <!-- TABLE VIEW -->
          <div v-else class="month-table-wrap">
            <table class="exp-table">
              <thead>
                <tr>
                  <th>{{ t("payments.table.month") }}</th>
                  <th>{{ t("payments.table.status") }}</th>
                  <th>Оплата</th>
                  <th>{{ t("payments.table.amount") }}</th>
                  <th>Скидка</th>
                  <th>Занятия</th>
                  <th>Дата Tx</th>
                  <th>{{ t("payments.table.ksef") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(m, midx) in monthsFor(getProgramForEnrollment(enr)!)" :key="midx" :class="[statusClass(m), { selrow: selected[getProgramId(enr)]===midx }]" @click="selected[getProgramId(enr)]=midx">
                  <td style="font-family:'Space Mono',monospace;font-size:10.5px">{{ monthNames[midx] }}</td>
                  <td><span class="st" :class="'st-' + m.status">{{ iconFor(m) }} {{ payLabelT(m) }}</span></td>
                  <td><span style="font-size:11px;font-weight:700" :style="{ color: payColor(m) }">{{ payLabel(m) }}</span></td>
                  <td style="font-family:'Space Mono',monospace;font-weight:700;font-size:11.5px" :style="{ color: payColor(m) }">{{ m.amount ? (m.amount + ' zł') : '—' }}</td>
                  <td>{{ m.disc ? m.disc : '—' }}</td>
                  <td style="font-family:'Space Mono',monospace;font-size:11px">G1: {{ m.g1 }} · G2: {{ m.g2 }}</td>
                  <td style="font-family:'Space Mono',monospace;font-size:10px;color:var(--dim)">{{ m.txDate || '—' }}</td>
                  <td><span v-if="m.ksef" class="kb" :class="'kb-' + m.ksef">{{ m.ksef }}</span><span v-else>—</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- MONTH DETAIL -->
          <div v-if="currentMonth(getProgramForEnrollment(enr)!)" class="month-detail">
            <div class="md-head">
              <div class="md-title">{{ monthNames[selected[getProgramId(enr)] ?? 0] }} · {{ yearByProgram[getProgramId(enr)] }}</div>
              <span style="padding:3px 9px;border-radius:6px;font-size:11px;font-weight:700;background:rgba(0,0,0,.2);border:1px solid" :style="{ color: payColor(currentMonth(getProgramForEnrollment(enr)!)), borderColor: payColor(currentMonth(getProgramForEnrollment(enr)!)) + '40' }">
                {{ iconFor(currentMonth(getProgramForEnrollment(enr)!)) }} {{ payLabelT(currentMonth(getProgramForEnrollment(enr)!)) }}
              </span>
            </div>
            <div class="md-rows">
              <div v-if="currentMonth(getProgramForEnrollment(enr)!).payStatus" class="md-row" :style="{ border: `1px solid ${payColor(currentMonth(getProgramForEnrollment(enr)!))}30`, background: `${payColor(currentMonth(getProgramForEnrollment(enr)!))}10` }">
                <span class="md-lbl">💰 Статус оплаты</span>
                <div style="display:flex;align-items:center;gap:10px;margin-left:auto">
                  <span v-if="currentMonth(getProgramForEnrollment(enr)!).txDate" style="font-size:10.5px;color:var(--dim)">📅 {{ currentMonth(getProgramForEnrollment(enr)!).txDate }}</span>
                  <span style="font-weight:700" :style="{ color: payColor(currentMonth(getProgramForEnrollment(enr)!)) }">{{ payLabel(currentMonth(getProgramForEnrollment(enr)!)) }}</span>
                </div>
              </div>
              <div class="md-row">
                <span class="md-lbl">{{ t("payments.month.amount") }}</span>
                <span class="md-val" :style="{ color: payColor(currentMonth(getProgramForEnrollment(enr)!)) }">{{ currentMonth(getProgramForEnrollment(enr)!)?.amount ? currentMonth(getProgramForEnrollment(enr)!).amount + ' zł' : '0 zł' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="action-section">
          <div class="action-label">{{ t("payments.actions") }}</div>
          <div class="action-row">
            <button class="btn btn-amber btn-sm" @click="modal.open('pause', { programId: getProgramId(enr) })">🌙 {{ t("payments.btn.pause") }}</button>
            <button class="btn btn-ghost btn-sm" @click="modal.open('discount', { programId: getProgramId(enr), year: yearByProgram[getProgramId(enr)], monthIndex: selected[getProgramId(enr)] ?? 0 })">🏷️ {{ t("payments.btn.discount") }}</button>
            <button class="btn btn-ghost btn-sm" @click="modal.open('tariff', { programId: getProgramId(enr), year: yearByProgram[getProgramId(enr)], monthIndex: selected[getProgramId(enr)] ?? 0 })">💱 {{ t("payments.btn.tariff") }}</button>
            <button class="btn btn-pink btn-sm" @click="modal.open('extra', { programId: getProgramId(enr) })">➕ {{ t("payments.btn.extra") }}</button>
          </div>
          <div class="action-row">
            <button class="btn btn-unlock btn-sm" @click="modal.open('unlock', { programId: getProgramId(enr) })">🔓 {{ t("payments.btn.unlock") }}</button>
            <div class="action-divider"></div>
            <button class="btn btn-ghost btn-sm" @click="modal.open('groupSplit', { programId: getProgramId(enr) })">🔄 {{ t("payments.btn.split") }}</button>
            <button class="btn btn-archive btn-sm" @click="modal.open('archive', { programId: getProgramId(enr) })">📦 {{ t("payments.btn.archive") }}</button>
            <button class="btn btn-green btn-sm" @click="modal.open('resume', { programId: getProgramId(enr) })">▶ {{ t("payments.btn.resume") }}</button>
          </div>
        </div>

        <div class="tx-section" :class="{ open: openTx[getProgramId(enr)] }">
          <div class="tx-toggle" @click="toggleTx(getProgramId(enr))">
            <div class="tx-toggle-left">💳 {{ t("payments.tx.title") }} и счета KSeF</div>
            <div style="display:flex;align-items:center;gap:7px">
              <span class="tx-cnt">{{ txsFor(getProgramForEnrollment(enr)!)?.length || 0 }} {{ t("payments.tx.count") }}</span>
              <div class="tx-arrow" :style="{ transform: openTx[getProgramId(enr)] ? 'rotate(90deg)' : 'rotate(0deg)' }">›</div>
            </div>
          </div>
          <div class="tx-body" v-show="openTx[getProgramId(enr)]">
             <div v-for="(tx, i) in txsFor(getProgramForEnrollment(enr)!)" :key="i" class="tx-row">
                <div class="tx-date">{{ tx.date }}</div>
                <div class="tx-desc">
                  <div class="tx-title">{{ tx.title }}</div>
                  <div class="tx-sub">{{ tx.sub || '#TXN' }}</div>
                </div>
                <div class="tx-amt" :style="{ color: tx.paid ? 'var(--green)' : 'var(--blue)' }">{{ tx.amount }} zł</div>
                <div class="tx-btns">
                  <button class="tx-btn" @click.stop="openTxEditInvoice(getProgramForEnrollment(enr)!, tx)">✏️</button>
                  <button class="tx-btn" @click.stop="openTxKorekta(getProgramForEnrollment(enr)!, tx)">📋</button>
                  <button class="tx-btn" @click.stop="openTxRefund(getProgramForEnrollment(enr)!, tx)">↩️</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Extras card -->
    <div v-if="payments.programs.find(p => p.id === 'extras')" class="prog" :class="{ open: activeProgramId === 'extras' }">
      <div class="prog-head" @click="toggleProgram('extras')">
        <div class="prog-bar" style="background:linear-gradient(180deg,var(--amber),var(--orange))"></div>
        <div class="prog-info">
          <div class="prog-name">Extras</div>
          <div class="prog-sub">Разовые услуги и товары</div>
        </div>
        <div class="prog-arrow">›</div>
      </div>
      <div class="prog-body" v-show="activeProgramId === 'extras'">
        <div class="prog-inner">
           <div v-for="(e, i) in (payments.programs.find(p => p.id === 'extras')?.extras || [])" :key="i" class="tx-row">
              <span style="font-size:18px">{{ e.icon || '🏆' }}</span>
              <div style="flex:1">
                <div style="font-weight:600">{{ e.title }}</div>
                <div style="font-size:10px; color:var(--dim)">{{ e.meta }}</div>
              </div>
              <div class="tx-amt">{{ e.amount }} zł</div>
              <div class="tx-btns">
                <button class="tx-btn" @click.stop="openExtraEditInvoice(payments.programs.find(p => p.id === 'extras')!, e)">✏️</button>
                <button class="tx-btn" @click.stop="openExtraKorekta(payments.programs.find(p => p.id === 'extras')!, e)">📋</button>
                <button class="tx-btn" @click.stop="openExtraRefund(payments.programs.find(p => p.id === 'extras')!, e)">↩️</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { usePaymentsStore } from "../../../../stores/payments.store";
import { useModalStore } from "../../../../stores/modal.store";
import { TEACHERS_DB } from "../../../../api/mockDb";
import type { MonthItem, Program, Enrollment } from "../../../../api/mockDb";

const { t, tm } = useI18n();
const payments = usePaymentsStore();
const modal = useModalStore();
const { student: currentStudent } = storeToRefs(payments);

const monthNames = (tm("common.monthsShort") as string[]) || ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const activeProgramId = ref<string>("space");
const yearByProgram = reactive<Record<string, string>>({});
const selected = reactive<Record<string, number>>({});
const openTx = reactive<Record<string, boolean>>({});
const viewMode = reactive<Record<string, "grid" | "table">>({});
const openExtras = reactive<Record<string, boolean>>({});

function getProgramId(enr: Enrollment) {
  if (enr.school.includes('Indigo')) return 'indigo';
  return 'space';
}

function getProgramForEnrollment(enr: Enrollment) {
  const pid = getProgramId(enr);
  return payments.programs.find(p => p.id === pid) || null;
}

function getSchedule(teacherName?: string) {
  if (!teacherName) return "—";
  const teach = TEACHERS_DB.find(x => x.name === teacherName);
  return teach ? teach.schedule : "—";
}

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
  const out = Array.from({ length: 12 }, (_, i) => arr[i] || ({ status: "future", amount: 0, ksef: null, g1: 0, g2: 0 } as MonthItem));
  if (selected[p.id] == null) selected[p.id] = 0;
  if (openTx[p.id] == null) openTx[p.id] = false;
  if (viewMode[p.id] == null) viewMode[p.id] = "grid";
  if (openExtras[p.id] == null) openExtras[p.id] = true;
  return out;
}

function currentMonth(p: Program): MonthItem {
  const idx = selected[p.id] ?? 0;
  return monthsFor(p)[idx] || { status: "future", amount: 0, ksef: null, g1: 0, g2: 0 } as unknown as MonthItem;
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
  const map: Record<string, string> = { paid: "✓", pending: "🕐", overdue: "⚠️", pause: "⏸", summer: "☀️", partial: "➗", "extra-paid": "➕", "extra-pending": "➕", future: "•" };
  return map[m.status] || "•";
}

function payLabel(m: MonthItem) {
  if (m.status === "paid") return "Оплачено";
  if (m.status === "overdue") return "Долг";
  if (m.status === "pending") return "Ожидает";
  if (m.status === "pause") return "Пауза";
  if (m.status === "summer") return "Лето";
  if (m.status === "partial") return "Часть";
  if (m.status.startsWith("extra")) return "Доп.";
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
  if (m.status === "partial") return "var(--cyan)";
  if (m.status.startsWith("extra")) return "var(--pink)";
  return "rgba(255,255,255,.35)";
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

<style scoped>
/* ── КОСМИЧЕСКИЕ СТИЛИ ИЗ ТВОЕГО HTML ── */
.bal-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px; }
.bc { padding: 11px 14px; background: rgba(255,255,255,.025); border: 1px solid rgba(100,120,255,.13); border-radius: 11px; }
.bc-label { font-size: 9.5px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; color: var(--dim); margin-bottom: 4px; }
.bc-val { font-family: 'Space Mono', monospace; font-size: 16px; font-weight: 700; }
.bc-sub { font-size: 10px; color: var(--dim); margin-top: 2px; }

.legend { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.li { display: flex; align-items: center; gap: 5px; font-size: 10px; color: var(--dim); }
.ld { width: 8px; height: 8px; border-radius: 3px; flex-shrink: 0; }

.prog { border: 1px solid rgba(100,120,255,.13); border-radius: 14px; margin-bottom: 12px; overflow: hidden; transition: border-color .2s; }
.prog:hover { border-color: rgba(120,140,255,.30); }
.prog-head { display: flex; align-items: center; gap: 11px; padding: 12px 16px; cursor: pointer; transition: background .15s; }
.prog-head:hover { background: rgba(255,255,255,.02); }
.prog-bar { width: 4px; border-radius: 2px; align-self: stretch; min-height: 32px; flex-shrink: 0; }
.prog-info { flex: 1; min-width: 0; }
.prog-name { font-size: 13px; font-weight: 700; }
.prog-sub { font-size: 10.5px; color: var(--dim); margin-top: 2px; display: flex; align-items: center; gap: 6px;}
.prog-bal { text-align: right; flex-shrink: 0; }
.prog-bal-val { font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700; }
.prog-bal-sub { font-size: 10px; color: var(--dim); margin-top: 1px; }
.prog-arrow { font-size: 11px; color: var(--dim); transition: transform .2s; flex-shrink: 0; margin-left: 4px; }
.prog.open .prog-arrow { transform: rotate(90deg); }
.prog-body { display: none; border-top: 1px solid rgba(100,120,255,.13); }
.prog.open .prog-body { display: block; }
.prog-inner { padding: 12px 16px; }

.badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 5px; font-size: 10.5px; font-weight: 700; }
.badge-child2 { background: rgba(236,72,153,.08); color: var(--pink); border: 1px solid rgba(236,72,153,.22); }

.year-row { display: flex; align-items: center; gap: 5px; margin-bottom: 12px; flex-wrap: wrap; }
.yr-label { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--dim); margin-right: 2px; }
.yr-btn { padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; font-family: 'Space Mono', monospace; cursor: pointer; border: 1px solid rgba(100,120,255,.13); background: transparent; color: var(--dim); transition: all .15s; }
.yr-btn.active { background: rgba(79,110,247,.15); border-color: rgba(79,110,247,.4); color: var(--blue); }
.view-toggle { display: flex; gap: 4px; margin-left: auto; }
.vt-btn { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 7px; font-size: 11px; font-weight: 600; cursor: pointer; border: 1px solid rgba(100,120,255,.13); background: transparent; color: var(--dim); transition: all .15s; font-family: 'Outfit', sans-serif; }
.vt-btn.active { background: rgba(79,110,247,.12); border-color: rgba(79,110,247,.3); color: var(--blue); }

/* GRID */
.month-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; margin-bottom: 12px; }
.mcell { aspect-ratio: 1; border-radius: 9px; border: 1px solid rgba(100,120,255,.13); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; cursor: pointer; transition: all .18s; position: relative; background: rgba(255,255,255,.02); overflow: hidden; padding:0;}
.mcell:hover { border-color: rgba(120,140,255,.30); transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,.3); z-index: 2; }
.mcell.sel { box-shadow: 0 0 0 2px rgba(79,110,247,.5); }
.mc-name { font-size: 9.5px; font-weight: 700; color: var(--dim); letter-spacing: .02em; }
.mc-icon { font-size: 13px; line-height: 1; }
.mc-amt { font-family: 'Space Mono', monospace; font-size: 8px; font-weight: 700; line-height: 1; }
.mc-pay { font-size: 8px; line-height: 1; font-weight: 700; }
.mc-sub { font-size: 7px; color: rgba(255,255,255,.3); line-height: 1; }
.cbadge { position: absolute; top: -3px; right: -3px; width: 13px; height: 13px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 7px; font-weight: 800; border: 1.5px solid var(--bg); z-index: 3; }

.ms-paid { border-color: rgba(16,185,129,.28); background: rgba(16,185,129,.07); }
.ms-paid .mc-name { color: var(--green); } .ms-paid .mc-amt { color: var(--green); }
.ms-pending { border-color: rgba(79,110,247,.22); background: rgba(79,110,247,.06); }
.ms-pending .mc-name { color: var(--blue); } .ms-pending .mc-amt { color: var(--blue); }
.ms-overdue { border-color: rgba(239,68,68,.3); background: rgba(239,68,68,.07); animation: cpulse 2s ease-in-out infinite; }
.ms-overdue .mc-name { color: var(--red); } .ms-overdue .mc-amt { color: var(--red); }
.ms-pause { border-color: rgba(245,158,11,.25); background: rgba(245,158,11,.06); }
.ms-pause .mc-name { color: var(--amber); }
.ms-summer { border-color: rgba(251,191,36,.2); background: rgba(251,191,36,.05); }
.ms-summer .mc-name { color: var(--gold); }
.ms-partial { border-color: rgba(6,182,212,.3); background: linear-gradient(135deg, rgba(16,185,129,.1) 50%, rgba(245,158,11,.1) 50%); }
.ms-partial .mc-name { color: var(--cyan); } .ms-partial .mc-amt { color: var(--cyan); }
.ms-extra-paid { border-color: rgba(236,72,153,.3); background: rgba(236,72,153,.08); border-style: dashed; }
.ms-extra-paid .mc-name { color: var(--pink); }
.ms-extra-pending { border-color: rgba(79,110,247,.3); background: rgba(79,110,247,.06); border-style: dashed; }
.ms-extra-pending .mc-name { color: var(--blue); }
.ms-future { opacity: .28; }
.mcell-add { border-style: dashed; border-color: rgba(236,72,153,.22); background: rgba(236,72,153,.03); cursor: pointer; }
.mcell-add:hover { background: rgba(236,72,153,.1); border-color: rgba(236,72,153,.5); }
@keyframes cpulse { 0%,100% { box-shadow: 0 0 0 rgba(239,68,68,.2) } 50% { box-shadow: 0 0 8px rgba(239,68,68,.4) } }

/* DETAIL PANEL */
.month-detail { background: rgba(79,110,247,.05); border: 1px solid rgba(79,110,247,.2); border-radius: 11px; padding: 12px; margin-bottom: 12px; animation: fadeIn .18s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px) } to { opacity: 1; transform: translateY(0) } }
.md-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 6px; }
.md-title { font-size: 14px; font-weight: 700; }
.md-rows { display: flex; flex-direction: column; gap: 5px; margin-bottom: 9px; }
.md-row { display: flex; align-items: center; gap: 8px; padding: 6px 9px; background: rgba(255,255,255,.025); border-radius: 7px; font-size: 12px; }
.md-lbl { color: var(--dim); flex: 1; }
.md-val { font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700; }

/* ACTIONS PANEL */
.action-section { border-top: 1px solid rgba(100,120,255,.13); padding: 10px 16px; background: rgba(255,255,255,.01); }
.action-label { font-size: 9.5px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; color: var(--dim); margin-bottom: 7px; }
.action-row { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 5px; }
.action-divider { width: 1px; height: 26px; background: rgba(100,120,255,.13); flex-shrink: 0; align-self: center; }
.action-hint { font-size: 10.5px; color: var(--dim); margin-top: 5px; padding-top: 5px; border-top: 1px solid rgba(100,120,255,.13); }

/* TRANSACTIONS */
.tx-section { border-top: 1px solid rgba(100,120,255,.13); }
.tx-toggle { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; cursor: pointer; transition: background .15s; }
.tx-toggle:hover { background: rgba(255,255,255,.02); }
.tx-toggle-left { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 600; }
.tx-cnt { font-size: 11px; color: var(--dim); }
.tx-arrow { font-size: 11px; color: var(--dim); transition: transform .2s; }
.tx-row { display: flex; align-items: center; gap: 7px; padding: 8px 10px; background: rgba(255,255,255,.025); border: 1px solid rgba(100,120,255,.13); border-radius: 9px; margin-bottom: 4px; transition: all .15s; }
.tx-row:hover { border-color: rgba(120,140,255,.30); }
.tx-date { font-family: 'Space Mono', monospace; font-size: 10px; color: var(--dim); white-space: nowrap; width: 58px; flex-shrink: 0; }
.tx-desc { flex: 1; min-width: 0; }
.tx-title { font-size: 12px; font-weight: 600; }
.tx-sub { font-size: 10px; color: var(--dim); margin-top: 1px; }
.tx-amt { font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
.tx-btns { display: flex; gap: 3px; flex-shrink: 0; }
.tx-btn { border:none; width: 26px; height: 26px; border-radius: 6px; background: rgba(255,255,255,.04); border: 1px solid rgba(100,120,255,.13); display: flex; align-items: center; justify-content: center; font-size: 11px; transition: all .15s; }
.tx-btn:hover:not(:disabled) { background: rgba(79,110,247,.15); border-color: rgba(79,110,247,.3); }

/* KSEF BADGES */
.kb { display: inline-flex; align-items: center; gap: 3px; padding: 2px 6px; border-radius: 5px; font-size: 10px; font-weight: 700; white-space: nowrap; }
.kb-ok { background: rgba(16,185,129,.1); color: var(--green); border: 1px solid rgba(16,185,129,.2); }
.kb-pending { background: rgba(245,158,11,.1); color: var(--amber); border: 1px solid rgba(245,158,11,.2); animation: pamber 2s ease-in-out infinite; }
@keyframes pamber { 0%,100% { box-shadow: 0 0 3px rgba(245,158,11,.3) } 50% { box-shadow: 0 0 8px rgba(245,158,11,.5) } }

/* BUTTONS */
.btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 8px; font-size: 12px; font-weight: 500; font-family: 'Outfit', sans-serif; cursor: pointer; border: none; transition: all .15s; white-space: nowrap; }
.btn-primary { background: linear-gradient(135deg, var(--blue), var(--purple)); color: #fff; box-shadow: 0 0 12px rgba(79,110,247,.3); }
.btn-ghost { background: rgba(255,255,255,.05); color: var(--dim); border: 1px solid rgba(100,120,255,.13); }
.btn-ghost:hover { background: rgba(255,255,255,.08); color: var(--white); border-color: rgba(120,140,255,.30); }
.btn-amber { background: rgba(245,158,11,.1); color: var(--amber); border: 1px solid rgba(245,158,11,.28); }
.btn-cyan { background: rgba(6,182,212,.1); color: var(--cyan); border: 1px solid rgba(6,182,212,.28); }
.btn-red { background: rgba(239,68,68,.1); color: var(--red); border: 1px solid rgba(239,68,68,.28); }
.btn-green { background: rgba(16,185,129,.1); color: var(--green); border: 1px solid rgba(16,185,129,.28); }
.btn-pink { background: rgba(236,72,153,.1); color: var(--pink); border: 1px solid rgba(236,72,153,.28); }
.btn-archive { background: rgba(100,120,255,.06); color: var(--dim); border: 1px solid rgba(100,120,255,.15); }
.btn-unlock { background: rgba(6,182,212,.08); color: var(--cyan); border: 1px solid rgba(6,182,212,.22); }
.btn-sm { padding: 4px 9px; font-size: 11px; }

/* TABLE MODE */
.month-table-wrap { overflow-x: auto; }
.exp-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.exp-table th { font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--dim); padding: 6px 8px; text-align: left; border-bottom: 1px solid rgba(100,120,255,.13); white-space: nowrap; }
.exp-table td { padding: 6px 8px; border-bottom: 1px solid rgba(100,120,255,.06); vertical-align: middle; cursor: pointer;}
.exp-table tr:hover td { background: rgba(79,110,247,.03); }
.exp-table tr.selrow td { background: rgba(79,110,247,.1); }
.st { display: inline-flex; align-items: center; gap: 3px; padding: 2px 6px; border-radius: 5px; font-size: 10px; font-weight: 700; white-space: nowrap; }
</style>