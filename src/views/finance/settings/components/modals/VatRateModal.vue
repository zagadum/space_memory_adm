<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="mhdr">
        <div class="mhl">
          <div class="mhico">📋</div>
          <div>
            <div class="mtitle">{{ isEdit ? $t('financeSettings.vat.modalTitleEdit') : $t('financeSettings.vat.modalTitleAdd') }}</div>
            <div class="msub">{{ isEdit ? $t('financeSettings.vat.modalSubEdit') : $t('financeSettings.vat.modalSubAdd') }}</div>
          </div>
        </div>
        <div class="mclose" @click="$emit('close')">✕</div>
      </div>
      <div class="mbody">
        <div class="gr2">
          <div class="fg">
            <label>{{ $t('financeSettings.vat.labelRate') }} <span class="req">*</span></label>
            <select v-model="form.rate">
              <option value="ZW">{{ $t('financeSettings.vat.optZw') }}</option>
              <option value="0%">0%</option>
              <option value="5%">5%</option>
              <option value="8%">8%</option>
              <option value="23%">23%</option>
              <option value="custom">{{ $t('financeSettings.vat.optCustom') }}</option>
            </select>
          </div>
          <div v-if="form.rate === 'custom'" class="fg">
            <label>{{ $t('financeSettings.vat.labelCustomRate') }} <span class="req">*</span></label>
            <input 
              type="number" 
              v-model="form.custom_rate" 
              :placeholder="$t('financeSettings.vat.phCustomRate')" 
              min="0" max="100" step="0.5"
              class="mono-input"
            >
            <div class="hint">{{ $t('financeSettings.vat.hintCustomRate') }}</div>
          </div>
          <div class="fg span2">
            <label>{{ $t('financeSettings.vat.labelName') }} <span class="req">*</span></label>
            <input type="text" v-model="form.name" :placeholder="$t('financeSettings.vat.phName')">
          </div>
          <div class="fg">
            <label>{{ $t('financeSettings.vat.labelPkwiu') }}</label>
            <input type="text" v-model="form.pkwiu" :placeholder="$t('financeSettings.vat.phPkwiu')" class="mono-input">
          </div>
          <div class="fg">
            <label>{{ $t('financeSettings.vat.labelClientType') }}</label>
            <select v-model="form.client_type">
              <option>B2C + B2B</option>
              <option>B2C (tylko osoby prywatne)</option>
              <option>B2B (tylko firmy)</option>
              <option>B2B eksport</option>
            </select>
          </div>
          <div class="fg span2">
            <label>{{ $t('financeSettings.vat.labelLegalBase') }}</label>
            <input type="text" v-model="form.legal_base" :placeholder="$t('financeSettings.vat.phLegalBase')">
          </div>
          <div class="fg">
            <label>{{ $t('financeSettings.vat.labelAssignFirma') }}</label>
            <select v-model="form.firma_id">
              <option value="global">{{ $t('financeSettings.vat.optAssignGlobal') }}</option>
              <option v-for="f in firmyStore.firmy" :key="f.id" :value="f.id.toString()">
                {{ f.id === 1 ? '⭐ ' : '' }}{{ f.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="trow">
          <div>
            <div class="tl">{{ $t('financeSettings.vat.checkDefault') }}</div>
            <div class="th">{{ $t('financeSettings.vat.subDefault') }}</div>
          </div>
          <label class="tog">
            <input type="checkbox" v-model="form.is_default">
            <div class="tsl g"></div>
          </label>
        </div>
      </div>
      <div class="mfooter">
        <button class="btn btn-ghost btn-sm" @click="$emit('close')">{{ $t('common.cancel') }}</button>
        <button class="btn btn-primary" @click="save">
          {{ isEdit ? $t('financeSettings.vat.btnSubmitSave') : $t('financeSettings.vat.btnSubmitAdd') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsFirmyStore } from '../../../../../stores/settingsFirmy.store'
import { type VatRate } from '../../../../../stores/settingsVat.store'

const props = defineProps<{
  rate: VatRate | null
}>()

const emit = defineEmits(['close'])
const { t } = useI18n()
const firmyStore = useSettingsFirmyStore()

const isEdit = computed(() => !!props.rate)

const form = ref({
  rate: props.rate?.rate || 'ZW',
  custom_rate: '',
  name: props.rate?.name || '',
  pkwiu: props.rate?.pkwiu || '',
  client_type: props.rate?.client_type || 'B2C + B2B',
  legal_base: props.rate?.legal_base || '',
  firma_id: props.rate?.firma_id || 'global',
  is_default: props.rate?.is_default || false
})

function save() {
  alert(isEdit.value ? t('financeSettings.vat.toastSaved') : t('financeSettings.vat.toastRateAdded'))
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
  border-radius: 16px; width: 90%; max-width: 520px; max-height: 90vh;
  overflow-y: auto;
}

.mhdr { padding: 18px 20px; border-bottom: 1px solid var(--app-border); display: flex; align-items: center; justify-content: space-between; }
.mhl { display: flex; align-items: center; gap: 14px; }
.mhico { width: 38px; height: 38px; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.22); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.mtitle { font-size: 15px; font-weight: 800; color: var(--app-text-main); }
.msub { font-size: 11px; color: var(--app-text-dim); margin-top: 2px; }
.mclose { cursor: pointer; color: var(--app-text-dim); font-size: 18px; }

.mbody { padding: 20px; }

.gr2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 8px; }
.span2 { grid-column: span 2; }

.fg { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.fg label { font-size: 11px; font-weight: 800; color: var(--app-text-dim); text-transform: uppercase; }
.req { color: #ef4444; }

select, input {
  background: var(--app-surface); border: 1px solid var(--app-border);
  color: var(--app-text-main); border-radius: 8px; padding: 10px 12px; font-size: 13px;
}
.mono-input { font-family: 'Space Mono', monospace; }
.hint { font-size: 10px; color: var(--app-text-dim); margin-top: 2px; }

.trow { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-top: 1px solid var(--app-border); margin-top: 10px; }
.tl { font-size: 12.5px; font-weight: 600; color: var(--app-text-main); }
.th { font-size: 10px; color: var(--app-text-dim); margin-top: 2px; }

/* TOGGLE */
.tog { position: relative; display: inline-block; width: 32px; height: 18px; }
.tog input { opacity: 0; width: 0; height: 0; }
.tsl { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--app-surface); transition: .2s; border-radius: 18px; }
.tsl:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: #fff; transition: .2s; border-radius: 50%; }
input:checked + .tsl.g { background-color: #10b981; }
input:checked + .tsl:before { transform: translateX(14px); }

.mfooter { padding: 14px 20px; background: var(--app-surface); border-top: 1px solid var(--app-border); display: flex; justify-content: flex-end; gap: 10px; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
.btn-primary { background: linear-gradient(135deg, #4f6ef7, #8b5cf6); color: #fff; }
.btn-ghost { background: var(--app-surface); color: var(--app-text-dim); border: 1px solid var(--app-border); }
.btn-sm { padding: 5px 11px; font-size: 11px; }
</style>
