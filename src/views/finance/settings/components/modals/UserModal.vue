<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal wide">

      <!-- HEADER -->
      <div class="mhdr">
        <div class="mhl">
          <div class="mhico">👤</div>
          <div>
            <div class="mtitle">{{ isEdit ? $t('financeSettings.userModal.titleEdit') : $t('financeSettings.userModal.titleAdd') }}</div>
            <div class="msub">{{ isEdit ? $t('financeSettings.userModal.subEdit') : $t('financeSettings.userModal.subAdd') }}</div>
          </div>
        </div>
        <div class="mclose" @click="$emit('close')">✕</div>
      </div>

      <!-- BODY -->
      <div class="mbody">

        <!-- Personal -->
        <div class="sec"><div class="sdot sd-purple"></div>{{ $t('financeSettings.userModal.secPersonal') }}</div>
        <div class="gr2">
          <div class="fg">
            <label>{{ $t('financeSettings.userModal.labelFirstName') }} <span class="req">*</span></label>
            <input type="text" v-model="form.firstName" :class="{ 'err-input': errors.firstName }" :placeholder="$t('financeSettings.userModal.labelFirstName')" />
            <span v-if="errors.firstName" class="err-msg">{{ $t('financeSettings.userModal.errName') }}</span>
          </div>
          <div class="fg">
            <label>{{ $t('financeSettings.userModal.labelLastName') }}</label>
            <input type="text" v-model="form.lastName" :placeholder="$t('financeSettings.userModal.labelLastName')" />
          </div>
          <div class="fg span2">
            <label>{{ $t('financeSettings.userModal.labelEmail') }} <span class="req">*</span></label>
            <input type="email" v-model="form.email" :class="{ 'err-input': errors.email }" placeholder="email@gls.edu.pl" :disabled="isEdit" />
            <span v-if="errors.email" class="err-msg">{{ $t('financeSettings.userModal.errEmail') }}</span>
          </div>
        </div>

        <div class="div"></div>

        <!-- Role & access -->
        <div class="sec"><div class="sdot sd-blue"></div>{{ $t('financeSettings.userModal.secRole') }}</div>
        <div class="gr2">
          <div class="fg span2">
            <label>{{ $t('financeSettings.userModal.labelRole') }} <span class="req">*</span></label>
            <select v-model="form.role" :class="{ 'err-input': errors.role }">
              <option value="" disabled>—</option>
              <option v-for="role in APP_ROLES" :key="role" :value="role">
                {{ t(`roles.${role}`) }}
              </option>
            </select>
            <span v-if="errors.role" class="err-msg">{{ $t('financeSettings.userModal.errRole') }}</span>
          </div>
        </div>

        <div class="div"></div>

        <!-- Project -->
        <div class="sec"><div class="sdot sd-green"></div>{{ $t('financeSettings.userModal.secProject') }}</div>
        <div class="multi-proj-wrap">
          <div
            v-for="p in projOptions" :key="p.val"
            class="mpj" :class="{ sel: form.projects.includes(p.val) }"
            @click="toggleProj(p.val)"
          >{{ p.label }}</div>
        </div>

        <!-- Password (create only) -->
        <template v-if="!isEdit">
          <div class="div"></div>
          <div class="fg">
            <label>{{ $t('financeSettings.userModal.labelPassword') }}</label>
            <input type="password" v-model="form.password" placeholder="••••••••" autocomplete="new-password" />
            <span class="field-hint">{{ $t('financeSettings.userModal.labelPasswordHint') }}</span>
          </div>

          <div class="div"></div>
          <div class="trow no-border">
            <div>
              <div class="tl">{{ $t('financeSettings.userModal.labelInvite') }}</div>
              <div class="th">{{ $t('financeSettings.userModal.labelInviteHint') }}</div>
            </div>
            <label class="tog">
              <input type="checkbox" v-model="form.sendInvite">
              <div class="tsl g"></div>
            </label>
          </div>
        </template>

      </div>

      <!-- FOOTER -->
      <div class="mfooter">
        <span v-if="saveError" class="save-err">{{ saveError }}</span>
        <button class="btn btn-ghost btn-sm" @click="$emit('close')" :disabled="saving">
          {{ $t('financeSettings.userModal.btnCancel') }}
        </button>
        <button class="btn btn-primary" @click="save" :disabled="saving">
          <span v-if="saving">...</span>
          <span v-else>{{ isEdit ? $t('financeSettings.userModal.btnSave') : $t('financeSettings.userModal.btnAdd') }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsUsersStore } from '../../../../../stores/settingsUsers.store'
import type { AppRole } from '../../../../../config/roleMenuAccess.config'

const { t } = useI18n()
const props = defineProps<{ userId: string | null }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const store = useSettingsUsersStore()
const isEdit = computed(() => !!props.userId)
const saving = ref(false)
const saveError = ref('')

// All canonical roles in display order
const APP_ROLES: AppRole[] = [
  'super-admin', 'admin', 'teacher', 'sales', 'quality', 'finance', 'secretariat', 'hr'
]

const projOptions = [
  { val: 'space',  label: '🚀 Space Memory PL' },
  { val: 'indigo', label: '🧠 Indigo' },
]

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: '' as AppRole | '',
  projects: ['space'] as string[],
  password: '',
  sendInvite: true,
})

