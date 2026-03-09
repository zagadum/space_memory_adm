<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  pct: number;
  base: number;
  evaluatedBy: string;
  evaluatedAt: string;
  amount: number;
  checklist: Array<{
    duty: string;
    status: 'done' | 'partial' | 'fail';
    comment: string | null;
  }>;
}>();

const { t } = useI18n();

const formatCurrency = (val: number) => {
  return val.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' zł';
};
</script>

<template>
  <div class="admin-duty-section">
    <div class="qa-banner" :class="pct >= 100 ? 'qa-banner-ok' : 'qa-banner-partial'">
      <div>
        <strong :class="pct >= 100 ? 'val-green' : 'val-amber'">
          {{ pct >= 100 ? '✅ ' + t('teacherSalary.admin.allDone') : '⚠️ ' + t('teacherSalary.admin.hasIssues') }}
        </strong><br>
        <span class="dim fs-115">{{ t('teacherSalary.admin.evaluated') }} {{ evaluatedAt }} · {{ evaluatedBy }}</span>
      </div>
      <div class="qa-pct" :class="pct >= 100 ? 'qa-pct-ok' : 'qa-pct-partial'">
        {{ pct }}%
      </div>
    </div>
    <table class="checklist-table">
      <thead>
        <tr>
          <th>{{ t('teacherSalary.admin.duty') }}</th>
          <th>{{ t('teacherSalary.admin.score') }}</th>
          <th>{{ t('teacherSalary.admin.comment') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in checklist" :key="idx" :class="{ 'issue-row': item.status !== 'done' }">
          <td><div class="td-name">{{ item.duty }}</div></td>
          <td>
            <span class="ok-badge" :class="'ok-' + item.status">
              {{ item.status === 'done' ? '✅' : item.status === 'partial' ? '⚠️' : '❌' }}
              {{ t('teacherSalary.status.' + item.status) }}
            </span>
          </td>
          <td>
            <div v-if="item.comment">
              <div class="qa-comment-label">{{ t('teacherSalary.admin.comment') }}:</div>
              <div class="qa-comment">{{ item.comment }}</div>
            </div>
            <span v-else class="dim fs-12">—</span>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="formula-box">
      <div class="fline"><span>{{ t('teacherSalary.table.base') }}</span><span>{{ formatCurrency(base) }}</span></div>
      <div class="fline"><span>{{ t('teacherSalary.admin.score') }}</span><span>{{ pct }}%</span></div>
      <div class="fline"><span>{{ t('teacherSalary.admin.basis') }}</span><span>3% × {{ pct }}% = {{ (3 * pct / 100).toFixed(2) }}%</span></div>
      <div class="fline total"><span>{{ formatCurrency(base * (3 * pct / 100) / 100) }}</span><span>{{ formatCurrency(amount) }}</span></div>
    </div>
  </div>
</template>

<style scoped>
.qa-banner { display: flex; align-items: center; justify-content: space-between; background: rgba(8,8,24,.6); border: 1px solid rgba(255,255,255,.05); padding: 18px 22px; border-radius: 16px; margin: 12px 0 20px; }
.qa-banner-ok { border-left: 4px solid #22c55e; }
.qa-banner-partial { border-left: 4px solid #f59e0b; }
.qa-pct { font-size: 26px; font-weight: 900; font-family: 'Space Mono', monospace; }
.qa-pct-ok { color: #22c55e; text-shadow: 0 0 15px rgba(34,197,94,.3); }
.qa-pct-partial { color: #f59e0b; text-shadow: 0 0 15px rgba(245,158,11,.3); }

.checklist-table { width: 100%; border-collapse: collapse; }
.checklist-table th { text-align: left; padding: 12px 14px; font-size: 10px; color: #4b5563; border-bottom: 1px solid rgba(255,255,255,.05); text-transform: uppercase; }
.checklist-table td { padding: 16px 14px; border-bottom: 1px solid rgba(255,255,255,.03); vertical-align: top; }
.td-name { font-size: 13.5px; font-weight: 600; }

.ok-badge { font-size: 9px; padding: 3px 10px; border-radius: 6px; font-weight: 800; text-transform: uppercase; white-space: nowrap; }
.ok-done { background: rgba(34,197,94,.1); color: #22c55e; }
.ok-partial { background: rgba(245,158,11,.1); color: #f59e0b; }
.ok-fail { background: rgba(239,68,68,.1); color: #ef4444; }

.qa-comment-label { font-size: 9px; font-weight: 800; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
.qa-comment { font-size: 11.5px; color: #94a3b8; line-height: 1.5; font-style: italic; }
.issue-row { background: rgba(245,158,11,.02); }

.formula-box { margin-top: 24px; padding: 20px; background: rgba(8,8,24,.6); border-radius: 14px; border: 1px solid rgba(255,255,255,.04); }
.fline { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12.5px; color: #6b7280; }
.fline.total { border-top: 1px solid rgba(255,255,255,.06); margin-top: 12px; padding-top: 12px; font-weight: 800; color: #f0f0ff; font-size: 15px; }

.val-green { color: #22c55e; }
.val-amber { color: #f59e0b; }
.dim { color: #6b7280; }
.fs-115 { font-size: 11.5px; }
.fs-12 { font-size: 12px; }
</style>
