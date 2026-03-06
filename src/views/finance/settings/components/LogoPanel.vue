<template>
  <div class="panel-content">
    <div class="scard">
      <div class="scard-hdr">
        <div class="scard-title">
          <div class="scard-ico si-purple">🖼</div>
          <div>
            <div class="stitle">{{ $t('financeSettings.logo.title') }}</div>
            <div class="ssub">{{ $t('financeSettings.logo.sub') }}</div>
          </div>
        </div>
      </div>
      <div class="scard-body">
        <!-- Logo Upload Section -->
        <div class="logo-upload" @click="triggerLogoUpload">
          <div class="logo-preview" :style="{ color: activeFirma.invoice_color }">
            <template v-if="!logoPreview">
              GLS<br><span style="font-size:7px;">·edu</span>
            </template>
            <img v-else :src="logoPreview" alt="Logo Preview" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
          </div>
          <div>
            <div style="font-size:12.5px;font-weight:700;">{{ $t('financeSettings.logo.uploadTitle') }}</div>
            <div style="font-size:11px;color:#8892b0;margin-top:2px;">
              {{ $t('financeSettings.logo.uploadSub') }}
            </div>
          </div>
        </div>
        <input 
          type="file" 
          ref="fileInput" 
          accept="image/png,image/svg+xml" 
          style="display:none;" 
          @change="handleLogoUpload"
        >

        <div class="div"></div>

        <div class="gr2">
          <div class="fg">
            <label>{{ $t('financeSettings.logo.labelAccent') }}</label>
            <div style="display:flex;gap:8px;align-items:center;">
              <input 
                type="color" 
                v-model="activeFirma.invoice_color" 
                class="color-pick"
              >
              <input 
                type="text" 
                v-model="activeFirma.invoice_color" 
                class="color-hex"
                placeholder="#000000"
              >
            </div>
          </div>
          <div class="fg">
            <label>{{ $t('financeSettings.logo.labelStyle') }}</label>
            <select v-model="activeFirma.invoice_style">
              <option value="classic">{{ $t('financeSettings.logo.optClassic') }}</option>
              <option value="modern">{{ $t('financeSettings.logo.optModern') }}</option>
              <option value="minimal">{{ $t('financeSettings.logo.optMinimal') }}</option>
            </select>
          </div>
        </div>

        <div class="trow">
          <div><div class="tl">{{ $t('financeSettings.logo.labelShowLogo') }}</div></div>
          <label class="tog">
            <input type="checkbox" v-model="activeFirma.show_logo">
            <div class="tsl g"></div>
          </label>
        </div>

        <div class="trow">
          <div>
            <div class="tl">{{ $t('financeSettings.logo.labelShowFooter') }}</div>
            <div class="th">{{ $t('financeSettings.logo.subFooter') }}</div>
          </div>
          <label class="tog">
            <input type="checkbox" v-model="activeFirma.show_footer">
            <div class="tsl g"></div>
          </label>
        </div>
      </div>
      <div class="save-bar">
        <div></div>
        <button class="btn btn-primary" @click="saveSettings">{{ $t('financeSettings.logo.btnSave') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsFirmyStore } from '../../../../stores/settingsFirmy.store'

const { t } = useI18n()
const store = useSettingsFirmyStore()
const fileInput = ref<HTMLInputElement | null>(null)
const logoPreview = ref<string | null>(null)

// For this demo, let's just pick the first firma if none is active
const activeFirma = computed(() => {
  return store.firmy[0]
})

function triggerLogoUpload() {
  fileInput.value?.click()
}

function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    logoPreview.value = URL.createObjectURL(file)
    alert(t('financeSettings.logo.toastLogoUploaded'))
  }
}

function saveSettings() {
  alert(t('financeSettings.logo.toastSettingsSaved'))
}
</script>

<style scoped>
.stitle { font-size: 13px; font-weight: 800; color: var(--white); }
.ssub { font-size: 10.5px; color: var(--dim); }

/* LOGO UPLOAD */
.logo-upload {
  background: rgba(255, 255, 255, 0.02);
  border: 2px dashed var(--b);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all .2s;
  margin-bottom: 20px;
}
.logo-upload:hover {
  border-color: var(--blue);
  background: rgba(79, 110, 247, 0.04);
}
.logo-preview {
  width: 100px;
  height: 60px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 900;
  text-align: center;
  line-height: 1.1;
  flex-shrink: 0;
  overflow: hidden;
}

.div {
  height: 1px;
  background: var(--b);
  margin: 20px 0;
}

.gr2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
@media (max-width: 600px) { .gr2 { grid-template-columns: 1fr; } }

.fg {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.fg label {
  font-size: 11px;
  font-weight: 800;
  color: var(--dim);
  text-transform: uppercase;
  letter-spacing: .05em;
}

.color-pick {
  width: 44px;
  height: 36px;
  padding: 2px;
  border-radius: 7px;
  border: 1px solid var(--b);
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
}
.color-hex {
  font-family: 'Space Mono', monospace;
  background: rgba(12, 12, 32, 0.8);
  border: 1px solid var(--b);
  color: var(--white);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 13px;
  flex: 1;
}

select {
  background: rgba(12, 12, 32, 0.8);
  border: 1px solid var(--b);
  color: var(--white);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.trow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-top: 1px solid var(--faint);
}
.tl { font-size: 12.5px; font-weight: 600; color: var(--white); }
.th { font-size: 10px; color: var(--dim); margin-top: 2px; }

/* TOGGLE */
.tog {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 18px;
}
.tog input { opacity: 0; width: 0; height: 0; }
.tsl {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  transition: .2s;
  border-radius: 18px;
}
.tsl:before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 3px;
  bottom: 3px;
  background-color: #fff;
  transition: .2s;
  border-radius: 50%;
}
input:checked + .tsl { background-color: var(--blue); }
input:checked + .tsl.g { background-color: var(--green); }
input:checked + .tsl:before { transform: translateX(14px); }

.save-bar {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.015);
  border-top: 1px solid var(--b);
}
</style>
