<template>
  <Teleport to="body">
    <div class="sp-overlay" :class="{ active: !!teacherId }" @click="$emit('close')" />
    <div class="sp-panel" :class="{ open: !!teacherId }">
      <template v-if="details">
        <!-- HEADER -->
        <div class="sp-header">
          <div class="sp-header-top">
            <div class="sp-avatar-row">
              <div class="sp-avatar" :style="{ background: avatarColor(fullName) }">
                {{ initials(fullName) }}
              </div>
              <div>
                <div class="sp-name">{{ fullName }}</div>
                <div class="sp-meta">{{ t('teachersList.panel.teacherRole') || 'Преподаватель' }}</div>
              </div>
            </div>
            <div class="sp-close" @click="$emit('close')">✕</div>
          </div>
          <div class="sp-tabs">
            <div class="sp-tab active">
              👤 {{ t('newStudents.panel.tabProfile') || 'Профиль' }}
            </div>
          </div>
        </div>

        <!-- BODY -->
        <div class="sp-body">
          <div class="sp-tab-content">
            <div class="sp-section-title">{{ t('newStudents.panel.sectionAccount') || 'Данные аккаунта' }}</div>
            <div class="sp-grid cols-1">
              <div class="sp-field"><div class="sp-label">Email</div><input class="sp-input" v-model="form.email" type="email" /></div>
            </div>

            <!-- Change Password block -->
            <div class="sp-change-pwd-block">
              <button class="sp-change-pwd-toggle" @click="showChangePassword = !showChangePassword">
                🔑 {{ t('newStudents.panel.changePasswordBtn') || 'Сменить пароль' }}
                <span class="sp-toggle-arrow" :class="{ open: showChangePassword }">▾</span>
              </button>
              <div v-if="showChangePassword" class="sp-change-pwd-body">
                <div class="sp-pwd-note">{{ t('newStudents.panel.passwordEmailNote') || 'Пароль будет изменен.' }}</div>
                <div class="sp-grid">
                  <div class="sp-field">
                    <div class="sp-label">{{ t('newStudents.panel.fieldNewPassword') || 'Новый пароль' }}</div>
                    <input class="sp-input" v-model="newPassword" type="password" autocomplete="new-password" />
                  </div>
                  <div class="sp-field">
                    <div class="sp-label">{{ t('newStudents.panel.fieldConfirmPassword') || 'Подтвердите пароль' }}</div>
                    <input class="sp-input" :class="{ 'sp-input-error': passwordMismatch }" v-model="confirmPassword" type="password" autocomplete="new-password" />
                  </div>
                </div>
                <div v-if="passwordMismatch" class="sp-pwd-error">{{ t('newStudents.panel.passwordMismatch') || 'Пароли не совпадают' }}</div>
                <button
                    class="sp-save-pwd-btn"
                    :disabled="!newPassword || passwordMismatch || isSavingPassword"
                    @click="onChangePassword"
                >
                  {{ isSavingPassword ? '⏳' : '🔑' }} {{ t('newStudents.panel.savePasswordBtn') || 'Сменить пароль' }}
                </button>
              </div>
            </div>

            <div class="sp-section-title">{{ t('newStudents.panel.sectionPersonal') || 'Личные данные' }}</div>
            <div class="sp-grid">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldFirstName') || 'Имя' }}</div><input class="sp-input" v-model="form.firstName" /></div>
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldLastName') || 'Фамилия' }}</div><input class="sp-input" v-model="form.lastName" /></div>
            </div>
            <div class="sp-grid cols-1">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldBirthDate') || 'Дата рождения' }}</div><input class="sp-input" v-model="form.birthDate" type="date" /></div>
            </div>
            <div class="sp-grid">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldPhone') || 'Телефон' }}</div><input class="sp-input" v-model="form.phone" type="tel" /></div>
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldPassport') || 'ID паспорта' }}</div><input class="sp-input" v-model="form.passport" /></div>
            </div>

            <div class="sp-section-title">{{ t('newStudents.panel.sectionAddress') || 'Адрес' }}</div>
            <div class="sp-grid">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldCountry') || 'Страна' }}</div><input class="sp-input" v-model="form.country" /></div>
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldVoivodeship') || 'Область / Воеводство' }}</div><input class="sp-input" v-model="form.voivodeship" /></div>
            </div>
            <div class="sp-grid">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldCity') || 'Город' }}</div><input class="sp-input" v-model="form.city" /></div>
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldPostCode') || 'Почтовый индекс' }}</div><input class="sp-input" v-model="form.postCode" /></div>
            </div>
            <div class="sp-grid cols-1">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldStreet') || 'Улица и дом' }}</div><input class="sp-input" v-model="form.street" /></div>
            </div>
            <div class="sp-grid cols-1">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldApt') || 'Квартира' }}</div><input class="sp-input" v-model="form.apt" /></div>
            </div>

            <div class="sp-section-title">{{ t('newStudents.panel.sectionComments') || 'Комментарий' }}</div>
            <div class="sp-grid cols-1">
              <div class="sp-field">
                <div class="sp-label">{{ t('newStudents.panel.fieldComment') || 'Комментарий' }}</div>
                <textarea class="sp-input sp-textarea" v-model="form.comment" />
              </div>
            </div>

            <button class="sp-save-btn" @click="onSave">✦ {{ t('newStudents.panel.saveChanges') || 'Сохранить изменения' }}</button>
          </div>
        </div>
      </template>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TeacherDetails } from '../../../api/teachersApi'

