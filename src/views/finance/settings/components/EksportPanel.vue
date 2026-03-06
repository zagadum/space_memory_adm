<template>
  <div class="panel-content">
    <div class="scard">
      <div class="scard-hdr">
        <div class="scard-title">
          <div class="scard-ico si-amber">📤</div>
          <div>
            <div class="stitle">{{ $t('financeSettings.export.title') }}</div>
            <div class="ssub">{{ $t('financeSettings.export.sub') }}</div>
          </div>
        </div>
      </div>
      <div class="scard-body">
        <div class="sec"><div class="sdot sd-blue"></div>{{ $t('financeSettings.export.secFormats') }}</div>
        <div class="export-formats">
          <div class="format-card f-blue">
            <div class="f-title">{{ $t('financeSettings.export.fmtXlsxTitle') }}</div>
            <div class="f-desc" v-html="$t('financeSettings.export.fmtXlsxDesc')"></div>
            <button class="btn btn-primary btn-sm mt-10" @click="mockExport('XLSX')">{{ $t('financeSettings.export.btnGenXlsx') }}</button>
          </div>
          <div class="format-card f-green">
            <div class="f-title">{{ $t('financeSettings.export.fmtZipTitle') }}</div>
            <div class="f-desc" v-html="$t('financeSettings.export.fmtZipDesc')"></div>
            <button class="btn btn-primary btn-sm mt-10" @click="mockExport('ZIP')">{{ $t('financeSettings.export.btnGetZip') }}</button>
          </div>
          <div class="format-card f-amber">
            <div class="f-title">{{ $t('financeSettings.export.fmtXmlTitle') }}</div>
            <div class="f-desc" v-html="$t('financeSettings.export.fmtXmlDesc')"></div>
            <button class="btn btn-primary btn-sm mt-10" @click="mockExport('XML')">{{ $t('financeSettings.export.btnExportXml') }}</button>
          </div>
          <div class="format-card f-red">
            <div class="f-title">{{ $t('financeSettings.export.fmtJpkTitle') }}</div>
            <div class="f-desc" v-html="$t('financeSettings.export.fmtJpkDesc')"></div>
            <button class="btn btn-primary btn-sm mt-10" @click="mockExport('JPK')">{{ $t('financeSettings.export.btnGenJpk') }}</button>
          </div>
        </div>

        <div class="sec"><div class="sdot sd-amber"></div>{{ $t('financeSettings.export.secComarch') }}</div>
        <div class="gr2">
          <div class="fg">
            <label>{{ $t('financeSettings.export.labelComarchId') }}</label>
            <input type="text" v-model="store.config.comarchId" class="mono">
            <div class="hint">{{ $t('financeSettings.export.hintComarchId') }}</div>
          </div>
          <div class="fg">
            <label>{{ $t('financeSettings.export.labelEncoding') }}</label>
            <select v-model="store.config.encoding">
              <option>UTF-8 (zalecane)</option>
              <option>Windows-1250</option>
              <option>ISO-8859-2</option>
            </select>
          </div>
          <div class="fg">
            <label>{{ $t('financeSettings.export.labelCategory') }}</label>
            <input type="text" v-model="store.config.category">
          </div>
          <div class="fg">
            <label>{{ $t('financeSettings.export.labelRegister') }}</label>
            <input type="text" v-model="store.config.register">
          </div>
        </div>

        <div class="trow">
          <div>
            <div class="tl">{{ $t('financeSettings.export.labelAutoClients') }}</div>
            <div class="th">{{ $t('financeSettings.export.subAutoClients') }}</div>
          </div>
          <label class="tog"><input type="checkbox" v-model="store.config.autoClients"><div class="tsl g"></div></label>
        </div>
        <div class="trow">
          <div><div class="tl">{{ $t('financeSettings.export.labelIncludeCorrections') }}</div></div>
          <label class="tog"><input type="checkbox" v-model="store.config.includeCorrections"><div class="tsl g"></div></label>
        </div>
      </div>
      <div class="save-bar">
        <div></div>
        <button class="btn btn-primary" @click="save">💾 {{ $t('financeSettings.export.btnSave') }}</button>
      </div>

      <!-- Export History -->
      <div class="scard-hdr" style="border-top: 1px solid rgba(100,120,255,0.12);">
        <div class="stitle">{{ $t('financeSettings.export.secHistory') }}</div>
      </div>
      <div style="padding:0;">
        <table class="hist-tbl">
          <thead>
            <tr>
              <th>{{ $t('financeSettings.export.thDate') }}</th>
              <th>{{ $t('financeSettings.export.thUser') }}</th>
              <th>{{ $t('financeSettings.export.thFormat') }}</th>
              <th>{{ $t('financeSettings.export.thPeriod') }}</th>
              <th>{{ $t('financeSettings.export.thStatus') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in store.history" :key="log.id">
              <td>{{ log.date }}</td>
              <td>{{ log.user }}</td>
              <td><span class="mono">{{ log.format }}</span></td>
              <td>{{ log.period }}</td>
              <td><span class="badge b-ok">OK</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSettingsExportStore } from '../../../../stores/settingsExport.store'

const { t } = useI18n()
const store = useSettingsExportStore()

function mockExport(fmt: string) {
  alert(t('financeSettings.export.toastExporting', { fmt }))
  // logic to add to store history
}

function save() {
  alert(t('financeSettings.export.toastSaved'))
}
</script>

<style scoped>
.stitle { font-size: 13.5px; font-weight: 800; color: var(--white); }
.ssub { font-size: 10.5px; color: var(--dim); }

.scard-body { padding: 18px; }

.sec {
  display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800;
  color: var(--dim); text-transform: uppercase; margin-bottom: 14px;
}
.sdot { width: 6px; height: 6px; border-radius: 50%; }
.sd-blue { background: var(--blue); }
.sd-amber { background: var(--amber); }

.export-formats {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px;
}
.format-card { padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); }
.f-blue { background: rgba(79, 110, 247, 0.05); border-color: rgba(79, 110, 247, 0.15); }
.f-green { background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.15); }
.f-amber { background: rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.15); }
.f-red { background: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.15); }

