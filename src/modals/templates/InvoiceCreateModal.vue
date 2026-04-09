<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '../BaseModal.vue'
import UiInput from '../../components/ui/UiInput.vue'
import UiButton from '../../components/ui/UiButton.vue'
import { useModalStore } from '../../stores/modal.store'
import { useInvoicesStore } from '../../stores/invoices.store'
import { useProjectsStore } from '../../stores/projects.store'
import { useContractorsStore } from '../../stores/contractors.store'
import { getStudents } from '../../api/studentApi'

const props = defineProps<{
  mode?: 'b2c' | 'b2b'
  isProforma?: boolean
}>()

const { t } = useI18n()
const modal = useModalStore()
const invoicesStore = useInvoicesStore()
const projectsStore = useProjectsStore()
const contractorsStore = useContractorsStore()

const mode = ref<'b2c' | 'b2b'>(props.mode ?? 'b2c')
const loading = ref(false)
const lookupLoading = ref(false)
const error = ref<string | null>(null)

const studentSearch = ref('')
const searchResults = ref<any[]>([])
const contractorSearch = ref('')
const contractorSearchResults = ref<any[]>([])
let searchTimeout: any = null

const form = reactive({
  student_id: null as number | null,
  contractor_id: null as number | null,
  project_id: projectsStore.projects[0] ? parseInt(projectsStore.projects[0].id) : 1,
  project_code: projectsStore.projects[0]?.code || 'SPACE',
  document_type: props.isProforma ? 'PF' : 'FA',
  buyer_name: '',
  buyer_tax_id: '',
  buyer_address: '',
  amount_gross: 0,
  issue_date: new Date().toISOString().split('T')[0],
  sale_date: new Date().toISOString().split('T')[0],
  payment_method: 'transfer',
  notes: '',
})

const isFormValid = computed(() => {
  const common = form.buyer_name && form.buyer_address && form.amount_gross > 0 && form.issue_date && form.sale_date
  if (mode.value === 'b2c') return common && (form.student_id || form.buyer_name)
  if (mode.value === 'b2b') return common && form.buyer_tax_id.replace(/\D/g, '').length === 10
  return false
})

const handleNipLookup = async () => {
  const nip = form.buyer_tax_id.replace(/\D/g, '')
  if (nip.length !== 10) return

  lookupLoading.value = true
  error.value = null
  try {
    const data = await invoicesStore.lookupNip(nip)
    if (data) {
      form.buyer_name = data.name
      form.buyer_address = data.address
    }
  } catch (err: any) {
    console.error(err)
    error.value = t('faktury.errors.nipNotFound')
  } finally {
    lookupLoading.value = false
  }
}

const onNipInput = () => {
  const nip = form.buyer_tax_id.replace(/\D/g, '')
  if (nip.length === 10 && mode.value === 'b2b') {
    handleNipLookup()
  }
}

const onStudentSearch = async () => {
  if (studentSearch.value.length < 3) {
    searchResults.value = []
    return
  }
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    try {
      const res = await getStudents({ search: studentSearch.value, per_page: 5 })
      searchResults.value = res.data
    } catch (e) {
      console.error(e)
    }
  }, 400)
}

const onContractorSearch = async () => {
  if (contractorSearch.value.length < 3) {
    contractorSearchResults.value = []
    return
  }
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    try {
      contractorSearchResults.value = await contractorsStore.searchContractors(contractorSearch.value)
    } catch (e) {
      console.error(e)
    }
  }, 400)
}

const selectStudent = (student: any) => {
  form.student_id = student.id
  form.buyer_name = student.name
  form.buyer_address = student.address || ''
  studentSearch.value = student.name
  searchResults.value = []
}

const selectContractor = (contractor: any) => {
  form.contractor_id = contractor.id
  form.buyer_name = contractor.name
  form.buyer_tax_id = contractor.tax_id || ''
  const addr = `${contractor.street} ${contractor.house_number}${contractor.flat_number ? '/' + contractor.flat_number : ''}, ${contractor.zip_code} ${contractor.city}`
  form.buyer_address = addr.trim()
  contractorSearch.value = contractor.name
  contractorSearchResults.value = []
}

