<template>
  <div class="panel-content">
    <div class="panel-hdr">
      <div>
        <div class="panel-title">{{ $t('financeSettings.vat.title') }}</div>
        <div class="panel-sub">{{ $t('financeSettings.vat.sub') }}</div>
      </div>
      <button class="btn btn-primary" @click="showModal = true">{{ $t('financeSettings.vat.addBtn') }}</button>
    </div>

    <!-- FIRMA SELECTOR -->
    <div class="scard" style="margin-bottom:12px;">
      <div class="scard-body" style="padding:13px 18px;">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span style="font-size:11.5px;font-weight:700;color:#8892b0;">{{ $t('financeSettings.vat.labelConfigFor') }}</span>
          <div class="vat-ftabs">
            <div 
              class="vat-ftab" 
              :class="{ act: store.activeVatFirma === 'global' }"
              @click="store.activeVatFirma = 'global'"
            >
              {{ $t('financeSettings.vat.optGlobal') }}
            </div>
            <div 
              v-for="f in firmyStore.firmy" 
              :key="f.id"
              class="vat-ftab"
              :class="{ act: store.activeVatFirma === f.id.toString() }"
              @click="store.activeVatFirma = f.id.toString()"
            >
              {{ f.id === 1 ? '⭐ ' : '' }}{{ f.name }}
            </div>
          </div>
          <div style="margin-left:auto;font-size:10.5px;color:#8892b0;">
            {{ $t('financeSettings.vat.hintGlobal') }}
          </div>
        </div>
      </div>
    </div>

    <div class="ibox ibox-green">
      <div class="ibox-icon">✓</div>
      <div v-html="$t('financeSettings.vat.infoBanner')"></div>
    </div>

    <!-- RATES TABLE -->
    <div class="scard">
      <div class="scard-hdr">
        <div class="scard-title">
          <div class="scard-ico si-amber">📋</div>
          <div>
            <div class="stitle">{{ $t('financeSettings.vat.cardTitle') }}</div>
            <div class="ssub">{{ getActiveFirmaLabelSub() }}</div>
          </div>
        </div>
      </div>
      <div style="padding:0;">
        <table class="vat-tbl">
          <thead>
            <tr>
              <th>{{ $t('financeSettings.vat.thRate') }}</th>
              <th>{{ $t('financeSettings.vat.thDescription') }}</th>
              <th>{{ $t('financeSettings.vat.thPkwiu') }}</th>
              <th>{{ $t('financeSettings.vat.thClientType') }}</th>
              <th>{{ $t('financeSettings.vat.thDefault') }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rate in filteredRates" :key="rate.id">
              <td><span class="vat-pill" :class="getPillClass(rate.rate)">{{ rate.rate }}</span></td>
              <td style="font-size:12px;max-width:280px;">
                <div style="font-weight:700;">{{ rate.name }}</div>
                <div v-if="rate.legal_base" style="font-size:10.5px;color:#8892b0;">{{ rate.legal_base }}</div>
              </td>
              <td><span class="mono" style="font-size:10.5px;">{{ rate.pkwiu }}</span></td>
              <td>
                <span class="ftag" :class="getClientTypeClass(rate.client_type)">{{ rate.client_type }}</span>
              </td>
              <td><span v-if="rate.is_default" class="badge b-ok" style="font-size:9px;">{{ $t('financeSettings.vat.defaultTag') }}</span></td>
              <td class="td-actions">
                <button class="btn btn-ghost btn-sm" @click="editRate(rate)">✏</button>
                <button v-if="rate.firma_id !== 'global'" class="btn btn-sm btn-red" @click="deleteRate(rate.id)">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="save-bar">
        <div style="font-size:11px;color:var(--dim);">{{ $t('financeSettings.vat.saveHint') }}</div>
        <button class="btn btn-primary" @click="saveRates">{{ $t('financeSettings.vat.saveBtn') }}</button>
      </div>
    </div>

    <VatRateModal 
      v-if="showModal" 
      :rate="selectedRate"
      @close="showModal = false; selectedRate = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsVatStore, type VatRate } from '../../../../stores/settingsVat.store'
import { useSettingsFirmyStore } from '../../../../stores/settingsFirmy.store'
import VatRateModal from './modals/VatRateModal.vue'

const { t } = useI18n()
const store = useSettingsVatStore()
const firmyStore = useSettingsFirmyStore()
const showModal = ref(false)
const selectedRate = ref<VatRate | null>(null)

const filteredRates = computed(() => {
  return store.rates.filter(r => r.firma_id === store.activeVatFirma)
})

function getActiveFirmaLabelSub() {
  if (store.activeVatFirma === 'global') return t('financeSettings.vat.cardSubGlobal')
  const f = firmyStore.firmy.find(firm => firm.id.toString() === store.activeVatFirma)
  return t('financeSettings.vat.cardSubFirma', { name: f ? f.name : store.activeVatFirma })
}

function getPillClass(rate: string) {
  if (rate === 'ZW') return 'vat-zw'
  if (rate === '23%') return 'vat-23'
  if (rate === '8%') return 'vat-8'
  if (rate === '5%') return 'vat-5'
  if (rate === '0%') return 'vat-0'
  return ''
}

function getClientTypeClass(type: string) {
  if (type.includes('B2C')) return 'ft-blue'
  if (type.includes('B2B')) return 'ft-purple'
  return ''
}

function editRate(rate: VatRate) {
  selectedRate.value = { ...rate }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedRate.value = null
}

function deleteRate(id: string) {
  if (confirm(t('financeSettings.vat.deleteConfirm'))) {
    alert(t('financeSettings.vat.toastDeleted'))
  }
}

function saveRates() {
  alert(t('financeSettings.vat.toastSaved'))
}
</script>

<style scoped>
.panel-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 10px;
}
.panel-title { font-size: 16px; font-weight: 900; color: var(--white); }
.panel-sub { font-size: 11px; color: var(--dim); margin-top: 2px; }

