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
    <div class="table-responsive">
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
              <td class="mono text-center">{{ group.kids }}</td>
              <td class="mono dim">{{ formatCurrency(group.base) }}</td>
              <td class="val-blue mono">{{ formatCurrency(group.salary) }}</td>
            </tr>
            
            <tr class="children-panel" :class="{ open: openGroups[group.name] }" v-if="group.children.length">
              <td colspan="5" class="p-0">
                <div class="table-responsive">
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
                          <div class="price-stack">
                            <span v-if="child.abonFinal && child.abonFinal !== child.abon" class="old-price mono">{{ formatCurrency(child.abon) }}</span>
                            <span :class="{ 'child-abon': true, 'mono': true, 'val-white': !!child.abonFinal && child.abonFinal !== child.abon }">
                              {{ formatCurrency(child.abonFinal || child.abon) }}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div class="discounts-cell">
                            <span 
                              v-for="(disc, didx) in child.discounts" 
                              :key="didx" 
                              class="child-discount" 
                              :class="'cd-' + disc.type"
                            >
                              {{ disc.label }}
                            </span>
                            <span v-if="!child.discounts.length" class="dim2 fs-105">—</span>
                          </div>
                        </td>
                        <td>
                          <div class="child-lessons">
                            <div class="lessons-dots">
                              <span 
                                v-for="(l, lidx) in child.lessons" 
                                :key="lidx" 
                                class="ldot" 
                                :class="{
                                  'ldot-ok': l === 1,
                                  'ldot-miss': l === 0,
                                  'ldot-bonus': lidx === 4 && l === 1,
                                  'ldot-future': l === null
                                }"
                              ></span>
                            </div>
                            <span class="mono fs-105 dim">{{ child.lessons.filter((l: number) => l === 1).length }}/{{ child.lessons.length }}</span>
                          </div>
                        </td>
                        <td>
                          <span class="status-badge" :class="'st-' + child.status">
                            {{ child.status === 'paid' ? '✓' : child.status === 'overdue' ? '⚠' : '🕐' }} 
                            {{ t('teacherSalary.status.' + child.status) }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
    </div>
    
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
.table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.data-table { width: 100%; border-collapse: collapse; margin-top: 12px; min-width: 700px; }
.data-table th { text-align: left; padding: 11px 16px; font-size: 10.5px; font-weight: 700; color: var(--dim); letter-spacing: .08em; text-transform: uppercase; border-bottom: 1px solid var(--border); background: rgba(255, 255, 255, .02); }
.data-table td { padding: 11px 16px; border-bottom: 1px solid rgba(255, 255, 255, .04); font-size: 13px; vertical-align: middle; }
.data-table th:last-child, .data-table td:last-child { text-align: right; }
.data-table td:last-child { font-family: 'Space Mono', monospace; font-weight: 700; }
.data-table tr:hover td { background: rgba(255, 255, 255, .02); }

.group-row { cursor: pointer; transition: background .15s; }
.group-row:hover td { background: rgba(79, 110, 247, .04); }
.group-row.open td { background: rgba(79, 110, 247, .04); border-bottom-color: rgba(79, 110, 247, .15); }
.group-expand-icon { display: inline-block; font-size: 8px; margin-right: 8px; transition: transform .2s; vertical-align: middle; color: var(--dim); font-family: 'Space Mono', monospace; }
.group-row.open .group-expand-icon { transform: rotate(90deg); color: var(--blue); }

.children-panel { display: none; }
.children-panel.open { display: table-row; background: rgba(4, 4, 15, .6); }

.child-table { width: 100%; border-collapse: collapse; min-width: 650px; }
.child-table th { font-size: 9px; font-weight: 700; color: var(--dim2); letter-spacing: .08em; text-transform: uppercase; padding: 8px 12px 6px; text-align: left; border-bottom: 1px solid rgba(79, 110, 247, .08); background: rgba(79, 110, 247, .03); }
.child-table td { padding: 7px 12px; font-size: 11.5px; border-bottom: 1px solid rgba(255, 255, 255, .025); vertical-align: middle; }
.child-table th:last-child, .child-table td:last-child { text-align: right; }
.child-table td:last-child { font-family: 'Space Mono', monospace; font-weight: 700; }
.child-table tr:hover td { background: rgba(255, 255, 255, .015); }

.chip { padding: 3px 8px; border-radius: 20px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; border: 1px solid transparent; }
.chip-blue { background: rgba(79, 110, 247, .12); color: var(--blue); border-color: rgba(79, 110, 247, .25); }
.chip-purple { background: rgba(139, 92, 246, .12); color: var(--purple); border-color: rgba(139, 92, 246, .25); }

.price-stack { display: flex; flex-direction: column; }
.old-price { text-decoration: line-through; color: var(--dim2); font-size: 10px; }
.child-abon { font-family: 'Space Mono', monospace; font-weight: 600; color: var(--blue); }
.val-white { color: var(--white); }

.discounts-cell { display: flex; flex-wrap: wrap; gap: 4px; }
.child-discount { display: inline-flex; align-items: center; gap: 3px; padding: 2px 6px; border-radius: 10px; font-size: 9.5px; font-weight: 700; }
.cd-family { background: rgba(236, 72, 153, .1); color: var(--pink); border: 1px solid rgba(236, 72, 153, .2); }
.cd-promo { background: rgba(139, 92, 246, .1); color: var(--purple); border: 1px solid rgba(139, 92, 246, .2); }
.cd-quality { background: rgba(6, 182, 212, .1); color: var(--cyan); border: 1px solid rgba(6, 182, 212, .2); }
.cd-individual { background: rgba(245, 158, 11, .1); color: var(--amber); border: 1px solid rgba(245, 158, 11, .2); }

.child-lessons { display: flex; align-items: center; gap: 6px; }
.lessons-dots { display: flex; gap: 3px; }
.ldot { width: 8px; height: 8px; border-radius: 50%; opacity: .15; background: var(--white); }
.ldot-ok { background: var(--green); opacity: 1; box-shadow: 0 0 4px rgba(34, 197, 94, .4); }
.ldot-miss { background: var(--red); opacity: 1; box-shadow: 0 0 4px rgba(239, 68, 68, .3); }
.ldot-bonus { background: var(--amber); opacity: 1; box-shadow: 0 0 4px rgba(245, 158, 11, .3); }
.ldot-future { background: rgba(255, 255, 255, .1); border: 1px solid rgba(255, 255, 255, .15); }

.status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 10.5px; font-weight: 700; }
.st-paid { color: var(--green); }
.st-overdue { color: var(--red); }
.st-pending { color: var(--amber); }

