<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSalaryCalculatorStore } from '../../stores/salaryCalculator.store'
import UiButton from '../../components/ui/UiButton.vue'

const { t } = useI18n()
const store = useSalaryCalculatorStore()

// Local UI state
const activeTab = ref('salary')
const openSections = ref<Record<string, boolean>>({
  s1: true,
  s2: true,
  s3: false,
  s4: false,
  s5: false,
  s6: true,
  s7: true,
})

const openGroups = ref<Record<string, boolean>>({})
const disputeVisible = ref(false)
const disputeReason = ref('')

const canSendDispute = computed(() => {
  return disputeReason.value.trim().length > 0 && !store.isLoading
})

function toggleSection(id: string) {
  openSections.value[id] = !openSections.value[id]
}

function toggleGroup(id: string) {
  openGroups.value[id] = !openGroups.value[id]
}

function collapseAllGroups() {
  openGroups.value = {}
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(val)
}

onMounted(async () => {
  await store.loadTeachers()
  // No auto-load: teacher must be chosen explicitly
})

const onTeacherChange = (e: Event) => {
  const id = Number((e.target as HTMLSelectElement).value)
  if (id) store.fetchTrainerData(id, store.selectedMonth)
}

const onMonthChange = (e: Event) => {
  const month = (e.target as HTMLInputElement).value
  store.fetchTrainerData(store.selectedTeacherId, month)
}

function openDisputeModal() {
  disputeVisible.value = true
}

function closeDisputeModal() {
  disputeVisible.value = false
  disputeReason.value = ''
}

async function submitDispute() {
  const ok = await store.disputeSalary(disputeReason.value)
  if (ok) {
    closeDisputeModal()
  }
}
</script>

