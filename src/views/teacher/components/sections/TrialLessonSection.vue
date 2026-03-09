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
    
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ t('teacherSalary.table.details') }}</th>
            <th>{{ t('teacherSalary.table.dayTime') }}</th>
            <th>{{ t('teacherSalary.trials.attended') }}</th>
            <th class="text-center">WON %</th>
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
              <td class="mono text-center">{{ trial.attended }}</td>
              <td>
                <div class="trial-pct-cell">
                  <div class="trial-pct-container">
                    <span class="trial-pct-bar">
                      <span 
                        class="trial-pct-fill" 
                        :class="isQualified(trial) ? 'ok' : 'fail'" 
                        :style="{ width: getConversion(trial) + '%' }"
                      ></span>
                    </span>
                    <span class="mono fw-700 pct-val" :class="isQualified(trial) ? 'val-green' : 'val-red'">
                      {{ getConversion(trial) }}%
                    </span>
                  </div>
                  <span class="dim fs-11"> ({{ trial.won }}/{{ trial.attended }})</span>
                </div>
              </td>
              <td>
                <div class="trial-payment">
                  <span v-if="isQualified(trial)" class="trial-paid-badge">✓ 35 zł</span>
                  <span v-else class="trial-nopay-badge">— &lt; 51%</span>
                </div>
              </td>
            </tr>
            
            <!-- Trial Kids -->
            <tr class="trial-children-panel" :class="{ open: openTrials[idx] }" v-if="trial.children && trial.children.length">
              <td colspan="5" class="p-0">
                <div class="table-responsive">
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
                </div>
                <div class="trial-subtotal">
                   <span class="dim fw-600">
                     <span class="val-green">✓ WON: {{ trial.won }}</span> · 
                     <span class="val-red">✗ LOST: {{ trial.attended - trial.won }}</span> · 
                     {{ t('teacherSalary.trials.attended') }}: {{ trial.attended }}
                   </span>
                   <span class="mono fw-700 val-amount" :class="isQualified(trial) ? 'val-green' : 'dim'">
                     {{ isQualified(trial) ? formatCurrency(35) : '0,00 zł' }}
                   </span>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- QA Confirmation -->
    <div class="qa-confirmed-footer" v-if="confirmedByQa">
      <div class="qa-flex">
        <span>✓ {{ t('teacherSalary.trials.qaConfirmed') }}</span>
        <span class="dim">{{ confirmedBy }} · {{ confirmedAt }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.data-table { width: 100%; border-collapse: collapse; margin-top: 12px; min-width: 700px; }
.data-table th { text-align: left; padding: 11px 16px; font-size: 10.5px; font-weight: 700; color: var(--dim); letter-spacing: .08em; text-transform: uppercase; border-bottom: 1px solid var(--border); background: rgba(255, 255, 255, .02); }
.data-table td { padding: 11px 16px; border-bottom: 1px solid rgba(255, 255, 255, .04); font-size: 13px; vertical-align: middle; }
.data-table th:last-child, .data-table td:last-child { text-align: right; }
.data-table td:last-child { font-family: 'Space Mono', monospace; font-weight: 700; }
.data-table tr:hover td { background: rgba(255, 255, 255, .02); }

.mono { font-family: 'Space Mono', monospace; }
.val-green { color: var(--green); }
.val-red { color: var(--red); }
.val-blue { color: var(--blue); }
.val-purple { color: var(--purple); }
.dim { color: var(--dim); }
.fs-12 { font-size: 12px; }
.fs-11 { font-size: 11px; }
.fs-115 { font-size: 11.5px; }
.fw-600 { font-weight: 600; }
.fw-700 { font-weight: 700; }
.p-0 { padding: 0 !important; }
.text-center { text-align: center; }

.chip { padding: 3px 8px; border-radius: 20px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; border: 1px solid transparent; }
.chip-blue { background: rgba(79, 110, 247, .12); color: var(--blue); border-color: rgba(79, 110, 247, .25); }
.chip-purple { background: rgba(139, 92, 246, .12); color: var(--purple); border-color: rgba(139, 92, 246, .25); }

.trial-row { cursor: pointer; transition: background .15s; }
.trial-row:hover td { background: rgba(6, 182, 212, .04); }
.trial-row.open td { background: rgba(6, 182, 212, .04); border-bottom-color: rgba(6, 182, 212, .15); }
.trial-expand-icon { display: inline-block; font-size: 8px; margin-right: 8px; transition: transform .2s; vertical-align: middle; color: var(--dim); font-family: 'Space Mono', monospace; }
.trial-row.open .trial-expand-icon { transform: rotate(90deg); color: #06b6d4; }

.trial-pct-cell { display: flex; align-items: center; gap: 10px; }
.trial-pct-container { display: flex; align-items: center; gap: 8px; flex: 1; }
.trial-pct-bar { display: inline-block; width: 60px; height: 6px; background: rgba(255, 255, 255, .05); border-radius: 3px; overflow: hidden; vertical-align: middle; }
.trial-pct-fill { height: 100%; border-radius: 3px; display: block; position: relative; }
.trial-pct-fill.ok { background: var(--green); box-shadow: 0 0 10px rgba(34, 197, 94, .5); }
.trial-pct-fill.fail { background: var(--red); box-shadow: 0 0 10px rgba(239, 68, 68, .3); }
.pct-val { min-width: 40px; }

.trial-payment { font-family: 'Space Mono', monospace; font-weight: 700; font-size: 13px; text-align: right; }
.trial-paid-badge { color: var(--green); text-shadow: 0 0 10px rgba(34, 197, 94, .2); }
.trial-nopay-badge { color: var(--dim2); font-size: 10.5px; font-style: italic; font-weight: 400; font-family: 'Outfit', sans-serif; }

.trial-children-panel { display: none; }
.trial-children-panel.open { display: table-row; background: rgba(4, 4, 15, .6); }
.child-table { width: 100%; border-collapse: collapse; min-width: 400px; }
.child-table th { font-size: 9px; font-weight: 700; color: var(--dim2); letter-spacing: .08em; text-transform: uppercase; padding: 8px 12px 6px; text-align: left; border-bottom: 1px solid rgba(6, 182, 212, .08); background: rgba(6, 182, 212, .03); }
.child-table td { padding: 7px 12px; font-size: 11.5px; border-bottom: 1px solid rgba(255, 255, 255, .025); vertical-align: middle; }
.child-table th:last-child, .child-table td:last-child { text-align: right; }
.child-table tr:hover td { background: rgba(255, 255, 255, .015); }

.trial-st { font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }
.tr-won { background: rgba(34, 197, 94, .1); color: var(--green); border: 1px solid rgba(34, 197, 94, .2); }
.tr-lost { background: rgba(239, 68, 68, .1); color: var(--red); border: 1px solid rgba(239, 68, 68, .2); }

.trial-subtotal { padding: 8px 12px; background: rgba(6, 182, 212, .04); border-top: 1px solid rgba(6, 182, 212, .1); display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
.val-amount { color: var(--white); font-size: 13px; }

.qa-confirmed-footer { margin: 16px 14px; padding: 12px 16px; background: rgba(34, 197, 94, .05); border: 1px solid rgba(34, 197, 94, .1); border-radius: 12px; font-size: 11.5px; font-weight: 600; color: var(--green); }
.qa-flex { display: flex; justify-content: space-between; align-items: center; }
.hint { padding: 8px 14px; font-size: 11px; color: var(--dim); background: rgba(6, 182, 212, .03); border-bottom: 1px solid var(--border); }
</style>
