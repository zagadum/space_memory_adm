<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal wide">
      <div class="mhdr">
        <div class="mhl">
          <div class="mhico">📧</div>
          <div>
            <div class="mtitle">{{ isNew ? 'Nowy szablon e-mail' : 'Edytuj szablon e-mail' }}</div>
            <div class="msub">{{ getFirmaLabel() }} · {{ getTypeLabel() }}</div>
          </div>
        </div>
        <div class="mclose" @click="$emit('close')">✕</div>
      </div>
      <div class="mbody">
        <div class="gr2">
          <div class="fg">
            <label>Typ szablonu <span class="req">*</span></label>
            <select v-model="localTpl.type">
              <option value="b2c">B2C — Faktura automatyczna po Imoje</option>
              <option value="b2b">B2B — Faktura wystawiana ręcznie</option>
              <option value="korekta">FK/ — Faktura korygująca</option>
              <option value="przypomnienie">Przypomnienie o płatności</option>
              <option value="potwierdzenie">Potwierdzenie zapisu dziecka</option>
              <option value="custom">Niestandardowy</option>
            </select>
          </div>
          <div class="fg">
            <label>Firma (sprzedawca)</label>
            <select v-model="localTpl.firma_id">
              <option value="global">🌐 Globalny — używany przez wszystkie firmy</option>
              <option v-for="f in firmyStore.firmy" :key="f.id" :value="f.id.toString()">
                {{ f.id === 1 ? '⭐ ' : '' }}{{ f.name }} — nadpisuje globalny
              </option>
            </select>
            <div class="hint">Wybierz firmę jeśli ten szablon ma nadpisywać globalny tylko dla tej firmy</div>
          </div>
        </div>
        <div class="fg">
          <label>Temat wiadomości <span class="req">*</span></label>
          <input type="text" v-model="localTpl.subject" placeholder="np. Faktura {{nr_faktury}} — {{nazwa_firmy}}">
        </div>
        <div class="fg">
          <label>Treść wiadomości <span class="req">*</span></label>
          <textarea 
            ref="bodyArea"
            class="builder-area" 
            v-model="localTpl.body" 
            placeholder="Treść e-mail..."
          ></textarea>
        </div>
        <div class="fg">
          <label>Dostępne zmienne — kliknij aby wstawić do treści</label>
          <div class="var-chips">
            <span 
              v-for="v in variables" 
              :key="v" 
              class="var-chip"
              @click="insertVar(v)"
            >
              {{ v }}
            </span>
          </div>
          <div v-pre class="hint" style="margin-top:6px;">
            Zmienne B2B: {{nazwa_firmy_klienta}} {{nip_klienta}} · zmienne dla FK/: {{nr_korekty}} {{nr_oryginalu}} {{kwota_korekty}}
          </div>
        </div>
        
        <div class="div"></div>
        
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <button class="btn btn-ghost btn-sm" @click="togglePreview">
            {{ showPreview ? 'Hide Preview' : '👁 Podgląd z przykładowymi danymi' }}
          </button>
          <button class="btn btn-ghost btn-sm" @click="sendTest">✉ Wyślij testowy</button>
        </div>
        
        <div v-if="showPreview" class="ibox ibox-amber preview-box">
          <div class="ibox-icon">👁</div>
          <div class="preview-content">{{ renderedBody }}</div>
        </div>
      </div>
      <div class="mfooter">
        <button class="btn btn-ghost btn-sm" @click="$emit('close')">Anuluj</button>
        <button class="btn btn-primary" @click="save">💾 Zapisz szablon</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettingsSzablonyStore, type EmailTemplate } from '../../../../../stores/settingsSzablony.store'
import { useSettingsFirmyStore } from '../../../../../stores/settingsFirmy.store'

const props = defineProps<{
  templateId: string | null
}>()

const emit = defineEmits(['close'])

const store = useSettingsSzablonyStore()
const firmyStore = useSettingsFirmyStore()
const showPreview = ref(false)
const bodyArea = ref<HTMLTextAreaElement | null>(null)

const isNew = computed(() => !props.templateId)

const localTpl = ref<EmailTemplate>({
  id: '',
  firma_id: 'global',
  type: 'b2c',
  name: '',
  subject: '',
  body: '',
  is_default: false
})

onMounted(() => {
  if (props.templateId) {
    const original = store.templates.find(t => t.id === props.templateId)
    if (original) {
      localTpl.value = JSON.parse(JSON.stringify(original))
    }
  }
})

const variables = [
  '{{imie_nazwisko}}', '{{nr_faktury}}', '{{nr_korekty}}', '{{nr_oryginalu}}',
  '{{opis_uslugi}}', '{{kwota}}', '{{miesiac}}', '{{termin_platnosci}}',
  '{{nazwa_firmy}}', '{{email_firmy}}', '{{nazwa_firmy_klienta}}',
  '{{nip_klienta}}', '{{projekt}}', '{{imie_dziecka}}', '{{nazwa_grupy}}',
  '{{trener}}', '{{link_platnosci}}'
]

