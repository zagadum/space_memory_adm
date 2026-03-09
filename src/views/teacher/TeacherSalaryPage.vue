<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTeacherSalaryStore } from '../../stores/teacherSalary.store';
import UiButton from '../../components/ui/UiButton.vue';

const { t, locale } = useI18n();
const salaryStore = useTeacherSalaryStore();

const currentMonth = ref('2026-02');
const openSections = ref<Record<string, boolean>>({
  'subscriptions': true,
  'substitutions': true,
  'methodical': true,
  'individual': true,
  'olympiad': true,
  'admin3pct': true,
  'bonuses': true,
  'trialLessons': true
});

const openGroups = ref<Record<string, boolean>>({});
const openTrials = ref<Record<string, boolean>>({});
const disputeVisible = ref(false);
const disputeText = ref('');

const toggleSection = (id: string) => {
  openSections.value[id] = !openSections.value[id];
};

const toggleGroup = (id: string) => {
  openGroups.value[id] = !openGroups.value[id];
};

const toggleTrial = (id: string) => {
  openTrials.value[id] = !openTrials.value[id];
};

const handleConfirm = async () => {
  if (salaryStore.salaryData?.status === 'draft') {
    await salaryStore.confirmSalary();
  }
};

const handleSendDispute = async () => {
  if (!disputeText.value.trim()) return;
  await salaryStore.disputeSalary(disputeText.value);
  disputeVisible.value = false;
  disputeText.value = '';
};

const formatCurrency = (val: number) => {
  return val.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' zł';
};

onMounted(async () => {
  await salaryStore.fetchSalary(currentMonth.value);
});

const salaryData = computed(() => salaryStore.salaryData);
const activeSections = computed(() => salaryStore.activeSections);

const getStatusClass = (status: string) => {
  if (status === 'confirmed') return 'st-confirmed';
  if (status === 'paid') return 'st-paid';
  return 'st-draft';
};

const getStatusIcon = (status: string) => {
  if (status === 'confirmed') return '✓';
  if (status === 'paid') return '💰';
  return '⏳';
};
</script>

