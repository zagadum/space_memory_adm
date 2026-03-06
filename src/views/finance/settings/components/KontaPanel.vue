<template>
  <div class="panel-content">
    <div class="scard">
      <div class="scard-hdr">
        <div class="scard-title">
          <div class="scard-ico" style="background:rgba(16,185,129,0.12);color:var(--green);">🏦</div>
          <div>
            <div class="stitle">{{ $t('financeSettings.bankAccounts.title') }}</div>
            <div class="ssub">{{ $t('financeSettings.bankAccounts.sub') }}</div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="showModal = true">{{ $t('financeSettings.bankAccounts.addBtn') }}</button>
      </div>
      <div class="scard-body">
        <div class="ibox ibox-blue" style="margin-bottom:16px;">
          <div class="ibox-icon">ℹ</div>
          <div v-html="$t('financeSettings.bankAccounts.infoBanner')"></div>
        </div>

        <div 
          v-for="acc in store.accounts" 
          :key="acc.id" 
          class="acc-row"
        >
          <div style="flex:1;">
            <div class="acc-num">{{ acc.iban }}</div>
            <div class="acc-label">{{ acc.bank_name }} · {{ acc.currency }} · {{ acc.label }}</div>
          </div>
          <div v-if="acc.is_default" class="acc-badge">{{ $t('financeSettings.bankAccounts.defaultTag') }}</div>
          
          <button 
            v-if="!acc.is_default" 
            class="btn btn-ghost btn-sm" 
            @click="store.setDefaultAccount(acc.id)"
          >
            {{ $t('financeSettings.bankAccounts.setDefault') }}
          </button>
          
          <button class="btn btn-ghost btn-sm" @click="editAccount(acc)">✏</button>
          
          <button 
            class="btn btn-sm btn-red" 
            @click="deleteAccount(acc.id)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <KontoModal 
      v-if="showModal" 
      :account="selectedAccount"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsKontaStore, type BankAccount } from '../../../../stores/settingsKonta.store'
import KontoModal from './modals/KontoModal.vue'

const { t } = useI18n()
const store = useSettingsKontaStore()
const showModal = ref(false)
const selectedAccount = ref<BankAccount | null>(null)

function editAccount(acc: BankAccount) {
  selectedAccount.value = { ...acc }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedAccount.value = null
}

function deleteAccount(id: number) {
  if (confirm(t('financeSettings.bankAccounts.deleteConfirm'))) {
    store.removeAccount(id)
  }
}
</script>

<style scoped>
.stitle { font-size: 13px; font-weight: 800; color: var(--white); }
.ssub { font-size: 10.5px; color: var(--dim); }

/* ACCOUNT ROWS */
.acc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--b);
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all .15s;
}
.acc-row:hover {
  border-color: var(--bh);
  background: rgba(255, 255, 255, 0.035);
}
.acc-num {
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--white);
  letter-spacing: 0.5px;
}
.acc-label {
  font-size: 11px;
  color: var(--dim);
  margin-top: 2px;
}
.acc-badge {
  background: rgba(16, 185, 129, 0.15);
  color: var(--green);
  font-size: 9px;
  font-weight: 900;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.btn-red { background: rgba(239, 68, 68, 0.1); color: var(--red); border: 1px solid rgba(239, 68, 68, 0.2); }
.btn-red:hover { background: rgba(239, 68, 68, 0.2); }
</style>
