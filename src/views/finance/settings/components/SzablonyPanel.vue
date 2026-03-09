<template>
  <div class="panel-content">
    <div class="panel-hdr">
      <div>
        <div class="panel-title">{{ $t('financeSettings.emailTemplates.title') }}</div>
        <div class="panel-sub">{{ $t('financeSettings.emailTemplates.sub') }}</div>
      </div>
      <button class="btn btn-primary" @click="openNewTpl">{{ $t('financeSettings.emailTemplates.addBtn') }}</button>
    </div>

    <div class="ibox ibox-blue">
      <div class="ibox-icon">ℹ</div>
      <div v-html="$t('financeSettings.emailTemplates.infoBanner')"></div>
    </div>

    <!-- FILTER BAR -->
    <div class="filter-bar">
      <select v-model="filterFirma" class="tpl-filter-sel">
        <option value="">{{ $t('financeSettings.emailTemplates.filterFirmaAll') }}</option>
        <option value="global">{{ $t('financeSettings.emailTemplates.filterFirmaGlobal') }}</option>
        <option v-for="f in firmyStore.firmy" :key="f.id" :value="f.id.toString()">
          {{ f.id === 1 ? '⭐ ' : '' }}{{ f.name }}
        </option>
      </select>
      <select v-model="filterType" class="tpl-filter-sel">
        <option value="">{{ $t('financeSettings.emailTemplates.filterTypeAll') }}</option>
        <option value="b2c">{{ $t('financeSettings.emailTemplates.typeB2C') }}</option>
        <option value="b2b">{{ $t('financeSettings.emailTemplates.typeB2B') }}</option>
        <option value="korekta">{{ $t('financeSettings.emailTemplates.typeKorekta') }}</option>
        <option value="przypomnienie">{{ $t('financeSettings.emailTemplates.typePrzypomnienie') }}</option>
        <option value="potwierdzenie">{{ $t('financeSettings.emailTemplates.typePotwierdzenie') }}</option>
        <option value="custom">{{ $t('financeSettings.emailTemplates.typeCustom') }}</option>
      </select>
    </div>

    <!-- TEMPLATE LIST -->
    <div class="tpl-list">
      <div 
        v-for="tpl in filteredTemplates" 
        :key="tpl.id" 
        class="tpl-card"
      >
        <div class="tpl-top">
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span class="ftag" :class="getTypeClass(tpl.type)">{{ tpl.type.toUpperCase() }}</span>
              <span v-if="tpl.firma_id === 'global'" class="ftag ft-arch">{{ $t('financeSettings.emailTemplates.statusGlobal') }}</span>
              <span v-else class="ftag ft-proj">{{ getFirmaName(tpl.firma_id) }}</span>
              <span v-if="tpl.is_default" class="ftag ft-def">{{ $t('financeSettings.emailTemplates.statusDefault') }}</span>
            </div>
            <div class="tpl-title">{{ tpl.name }}</div>
            <div class="tpl-subject">{{ $t('financeSettings.emailTemplates.tplSubject', { subject: tpl.subject }) }}</div>
          </div>
          <div class="tpl-actions">
            <button class="btn btn-ghost btn-sm" @click="previewTpl(tpl)">{{ $t('financeSettings.emailTemplates.btnPreview') }}</button>
            <button class="btn btn-ghost btn-sm" @click="editTpl(tpl)">{{ $t('financeSettings.emailTemplates.btnEdit') }}</button>
            <button v-if="tpl.firma_id !== 'global'" class="btn btn-sm btn-red" @click="deleteTpl(tpl.id)">{{ $t('financeSettings.emailTemplates.btnDelete') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <SzablonEditorModal 
      v-if="showEditor" 
      :template-id="selectedTplId"
      @close="showEditor = false"
    />

    <SzablonPreviewModal 
      v-if="showPreview && previewTarget"
      :template="previewTarget"
      @close="showPreview = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsSzablonyStore, type EmailTemplate } from '../../../../stores/settingsSzablony.store'
import { useSettingsFirmyStore } from '../../../../stores/settingsFirmy.store'
import SzablonEditorModal from './modals/SzablonEditorModal.vue'
import SzablonPreviewModal from './modals/SzablonPreviewModal.vue'
import { useNotificationStore } from '../../../../stores/notification.store'

const { t } = useI18n()
const store = useSettingsSzablonyStore()
const firmyStore = useSettingsFirmyStore()
const notifications = useNotificationStore()

const filterFirma = ref('')
const filterType = ref('')
const showEditor = ref(false)
const showPreview = ref(false)
const selectedTplId = ref<string | null>(null)
const previewTarget = ref<EmailTemplate | null>(null)

const filteredTemplates = computed(() => {
  return store.templates.filter(t => {
    const matchFirma = !filterFirma.value || t.firma_id === filterFirma.value
    const matchType = !filterType.value || t.type === filterType.value
    return matchFirma && matchType
  })
})

function getTypeClass(type: string) {
  if (type === 'b2c') return 'ft-blue'
  if (type === 'b2b') return 'ft-purple'
  if (type === 'korekta') return 'ft-amber'
  if (type === 'przypomnienie') return 'ft-red'
  return ''
}

function getFirmaName(id: string) {
  const f = firmyStore.firmy.find(firm => firm.id.toString() === id)
  return f ? f.name : id
}

function editTpl(tpl: EmailTemplate) {
  selectedTplId.value = tpl.id
  showEditor.value = true
}

function openNewTpl() {
  selectedTplId.value = null
  showEditor.value = true
}

function previewTpl(tpl: EmailTemplate) {
  previewTarget.value = tpl
  showPreview.value = true
}

function deleteTpl(id: string) {
  if (confirm(t('financeSettings.emailTemplates.deleteConfirm'))) {
    notifications.addToast(t('financeSettings.emailTemplates.toastDeleted'), 'success')
  }
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

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
  align-items: center;
}

.tpl-filter-sel {
  background: rgba(12, 12, 32, 0.8);
  border: 1px solid var(--b);
  color: var(--white);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.tpl-list { display: flex; flex-direction: column; gap: 10px; }

.tpl-card {
  background: var(--card);
  border: 1px solid var(--b);
  border-radius: 12px;
  padding: 14px 18px;
  transition: all .2s;
}
.tpl-card:hover {
  border-color: var(--bh);
  background: rgba(12, 12, 36, 1);
}

.tpl-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.tpl-title { font-size: 13px; font-weight: 800; color: var(--white); }
.tpl-subject { font-size: 10.5px; color: var(--dim); margin-top: 2px; font-family: 'Space Mono', monospace; }

.ftag {
  font-size: 9px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}
.ft-blue { background: rgba(79, 110, 247, 0.12); color: var(--blue); border: 1px solid rgba(79, 110, 247, 0.22); }
.ft-purple { background: rgba(139, 92, 246, 0.12); color: var(--purple); border: 1px solid rgba(139, 92, 246, 0.22); }
.ft-amber { background: rgba(245, 158, 11, 0.12); color: var(--amber); border: 1px solid rgba(245, 158, 11, 0.22); }
.ft-red { background: rgba(239, 68, 68, 0.12); color: var(--red); border: 1px solid rgba(239, 68, 68, 0.22); }
.ft-arch { background: rgba(255, 255, 255, 0.05); color: var(--dim); border: 1px solid rgba(255, 255, 255, 0.1); }
.ft-proj { background: rgba(79, 110, 247, 0.08); color: var(--blue); border: 1px solid rgba(79, 110, 247, 0.15); }
.ft-def { background: rgba(16, 185, 129, 0.15); color: var(--green); border: 1px solid rgba(16, 185, 129, 0.25); }

.mono-var { font-family: 'Space Mono', monospace; color: var(--blue); }

.btn-red { background: rgba(239, 68, 68, 0.1); color: var(--red); border: 1px solid rgba(239, 68, 68, 0.2); }
.btn-red:hover { background: rgba(239, 68, 68, 0.2); }
</style>
