<template>
  <!-- Balance cards -->
  <div class="bal-row">
    <div class="bc" style="border-color:rgba(16,185,129,.25)">
      <div class="bc-label">{{ t("payments.overall") }}</div>
      <div class="bc-val" :style="{ color: payments.student?.totalBalance?.color || 'var(--green)' }">
        {{ payments.student?.totalBalance?.value || "—" }}
      </div>
      <div class="bc-sub" :style="{ color: payments.student?.totalBalance?.color || 'var(--green)' }">
        {{ payments.student?.totalBalance?.label || "" }}
      </div>
    </div>

    <div class="bc">
      <div class="bc-label">{{ t("payments.nextPay") }}</div>
      <div class="bc-val" style="color:var(--blue);font-size:13px">{{ payments.student?.nextPay?.date || "—" }}</div>
      <div class="bc-sub">{{ payments.student?.nextPay?.approx || "" }}</div>
    </div>

    <div class="bc">
      <div class="bc-label">{{ t("payments.activePrograms") }}</div>
      <div class="bc-val">{{ currentStudent?.enrollments?.length || 0 }}</div>
      <div class="bc-sub">Space · INDIGO · Extras</div>
    </div>
  </div>

  <!-- Legend -->
  <div class="legend">
    <div class="li"><div class="ld" style="background:var(--green)"></div>{{ t("payments.legend.paid") }}</div>
    <div class="li"><div class="ld" style="background:var(--blue)"></div>{{ t("payments.legend.pending") }}</div>
    <div class="li"><div class="ld" style="background:var(--red)"></div>{{ t("payments.legend.overdue") }}</div>
    <div class="li"><div class="ld" style="background:var(--amber)"></div>{{ t("payments.legend.pause") }}</div>
    <div class="li"><div class="ld" style="background:var(--gold)"></div>{{ t("payments.legend.summer") }}</div>
    <div class="li"><div class="ld ld-partial"></div>{{ t("payments.legend.partial") }}</div>
    <div class="li"><div class="ld ld-extra"></div>{{ t("payments.legend.extra") }}</div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { usePaymentsStore } from "../../../../../stores/payments.store";

const { t } = useI18n();
const payments = usePaymentsStore();
const { student: currentStudent } = storeToRefs(payments);
</script>

<style scoped>
/* ── BALANCE ── */
.bal-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}
.bc {
  padding: 11px 14px;
  background: rgba(255,255,255,.025);
  border: 1px solid var(--b);
  border-radius: 11px;
}
.bc-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: .09em;
  text-transform: uppercase;
  color: var(--dim);
  margin-bottom: 4px;
}
.bc-val {
  font-family: 'Space Mono', monospace;
  font-size: 16px;
  font-weight: 700;
}
.bc-sub {
  font-size: 10px;
  color: var(--dim);
  margin-top: 2px;
}

/* ── LEGEND ── */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.li {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--dim);
}
.ld {
  width: 8px;
  height: 8px;
  border-radius: 3px;
  flex-shrink: 0;
}
.ld-partial {
  background: linear-gradient(135deg, rgba(16,185,129,.5) 50%, rgba(245,158,11,.5) 50%);
}
.ld-extra {
  background: var(--pink);
  border: 1px dashed rgba(236,72,153,.6);
}
</style>
