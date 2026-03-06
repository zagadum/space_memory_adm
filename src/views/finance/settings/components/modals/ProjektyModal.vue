<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="mhdr">
        <div class="mhl">
          <div class="mhico" style="background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.22);">🧩</div>
          <div>
            <div class="mtitle">{{ $t('financeSettings.projects.modalTitle') }}</div>
            <div class="msub">{{ $t('financeSettings.projects.modalSub') }}</div>
          </div>
        </div>
        <div class="mclose" @click="$emit('close')">✕</div>
      </div>
      <div class="mbody">
        <div class="gr2">
          <div class="fg" style="max-width:80px;">
            <label>{{ $t('financeSettings.projects.labelIcon') }}</label>
            <input type="text" v-model="form.emoji" placeholder="🌌" style="text-align:center;font-size:20px;">
          </div>
          <div class="fg">
            <label>{{ $t('financeSettings.projects.labelName') }} <span class="req">*</span></label>
            <input type="text" v-model="form.name" placeholder="Np. Space Memory">
          </div>
        </div>
        <div class="fg" style="margin-top:16px;">
          <label>{{ $t('financeSettings.projects.labelInvoiceSerie') }}</label>
          <select v-model="form.invoice_serie">
            <option value="FV/SPACE/">FV/SPACE/</option>
            <option value="FV/INDIGO/">FV/INDIGO/</option>
            <option value="FV/OLIMP/">FV/OLIMP/</option>
          </select>
        </div>
        <div class="fg" style="margin-top:16px;">
          <label>{{ $t('financeSettings.projects.labelAssignedFirma') }}</label>
          <select v-model="form.firma_id">
            <option v-for="f in firmyStore.firmy" :key="f.id" :value="f.id">
              {{ f.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="mfooter">
        <button class="btn btn-ghost btn-sm" @click="$emit('close')">{{ $t('common.cancel') }}</button>
        <button class="btn btn-primary" @click="save">{{ $t('financeSettings.projects.btnSave') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsFirmyStore } from '../../../../../stores/settingsFirmy.store'
import { useSettingsProjektyStore, type Project } from '../../../../../stores/settingsProjekty.store'

const { t } = useI18n()
const emit = defineEmits(['close', 'save'])
const firmyStore = useSettingsFirmyStore()

const props = defineProps<{
  project?: Project
}>()

const form = ref({
  emoji: props.project?.emoji || '🌌',
  name: props.project?.name || '',
  invoice_serie: props.project?.invoice_serie || 'FV/SPACE/',
  firma_id: props.project?.firma_id || 1
})

function save() {
  alert(t('financeSettings.projects.alertSaved'))
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
  background: var(--card); border: 1px solid var(--b);
  border-radius: 16px; width: 95%; max-width: 500px;
  display: flex; flex-direction: column; overflow: hidden;
}
.mhdr { padding: 18px 20px; border-bottom: 1px solid var(--b); display: flex; align-items: center; justify-content: space-between; }
.mhl { display: flex; align-items: center; gap: 14px; }
.mhico { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.mtitle { font-size: 14px; font-weight: 800; color: var(--white); }
.msub { font-size: 10.5px; color: var(--dim); margin-top: 2px; }
.mclose { cursor: pointer; color: var(--dim); font-size: 18px; }

.mbody { padding: 20px; }

.gr2 { display: grid; grid-template-columns: 80px 1fr; gap: 16px; }
.fg { display: flex; flex-direction: column; gap: 6px; }
.fg label { font-size: 11px; font-weight: 800; color: var(--dim); text-transform: uppercase; }
.req { color: var(--red); }

input, select {
  background: rgba(12, 12, 32, 0.8); border: 1px solid var(--b);
  color: var(--white); border-radius: 8px; padding: 10px 12px; font-size: 13px;
}

.mfooter { padding: 14px 20px; background: rgba(0,0,0,0.2); border-top: 1px solid var(--b); display: flex; justify-content: flex-end; gap: 10px; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
.btn-primary { background: linear-gradient(135deg, var(--purple), var(--blue)); color: #fff; }
.btn-ghost { background: var(--faint); color: var(--dim); border: 1px solid var(--b); }
.btn-sm { padding: 5px 11px; font-size: 11px; }
</style>
