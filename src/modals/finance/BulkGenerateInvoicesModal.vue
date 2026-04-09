<template>
  <BaseModal popupClass="popup-bulk-generate">
    <div class="popup-title">🪄 {{ t('faktury.bulkGenerateTitle') }}</div>
    <div class="popup-sub">{{ t('faktury.bulkGenerateSubtitle') }}</div>

    <!-- Step 1: Filters -->
    <div v-if="step === 'config'" class="step-content">
      <div class="popup-2col">
        <div>
          <div class="popup-label">{{ t('faktury.project') }}</div>
          <select class="popup-input" v-model="config.project_id">
            <option v-for="p in projectsStore.projects" :key="p.id" :value="parseInt(p.id)">
              {{ p.name }}
            </option>
          </select>
        </div>
        <div class="popup-2col">
          <div>
            <div class="popup-label">{{ t('common.month') }}</div>
            <select class="popup-input" v-model="config.month">
              <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
            </select>
          </div>
          <div>
            <div class="popup-label">{{ t('common.year') }}</div>
            <select class="popup-input" v-model="config.year">
              <option v-for="y in [2024, 2025, 2026]" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="mt-4 text-center">
        <UiButton 
          variant="primary" 
          :loading="loadingPreview" 
          @click="fetchPreview"
        >
          {{ t('faktury.fetchEligibleStudents') }}
        </UiButton>
      </div>
    </div>

    <!-- Step 2: Preview & Select -->
    <div v-else-if="step === 'preview'" class="step-content">
      <div class="stats-summary mb-3">
        <div class="stats-item">
          <span class="val">{{ eligibleStudents.length }}</span>
          <span class="lab">{{ t('faktury.studentsFound') }}</span>
        </div>
        <div class="stats-item">
          <span class="val">{{ selectedIds.length }}</span>
          <span class="lab">{{ t('common.selected') }}</span>
        </div>
      </div>

      <div class="preview-list-container">
        <table class="preview-table">
          <thead>
            <tr>
              <th width="40">
                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
              </th>
              <th>{{ t('info.fullName') }}</th>
              <th>{{ t('faktury.amount') }}</th>
              <th>{{ t('info.city') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in eligibleStudents" :key="s.id" :class="{ selected: selectedIds.includes(s.id) }">
              <td>
                <input type="checkbox" :checked="selectedIds.includes(s.id)" @change="toggleStudent(s.id)" />
              </td>
              <td class="s-name">{{ s.name }}</td>
              <td class="s-amount">{{ s.amount }} PLN</td>
              <td class="s-city">{{ s.city }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="popup-actions mt-4">
        <UiButton variant="ghost" @click="step = 'config'">{{ t('common.back') }}</UiButton>
        <UiButton 
          variant="primary" 
          :loading="processing" 
          :disabled="selectedIds.length === 0"
          @click="startGeneration"
        >
          🚀 {{ t('faktury.generateSelected', { count: selectedIds.length }) }}
        </UiButton>
      </div>
    </div>

    <!-- Step 3: Success -->
    <div v-else-if="step === 'success'" class="step-content text-center py-4">
      <div class="success-icon">✅</div>
      <h3>{{ t('common.success') }}</h3>
      <p>{{ t('faktury.bulkSuccessMessage', { count: generatedCount }) }}</p>
      
      <div class="mt-4">
        <UiButton variant="primary" @click="close">{{ t('common.close') }}</UiButton>
      </div>
    </div>

    <div v-if="error" class="error-msg mt-3">{{ error }}</div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseModal from '../BaseModal.vue';
import UiButton from '../../components/ui/UiButton.vue';
import { useModalStore } from '../../stores/modal.store';
import { useInvoicesStore } from '../../stores/invoices.store';
import { useProjectsStore } from '../../stores/projects.store';
import { invoicesApi } from '../../api/invoices.api';

const { t, locale } = useI18n();
const modal = useModalStore();
const projectsStore = useProjectsStore();
const invoicesStore = useInvoicesStore();

const step = ref<'config' | 'preview' | 'success'>('config');
const loadingPreview = ref(false);
const processing = ref(false);
const error = ref<string | null>(null);

const config = reactive({
  project_id: projectsStore.projects[0] ? parseInt(projectsStore.projects[0].id) : 1,
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
});

const eligibleStudents = ref<any[]>([]);
const selectedIds = ref<number[]>([]);
const generatedCount = ref(0);

const isAllSelected = computed(() => {
  return eligibleStudents.value.length > 0 && selectedIds.value.length === eligibleStudents.value.length;
});

function getMonthName(m: number) {
  const date = new Date(2024, m - 1, 1);
  return date.toLocaleString(locale.value, { month: 'long' });
}

async function fetchPreview() {
  loadingPreview.value = true;
  error.value = null;
  try {
    const res = await invoicesApi.bulkGeneratePreview(config);
    eligibleStudents.value = res.students;
    selectedIds.value = res.students.map(s => s.id);
    if (res.students.length === 0) {
      error.value = t('faktury.noStudentsDue');
    } else {
      step.value = 'preview';
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to fetch preview';
  } finally {
    loadingPreview.value = false;
  }
}

function toggleStudent(id: number) {
  const idx = selectedIds.value.indexOf(id);
  if (idx === -1) selectedIds.value.push(id);
  else selectedIds.value.splice(idx, 1);
}

function toggleSelectAll() {
  if (isAllSelected.value) selectedIds.value = [];
  else selectedIds.value = eligibleStudents.value.map(s => s.id);
}

async function startGeneration() {
  processing.value = true;
  error.value = null;
  try {
    const res = await invoicesStore.bulkGenerate({
      ...config,
      student_ids: selectedIds.value
    });
    generatedCount.value = res.count;
    step.value = 'success';
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Generation failed';
  } finally {
    processing.value = false;
  }
}

function close() {
  modal.close();
}
</script>

<style scoped>
.popup-bulk-generate { max-width: 650px; }

.stats-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stats-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(100, 120, 255, 0.1);
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-item .val { font-size: 24px; font-weight: 800; color: var(--blue); }
.stats-item .lab { font-size: 11px; text-transform: uppercase; color: var(--dim); letter-spacing: 0.1em; margin-top: 4px; }

.preview-list-container {
  max-height: 350px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
}

.preview-table th {
  text-align: left;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--dim);
  position: sticky;
  top: 0;
  z-index: 10;
}

.preview-table td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  font-size: 13px;
}

.preview-table tr:hover { background: rgba(79, 110, 247, 0.05); }
.preview-table tr.selected { background: rgba(79, 110, 247, 0.08); }

.s-name { font-weight: 600; }
.s-amount { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--blue); }
.s-city { color: var(--dim); font-size: 12px; }

.success-icon { font-size: 64px; margin-bottom: 16px; }

.error-msg {
  color: #ff5555;
  background: rgba(255, 0, 0, 0.05);
  border-radius: 8px;
  padding: 10px;
  font-size: 12px;
}
</style>