const props = defineProps<{
  teacherId: number | null
  details: TeacherDetails | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: Partial<TeacherDetails>]
  changePassword: [password: string]
}>()

const { t } = useI18n()

// Change password
const showChangePassword = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const isSavingPassword = ref(false)
const passwordMismatch = computed(() => confirmPassword.value !== '' && newPassword.value !== confirmPassword.value)

const defaultForm: Partial<TeacherDetails> = {
  email: '', firstName: '', lastName: '', birthDate: '',
  country: '', voivodeship: '', city: '', street: '', apt: '', postCode: '',
  phone: '', passport: '', comment: ''
}

const form = ref<Partial<TeacherDetails>>({ ...defaultForm })

const fullName = computed(() => {
  return `${form.value.firstName || ''} ${form.value.lastName || ''}`.trim()
})

function mapDetailsToForm(d: TeacherDetails): Partial<TeacherDetails> {
  return {
    firstName: d.firstName ?? '',
    lastName: d.lastName ?? '',
    email: d.email ?? '',
    phone: d.phone ?? '',
    birthDate: d.birthDate ?? '',
    country: d.country ?? '',
    voivodeship: d.voivodeship ?? '',
    city: d.city ?? '',
    street: d.street ?? '',
    apt: d.apt ?? '',
    postCode: d.postCode ?? '',
    passport: d.passport ?? '',
    comment: d.comment ?? '',
  }
}

function resetForm() {
  form.value = { ...defaultForm }
}

watch(() => props.details, (d) => {
  if (!d) {
    resetForm()
    return
  }
  form.value = mapDetailsToForm(d)
}, { immediate: true })

watch(() => props.teacherId, () => {
  showChangePassword.value = false
  newPassword.value = ''
  confirmPassword.value = ''
})

async function onChangePassword() {
  if (!newPassword.value || passwordMismatch.value) return
  isSavingPassword.value = true
  try {
    emit('changePassword', newPassword.value)
    newPassword.value = ''
    confirmPassword.value = ''
    showChangePassword.value = false
  } finally {
    isSavingPassword.value = false
  }
}

function avatarColor(name: string) {
  if (!name) return 'linear-gradient(135deg,#4f6ef7,#8b5cf6)'
  const colors = [
    'linear-gradient(135deg,#4f6ef7,#8b5cf6)',
    'linear-gradient(135deg,#10b981,#06b6d4)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#8b5cf6,#ec4899)',
    'linear-gradient(135deg,#06b6d4,#4f6ef7)',
  ]
  return colors[name.charCodeAt(0) % colors.length]
}

