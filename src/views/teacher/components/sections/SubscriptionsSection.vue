<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Group } from '../../../../stores/teacherSalary.store';

const props = defineProps<{
  groups: Group[];
  base: number;
  rate: number;
  amount: number;
}>();

const { t } = useI18n();
const openGroups = ref<Record<string, boolean>>({});

const toggleGroup = (id: string) => {
  openGroups.value[id] = !openGroups.value[id];
};

const formatCurrency = (val: number) => {
  return val.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' zł';
};
</script>

<template>
  <div class="subscriptions-section">
    <div class="hint">💡 {{ t('teacherSalary.table.details') }}</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>{{ t('teacherSalary.table.group') }}</th>
          <th>{{ t('teacherSalary.table.dayTime') }}</th>
          <th>{{ t('teacherSalary.table.kids') }}</th>
          <th>{{ t('teacherSalary.table.base') }}</th>
          <th>{{ t('teacherSalary.table.salary') }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(group, idx) in groups" :key="idx">
          <tr class="group-row" :class="{ open: openGroups[group.name] }" @click="toggleGroup(group.name)">
            <td>
              <span class="group-expand-icon">▶</span>
              <span class="chip" :class="group.name.startsWith('SI') ? 'chip-purple' : 'chip-blue'">{{ group.name }}</span>
            </td>
            <td class="mono fs-12">{{ group.day }}</td>
            <td class="mono">{{ group.kids }}</td>
            <td class="mono dim">{{ formatCurrency(group.base) }}</td>
            <td class="val-blue mono">{{ formatCurrency(group.salary) }}</td>
          </tr>
          
          <tr class="children-panel" :class="{ open: openGroups[group.name] }" v-if="group.children.length">
            <td colspan="5" class="p-0">
              <table class="child-table">
                <thead>
                  <tr>
                    <th>{{ t('teacherSalary.table.student') }}</th>
                    <th>{{ t('teacherSalary.table.abonament') }}</th>
                    <th>{{ t('teacherSalary.table.discounts') }}</th>
                    <th>{{ t('teacherSalary.table.lessons') }}</th>
                    <th>{{ t('teacherSalary.table.status') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(child, cidx) in group.children" :key="cidx">
                    <td class="fw-600 fs-115">{{ child.name }}</td>
                    <td>
                      <span v-if="child.abonFinal" class="old-price mono">{{ formatCurrency(child.abon) }}</span>
                      <span class="child-abon mono">{{ formatCurrency(child.abonFinal || child.abon) }}</span>
                    </td>
                    <td>
                      <span 
                        v-for="(disc, didx) in child.discounts" 
                        :key="didx" 
                        class="child-discount" 
                        :class="'cd-' + disc.type"
                      >
                        {{ disc.label }}
                      </span>
                      <span v-if="!child.discounts.length" class="dim2 fs-105">—</span>
                    </td>
                    <td>
                      <div class="child-lessons">
                        <div class="lessons-dots">
                          <span 
                            v-for="(l, lidx) in child.lessons" 
                            :key="lidx" 
                            class="ldot" 
                            :class="l === 1 ? 'ldot-ok' : 'ldot-miss'"
                          ></span>
                        </div>
                        <span class="mono fs-105 dim">{{ child.lessons.filter((l: number) => l === 1).length }}/{{ child.lessons.length }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="status-badge" :class="'st-' + child.status">
                        {{ child.status === 'paid' ? '✓' : child.status === 'overdue' ? '⚠' : '🕐' }} 
                        {{ t('teacherSalary.' + child.status) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="children-subtotal">
                <span class="children-subtotal-label">{{ group.kids }} {{ t('teacherSalary.table.kids') }}</span>
                <span class="children-subtotal-val">
                  {{ t('teacherSalary.table.base') }}: {{ formatCurrency(group.base) }} → {{ t('teacherSalary.table.salary') }}: {{ formatCurrency(group.salary) }}
                </span>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    
    <div class="formula-box">
      <div class="fline">
        <span>{{ t('teacherSalary.table.base') }}</span>
        <span class="mono">{{ formatCurrency(base) }}</span>
      </div>
      <div class="fline">
        <span>{{ t('teacherSalary.admin.basis') }}</span>
        <span class="mono">{{ rate }}%</span>
      </div>
      <div class="fline total">
        <span class="mono">{{ formatCurrency(base) }} × {{ rate }}%</span>
        <span class="mono">{{ formatCurrency(amount) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Inherited styles from TeacherSalaryPage.vue */
.data-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
.data-table th { text-align: left; padding: 12px 14px; font-size: 10px; color: #4b5563; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,.05); }
.data-table td { padding: 14px; border-bottom: 1px solid rgba(255,255,255,.03); font-size: 13px; }

.group-row { cursor: pointer; transition: background .2s; }
.group-row:hover { background: rgba(255,255,255,.03); }
.group-row.open { background: rgba(79,110,247,.05); }
.group-expand-icon { display: inline-block; font-size: 8px; margin-right: 8px; transition: transform .3s; vertical-align: middle; color: #4f6ef7; }
.group-row.open .group-expand-icon { transform: rotate(90deg); }

.children-panel { display: none; }
.children-panel.open { display: table-row; background: rgba(0,0,0,.15); }

.child-table { width: 100%; border-collapse: collapse; background: rgba(8,8,24,.4); }
.child-table th { background: transparent; padding: 10px 14px; color: #374151; }
.child-table td { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,.02); }

.chip { padding: 3px 8px; border-radius: 20px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; border: 1px solid transparent; }
.chip-blue { background: rgba(79,110,247,.12); color: #4f6ef7; border-color: rgba(79,110,247,.25); }
.chip-purple { background: rgba(139,92,246,.12); color: #c4b5fd; border-color: rgba(139,92,246,.25); }

.child-discount { font-size: 8.5px; padding: 2px 6px; border-radius: 4px; margin-right: 4px; font-weight: 700; text-transform: uppercase; }
.cd-family { background: rgba(236,72,153,.1); color: #ec4899; }
.cd-promo { background: rgba(139,92,246,.1); color: #c4b5fd; }
.cd-individual { background: rgba(245,158,11,.1); color: #f59e0b; }

.child-lessons { display: flex; align-items: center; gap: 10px; }
.lessons-dots { display: flex; gap: 3px; }
.ldot { width: 5px; height: 5px; border-radius: 50%; opacity: .3; }
.ldot-ok { background: #22c55e; opacity: 1; box-shadow: 0 0 6px #22c55e; }
.ldot-miss { background: #ef4444; opacity: 1; }

.status-badge { font-size: 9px; padding: 2px 8px; border-radius: 4px; font-weight: 700; text-transform: uppercase; }
.st-paid { background: rgba(34,197,94,.1); color: #22c55e; }
.st-overdue { background: rgba(239,68,68,.1); color: #ef4444; }

.children-subtotal { padding: 12px 20px; background: rgba(0,0,0,.2); display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
.formula-box { margin-top: 24px; padding: 20px; background: rgba(8,8,24,.6); border-radius: 14px; border: 1px solid rgba(255,255,255,.04); }
.fline { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12.5px; color: #6b7280; }
.fline.total { border-top: 1px solid rgba(255,255,255,.06); margin-top: 12px; padding-top: 12px; font-weight: 800; color: #f0f0ff; font-size: 15px; }

.mono { font-family: 'Space Mono', monospace; }
.val-blue { color: #4f6ef7; }
.dim { color: #6b7280; }
.dim2 { color: #4b5563; }
.hint { font-size: 11.5px; color: #4b5563; margin-top: 12px; font-style: italic; }
.old-price { text-decoration: line-through; color: #4b5563; font-size: 10px; margin-right: 6px; }
</style>
