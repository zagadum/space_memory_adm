<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTeacherSalaryStore } from '../../stores/teacherSalary.store';
import SalarySummaryGrid from './components/SalarySummaryGrid.vue';
import SalarySection from './components/SalarySection.vue';
import SubscriptionsSection from './components/sections/SubscriptionsSection.vue';
import AdminDutySection from './components/sections/AdminDutySection.vue';
import TrialLessonSection from './components/sections/TrialLessonSection.vue';
import SalaryConfirmBlock from './components/SalaryConfirmBlock.vue';

const { t } = useI18n();
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
  'trialLessons': true,
  'rezygnacje': true
});

const openTrials = ref<Record<string, boolean>>({});

const toggleSection = (id: string) => {
  openSections.value[id] = !openSections.value[id];
};

const toggleTrial = (id: string) => {
  openTrials.value[id] = !openTrials.value[id];
};

const handleConfirm = async () => {
  if (salaryStore.salaryData?.status === 'draft') {
    await salaryStore.confirmSalary();
  }
};

const handleSendDispute = async (text: string) => {
  await salaryStore.disputeSalary(text);
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
      <SalarySummaryGrid :sections="activeSections" :total="salaryStore.totalPayout" />

      <!-- SECTIONS -->
      <div class="sections-container">
        <!-- 1. Subscriptions -->
        <SalarySection
          v-if="salaryData.subscriptions.amount > 0"
          :title="t('teacherSalary.sections.subscriptions')"
          :amount="salaryData.subscriptions.amount"
          :is-open="openSections.subscriptions"
          icon="📊"
          type="subscription"
          @toggle="toggleSection('subscriptions')"
        >
          <SubscriptionsSection
            :groups="salaryData.subscriptions.groups"
            :base="salaryData.subscriptions.base"
            :rate="salaryData.subscriptions.rate"
            :amount="salaryData.subscriptions.amount"
          />
        </SalarySection>

        <!-- 2. Substitutions -->
        <SalarySection
          v-if="salaryData.substitutions.amount > 0"
          :title="t('teacherSalary.sections.substitutions')"
          :amount="salaryData.substitutions.amount"
          :is-open="openSections.substitutions"
          icon="🔄"
          type="replacement"
          @toggle="toggleSection('substitutions')"
        >
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
        </SalarySection>

        <!-- 3. Methodical -->
        <SalarySection
          v-if="salaryData.methodical.amount > 0"
          :title="t('teacherSalary.sections.methodical')"
          :amount="salaryData.methodical.amount"
          :is-open="openSections.methodical"
          icon="🎓"
          type="meetings"
          @toggle="toggleSection('methodical')"
        >
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
        </SalarySection>

        <!-- 4. Individual -->
        <SalarySection
          v-if="salaryData.individual.amount > 0"
          :title="t('teacherSalary.sections.individual')"
          :amount="salaryData.individual.amount"
          :is-open="openSections.individual"
          icon="👤"
          type="individual"
          @toggle="toggleSection('individual')"
        >
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
        </SalarySection>

        <!-- 5. Olympiad -->
        <SalarySection
          v-if="salaryData.olympiad.amount > 0"
          :title="t('teacherSalary.sections.olympiad')"
          :amount="salaryData.olympiad.amount"
          :is-open="openSections.olympiad"
          icon="🏆"
          type="olympiad"
          @toggle="toggleSection('olympiad')"
        >
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
        </SalarySection>

        <!-- 7. Bonuses -->
        <SalarySection
          v-if="salaryData.bonuses.amount > 0"
          :title="t('teacherSalary.sections.bonuses')"
          :amount="salaryData.bonuses.amount"
          :is-open="openSections.bonuses"
          icon="🎁"
          type="bonus"
          @toggle="toggleSection('bonuses')"
        >
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
        </SalarySection>

        <!-- 6. Admin Duties -->
        <SalarySection
          v-if="salaryData.admin3pct.amount > 0"
          :title="t('teacherSalary.sections.admin3pct')"
          :amount="salaryData.admin3pct.amount"
          :is-open="openSections.admin3pct"
          icon="📋"
          type="admin"
          @toggle="toggleSection('admin3pct')"
        >
          <AdminDutySection
            :pct="salaryData.admin3pct.pct"
            :base="salaryData.admin3pct.base"
            :evaluated-by="salaryData.admin3pct.evaluatedBy"
            :evaluated-at="salaryData.admin3pct.evaluatedAt"
            :amount="salaryData.admin3pct.amount"
            :checklist="salaryData.admin3pct.checklist"
          />
        </SalarySection>

        <!-- 8. Trial Lessons -->
        <SalarySection
          v-if="salaryData.trialLessons.rows.length > 0"
          :title="t('teacherSalary.sections.trialLessons')"
          :amount="salaryStore.activeSections.find(s => s.type === 'trial')?.amount || 0"
          :is-open="openSections.trialLessons"
          icon="🧪"
          type="trial"
          @toggle="toggleSection('trialLessons')"
        >
          <TrialLessonSection
            :rows="salaryData.trialLessons.rows"
            :threshold="salaryData.trialLessons.threshold"
            :confirmed-by-qa="salaryData.trialLessons.confirmedByQA"
            :confirmed-by="salaryData.trialLessons.confirmedBy"
            :confirmed-at="salaryData.trialLessons.confirmedAt"
          />
        </SalarySection>

        <!-- 9. Rezygnacje -->
        <SalarySection
          v-if="salaryData.rezygnacje.length > 0"
          :title="t('teacherSalary.sections.rezygnacje')"
          :amount="0"
          :is-open="openSections.rezygnacje"
          icon="📉"
          type="rezygnacje"
          @toggle="toggleSection('rezygnacje')"
        >
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ t('teacherSalary.table.student') }}</th>
                <th>{{ t('teacherSalary.table.date') }}</th>
                <th>{{ t('teacherSalary.table.reason') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in salaryData.rezygnacje" :key="idx">
                <td class="fw-700">{{ row.name }}</td>
                <td class="mono fs-12">{{ row.date }}</td>
                <td class="dim fs-12">{{ row.reason }}</td>
              </tr>
            </tbody>
          </table>
        </SalarySection>
      </div>

      <!-- FINAL BREAKDOWN -->
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
          <div class="final-amount mono">{{ formatCurrency(salaryStore.totalPayout) }}</div>
          <div class="final-sublabel">{{ t('teacherSalary.totalPayout') }}</div>
        </div>
      </div>

      <!-- CONFIRM / DISPUTE -->
      <SalaryConfirmBlock 
        :status="salaryData.status"
        :confirmed-at="salaryData.confirmedAt"
        :is-loading="salaryStore.isLoading"
        @confirm="handleConfirm"
        @dispute="handleSendDispute"
      />

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

.wrap { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; padding: 0 20px; }
.mono { font-family: 'Space Mono', monospace; }
.dim { color: var(--dim); }
.val-blue { color: var(--blue); }
.val-green { color: var(--green); }
.val-amber { color: var(--amber); }
.val-red { color: var(--red); }
.val-purple { color: var(--purple); }
.val-pink { color: var(--pink); }
.fs-11 { font-size: 11px; }

/* Header */
.page-header { padding: 28px 0 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.page-title { display: flex; align-items: center; gap: 12px; }
.page-icon { width: 44px; height: 44px; background: linear-gradient(135deg, var(--blue), var(--purple)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: var(--glow-blue); }
.page-title h1 { font-size: 21px; font-weight: 800; margin: 0; }
.page-title p { font-size: 11px; color: var(--dim); font-family: 'Space Mono', monospace; margin-top: 2px; }

.role-badge { display: flex; align-items: center; gap: 8px; background: rgba(79,110,247,.12); border: 1px solid var(--border); padding: 7px 16px; border-radius: 20px; font-size: 12.5px; font-weight: 700; color: var(--blue); }
.role-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--blue); box-shadow: 0 0 8px var(--blue); animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

/* Month Bar */
.month-bar { display: flex; align-items: center; gap: 12px; margin: 22px 0 18px; }
.month-label { font-size: 11px; font-weight: 700; color: var(--dim); text-transform: uppercase; letter-spacing: .1em; }
.month-select { background: var(--bg3); border: 1px solid var(--border); border-radius: 10px; color: var(--white); padding: 10px 18px; font-size: 14px; cursor: pointer; transition: all .2s; }
.month-select:hover { border-color: rgba(79, 110, 247, .4); }

.st-pill { padding: 7px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.st-draft { background: rgba(245,158,11,.1); color: #f59e0b; border: 1px solid rgba(245,158,11,.25); }
.st-confirmed { background: rgba(34,197,94,.1); color: #22c55e; border: 1px solid rgba(34,197,94,.25); }
.st-paid { background: rgba(79,110,247,.1); color: #4f6ef7; border: 1px solid rgba(79,110,247,.25); }

/* Teacher Card */
.teacher-card { display: flex; align-items: center; gap: 18px; background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 22px 26px; margin-bottom: 24px; }
.teacher-av { width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg, var(--blue), var(--purple)); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; border: 2px solid rgba(255,255,255,.12); box-shadow: var(--glow-blue); }
.teacher-name { font-size: 18px; font-weight: 800; }
.teacher-meta { font-size: 12.5px; color: var(--dim); margin-top: 3px; }
.teacher-groups { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }

.chip { padding: 3px 8px; border-radius: 20px; font-size: 10.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; border: 1px solid transparent; }
.chip-blue { background: rgba(79,110,247,.12); color: #4f6ef7; border-color: rgba(79,110,247,.25); }
.chip-purple { background: rgba(139,92,246,.12); color: #c4b5fd; border-color: rgba(139,92,246,.25); }
.chip-green { background: rgba(34,197,94,.1); color: #22c55e; border-color: rgba(34,197,94,.25); }
.chip-amber { background: rgba(245,158,11,.1); color: #f59e0b; border-color: rgba(245,158,11,.25); }

/* Basic Tables */
.data-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
.data-table th { text-align: left; padding: 12px 14px; font-size: 10px; color: #4b5563; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,.05); }
.data-table td { padding: 14px; border-bottom: 1px solid rgba(255,255,255,.03); font-size: 13px; }

/* Trial Lessons */
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

/* Final Block */
.final-block { margin-top: 40px; background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 32px 36px; display: flex; justify-content: space-between; align-items: flex-end; }
.final-label { font-size: 11px; font-weight: 800; color: var(--dim); text-transform: uppercase; letter-spacing: .2em; }
.final-trainer { font-size: 24px; font-weight: 800; margin: 4px 0; }
.final-month { font-size: 13px; color: var(--blue); margin-bottom: 20px; }
.final-breakdown { display: flex; flex-direction: column; gap: 8px; border-top: 1px solid rgba(255,255,255,.05); padding-top: 16px; width: 260px; }
.final-bd-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--dim); }
.final-amount { font-size: 36px; font-weight: 900; color: #f0f0ff; text-shadow: 0 0 20px rgba(79,110,247,.4); line-height: 1; }
.final-sublabel { font-size: 12px; font-weight: 700; color: var(--dim); margin-top: 8px; text-transform: uppercase; }

.ts-bar { margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,.03); text-align: center; font-size: 10.5px; color: var(--dim2); font-family: 'Space Mono', monospace; }
.hint { font-size: 11.5px; color: #4b5563; margin-top: 12px; font-style: italic; }
</style>