.stitle { font-size: 13px; font-weight: 800; color: var(--white); }
.ssub { font-size: 10.5px; color: var(--dim); }

/* FIRMA TABS */
.vat-ftabs { display: flex; gap: 6px; flex-wrap: wrap; }
.vat-ftab {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--b);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--dim);
  cursor: pointer;
  transition: all .2s;
}
.vat-ftab:hover { background: rgba(255, 255, 255, 0.08); color: var(--white); }
.vat-ftab.act {
  background: rgba(79, 110, 247, 0.1);
  border-color: rgba(79, 110, 247, 0.3);
  color: var(--blue);
}

/* TABLE */
.vat-tbl { width: 100%; border-collapse: collapse; }
.vat-tbl th {
  text-align: left; padding: 10px 18px;
  font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--dim);
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid var(--b);
}
.vat-tbl td { padding: 12px 18px; border-bottom: 1px solid rgba(100, 120, 255, 0.06); }

.vat-pill {
  padding: 2px 7px; border-radius: 6px; font-size: 10px; font-weight: 900; letter-spacing: 0.5px;
}
.vat-zw { background: var(--blue); color: #fff; }
.vat-23 { background: var(--green); color: #fff; }
.vat-8 { background: rgba(16, 185, 129, 0.2); color: var(--green); border: 1px solid var(--green); }
.vat-5 { background: var(--amber); color: #fff; }
.vat-0 { background: var(--dim); color: #fff; }

.mono { font-family: 'Space Mono', monospace; }

.ftag {
  font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;
}
.ft-blue { background: rgba(79, 110, 247, 0.08); color: var(--blue); border: 1px solid rgba(79, 110, 247, 0.18); }
.ft-purple { background: rgba(139, 92, 246, 0.08); color: var(--purple); border: 1px solid rgba(139, 92, 246, 0.18); }

.badge { font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 5px; }
.b-ok { background: rgba(16, 185, 129, 0.12); color: var(--green); border: 1px solid rgba(16, 185, 129, 0.22); }

.save-bar {
  padding: 14px 18px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255, 255, 255, 0.015);
  border-top: 1px solid var(--b);
}

.btn-red { background: rgba(239, 68, 68, 0.1); color: var(--red); border: 1px solid rgba(239, 68, 68, 0.2); }
.btn-red:hover { background: rgba(239, 68, 68, 0.2); }
</style>
