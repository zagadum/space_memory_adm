<template>
  <div>
    <div class="sec-title">{{ t('attendance.title') }}</div>

    <div v-if="loading.attendance" class="sk-card"></div>

    <template v-else-if="attendance">
      <div class="att-summary">
        <div class="att-stat"><div class="att-stat-val" style="color:var(--blue)">{{ attendance.summary.total }}</div><div class="att-stat-label">{{ t('attendance.total') }}</div></div>
        <div class="att-stat"><div class="att-stat-val" style="color:var(--green)">{{ attendance.summary.present }}</div><div class="att-stat-label">{{ t('attendance.present') }}</div></div>
        <div class="att-stat"><div class="att-stat-val" style="color:var(--red)">{{ attendance.summary.absent }}</div><div class="att-stat-label">{{ t('attendance.absent') }}</div></div>
        <div class="att-stat"><div class="att-stat-val" style="color:var(--cyan)">{{ attendance.summary.makeup }}</div><div class="att-stat-label">{{ t('attendance.makeup') }}</div></div>
      </div>

      <div class="att-perc">
        <div style="font-size:11.5px;color:var(--dim)">{{ t('attendance.rate') }}</div>
        <div style="font-family:'Space Mono',monospace;font-size:13px;font-weight:700;color:var(--green)">{{ attendance.summary.rate }}%</div>
      </div>
      <div class="att-bar" style="margin-bottom:16px">
        <div class="att-bar-fill" :style="{ width: attendance.summary.rate + '%', background: 'linear-gradient(90deg,var(--green),var(--cyan))' }"></div>
      </div>

      <table class="att-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ t('attendance.date') }}</th>
            <th>{{ t('attendance.topic') }}</th>
            <th>{{ t('attendance.trainer') }}</th>
            <th>{{ t('attendance.status') }}</th>
            <th>{{ t('attendance.note') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in attendance.items" :key="row.id">
            <td class="mono" style="color:var(--dim)">{{ row.num }}</td>
            <td class="mono">{{ row.date }}</td>
            <td style="font-size:12px;color:var(--dim)">{{ row.topic }}</td>
            <td style="font-size:12px">{{ row.trainer }}</td>
            <td>
              <span class="att-mark" :class="markClass(row.mark)" @click="openMark(row)" :title="t('attendance.change')">
                {{ markIcon(row.mark) }}
              </span>
            </td>
            <td style="font-size:11px;color:var(--dim)">{{ row.note }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useStudentTabsStore } from "../stores/studentTabs.store";
import { useModalStore } from "../stores/modal.store";

const studentId = "s_1";
const { t } = useI18n();
const st = useStudentTabsStore();
const modal = useModalStore();
const { attendance, loading } = storeToRefs(st);

function openMark(row: any) {
  modal.open("attendance-status", { row });
}

function markIcon(mark: string) {
  return ({ present: "✓", absent: "✕", late: "⏱", makeup: "🔄", empty: "—" } as any)[mark] ?? "—";
}

function markClass(mark: string) {
  return ({ present: "mark-present", absent: "mark-absent", late: "mark-late", makeup: "mark-makeup", empty: "mark-empty" } as any)[mark] ?? "mark-empty";
}

onMounted(() => st.loadAttendance(studentId));
</script>

<style scoped>
.mono{font-family:'Space Mono',monospace;font-size:11px;white-space:nowrap}
.sk-card{height:260px;border-radius:14px;border:1px solid var(--b);background:rgba(255,255,255,.02);position:relative;overflow:hidden;}
.sk-card::after{content:'';position:absolute;inset:-40px;transform:translateX(-60%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);animation:sh 1.2s infinite;}
@keyframes sh{to{transform:translateX(120%);}}

.att-perc{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px}
</style>
