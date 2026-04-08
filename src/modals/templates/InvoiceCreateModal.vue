<template>
  <BaseModal popupClass="popup-invoice-create">
    <div class="popup-title">🧾 {{ t('faktury.createInvoice') }}</div>
    <div class="popup-sub">{{ t('modals.invoice.subtitle') }}</div>

    <!-- Mode Toggle -->
    <div class="mode-toggle">
      <button 
        class="mode-btn" 
        :class="{ active: mode === 'b2c' }" 
        @click="mode = 'b2c'"
      >
        👤 B2C (Student)
      </button>
      <button 
        class="mode-btn" 
        :class="{ active: mode === 'b2b' }" 
        @click="mode = 'b2b'"
      >
        🏢 B2B (Firma)
      </button>
    </div>

    <!-- Student Search (B2C only) -->
    <div v-if="mode === 'b2c'" class="search-section">
      <div class="popup-label">{{ t('studentList.table.name') }}</div>
      <div class="search-container">
        <input 
          class="popup-input" 
          v-model="studentSearch" 
          @input="onStudentSearch"
          :placeholder="t('faktury.searchPlaceholder')"
        />
        <div v-if="searchResults.length > 0" class="search-results">
          <div 
            v-for="s in searchResults" 
            :key="s.id" 
            class="search-item" 
            @click="selectStudent(s)"
          >
            <span class="s-name">{{ s.name }}</span>
            <span class="s-email">{{ s.email }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Buyer Details -->
    <div class="client-card">
      <div class="client-card-title">{{ t('faktury.buyer') }}</div>
      <div class="popup-2col">
        <UiInput 
          v-model="form.buyer_name" 
          :label="t('faktury.buyer')" 
          required 
        />
        <UiInput 
          v-model="form.buyer_tax_id" 
          :label="mode === 'b2b' ? 'NIP' : 'NIP (Optional)'" 
          :required="mode === 'b2b'" 
        />
      </div>
      <div class="mt-2">
        <UiInput 
          v-model="form.buyer_address" 
          :label="t('modals.invoice.buyerAddress')" 
          required 
        />
      </div>
    </div>

    <!-- Invoice Details -->
    <div class="popup-2col">
      <div>
        <div class="popup-label">{{ t('faktury.project') }}</div>
        <select class="popup-input" v-model="form.project_id">
          <option v-for="p in projectsStore.projects" :key="p.id" :value="parseInt(p.id)">
            {{ p.name }}
          </option>
        </select>
      </div>
      <div>
        <div class="popup-label">{{ t('faktury.type') }}</div>
        <select class="popup-input" v-model="form.document_type">
          <option value="FA">FA (Faktura)</option>
          <option value="PF">PF (Proforma)</option>
        </select>
      </div>
    </div>

    <div class="popup-2col">
      <UiInput 
        type="date" 
        v-model="form.issue_date" 
        :label="t('faktury.date')" 
        required 
      />
      <UiInput 
        type="date" 
        v-model="form.sale_date" 
        :label="t('modals.invoice.saleDate')" 
        required 
      />
    </div>

    <div class="popup-2col">
      <UiInput 
        type="number" 
        v-model="form.amount_gross" 
        :label="t('faktury.amount') + ' (Gross)'" 
        required 
      />
      <div>
        <div class="popup-label">{{ t('modals.invoice.formaPlatnosci') }}</div>
        <select class="popup-input" v-model="form.payment_method">
          <option value="transfer">{{ t('common.transfer') }}</option>
          <option value="card">{{ t('common.card') }}</option>
          <option value="cash">{{ t('common.cash') }}</option>
        </select>
      </div>
    </div>

    <div class="mt-2 text-danger" v-if="error">{{ error }}</div>

    <div class="popup-actions mt-4">
      <UiButton variant="ghost" @click="close">{{ t('common.cancel') }}</UiButton>
      <UiButton 
        variant="primary" 
        :loading="loading" 
        :disabled="!isFormValid || loading" 
        @click="submit"
      >
        {{ t('common.save') }}
      </UiButton>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseModal from '../BaseModal.vue';
import UiInput from '../../components/ui/UiInput.vue';
import UiButton from '../../components/ui/UiButton.vue';
import { useModalStore } from '../../stores/modal.store';
import { useInvoicesStore } from '../../stores/invoices.store';
import { useProjectsStore } from '../../stores/projects.store';
import { getStudents } from '../../api/studentApi';

const { t } = useI18n();
const modal = useModalStore();
const invoicesStore = useInvoicesStore();
const projectsStore = useProjectsStore();

const mode = ref<'b2c' | 'b2b'>('b2c');
const loading = ref(false);
const error = ref<string | null>(null);

const studentSearch = ref('');
const searchResults = ref<any[]>([]);
let searchTimeout: any = null;

const form = reactive({
  student_id: null as number | null,
  project_id: projectsStore.projects[0] ? parseInt(projectsStore.projects[0].id) : 1,
  project_code: projectsStore.projects[0]?.code || 'SPACE',
  document_type: 'FA',
  buyer_name: '',
  buyer_tax_id: '',
  buyer_address: '',
  amount_gross: 0,
  issue_date: new Date().toISOString().split('T')[0],
  sale_date: new Date().toISOString().split('T')[0],
  payment_method: 'transfer',
  notes: '',
});

const isFormValid = computed(() => {
  const common = form.buyer_name && form.buyer_address && form.amount_gross > 0 && form.issue_date && form.sale_date;
  if (mode.value === 'b2c') return common && form.student_id;
  if (mode.value === 'b2b') return common && form.buyer_tax_id;
  return false;
});

async function onStudentSearch() {
  if (studentSearch.value.length < 3) {
    searchResults.value = [];
    return;
  }
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    try {
      const res = await getStudents({ search: studentSearch.value, per_page: 5 });
      searchResults.value = res.data;
    } catch (e) {
      console.error(e);
    }
  }, 400);
}

