<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '../BaseModal.vue'
import UiButton from '../../components/ui/UiButton.vue'
import { useModalStore } from '../../stores/modal.store'
import { useInvoicesStore } from '../../stores/invoices.store'
import { invoicesApi } from '../../api/invoices.api'

const { t } = useI18n()
const modal = useModalStore()
const invoicesStore = useInvoicesStore()

const invoice = computed(() => modal.payload as any)
const pdfUrl = computed(() => {
  if (!invoice.value) return ''
  return invoicesApi.getPdfUrl(invoice.value.id) + '?t=' + Date.now()
})

const loading = ref(true)
const sendingEmail = ref(false)
const converting = ref(false)
const sendingKsef = ref(false)

const onLoad = () => {
  loading.value = false
}

const download = () => {
  if (pdfUrl.value) {
    window.open(pdfUrl.value, '_blank')
  }
}

const handleSendEmail = async () => {
  if (!invoice.value) return
  modal.open('invoice-email', { invoice: invoice.value })
}

const handleConvert = async () => {
  if (!invoice.value) return
  if (!confirm('Convert this Pro Forma to a regular Invoice (FA)?')) return
  
  converting.value = true
  try {
    const newDoc = await invoicesApi.convert(invoice.value.id)
    await invoicesStore.fetchInvoices()
    modal.open('invoice-preview', newDoc)
  } catch (e) {
    console.error(e)
  } finally {
    converting.value = false
  }
}

const handleCorrect = () => {
  if (!invoice.value) return
  modal.open('invoice-correct', { invoice: invoice.value })
}

const handleSendKsef = async () => {
  if (!invoice.value) return
  sendingKsef.value = true
  try {
    await invoicesStore.sendToKsef(invoice.value.id)
  } catch (e) {
    console.error(e)
  } finally {
    sendingKsef.value = false
  }
}
</script>

<template>
  <BaseModal popupClass="popup-invoice-preview">
    <div class="preview-header">
      <div class="header-info">
        <div class="header-icon">📄</div>
        <h2 class="popup-title">{{ invoice?.number || 'Invoice Preview' }}</h2>
      </div>
      
      <div class="header-actions">
        <UiButton 
          variant="neutral" 
          size="sm" 
          @click="handleSendEmail"
          :disabled="sendingEmail"
        >
          📧 {{ t('faktury.sendEmail') }}
        </UiButton>
        <UiButton 
          v-if="invoice?.document_type === 'PF'"
          variant="primary" 
          size="sm" 
          @click="handleConvert"
          :disabled="converting"
        >
          ⚡ {{ t('faktury.convertToFa') }}
        </UiButton>
        <UiButton 
          v-if="invoice?.document_type === 'FA'"
          variant="neutral" 
          size="sm" 
          @click="handleCorrect"
        >
          🔧 {{ t('faktury.correct') }}
        </UiButton>
        <UiButton 
          v-if="invoice?.document_type === 'FA' && ['draft', 'error'].includes(invoice?.ksef_status)"
          variant="primary" 
          size="sm" 
          @click="handleSendKsef"
          :disabled="sendingKsef"
        >
          🚀 {{ t('faktury.sendToKsef') }}
        </UiButton>
        <UiButton variant="neutral" size="sm" @click="download">
          📥 {{ t('faktury.downloadPdf') }}
        </UiButton>
        <div class="divider"></div>
        <button class="close-minimal" @click="modal.close">✕</button>
      </div>
    </div>
    
    <div class="preview-body">
      <div v-if="loading" class="preview-loading">
        <div class="loader-pulse"></div>
        <span>{{ t('common.loading') }}...</span>
      </div>
      <iframe 
        v-show="!loading"
        :src="pdfUrl" 
        class="pdf-frame" 
        @load="onLoad"
      ></iframe>
    </div>
  </BaseModal>
</template>

<style scoped>
.popup-invoice-preview { 
  max-width: 1200px; 
  width: 95%; 
  height: 90vh;
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--app-border);
}

.preview-header {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--app-card-hi);
  border-bottom: 1px solid var(--app-border);
  flex-shrink: 0;
}

.header-info { display: flex; align-items: center; gap: 12px; }
.header-icon { font-size: 20px; }
.popup-title { font-size: 16px; font-weight: 700; color: var(--app-text-main); margin: 0; font-family: 'Space Mono', monospace; }

.header-actions { display: flex; align-items: center; gap: 8px; }
.divider { width: 1px; height: 20px; background: var(--app-border); margin: 0 4px; }
.close-minimal { padding: 4px 8px; font-size: 18px; color: var(--app-text-dim); transition: color 0.2s; }
.close-minimal:hover { color: var(--app-text-main); }

.preview-body {
  flex: 1;
  position: relative;
  background: var(--app-bg-deep, #1a1a2e);
}

.pdf-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--app-text-dim);
  font-size: 13px;
  font-weight: 600;
}

.loader-pulse {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(79, 110, 247, 0.1);
  border-top-color: var(--app-primary);
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .header-actions .ui-button:not(:last-child) { display: none; }
  .popup-title { font-size: 14px; }
}
</style>