.children-subtotal { padding: 8px 12px; background: rgba(79, 110, 247, .04); border-top: 1px solid rgba(79, 110, 247, .1); display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
.children-subtotal-label { color: var(--dim); font-weight: 600; }
.children-subtotal-val { font-family: 'Space Mono', monospace; font-weight: 700; color: var(--blue); }

.formula-box { margin-top: 10px; padding: 11px 14px; background: rgba(79, 110, 247, .06); border: 1px solid rgba(79, 110, 247, .2); border-radius: 10px; margin: 10px 14px; }
.fline { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11.5px; color: var(--dim); line-height: 1.9; }
.fline.total { border-top: 1px solid rgba(79, 110, 247, .25); margin-top: 3px; padding-top: 6px; font-weight: 700; color: var(--blue); }

.mono { font-family: 'Space Mono', monospace; }
.val-blue { color: var(--blue); }
.dim { color: var(--dim); }
.dim2 { color: var(--dim2); }
.text-center { text-align: center; }
.p-0 { padding: 0 !important; }
.fw-600 { font-weight: 600; }
.fs-115 { font-size: 11.5px; }
.fs-105 { font-size: 10.5px; }
.fs-12 { font-size: 12px; }
.hint { padding: 8px 14px; font-size: 11px; color: var(--dim); background: rgba(79, 110, 247, .03); border-bottom: 1px solid var(--border); }
</style>