const submit = async () => {
  loading.value = true
  error.value = null
  
  const project = projectsStore.projects.find(p => parseInt(p.id) === form.project_id)
  if (project) form.project_code = project.code

  try {
    await invoicesStore.createInvoice({ ...form, mode: mode.value })
    modal.close()
  } catch (err: any) {
    error.value = err.message || t('faktury.errors.creationFailed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal popupClass="popup-invoice-create">
    <div class="modal-header">
      <div class="header-icon">➕</div>
      <div class="header-text">
        <h2 class="popup-title">{{ $t('faktury.createInvoice') }}</h2>
        <p class="popup-sub">{{ $t('faktury.createSubtitle') }}</p>
      </div>
    </div>

    <!-- Mode Toggle -->
    <div class="mode-toggle-wrap">
      <div class="modern-toggle">
        <button 
          class="toggle-btn" 
          :class="{ active: mode === 'b2c' }" 
          @click="mode = 'b2c'"
        >
          👤 {{ $t('faktury.b2c') }}
        </button>
        <button 
          class="toggle-btn" 
          :class="{ active: mode === 'b2b' }" 
          @click="mode = 'b2b'"
        >
          🏢 {{ $t('faktury.b2b') }}
        </button>
      </div>
    </div>

    <!-- Search Section -->
    <div class="scroll-body">
      <div class="section-card search-box-wrap">
        <label class="section-label">🔍 {{ mode === 'b2b' ? $t('faktury.searchContractor') : $t('faktury.searchStudent') }}</label>
        <div class="search-field">
          <input 
            v-if="mode === 'b2b'"
            v-model="contractorSearch"
            @input="onContractorSearch"
            class="premium-input-raw"
            :placeholder="$t('faktury.searchPlaceholder')"
          />
          <input 
            v-else
            v-model="studentSearch"
            @input="onStudentSearch"
            class="premium-input-raw"
            :placeholder="$t('faktury.searchPlaceholder')"
          />
          
          <Transition name="fade-down">
            <div v-if="(mode === 'b2c' && searchResults.length) || (mode === 'b2b' && contractorSearchResults.length)" class="dropdown-results shadow-2xl">
              <template v-if="mode === 'b2c'">
                <div v-for="s in searchResults" :key="s.id" class="result-item" @click="selectStudent(s)">
                  <div class="item-icon">👤</div>
                  <div class="item-info">
                    <span class="main-text">{{ s.name }}</span>
                    <span class="sub-text">{{ s.email }}</span>
                  </div>
                </div>
              </template>
              <template v-else>
                <div v-for="c in contractorSearchResults" :key="c.id" class="result-item" @click="selectContractor(c)">
                  <div class="item-icon">🏢</div>
                  <div class="item-info">
                    <span class="main-text">{{ c.name }}</span>
                    <span class="sub-text">{{ c.tax_id }} | {{ c.city }}</span>
                  </div>
                </div>
              </template>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Buyer Details -->
      <div class="section-card buyer-details" :class="{ 'is-b2b': mode === 'b2b' }">
        <div class="card-header">
          <label class="section-label">📦 {{ t('faktury.buyerDetails') }}</label>
          <div v-if="mode === 'b2b' && lookupLoading" class="mini-loader"></div>
        </div>
        
        <div class="form-grid">
          <div class="form-group nip-field">
            <UiInput 
              v-model="form.buyer_tax_id" 
              :label="mode === 'b2b' ? $t('faktury.nip') : `${$t('faktury.nip')} (Optional)`" 
              :required="mode === 'b2b'" 
              @input="onNipInput"
              placeholder="0000000000"
            />
            <button 
              v-if="mode === 'b2b' && form.buyer_tax_id.length >= 10"
              class="nip-lookup-btn" 
              @click="handleNipLookup" 
              :disabled="lookupLoading"
            >
              {{ $t('finance.lookup') }}
            </button>
          </div>
          <div class="form-group">
            <UiInput v-model="form.buyer_name" :label="t('common.name')" required />
          </div>
          <div class="form-group col-span-2">
            <UiInput v-model="form.buyer_address" :label="t('common.address')" required />
          </div>
        </div>
      </div>

      <!-- Document Params -->
      <div class="section-card params-section">
        <label class="section-label">⚙️ {{ t('faktury.documentParams') }}</label>
        <div class="form-grid">
          <div class="form-group">
            <label class="mini-label">{{ t('faktury.project') }}</label>
            <select v-model="form.project_id" class="premium-select">
              <option v-for="p in projectsStore.projects" :key="p.id" :value="parseInt(p.id)">{{ p.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="mini-label">{{ t('faktury.type') }}</label>
            <select v-model="form.document_type" class="premium-select">
              <option value="FA">FA (Faktura)</option>
              <option value="PF">PF (Proforma)</option>
            </select>
          </div>
          <div class="form-group">
            <UiInput type="date" v-model="form.issue_date" :label="t('faktury.date')" required />
          </div>
          <div class="form-group">
            <UiInput type="date" v-model="form.sale_date" :label="t('faktury.saleDate')" required />
          </div>
          <div class="form-group">
            <UiInput type="number" v-model="form.amount_gross" :label="t('faktury.amount')" required />
          </div>
          <div class="form-group">
            <label class="mini-label">{{ $t('faktury.paymentMethod') }}</label>
            <select v-model="form.payment_method" class="premium-select">
              <option value="transfer">{{ $t('faktury.modals.settings.paymentMethods.transfer') }}</option>
              <option value="card">{{ $t('faktury.modals.settings.paymentMethods.card') }}</option>
              <option value="cash">{{ $t('faktury.modals.settings.paymentMethods.cash') }}</option>
              <option value="imoje">{{ $t('faktury.modals.settings.paymentMethods.imoje') }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-toast">{{ error }}</div>

    <div class="modal-footer">
      <UiButton variant="ghost" @click="modal.close">{{ t('common.cancel') }}</UiButton>
      <UiButton 
        variant="primary" 
        :loading="loading" 
        :disabled="!isFormValid || loading" 
        @click="submit"
      >
        ✨ {{ t('faktury.issueDocument') }}
      </UiButton>
    </div>
  </BaseModal>
</template>

<style scoped>
.popup-invoice-create { max-width: 600px; padding: 0 !important; overflow: hidden; }

.modal-header { padding: 24px 24px 16px; background: var(--app-card-hi); border-bottom: 1px solid var(--app-border); display: flex; gap: 16px; align-items: flex-start; }
.header-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(79, 110, 247, 0.1); display: flex; align-items: center; justify-content: center; font-size: 20px; }
.popup-title { font-size: 18px; font-weight: 800; color: var(--app-text-main); margin: 0; }
.popup-sub { font-size: 13px; color: var(--app-text-dim); margin: 4px 0 0; }

.mode-toggle-wrap { padding: 16px 24px; display: flex; justify-content: center; background: var(--app-bg); }
.modern-toggle { display: flex; background: var(--app-card-hi); padding: 4px; border-radius: 14px; border: 1px solid var(--app-border); width: 100%; max-width: 320px; }
.toggle-btn { flex: 1; padding: 8px; border-radius: 10px; font-size: 12px; font-weight: 700; color: var(--app-text-dim); transition: all 0.2s; }
.toggle-btn.active { background: var(--app-primary); color: white; box-shadow: 0 4px 12px rgba(79, 110, 247, 0.3); }

.scroll-body { padding: 8px 24px 24px; max-height: 50vh; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }

.section-card { border: 1px solid var(--app-border); border-radius: 16px; padding: 16px; background: var(--app-card); transition: all 0.3s; }
.section-label { font-size: 11px; font-weight: 800; color: var(--app-primary); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 12px; }

.search-field { position: relative; }
.premium-input-raw { width: 100%; background: var(--app-card-hi); border: 1px solid var(--app-border); border-radius: 10px; padding: 12px 16px; color: var(--app-text-main); font-size: 14px; outline: none; }
.premium-input-raw:focus { border-color: var(--app-primary); background: var(--app-bg); }

.dropdown-results { position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: var(--app-card); border: 1px solid var(--app-border); border-radius: 12px; z-index: 1000; padding: 8px; max-height: 200px; overflow-y: auto; }
.result-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 10px; cursor: pointer; transition: background 0.2s; }
.result-item:hover { background: var(--app-card-hi); }
.item-icon { font-size: 18px; }
.item-info { display: flex; flex-direction: column; }
.main-text { font-size: 13px; font-weight: 700; color: var(--app-text-main); }
.sub-text { font-size: 11px; color: var(--app-text-dim); }

.buyer-details.is-b2b { border-color: rgba(79, 110, 247, 0.2); background: rgba(79, 110, 247, 0.02); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.mini-loader { width: 14px; height: 14px; border: 2px solid var(--app-primary); border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.col-span-2 { grid-column: span 2; }
.nip-field { position: relative; }
.nip-lookup-btn { position: absolute; right: 10px; bottom: 8px; font-size: 10px; font-weight: 800; color: white; background: var(--app-primary); padding: 4px 10px; border-radius: 6px; }

.mini-label { font-size: 11px; font-weight: 600; color: var(--app-text-dim); margin-bottom: 6px; display: block; }
.premium-select { width: 100%; background: var(--app-card-hi); border: 1px solid var(--app-border); border-radius: 10px; padding: 10px 12px; color: var(--app-text-main); font-size: 13px; outline: none; appearance: none; cursor: pointer; }
.premium-select:focus { border-color: var(--app-primary); }

.error-toast { margin: 0 24px 16px; padding: 10px 16px; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 10px; color: #f43f5e; font-size: 12px; font-weight: 600; }

.modal-footer { padding: 16px 24px 24px; background: var(--app-card-hi); border-top: 1px solid var(--app-border); display: flex; justify-content: flex-end; gap: 12px; }

.fade-down-enter-active, .fade-down-leave-active { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.fade-down-enter-from, .fade-down-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
