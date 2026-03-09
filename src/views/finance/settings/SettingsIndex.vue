<template>
  <div class="settings-page">
    <div class="phdr">
      <div>
        <div class="ptitle">{{ $t('financeSettings.pageTitle') }} <span>{{ $t('financeSettings.pageSubTitle') }}</span></div>
        <div class="psub">{{ $t('financeSettings.mainSub') }}</div>
      </div>
    </div>

    <div class="settings-wrap">
      <!-- SIDEBAR -->
      <nav class="snav">
        <div class="snav-group">
          <div class="snav-label">{{ $t('financeSettings.groups.firmy') }}</div>
          <div 
            class="sni" 
            :class="{ act: activeTab === 'firma' }" 
            @click="activeTab = 'firma'"
          >
            <span class="sni-icon">🏢</span>{{ $t('financeSettings.menu.firmy') }}
            <span class="sni-badge sb-blue">{{ StoreFirmy.firmy.length }}</span>
          </div>
          <div 
            class="sni sni-blue" 
            :class="{ act: activeTab === 'projekty' }" 
            @click="activeTab = 'projekty'"
          >
            <span class="sni-icon">🧩</span>{{ $t('financeSettings.menu.projekty') }}
          </div>
          <div 
            class="sni sni-green" 
            :class="{ act: activeTab === 'konta' }" 
            @click="activeTab = 'konta'"
          >
            <span class="sni-icon">🏦</span>{{ $t('financeSettings.menu.konta') }}
          </div>
          <div 
            class="sni sni-purple" 
            :class="{ act: activeTab === 'logo' }" 
            @click="activeTab = 'logo'"
          >
            <span class="sni-icon">🖼</span>{{ $t('financeSettings.menu.logo') }}
          </div>
        </div>
        <div class="snav-group">
          <div class="snav-label">{{ $t('financeSettings.groups.faktury') }}</div>
          <div 
            class="sni sni-blue" 
            :class="{ act: activeTab === 'serie' }" 
            @click="activeTab = 'serie'"
          >
            <span class="sni-icon">🔢</span>{{ $t('financeSettings.menu.serie') }}
          </div>
          <div 
            class="sni sni-cyan" 
            :class="{ act: activeTab === 'szablony' }" 
            @click="activeTab = 'szablony'"
          >
            <span class="sni-icon">📧</span>{{ $t('financeSettings.menu.szablony') }}
          </div>
          <div 
            class="sni sni-amber" 
            :class="{ act: activeTab === 'vat' }" 
            @click="activeTab = 'vat'"
          >
            <span class="sni-icon">📋</span>{{ $t('financeSettings.menu.vat') }}
          </div>
        </div>
        <div class="snav-group">
          <div class="snav-label">{{ $t('financeSettings.groups.system') }}</div>
          <div 
            class="sni sni-purple" 
            :class="{ act: activeTab === 'users' }" 
            @click="activeTab = 'users'"
          >
            <span class="sni-icon">👥</span>{{ $t('financeSettings.menu.users') }}
          </div>
          <div 
            class="sni sni-cyan" 
            :class="{ act: activeTab === 'integracje' }" 
            @click="activeTab = 'integracje'"
          >
            <span class="sni-icon">🔌</span>{{ $t('financeSettings.menu.integracje') }}
            <span class="sni-badge sb-warn">⚠ KSeF</span>
          </div>
          <div 
            class="sni sni-amber" 
            :class="{ act: activeTab === 'eksport' }" 
            @click="activeTab = 'eksport'"
          >
            <span class="sni-icon">📤</span>{{ $t('financeSettings.menu.eksport') }}
          </div>
        </div>
      </nav>

      <!-- CONTENT -->
      <div class="settings-content">
        <FirmyPanel v-if="activeTab === 'firma'" />
        <ProjektyPanel v-else-if="activeTab === 'projekty'" />
        <KontaPanel v-else-if="activeTab === 'konta'" />
        <LogoPanel v-else-if="activeTab === 'logo'" />
        <SeriePanel v-else-if="activeTab === 'serie'" />
        <SzablonyPanel v-else-if="activeTab === 'szablony'" />
        <VatPanel v-else-if="activeTab === 'vat'" />
        <UzytkownicyPanel v-else-if="activeTab === 'users'" />
        <IntegracjePanel v-else-if="activeTab === 'integracje'" />
        <EksportPanel v-else-if="activeTab === 'eksport'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useSettingsFirmyStore } from '../../../stores/settingsFirmy.store'