<template>
  <div class="salary-container" v-if="salaryData">
    <!-- Stars Background -->
    <div class="stars-bg"></div>

    <div class="wrap">
      <!-- HEADER -->
      <div class="page-header">
        <div class="page-title">
          <div class="page-icon">💰</div>
          <div>
            <h1>{{ t('teacherSalary.pageTitle') }}</h1>
            <p>{{ t('teacherSalary.panelSubtitle') }}</p>
          </div>
        </div>
        <div class="header-right">
          <div class="role-badge">
            <div class="role-dot"></div>
            <span>{{ t('teacherSalary.trainer') }}</span>
          </div>
        </div>
      </div>

      <!-- MONTH SELECTOR -->
      <div class="month-bar">
        <span class="month-label">{{ t('teacherSalary.period') }}:</span>
        <select class="month-select" v-model="currentMonth" @change="salaryStore.fetchSalary(currentMonth)">
          <option value="2026-02">Лютий 2026 / Luty 2026</option>
          <option value="2026-01">Січень 2026 / Styczeń 2026</option>
          <option value="2025-12">Грудень 2025 / Grudzień 2025</option>
        </select>
        <span class="st-pill" :class="getStatusClass(salaryData.status)">
          {{ getStatusIcon(salaryData.status) }} {{ t(`teacherSalary.status.${salaryData.status}`) }}
        </span>
      </div>

      <!-- TEACHER CARD -->
      <div class="teacher-card">
        <div class="teacher-av">АК</div>
        <div class="teacher-info">
          <div class="teacher-name">{{ salaryData.trainerName }}</div>
          <div class="teacher-meta">B2B · Від 01.09.2024 · Ставка: 11%</div>
          <div class="teacher-groups">
            <span class="chip chip-blue">SM-01 · вт 17:00</span>
            <span class="chip chip-blue">SM-02 · сб 10:00</span>
            <span class="chip chip-purple">SI-03 · пн 16:00</span>
            <span class="chip chip-blue">SM-05 · пт 18:30</span>
            <span class="chip chip-purple">SI-07 · ср 15:00</span>
          </div>
        </div>
      </div>

      <!-- SUMMARY CARDS -->
      <div class="summary-grid">
        <div 
          v-for="sec in activeSections" 
          :key="sec.type" 
          class="sum-card" 
          :class="'c-' + sec.type"
        >
          <div class="sum-label">{{ t(sec.label) }}</div>
          <div class="sum-val">{{ formatCurrency(sec.amount) }}</div>
          <div class="sum-sub">{{ sec.subtext }}</div>
        </div>
        <div class="sum-card sum-card-total">
          <div class="sum-label">RAZEM</div>
          <div class="sum-val mono">{{ formatCurrency(salaryData.total) }}</div>
          <div class="sum-sub">{{ t('teacherSalary.totalPayout').toLowerCase() }}</div>
        </div>
      </div>

      <!-- SECTIONS -->
      <div class="sections-container">
        <!-- 1. Subscriptions -->
        <div class="section" v-if="salaryData.subscriptions.amount > 0">
          <div class="section-header" @click="toggleSection('subscriptions')">
            <div class="section-title">
              <div class="section-icon si-sub">📊</div>
              {{ t('teacherSalary.sections.subscriptions') }}
            </div>
            <div class="section-amount">
              <span class="val-blue">{{ formatCurrency(salaryData.subscriptions.amount) }}</span>
              <span class="section-chevron" :class="{ open: openSections.subscriptions }">▼</span>
            </div>
          </div>
          <div class="section-body" v-show="openSections.subscriptions">
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
                <template v-for="(group, idx) in salaryData.subscriptions.groups" :key="idx">
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
                  <!-- Children Panel -->
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
            <!-- Formula -->
            <div class="formula-box">
              <div class="fline">
                <span>{{ t('teacherSalary.table.base') }}</span>
                <span class="mono">{{ formatCurrency(salaryData.subscriptions.base) }}</span>
              </div>
              <div class="fline">
                <span>{{ t('teacherSalary.admin.basis') }}</span>
                <span class="mono">{{ salaryData.subscriptions.rate }}%</span>
              </div>
              <div class="fline total">
                <span class="mono">{{ formatCurrency(salaryData.subscriptions.base) }} × {{ salaryData.subscriptions.rate }}%</span>
                <span class="mono">{{ formatCurrency(salaryData.subscriptions.amount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Substitutions -->
        <div class="section" v-if="salaryData.substitutions.amount > 0">
          <div class="section-header" @click="toggleSection('substitutions')">
            <div class="section-title">
              <div class="section-icon si-sub">🔄</div>
              {{ t('teacherSalary.sections.substitutions') }}
            </div>
            <div class="section-amount">
                <span class="val-blue">{{ formatCurrency(salaryData.substitutions.amount) }}</span>
                <span class="section-chevron" :class="{ open: openSections.substitutions }">▼</span>
            </div>
          </div>
          <div class="section-body" v-show="openSections.substitutions">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ t('teacherSalary.table.student') }}</th>
                  <th>{{ t('teacherSalary.table.group') }}</th>
                  <th>{{ t('teacherSalary.table.salary') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in salaryData.substitutions.rows" :key="idx">
                  <td>{{ row.child }}<br><span class="dim fs-11">за {{ row.forTrainer }} · {{ row.date }}</span></td>
                  <td><span class="chip chip-blue">{{ row.group }}</span></td>
                  <td class="mono val-blue">{{ formatCurrency(row.salary) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. Methodical -->
        <div class="section" v-if="salaryData.methodical.amount > 0">
          <div class="section-header" @click="toggleSection('methodical')">
            <div class="section-title">
              <div class="section-icon si-meth">🎓</div>
              {{ t('teacherSalary.sections.methodical') }}
            </div>
            <div class="section-amount">
                <span class="val-purple mono">{{ formatCurrency(salaryData.methodical.amount) }}</span>
                <span class="section-chevron" :class="{ open: openSections.methodical }">▼</span>
            </div>
          </div>
          <div class="section-body" v-show="openSections.methodical">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ t('teacherSalary.admin.duty') }}</th>
                  <th>{{ t('teacherSalary.table.status') }}</th>
                  <th>{{ t('teacherSalary.table.salary') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in salaryData.methodical.rows" :key="idx">
                  <td>{{ row.name }}<br><span class="dim fs-11">{{ row.date }}</span></td>
                  <td>
                    <span v-if="row.present" class="chip chip-green">✅ Present</span>
                    <span v-else class="chip chip-amber">❌ Absent</span>
                  </td>
                  <td class="mono val-purple">{{ formatCurrency(row.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 4. Individual -->
        <div class="section" v-if="salaryData.individual.amount > 0">
          <div class="section-header" @click="toggleSection('individual')">
            <div class="section-title">
              <div class="section-icon si-indiv">👤</div>
              {{ t('teacherSalary.sections.individual') }}
            </div>
            <div class="section-amount">
                <span class="val-pink mono">{{ formatCurrency(salaryData.individual.amount) }}</span>
                <span class="section-chevron" :class="{ open: openSections.individual }">▼</span>
            </div>
          </div>
          <div class="section-body" v-show="openSections.individual">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ t('teacherSalary.table.student') }}</th>
                  <th>{{ t('teacherSalary.table.lessons') }}</th>
                  <th>{{ t('teacherSalary.table.salary') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in salaryData.individual.rows" :key="idx">
                  <td>{{ row.child }}<br><span class="dim fs-11">{{ row.program }}</span></td>
                  <td class="mono">{{ row.count }}</td>
                  <td class="mono val-pink">{{ formatCurrency(row.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 5. Olympiad -->
        <div class="section" v-if="salaryData.olympiad.amount > 0">
          <div class="section-header" @click="toggleSection('olympiad')">
            <div class="section-title">
              <div class="section-icon si-olym">🏆</div>
              {{ t('teacherSalary.sections.olympiad') }}
            </div>
            <div class="section-amount">
                <span class="val-blue mono">{{ formatCurrency(salaryData.olympiad.amount) }}</span>
                <span class="section-chevron" :class="{ open: openSections.olympiad }">▼</span>
            </div>
          </div>
          <div class="section-body" v-show="openSections.olympiad">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ t('teacherSalary.admin.duty') }}</th>
                  <th>Zoom Rec</th>
                  <th>{{ t('teacherSalary.table.salary') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in salaryData.olympiad.rows" :key="idx">
                  <td>{{ row.name }}<br><span class="dim fs-11">{{ row.date }}</span></td>
                  <td><a href="#" class="val-blue fs-11">🔗 {{ row.link }}</a></td>
                  <td class="mono val-blue">{{ formatCurrency(row.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 7. Bonuses -->
        <div class="section" v-if="salaryData.bonuses.amount > 0">
            <div class="section-header" @click="toggleSection('bonuses')">
              <div class="section-title">
                <div class="section-icon si-bonus">🎁</div>
                {{ t('teacherSalary.sections.bonuses') }}
              </div>
              <div class="section-amount">
                  <span class="val-green mono">{{ formatCurrency(salaryData.bonuses.amount) }}</span>
                  <span class="section-chevron" :class="{ open: openSections.bonuses }">▼</span>
              </div>
            </div>
            <div class="section-body" v-show="openSections.bonuses">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>{{ t('teacherSalary.admin.duty') }}</th>
                    <th>{{ t('teacherSalary.table.status') }}</th>
                    <th>{{ t('teacherSalary.table.salary') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in salaryData.bonuses.rows" :key="idx">
                    <td>{{ row.reason }}<br><span class="dim fs-11">{{ row.comment }}</span></td>
                    <td><span class="chip chip-green">✅ Approved</span></td>
                    <td class="mono val-green">{{ formatCurrency(row.total) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
        </div>

        <!-- 6. Admin Duties (Porting 3% section) -->
        <div class="section" v-if="salaryData.admin3pct.amount > 0">
          <div class="section-header" @click="toggleSection('admin3pct')">
            <div class="section-title">
              <div class="section-icon si-admin">📋</div>
              {{ t('teacherSalary.sections.admin3pct') }}
            </div>
            <div class="section-amount">
              <span class="val-green mono">{{ formatCurrency(salaryData.admin3pct.amount) }}</span>
              <span class="section-chevron" :class="{ open: openSections.admin3pct }">▼</span>
            </div>
          </div>
          <div class="section-body" v-show="openSections.admin3pct">
            <div class="qa-banner" :class="salaryData.admin3pct.pct >= 100 ? 'qa-banner-ok' : 'qa-banner-partial'">
              <div>
                <strong :class="salaryData.admin3pct.pct >= 100 ? 'val-green' : 'val-amber'">
                  {{ salaryData.admin3pct.pct >= 100 ? '✅ ' + t('teacherSalary.admin.allDone') : '⚠️ ' + t('teacherSalary.admin.hasIssues') }}
                </strong><br>
                <span class="dim fs-115">{{ t('teacherSalary.admin.evaluated') }} {{ salaryData.admin3pct.evaluatedAt }} · {{ salaryData.admin3pct.evaluatedBy }}</span>
              </div>
              <div class="qa-pct" :class="salaryData.admin3pct.pct >= 100 ? 'qa-pct-ok' : 'qa-pct-partial'">
                {{ salaryData.admin3pct.pct }}%
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
                <tr v-for="(item, idx) in salaryData.admin3pct.checklist" :key="idx" :class="{ 'issue-row': item.status !== 'done' }">
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
            <!-- Formula -->
            <div class="formula-box">
              <div class="fline"><span>{{ t('teacherSalary.table.base') }}</span><span>{{ formatCurrency(salaryData.admin3pct.base) }}</span></div>
              <div class="fline"><span>{{ t('teacherSalary.admin.score') }}</span><span>{{ salaryData.admin3pct.pct }}%</span></div>
              <div class="fline"><span>{{ t('teacherSalary.admin.basis') }}</span><span>3% × {{ salaryData.admin3pct.pct }}% = {{ (3 * salaryData.admin3pct.pct / 100).toFixed(2) }}%</span></div>
              <div class="fline total"><span>{{ formatCurrency(salaryData.admin3pct.base) }} × {{ (3 * salaryData.admin3pct.pct / 100).toFixed(2) }}%</span><span>{{ formatCurrency(salaryData.admin3pct.amount) }}</span></div>
            </div>
          </div>
        </div>

        <!-- 8. Trial Lessons -->
        <div class="section" v-if="salaryData.trialLessons.amount > 0">
          <div class="section-header" @click="toggleSection('trialLessons')">
            <div class="section-title">
              <div class="section-icon si-trial">🧪</div>
              {{ t('teacherSalary.sections.trialLessons') }}
            </div>
            <div class="section-amount">
              <span class="val-cyan mono">{{ formatCurrency(salaryData.trialLessons.amount) }}</span>
              <span class="section-chevron" :class="{ open: openSections.trialLessons }">▼</span>
            </div>
          </div>
          <div class="section-body" v-show="openSections.trialLessons">
            <div class="hint">💡 {{ t('teacherSalary.trials.threshold') }}</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ t('teacherSalary.table.details') }}</th>
                  <th>{{ t('teacherSalary.table.details') }}</th>
                  <th>{{ t('teacherSalary.trials.attended') }}</th>
                  <th>WON %</th>
                  <th>{{ t('teacherSalary.trials.paid') }}</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(trial, idx) in salaryData.trialLessons.rows" :key="idx">
                  <tr class="trial-row" :class="{ open: openTrials[trial.name + idx] }" @click="toggleTrial(trial.name + idx)">
                    <td>
                      <span class="trial-expand-icon">▶</span>
                      <span class="chip" :class="trial.program === 'INDIGO' ? 'chip-purple' : 'chip-blue'">{{ trial.name }}</span>
                    </td>
                    <td class="mono fs-12">{{ trial.date }}</td>
                    <td class="mono">{{ trial.attended }}</td>
                    <td>
                      <span class="trial-pct-bar">
                        <span class="trial-pct-fill" :class="trial.pctWon >= salaryData.trialLessons.threshold ? 'ok' : 'fail'" :style="{ width: trial.pctWon + '%' }"></span>
                      </span>
                      <span class="mono fw-700" :class="trial.pctWon >= salaryData.trialLessons.threshold ? 'val-green' : 'val-red'">{{ trial.pctWon }}%</span>
                      <span class="dim fs-11"> ({{ trial.won }}/{{ trial.attended }})</span>
                    </td>
                    <td>
                      <span v-if="trial.paid" class="trial-paid-badge">✓ 35 zł</span>
                      <span v-else class="trial-nopay-badge">— &lt; 51%</span>
                    </td>
                  </tr>
                  <!-- Trial Kids -->
                  <tr class="trial-children-panel" :class="{ open: openTrials[trial.name + idx] }" v-if="trial.children.length">
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
                         <span class="mono fw-700" :class="trial.paid ? 'val-green' : 'dim'">{{ trial.paid ? formatCurrency(35) : '0,00 zł' }}</span>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
            <!-- QA Confirmation -->
            <div class="qa-confirmed-footer" v-if="salaryData.trialLessons.confirmedByQA">
              ✓ {{ t('teacherSalary.trials.qaConfirmed') }}: {{ salaryData.trialLessons.confirmedBy }} · {{ salaryData.trialLessons.confirmedAt }}
            </div>
          </div>
        </div>
      </div>

      <!-- FINAL BLOCK -->
      <div class="final-block">
        <div>
          <div class="final-label">{{ t('teacherSalary.pageTitle') }}</div>
          <div class="final-trainer">{{ salaryData.trainerName }}</div>
          <div class="final-month mono">{{ salaryData.month }}</div>
          <div class="final-breakdown">
             <div v-for="sec in activeSections" :key="sec.type" class="final-bd-row">
               <span>{{ t(sec.label) }}</span>
               <span class="mono" :class="'val-' + sec.type">{{ formatCurrency(sec.amount) }}</span>
             </div>
          </div>
        </div>
        <div class="text-right">
          <div class="final-amount mono">{{ formatCurrency(salaryData.total) }}</div>
          <div class="final-sublabel">{{ t('teacherSalary.totalPayout') }}</div>
        </div>
      </div>

      <!-- CONFIRM / DISPUTE -->
      <div class="confirm-block">
        <div class="confirm-title">{{ salaryData.status === 'draft' ? t('teacherSalary.actions.confirm') : t('teacherSalary.status.' + salaryData.status) }}</div>
        <div v-if="salaryData.status === 'draft'" class="confirm-sub">Перевірте всі позиції вище. Після підтвердження розрахунок буде передано бухгалтеру для виплати.</div>
        
        <div class="btns-center" v-if="salaryData.status === 'draft'">
          <UiButton 
            variant="primary" 
            class="premium-btn" 
            @click="handleConfirm" 
            :loading="salaryStore.isLoading"
          >
            ✓ {{ t('teacherSalary.actions.confirm') }}
          </UiButton>
          <button class="btn-dispute" @click="disputeVisible = !disputeVisible">
            ⚠️ {{ t('teacherSalary.actions.dispute') }}
          </button>
        </div>

        <div class="dispute-area" v-if="disputeVisible && salaryData.status === 'draft'">
           <div class="dispute-label">{{ t('teacherSalary.actions.disputeLabel') }}</div>
           <textarea class="dispute-input" v-model="disputeText" :placeholder="t('teacherSalary.actions.disputePlaceholder')"></textarea>
           <div class="btns-left">
             <UiButton size="sm" @click="handleSendDispute">{{ t('teacherSalary.actions.sendToAccounting') }}</UiButton>
             <button class="btn-ghost" @click="disputeVisible = false">{{ t('teacherSalary.actions.cancel') }}</button>
           </div>
        </div>

        <!-- Confirmed Stamp -->
        <div class="confirmed-stamp" :class="{ show: salaryData.status !== 'draft' }">
           <div class="stamp-inner">
             <div class="stamp-check">✅</div>
             <div class="stamp-text">{{ t('teacherSalary.status.confirmed') }}</div>
             <div class="stamp-date mono" v-if="salaryData.confirmedAt">{{ salaryData.confirmedAt }}</div>
           </div>
        </div>
      </div>

      <!-- TIMESTAMP -->
      <div class="ts-bar">
        <span>{{ t('teacherSalary.generatedAt') }}: 01.03.2026 · 09:14</span>
      </div>

    </div>
  </div>
</template>

<style scoped>
:root {
  --bg: #04040f;
  --bg2: #080818;
  --bg3: #0d0d24;
  --card: #0f0f2a;
  --card2: #141435;
  --border: rgba(79, 110, 247, .15);
  --blue: #4f6ef7;
  --purple: #8b5cf6;
  --green: #22c55e;
  --red: #ef4444;
  --amber: #f59e0b;
  --cyan: #06b6d4;
  --pink: #ec4899;
  --white: #f0f0ff;
  --dim: #6b7280;
  --dim2: #4b5563;
  --glow-blue: 0 0 20px rgba(79, 110, 247, .3);
  --glow-green: 0 0 16px rgba(34,197,94, .35);
}

.salary-container {
  min-height: 100vh;
  background: var(--bg);
  color: var(--white);
  font-family: 'Outfit', sans-serif;
  position: relative;
  overflow-x: hidden;
  padding-bottom: 60px;
}

/* Stars Background Simulation */
.stars-bg {
  position: fixed;
  inset: 0;
  background: 
    radial-gradient(1.5px 1.5px at 15% 15%, #fff, transparent),
    radial-gradient(1px 1px at 25% 35%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 35% 85%, #fff, transparent),
    radial-gradient(1px 1px at 45% 55%, #fff, transparent),
    radial-gradient(2px 2px at 65% 15%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 75% 65%, #fff, transparent),
    radial-gradient(1px 1px at 85% 25%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 95% 75%, #fff, transparent);
  opacity: .4;
  pointer-events: none;
  z-index: 0;
}

.wrap {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Common Styles */
.mono { font-family: 'Space Mono', monospace; }
.dim { color: var(--dim); }
.dim2 { color: var(--dim2); }
.val-blue { color: var(--blue); }
.val-green { color: var(--green); }
.val-amber { color: var(--amber); }
.val-red { color: var(--red); }
.val-cyan { color: var(--cyan); }
.val-pink { color: var(--pink); }
.fs-12 { font-size: 12px; }
.fs-115 { font-size: 11.5px; }
.fs-105 { font-size: 10.5px; }
.fw-600 { font-weight: 600; }
.fw-700 { font-weight: 700; }
.p-0 { padding: 0 !important; }

/* Header */
.page-header {
  padding: 28px 0 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
}
.page-title { display: flex; align-items: center; gap: 12px; }
.page-icon {
  width: 44px; height: 44px;
  background: linear-gradient(135deg, var(--blue), var(--purple));
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  box-shadow: var(--glow-blue);
}
.page-title h1 { font-size: 21px; font-weight: 800; margin: 0; }
.page-title p { font-size: 11px; color: var(--dim); font-family: 'Space Mono', monospace; margin-top: 2px; }

.role-badge {
  display: flex; align-items: center; gap: 8px;
  background: rgba(79,110,247,.12);
  border: 1px solid var(--border);
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 12.5px; font-weight: 700; color: var(--blue);
}
.role-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--blue);
  box-shadow: 0 0 8px var(--blue);
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

/* Month Bar */
.month-bar {
  display: flex; align-items: center; gap: 12px;
  margin: 22px 0 18px; flex-wrap: wrap;
}
.month-label { font-size: 11px; font-weight: 700; color: var(--dim); text-transform: uppercase; letter-spacing: .1em; }
.month-select {
  background: var(--bg3); border: 1px solid var(--border);
  border-radius: 10px; color: var(--white);
  padding: 10px 18px; font-size: 14px; cursor: pointer;
  transition: all .2s;
}
.month-select:hover { border-color: rgba(79, 110, 247, .4); }

.st-pill {
  padding: 7px 14px; border-radius: 20px;
  font-size: 12px; font-weight: 700;
}
.st-draft { background: rgba(245,158,11,.1); color: #f59e0b; border: 1px solid rgba(245,158,11,.25); }
.st-confirmed { background: rgba(34,197,94,.1); color: #22c55e; border: 1px solid rgba(34,197,94,.25); }
.st-paid { background: rgba(4f,6e,f7,.1); color: #4f6ef7; border: 1px solid rgba(79,110,247,.25); }

/* Teacher Card */
.teacher-card {
  display: flex; align-items: center; gap: 18px;
  background: var(--card); border: 1px solid var(--border);
  border-radius: 18px; padding: 22px 26px; margin-bottom: 24px;
}
.teacher-av {
  width: 54px; height: 54px; border-radius: 50%;
  background: linear-gradient(135deg, var(--blue), var(--purple));
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 800; border: 2px solid rgba(255,255,255,.12);
  box-shadow: var(--glow-blue);
}
.teacher-info { flex: 1; }
.teacher-name { font-size: 18px; font-weight: 800; }
.teacher-meta { font-size: 12.5px; color: var(--dim); margin-top: 3px; }
.teacher-groups { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }

/* Chips */
.chip {
  padding: 3px 8px; border-radius: 20px; font-size: 10.5px; font-weight: 700;
  display: inline-flex; align-items: center; gap: 4px; border: 1px solid transparent;
}
.chip-blue { background: rgba(79,110,247,.12); color: #4f6ef7; border-color: rgba(79,110,247,.25); }
.chip-purple { background: rgba(139,92,246,.12); color: #8b5cf6; border-color: rgba(139,92,246,.25); }
.chip-green { background: rgba(34,197,94,.1); color: #22c55e; border-color: rgba(34,197,94,.25); }
.chip-amber { background: rgba(245,158,11,.1); color: #f59e0b; border-color: rgba(245,158,11,.25); }

/* Summary Grid */
.summary-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px; margin-bottom: 24px;
}
.sum-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 14px; padding: 16px 18px; position: relative; overflow: hidden;
  transition: all .2s cubic-bezier(.4, 0, .2, 1);
}
.sum-card:hover { transform: translateY(-4px); border-color: rgba(79, 110, 247, .4); box-shadow: 0 10px 20px rgba(0,0,0,.2); }
.sum-card::before { content: ''; position: absolute; top:0; left:0; right:0; height: 3px; }
.sum-card.c-subscription::before { background: linear-gradient(90deg, var(--blue), transparent); }
.sum-card.c-admin::before { background: linear-gradient(90deg, var(--green), transparent); }
.sum-card.c-trial::before { background: linear-gradient(90deg, var(--cyan), transparent); }
.sum-label { font-size: 10px; font-weight: 600; color: var(--dim); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
.sum-val { font-family: 'Space Mono', monospace; font-size: 17px; font-weight: 800; }
.sum-sub { font-size: 10.5px; color: var(--dim); margin-top: 2px; }

.sum-card-total {
  background: linear-gradient(135deg, rgba(79,110,247,.2), rgba(139,92,246,.15));
  border-color: rgba(79,110,247,.4); box-shadow: var(--glow-blue);
}
.sum-card-total .sum-val { font-size: 21px; color: var(--white); }
.sum-card-total .sum-label { color: var(--blue); }

/* Sections */
.section { margin-bottom: 16px; }
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 0 12px; cursor: pointer; user-select: none;
}
.section-title { display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 800; }
.section-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; font-size: 14px;
}
.si-sub { background: rgba(79,110,247,.15); color: var(--blue); }
.si-admin { background: rgba(34,197,94,.15); color: var(--green); }
.si-trial { background: rgba(6,182,212,.15); color: var(--cyan); }
.si-meth { background: rgba(139,92,246,.15); color: var(--purple); }
.si-indiv { background: rgba(236,72,153,.15); color: var(--pink); }
.si-olym { background: rgba(79,110,247,.15); color: var(--blue); }
.si-bonus { background: rgba(34,197,94,.15); color: var(--green); }

.section-amount {
  font-family: 'Space Mono', monospace; font-size: 15px;
  font-weight: 800; display: flex; align-items: center; gap: 12px;
}
.section-chevron { color: var(--dim); font-size: 12px; transition: transform .2s; }
.section-chevron.open { transform: rotate(180deg); }

.section-body { background: var(--card); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; backdrop-filter: blur(12px); }
.hint { padding: 10px 16px; font-size: 11.5px; color: var(--dim); background: rgba(255,255,255,.03); border-bottom: 1px solid var(--border); }

/* Data Table */
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  font-size: 10px; font-weight: 740; color: var(--dim); text-transform: uppercase;
  padding: 12px 16px; border-bottom: 1px solid var(--border);
  text-align: left; background: rgba(255,255,255,0.02);
}
.data-table td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.04); }
.data-table tr:hover td { background: rgba(255,255,255,0.02); }

/* Group Row Expandable */
.group-row { cursor: pointer; transition: background 0.15s; }
.group-row td:first-child { position: relative; padding-left: 30px; }
.group-expand-icon {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  font-size: 10px; color: #6b7280; transition: transform 0.2s;
}
.group-row.open .group-expand-icon { transform: translateY(-50%) rotate(90deg); color: #4f6ef7; }
.children-panel { display: none; background: rgba(4,4,15,0.6); }
.children-panel.open { display: table-row; }

/* Sub Table */
.child-table { width: 100%; border-collapse: collapse; }
.child-table th {
  font-size: 9px; color: var(--dim2); background: rgba(79,110,247,0.05);
  padding: 10px 14px; border-bottom: 1px solid rgba(79,110,247,0.1);
}
.child-table td { padding: 8px 14px; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); }

.ldot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 3px; }
.ldot-ok { background: #22c55e; box-shadow: 0 0 4px rgba(34,197,94,.4); }
.ldot-miss { background: #ef4444; box-shadow: 0 0 4px rgba(239,68,68,.3); }

.child-discount {
  font-size: 9.5px; font-weight: 700; padding: 2px 6px; border-radius: 10px; margin-right: 4px;
}
.cd-family { background: rgba(236,72,153,.1); color: #ec4899; border: 1px solid rgba(236,72,153,.2); }
.cd-promo { background: rgba(139,92,246,.1); color: #8b5cf6; border: 1px solid rgba(139,92,246,.2); }

.children-subtotal {
  display: flex; justify-content: space-between; padding: 8px 12px;
  background: rgba(79,110,247,0.04); font-size: 11px;
}

/* Admin QA Banner */
.qa-banner { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.qa-banner-ok { background: rgba(34,197,94,.06); }
.qa-banner-partial { background: rgba(245,158,11,.06); }
.qa-pct {
  font-family: 'Space Mono', monospace; font-size: 24px; font-weight: 800;
  margin-left: auto; padding: 8px 16px; border-radius: 12px;
}
.qa-pct-ok { background: rgba(34,197,94,0.15); color: var(--green); border: 1px solid rgba(34,197,94,0.3); box-shadow: var(--glow-green); }
.qa-pct-partial { background: rgba(245,158,11,0.15); color: var(--amber); border: 1px solid rgba(245,158,11,0.3); }

.checklist-table td { vertical-align: middle; }
.issue-row { background: rgba(245,158,11,.03); }
.ok-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; }
.ok-done { background: rgba(34,197,94,.1); color: #22c55e; border: 1px solid rgba(34,197,94,.2); }
.ok-partial { background: rgba(245,158,11,.1); color: #f59e0b; border: 1px solid rgba(245,158,11,.2); }

.qa-comment-label { font-size: 9px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 3px; }
.qa-comment { font-size: 12px; color: #f59e0b; line-height: 1.5; }

/* Trial Lessons */
.trial-pct-bar {
  height: 8px; background: rgba(255,255,255,.08); border-radius: 4px;
  width: 90px; display: inline-block; vertical-align: middle; margin-right: 8px;
}
.trial-pct-fill { height: 100%; border-radius: 4px; transition: width 0.4s cubic-bezier(.4, 0, .2, 1); }
.trial-pct-fill.ok { background: linear-gradient(90deg, var(--green), var(--cyan)); box-shadow: 0 0 10px rgba(34,197,94, .3); }
.trial-pct-fill.fail { background: linear-gradient(90deg, var(--red), var(--pink)); }

/* Final Block */
.final-block {
  background: linear-gradient(135deg, rgba(79,110,247,.15), rgba(139,92,246,.12));
  border: 1px solid rgba(79,110,247,.4); border-radius: 18px;
  padding: 26px 30px; display: flex; justify-content: space-between; align-items: center;
  margin-top: 26px; box-shadow: var(--glow-blue);
}
.final-amount { font-family: 'Space Mono', monospace; font-size: 38px; font-weight: 800; text-shadow: 0 0 25px rgba(79,110,247,.5); color: var(--white); }
.final-sublabel { font-size: 11px; color: var(--dim); text-align: right; }

.final-label { font-size: 10px; font-weight: 700; color: var(--blue); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 4px; }
.final-trainer { font-size: 22px; font-weight: 800; color: var(--white); }
.final-month { font-size: 13px; color: var(--dim); margin: 2px 0 12px; }
.final-breakdown { margin-top: 14px; border-top: 1px solid var(--border); padding-top: 12px; }
.final-bd-row { display: flex; justify-content: space-between; gap: 40px; font-size: 12px; margin-bottom: 6px; color: var(--dim); }
.final-bd-row span:last-child { font-weight: 700; color: var(--white); }

/* Confirm Block */
.confirm-block {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 16px; padding: 24px; margin-top: 20px; text-align: center;
}
.btns-center { display: flex; justify-content: center; gap: 12px; align-items: center; }
.premium-btn { 
  font-size: 15px !important; padding: 12px 28px !important;
  background: linear-gradient(135deg, var(--green), var(--cyan)) !important;
  box-shadow: 0 4px 15px rgba(34,197,94, .3) !important;
}
.btn-dispute {
  background: transparent; border: 1px solid rgba(245,158,11,.3);
  color: var(--amber); padding: 8px 16px; border-radius: 9px; cursor: pointer;
  transition: all .2s;
}
.btn-dispute:hover { background: rgba(245,158,11,.08); border-color: var(--amber); }

.confirmed-stamp { display: none; margin-top: 18px; }
.confirmed-stamp.show { display: block; animation: stampIn .5s cubic-bezier(.34,1.56,.64,1); }
@keyframes stampIn { 0%{opacity:0; transform:scale(1.6) rotate(-5deg)} 100%{opacity:1; transform:scale(1) rotate(0)}}

.stamp-inner {
  display: inline-flex; flex-direction: column; align-items: center;
  border: 4px solid rgba(34,197,94,.4); border-radius: 16px;
  padding: 18px 36px; background: rgba(34,197,94,0.06);
  box-shadow: 0 0 20px rgba(34,197,94, .15);
}
.stamp-check { font-size: 40px; filter: drop-shadow(0 0 8px var(--green)); }
.stamp-text { color: var(--green); font-weight: 800; text-transform: uppercase; letter-spacing: .05em; margin-top: 4px; }

.formula-box {
  background: rgba(79,110,247,.08); border: 1px solid rgba(79,110,247,.25);
  border-radius: 12px; margin: 12px 16px; padding: 12px 16px;
  font-family: 'Space Mono', monospace; font-size: 11.5px; color: var(--dim);
}
.fline { display: flex; justify-content: space-between; }
.fline.total { color: var(--blue); font-weight: 800; border-top: 1px solid rgba(79,110,247,.3); padding-top: 6px; margin-top:4px; }

.ts-bar { text-align: center; font-size: 11px; color: var(--dim); font-family: 'Space Mono', monospace; margin-top: 18px; }
</style>
