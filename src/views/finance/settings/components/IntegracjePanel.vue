<template>
  <div class="panel-content">
    <div class="scard">
      <div class="scard-hdr">
        <div class="scard-title">
          <div class="scard-ico si-cyan">🔌</div>
          <div>
            <div class="stitle">{{ $t('financeSettings.integrations.title') }}</div>
            <div class="ssub">{{ $t('financeSettings.integrations.sub') }}</div>
          </div>
        </div>
      </div>
      <div class="scard-body">
        <div v-for="int in store.integrations" :key="int.id" class="int-card">
          <div class="int-logo" :style="{ background: int.color, border: '1px solid rgba(255,255,255,0.1)' }">
            {{ int.icon }}
          </div>
          <div style="flex:1;">
            <div class="int-name">{{ int.name }}</div>
            <div class="int-desc">{{ int.desc }}</div>
          </div>
          <div class="int-right">
            <span class="badge" :class="getStatusClass(int.status)">{{ int.statusText }}</span>
            <button 
              v-if="int.id !== 'whatsapp'" 
              class="btn btn-sm"
              :class="int.status === 'active' ? 'btn-ghost' : 'btn-primary'"
              @click="configure(int)"
            >
              {{ int.status === 'active' ? $t('financeSettings.integrations.btnConfig') : $t('financeSettings.integrations.btnConfigure') }}
            </button>
            <button v-else class="btn btn-ghost btn-sm" @click="info(int)">{{ $t('financeSettings.integrations.btnHowToConnect') }}</button>
          </div>
        </div>
      </div>
    </div>

    <IntegrationConfigModal 
      v-if="showConfig && selectedInt"
      :integration="selectedInt"
      @close="showConfig = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsIntegrationsStore, type Integration } from '../../../../stores/settingsIntegrations.store'
import IntegrationConfigModal from './modals/IntegrationConfigModal.vue'

const { t } = useI18n()
const store = useSettingsIntegrationsStore()
const showConfig = ref(false)
const selectedInt = ref<Integration | null>(null)

function getStatusClass(status: string) {
  if (status === 'active') return 'b-ok'
  if (status === 'inactive') return 'b-warn'
  return 'b-off'
}

function configure(int: Integration) {
  selectedInt.value = int
  showConfig.value = true
}

function info(int: any) {
  alert(t('financeSettings.integrations.whatsappInfo'))
}
</script>

<style scoped>
.stitle { font-size: 13px; font-weight: 800; color: var(--app-text-main); }
.ssub { font-size: 10.5px; color: var(--app-text-dim); }

.scard-body { padding: 18px; display: flex; flex-direction: column; gap: 12px; }

.int-card {
  display: flex; align-items: center; gap: 14px; padding: 14px;
  background: var(--app-surface); border: 1px solid var(--app-border);
  border-radius: 14px; transition: all .2s;
}
.int-card:hover { border-color: var(--app-border-hi); background: var(--status-info-bg); }

.int-logo {
  width: 44px; height: 44px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}

.int-name { font-size: 13.5px; font-weight: 800; color: var(--app-text-main); }
.int-desc { font-size: 10.5px; color: var(--app-text-dim); margin-top: 2px; }

.int-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }

.badge { font-size: 9.5px; font-weight: 800; padding: 2px 7px; border-radius: 5px; }
.b-ok { background: var(--status-success-bg); color: var(--green); border: 1px solid rgba(16, 185, 129, 0.22); }
.b-warn { background: var(--status-warning-bg); color: var(--amber); border: 1px solid rgba(245, 158, 11, 0.22); }
.b-off { background: var(--app-surface); color: var(--app-text-dim); border: 1px solid var(--app-border); }

.btn-amber { background: var(--status-warning-bg); color: var(--amber); }
</style>
