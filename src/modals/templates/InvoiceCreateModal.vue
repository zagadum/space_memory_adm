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
      <div class="popup-label">{{ t('info.fullName') }}</div>
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
    <div class="client-card" :class="{ 'card-b2b': mode === 'b2b' }">
      <div class="client-card-title">{{ t('faktury.buyer') }}</div>
      <div class="popup-2col">
        <div class="nip-input-wrapper">
          <UiInput 
            v-model="form.buyer_tax_id" 
            :label="mode === 'b2b' ? 'NIP' : 'NIP (Optional)'" 
            :required="mode === 'b2b'" 
            @input="onNipInput"
            placeholder="0000000000"
          />
          <button 
            v-if="mode === 'b2b'"
            class="nip-btn" 
            @click="handleNipLookup" 
            :disabled="lookupLoading || form.buyer_tax_id.length < 10"
          >
            <span v-if="lookupLoading" class="loader-inner"></span>
            <span v-else>🔍 Check</span>
          </button>
        </div>
        <UiInput 
          v-model="form.buyer_name" 
          :label="t('modals.invoice.buyerName')" 
          required 
          :placeholder="mode === 'b2b' ? 'Pełna nazwa firmy...' : 'Imię i nazwisko...'"
        />
      </div>
      <div class="mt-2">
        <UiInput 
          v-model="form.buyer_address" 
          :label="t('modals.invoice.buyerAddress')" 
          required 
          placeholder="Ulica, Kod Pocztowy, Miasto"
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
        :label="t('faktury.amount')" 
        required 
      />
      <div>
        <div class="popup-label">{{ t('modals.invoice.formaPlatnosci') }}</div>
        <select class="popup-input" v-model="form.payment_method">
          <option value="transfer">Przelew</option>
          <option value="card">Karta</option>
          <option value="cash">Gotówka</option>
          <option value="imoje">Imoje (Online)</option>
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
const lookupLoading = ref(false);
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
  if (mode.value === 'b2b') return common && form.buyer_tax_id.replace(/\D/g, '').length === 10;
  return false;
});

async function handleNipLookup() {
  const nip = form.buyer_tax_id.replace(/\D/g, '');
  if (nip.length !== 10) return;

  lookupLoading.value = true;
  error.value = null;
  try {
    const data = await invoicesStore.lookupNip(nip);
    if (data) {
      form.buyer_name = data.name;
      form.buyer_address = data.address;
    }
  } catch (err: any) {
    console.error(err);
    error.value = t('modals.invoice.errors.nipNotFound') || 'Nie znaleziono firmy w GUS';
  } finally {
    lookupLoading.value = false;
  }
}

function onNipInput() {
  const nip = form.buyer_tax_id.replace(/\D/g, '');
  if (nip.length === 10 && mode.value === 'b2b') {
    handleNipLookup();
  }
}

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
    await invoicesStore.createInvoice({ 
      ...form,
      mode: mode.value 
    });
    modal.close();
  } catch (err: any) {
    error.value = err.message || 'Błąd podczas wystawiania faktury';
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
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.mode-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: var(--dim, #8892b0);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mode-btn.active {
  background: linear-gradient(135deg, var(--blue, #4f6ef7), #3b5bdb);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 110, 247, 0.3);
}

.search-section { margin-bottom: 20px; }
.search-container { position: relative; }

.search-results {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background: #1a1a3a;
  border: 1px solid rgba(79, 110, 247, 0.3);
  border-radius: 12px;
  z-index: 100;
  max-height: 240px;
  overflow-y: auto;
  box-shadow: 0 15px 35px rgba(0,0,0,0.6);
  backdrop-filter: blur(10px);
}

.search-item {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  transition: background 0.2s;
}

.search-item:hover { background: rgba(79, 110, 247, 0.15); }
.search-item:last-child { border-bottom: none; }

.s-name { font-weight: 600; color: white; font-size: 14px; }
.s-email { font-size: 12px; color: var(--dim); }

.client-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(100, 120, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  transition: all 0.3s;
}

.card-b2b {
  border-color: rgba(79, 110, 247, 0.2);
  background: rgba(79, 110, 247, 0.02);
}

.client-card-title {
  font-size: 11px;
  font-weight: 800;
  color: var(--blue);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 16px;
}

.nip-input-wrapper {
  position: relative;
  display: flex;
  align-items: flex-end;
}

.nip-input-wrapper :deep(.ui-input) {
  flex: 1;
}

.nip-btn {
  position: absolute;
  right: 6px;
  bottom: 6px;
  height: 32px;
  min-width: 70px;
  background: var(--blue);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nip-btn:hover:not(:disabled) {
  filter: brightness(1.2);
  transform: translateY(-1px);
}

.nip-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.loader-inner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.popup-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.popup-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--dim);
  margin-bottom: 8px;
}

.popup-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(100, 120, 255, 0.2);
  border-radius: 10px;
  padding: 11px 14px;
  color: white;
  font-family: inherit;
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
}

.popup-input:focus { border-color: var(--blue); background: rgba(255,255,255,0.08); }

.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 24px; }
.text-danger { 
  color: #ff5555; 
  font-size: 12px; 
  padding: 8px 12px;
  background: rgba(255, 0, 0, 0.05);
  border-radius: 8px;
  margin-bottom: 12px;
}
</style>
