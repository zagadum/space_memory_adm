<template>
  <div class="panel-content">
    <div class="scard">
      <div class="scard-hdr">
        <div class="scard-title">
          <div class="scard-ico si-blue">🔢</div>
          <div>
            <div class="stitle">{{ $t('financeSettings.numbering.title') }}</div>
            <div class="ssub">{{ $t('financeSettings.numbering.sub') }}</div>
          </div>
        </div>
      </div>
      <div class="scard-body">
        <div class="ibox ibox-red">
          <div class="ibox-icon">🔒</div>
          <div v-html="$t('financeSettings.numbering.infoBanner')"></div>
        </div>

        <table class="series-tbl">
          <thead>
            <tr>
              <th>{{ $t('financeSettings.numbering.thSerie') }}</th>
              <th>{{ $t('financeSettings.numbering.thProject') }}</th>
              <th>{{ $t('financeSettings.numbering.thFirma') }}</th>
              <th>{{ $t('financeSettings.numbering.thLast') }}</th>
              <th>{{ $t('financeSettings.numbering.thNext') }}</th>
              <th>{{ $t('financeSettings.numbering.thMonth') }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in store.series" :key="s.id">
              <td><span class="mono" :style="{ color: s.color }">{{ s.serie_code }}</span></td>
              <td class="td-small">{{ s.projekt_name }}</td>
              <td class="td-faded">{{ s.firma_name }}</td>
              <td class="mono">{{ s.last_number }}</td>
              <td class="mono num-ok">{{ s.next_number }}</td>
              <td class="mono td-faded">{{ s.year_month }}</td>
              <td>
                <button class="btn btn-ghost btn-sm" @click="openLog(s.id)">{{ $t('financeSettings.numbering.btnLog') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Log Modal Overlay -->
    <SerieLogModal 
      v-if="showLog" 
      @close="showLog = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsSerieStore } from '../../../../stores/settingsSerie.store'
import SerieLogModal from './modals/SerieLogModal.vue'

const store = useSettingsSerieStore()
const showLog = ref(false)

function openLog(id: number) {
  showLog.value = true
}
</script>

<style scoped>
.stitle { font-size: 13px; font-weight: 800; color: var(--app-text-main); }
.ssub { font-size: 10.5px; color: var(--app-text-dim); }

.series-tbl {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}
.series-tbl th {
  text-align: left;
  padding: 10px 14px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--app-text-dim);
  border-bottom: 1px solid var(--app-border);
}
.series-tbl td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--app-border);
  font-size: 12.5px;
}

.mono { font-family: 'Space Mono', monospace; font-weight: 700; }
.num-ok { color: var(--green); }
.td-small { font-size: 11px; }
.td-faded { color: var(--app-text-dim); font-size: 11px; }

.btn-ghost {
  background: var(--app-surface);
  color: var(--app-text-dim);
  border: 1px solid var(--app-border);
}
.btn-ghost:hover {
  background: var(--status-info-bg);
  color: var(--app-text-main);
}
</style>
