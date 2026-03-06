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
}
.ptitle span {
  background: linear-gradient(90deg, #4f6ef7, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.psub {
  font-size: 11.5px;
  color: #8892b0;
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
  background: rgba(12, 12, 36, 0.98);
  border: 1px solid rgba(100, 120, 255, 0.12);
  border-radius: 14px;
  overflow: hidden;
  position: sticky;
  top: 20px;
}
.snav-group {
  padding: 8px 0;
}
.snav-group:not(:last-child) {
  border-bottom: 1px solid rgba(100, 120, 255, 0.12);
}
.snav-label {
  padding: 8px 14px 4px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #8892b0;
}
.sni {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: #8892b0;
  cursor: pointer;
  transition: all .15s;
  border-left: 2px solid transparent;
}
.sni:hover {
  color: #e8eeff;
  background: rgba(255, 255, 255, 0.03);
}
.sni.act {
  color: #4f6ef7;
  background: rgba(79, 110, 247, 0.07);
  border-left-color: #4f6ef7;
}

.sni-blue.act {
  color: #4f6ef7;
  background: rgba(79, 110, 247, 0.07);
  border-left-color: #4f6ef7;
}
.sni-green.act {
  color: #10b981;
  background: rgba(16, 185, 129, 0.07);
  border-left-color: #10b981;
}
.sni-purple.act {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.07);
  border-left-color: #8b5cf6;
}
.sni-amber.act {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.07);
  border-left-color: #f59e0b;
}
.sni-cyan.act {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.07);
  border-left-color: #06b6d4;
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
  background: rgba(79, 110, 247, 0.15);
  color: #4f6ef7;
}
.sb-warn {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.placeholder-panel {
  padding: 40px;
  text-align: center;
  background: rgba(12, 12, 36, 0.98);
  border: 1px solid rgba(100, 120, 255, 0.12);
  border-radius: 14px;
  color: #8892b0;
}
</style>

<style>
.settings-wrap {
  --bg: #04040f;
  --card: rgba(12, 12, 36, 0.98);
  --card2: rgba(16, 16, 46, 0.97);
  --b: rgba(100, 120, 255, 0.12);
  --bh: rgba(120, 140, 255, 0.28);
  --blue: #4f6ef7;
  --purple: #8b5cf6;
  --cyan: #06b6d4;
  --amber: #f59e0b;
  --green: #10b981;
  --red: #ef4444;
  --white: #e8eeff;
  --dim: #8892b0;
  --faint: rgba(255, 255, 255, 0.035);
}

.ibox { padding: 10px 14px; border-radius: 9px; font-size: 11.5px; display: flex; gap: 9px; margin-bottom: 14px; align-items: flex-start; line-height: 1.6; }
.ibox-blue { background: rgba(79, 110, 247, 0.07); border: 1px solid rgba(79, 110, 247, 0.2); color: rgba(180, 200, 255, 0.85); }
.ibox-amber { background: rgba(245, 158, 11, 0.07); border: 1px solid rgba(245, 158, 11, 0.2); color: rgba(255, 220, 130, 0.85); }
.ibox-green { background: rgba(16, 185, 129, 0.07); border: 1px solid rgba(16, 185, 129, 0.2); color: rgba(100, 230, 180, 0.85); }
.ibox-red { background: rgba(239, 68, 68, 0.07); border: 1px solid rgba(239, 68, 68, 0.2); color: rgba(255, 150, 150, 0.85); }
.ibox-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }

.scard { background: var(--card); border: 1px solid var(--b); border-radius: 14px; margin-bottom: 14px; overflow: hidden; }
.scard-hdr { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 12px; border-bottom: 1px solid var(--b); }
.scard-title { display: flex; align-items: center; gap: 10px; }
.scard-ico { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
.scard-body { padding: 18px 20px; }
</style>
