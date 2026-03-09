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
    <div class="table-responsive">
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
              <div class="status-cell">
                <span class="ok-badge" :class="'ok-' + item.status">
                  {{ item.status === 'done' ? '✅' : item.status === 'partial' ? '⚠️' : '❌' }}
                  {{ t('teacherSalary.status.' + item.status) }}
                </span>
              </div>
            </td>
            <td>
              <div v-if="item.comment" class="comment-cell">
                <div class="qa-comment-label">{{ t('teacherSalary.admin.comment') }}:</div>
                <div class="qa-comment">{{ item.comment }}</div>
              </div>
              <span v-else class="dim fs-12">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="formula-box">
      <div class="fline"><span>{{ t('teacherSalary.table.base') }}</span><span>{{ formatCurrency(base) }}</span></div>
      <div class="fline"><span>{{ t('teacherSalary.admin.score') }}</span><span>{{ pct }}%</span></div>
      <div class="fline"><span>{{ t('teacherSalary.admin.basis') }}</span><span>3% × {{ pct }}% = {{ (3 * pct / 100).toFixed(2) }}%</span></div>
      <div class="fline total"><span>{{ formatCurrency(base * (3 * pct / 100) / 100) }}</span><span>{{ formatCurrency(amount) }}</span></div>
    </div>
  </div>
</template>

<style scoped>
.qa-banner { display: flex; align-items: center; justify-content: space-between; background: var(--status-info-bg); border: 1px solid var(--app-border); padding: 18px 22px; border-radius: 16px; margin: 12px 0 20px; }
.qa-banner-ok { border-left: 4px solid var(--green); }
.qa-banner-partial { border-left: 4px solid var(--amber); }
.qa-pct { font-size: 26px; font-weight: 900; font-family: 'Space Mono', monospace; }
.qa-pct-ok { color: var(--green); text-shadow: var(--app-glow); }
.qa-pct-partial { color: var(--amber); text-shadow: var(--app-glow); }

.table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.checklist-table { width: 100%; border-collapse: collapse; min-width: 600px; }
.checklist-table th { text-align: left; padding: 11px 16px; font-size: 10.5px; font-weight: 700; color: var(--dim); letter-spacing: .08em; text-transform: uppercase; border-bottom: 1px solid var(--border); background: var(--app-surface); }
.checklist-table td { padding: 14px 16px; border-bottom: 1px solid var(--app-border); vertical-align: top; }
.td-name { font-size: 13.5px; font-weight: 600; color: var(--white); }

.status-cell { display: flex; align-items: flex-start; }
.ok-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 9px; padding: 3px 10px; border-radius: 6px; font-weight: 800; text-transform: uppercase; white-space: nowrap; border: 1px solid transparent; }
.ok-done { background: var(--status-success-bg); color: var(--green); border-color: var(--app-border); }
.ok-partial { background: var(--status-warning-bg); color: var(--amber); border-color: var(--app-border); }
.ok-fail { background: var(--status-danger-bg); color: var(--red); border-color: var(--app-border); }

.comment-cell { min-width: 200px; }
.qa-comment-label { font-size: 9px; font-weight: 800; color: var(--dim); text-transform: uppercase; margin-bottom: 4px; }
.qa-comment { font-size: 11.5px; color: var(--app-text-dim); line-height: 1.5; font-style: italic; }
.issue-row { background: var(--status-warning-bg); }

.formula-box { margin-top: 24px; padding: 16px 20px; background: var(--status-info-bg); border-radius: 14px; border: 1px solid var(--app-border); }
.fline { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; color: var(--dim); font-family: 'Space Mono', monospace; }
.fline span:first-child { font-family: 'Outfit', sans-serif; }
.fline.total { border-top: 1px solid var(--app-border-hi); margin-top: 10px; padding-top: 10px; font-weight: 800; color: var(--blue); font-size: 14px; }

.val-green { color: var(--green); }
.val-amber { color: var(--amber); }
.dim { color: var(--dim); }
.fs-115 { font-size: 11.5px; }
.fs-12 { font-size: 12px; }
</style>
