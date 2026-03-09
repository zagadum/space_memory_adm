<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="mhdr">
        <div class="mhl">
          <div class="mhico" style="background:rgba(79,110,247,0.12);border:1px solid rgba(79,110,247,0.22);">👁</div>
          <div>
            <div class="mtitle">Podgląd szablonu</div>
            <div class="msub">{{ template.name }} · {{ template.type.toUpperCase() }}</div>
          </div>
        </div>
        <div class="mclose" @click="$emit('close')">✕</div>
      </div>
      <div class="mbody">
        <div class="fg">
          <label>Temat wiadomości</label>
          <div class="preview-subject">{{ renderedSubject }}</div>
        </div>
        <div class="div" style="margin: 16px 0;"></div>
        <div class="fg">
          <label>Treść e-mail</label>
          <div class="preview-body">{{ renderedBody }}</div>
        </div>
        
        <div class="ibox ibox-blue" style="margin-top:20px;">
          <div class="ibox-icon">ℹ</div>
          <div style="font-size:11px;">To jest podgląd z przykładowymi danymi (Jan Kowalski, FA/2025/05/123).</div>
        </div>
      </div>
      <div class="mfooter">
        <button class="btn btn-primary" @click="$emit('close')">Zamknij podgląd</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EmailTemplate } from '../../../../../stores/settingsSzablony.store'

const props = defineProps<{
  template: EmailTemplate
}>()

defineEmits(['close'])

const mockData: Record<string, string> = {
  '{{imie_nazwisko}}': 'Jan Kowalski',
  '{{nr_faktury}}': 'FA/2025/05/123',
  '{{opis_uslugi}}': 'Kurs programowania Space Memory',
  '{{kwota}}': '350.00',
  '{{nazwa_firmy}}': 'Global Leaders Skills Sp. z o.o.',
  '{{termin_platnosci}}': '20.05.2025',
  '{{email_firmy}}': 'biuro@gls.edu.pl',
  '{{nazwa_firmy_klienta}}': 'ACME Corp Sp. z o.o.',
  '{{miesiac}}': 'Maj 2025'
}

function renderText(text: string) {
  let t = text
  Object.entries(mockData).forEach(([key, val]) => {
    t = t.replaceAll(key, val)
  })
  return t
}

const renderedSubject = computed(() => renderText(props.template.subject))
const renderedBody = computed(() => renderText(props.template.body))
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.85);
  display: flex; align-items: center; justify-content: center; z-index: 1200;
  backdrop-filter: blur(6px);
}
.modal {
  width: 90%; max-width: 680px; max-height: 90vh;
  background: var(--app-card); border: 1px solid var(--app-border-hi);
  border-radius: 18px; display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}
.mhdr { padding: 18px 22px; border-bottom: 1px solid var(--app-border); display: flex; align-items: center; justify-content: space-between; }
.mhl { display: flex; align-items: center; gap: 15px; }
.mhico { width: 40px; height: 40px; background: rgba(79, 110, 247, 0.1); border: 1px solid rgba(79, 110, 247, 0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.mtitle { font-size: 15px; font-weight: 800; color: var(--app-text-main); }
.msub { font-size: 11px; color: var(--app-text-dim); margin-top: 2px; }
.mclose { cursor: pointer; color: var(--app-text-dim); font-size: 18px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: .2s; }
.mclose:hover { background: rgba(255,255,255,0.05); color: #fff; }

.mbody { padding: 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 20px; }
.fg { display: flex; flex-direction: column; gap: 8px; }
.fg label { font-size: 10px; font-weight: 800; color: var(--app-text-dim); text-transform: uppercase; letter-spacing: .05em; }

.subject-box {
  margin-top: 8px;
  padding: 12px 14px; background: var(--app-surface); border: 1px solid var(--app-border);
  border-radius: 9px; color: var(--app-text-main); font-weight: 600; font-size: 14px;
}
.body-box {
  margin-top: 8px;
  padding: 16px; background: var(--app-surface); border: 1px solid var(--app-border);
  border-radius: 9px; color: var(--app-text-main); font-size: 13.5px; line-height: 1.6;
  white-space: pre-wrap; min-height: 150px;
}

.mfooter { padding: 16px 22px; background: var(--app-surface); border-top: 1px solid var(--app-border); display: flex; justify-content: flex-end; }
.btn { padding: 9px 20px; border-radius: 9px; font-size: 12.5px; font-weight: 700; cursor: pointer; border: none; transition: .2s; }
.btn-primary { background: linear-gradient(135deg, var(--blue), var(--purple)); color: #fff; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(79,110,247,0.3); }

.div { height: 1px; background: var(--app-border); }
.ibox { padding: 12px 14px; border-radius: 10px; display: flex; gap: 10px; line-height: 1.5; border: 1px solid rgba(79,110,247,0.25); background: rgba(79,110,247,0.06); color: rgba(180,200,255,0.9); }
</style>