function selectStudent(student: any) {
  form.student_id = student.id;
  form.buyer_name = student.name;
  form.buyer_address = student.address || '';
  studentSearch.value = student.name;
  searchResults.value = [];
}

function close() {
  modal.close();
}

async function submit() {
  loading.value = true;
  error.value = null;
  
  // Find project code
  const project = projectsStore.projects.find(p => parseInt(p.id) === form.project_id);
  if (project) {
    form.project_code = project.code;
  }

  try {
    await invoicesStore.createInvoice({ ...form });
    modal.close();
  } catch (err: any) {
    error.value = err.message || 'Error creating invoice';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.popup-invoice-create { max-width: 580px; }

.mode-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  padding: 4px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.mode-btn {
  flex: 1;
  padding: 8px;
  border: none;
  background: transparent;
  color: var(--dim, #8892b0);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.mode-btn.active {
  background: var(--blue, #4f6ef7);
  color: white;
  box-shadow: 0 4px 12px rgba(79, 110, 247, 0.2);
}

.search-section { margin-bottom: 16px; }
.search-container { position: relative; }

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #161633;
  border: 1px solid var(--blue);
  border-radius: 8px;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}

.search-item {
  padding: 10px 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.search-item:hover { background: rgba(79, 110, 247, 0.1); }
.search-item:last-child { border-bottom: none; }

.s-name { font-weight: 600; color: white; font-size: 13px; }
.s-email { font-size: 11px; color: var(--dim); }

.client-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(100, 120, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.client-card-title {
  font-size: 11px;
  font-weight: 800;
  color: var(--blue);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
}

.popup-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.popup-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--dim, #8892b0);
  margin-bottom: 6px;
}

.popup-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(100, 120, 255, 0.15);
  border-radius: 8px;
  padding: 10px 12px;
  color: white;
  font-family: inherit;
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
}

.popup-input:focus { border-color: var(--blue); }

.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 24px; }
.text-danger { color: #ef4444; font-size: 12px; }
</style>
