<template>
  <div class="info-tab">
    <div v-if="!paymentsStore.student" class="loading-placeholder">
      {{ t('info.loadingData') }}
    </div>
    <template v-else>
      <div class="sp-section-title">{{ t('info.studentSection') }}</div>
      <div class="sp-field" style="margin-bottom:10px">
        <div class="sp-field-label">{{ t('info.email') }}</div>
        <input class="sp-input" type="email" v-model="formData.email">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="sp-field"><div class="sp-field-label">{{ t('info.fullName') }} ({{ t('info.studentData') }})</div><input class="sp-input" v-model="formData.firstName"></div>
        <div class="sp-field"><div class="sp-field-label">{{ t('info.fullName') }}</div><input class="sp-input" v-model="formData.lastName"></div>
        <div class="sp-field"><div class="sp-field-label">{{ t('info.birthDate') }}</div><input class="sp-input" type="date" v-model="formData.birthDate"></div>
        <div class="sp-field"><div class="sp-field-label">Страна</div><input class="sp-input" v-model="formData.country"></div>
        <div class="sp-field"><div class="sp-field-label">Город</div><input class="sp-input" v-model="formData.city"></div>
        <div class="sp-field"><div class="sp-field-label">Улица и номер дома</div><input class="sp-input" v-model="formData.street"></div>
        <div class="sp-field"><div class="sp-field-label">Квартира</div><input class="sp-input" v-model="formData.apartment"></div>
        <div class="sp-field"><div class="sp-field-label">Почтовый код</div><input class="sp-input" v-model="formData.postalCode"></div>
      </div>

      <div class="sp-section-title" style="margin-top:20px">{{ t('info.parentSection') }}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="sp-field"><div class="sp-field-label">{{ t('info.fullName') }} ({{ t('info.parentData') }})</div><input class="sp-input" v-model="formData.parentFirstName"></div>
        <div class="sp-field"><div class="sp-field-label">{{ t('info.fullName') }}</div><input class="sp-input" v-model="formData.parentLastName"></div>
        <div class="sp-field"><div class="sp-field-label">{{ t('info.phone') }}</div><input class="sp-input" type="tel" v-model="formData.parentPhone"></div>
        <div class="sp-field"><div class="sp-field-label">ID паспорта</div><input class="sp-input" v-model="formData.parentPassport"></div>
      </div>

      <div class="sp-section-title" style="margin-top:20px">{{ t('info.otherSection') }}</div>
      <div class="sp-toggle-row">
        <span class="sp-toggle-label">{{ t('info.photoConsent') }}</span>
        <div class="sp-toggle" :class="{ on: formData.photoConsent }" @click="formData.photoConsent = !formData.photoConsent"></div>
      </div>
      <div class="sp-field" style="margin-top:12px">
        <div class="sp-field-label">{{ t('info.regComment') }}</div>
        <textarea class="sp-textarea" v-model="formData.regComment"></textarea>
      </div>
      <div style="margin-top:16px">
        <button class="btn btn-primary" style="width:100%;justify-content:center" @click="saveChanges">{{ t('info.save') }}</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePaymentsStore } from '../../../../stores/payments.store'

const { t } = useI18n()
const paymentsStore = usePaymentsStore()
const formData = ref<any>({})

const initForm = () => {
  if (paymentsStore.student) {
    formData.value = { ...paymentsStore.student }
  }
}

watch(() => paymentsStore.student, initForm, { immediate: true })

onMounted(() => {
  initForm()
})

function saveChanges() {
  if (paymentsStore.student) {
    Object.assign(paymentsStore.student, formData.value)
    alert('Изменения сохранены (локально)')
  }
}
</script>

<style scoped>
.info-tab { padding: 10px 0; }
.loading-placeholder { color: #8892b0; font-size: 13px; text-align: center; padding: 40px; }
.sp-section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8892b0; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid rgba(100,120,255,0.15); }
.sp-field-label { font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #8892b0; margin-bottom: 5px; }
.sp-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(100,120,255,0.15); border-radius: 8px; padding: 8px 11px; color: #e8eeff; font-family: 'Outfit', sans-serif; font-size: 13px; outline: none; transition: all 0.2s; }
.sp-input:focus { border-color: rgba(120,140,255,0.35); background: rgba(255,255,255,0.06); box-shadow: 0 0 10px rgba(79,110,247,0.1); }
.sp-textarea { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(100,120,255,0.15); border-radius: 8px; padding: 8px 11px; color: #e8eeff; font-family: 'Outfit', sans-serif; font-size: 13px; outline: none; transition: all 0.2s; resize: vertical; min-height: 70px; }
.sp-textarea:focus { border-color: rgba(120,140,255,0.35); background: rgba(255,255,255,0.06); }
.sp-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(100,120,255,0.15); border-radius: 9px; margin-bottom: 8px; }
.sp-toggle-label { font-size: 13px; font-weight: 500; color: #e8eeff; }
.sp-toggle { width: 36px; height: 20px; border-radius: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(100,120,255,0.15); position: relative; cursor: pointer; transition: all 0.2s; }
.sp-toggle.on { background: #10b981; border-color: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.4); }
.sp-toggle::after { content: ''; position: absolute; top: 1px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: white; transition: all 0.2s; }
.sp-toggle.on::after { left: 16px; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.2s; border: none; }
.btn-primary { background: linear-gradient(135deg, #4f6ef7, #8b5cf6); color: white; box-shadow: 0 0 16px rgba(79,110,247,0.3); }
.btn-primary:hover { box-shadow: 0 0 24px rgba(79,110,247,0.5); transform: translateY(-1px); }
</style>
