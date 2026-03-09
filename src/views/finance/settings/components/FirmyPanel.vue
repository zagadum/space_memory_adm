<template>
  <div class="panel-content">
    <div class="panel-hdr">
      <div>
        <div class="panel-title">{{ $t('financeSettings.firmy.title') }}</div>
        <div class="panel-sub">{{ $t('financeSettings.firmy.sub') }}</div>
      </div>
      <button class="btn btn-primary" @click="showFirmaModal = true">{{ $t('financeSettings.firmy.addBtn') }}</button>
    </div>

    <div class="ibox ibox-blue">
      <div class="ibox-icon">ℹ</div>
      <div v-html="$t('financeSettings.firmy.defaultBanner', { name: '<strong>DOMYŚLNA</strong>', link: '<strong>Projekty → Firmy</strong>' })"></div>
    </div>

    <!-- Company Cards -->
    <div v-for="f in store.firmy" :key="f.id" class="firma-card" :class="{ 'firma-archived': f.is_archived }">
      <div class="firma-top">
        <div class="firma-logo" :style="{ background: getLogoGradient(f) }">
          {{ getLogoText(f) }}
        </div>
        <div class="firma-info">
          <div class="firma-name">{{ f.name }}</div>
          <div class="firma-meta">
            NIP: {{ f.nip }} <span v-if="f.krs">&nbsp;·&nbsp; KRS: {{ f.krs }}</span> <span v-if="f.regon">&nbsp;·&nbsp; REGON: {{ f.regon }}</span><br>
            {{ f.address_street }}, {{ f.address_postal }} {{ f.address_city }}
          </div>
          <div class="firma-tags">
            <span v-if="f.is_default" class="ftag ft-def">{{ $t('financeSettings.firmy.defaultTag') }}</span>
            <span v-if="f.vat_status === 'zw'" class="ftag ft-zw">{{ $t('financeSettings.firmy.zwTag') }}</span>
            <span class="ftag ft-form">{{ f.legal_form === 'sp_zoo' ? 'Sp. z o.o.' : 'JDG' }}</span>
            <span class="ftag ft-proj">{{ $t('financeSettings.firmy.projectsCount', f.projekty?.length || 0) }}</span>
          </div>
        </div>
        <div class="firma-actions">
          <button class="btn btn-ghost btn-sm" @click="editFirma(f)">{{ $t('financeSettings.firmy.edit') }}</button>
          <button class="btn btn-ghost btn-sm">👁</button>
          <div class="more-wrap">
            <button class="btn btn-ghost btn-sm" @click="toggleMore(f.id)">⋯</button>
            <div class="more-menu" :class="{ open: openMoreId === f.id }">
              <div class="mi" @click="setDefault(f.id)">{{ $t('financeSettings.firmy.setDefault') }}</div>
              <div class="mi">{{ $t('financeSettings.firmy.duplicate') }}</div>
              <div class="mi">{{ $t('financeSettings.firmy.previewInvoice') }}</div>
              <div class="mi">{{ $t('financeSettings.firmy.assignProjects') }}</div>
              <div class="mi mi-red" @click="archive(f.id)">{{ $t('financeSettings.firmy.archive') }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="firma-projs" v-if="f.projekty && f.projekty.length > 0">
        <div class="fp-label">{{ $t('financeSettings.firmy.projectsLabel') }}</div>
        <span v-for="p in f.projekty" :key="p.id" class="fp-tag">{{ p.emoji }} {{ p.name }}</span>
        <span v-if="f.is_default" class="fp-none">{{ $t('financeSettings.firmy.defaultAll') }}</span>
      </div>
      <div class="firma-projs" v-else>
        <div class="fp-label">{{ $t('financeSettings.firmy.projectsLabel') }}</div>
        <span class="fp-none">{{ $t('financeSettings.firmy.noProjects') }}</span>
      </div>
    </div>

    <FirmaModal 
      v-if="showFirmaModal" 
      :firma="selectedFirma"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsFirmyStore } from '../../../../stores/settingsFirmy.store'
import type { Firma } from '../../../../types/settings'
import FirmaModal from './modals/FirmaModal.vue'