<template>
  <div class="salary-calculator-view">
    <div class="wrap">
      <!-- ═══ HEADER ═══ -->
      <header class="page-header">
        <div class="page-title">
          <div class="page-icon">📊</div>
          <div>
            <h1>{{ t('salaryCalc.title') }}</h1>
            <p>{{ t('salaryCalc.subtitle') }}</p>
          </div>
        </div>
        <div class="header-right">
          <div class="role-badge">
            <div class="role-dot"></div>
            <span>👤 {{ t('salaryCalc.role') }}</span>
          </div>
        </div>
      </header>

      <!-- ═══ TABS ═══ -->
      <ul class="tabs">
        <li class="tab" :class="{ active: activeTab === 'salary' }" @click="activeTab = 'salary'">💰 {{ t('salaryCalc.labels.summary') }}</li>
        <li class="tab" :class="{ active: activeTab === 'dossier' }" @click="activeTab = 'dossier'">📁 {{ t('salaryCalc.labels.dossier') }}</li>
        <li class="tab" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">🕐 {{ t('salaryCalc.labels.history') }}</li>
        <li class="tab" :class="{ active: activeTab === 'new' }" @click="activeTab = 'new'">➕ {{ t('salaryCalc.labels.newTrainer') }}</li>
      </ul>

      <!-- ═══════════════ TAB 1: SALARY ═══════════════ -->
      <div class="tab-content" :class="{ active: activeTab === 'salary' }">
        <!-- Filter bar -->
        <div class="filter-bar">
          <div class="filter-group">
            <label class="filter-label">{{ t('salaryCalc.labels.month') }}</label>
            <input 
              type="month" 
              class="filter-input" 
              :value="store.selectedMonth"
              @change="onMonthChange"
            >
          </div>
          <div class="filter-group">
            <label class="filter-label">{{ t('salaryCalc.labels.trainer') }}</label>
            <select 
              class="filter-select" 
              :value="store.selectedTeacherId ?? ''"
              @change="onTeacherChange"
            >
              <option value="" disabled>{{ t('salaryCalc.labels.selectTrainer') }}</option>
              <option v-for="tr in store.teachers" :key="tr.id" :value="tr.id">
                {{ tr.name }}
              </option>
            </select>
          </div>
          <template v-if="store.hasCalculation">
            <div class="filter-group">
              <label class="filter-label">{{ t('salaryCalc.labels.status') }}</label>
              <div class="status-pills">
                <span
                  class="st-pill st-draft"
                  :class="{ active: store.status === 'draft' }"
                  @click="store.updateStatus('draft')"
                >
                  ⬜ {{ t('teacherSalary.status.draft') }}
                </span>
                <span
                  class="st-pill st-confirmed"
                  :class="{ active: store.status === 'confirmed' }"
                  @click="store.updateStatus('confirmed')"
                >
                  ✓ {{ t('teacherSalary.status.confirmed') }}
                </span>
                <span
                  class="st-pill st-paid"
                  :class="{ active: store.status === 'paid' }"
                  @click="store.updateStatus('paid')"
                >
                  💳 {{ t('teacherSalary.status.paid') }}
                </span>
              </div>
            </div>
          </template>
          <button
            v-if="store.selectedTeacherId"
            class="btn btn-primary"
            style="margin-top: auto;"
            :disabled="store.isLoading"
            @click="store.fetchTrainerData(store.selectedTeacherId, store.selectedMonth)"
          >
            🔄 {{ t('common.retry') }}
          </button>
        </div>

        <!-- ── STATE 1: No teacher selected ── -->
        <div v-if="!store.selectedTeacherId && !store.isLoading" class="empty-state">
          <div class="empty-icon">👨‍🏫</div>
          <div class="empty-title">{{ t('salaryCalc.labels.selectTrainer') }}</div>
          <div class="empty-sub">{{ t('salaryCalc.labels.selectTrainerHint') }}</div>
        </div>

        <!-- ── STATE 2: Teacher selected, no calculation found ── -->
        <div
          v-else-if="store.selectedTeacherId && !store.isLoading && !store.hasCalculation && !store.error"
          class="empty-state"
        >
          <div class="empty-icon">📋</div>
          <div class="empty-title">{{ t('salaryCalc.labels.noCalculation') }}</div>
          <div class="empty-sub">{{ t('salaryCalc.labels.noCalculationHint') }}</div>
          <UiButton variant="primary" style="margin-top: 20px;" @click="store.createCalculation()">
            ⚡ {{ t('salaryCalc.labels.createCalculation') }}
          </UiButton>
        </div>

        <!-- ── STATE 3: Error ── -->
        <div v-else-if="store.error && !store.isLoading" class="empty-state">
          <div class="empty-icon">⚠️</div>
          <div class="empty-title">{{ store.error }}</div>
          <UiButton variant="ghost" style="margin-top: 16px;" @click="store.fetchTrainerData(store.selectedTeacherId, store.selectedMonth)">
            🔄 {{ t('common.retry') }}
          </UiButton>
        </div>

        <!-- ── STATE 4: Has calculation ── -->
        <!-- Summary grid -->
        <div class="summary-grid" v-else-if="store.hasCalculation && !store.isLoading">
          <!-- 1. Subscriptions -->
          <div class="sum-card c-blue">
            <div class="sum-label">{{ t('salaryCalc.components.subscriptions') }}</div>
            <div class="sum-val">{{ formatCurrency(store.salaryData.subscriptions) }}</div>
            <div class="sum-sub">{{ store.salaryData.activeKids }} {{ t('salaryCalc.labels.activeKids') }} · {{ store.salaryData.graduationPct }}%</div>
          </div>
          <!-- 2. Substitutions -->
          <div class="sum-card c-purple">
            <div class="sum-label">{{ t('salaryCalc.components.substitutions') }}</div>
            <div class="sum-val">{{ formatCurrency(store.salaryData.substitutions) }}</div>
          </div>
          <!-- 3. Methodical -->
          <div class="sum-card c-cyan">
            <div class="sum-label">{{ t('salaryCalc.components.methodical') }}</div>
            <div class="sum-val">{{ formatCurrency(store.salaryData.methodical) }}</div>
          </div>
          <!-- 4. Individual -->
          <div class="sum-card c-green">
            <div class="sum-label">{{ t('salaryCalc.components.individual') }}</div>
            <div class="sum-val">{{ formatCurrency(store.salaryData.individual) }}</div>
          </div>
          <!-- 5. Olympiad -->
          <div class="sum-card c-amber">
            <div class="sum-label">{{ t('salaryCalc.components.olympiad') }}</div>
            <div class="sum-val">{{ formatCurrency(store.salaryData.olympiad) }}</div>
          </div>
          <!-- 6. Travel -->
          <div class="sum-card c-blue">
            <div class="sum-label">{{ t('salaryCalc.components.travel') }}</div>
            <div class="sum-val">{{ formatCurrency(store.salaryData.travel) }}</div>
          </div>
          <!-- 7. Admin Duty -->
          <div class="sum-card c-blue">
            <div class="sum-label">{{ t('salaryCalc.components.adminDuty') }}</div>
            <div class="sum-val">{{ formatCurrency(store.salaryData.adminDuty) }}</div>
          </div>
          <!-- 8. Trial Lessons -->
          <div class="sum-card c-green">
            <div class="sum-label">{{ t('salaryCalc.components.trial') }}</div>
            <div class="sum-val">{{ formatCurrency(store.salaryData.trialLessons) }}</div>
          </div>
          <!-- 9. Bonus / Retention -->
          <div class="sum-card c-green">
            <div class="sum-label">{{ t('salaryCalc.components.retention') }}</div>
            <div class="sum-val">{{ store.salaryData.rezygnacje === 0 ? '+' : '' }}{{ formatCurrency(store.rezygnacjeBonusAmount) }}</div>
          </div>
          <!-- 10. Extra / Exceptions -->
          <div class="sum-card c-pink">
            <div class="sum-label">{{ t('salaryCalc.components.extra') }}</div>
            <div class="sum-val">{{ formatCurrency(store.salaryData.extraBonus) }}</div>
          </div>
          <!-- 11. Total -->
          <div class="sum-card c-blue sum-card-total">
            <div class="sum-label">{{ t('salaryCalc.components.total') }}</div>
            <div class="sum-val">{{ formatCurrency(store.totalPayout) }}</div>
          </div>
        </div>


        <!-- Detailed Sections -->
        <div class="calc-details" v-if="!store.isLoading">
          <!-- Section 1: Subscriptions -->
          <div class="section">
            <div class="section-header" @click="toggleSection('s1')">
              <div class="section-title">
                <div class="section-icon si-sub">📚</div>
                <span>{{ t('salaryCalc.components.subscriptions') }}</span>
              </div>
              <div class="section-amount">
                <span class="c-blue">{{ formatCurrency(store.salaryData.subscriptions) }}</span>
                <span class="section-chevron" :class="{ open: openSections.s1 }">▼</span>
              </div>
            </div>
            <div class="section-body" v-if="openSections.s1">
              <div class="grad-indicator">
                <span class="fs-11 dim">{{ t('salaryCalc.labels.graduation') }}:</span>
                <div class="grad-pills">
                  <span class="grad-pill inactive">0–50 → 10%</span>
                  <span class="grad-pill" :class="store.salaryData.graduationPct === 11 ? 'active' : 'inactive'">51–69 → 11%</span>
                  <span class="grad-pill inactive">70–99 → 12%</span>
                </div>
                <div class="ml-auto mono fs-11 blue">
                  {{ store.salaryData.activeKids }} {{ t('salaryCalc.labels.activeKids') }} → {{ store.salaryData.graduationPct }}%
                </div>
              </div>

              <!-- Group List -->
              <div class="group-list">
                <!-- Example Group 1 -->
                <div class="group-row">
                  <div class="group-header" @click="toggleGroup('g1')">
                    <span class="group-toggle-icon" :class="{ open: openGroups.g1 }">▶</span>
                    <span class="group-name">G_2026_SM_01</span>
                    <span class="group-meta">PN 16:00 · Anna K.</span>
                    <span class="group-count">8 kids</span>
                    <span class="group-pct-badge">100% attendance</span>
                    <span class="ml-auto group-sum">{{ formatCurrency(490.00) }}</span>
                  </div>
                  <div class="group-students" v-if="openGroups.g1">
                    <table class="data-table">
                      <tbody>
                        <tr>
                          <td>Jan Kowalski</td>
                          <td><span class="chip chip-green">Paid</span></td>
                          <td>Active</td>
                          <td class="text-right">{{ formatCurrency(490.00) }}</td>
                        </tr>
                        <tr>
                          <td>Marek Wójcik</td>
                          <td><span class="chip chip-green">Paid</span></td>
                          <td>Active</td>
                          <td class="text-right">{{ formatCurrency(490.00) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Substitutions -->
          <div class="section">
            <div class="section-header" @click="toggleSection('s2')">
              <div class="section-title">
                <div class="section-icon si-zast">🔄</div>
                <span>{{ t('salaryCalc.components.substitutions') }}</span>
              </div>
              <div class="section-amount">
                <span class="c-purple">{{ formatCurrency(store.salaryData.substitutions) }}</span>
                <span class="section-chevron" :class="{ open: openSections.s2 }">▼</span>
              </div>
            </div>
            <div class="section-body" v-if="openSections.s2">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Grupa / Trener zastępowany</th>
                    <th>Status</th>
                    <th class="text-right">Kwota</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>12.02.2026</td>
                    <td>G_2026_SM_05 (Marek W.)</td>
                    <td><span class="chip chip-blue">Done</span></td>
                    <td class="text-right">{{ formatCurrency(75.35) }}</td>
                  </tr>
                  <tr>
                    <td>24.02.2026</td>
                    <td>G_2026_SM_09 (Jan K.)</td>
                    <td><span class="chip chip-blue">Done</span></td>
                    <td class="text-right">{{ formatCurrency(75.35) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Section 3: Methodical Meetings -->
          <div class="section">
            <div class="section-header" @click="toggleSection('s3')">
              <div class="section-title">
                <div class="section-icon si-meth">🧠</div>
                <span>{{ t('salaryCalc.components.methodical') }}</span>
              </div>
              <div class="section-amount">
                <span class="c-cyan">{{ formatCurrency(store.salaryData.methodical) }}</span>
                <span class="section-chevron" :class="{ open: openSections.s3 }">▼</span>
              </div>
            </div>
            <div class="section-body" v-if="openSections.s3">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Temat / Rodzaj</th>
                    <th>Czas</th>
                    <th class="text-right">Kwota</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>05.02.2026</td>
                    <td>Metodyka Space Memory (Luty)</td>
                    <td>60 min</td>
                    <td class="text-right">{{ formatCurrency(60.00) }}</td>
                  </tr>
                  <tr>
                    <td>19.02.2026</td>
                    <td>Workshop: AI w edukacji</td>
                    <td>60 min</td>
                    <td class="text-right">{{ formatCurrency(65.60) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Section 4 & 5: Individual & Olympiad -->
          <div class="section-row">
            <div class="section half">
              <div class="section-header" @click="toggleSection('s4')">
                <div class="section-title">
                  <div class="section-icon si-ind">👤</div>
                  <span>{{ t('salaryCalc.components.individual') }}</span>
                </div>
                <div class="section-amount">
                  <span class="c-green">{{ formatCurrency(store.salaryData.individual) }}</span>
                  <span class="section-chevron" :class="{ open: openSections.s4 }">▼</span>
                </div>
              </div>
              <div class="section-body" v-if="openSections.s4">
                <div class="p-20 dim fs-12 mono">2 x 140.00 zł = {{ formatCurrency(store.salaryData.individual) }}</div>
              </div>
            </div>
            <div class="section half">
              <div class="section-header" @click="toggleSection('s5')">
                <div class="section-title">
                  <div class="section-icon si-olimp">🏆</div>
                  <span>{{ t('salaryCalc.components.olympiad') }}</span>
                </div>
                <div class="section-amount">
                  <span class="c-amber">{{ formatCurrency(store.salaryData.olympiad) }}</span>
                  <span class="section-chevron" :class="{ open: openSections.s5 }">▼</span>
                </div>
              </div>
              <div class="section-body" v-if="openSections.s5">
                <div class="p-20 dim fs-12 mono">1 x 160.00 zł = {{ formatCurrency(store.salaryData.olympiad) }}</div>
              </div>
            </div>
          </div>

          <!-- Section 6: Admin Duties -->
          <div class="section">
            <div class="section-header" @click="toggleSection('s6')">
              <div class="section-title">
                <div class="section-icon si-admin">📋</div>
                <span>{{ t('salaryCalc.components.adminDuty') }}</span>
              </div>
              <div class="section-amount">
                <span class="c-blue">{{ formatCurrency(store.salaryData.adminDuty) }}</span>
                <span class="section-chevron" :class="{ open: openSections.s6 }">▼</span>
              </div>
            </div>
            <div class="section-body" v-if="openSections.s6">
              <div class="admin-status-banner admin-status-ok p-20">
                <div class="admin-status-icon">✅</div>
                <div class="admin-status-text">
                  <div class="fw-700 green">QA Score: 85%</div>
                  <div class="fs-11 dim">Evaluated on 01.03.2026 by QA Admin</div>
                </div>
                <div class="admin-pct-display admin-pct-ok">3%</div>
              </div>
              <div class="admin-formula-box">
                {{ formatCurrency(store.salaryData.subscriptions / 0.11) }} (Total Pool) x 3% = {{ formatCurrency(store.salaryData.adminDuty) }}
              </div>
            </div>
          </div>

          <!-- Section 7: Trial Lessons -->
          <div class="section">
            <div class="section-header" @click="toggleSection('s7')">
              <div class="section-title">
                <div class="section-icon si-trial">🎯</div>
                <span>{{ t('salaryCalc.components.trial') }}</span>
              </div>
              <div class="section-amount">
                <span class="c-green">{{ formatCurrency(store.salaryData.trialLessons) }}</span>
                <span class="section-chevron" :class="{ open: openSections.s7 }">▼</span>
              </div>
            </div>
            <div class="section-body" v-if="openSections.s7">
              <div class="trial-qa-banner trial-qa-ok p-20">
                <div class="trial-qa-text">
                  <div class="fw-700 green">Conversion Rate: 66% (2/3)</div>
                  <div class="fs-11 dim">Target: > 50% for full payout</div>
                </div>
                <div class="ml-auto">
                  <span class="ok-badge ok-done">Qualified</span>
                </div>
              </div>
              <div class="trial-formula-box">
                <div class="fline"><span>Trial Lessons (Attended)</span> <span>3</span></div>
                <div class="fline"><span>Lessons Won</span> <span>2</span></div>
                <div class="fline total"><span>Total Trial Payout</span> <span>{{ formatCurrency(store.salaryData.trialLessons) }}</span></div>
              </div>
            </div>
          </div>

          <!-- Final Block -->
          <div class="final-block">
            <div class="final-info">
              <div class="fs-14 dim fw-600">{{ t('salaryCalc.components.total') }} for {{ store.selectedTeacher.name }}</div>
              <div class="final-amount">{{ formatCurrency(store.totalPayout) }}</div>
              <div class="final-bd-row">
                <span>Base: {{ formatCurrency(store.subtotalBeforeBonus) }}</span>
                <span>Bonus: +{{ formatCurrency(store.rezygnacjeBonusAmount) }}</span>
              </div>
            </div>
            <div class="final-actions">
              <UiButton variant="amber" :disabled="store.isLoading || !store.selectedTeacherId" @click="openDisputeModal">
                ⚠️ {{ t('teacherSalary.actions.dispute') }}
              </UiButton>
              <UiButton variant="primary" @click="store.doExport(t)">
                📥 {{ t('salaryCalc.labels.exportExcel') }}
              </UiButton>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div class="loading-state" v-if="store.isLoading">
           <div class="spinner"></div>
           <p>{{ t('common.loadingData') }}</p>
        </div>
      </div>

      <!-- ═══════════════ TAB 2: DOSSIER ═══════════════ -->
      <div class="tab-content" :class="{ active: activeTab === 'dossier' }">
        <div class="calc-details">
          <div class="section">
            <div class="section-body p-20">
              <div class="page-title" style="margin-bottom: 20px;">
                <div class="page-icon">👤</div>
                <div>
                  <h2 style="font-size: 20px; font-weight: 700;">{{ store.selectedTeacher.name }}</h2>
                  <p>{{ store.selectedTeacher.role }}</p>
                </div>
              </div>
              <div class="form-row col3">
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <p class="fs-14 fw-600">anna.k@example.com</p>
                </div>
                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <p class="fs-14 fw-600">+48 123 456 789</p>
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <span class="ok-badge ok-done" style="width: fit-content;">Active</span>
                </div>
              </div>
              <div class="section-divider"></div>
              <div class="info-box info-blue">
                <div>ℹ️</div>
                <p>Detailed dossier information and documents are managed in the HR module.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════ TAB 3: HISTORY ═══════════════ -->
      <div class="tab-content" :class="{ active: activeTab === 'history' }">
        <div class="calc-details">
          <div class="section">
            <div class="section-body">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Status</th>
                    <th>Base Amount</th>
                    <th>Bonus</th>
                    <th class="text-right">Total Payout</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Styczeń 2026</td>
                    <td><span class="chip chip-green">Paid</span></td>
                    <td>{{ formatCurrency(4500.00) }}</td>
                    <td>{{ formatCurrency(450.00) }}</td>
                    <td class="text-right">{{ formatCurrency(4950.00) }}</td>
                  </tr>
                  <tr>
                    <td>Grudzień 2025</td>
                    <td><span class="chip chip-green">Paid</span></td>
                    <td>{{ formatCurrency(4200.00) }}</td>
                    <td>{{ formatCurrency(400.00) }}</td>
                    <td class="text-right">{{ formatCurrency(4600.00) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════ TAB 4: NEW TRAINER ═══════════════ -->
      <div class="tab-content" :class="{ active: activeTab === 'new' }">
        <div class="calc-details">
          <div class="section">
            <div class="section-body p-20">
              <div class="section-heading">Personal Information</div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">First Name <span class="req">*</span></label>
                  <input type="text" class="form-input" placeholder="e.g. John">
                </div>
                <div class="form-group">
                  <label class="form-label">Last Name <span class="req">*</span></label>
                  <input type="text" class="form-input" placeholder="e.g. Smith">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Role <span class="req">*</span></label>
                  <select class="form-select">
                    <option>Trener Space Memory</option>
                    <option>Trener Indigo</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Email <span class="req">*</span></label>
                  <input type="email" class="form-input" placeholder="john.smith@example.com">
                </div>
              </div>
              <div class="section-divider"></div>
              <div class="section-heading">Onboarding Checklist</div>
              <table class="checklist-table">
                <tbody>
                  <tr>
                    <td>Contract signed</td>
                    <td style="width: 120px;"><span class="ok-badge ok-wait">Pending</span></td>
                  </tr>
                  <tr>
                    <td>Training completed</td>
                    <td style="width: 120px;"><span class="ok-badge ok-wait">Pending</span></td>
                  </tr>
                </tbody>
              </table>
              <div class="section-divider"></div>
              <UiButton variant="primary">Create Trainer Profile</UiButton>
            </div>
          </div>
        </div>
      </div>

      <div v-if="disputeVisible" class="dispute-modal-overlay" @click="closeDisputeModal">
        <div class="dispute-modal" @click.stop>
          <div class="dispute-modal-title">{{ t('teacherSalary.actions.dispute') }}</div>
          <div class="dispute-modal-label">{{ t('teacherSalary.actions.disputeLabel') }}</div>
          <textarea
            v-model="disputeReason"
            class="dispute-modal-textarea"
            :placeholder="t('teacherSalary.actions.disputePlaceholder')"
          />
          <div class="dispute-modal-actions">
            <UiButton variant="ghost" :disabled="store.isLoading" @click="closeDisputeModal">
              {{ t('teacherSalary.actions.cancel') }}
            </UiButton>
            <UiButton variant="amber" :disabled="!canSendDispute" @click="submitDispute">
              {{ t('teacherSalary.actions.sendToAccounting') }}
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.salary-calculator-view {
  background: var(--app-bg);
  color: var(--app-text-main);
  font-family: 'Outfit', sans-serif;
  min-height: 100vh;
  padding: 24px 20px 60px;
  position: relative;
}

.wrap{position:relative;z-index:1;max-width:1320px;margin:0 auto;padding:0 24px 60px}

/* ── Header ── */
.page-header{padding:28px 0 20px;border-bottom:1px solid var(--app-border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
.page-icon{width:40px;height:40px;background:linear-gradient(135deg,var(--blue),var(--purple));border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:var(--app-shadow);flex-shrink:0}
.page-title{display:flex;align-items:center;gap:12px}
.page-title h1{font-size:22px;font-weight:700;margin:0;color:var(--app-text-main)}
.page-title p{font-size:11px;color:var(--app-text-dim);font-family:'Space Mono',monospace;margin-top:2px;margin-bottom:0}
.header-right{display:flex;align-items:center;gap:10px}
.role-badge{display:flex;align-items:center;gap:8px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;color:#ef4444;letter-spacing:.05em}
.role-dot{width:6px;height:6px;border-radius:50%;background:#ef4444;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

/* ── Tabs ── */
.tabs{display:flex;gap:4px;margin:24px 0;flex-wrap:wrap}
.tab{padding:9px 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid transparent;transition:all .2s;color:var(--app-text-dim)}
.tab:hover{color:var(--app-text-main);border-color:var(--app-border)}
.tab.active{background:rgba(79,110,247,.12);color:var(--blue);border-color:rgba(79,110,247,.3)}
.tab-content{display:none}.tab-content.active{display:block}

/* ── Filter bar ── */
.filter-bar{display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap;background:var(--app-card);border:1px solid var(--app-border);border-radius:16px;padding:20px 24px;margin-bottom:24px;box-shadow:var(--app-shadow)}
.filter-group{display:flex;flex-direction:column;gap:6px}
.filter-label{font-size:11px;font-weight:600;color:var(--app-text-dim);letter-spacing:.08em;text-transform:uppercase}
.filter-select,.filter-input{background:var(--app-surface);border:1px solid var(--app-border);border-radius:8px;color:var(--app-text-main);font-family:'Outfit',sans-serif;font-size:14px;padding:9px 14px;outline:none;transition:border-color .2s;min-width:160px}
.filter-select:focus,.filter-input:focus{border-color:var(--blue)}
.filter-select option{background:var(--app-surface);color:var(--app-text-main)}

/* ── Summary cards ── */
.summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:24px}
.sum-card{background:var(--app-card);border:1px solid var(--app-border);border-radius:14px;padding:16px 18px;position:relative;overflow:hidden;box-shadow:var(--app-shadow)}
.sum-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px}
.sum-card.c-blue::before{background:linear-gradient(90deg,var(--blue),transparent)}
.sum-card.c-purple::before{background:linear-gradient(90deg,var(--purple),transparent)}
.sum-card.c-green::before{background:linear-gradient(90deg,var(--green),transparent)}
.sum-card.c-amber::before{background:linear-gradient(90deg,var(--amber),transparent)}
.sum-card.c-cyan::before{background:linear-gradient(90deg,var(--cyan),transparent)}
.sum-card.c-pink::before{background:linear-gradient(90deg,var(--pink),transparent)}
.sum-card.c-red::before{background:linear-gradient(90deg,var(--red),transparent)}
.sum-label{font-size:10.5px;font-weight:600;color:var(--app-text-dim);letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px}
.sum-val{font-family:'Space Mono',monospace;font-size:18px;font-weight:700;color:var(--app-text-main)}
.sum-card.c-blue .sum-val{color:var(--blue)}.sum-card.c-green .sum-val{color:var(--green)}
.sum-card.c-red .sum-val{color:var(--red)}
.sum-sub{font-size:11px;color:var(--app-text-dim);margin-top:3px}
.sum-card-total{background:linear-gradient(135deg,rgba(79,110,247,.15),rgba(139,92,246,.15));border:1px solid rgba(79,110,247,.35);box-shadow:var(--app-shadow)}
.sum-card-total .sum-val{font-size:22px;color:var(--app-text-main)}.sum-card-total .sum-label{color:var(--blue)}

/* ── Sections ── */
.section{margin-bottom:18px}
.section-header{display:flex;align-items:center;justify-content:space-between;padding:0 0 10px;cursor:pointer;user-select:none}
.section-title{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700;color:var(--app-text-main)}
.section-icon{width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:14px}
.si-sub{background:rgba(79,110,247,.12)}.si-zast{background:rgba(139,92,246,.12)}
.si-meth{background:rgba(6,182,212,.12)}.si-ind{background:rgba(34,197,94,.12)}
.si-olimp{background:rgba(245,158,11,.12)}.si-dojazd{background:rgba(107,114,128,.12)}
.si-premia{background:rgba(236,72,153,.12)}.si-excep{background:rgba(239,68,68,.12)}
.si-admin{background:rgba(79,110,247,.12)}.si-kara{background:rgba(239,68,68,.12)}
.si-trial{background:rgba(34,197,94,.12)}
.section-amount{font-family:'Space Mono',monospace;font-size:15px;font-weight:700;display:flex;align-items:center;gap:10px;color:var(--app-text-main)}
.section-chevron{color:var(--app-text-dim);font-size:11px;transition:transform .2s}
.section-chevron.open{transform:rotate(180deg)}
.section-body{background:var(--app-card);border:1px solid var(--app-border);border-radius:14px;overflow:hidden;box-shadow:var(--app-shadow)}
.section-body.collapsed{display:none}

/* ── Tables ── */
.data-table{width:100%;border-collapse:collapse}
.data-table th{font-size:10.5px;font-weight:700;color:var(--app-text-dim);letter-spacing:.08em;text-transform:uppercase;padding:11px 16px;border-bottom:1px solid var(--app-border);text-align:left;background:var(--app-surface)}
.data-table th:last-child{text-align:right}
.data-table td{padding:11px 16px;font-size:13px;border-bottom:1px solid var(--app-border);vertical-align:middle;color:var(--app-text-main)}
.data-table tr:last-child td{border-bottom:none}
.data-table tr:hover td{background:rgba(79,110,247,.05)}
.data-table td:last-child{text-align:right;font-family:'Space Mono',monospace;font-weight:700}
.td-name{font-weight:600;color:var(--app-text-main)}.td-sub{font-size:11px;color:var(--app-text-dim);margin-top:2px}

/* ── Chips ── */
.chip{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:10.5px;font-weight:700}
.chip-blue{background:rgba(79,110,247,.12);color:var(--blue);border:1px solid rgba(79,110,247,.25)}
.chip-purple{background:rgba(139,92,246,.12);color:var(--purple);border:1px solid rgba(139,92,246,.25)}
.chip-green{background:rgba(34,197,94,.1);color:var(--green);border:1px solid rgba(34,197,94,.25)}
.chip-amber{background:rgba(245,158,11,.1);color:var(--amber);border:1px solid rgba(245,158,11,.25)}
.chip-red{background:rgba(239,68,68,.1);color:var(--red);border:1px solid rgba(239,68,68,.25)}
.chip-cyan{background:rgba(6,182,212,.1);color:var(--cyan);border:1px solid rgba(6,182,212,.25)}
.chip-pink{background:rgba(236,72,153,.1);color:var(--pink);border:1px solid rgba(236,72,153,.25)}
.chip-gray{background:rgba(107,114,128,.12);color:var(--dim);border:1px solid rgba(107,114,128,.2)}

.c-b{color:var(--blue)}.c-g{color:var(--green)}.c-a{color:var(--amber)}.c-p{color:var(--pink)}.c-d{color:var(--app-text-dim)}.c-r{color:var(--red)}

/* ── Formula box ── */
.formula-box{background:var(--app-surface);border:1px solid var(--app-border);border-radius:10px;padding:12px 16px;margin:10px 16px;font-family:'Space Mono',monospace;font-size:12px;color:var(--app-text-dim);line-height:1.9}
.fline{display:flex;justify-content:space-between}
.fline.total{color:var(--blue);font-weight:700;border-top:1px solid var(--app-border);padding-top:7px;margin-top:3px}

/* ── Grad bar ── */
.grad-indicator{display:flex;align-items:center;gap:8px;padding:10px 16px;background:var(--app-surface);border-bottom:1px solid var(--app-border);flex-wrap:wrap}
.grad-pills{display:flex;gap:6px;flex-wrap:wrap}
.grad-pill{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;font-family:'Space Mono',monospace}
.grad-pill.active{background:rgba(79,110,247,.2);color:var(--blue);border:1px solid rgba(79,110,247,.4);box-shadow:0 0 8px rgba(79,110,247,.2)}
.grad-pill.inactive{background:transparent;color:var(--app-text-dim);border:1px solid var(--app-border)}

/* ── Inline input ── */
.inline-input{background:transparent;border:none;border-bottom:1px dashed var(--app-border);color:var(--app-text-main);font-family:'Space Mono',monospace;font-size:13px;width:80px;text-align:right;outline:none;padding:2px 4px;transition:border-color .2s}
.inline-input:focus{border-color:var(--blue)}

/* ── Hidden badge ── */
.hidden-badge{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;background:var(--app-surface);border:1px dashed var(--app-border);color:var(--app-text-dim);letter-spacing:.05em}

/* ── Approval ── */
.approval-block{background:rgba(236,72,153,.06);border:1px solid rgba(236,72,153,.2);border-radius:10px;padding:12px 16px;margin:10px 16px;display:flex;align-items:center;gap:12px}
.btn-approve{margin-left:auto;background:rgba(236,72,153,.15);border:1px solid rgba(236,72,153,.35);color:var(--pink);border-radius:8px;font-family:'Outfit',sans-serif;font-size:12px;font-weight:700;padding:8px 14px;cursor:pointer;white-space:nowrap;transition:background .2s}
.btn-approve:hover{background:rgba(236,72,153,.25)}
.btn-approve.approved{background:rgba(34,197,94,.12);border-color:rgba(34,197,94,.3);color:var(--green);cursor:default}

/* ── Buttons ── */
.btn{border:none;border-radius:9px;font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;padding:9px 18px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.btn-primary{background:linear-gradient(135deg,var(--blue),var(--purple));color:#fff;box-shadow:var(--glow-blue)}
.btn-primary:hover{opacity:.9;transform:translateY(-1px)}
.btn-success{background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.3);color:var(--green)}
.btn-success:hover{background:rgba(34,197,94,.25)}
.btn-info{background:rgba(79,110,247,.15);border:1px solid rgba(79,110,247,.3);color:var(--blue)}
.btn-info:hover{background:rgba(79,110,247,.25)}
.btn-ghost{background:transparent;border:1px solid var(--app-border);color:var(--app-text-dim)}
.btn-ghost:hover{border-color:var(--app-text-dim);color:var(--app-text-main)}
.btn-excel{background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.25);color:var(--green)}
.btn-excel:hover{background:rgba(34,197,94,.22)}
.btn-danger{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.25);color:var(--red)}
.btn-danger:hover{background:rgba(239,68,68,.22)}
.btn-add-row{background:transparent;border:1px dashed var(--app-border);color:var(--app-text-dim);border-radius:8px;font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;padding:8px 14px;cursor:pointer;width:calc(100% - 32px);margin:8px 16px;transition:all .2s;display:block;text-align: center;}
.btn-add-row:hover{border-color:var(--blue);color:var(--blue)}

/* ── Final block ── */
.final-block{background:linear-gradient(135deg,rgba(79,110,247,.1),rgba(139,92,246,.1));border:1px solid rgba(79,110,247,.3);border-radius:16px;padding:24px 28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;box-shadow:var(--app-shadow);margin-top:24px}
.final-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.final-amount{font-family:'Space Mono',monospace;font-size:38px;font-weight:700;text-shadow:0 0 30px rgba(79,110,247,.3);color:var(--app-text-main)}
.final-bd-row{display:flex;justify-content:space-between;gap:40px;font-size:12px;color:var(--app-text-dim)}
.final-bd-row.deduction{color:var(--red)}

.dispute-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px}
.dispute-modal{width:min(560px,100%);background:var(--app-card);border:1px solid var(--app-border);border-radius:14px;padding:18px;box-shadow:var(--app-shadow)}
.dispute-modal-title{font-size:18px;font-weight:700;margin-bottom:10px}
.dispute-modal-label{font-size:12px;color:var(--app-text-dim);margin-bottom:8px}
.dispute-modal-textarea{width:100%;min-height:120px;border:1px solid var(--app-border);border-radius:10px;padding:10px 12px;background:var(--app-surface);color:var(--app-text-main);font-family:inherit;resize:vertical}
.dispute-modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:12px}

/* ── Empty / placeholder states ── */
.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:280px;gap:8px;text-align:center;padding:40px 20px}
.empty-icon{font-size:48px;line-height:1}
.empty-title{font-size:18px;font-weight:700;color:var(--app-text-main);margin-top:8px}
.empty-sub{font-size:13px;color:var(--app-text-dim);max-width:420px;line-height:1.5}

/* ── Status pills ── */
.st-pill{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid rgba(107,114,128,.25);font-family:'Outfit',sans-serif;transition:all .2s;background:rgba(107,114,128,.12);color:var(--dim)}
.st-draft.active{background:rgba(107,114,128,.12);color:var(--white);border:1px solid rgba(107,114,128,.4)}
.st-confirmed.active{background:rgba(34,197,94,.1);color:var(--green);border:1px solid rgba(34,197,94,.25)}
.st-paid.active{background:rgba(79,110,247,.1);color:var(--blue);border:1px solid rgba(79,110,247,.25)}

/* ── Exceptions / Rekompensata ── */
.excep-alert{background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2);border-radius:12px;padding:14px 18px;margin:16px 16px 0;display:flex;gap:12px;align-items:flex-start}
.excep-alert-text{font-size:12.5px;line-height:1.6}
.excep-child-card{background:var(--bg3);border:1px solid rgba(239,68,68,.2);border-radius:12px;padding:16px 18px;margin:12px 16px;position:relative;transition:border-color .3s}
.excep-child-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,var(--red),var(--amber));border-radius:12px 0 0 12px;transition:background .3s}
.excep-child-card.has-comp{border-color:rgba(34,197,94,.3)}
.excep-child-card.has-comp::before{background:linear-gradient(180deg,var(--green),var(--cyan))}
.excep-child-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.excep-child-name{font-size:14px;font-weight:700}
.excep-child-meta{font-size:11px;color:var(--dim)}
.excep-reason-box{background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.15);border-radius:8px;padding:10px 13px;margin-bottom:12px;font-size:12px;line-height:1.6}
.reason-label{font-size:9.5px;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px}

/* Lesson counter */
.lessons-block{background:rgba(79,110,247,.06);border:1px solid rgba(79,110,247,.2);border-radius:10px;padding:12px 16px;margin-bottom:12px}
.lessons-label{font-size:11.5px;font-weight:700;color:var(--dim);margin-bottom:10px}
.lessons-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.lesson-stepper{display:flex;align-items:center;gap:6px}
.lesson-btn{width:30px;height:30px;border-radius:50%;background:rgba(79,110,247,.15);border:1px solid rgba(79,110,247,.3);color:var(--blue);font-size:16px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}
.lesson-btn:hover{background:rgba(79,110,247,.3)}
.lesson-num-display{font-family:'Space Mono',monospace;font-size:18px;font-weight:700;color:var(--blue);min-width:30px;text-align:center}
.lesson-total{font-size:12px;color:var(--dim)}
.lesson-quick{display:flex;gap:5px;flex-wrap:wrap}
.lq-btn{padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--dim);font-family:'Outfit',sans-serif;transition:all .2s}
.lq-btn.active{background:rgba(79,110,247,.2);border-color:rgba(79,110,247,.4);color:var(--blue)}
.lq-btn:hover{border-color:var(--blue);color:var(--blue)}
.lesson-hint{font-size:12px;color:var(--dim);background:var(--bg);border-radius:8px;padding:8px 12px;font-family:'Space Mono',monospace;margin-top:8px;line-height:1.8}
.lesson-hint strong{color:var(--green)}

/* Comp row */
.excep-comp-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px}
.excep-comp-input{background:var(--bg);border:1px solid rgba(79,110,247,.3);border-radius:8px;color:var(--white);font-family:'Space Mono',monospace;font-size:14px;font-weight:700;padding:9px 12px;outline:none;width:120px;text-align:right;transition:border-color .2s}
.excep-comp-input:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(79,110,247,.1)}
.excep-comment-input{background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--white);font-family:'Outfit',sans-serif;font-size:12px;padding:9px 12px;outline:none;flex:1;min-width:180px;transition:border-color .2s}
.excep-comment-input:focus{border-color:var(--blue)}
.excep-comp-save{background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.3);color:var(--green);border-radius:8px;font-family:'Outfit',sans-serif;font-size:12px;font-weight:700;padding:9px 14px;cursor:pointer;white-space:nowrap;transition:all .2s}
.excep-comp-save:hover{background:rgba(34,197,94,.25)}
.excep-autofill{background:rgba(79,110,247,.12);border:1px solid rgba(79,110,247,.25);color:var(--blue);border-radius:8px;font-family:'Outfit',sans-serif;font-size:11px;font-weight:700;padding:9px 12px;cursor:pointer;white-space:nowrap;transition:all .2s}
.excep-autofill:hover{background:rgba(79,110,247,.22)}
.excep-comp-saved-row{display:flex;align-items:center;justify-content:space-between;background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.2);border-radius:8px;padding:10px 14px;margin-top:10px}
.excep-total-bar{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:rgba(239,68,68,.04);border-top:1px solid rgba(239,68,68,.15)}