.f-title { font-size: 13px; font-weight: 800; margin-bottom: 4px; }
.f-blue .f-title { color: var(--blue); }
.f-green .f-title { color: var(--green); }
.f-amber .f-title { color: var(--amber); }
.f-red .f-title { color: var(--red); }

.f-desc { font-size: 11px; color: var(--dim); line-height: 1.6; }
.f-desc strong { color: var(--white); }

.mt-10 { margin-top: 10px; }

.gr2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.fg { display: flex; flex-direction: column; gap: 6px; }
.fg label { font-size: 11px; font-weight: 800; color: var(--dim); text-transform: uppercase; }

input, select {
  background: rgba(12, 12, 32, 0.8); border: 1px solid var(--b);
  color: var(--white); border-radius: 8px; padding: 10px 12px; font-size: 13px;
}
.mono { font-family: 'Space Mono', monospace; }
.hint { font-size: 10px; color: var(--dim); margin-top: 2px; }

.trow { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-top: 1px solid var(--faint); }
.tl { font-size: 12.5px; font-weight: 600; color: var(--white); }
.th { font-size: 10px; color: var(--dim); margin-top: 2px; }

/* TOGGLE */
.tog { position: relative; display: inline-block; width: 32px; height: 18px; }
.tog input { opacity: 0; width: 0; height: 0; }
.tsl { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.1); transition: .2s; border-radius: 18px; }
.tsl:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: #fff; transition: .2s; border-radius: 50%; }
input:checked + .tsl.g { background-color: var(--green); }
input:checked + .tsl:before { transform: translateX(14px); }

.save-bar { padding: 14px 18px; display: flex; justify-content: flex-end; background: rgba(0,0,0,0.1); border-top: 1px solid var(--b); }

.hist-tbl { width: 100%; border-collapse: collapse; }
.hist-tbl th { padding: 10px 18px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--dim); border-bottom: 1px solid var(--b); text-align: left; }
.hist-tbl td { padding: 12px 18px; font-size: 11.5px; border-bottom: 1px solid rgba(255,255,255,0.04); color: var(--white); }

.badge { font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 5px; }
.b-ok { background: rgba(16, 185, 129, 0.12); color: var(--green); border: 1px solid rgba(16, 185, 129, 0.22); }
</style>
