<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  rows: Array<{
    name: string;
    date: string;
    program: string;
    attended: number;
    won: number;
    paid: boolean;
    salary: number;
    children: Array<{ name: string; status: 'won' | 'lost' }>;
  }>;
  threshold: number;
  confirmedByQa: boolean;
  confirmedBy?: string;
  confirmedAt?: string;
}>();

const { t } = useI18n();
const openTrials = ref<Record<string, boolean>>({});

const toggleTrial = (idx: number) => {
  openTrials.value[idx] = !openTrials.value[idx];
};

const formatCurrency = (val: number) => {
  return val.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' zł';
};

const getConversion = (row: any) => {
  if (row.attended === 0) return 0;
  return Math.round((row.won / row.attended) * 100);
};

const isQualified = (row: any) => {
  return getConversion(row) >= props.threshold;
};
</script>

<template>
  <div class="trial-section">
    <div class="hint">💡 {{ t('teacherSalary.trials.threshold') }}</div>
    
    <table class="data-table">
      <thead>
        <tr>
          <th>{{ t('teacherSalary.table.details') }}</th>
          <th>{{ t('teacherSalary.table.dayTime') }}</th>
          <th>{{ t('teacherSalary.trials.attended') }}</th>
          <th>WON %</th>
          <th>{{ t('teacherSalary.trials.paid') }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(trial, idx) in rows" :key="idx">
          <tr class="trial-row" :class="{ open: openTrials[idx] }" @click="toggleTrial(idx)">
            <td>
              <span class="trial-expand-icon">▶</span>
              <span class="chip" :class="trial.program === 'INDIGO' ? 'chip-purple' : 'chip-blue'">{{ trial.name }}</span>
            </td>
            <td class="mono fs-12">{{ trial.date }}</td>
            <td class="mono">{{ trial.attended }}</td>
            <td>
              <span class="trial-pct-bar">
                <span 
                  class="trial-pct-fill" 
                  :class="isQualified(trial) ? 'ok' : 'fail'" 
                  :style="{ width: getConversion(trial) + '%' }"
                ></span>
              </span>
              <span class="mono fw-700" :class="isQualified(trial) ? 'val-green' : 'val-red'">
                {{ getConversion(trial) }}%
              </span>
              <span class="dim fs-11"> ({{ trial.won }}/{{ trial.attended }})</span>
            </td>
            <td>
              <span v-if="isQualified(trial)" class="trial-paid-badge">✓ 35 zł</span>
              <span v-else class="trial-nopay-badge">— &lt; 51%</span>
            </td>
          </tr>
          
          <!-- Trial Kids -->
          <tr class="trial-children-panel" :class="{ open: openTrials[idx] }" v-if="trial.children && trial.children.length">
            <td colspan="5" class="p-0">
              <table class="child-table">
                <thead>
                  <tr>
                    <th>{{ t('teacherSalary.table.student') }}</th>
                    <th>{{ t('teacherSalary.table.status') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(k, kidx) in trial.children" :key="kidx">
                    <td class="fw-600 fs-115">{{ k.name }}</td>
                    <td>
                      <span class="trial-st" :class="'tr-' + k.status">{{ k.status === 'won' ? '✓ WON' : '✗ LOST' }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="trial-subtotal">
                 <span class="dim fw-600">
                   <span class="val-green">✓ WON: {{ trial.won }}</span> · 
                   <span class="val-red">✗ LOST: {{ trial.attended - trial.won }}</span> · 
                   {{ t('teacherSalary.trials.attended') }}: {{ trial.attended }}
                 </span>
                 <span class="mono fw-700" :class="isQualified(trial) ? 'val-green' : 'dim'">
                   {{ isQualified(trial) ? formatCurrency(35) : '0,00 zł' }}
                 </span>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- QA Confirmation -->
    <div class="qa-confirmed-footer" v-if="confirmedByQa">
      ✓ {{ t('teacherSalary.trials.qaConfirmed') }}: {{ confirmedBy }} · {{ confirmedAt }}
    </div>
  </div>
</template>

<style scoped>
.data-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
.data-table th { text-align: left; padding: 12px 14px; font-size: 10px; color: #4b5563; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,.05); }
.data-table td { padding: 14px; border-bottom: 1px solid rgba(255,255,255,.03); font-size: 13px; }

.mono { font-family: 'Space Mono', monospace; }
.dim { color: #6b7280; }
.val-green { color: #22c55e; }
.val-red { color: #ef4444; }
.fs-12 { font-size: 12px; }
.fs-11 { font-size: 11px; }
.fw-600 { font-weight: 600; }
.fw-700 { font-weight: 700; }
.p-0 { padding: 0 !important; }

.chip { padding: 3px 8px; border-radius: 20px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; border: 1px solid transparent; }
.chip-blue { background: rgba(79,110,247,.12); color: #4f6ef7; border-color: rgba(79,110,247,.25); }
.chip-purple { background: rgba(139,92,246,.12); color: #c4b5fd; border-color: rgba(139,92,246,.25); }

.trial-row { cursor: pointer; transition: background .2s; }
.trial-row:hover { background: rgba(255,255,255,.03); }
.trial-row.open { background: rgba(0,255,255,.05); }
.trial-expand-icon { display: inline-block; font-size: 8px; margin-right: 8px; transition: transform .3s; vertical-align: middle; color: #06b6d4; }
.trial-row.open .trial-expand-icon { transform: rotate(90deg); }

.trial-pct-bar { display: inline-block; width: 60px; height: 6px; background: rgba(255,255,255,.05); border-radius: 3px; margin-right: 10px; overflow: hidden; vertical-align: middle; }
.trial-pct-fill { height: 100%; border-radius: 3px; display: block; }
.trial-pct-fill.ok { background: #22c55e; box-shadow: 0 0 10px #22c55e; }
.trial-pct-fill.fail { background: #ef4444; }

.trial-paid-badge { font-family: 'Space Mono', monospace; color: #22c55e; font-weight: 700; font-size: 12px; }
.trial-nopay-badge { color: #6b7280; font-size: 10.5px; font-style: italic; }

.trial-children-panel { display: none; }
.trial-children-panel.open { display: table-row; }
.child-table { width: 100%; border-collapse: collapse; }
.child-table td { padding: 10px 14px; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,.02); }

.trial-st { font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 4px; }
.tr-won { background: rgba(34,197,94,.1); color: #22c55e; }
.tr-lost { background: rgba(239,68,68,.1); color: #ef4444; }

.trial-subtotal { padding: 12px 20px; background: rgba(0,0,0,.2); display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
.qa-confirmed-footer { margin-top: 16px; padding: 10px 14px; background: rgba(34,197,94,.05); border: 1px solid rgba(34,197,94,.1); border-radius: 10px; color: #22c55e; font-size: 11px; font-weight: 600; }
.hint { font-size: 11.5px; color: #4b5563; margin-top: 12px; font-style: italic; }
</style>
