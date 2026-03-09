<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal wide">
      <div class="mhdr">
        <div class="mhl">
          <div class="mhico">👤</div>
          <div>
            <div class="mtitle">{{ isEdit ? 'Edytuj użytkownika' : 'Dodaj użytkownika' }}</div>
            <div class="msub">Nowe konto · zaproszenie e-mail zostanie wysłane automatycznie</div>
          </div>
        </div>
        <div class="mclose" @click="$emit('close')">✕</div>
      </div>
      <div class="mbody">
        <div class="sec"><div class="sdot sd-purple"></div>Dane personalne</div>
        <div class="gr2">
          <div class="fg"><label>Imię <span class="req">*</span></label><input type="text" v-model="form.name" placeholder="Imię"></div>
          <div class="fg"><label>Nazwisko <span class="req">*</span></label><input type="text" v-model="form.lastName" placeholder="Nazwisko"></div>
          <div class="fg span2"><label>E-mail (login) <span class="req">*</span></label><input type="email" v-model="form.email" placeholder="email@gls.edu.pl"></div>
        </div>
        <div class="div"></div>
        
        <div class="sec"><div class="sdot sd-blue"></div>Rola i dostęp</div>
        <div class="fg">
          <label>Rola <span class="req">*</span></label>
          <select v-model="form.role">
            <optgroup label="Zarząd / Administracja">
              <option value="Super-Admin">Super-Admin</option>
              <option value="Admin">Admin</option>
            </optgroup>
            <optgroup label="Finanse i administracja">
              <option value="Główna Księgowa">Główna Księgowa</option>
              <option value="Pracownik sekretariatu">Pracownik sekretariatu</option>
            </optgroup>
          </select>
        </div>
        
        <div class="div"></div>
        <div class="sec"><div class="sdot sd-green"></div>Przypisz do projektów</div>
        <div class="multi-proj-wrap">
          <div v-for="p in projOptions" :key="p.val" 
               class="mpj" :class="{ sel: form.projects.includes(p.val) }"
               @click="toggleProj(p.val)">
            {{ p.label }}
          </div>
        </div>
        
        <div class="div"></div>
        <div class="trow no-border">
          <div><div class="tl">Wyślij zaproszenie e-mail</div><div class="th">Użytkownik otrzyma link do ustawienia hasła</div></div>
          <label class="tog"><input type="checkbox" v-model="form.invite"><div class="tsl g"></div></label>
        </div>
      </div>
      <div class="mfooter">
        <button class="btn btn-ghost btn-sm" @click="$emit('close')">Anuluj</button>
        <button class="btn btn-primary" @click="save">{{ isEdit ? 'Zapisz zmiany' : '＋ Dodaj użytkownika' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettingsUsersStore } from '../../../../../stores/settingsUsers.store'

const props = defineProps<{
  userId: string | null
}>()

const emit = defineEmits(['close'])
const store = useSettingsUsersStore()

const isEdit = computed(() => !!props.userId)

const form = ref({
  name: '',
  lastName: '',
  email: '',
  role: 'Pracownik sekretariatu',
  projects: ['space'] as string[],
  invite: true
})

const projOptions = [
  { val: 'space', label: '🚀 Space Memory' },
  { val: 'indigo', label: '🧠 INDIGO / Speedy Mind' },
  { val: 'olimp', label: '🏆 Olimpiada' },
  { val: 'camp', label: '🎓 Warsztaty / Obozy' }
]

onMounted(() => {
  if (props.userId) {
    const u = store.users.find(u => u.id === props.userId)
    if (u) {
      const parts = u.name.split(' ')
      form.value.name = parts[0]
      form.value.lastName = parts[1] || ''
      form.value.email = u.email
      form.value.role = u.role
      form.value.projects = u.projects.includes('all') ? projOptions.map(p => p.val) : [...u.projects]
    }
  }
})

function toggleProj(val: string) {
  const idx = form.value.projects.indexOf(val)
  if (idx > -1) form.value.projects.splice(idx, 1)
  else form.value.projects.push(val)
}

function save() {
  const updatedData = {
    name: `${form.value.name} ${form.value.lastName}`.trim(),
    email: form.value.email,
    role: form.value.role,
    projects: form.value.projects,
    initials: (form.value.name[0] || '') + (form.value.lastName[0] || '')
  }

  if (isEdit.value && props.userId) {
    store.updateUser(props.userId, updatedData)
  } else {
    alert('Dodawanie nowych użytkowników nie jest jeszcze w pełni zaimplementowane (symulacja)')
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
  border-radius: 16px; width: 95%; max-width: 600px; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
}
.mhdr { padding: 18px 20px; border-bottom: 1px solid var(--app-border); display: flex; align-items: center; justify-content: space-between; }
.mhl { display: flex; align-items: center; gap: 14px; }
.mhico { width: 38px; height: 38px; background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.22); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #8b5cf6; }
.mtitle { font-size: 15px; font-weight: 800; color: var(--app-text-main); }
.msub { font-size: 11px; color: var(--app-text-dim); margin-top: 2px; }
.mclose { cursor: pointer; color: var(--app-text-dim); font-size: 18px; }

.mbody { padding: 20px; overflow-y: auto; flex: 1; }

.sec {
  display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 800;
  color: var(--app-text-dim); text-transform: uppercase; margin-bottom: 12px;
}
.sdot { width: 6px; height: 6px; border-radius: 50%; }
.sd-purple { background: #8b5cf6; }
.sd-blue { background: #4f6ef7; }
.sd-green { background: #10b981; }

.gr2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.span2 { grid-column: span 2; }
.fg { display: flex; flex-direction: column; gap: 6px; }
.fg label { font-size: 11px; font-weight: 800; color: var(--app-text-dim); text-transform: uppercase; }
.req { color: #ef4444; }

input, select {
  background: var(--app-surface); border: 1px solid var(--app-border);
  color: var(--app-text-main); border-radius: 8px; padding: 10px 12px; font-size: 13px;
}
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