function initials(name: string) {
  if (!name) return ''
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function onSave() { 
  emit('save', { ...form.value }) 
}
</script>

<style scoped>
.sp-overlay {
  position: fixed; inset: 0; background: rgba(4,4,15,0.55);
  backdrop-filter: blur(4px); z-index: 300;
  opacity: 0; pointer-events: none; transition: opacity 0.3s;
}
:root:not(.dark) .sp-overlay { background: rgba(160,170,220,0.50); }
.sp-overlay.active { opacity: 1; pointer-events: all; }

.sp-panel {
  position: fixed; top: 0; right: 0; bottom: 0; width: 560px; max-width: 100vw;
  background: var(--app-bg); border-left: 1px solid var(--app-border-hi);
  backdrop-filter: blur(30px); z-index: 400; display: flex; flex-direction: column;
  transform: translateX(100%); transition: transform 0.38s cubic-bezier(0.4,0,0.2,1); overflow: hidden;
}
.sp-panel.open { transform: translateX(0); box-shadow: -12px 0 40px rgba(0,0,0,0.15); }

.sp-header {
  padding: 22px 24px 0; border-bottom: 1px solid var(--app-border); flex-shrink: 0;
  background: var(--app-surface);
}
.sp-header-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.sp-avatar-row { display: flex; align-items: center; gap: 14px; }
.sp-avatar {
  width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; flex-shrink: 0;
  border: 2px solid rgba(79,110,247,0.4); box-shadow: 0 0 20px rgba(79,110,247,0.2); color: white;
}
.sp-name { font-size: 18px; font-weight: 700; color: var(--app-text-main); }
.sp-meta { font-size: 12px; color: var(--app-text-dim); margin-top: 3px; }
.sp-close {
  width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; cursor: pointer; background: var(--app-card); border: 1px solid var(--app-border);
  color: var(--app-text-dim); font-size: 15px; transition: all 0.15s;
}
.sp-close:hover { background: rgba(239,68,68,0.15); color: #ef4444; border-color: rgba(239,68,68,0.3); }

.sp-tabs { display: flex; gap: 0; }
.sp-tab {
  padding: 10px 16px; font-size: 13px; font-weight: 500; color: var(--app-text-dim);
  cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s;
  margin-bottom: -1px; white-space: nowrap;
}
.sp-tab.active { color: #4f6ef7; border-bottom-color: #4f6ef7; }

.sp-body { flex: 1; overflow-y: auto; }
.sp-body::-webkit-scrollbar { width: 4px; }
.sp-body::-webkit-scrollbar-thumb { background: rgba(79,110,247,0.2); border-radius: 2px; }

.sp-tab-content { padding: 20px 24px; }

.sp-section-title {
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--app-text-dim); margin-bottom: 14px; margin-top: 4px;
  display: flex; align-items: center; gap: 8px;
}
.sp-section-title::after { content: ''; flex: 1; height: 1px; background: var(--app-border); }

.sp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.sp-grid.cols-1 { grid-template-columns: 1fr; }
.sp-field { display: flex; flex-direction: column; gap: 5px; }
.sp-label { font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--app-text-dim); }
.sp-input {
  background: var(--app-card); border: 1px solid var(--app-border); border-radius: 8px;
  padding: 8px 11px; color: var(--app-text-main); font-family: 'Outfit', sans-serif;
  font-size: 13.5px; outline: none; transition: all 0.2s; width: 100%;
}
.sp-input:focus { border-color: var(--app-border-hi); box-shadow: 0 0 10px rgba(79,110,247,0.1); }
.sp-input::placeholder { color: rgba(136,146,176,0.4); }
.sp-textarea { resize: vertical; min-height: 72px; }

.sp-save-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; padding: 10px 14px;
  border-radius: 8px; font-size: 13px; font-weight: 600; font-family: 'Outfit', sans-serif; cursor: pointer;
  background: linear-gradient(135deg,#4f6ef7,#8b5cf6); color: white; box-shadow: 0 0 16px rgba(79,110,247,0.3);
  border: none; transition: all 0.2s; margin-top: 8px;
}
.sp-save-btn:hover { box-shadow: 0 0 24px rgba(79,110,247,0.5); transform: translateY(-1px); }

/* Change Password Block */
.sp-change-pwd-block {
  background: var(--app-card); border: 1px solid var(--app-border); border-radius: 10px;
  margin-bottom: 16px; overflow: hidden;
}
.sp-change-pwd-toggle {
  width: 100%; display: flex; align-items: center; gap: 8px; padding: 10px 14px;
  background: transparent; border: none; cursor: pointer; color: var(--app-text-dim);
  font-size: 13px; font-weight: 600; font-family: 'Outfit', sans-serif; text-align: left;
  transition: color 0.15s;
}
.sp-change-pwd-toggle:hover { color: #4f6ef7; }
.sp-toggle-arrow { margin-left: auto; font-size: 14px; transition: transform 0.2s; display: inline-block; }
.sp-toggle-arrow.open { transform: rotate(180deg); }
.sp-change-pwd-body { padding: 0 14px 14px; border-top: 1px solid var(--app-border); padding-top: 12px; }
.sp-pwd-note { font-size: 11px; color: var(--app-text-dim); margin-bottom: 8px; line-height: 1.35; }
.sp-pwd-error { font-size: 11.5px; color: #ef4444; margin-bottom: 8px; }
.sp-input-error { border-color: rgba(239,68,68,0.5) !important; }
.sp-save-pwd-btn {
  width: 100%; padding: 8px 14px; border-radius: 8px; border: none; cursor: pointer;
  background: linear-gradient(135deg,#4f6ef7,#8b5cf6); color: white;
  font-size: 13px; font-weight: 600; font-family: 'Outfit', sans-serif;
  transition: all 0.2s; margin-top: 4px;
}
.sp-save-pwd-btn:hover:not(:disabled) { box-shadow: 0 0 16px rgba(79,110,247,0.4); transform: translateY(-1px); }
.sp-save-pwd-btn:disabled { opacity: 0.45; cursor: not-allowed; }
</style>
