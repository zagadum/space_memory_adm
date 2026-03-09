<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="mhdr">
        <div class="mhl">
          <div class="mhico" style="background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.22);">🏦</div>
          <div>
            <div class="mtitle">{{ isEdit ? $t('financeSettings.bankAccounts.modalTitleEdit') : $t('financeSettings.bankAccounts.modalTitleAdd') }}</div>
            <div class="msub">{{ $t('financeSettings.bankAccounts.modalSub') }}</div>
          </div>
        </div>
        <div class="mclose" @click="$emit('close')">✕</div>
      </div>
      <div class="mbody">
        <div class="fg">
          <label>{{ $t('financeSettings.bankAccounts.labelIban') }} <span class="req">*</span></label>
          <input 
            type="text" 
            v-model="form.iban" 
            placeholder="PL 00 0000 0000 0000 0000 0000 0000"
            :class="{ 'input-error': !isIbanValid && form.iban }"
          >
          <div v-if="!isIbanValid && form.iban" class="hint-error">
            {{ $t('financeSettings.bankAccounts.ibanError') }}
          </div>
        </div>
        <div class="gr2" style="margin-top:16px;">
          <div class="fg">
            <label>{{ $t('financeSettings.bankAccounts.labelBankName') }}</label>
            <input type="text" v-model="form.bank_name" :placeholder="$t('financeSettings.bankAccounts.phBankName')">
          </div>
          <div class="fg">
            <label>{{ $t('financeSettings.bankAccounts.labelCurrency') }}</label>
            <select v-model="form.currency">
              <option value="PLN">PLN</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
        <div class="fg" style="margin-top:16px;">
          <label>{{ $t('financeSettings.bankAccounts.labelInternal') }}</label>
          <input type="text" v-model="form.label" :placeholder="$t('financeSettings.bankAccounts.phInternal')">
        </div>
        <div class="fg" style="margin-top:16px;flex-direction:row;align-items:center;gap:10px;cursor:pointer;" @click="form.is_default = !form.is_default">
          <input type="checkbox" v-model="form.is_default" style="width:16px;height:16px;">
          <label style="margin:0;cursor:pointer;">{{ $t('financeSettings.bankAccounts.checkDefault') }}</label>
        </div>
      </div>
      <div class="mfooter">
        <button class="btn btn-ghost btn-sm" @click="$emit('close')">{{ $t('common.cancel') }}</button>
        <button 
          class="btn btn-primary" 
          @click="save"
          :disabled="!isFormValid"
          :style="{ opacity: isFormValid ? 1 : 0.5, cursor: isFormValid ? 'pointer' : 'not-allowed' }"
        >
          {{ isEdit ? $t('common.save') : $t('financeSettings.bankAccounts.addBtn') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsKontaStore, type BankAccount } from '../../../../../stores/settingsKonta.store'
import { validateIBAN } from '../../../../../utils/validators'
import { useNotificationStore } from '../../../../../stores/notification.store'

const { t } = useI18n()

const props = defineProps<{
  account: BankAccount | null
}>()

const emit = defineEmits(['close'])
const store = useSettingsKontaStore()
const notifications = useNotificationStore()

const isEdit = computed(() => !!props.account)

const form = ref({
  iban: '',
  bank_name: '',
  currency: 'PLN',
  label: '',
  is_default: false
})

onMounted(() => {
  if (props.account) {
    form.value = { ...props.account }
  }
})

const isIbanValid = computed(() => {
  if (!form.value.iban) return true // Don't show error if empty
  return validateIBAN(form.value.iban)
})

const isFormValid = computed(() => {
  return form.value.iban.length > 0 && isIbanValid.value
})

function save() {
  if (!isFormValid.value) return

  if (isEdit.value && props.account) {
    store.updateAccount({ ...form.value, id: props.account.id })
    notifications.addToast(t('financeSettings.bankAccounts.toastUpdated'), 'success')
  } else {
    store.addAccount({ ...form.value })
    notifications.addToast(t('financeSettings.bankAccounts.toastAdded'), 'success')
  }
  
  emit('close')
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.8);
  display: flex; align-items: center; justify-content: center; z-index: 1100;
  backdrop-filter: blur(4px);
}
.modal {
  background: var(--app-card); border: 1px solid var(--app-border);
  border-radius: 16px; width: 90%; max-width: 500px;
  display: flex; flex-direction: column; overflow: hidden;
}
.mhdr { padding: 18px 20px; border-bottom: 1px solid var(--app-border); display: flex; align-items: center; justify-content: space-between; }
.mhl { display: flex; align-items: center; gap: 14px; }
.mhico { width: 38px; height: 38px; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.22); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.mtitle { font-size: 14px; font-weight: 800; color: var(--app-text-main); }
.msub { font-size: 10.5px; color: var(--app-text-dim); margin-top: 2px; }
.mclose { cursor: pointer; color: var(--app-text-dim); font-size: 18px; }

.mbody { padding: 20px; }
.gr2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 10px; }
.span2 { grid-column: span 2; }
.fg { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.fg label { font-size: 11px; font-weight: 800; color: var(--app-text-dim); text-transform: uppercase; }
.req { color: var(--red); }

select, input {
  background: var(--app-surface); border: 1px solid var(--app-border);
  color: var(--app-text-main); border-radius: 8px; padding: 10px 12px; font-size: 13px;
}
.mono { font-family: 'Space Mono', monospace; }

.mfooter { padding: 14px 20px; background: var(--app-surface); border-top: 1px solid var(--app-border); display: flex; justify-content: flex-end; gap: 10px; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
.btn-primary { background: linear-gradient(135deg, var(--green), var(--purple)); color: #fff; }
.btn-ghost { background: var(--app-surface); color: var(--app-text-dim); border: 1px solid var(--app-border); }
.btn-sm { padding: 5px 11px; font-size: 11px; }
.input-error { border-color: var(--red) !important; }
.hint-error { font-size: 10px; color: var(--red); margin-top: 4px; font-weight: 600; }
</style>