/* ── 3% Admin block ── */
.admin-status-banner{display:flex;align-items:center;gap:14px;padding:14px 20px;border-radius:12px;margin:12px 16px}
.admin-status-ok{background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.2)}
.admin-status-wait{background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.2)}
.admin-status-late{background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2)}
.admin-status-icon{font-size:26px;flex-shrink:0}
.admin-status-text{font-size:13px;line-height:1.6}
.admin-pct-display{font-family:'Space Mono',monospace;font-size:32px;font-weight:700;margin-left:auto;flex-shrink:0}
.admin-pct-ok{color:var(--green)}.admin-pct-wait{color:var(--amber)}.admin-pct-late{color:var(--red)}

.checklist-table{width:100%;border-collapse:collapse}
.checklist-table th{font-size:10.5px;font-weight:700;color:var(--dim);letter-spacing:.08em;text-transform:uppercase;padding:10px 16px;border-bottom:1px solid var(--border);background:rgba(255,255,255,.02)}
.checklist-table td{padding:10px 16px;font-size:13px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle}
.checklist-table tr:last-child td{border-bottom:none}
.checklist-table tr:hover td{background:rgba(255,255,255,.02)}

.ok-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700}
.ok-done{background:rgba(34,197,94,.12);color:var(--green);border:1px solid rgba(34,197,94,.25)}
.ok-partial{background:rgba(245,158,11,.1);color:var(--amber);border:1px solid rgba(245,158,11,.25)}
.ok-fail{background:rgba(239,68,68,.1);color:var(--red);border:1px solid rgba(239,68,68,.25)}
.ok-wait{background:rgba(107,114,128,.12);color:var(--dim);border:1px solid rgba(107,114,128,.2)}

