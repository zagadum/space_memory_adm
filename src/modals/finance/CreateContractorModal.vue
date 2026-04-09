<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useContractorsStore } from '../../stores/contractors.store';
import { invoicesApi, type Contractor } from '../../api/invoices.api';
import UiButton from '../../components/ui/UiButton.vue';
import UiInput from '../../components/ui/UiInput.vue';

const props = defineProps<{
  contractor?: Contractor;
  onSuccess?: () => void;
  onClose: () => void;
}>();

const { t } = useI18n();
const store = useContractorsStore();

const isEdit = !!props.contractor;
const isLookingUp = ref(false);

const form = ref<Partial<Contractor>>({
  name: '',
  tax_id: '',
  regon: '',
  krs: '',
  email: '',
  phone: '',
  street: '',
  house_number: '',
  flat_number: '',
  city: '',
  zip_code: '',
  country: 'Polska',
  notes: '',
  is_active: true,
  ...props.contractor
});

const handleLookupNip = async () => {
  if (!form.value.tax_id || form.value.tax_id.length < 10) return;
  
  isLookingUp.value = true;
  try {
    const data = await invoicesApi.lookupNip(form.value.tax_id);
    if (data && data.name) {
      form.value.name = data.name;
      form.value.street = data.street;
      form.value.house_number = data.house_number;
      form.value.flat_number = data.flat_number;
      form.value.city = data.city;
      form.value.zip_code = data.zip_code;
      form.value.regon = data.regon;
    }
  } catch (err) {
    console.error('Lookup failed', err);
  } finally {
    isLookingUp.value = false;
  }
};

const handleSave = async () => {
  try {
    if (isEdit && props.contractor?.id) {
      await store.updateContractor(props.contractor.id, form.value);
    } else {
      await store.createContractor(form.value);
    }
    props.onSuccess?.();
    props.onClose();
  } catch (err) {
    // Error handled by store
  }
};
</script>

<template>
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-title">
        {{ isEdit ? t('finance.editContractor') : t('finance.addContractor') }}
      </h2>
      <button class="close-btn" @click="onClose">✕</button>
    </div>

    <div class="modal-body">
      <div class="form-grid">
        <!-- Basic Info -->
        <div class="section-title">{{ t('finance.companyInfo') }}</div>
        
        <div class="field col-full">
          <label>{{ t('finance.taxId') }} (NIP)</label>
          <div class="nip-lookup">
            <UiInput v-model="form.tax_id" placeholder="1234567890" @keyup.enter="handleLookupNip" />
            <UiButton type="secondary" :loading="isLookingUp" @click="handleLookupNip">
              🔍 {{ t('finance.lookup') }}
            </UiButton>
          </div>
        </div>

        <div class="field col-full">
          <label>{{ t('finance.contractorName') }} *</label>
          <UiInput v-model="form.name" :placeholder="t('finance.companyPlaceholder')" />
        </div>

        <div class="field">
          <label>REGON</label>
          <UiInput v-model="form.regon" />
        </div>
        <div class="field">
          <label>KRS</label>
          <UiInput v-model="form.krs" />
        </div>

        <!-- Contact -->
        <div class="section-title">{{ t('finance.contactInfo') }}</div>
        <div class="field">
          <label>{{ t('common.email') }}</label>
          <UiInput v-model="form.email" type="email" />
        </div>
        <div class="field">
          <label>{{ t('common.phone') }}</label>
          <UiInput v-model="form.phone" />
        </div>

        <!-- Address -->
        <div class="section-title">{{ t('finance.location') }}</div>
        <div class="field col-2-3">
          <label>{{ t('finance.street') }}</label>
          <UiInput v-model="form.street" />
        </div>
        <div class="field col-1-3-row">
          <div class="sub-fields">
            <div class="sub-field">
              <label>№</label>
              <UiInput v-model="form.house_number" />
            </div>
            <div class="sub-field">
              <label>/</label>
              <UiInput v-model="form.flat_number" />
            </div>
          </div>
        </div>

        <div class="field">
          <label>{{ t('finance.city') }}</label>
          <UiInput v-model="form.city" />
        </div>
        <div class="field">
          <label>{{ t('finance.zipCode') }}</label>
          <UiInput v-model="form.zip_code" />
        </div>

        <div class="field col-full">
          <label>{{ t('common.notes') }}</label>
          <UiInput v-model="form.notes" type="textarea" rows="2" />
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <UiButton type="ghost" @click="onClose">{{ t('common.cancel') }}</UiButton>
      <UiButton type="primary" :loading="store.isLoading" @click="handleSave">
        {{ t('common.save') }}
      </UiButton>
    </div>
  </div>
</template>

<style scoped>
.modal-content {
  width: 600px;
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary);
}

.modal-body {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.section-title {
  grid-column: 1 / -1;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border-color-light);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.col-full {
  grid-column: 1 / -1;
}

.col-2-3 {
  grid-column: span 1;
}

.nip-lookup {
  display: flex;
  gap: 8px;
}

.nip-lookup :deep(.ui-input) {
  flex: 1;
}

.sub-fields {
  display: flex;
  gap: 8px;
}

.sub-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-card-alt);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Scrollbar */
.modal-body::-webkit-scrollbar {
  width: 6px;
}
.modal-body::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}
</style>