import FirmyPanel from './components/FirmyPanel.vue'
import ProjektyPanel from './components/ProjektyPanel.vue'
import KontaPanel from './components/KontaPanel.vue'
import LogoPanel from './components/LogoPanel.vue'
import SeriePanel from './components/SeriePanel.vue'
import SzablonyPanel from './components/SzablonyPanel.vue'
import VatPanel from './components/VatPanel.vue'
import UzytkownicyPanel from './components/UzytkownicyPanel.vue'
import IntegracjePanel from './components/IntegracjePanel.vue'
import EksportPanel from './components/EksportPanel.vue'

const StoreFirmy = useSettingsFirmyStore()
const activeTab = ref('firma')
</script>

<style scoped>
.settings-page {
  padding: 0 16px 80px;
  max-width: 1100px;
  margin: 0 auto;
}

/* PAGE HEADER */
.phdr {
  padding: 22px 0 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.ptitle {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -.4px;
  color: var(--app-text-main);
}
.ptitle span {
  background: linear-gradient(90deg, var(--blue), var(--purple));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.psub {
  font-size: 11.5px;
  color: var(--app-text-dim);
  margin-top: 3px;
}

/* LAYOUT */
.settings-wrap {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 20px;
  align-items: start;
}
@media (max-width: 700px) {
  .settings-wrap {
    grid-template-columns: 1fr;
  }
}

/* SIDEBAR */
.snav {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 14px;
  overflow: hidden;
  position: sticky;
  top: 20px;
  box-shadow: var(--app-shadow);
}
.snav-group {
  padding: 8px 0;
}
.snav-group:not(:last-child) {
  border-bottom: 1px solid var(--app-border);
}
.snav-label {
  padding: 8px 14px 4px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--app-text-dim);
}
.sni {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--app-text-dim);
  cursor: pointer;
  transition: all .15s;
  border-left: 2px solid transparent;
}
.sni:hover {
  color: var(--app-text-main);
  background: var(--status-info-bg);
}
.sni.act {
  color: var(--blue);
  background: var(--status-info-bg);
  border-left-color: var(--blue);
}

.sni-blue.act {
  color: var(--blue);
  background: var(--status-info-bg);
  border-left-color: var(--blue);
}
.sni-green.act {
  color: var(--green);
  background: var(--status-success-bg);
  border-left-color: var(--green);
}
.sni-purple.act {
  color: var(--purple);
  background: rgba(139, 92, 246, 0.07);
  border-left-color: var(--purple);
}
.sni-amber.act {
  color: var(--amber);
  background: var(--status-warning-bg);
  border-left-color: var(--amber);
}
.sni-cyan.act {
  color: var(--cyan);
  background: rgba(6, 182, 212, 0.07);
  border-left-color: var(--cyan);
}

.sni-icon {
  font-size: 15px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}
.sni-badge {
  margin-left: auto;
  font-size: 9px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 10px;
}
.sb-blue {
  background: var(--status-info-bg);
  color: var(--blue);
}
.sb-warn {
  background: var(--status-warning-bg);
  color: var(--amber);
}

.placeholder-panel {
  padding: 40px;
  text-align: center;
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 14px;
  color: var(--app-text-dim);
}
</style>

<style>
/* Global settings patterns */
.ibox { padding: 10px 14px; border-radius: 9px; font-size: 11.5px; display: flex; gap: 9px; margin-bottom: 14px; align-items: flex-start; line-height: 1.6; }
.ibox-blue { background: var(--status-info-bg); border: 1px solid var(--status-info-border, var(--app-border)); color: var(--blue); }
.ibox-amber { background: var(--status-warning-bg); border: 1px solid var(--status-warning-border, var(--app-border)); color: var(--amber); }
.ibox-green { background: var(--status-success-bg); border: 1px solid var(--status-success-border, var(--app-border)); color: var(--green); }
.ibox-red { background: var(--status-danger-bg); border: 1px solid var(--status-danger-border, var(--app-border)); color: var(--red); }
.ibox-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }

.scard { background: var(--app-card); border: 1px solid var(--app-border); border-radius: 14px; margin-bottom: 14px; overflow: hidden; box-shadow: var(--app-shadow); }
.scard-hdr { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 12px; border-bottom: 1px solid var(--app-border); }
.scard-title { display: flex; align-items: center; gap: 10px; color: var(--app-text-main); font-weight: 700; }
.scard-ico { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; background: var(--app-surface); }
.scard-body { padding: 18px 20px; color: var(--app-text-main); }
</style>
