<template>
  <div class="panel-content">
    <div class="panel-hdr">
      <div>
        <div class="panel-title">{{ $t('financeSettings.projects.title') }}</div>
        <div class="panel-sub">{{ $t('financeSettings.projects.sub') }}</div>
      </div>
      <button class="btn btn-ghost btn-sm" @click="showModal = true">{{ $t('financeSettings.projects.addBtn') }}</button>
    </div>

    <div class="ibox ibox-amber">
      <div class="ibox-icon">⚠</div>
      <div v-html="$t('financeSettings.projects.infoBanner')"></div>
    </div>

    <div class="scard">
      <div class="scard-hdr">
        <div class="scard-title">
          <div class="scard-ico" style="background:rgba(79,110,247,0.12);color:var(--blue);">🧩</div>
          <div>
            <div class="stitle">{{ $t('financeSettings.projects.cardTitle') }}</div>
            <div class="ssub">{{ $t('financeSettings.projects.cardSub') }}</div>
          </div>
        </div>
      </div>
      <div style="padding:0;">
        <table class="proj-tbl">
          <thead>
            <tr>
              <th>{{ $t('financeSettings.projects.thProject') }}</th>
              <th>{{ $t('financeSettings.projects.thSerie') }}</th>
              <th>{{ $t('financeSettings.projects.thFirma') }}</th>
              <th>{{ $t('financeSettings.projects.thStatus') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in projStore.projects" :key="p.id">
              <td>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:16px;">{{ p.emoji }}</span>
                  <div>
                    <div style="font-size:13px;font-weight:700;">{{ p.name }}</div>
                    <div style="font-size:10.5px;color:var(--app-text-dim);">{{ p.cities?.join(', ') }}</div>
                  </div>
                </div>
              </td>
              <td><span class="mono" :style="{ color: getSerieColor(p.invoice_serie) }">{{ p.invoice_serie }}</span></td>
              <td>
                <select 
                  class="proj-sel" 
                  :value="p.firma_id" 
                  @change="handleProjChange(p.id, $event)"
                >
                  <option v-for="f in firmyStore.firmy" :key="f.id" :value="f.id">
                    {{ f.id === 1 ? '⭐ ' : '' }}{{ f.name }}{{ f.is_default ? ` (${$t('financeSettings.projects.statusDefault').toLowerCase()})` : '' }}
                  </option>
                  <option value="new">＋ Nowa firma...</option>
                </select>
              </td>
              <td>
                <span v-if="isFirmaDefault(p.firma_id)" class="badge b-ok">{{ $t('financeSettings.projects.statusDefault') }}</span>
                <span v-else class="badge b-other">{{ getFirmaShortName(p.firma_id) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="save-bar">
        <div style="font-size:11px;color:var(--app-text-dim);">{{ $t('financeSettings.projects.saveHint') }}</div>
        <button class="btn btn-primary" @click="saveAssignments">💾 Zapisz przypisania</button>
      </div>
    </div>

    <ProjektyModal 
      v-if="showModal" 
      @close="showModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsProjektyStore } from '../../../../stores/settingsProjekty.store'
import { useSettingsFirmyStore } from '../../../../stores/settingsFirmy.store'
import ProjektyModal from './modals/ProjektyModal.vue'

const { t } = useI18n()
const projStore = useSettingsProjektyStore()
const firmyStore = useSettingsFirmyStore()
const showModal = ref(false)

function handleProjChange(projectId: number, event: Event) {
  const target = event.target as HTMLSelectElement
  const val = target.value
  if (val === 'new') {
    // Handle new firma modal or similar
    // TODO: open new firma modal
    return
  }
  projStore.updateFirmaAssignment(projectId, Number(val))
}

function saveAssignments() {
  alert(t('financeSettings.projects.toastSaved'))
}

function isFirmaDefault(firmaId: number | null) {
  if (!firmaId) return true
  const firma = firmyStore.firmy.find(f => f.id === firmaId)
  return firma?.is_default || false
}

function getFirmaShortName(firmaId: number | null) {
  if (!firmaId) return '-'
  const firma = firmyStore.firmy.find(f => f.id === firmaId)
  return firma?.short_name || firma?.name.split(' ')[0] || '-'
}

function getSerieColor(serie: string) {
  if (serie.includes('SPACE')) return '#4f6ef7'
  if (serie.includes('INDIGO')) return '#8b5cf6'
  if (serie.includes('OLIMP')) return '#f59e0b'
  if (serie.includes('CAMP')) return '#06b6d4'
  return '#8892b0'
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
.stitle { font-size: 13px; font-weight: 800; color: var(--app-text-main); }
.ssub { font-size: 10.5px; color: var(--app-text-dim); }

.project-card {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all .15s;
}
.project-card:hover {
  border-color: var(--app-border-hi);
  transform: translateX(4px);
}
.p-meta {
  font-size: 11px;
  color: var(--app-text-dim);
  margin-top: 2px;
  border-bottom: 1px solid var(--app-border);
  padding-bottom: 4px;
}
.p-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
}
.p-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
.card-edit {
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text-main);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 11.5px;
  cursor: pointer;
}

.edit-projs {
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px solid var(--app-border);
}

.proj-tbl {
  width: 100%;
  border-collapse: collapse;
}
.proj-tbl th {
  text-align: left;
  padding: 10px 18px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--dim);
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid var(--b);
}
.proj-tbl td {
  padding: 12px 18px;
  border-bottom: 1px solid rgba(100, 120, 255, 0.06);
}

.mono { font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; }

.proj-sel {
  background: rgba(12, 12, 32, 0.8);
  border: 1px solid var(--b);
  color: var(--white);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  width: 100%;
  max-width: 240px;
  cursor: pointer;
}

.badge {
  font-size: 9px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 5px;
  text-transform: uppercase;
}
.b-ok {
  background: rgba(16, 185, 129, 0.12);
  color: var(--green);
  border: 1px solid rgba(16, 185, 129, 0.22);
}
.b-other {
  background: rgba(79, 110, 247, 0.1);
  color: var(--blue);
  border: 1px solid rgba(79, 110, 247, 0.2);
}

.save-bar {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.015);
  border-top: 1px solid var(--b);
}
</style>