.admin-formula-box{background:rgba(79,110,247,.06);border:1px solid rgba(79,110,247,.2);border-radius:10px;padding:12px 16px;margin:10px 16px;font-family:'Space Mono',monospace;font-size:12px;color:var(--dim);line-height:1.9}

/* ── Kara umowna ── */
.kara-card{background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.2);border-radius:12px;padding:16px 18px;margin:10px 16px;position:relative}
.kara-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--red);border-radius:12px 0 0 12px}
.kara-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px}
.kara-title{font-size:13px;font-weight:700;color:var(--red)}
.kara-notatka{background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);border-radius:8px;padding:10px 13px;font-size:12px;line-height:1.6;margin-bottom:12px}
.kara-notatka-label{font-size:9.5px;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}
.kara-confirm-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;background:var(--bg);border-radius:8px;padding:10px 14px}
.kara-amount{font-family:'Space Mono',monospace;font-size:18px;font-weight:700;color:var(--red)}
.kara-total-bar{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:rgba(239,68,68,.04);border-top:1px solid rgba(239,68,68,.15)}

/* ── Trial lessons ── */
.trial-qa-banner{display:flex;align-items:center;gap:14px;padding:14px 20px;border-radius:12px;margin:12px 16px}
.trial-qa-ok{background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.2)}
.trial-qa-wait{background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.2)}
.trial-qa-text{font-size:13px;line-height:1.6}
.trial-formula-box{background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.2);border-radius:10px;padding:12px 16px;margin:10px 16px;font-family:'Space Mono',monospace;font-size:12px;color:var(--dim);line-height:1.9}
.trial-total-bar{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:rgba(34,197,94,.04);border-top:1px solid var(--border)}