function insertVar(v: string) {
  const el = bodyArea.value
  if (!el) {
    localTpl.value.body += v
    return
  }
  
  const start = el.selectionStart
  const end = el.selectionEnd
  const text = localTpl.value.body
  localTpl.value.body = text.substring(0, start) + v + text.substring(end)
  
  // Reset cursor after update (needs nextTick ideally)
  setTimeout(() => {
    el.focus()
    el.selectionStart = el.selectionEnd = start + v.length
  }, 0)
}

function getFirmaLabel() {
  if (localTpl.value.firma_id === 'global') return 'Globalne'
  const f = firmyStore.firmy.find(firm => firm.id.toString() === localTpl.value.firma_id)
  return f ? f.name : localTpl.value.firma_id
}

function getTypeLabel() {
  const types: Record<string, string> = {
    b2c: 'B2C',
    b2b: 'B2B',
    korekta: 'Korekta',
    przypomnienie: 'Przypomnienie',
    potwierdzenie: 'Potwierdzenie',
    custom: 'Niestandardowy'
  }
  return types[localTpl.value.type] || localTpl.value.type
}

function togglePreview() {
  showPreview.value = !showPreview.value
}

const renderedBody = computed(() => {
  let b = localTpl.value.body
  const mockData: Record<string, string> = {
    '{{imie_nazwisko}}': 'Jan Kowalski',
    '{{nr_faktury}}': 'FA/2025/05/123',
    '{{opis_uslugi}}': 'Kurs programowania',
    '{{kwota}}': '350.00',
    '{{nazwa_firmy}}': 'GLS Sp. z o.o.'
  }
  Object.entries(mockData).forEach(([key, val]) => {
    b = b.replaceAll(key, val)
  })
  return b
})

function sendTest() {
  alert('Testowy e-mail wysłany')
}

function save() {
  // logic to save to store
  alert('Szablon zapisany')
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
  border-radius: 16px; width: 95%; max-width: 800px; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
}
.modal.wide { max-width: 900px; }

.mhdr { padding: 18px 20px; border-bottom: 1px solid var(--app-border); display: flex; align-items: center; justify-content: space-between; }
.mhl { display: flex; align-items: center; gap: 14px; }
.mhico { width: 38px; height: 38px; background: var(--status-info-bg); border: 1px solid rgba(6,182,212,0.22); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.mtitle { font-size: 15px; font-weight: 800; color: var(--app-text-main); }
.msub { font-size: 11px; color: var(--app-text-dim); margin-top: 2px; }
.mclose { cursor: pointer; color: var(--app-text-dim); font-size: 18px; }

.mbody { padding: 20px; overflow-y: auto; flex: 1; }

.gr2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.fg { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.fg label { font-size: 11px; font-weight: 800; color: var(--app-text-dim); text-transform: uppercase; }
.req { color: #ef4444; }

select, input[type="text"], textarea {
  background: var(--app-surface); border: 1px solid var(--app-border);
  color: var(--app-text-main); border-radius: 8px; padding: 10px 12px; font-size: 13px;
}
.builder-area { min-height: 180px; resize: vertical; line-height: 1.5; font-family: inherit; }

.var-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.var-chip {
  padding: 3px 8px; background: var(--status-info-bg); border: 1px solid rgba(79, 110, 247, 0.2);
  border-radius: 4px; font-size: 11px; font-family: 'Space Mono', monospace; color: var(--blue);
  cursor: pointer; transition: all .15s;
}
.var-chip:hover { background: rgba(79, 110, 247, 0.2); color: #fff; }

.hint { font-size: 10px; color: var(--app-text-dim); margin-top: 2px; }
.div { height: 1px; background: var(--app-border); margin: 16px 0; }

.preview-box { margin-top: 12px; }
.preview-content { font-size: 11.5px; white-space: pre-wrap; color: var(--app-text-main); }

.ibox { padding: 12px; border-radius: 9px; display: flex; gap: 10px; }
.ibox-amber { background: var(--status-warning-bg); border: 1px solid rgba(245, 158, 11, 0.2); }
.ibox-icon { font-size: 16px; }

.mfooter { padding: 14px 20px; background: var(--app-surface); border-top: 1px solid var(--app-border); display: flex; justify-content: flex-end; gap: 10px; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
.btn-primary { background: linear-gradient(135deg, #4f6ef7, #8b5cf6); color: #fff; }
.btn-ghost { background: var(--app-surface); color: var(--app-text-dim); border: 1px solid var(--app-border); }
.btn-sm { padding: 5px 11px; font-size: 11px; }
</style>