const { t } = useI18n()
const store = useSettingsFirmyStore()
const openMoreId = ref<number | null>(null)
const showFirmaModal = ref(false)
const selectedFirma = ref<Firma | null>(null)

function toggleMore(id: number) {
  openMoreId.value = openMoreId.value === id ? null : id
}

function setDefault(id: number) {
  store.setDefaultFirma(id)
  openMoreId.value = null
}

function editFirma(f: Firma) {
  selectedFirma.value = f
  showFirmaModal.value = true
}

function closeModal() {
  showFirmaModal.value = false
  selectedFirma.value = null
}

function archive(id: number) {
  if (confirm(t('financeSettings.firmy.archiveConfirm'))) {
    try {
      store.archiveFirma(id)
    } catch (e) {
      const error = e as Error
      alert(t('common.error') + ': ' + error.message)
    }
  }
  openMoreId.value = null
}

function getLogoText(f: Firma) {
  if (f.id === 1) return 'GLS'
  const initials = f.name.split(' ').map(n => n[0]).join('').substring(0, 2)
  return initials.toUpperCase()
}

function getLogoGradient(f: Firma) {
  if (f.id === 1) return 'linear-gradient(135deg,#4f6ef7,#8b5cf6)'
  if (f.id === 2) return 'linear-gradient(135deg,#4f6ef7,#06b6d4)'
  return 'linear-gradient(135deg,#10b981,#8b5cf6)'
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
.panel-title {
  font-size: 16px;
  font-weight: 900;
  color: var(--app-text-main);
}
.panel-sub {
  font-size: 11px;
  color: var(--app-text-dim);
  margin-top: 2px;
}

/* FIRMA CARDS */
.firma-card {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 14px;
  margin-bottom: 12px;
  overflow: visible;
  transition: border-color .2s;
}
.firma-card:hover {
  border-color: var(--app-border-hi);
}
.firma-archived {
  opacity: .55;
}
.firma-top {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
}
.firma-logo {
  width: 48px;
  height: 48px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -.5px;
  flex-shrink: 0;
}
.firma-info {
  flex: 1;
  min-width: 0;
}
.firma-name {
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 3px;
  color: var(--app-text-main);
}
.firma-meta {
  font-size: 10.5px;
  color: var(--app-text-dim);
  font-family: 'Space Mono', monospace;
  margin-bottom: 7px;
  line-height: 1.6;
}
.firma-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.ftag {
  font-size: 9.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
}
.ft-def {
  background: rgba(79, 110, 247, 0.12);
  color: var(--blue);
  border: 1px solid rgba(79, 110, 247, 0.25);
}
.ft-zw {
  background: rgba(245, 158, 11, 0.1);
  color: var(--amber);
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.ft-form {
  background: rgba(139, 92, 246, 0.08);
  color: var(--purple);
  border: 1px solid rgba(139, 92, 246, 0.18);
}
.ft-proj {
  background: rgba(139, 92, 246, 0.1);
  color: var(--purple);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.firma-actions {
  display: flex;
  gap: 5px;
  align-items: flex-start;
  flex-shrink: 0;
}

.firma-projs {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.018);
  border-top: 1px solid var(--app-border);
  flex-wrap: wrap;
}
.fp-label {
  font-size: 9.5px;
  font-weight: 800;
  color: var(--app-text-dim);
  text-transform: uppercase;
  letter-spacing: .06em;
  flex-shrink: 0;
}
.fp-tag {
  font-size: 10.5px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
  border: 1px solid var(--app-border);
  color: var(--app-text-main);
}
.fp-none {
  color: var(--app-text-dim);
  font-style: italic;
  font-size: 10.5px;
}

/* MORE MENU */
.more-wrap {
  position: relative;
}
.more-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: var(--app-card);
  border: 1px solid var(--app-border-hi);
  border-radius: 11px;
  min-width: 200px;
  z-index: 200;
  box-shadow: var(--app-shadow-lg);
  display: none;
}
.more-menu.open {
  display: block;
}
.mi {
  padding: 9px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background .12s;
  color: var(--app-text-main);
}
.mi:hover {
  background: var(--status-info-bg);
}
.mi-red {
  color: var(--red);
}
.mi-red:hover {
  background: rgba(239, 68, 68, 0.07);
}
</style>