/* ── Group accordions ── */
.group-row{border-bottom:1px solid var(--border)}
.group-row:last-of-type{border-bottom:none}
.group-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;cursor:pointer;transition:background .15s;user-select:none;flex-wrap:wrap;gap:10px}
.group-header:hover{background:rgba(79,110,247,.05)}
.group-name{font-size:14px;font-weight:700;color:var(--app-text-main);font-family:'Space Mono',monospace}
.group-meta{font-size:12px;color:var(--app-text-dim);font-family:'Space Mono',monospace}
.group-count{font-size:11.5px;color:var(--blue);background:rgba(79,110,247,.1);border:1px solid rgba(79,110,247,.2);border-radius:20px;padding:2px 9px;font-weight:700}
.group-pct-badge{font-size:11px;color:var(--app-text-dim);font-family:'Space Mono',monospace}
.group-sum{font-family:'Space Mono',monospace;font-size:15px;font-weight:700;color:var(--app-text-main)}
.group-toggle-icon{font-size:10px;color:var(--app-text-dim);transition:transform .2s;min-width:12px}
.group-toggle-icon.open{transform:rotate(90deg);color:var(--blue)}
.group-students{overflow:hidden}
.group-students.collapsed{display:none}

/* ── Forms (New Trainer) ── */
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.form-row.col3{grid-template-columns:1fr 1fr 1fr}.form-row.col1{grid-template-columns:1fr}
.form-group{display:flex;flex-direction:column;gap:5px}
.form-label{font-size:11px;font-weight:600;color:var(--app-text-dim);letter-spacing:.07em;text-transform:uppercase}
.form-input,.form-select,.form-textarea{background:var(--app-surface);border:1px solid var(--app-border);border-radius:8px;color:var(--app-text-main);font-family:'Outfit',sans-serif;font-size:13px;padding:9px 13px;outline:none;transition:border-color .2s;width:100%}
.form-input:focus,.form-select:focus,.form-textarea:focus{border-color:var(--blue)}
.form-textarea{resize:vertical;min-height:72px}
.req{color:var(--red)}
.section-divider{height:1px;background:var(--app-border);margin:18px 0}
.section-heading{font-size:13px;font-weight:700;color:var(--app-text-dim);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.upload-zone{border:2px dashed var(--app-border);border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:all .2s;background:rgba(79,110,247,.03)}
.upload-zone:hover{border-color:var(--blue);background:rgba(79,110,247,.06)}
.info-box{display:flex;gap:10px;padding:10px 14px;border-radius:10px;font-size:12.5px;line-height:1.5}
.info-blue{background:var(--app-surface);border:1px solid rgba(79,110,247,.2);color:var(--app-text-dim)}
.sign-block{background:var(--app-surface);border:1px solid var(--app-border);border-radius:12px;padding:18px;margin-top:14px}

/* Rezygnacje stat bar */
.rezygn-stat-bar{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:0;border:1px solid var(--border);border-radius:12px;overflow:hidden;margin:12px 16px}
.rezygn-stat-cell{padding:14px 18px;background:var(--bg2);border-right:1px solid var(--border)}
.rezygn-stat-cell:last-child{border-right:none}
.rezygn-stat-label{font-size:10px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
.rezygn-stat-val{font-family:'Space Mono',monospace;font-size:20px;font-weight:700}
.rezygn-stat-sub{font-size:10.5px;color:var(--dim);margin-top:3px}

::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--app-bg)}::-webkit-scrollbar-thumb{background:var(--app-border-hi);border-radius:4px}

@media(max-width:768px){
  .filter-bar,.form-row,.form-row.col3{flex-direction:column}
  .form-row,.form-row.col3{grid-template-columns:1fr}
  .summary-grid{grid-template-columns:repeat(2,1fr)}
  .final-block{flex-direction:column}
  .rezygn-stat-bar{grid-template-columns:1fr 1fr}
}
</style>