const errors = ref({ firstName: false, email: false, role: false })

onMounted(() => {
  if (props.userId) {
    const u = store.users.find(u => u.id === props.userId)
    if (u) {
      const parts = u.name.split(' ')
      form.value.firstName = parts[0] ?? ''
      form.value.lastName  = parts.slice(1).join(' ')
      form.value.email     = u.email
      form.value.role      = u.role as AppRole
      form.value.projects  = u.projects.includes('all') ? projOptions.map(p => p.val) : [...u.projects]
    }
  }
})

function toggleProj(val: string) {
  const idx = form.value.projects.indexOf(val)
  if (idx > -1) form.value.projects.splice(idx, 1)
  else form.value.projects.push(val)
}

function validate(): boolean {
  errors.value.firstName = !form.value.firstName.trim()
  errors.value.email     = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)
  errors.value.role      = !form.value.role
  return !errors.value.firstName && !errors.value.email && !errors.value.role
}

async function save() {
  if (!validate()) return
  saving.value = true
  saveError.value = ''
  const fullName = [form.value.firstName.trim(), form.value.lastName.trim()].filter(Boolean).join(' ')

  try {
    if (isEdit.value && props.userId) {
      await store.updateUser(props.userId, {
        name:     fullName,
        role:     form.value.role,
        projects: form.value.projects,
      })
    } else {
      await store.createUser({
        name:       fullName,
        email:      form.value.email,
        role:       form.value.role,
        projects:   form.value.projects,
        password:   form.value.password || undefined,
        sendInvite: form.value.sendInvite,
      })
    }
    emit('saved')
    emit('close')
  } catch {
    saveError.value = t('financeSettings.userModal.errRole') // generic fallback
  } finally {
    saving.value = false
  }
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
  border-radius: 16px; width: 95%; max-width: 600px; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
}
.mhdr { padding: 18px 20px; border-bottom: 1px solid var(--app-border); display: flex; align-items: center; justify-content: space-between; }
.mhl { display: flex; align-items: center; gap: 14px; }
.mhico { width: 38px; height: 38px; background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.22); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.mtitle { font-size: 15px; font-weight: 800; color: var(--app-text-main); }
.msub { font-size: 11px; color: var(--app-text-dim); margin-top: 2px; }
.mclose { cursor: pointer; color: var(--app-text-dim); font-size: 18px; }

.mbody { padding: 20px; overflow-y: auto; flex: 1; }

.sec { display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 800; color: var(--app-text-dim); text-transform: uppercase; margin-bottom: 12px; }
.sdot { width: 6px; height: 6px; border-radius: 50%; }
.sd-purple { background: #8b5cf6; }
.sd-blue   { background: #4f6ef7; }
.sd-green  { background: #10b981; }

.gr2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.span2 { grid-column: span 2; }
.fg { display: flex; flex-direction: column; gap: 6px; }
.fg label { font-size: 11px; font-weight: 800; color: var(--app-text-dim); text-transform: uppercase; }
.req { color: #ef4444; }

input, select {
  background: var(--app-surface); border: 1px solid var(--app-border);
  color: var(--app-text-main); border-radius: 8px; padding: 10px 12px; font-size: 13px;
  transition: border-color .15s;
}
input:focus, select:focus { outline: none; border-color: var(--blue); }
input:disabled { opacity: .5; cursor: not-allowed; }
.err-input { border-color: #ef4444 !important; }
.err-msg { font-size: 10.5px; color: #ef4444; }
.field-hint { font-size: 10.5px; color: var(--app-text-dim); }

.div { height: 1px; background: var(--app-border); margin: 16px 0; }

.multi-proj-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
.mpj {
  padding: 8px 12px; font-size: 11.5px; font-weight: 700; color: var(--app-text-dim);
  background: var(--app-surface); border: 1px solid var(--app-border);
  border-radius: 10px; cursor: pointer; transition: all .2s;
}
.mpj.sel { background: var(--status-success-bg); border-color: rgba(16, 185, 129, 0.3); color: #10b981; }

.trow { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-top: 1px solid var(--app-border); }
.no-border { border: none; padding-top: 0; }
.tl { font-size: 12.5px; font-weight: 600; color: var(--app-text-main); }
.th { font-size: 10px; color: var(--app-text-dim); margin-top: 2px; }

.tog { position: relative; display: inline-block; width: 32px; height: 18px; }
.tog input { opacity: 0; width: 0; height: 0; }
.tsl { position: absolute; cursor: pointer; inset: 0; background-color: var(--app-surface); transition: .2s; border-radius: 18px; }
.tsl:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: #fff; transition: .2s; border-radius: 50%; }
input:checked + .tsl.g { background-color: #10b981; }
input:checked + .tsl:before { transform: translateX(14px); }

.mfooter { padding: 14px 20px; background: var(--app-surface); border-top: 1px solid var(--app-border); display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
.save-err { font-size: 11px; color: #ef4444; margin-right: auto; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.btn-primary { background: linear-gradient(135deg, #4f6ef7, #8b5cf6); color: #fff; }
.btn-ghost { background: var(--app-surface); color: var(--app-text-dim); border: 1px solid var(--app-border); }
.btn-sm { padding: 5px 11px; font-size: 11px; }
</style>
