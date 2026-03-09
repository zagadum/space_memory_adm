<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="mhdr">
        <div class="mhl">
          <div class="mhico" :style="{ background: integration.color }">{{ integration.icon }}</div>
          <div>
            <div class="mtitle">Konfiguracja: {{ integration.name }}</div>
            <div class="msub">Ustawienia połączenia i klucze API</div>
          </div>
        </div>
        <div class="mclose" @click="$emit('close')">✕</div>
      </div>
      <div class="mbody">
        <div class="sec"><div class="sdot sd-blue"></div>Poświadczenia</div>
        <div class="fg mb-16">
          <label>Klucz API / Token</label>
          <input type="password" value="************************" class="mono">
        </div>
        <div class="fg mb-16">
          <label>Endpoint URL</label>
          <input type="text" value="https://api.system.pl/v1/webhook" class="mono">
        </div>
        <div class="div"></div>
        <div class="sec"><div class="sdot sd-amber"></div>Środowisko</div>
        <div class="gr2">
          <label class="radio-card" :class="{ sel: env === 'test' }" @click="env = 'test'">
            <div class="rtitle">Sandbox / Test</div>
            <div class="rdesc">Bezpieczne testy połączenia</div>
          </label>
          <label class="radio-card" :class="{ sel: env === 'prod' }" @click="env = 'prod'">
            <div class="rtitle">Produkcja</div>
            <div class="rdesc">Realne transakcje i dane</div>
          </label>
        </div>
      </div>
      <div class="mfooter">
        <button class="btn btn-ghost btn-sm" @click="$emit('close')">Anuluj</button>
        <button class="btn btn-primary" @click="save">💾 Zapisz konfigurację</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import type { Integration } from '../../../../../stores/settingsIntegrations.store'

defineProps<{
  integration: Integration
}>()

const emit = defineEmits(['close'])
const env = ref('test')

function save() {
  alert('Konfiguracja zapisana')
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
  border-radius: 16px; width: 95%; max-width: 500px;
}
.mhdr { padding: 18px 20px; border-bottom: 1px solid var(--app-border); display: flex; align-items: center; justify-content: space-between; }
.mhl { display: flex; align-items: center; gap: 14px; }
.mhico { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.mtitle { font-size: 14px; font-weight: 800; color: var(--app-text-main); }
.msub { font-size: 10.5px; color: var(--app-text-dim); margin-top: 2px; }
.mclose { cursor: pointer; color: var(--app-text-dim); font-size: 18px; }

.mbody { padding: 20px; }

.sec {
  display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 800;
  color: var(--app-text-dim); text-transform: uppercase; margin-bottom: 12px;
}
.sdot { width: 6px; height: 6px; border-radius: 50%; }
.sd-blue { background: #4f6ef7; }
.sd-amber { background: #f59e0b; }

.fg { display: flex; flex-direction: column; gap: 6px; }
.fg label { font-size: 10.5px; font-weight: 800; color: var(--app-text-dim); text-transform: uppercase; }
.mb-16 { margin-bottom: 16px; }

input {
  background: var(--app-surface); border: 1px solid var(--app-border);
  color: var(--app-text-main); border-radius: 8px; padding: 10px 12px; font-size: 13px;
}
.mono { font-family: 'Space Mono', monospace; }
.div { height: 1px; background: var(--app-border); margin: 16px 0; }

.gr2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.radio-card {
  padding: 12px; background: var(--app-surface); border: 1px solid var(--app-border);
  border-radius: 10px; cursor: pointer; transition: all .2s;
}
.radio-card.sel { background: var(--status-info-bg); border-color: #4f6ef7; }
.rtitle { font-size: 12px; font-weight: 800; color: var(--app-text-main); }
.rdesc { font-size: 10px; color: var(--app-text-dim); margin-top: 2px; }

.mfooter { padding: 14px 20px; background: var(--app-surface); border-top: 1px solid var(--app-border); display: flex; justify-content: flex-end; gap: 10px; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
.btn-primary { background: linear-gradient(135deg, #4f6ef7, #8b5cf6); color: #fff; }
.btn-ghost { background: var(--app-surface); color: var(--app-text-dim); border: 1px solid var(--app-border); }
.btn-sm { padding: 5px 11px; font-size: 11px; }
</style>
